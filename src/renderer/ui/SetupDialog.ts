import { t } from '@shared/i18n'
import { SPOTIFY_REDIRECT_URI, type ProviderId } from '@shared/types'
import { centerOnPrimary, keepOnScreen, makeFloating } from './desktop'
import { languageSelect, type ChangeLanguage } from './language'
import { el } from './rows'

const DASHBOARD_URL = 'https://developer.tidal.com/dashboard'

/**
 * First-run setup and optional account setup for each music service.
 */
export class SetupDialog {
  private placed: boolean
  private body = el('div', { className: 'su-body' })
  private heading = el('span', {}, t('chooseService'))

  constructor(private readonly root: HTMLElement, changeLanguage: ChangeLanguage) {
    const titlebar = el(
      'div',
      { className: 'ml-titlebar' },
      this.heading,
      el(
        'div',
        { className: 'ml-titlebar-actions' },
        languageSelect(changeLanguage),
        el('button', { textContent: '×', title: t('closeEscape'), onclick: () => this.close() })
      )
    )
    root.append(titlebar, this.body)
    this.placed = makeFloating(root, titlebar, 'setup-position-v1')
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close()
    })
    document.addEventListener('setup:open', () => void this.open())
  }

  async open(): Promise<void> {
    this.root.classList.remove('hidden')
    this.renderService((await window.remote.getAuth()).provider)
    if (!this.placed) centerOnPrimary(this.root)
    this.placed = true
    keepOnScreen(this.root)
  }

  close(): void {
    this.root.classList.add('hidden')
  }

  private option(title: string, text: string, onclick: () => void, current: boolean): HTMLElement {
    return el(
      'button',
      { className: `su-option ${current ? 'current' : ''}`, onclick },
      el('strong', {}, current ? t('currentChoice', { title }) : title),
      el('span', {}, text)
    )
  }

  private renderService(current: ProviderId): void {
    this.heading.textContent = t('chooseService')
    this.body.replaceChildren(
      el('p', {}, t('chooseServiceQuestion')),
      this.option(
        'TIDAL',
        t('tidalOption'),
        () => void this.choose('tidal'),
        current === 'tidal'
      ),
      this.option(
        'YouTube Music',
        t('youtubeOption'),
        () => void this.choose('ytmusic'),
        current === 'ytmusic'
      ),
      this.option(
        'Spotify',
        t('spotifyOption'),
        () => void this.choose('spotify'),
        current === 'spotify'
      ),
      el('div', { className: 'su-error' })
    )
  }

  private async choose(provider: ProviderId): Promise<void> {
    try {
      const auth = await window.remote.setProvider(provider)
      if (provider === 'tidal') this.renderChoice((await window.remote.getCredentials()).hasSecret)
      else if (provider === 'spotify') this.renderSpotify(auth.connected)
      else this.renderYouTube(auth.connected)
    } catch (error) {
      this.showError(error)
    }
  }

  private renderSpotify(connected: boolean): void {
    this.heading.textContent = t('setupSpotify')
    const clientId = el('input', {
      className: 'ml-search',
      placeholder: 'Client ID',
      ariaLabel: 'Spotify Client ID',
      spellcheck: false
    })
    const login = el('button', { textContent: connected ? t('reconnect') : t('connectSpotify') })
    const submit = async (): Promise<void> => {
      if (login.disabled) return
      login.disabled = true
      login.textContent = t('waitingForSignIn')
      try {
        await window.remote.connect(clientId.value)
        document.dispatchEvent(new CustomEvent('auth:changed'))
        this.close()
      } catch (error) {
        this.showError(error)
      } finally {
        login.disabled = false
        login.textContent = connected ? t('reconnect') : t('connectSpotify')
      }
    }
    login.onclick = () => void submit()
    clientId.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') void submit()
    })
    this.body.replaceChildren(
      el('p', {}, t('spotifyRemoteHelp')),
      el(
        'ol',
        { className: 'su-steps' },
        el(
          'li',
          {},
          t('spotifyDashboardBefore'),
          el('a', { href: 'https://developer.spotify.com/dashboard', target: '_blank', textContent: 'Spotify Developer Dashboard' }),
          t('spotifyDashboardAfter')
        ),
        el('li', {}, t('spotifyRedirectBefore'), el('code', {}, SPOTIFY_REDIRECT_URI), '.'),
        el('li', {}, t('spotifyConnectHelp'))
      ),
      clientId,
      el('div', { className: 'su-error' }),
      el(
        'div',
        { className: 'su-buttons' },
        el('button', { textContent: t('backArrow'), onclick: () => void this.open() }),
        login,
        el('button', { textContent: connected ? t('close') : t('remoteOnly'), onclick: () => this.close() })
      )
    )
    clientId.focus()
  }

  private renderYouTube(connected: boolean): void {
    this.heading.textContent = 'YOUTUBE MUSIC'
    const login = el('button', { textContent: t('signInGoogle') })
    login.onclick = () => {
      login.disabled = true
      login.textContent = t('waitingForSignIn')
      window.remote
        .connect()
        .then(() => {
          document.dispatchEvent(new CustomEvent('auth:changed'))
          this.close()
        })
        .catch((error) => this.showError(error))
        .finally(() => {
          login.disabled = false
          login.textContent = t('signInGoogle')
        })
    }
    this.body.replaceChildren(
      el(
        'p',
        {},
        connected
          ? t('youtubeConnectedHelp')
          : t('youtubeGuestHelp')
      ),
      el('div', { className: 'su-note' }, t('youtubeSignInNote')),
      el('div', { className: 'su-error' }),
      el(
        'div',
        { className: 'su-buttons' },
        el('button', { textContent: t('backArrow'), onclick: () => void this.open() }),
        ...(connected
          ? []
          : [
              login,
              el('button', {
                textContent: t('useBrowserSession'),
                title: t('useBrowserSessionHint'),
                onclick: () => this.renderCookieImport()
              })
            ]),
        el('button', { textContent: connected ? t('close') : t('later'), onclick: () => this.close() })
      )
    )
  }

  /** For accounts Google won't sign in here (passkey-only): reuse the browser's session. */
  private renderCookieImport(): void {
    this.heading.textContent = t('browserSession')
    const input = el('textarea', {
      className: 'ml-search su-cookies',
      placeholder: t('cookiePlaceholder'),
      spellcheck: false
    })
    const save = el('button', { textContent: t('connect') })
    save.onclick = () => {
      save.disabled = true
      save.textContent = t('connecting')
      window.remote
        .importYouTubeSession(input.value)
        .then(() => {
          document.dispatchEvent(new CustomEvent('auth:changed'))
          this.close()
        })
        .catch((error) => this.showError(error))
        .finally(() => {
          save.disabled = false
          save.textContent = t('connect')
        })
    }
    this.body.replaceChildren(
      el(
        'ol',
        { className: 'su-steps' },
        el(
          'li',
          {},
          t('cookieOpenBefore'),
          el('a', { href: 'https://music.youtube.com', target: '_blank', textContent: 'music.youtube.com' }),
          t('cookieOpenAfter')
        ),
        el('li', {}, t('cookieNetwork')),
        el('li', {}, t('cookieBrowse')),
        el(
          'li',
          {},
          t('cookieCopy')
        )
      ),
      input,
      el(
        'div',
        { className: 'su-note' },
        t('cookiePrivacy')
      ),
      el('div', { className: 'su-error' }),
      el(
        'div',
        { className: 'su-buttons' },
        el('button', { textContent: t('backArrow'), onclick: () => this.renderYouTube(false) }),
        save
      )
    )
    input.focus()
  }

  private showError(error: unknown): void {
    // Electron prefixes IPC errors with "Error invoking remote method …: Error: ".
    const message = String((error as Error).message).replace(/^.*Error: /, '')
    const target = this.body.querySelector('.su-error')
    if (target) target.textContent = `⚠ ${message}`
  }

  private renderChoice(catalogOn: boolean): void {
    this.heading.textContent = t('setupTidal')
    const option = this.option.bind(this)
    this.body.replaceChildren(
      el(
        'p',
        {},
        t('tidalSetupIntro')
      ),
      option(
        t('remoteOnly'),
        t('tidalRemoteHelp'),
        () => void this.save(null),
        !catalogOn
      ),
      option(
        t('tidalRemoteSearch'),
        t('tidalCatalogHelp'),
        () => this.renderCatalog(),
        catalogOn
      ),
      el('div', { className: 'su-error' }),
      el('div', { className: 'su-buttons' }, el('button', { textContent: t('backArrow'), onclick: () => void this.open() }))
    )
  }

  private renderCatalog(): void {
    const clientId = el('input', { className: 'ml-search', placeholder: 'Client ID', spellcheck: false })
    const clientSecret = el('input', { className: 'ml-search', type: 'password', placeholder: 'Client Secret' })
    const save = el('button', { textContent: t('testAndSave') })
    const submit = (): void => {
      save.disabled = true
      save.textContent = t('testing')
      void this.save({ clientId: clientId.value, clientSecret: clientSecret.value }).finally(() => {
        save.disabled = false
        save.textContent = t('testAndSave')
      })
    }
    save.onclick = submit
    clientSecret.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submit()
    })
    this.body.replaceChildren(
      el(
        'ol',
        { className: 'su-steps' },
        el(
          'li',
          {},
          t('tidalDashboardBefore'),
          el('a', { href: DASHBOARD_URL, target: '_blank', textContent: 'developer.tidal.com/dashboard' }),
          t('tidalDashboardAfter')
        ),
        el('li', {}, t('tidalCreateApp')),
        el('li', {}, t('tidalPasteCredentials'))
      ),
      clientId,
      clientSecret,
      el('div', { className: 'su-note' }, t('tidalCredentialsNote')),
      el('div', { className: 'su-error' }),
      el(
        'div',
        { className: 'su-buttons' },
        el('button', {
          textContent: t('backArrow'),
          onclick: () => void window.remote.getCredentials().then((c) => this.renderChoice(c.hasSecret))
        }),
        save
      )
    )
    clientId.focus()
  }

  private async save(credentials: { clientId: string; clientSecret: string } | null): Promise<void> {
    try {
      await window.remote.setCredentials(credentials)
      this.close()
      document.dispatchEvent(new CustomEvent('auth:changed'))
    } catch (error) {
      this.showError(error)
    }
  }
}
