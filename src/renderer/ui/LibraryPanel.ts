import { t } from '@shared/i18n'
import { PROVIDER_NAMES, type AuthInfo, type Collection, type EqStatus, type PlaybackState, type SearchResults, type Track } from '@shared/types'
import type { RemoteController } from '../webamp/controller'
import { LIBRARY_POSITION_KEY, makeFloating } from './desktop'
import { favorites, library, SECTIONS, type Section } from './library'
import { languageSelect, type ChangeLanguage } from './language'
import { collectionRow, el, heartButton, refreshHearts, spotifyLink, trackRow } from './rows'

type View =
  | { kind: 'liked' }
  | { kind: 'section'; section: Section }
  | { kind: 'collection'; collection: Collection }
  | { kind: 'search'; query: string }

const EQ_APO_URL = 'https://sourceforge.net/projects/equalizerapo/'

const sameView = (a: View | undefined, b: View): boolean => JSON.stringify(a) === JSON.stringify(b)

/** Winamp "Media Library"-style window for the music service's library. */
export class LibraryPanel {
  private auth: AuthInfo = {
    provider: 'tidal',
    capabilities: { credentials: true, mixes: true, externalApp: true },
    configured: false,
    connected: false,
    catalog: false
  }
  private eq: EqStatus = { installed: false }
  private history: View[] = []
  private loadToken = 0
  private nowPlayingTrackId: string | undefined

  private status = el('div', { className: 'ml-status' })
  private nav = el('nav', { className: 'ml-nav' })
  private back = el('button', { className: 'ml-back', textContent: '◂', title: t('back') })
  private title = el('div', { className: 'ml-list-title' })
  private actions = el('div', { className: 'ml-list-actions' })
  private content = el('div', { className: 'ml-content', tabIndex: 0 })
  private search = el('input', { type: 'search', className: 'ml-search' })
  private heading = el('span')
  private serviceButton = el('button', {
    title: t('chooseMusicService'),
    onclick: () => document.dispatchEvent(new CustomEvent('setup:open'))
  })
  private body = el('div', { className: 'ml-body' })
  private nowPlaying = el('div', { className: 'ml-now' })

  constructor(
    root: HTMLElement,
    private readonly controller: RemoteController,
    changeLanguage: ChangeLanguage
  ) {
    const titlebar = el(
      'div',
      { className: 'ml-titlebar', title: t('libraryDragHint') },
      this.heading,
      el(
        'div',
        { className: 'ml-titlebar-actions' },
        languageSelect(changeLanguage),
        this.serviceButton,
        el('button', {
          textContent: 'Milkdrop',
          title: t('toggleVisualizer'),
          onclick: () => document.dispatchEvent(new CustomEvent('milkdrop:toggle'))
        }),
        el('button', {
          textContent: t('skinsButton'),
          title: t('chooseSkin'),
          onclick: () => document.dispatchEvent(new CustomEvent('skins:open'))
        }),
        el('button', { textContent: 'A−', title: t('zoomOut'), onclick: () => window.remote.scaleWindow('out') }),
        el('button', { textContent: 'A+', title: t('zoomIn'), onclick: () => window.remote.scaleWindow('in') }),
        el('button', { textContent: '×', title: t('hideLibrary'), onclick: () => root.classList.add('hidden') })
      )
    )
    root.append(titlebar, this.status, this.body, this.nowPlaying)
    makeFloating(root, titlebar, LIBRARY_POSITION_KEY)
    this.body.append(
      el('div', { className: 'ml-side' }, this.search, this.nav),
      el(
        'section',
        { className: 'ml-main' },
        el('div', { className: 'ml-list-header' }, this.back, this.title, this.actions),
        this.content
      )
    )
    this.back.onclick = () => this.goBack()
    this.search.addEventListener('keydown', (event) => {
      const query = this.search.value.trim()
      if (event.key === 'Enter' && query) void this.open({ kind: 'search', query })
    })
    window.remote.onState((state) => this.renderNowPlaying(state))
    favorites.listeners.add(() => {
      refreshHearts(this.content, this.auth.connected)
      this.nowPlaying.querySelector('.ml-heart')?.replaceWith(heartButton(this.nowPlayingTrackId, this.auth.connected))
    })
    document.addEventListener('library:toggle', () => root.classList.toggle('hidden'))
    document.addEventListener('auth:changed', () => void this.refreshAuth())
    this.renderNowPlaying(null)
  }

  async init(): Promise<void> {
    const [auth, eq, liked] = await Promise.all([
      window.remote.getAuth(),
      window.remote.getEq(),
      window.remote.getLikedIds()
    ])
    this.auth = auth
    this.eq = eq
    this.renderService()
    favorites.set(liked)
    this.renderStatus()
    this.renderNav()
    if (auth.connected) await this.open({ kind: 'liked' }, true)
    else this.renderWelcome()
  }

