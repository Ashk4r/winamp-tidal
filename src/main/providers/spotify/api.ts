import { t } from '@shared/i18n'
import { hostname } from 'node:os'
import {
  SPOTIFY_CALLBACK_PORT,
  SPOTIFY_REDIRECT_URI,
  type Collection,
  type SearchResults,
  type Track
} from '@shared/types'
import { OAuthSession } from '../../auth/session'
import { settingsStore } from '../../auth/store'

const API = 'https://api.spotify.com/v1'
const ID = /^[a-zA-Z0-9]{22}$/
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-library-modify',
  'user-follow-read',
  'user-read-playback-state',
  'user-modify-playback-state'
]

interface SpotifyItem {
  id: string
  name: string
  artists?: SpotifyItem[]
  images?: { url: string }[]
  owner?: { display_name?: string }
  items?: { total: number }
  tracks?: { total: number }
  total_tracks?: number
}

interface SpotifyTrack extends SpotifyItem {
  type?: string
  duration_ms: number
  album?: SpotifyItem
  is_local?: boolean
  is_playable?: boolean
}

interface Page<T> {
  items: T[]
  next: string | null
}

interface Device {
  id: string | null
  name: string
  type: string
  is_restricted: boolean
}

export interface SpotifyPlayback {
  device: Device
  item: SpotifyTrack | null
  progress_ms: number | null
  is_playing: boolean
}

function spotifyId(id: string): string {
  if (!ID.test(id)) throw new Error(t('spotifyIdInvalid'))
  return id
}

export function toTrack(item: SpotifyTrack | null | undefined, album = item?.album?.name): Track | undefined {
  if (!item?.id || item.is_local || item.is_playable === false || !Number.isFinite(item.duration_ms)) return
  if (item.type && item.type !== 'track') return
  return {
    id: item.id,
    sourceUrl: `https://open.spotify.com/track/${item.id}`,
    title: item.name,
    artist: artistNames(item),
    album,
    durationMs: item.duration_ms
  }
}

function artistNames(item: SpotifyItem): string {
  return item.artists?.map((artist) => artist.name).join(', ') ?? ''
}

function collections(kind: Collection['kind'], items: (SpotifyItem | null)[] = []): Collection[] {
  return items.flatMap((item) => item?.id ? [{
    kind,
    id: item.id,
    sourceUrl: `https://open.spotify.com/${kind}/${item.id}`,
    name: item.name,
    subtitle: artistNames(item) || item.owner?.display_name,
    artworkUrl: item.images?.[0]?.url,
    trackCount: item.total_tracks ?? item.items?.total ?? item.tracks?.total
  }] : [])
}

function tracks(items: (SpotifyTrack | null | undefined)[], album?: string): Track[] {
  return items.map((item) => toTrack(item, album)).filter((track) => track != null)
}

export class SpotifyApi {
  private clientId = settingsStore.get().spotifyClientId ?? ''
  private loggingIn: Promise<void> | undefined
  private readonly session = new OAuthSession('spotify', () => this.config(this.clientId))
  private deviceId: string | undefined

  private config(clientId: string) {
    return {
      authorizeUrl: 'https://accounts.spotify.com/authorize',
      tokenUrl: 'https://accounts.spotify.com/api/token',
      clientId,
      scopes: SCOPES,
      port: SPOTIFY_CALLBACK_PORT,
      redirectUri: SPOTIFY_REDIRECT_URI
    }
  }

  get configured(): boolean {
    return this.clientId !== ''
  }

  get connected(): boolean {
    return this.configured && this.session.isLoggedIn()
  }

  async login(value = this.clientId): Promise<void> {
    const id = value.trim()
    if (!/^[a-f\d]{32}$/i.test(id)) throw new Error(t('spotifyClientIdInvalid'))
    if (this.loggingIn) throw new Error(t('spotifySignInPending'))
    this.loggingIn = this.session.login(this.config(id))
    try {
      await this.loggingIn
      this.clientId = id
      settingsStore.update({ spotifyClientId: id })
      this.deviceId = undefined
    } finally {
      this.loggingIn = undefined
    }
  }

  logout(): void {
    if (this.loggingIn) throw new Error(t('spotifySignInPending'))
    this.session.logout()
    this.deviceId = undefined
  }

