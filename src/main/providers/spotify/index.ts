import { t } from '@shared/i18n'
import type { PlayContext, PlaybackState, Track } from '@shared/types'
import { smtc } from '../../smtc/helperClient'
import type { MusicProvider } from '../types'
import { SpotifyApi, toTrack, type SpotifyPlayback } from './api'

const normalize = (text: string): string => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')

export class SpotifyProvider implements MusicProvider {
  readonly id = 'spotify'
  readonly name = 'Spotify'
  readonly capabilities = { credentials: false, mixes: false, externalApp: true }
  private readonly api = new SpotifyApi()
  private liked = new Set<string>()
  private queue: Track[] = []
  private currentId: string | undefined
  private disposed = false
  private playPending: Promise<void> = Promise.resolve()

  constructor(private readonly onLikedChange: (ids: string[]) => void) {}

  get configured(): boolean {
    return this.api.configured
  }

  get connected(): boolean {
    return this.api.connected
  }

  get catalogAvailable(): boolean {
    return this.connected
  }

  login(clientId?: string): Promise<void> {
    return this.api.login(clientId)
  }

  async logout(): Promise<void> {
    this.api.logout()
    this.liked.clear()
    this.onLikedChange([])
  }

  ensureUser = () => this.api.ensureUser()
  ensureCatalog = () => this.api.ensureUser()
  search: MusicProvider['search'] = (query) => this.api.search(query)
  collectionTracks: MusicProvider['collectionTracks'] = (collection) => this.api.collectionTracks(collection)
  likedTracks = () => this.api.likedTracks()
  userPlaylists = () => this.api.userPlaylists()
  userAlbums = () => this.api.userAlbums()
  userArtists = () => this.api.userArtists()
  mixes: MusicProvider['mixes'] = async () => []

  async loadLiked(): Promise<void> {
    if (!this.connected) return
    const tracks = await this.api.likedTracks()
    if (!this.connected || this.disposed) return
    this.liked = new Set(tracks.map((track) => track.id))
    this.onLikedChange(this.likedIds())
  }

  likedIds(): string[] {
    return [...this.liked]
  }

  async setLiked(id: string, liked: boolean): Promise<void> {
    await this.api.setLiked(id, liked)
    if (!this.connected || this.disposed) return
    if (liked) this.liked.add(id)
    else this.liked.delete(id)
    this.onLikedChange(this.likedIds())
  }

  async playTrack({ tracks, index }: PlayContext): Promise<void> {
    if (!tracks[index] || index < 0) return
    this.queue = tracks
    const play = this.playPending.catch(() => undefined).then(async () => {
      if (!this.disposed) await this.api.play(tracks.slice(index, index + 100).map((track) => track.id))
    })
    this.playPending = play
    await play
  }

  setQueue(tracks: Track[]): void {
    this.queue = tracks
  }

  private async send(command: 'play' | 'pause' | 'next' | 'previous' | 'seek', positionMs?: number): Promise<void> {
    if (!smtc.session('spotify')) throw new Error(t('spotifyActivateRemote'))
    await smtc.send(command, 'spotify', { positionMs })
  }

  resume = () => this.send('play')
  pause = () => this.send('pause')

  next(): Promise<void> {
    const index = this.queue.findIndex((track) => track.id === this.currentId)
    if (this.connected && index >= 0 && index + 1 < this.queue.length) {
      return this.playTrack({ tracks: this.queue, index: index + 1 })
    }
    return this.send('next')
  }

  previous(): Promise<void> {
    return this.send('previous')
  }

  async seek(positionMs: number): Promise<void> {
    if (!Number.isFinite(positionMs)) return
    const position = Math.max(0, Math.round(positionMs))
    try {
      await this.send('seek', position)
    } catch (error) {
      if (!this.connected) throw error
      await this.api.seek(position)
    }
  }

  watch(onState: (state: PlaybackState | null) => void): () => void {
    let apiState: SpotifyPlayback | undefined
    let observedAt = 0
    let pollAt = 0
    let pending = false
    let stopped = false

    const update = (): void => {
      if (stopped) return
      const session = smtc.session('spotify')
      if (!session?.title) {
        this.currentId = undefined
        apiState = undefined
        onState(null)
        return
      }
      const now = Date.now()
      if (this.connected && !pending && now >= pollAt) {
        pollAt = now + 10_000
        pending = true
        void this.api.playback().then((state) => {
          apiState = state
          observedAt = Date.now()
        }).catch(() => {
          apiState = undefined
          pollAt = Date.now() + 15_000
        }).finally(() => {
          pending = false
          update()
        })
      }

      const matches = (track: Track): boolean =>
        normalize(track.title) === normalize(session.title) && normalize(track.artist) === normalize(session.artist)
      const fromApi = this.connected ? toTrack(apiState?.item) : undefined
      const isCurrent = fromApi !== undefined && matches(fromApi)
      const track = isCurrent ? fromApi : this.queue.find(matches)
      const durationMs = session.durationMs || track?.durationMs || 0
      const apiPosition = isCurrent && apiState?.is_playing === session.isPlaying
        ? (apiState.progress_ms ?? 0) + (session.isPlaying ? now - observedAt : 0)
        : 0
      this.currentId = track?.id
      onState({
        trackId: track?.id,
        title: session.title,
        artist: session.artist,
        album: session.album || track?.album,
        artworkUrl: session.thumbnail || (isCurrent ? apiState?.item?.album?.images?.[0]?.url : undefined),
        durationMs,
        positionMs: Math.max(0, Math.min(durationMs, session.durationMs > 0 ? session.positionMs : apiPosition)),
        isPlaying: session.isPlaying,
        liked: track ? this.liked.has(track.id) : undefined
      })
    }
    const stop = smtc.onSessions(update)
    update()
    return () => {
      stopped = true
      stop()
    }
  }

  async dispose(): Promise<void> {
    this.disposed = true
    await this.playPending.catch(() => undefined)
    if (smtc.session('spotify')?.isPlaying) await this.pause().catch(() => undefined)
  }
}