  setEqStatus(eq: EqStatus): void {
    this.eq = eq
    this.renderStatus()
  }

  private get service(): string {
    return PROVIDER_NAMES[this.auth.provider]
  }

  private renderService(): void {
    this.heading.textContent = t('libraryTitle', { service: this.service })
    this.serviceButton.textContent = `${this.service}…`
    this.search.placeholder = t('searchIn', { service: this.service })
  }

  // ---- Status bar ------------------------------------------------------------

  private renderStatus(): void {
    const tidal: (Node | string)[] = []
    if (!this.auth.configured) {
      tidal.push(
        el('span', { className: 'ml-ok' }, `● ${t('remoteOnly')}`),
        el('button', {
          textContent: t('searchIn', { service: this.service }),
          onclick: () => document.dispatchEvent(new CustomEvent('setup:open'))
        })
      )
    } else if (this.auth.connected) {
      tidal.push(
        el('span', { className: 'ml-ok' }, t('serviceConnected', { service: this.service })),
        el('button', { textContent: t('disconnect'), onclick: () => void this.connect(false) })
      )
    } else {
      if (this.auth.catalog) {
        tidal.push(el('span', { className: 'ml-ok', title: t('catalogWithoutSignIn') }, t('catalogBadge')))
      }
      const label = this.auth.provider === 'ytmusic' ? t('signIn') : t('connectService', { service: this.service })
      tidal.push(el('button', { textContent: label, onclick: () => void this.connect(true) }))
    }

    const eq: (Node | string)[] = this.eq.error
      ? [el('span', { className: 'ml-warn', title: this.eq.error }, t('eqPermissions'))]
      : this.eq.installed
        ? [el('span', { className: 'ml-ok', title: this.eq.configDir ?? '' }, t('eqActive'))]
        : [el('a', { href: EQ_APO_URL, target: '_blank', textContent: t('installEqualizer') })]

    this.status.replaceChildren(
      el('div', { className: 'ml-status-group' }, ...tidal),
      el(
        'div',
        { className: 'ml-status-group' },
        el('button', {
          textContent: t('addFrom', { service: this.service }),
          title: t('searchCatalogHint'),
          onclick: () => document.dispatchEvent(new CustomEvent('search:open'))
        }),
        ...eq
      )
    )
  }

  private async connect(connect: boolean): Promise<void> {
    const opening =
      this.auth.provider === 'ytmusic'
        ? t('googleOpening')
        : t('signInOpening', { service: this.service })
    this.status.replaceChildren(connect ? opening : t('disconnecting'))
    try {
      await (connect ? window.remote.connect() : window.remote.disconnect())
    } catch {
      // the error toast explains what happened
    }
    await this.refreshAuth()
  }

  private async refreshAuth(): Promise<void> {
    this.auth = await window.remote.getAuth()
    library.invalidate()
    this.renderService()
    this.history = []
    this.renderStatus()
    this.renderNav()
    if (this.auth.connected) await this.open({ kind: 'liked' }, true)
    else this.renderWelcome()
  }

  // ---- Navigation --------------------------------------------------------------

  private get view(): View | undefined {
    return this.history[this.history.length - 1]
  }

  private renderNav(): void {
    this.body.classList.toggle('disconnected', !this.auth.connected)
    this.search.disabled = !this.auth.catalog
    const item = (label: string, view: View): HTMLElement =>
      el('div', {
        className: `ml-nav-item ${sameView(this.view, view) ? 'selected' : ''}`,
        textContent: label,
        onclick: () => void this.open(view, true)
      })
    this.nav.replaceChildren(
      item(`♥ ${t('likedTracks')}`, { kind: 'liked' }),
      ...SECTIONS.filter((section) => section !== 'mixes' || this.auth.capabilities.mixes).map((section) =>
        item(t(section), { kind: 'section', section })
      )
    )
  }

  private renderWelcome(): void {
    this.loadToken++
    this.history = []
    this.title.textContent = ''
    this.actions.replaceChildren()
    this.back.hidden = true
    this.content.replaceChildren(
      el(
        'div',
        { className: 'ml-empty' },
        this.auth.provider === 'ytmusic'
          ? t('libraryYoutubeWelcome')
          : this.auth.provider === 'spotify'
          ? t('librarySpotifyWelcome')
          : !this.auth.configured
          ? t('libraryTidalRemoteWelcome')
          : this.auth.catalog
            ? t('libraryTidalCatalogWelcome')
            : t('libraryTidalConnectWelcome')
      )
    )
  }

  private goBack(): void {
    if (this.history.length < 2) return
    this.history.pop()
    void this.open(this.history.pop()!)
  }

