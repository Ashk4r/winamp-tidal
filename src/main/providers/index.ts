import type { ProviderId } from '@shared/types'
import { SpotifyProvider } from './spotify'
import { TidalProvider } from './tidal'
import type { MusicProvider } from './types'
import { YtMusicProvider } from './ytmusic'

export function createProvider(id: ProviderId, onLikedChange: (ids: string[]) => void): MusicProvider {
  if (id === 'spotify') return new SpotifyProvider(onLikedChange)
  return id === 'ytmusic' ? new YtMusicProvider(onLikedChange) : new TidalProvider(onLikedChange)
}