  async ensureUser(): Promise<void> {
    if (this.loggingIn || !this.connected) throw new Error(t('spotifyConnectFirst'))
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T | undefined> {
    await this.ensureUser()
    return this.session.request<T>(API + path, {
      ...init,
      signal: AbortSignal.timeout(15_000),
      ...(init.body ? { headers: { 'Content-Type': 'application/json' } } : {})
    })
  }

  /** Follow only Spotify API pagination links, since these requests carry a bearer token. */
  private async pages<T>(path: string, field?: string): Promise<T[]> {
    const items: T[] = []
    const visited = new Set<string>()
    while (!visited.has(path)) {
      visited.add(path)
      const result = await this.request<Page<T> | Record<string, Page<T>>>(path)
      const page = field
        ? (result as Record<string, Page<T>> | undefined)?.[field]
        : (result as Page<T> | undefined)
      if (!page) break
      items.push(...page.items)
      if (!page.next?.startsWith(API + '/')) break
      path = page.next.slice(API.length)
    }
    return items
  }

  async search(query: string): Promise<SearchResults> {
    const params = new URLSearchParams({ q: query, type: 'track,album,artist,playlist', limit: '10' })
    const result = await this.request<{
      tracks?: Page<SpotifyTrack | null>
      albums?: Page<SpotifyItem | null>
      artists?: Page<SpotifyItem | null>
      playlists?: Page<SpotifyItem | null>
    }>(`/search?${params}`)
    return {
      tracks: tracks(result?.tracks?.items ?? []),
      albums: collections('album', result?.albums?.items),
      artists: collections('artist', result?.artists?.items),
      playlists: collections('playlist', result?.playlists?.items)
    }
  }

  async collectionTracks(collection: Collection): Promise<Track[]> {
    const id = spotifyId(collection.id)
    if (collection.kind === 'album') {
      return tracks(await this.pages<SpotifyTrack>(`/albums/${id}/tracks?limit=50`), collection.name)
    }
    if (collection.kind === 'playlist') {
      const entries = await this.pages<{ item?: SpotifyTrack | null; track?: SpotifyTrack | null }>(
        `/playlists/${id}/items?limit=50`
      )
      return tracks(entries.map((entry) => entry?.item ?? entry?.track))
    }
    if (collection.kind === 'artist') {
      // Development Mode does not provide the artist top-tracks endpoint.
      const name = collection.name.replaceAll('"', '')
      const params = new URLSearchParams({ q: `artist:"${name}"`, type: 'track', limit: '10' })
      const result = await this.request<{ tracks?: Page<SpotifyTrack | null> }>(`/search?${params}`)
      return tracks(result?.tracks?.items.filter((track) => track?.artists?.some((artist) => artist.id === id)) ?? [])
    }
    return []
  }

  async likedTracks(): Promise<Track[]> {
    return tracks((await this.pages<{ track: SpotifyTrack | null }>('/me/tracks?limit=50')).map(({ track }) => track))
  }

  async userPlaylists(): Promise<Collection[]> {
    return collections('playlist', await this.pages<SpotifyItem | null>('/me/playlists?limit=50'))
  }

  async userAlbums(): Promise<Collection[]> {
    return collections('album', (await this.pages<{ album: SpotifyItem }>('/me/albums?limit=50')).map(({ album }) => album))
  }

  async userArtists(): Promise<Collection[]> {
    return collections('artist', await this.pages<SpotifyItem>('/me/following?type=artist&limit=50', 'artists'))
  }

  async setLiked(id: string, liked: boolean): Promise<void> {
    const params = new URLSearchParams({ uris: `spotify:track:${spotifyId(id)}` })
    await this.request(`/me/library?${params}`, { method: liked ? 'PUT' : 'DELETE' })
  }

  private isLocalDevice(device: Device): boolean {
    return device.type.toLowerCase() === 'computer' && device.name.toLowerCase() === hostname().toLowerCase()
  }

  private async desktopDevice(): Promise<string> {
    const result = await this.request<{ devices: Device[] }>('/me/player/devices')
    const desktop = result?.devices.find((device) => device.id && !device.is_restricted && this.isLocalDevice(device))
    if (!desktop?.id) {
      throw new Error(t('spotifyActivateDevice'))
    }
    return desktop.id
  }

  async play(ids: string[]): Promise<void> {
    const uris = ids.map((id) => `spotify:track:${spotifyId(id)}`)
    const id = await this.desktopDevice()
    await this.request(`/me/player/play?device_id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ uris })
    })
    this.deviceId = id
  }

  async seek(positionMs: number): Promise<void> {
    const id = this.deviceId ?? await this.desktopDevice()
    const params = new URLSearchParams({ device_id: id, position_ms: String(positionMs) })
    await this.request(`/me/player/seek?${params}`, { method: 'PUT' })
  }

  async playback(): Promise<SpotifyPlayback | undefined> {
    const state = await this.request<SpotifyPlayback>('/me/player')
    if (state?.device && this.isLocalDevice(state.device)) {
      this.deviceId = state.device.id ?? undefined
      return state
    }
  }
}