  private async open(view: View, root = false): Promise<void> {
    if (root) this.history = []
    if (!sameView(this.view, view)) this.history.push(view)
    this.back.hidden = this.history.length < 2
    this.renderNav()
    const token = ++this.loadToken
    const stale = (): boolean => token !== this.loadToken

    this.actions.replaceChildren()
    this.content.replaceChildren(el('div', { className: 'ml-empty' }, t('loading')))
    try {
      if (view.kind === 'liked') {
        this.title.textContent = `♥ ${t('likedTracks')}`
        const tracks = await library.liked()
        if (!stale()) this.showTracks(tracks)
      } else if (view.kind === 'section') {
        this.title.textContent = t(view.section)
        const collections = await library.section(view.section)
        if (!stale()) this.showCollections(collections)
      } else if (view.kind === 'collection') {
        const { collection } = view
        this.title.textContent = collection.subtitle ? `${collection.name} — ${collection.subtitle}` : collection.name
        const tracks = await library.tracks(collection)
        if (!stale()) this.showTracks(tracks)
      } else {
        this.title.textContent = t('searchResultsFor', { query: view.query })
        const results = await window.remote.search(view.query)
        if (!stale()) this.showSearch(results)
      }
    } catch {
      if (!stale()) this.content.replaceChildren(el('div', { className: 'ml-empty' }, t('loadFailed')))
    }
  }

  // ---- Rendering -----------------------------------------------------------------

  private showTracks(tracks: Track[]): void {
    if (tracks.length) {
      this.actions.replaceChildren(
        el('button', { textContent: t('play'), onclick: () => this.controller.loadList(tracks, 0) }),
        el('button', {
          textContent: t('shuffle'),
          onclick: () => this.controller.loadList([...tracks].sort(() => Math.random() - 0.5), 0)
        }),
        el('button', { textContent: t('addAll'), onclick: () => this.controller.enqueue(tracks) })
      )
    }
    this.content.replaceChildren(
      ...(tracks.length
        ? tracks.map((track, index) =>
            trackRow(
              track,
              index,
              { play: () => this.controller.loadList(tracks, index), add: () => this.controller.enqueue([track]) },
              this.auth.connected
            )
          )
        : [el('div', { className: 'ml-empty' }, t('empty'))])
    )
  }

  private collectionRows(collections: Collection[]): HTMLElement[] {
    return collections.map((collection) =>
      collectionRow(collection, () => void this.open({ kind: 'collection', collection }), {
        play: () => void library.tracks(collection).then((t) => this.controller.loadList(t, 0)).catch(() => undefined),
        add: () => void library.tracks(collection).then((t) => this.controller.enqueue(t)).catch(() => undefined)
      })
    )
  }

  private showCollections(collections: Collection[]): void {
    this.content.replaceChildren(
      ...(collections.length
        ? this.collectionRows(collections)
        : [el('div', { className: 'ml-empty' }, t('nothingHere'))])
    )
  }

  private showSearch(results: SearchResults): void {
    const trackRows = results.tracks.map((track, index) =>
      trackRow(
        track,
        index,
        { play: () => this.controller.enqueue([track], true), add: () => this.controller.enqueue([track]) },
        this.auth.connected
      )
    )
    const groups: [string, HTMLElement[]][] = [
      [t('tracks').toUpperCase(), trackRows],
      [t('searchCollection').toUpperCase(), this.collectionRows(results.albums)],
      [t('artists').toUpperCase(), this.collectionRows(results.artists)],
      [t('playlists').toUpperCase(), this.collectionRows(results.playlists)]
    ]
    const nodes = groups
      .filter(([, rows]) => rows.length)
      .flatMap(([label, rows]) => [el('div', { className: 'ml-group' }, label), ...rows])
    this.content.replaceChildren(...(nodes.length ? nodes : [el('div', { className: 'ml-empty' }, t('noResults'))]))
  }

  private renderNowPlaying(state: PlaybackState | null): void {
    this.nowPlayingTrackId = state?.trackId
    if (!state) {
      this.nowPlaying.replaceChildren(
        el('div', { className: 'ml-now-empty' }, t('noPlayback', { service: this.service })),
        ...(this.auth.provider === 'spotify' ? [spotifyLink()] : [])
      )
      return
    }
    const current = this.nowPlaying.querySelector('img')
    const image =
      current && current.src === state.artworkUrl ? current : el('img', { src: state.artworkUrl ?? '', alt: '' })
    image.hidden = !state.artworkUrl
    this.nowPlaying.replaceChildren(
      image,
      el(
        'div',
        { className: 'ml-now-text' },
        el('div', { className: 'ml-now-title' }, state.title),
        el('div', {}, state.artist),
        el('div', { className: 'ml-now-dim' }, state.album ?? '')
      ),
      heartButton(state.trackId, this.auth.connected),
      ...(this.auth.provider === 'spotify'
        ? [spotifyLink(state.trackId ? `https://open.spotify.com/track/${state.trackId}` : undefined)]
        : [])
    )
  }
}
