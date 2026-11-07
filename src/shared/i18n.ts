export const LANGUAGES = { en: 'English', de: 'Deutsch', es: 'Español' } as const
export type Language = keyof typeof LANGUAGES

export const DEFAULT_LANGUAGE: Language = 'en'

const LANGUAGE_INDEX: Record<Language, number> = { en: 0, de: 1, es: 2 }
let language: Language = DEFAULT_LANGUAGE

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && Object.hasOwn(LANGUAGES, value)
}

export function setLanguage(value: unknown): void {
  language = isLanguage(value) ? value : DEFAULT_LANGUAGE
}

export function getLanguage(): Language {
  return language
}

// Each message lists its English, German and Spanish text in that order.
const messages = {
  noMediaSession: [
    'Start playback in the desktop app to enable remote control.',
    'Starte die Wiedergabe in der Desktop-App, um die Fernsteuerung zu aktivieren.',
    'Iniciá la reproducción en la app de escritorio para activar el control remoto.'
  ],
  mediaCommandFailed: [
    'Windows could not complete the playback command.',
    'Windows konnte den Wiedergabebefehl nicht ausführen.',
    'Windows no pudo completar el comando de reproducción.'
  ],
  greenPioneer: ['Pioneer (green)', 'Pioneer (grün)', 'Pioneer (verde)'],
  classicPioneer: ['Pioneer (classic)', 'Pioneer (klassisch)', 'Pioneer (clásico)'],
  chooseService: [
    'Choose a service',
    'Dienst auswählen',
    'ELEGIR SERVICIO'
  ],
  chooseServiceQuestion: [
    'Which music service would you like to use with Winamp?',
    'Welchen Musikdienst möchtest du mit Winamp nutzen?',
    '¿Con qué servicio vas a escuchar música en el Winamp?'
  ],
  currentChoice: [
    '{title} (current)',
    '{title} (aktuell)',
    '{title} (actual)'
  ],
  closeEscape: [
    'Close (Esc)',
    'Schließen (Esc)',
    'Cerrar (Esc)'
  ],
  close: [
    'Close',
    'Schließen',
    'Cerrar'
  ],
  back: [
    'Back',
    'Zurück',
    'Volver'
  ],
  backArrow: [
    '◂ Back',
    '◂ Zurück',
    '◂ Volver'
  ],
  backKey: [
    'Back (Backspace)',
    'Zurück (Rücktaste)',
    'Volver (Retroceso)'
  ],
  language: [
    'Language',
    'Sprache',
    'Idioma'
  ],
  unknownLanguage: [
    'Unknown language',
    'Unbekannte Sprache',
    'Idioma desconocido'
  ],
  tidalOption: [
    'Control the TIDAL desktop app while it is open. Add your own TIDAL developer app to search from Winamp.',
    'Steuere die geöffnete TIDAL-Desktop-App. Mit einer eigenen TIDAL-Entwickler-App kannst du direkt in Winamp suchen.',
    'El Winamp maneja la app de escritorio de TIDAL (tiene que estar abierta). Opcional: buscar en TIDAL con tu propia app de desarrollador.'
  ],
  youtubeOption: [
    'Search and play music in Winamp. Sign in with Google to see your favorites and playlists.',
    'Suche und spiele Musik direkt in Winamp. Melde dich mit Google an, um deine Favoriten und Playlists zu sehen.',
    'Suena desde el mismo Winamp, sin otra app. Buscá y reproducí cualquier tema; iniciando sesión con Google ves tus favoritos y playlists.'
  ],
  spotifyOption: [
    'Control Spotify for Windows. Connect a Spotify Premium account to search and browse your library.',
    'Steuere Spotify für Windows. Verbinde ein Spotify-Premium-Konto für die Suche und deine Mediathek.',
    'Controlá la app de Spotify para Windows. Con Spotify Premium también podés conectar tu cuenta para buscar y ver tu biblioteca.'
  ],
  setupSpotify: [
    'Set up Spotify',
    'Spotify einrichten',
    'CONFIGURAR SPOTIFY'
  ],
  reconnect: [
    'Reconnect',
    'Erneut verbinden',
    'Volver a conectar'
  ],
  connectSpotify: [
    'Connect Spotify',
    'Spotify verbinden',
    'Conectar Spotify'
  ],
  waitingForSignIn: [
    'Waiting for sign-in…',
    'Warte auf die Anmeldung…',
    'Esperando el inicio de sesión…'
  ],
  spotifyRemoteHelp: [
    'Open Spotify for Windows and play a song to enable the Winamp controls.',
    'Öffne Spotify für Windows und spiele einen Titel ab, um die Winamp-Steuerung zu aktivieren.',
    'Abrí Spotify para Windows y reproducí un tema. Los controles del Winamp funcionan sin configurar una cuenta acá.'
  ],
  spotifyDashboardBefore: [
    'To search and browse your library, create a Web API app in the ',
    'Erstelle für die Suche und deine Mediathek eine App mit Web API im ',
    'Para buscar y ver tu biblioteca, creá una app con Web API en '
  ],
  spotifyDashboardAfter: [
    ' with your Premium account.',
    '. Verwende dafür dein Premium-Konto.',
    ' con tu cuenta Premium.'
  ],
  spotifyRedirectBefore: [
    'Under Redirect URIs, save ',
    'Speichere unter Redirect URIs ',
    'En Redirect URIs, guardá '
  ],
  spotifyConnectHelp: [
    'Paste the Client ID and sign in with the same account you use in the Windows app.',
    'Füge die Client ID ein und melde dich mit demselben Konto wie in der Windows-App an.',
    'Pegá el Client ID y conectate con la misma cuenta que usás en la app de Windows.'
  ],
  remoteOnly: [
    'Remote control only',
    'Nur Fernsteuerung',
    'Solo control remoto'
  ],
  signInGoogle: [
    'Sign in with Google',
    'Mit Google anmelden',
    'Iniciar sesión con Google'
  ],
  youtubeConnectedHelp: [
    'Your YouTube Music account is connected. Use “+ Add from YouTube Music” or press J to find music.',
    'Dein YouTube-Music-Konto ist verbunden. Suche über „+ Aus YouTube Music hinzufügen“ oder mit J nach Musik.',
    'Listo: YouTube Music está conectado con tu cuenta. Buscá música con "+ Agregar desde YouTube Music" o la tecla J.'
  ],
  youtubeGuestHelp: [
    'Use “+ Add from YouTube Music” or press J to search and play. Sign in with Google to see your favorites, playlists and mixes. YouTube Premium removes ads.',
    'Suche und spiele Musik über „+ Aus YouTube Music hinzufügen“ oder mit J. Melde dich mit Google an, um Favoriten, Playlists und Mixe zu sehen. Mit YouTube Premium entfällt die Werbung.',
    'Listo: ya podés buscar y reproducir con "+ Agregar desde YouTube Music" o la tecla J. Si iniciás sesión con tu cuenta de Google vas a ver tus favoritos, playlists y mixes (y con YouTube Premium, sin anuncios).'
  ],
  youtubeSignInNote: [
    'Sign in in the Google window. Your session is saved on this PC.',
    'Melde dich im Google-Fenster an. Deine Sitzung wird auf diesem PC gespeichert.',
    'El inicio de sesión se hace en una ventana de Google y queda guardado en esta PC.'
  ],
  useBrowserSession: [
    'Use my browser session…',
    'Browsersitzung verwenden…',
    'Usar la sesión de mi navegador…'
  ],
  useBrowserSessionHint: [
    'Use this if Google asks for a passkey or blocks sign-in here',
    'Falls Google einen Passkey verlangt oder die Anmeldung hier blockiert',
    'Si Google te pide una llave de acceso (passkey) o no te deja entrar acá'
  ],
  later: [
    'Later',
    'Später',
    'Más tarde'
  ],
  browserSession: [
    'YouTube Music · Browser session',
    'YouTube Music · Browsersitzung',
    'YOUTUBE MUSIC · SESIÓN DEL NAVEGADOR'
  ],
  cookiePlaceholder: [
    'Paste the “cookie” value or the contents of cookies.txt',
    '„cookie“-Wert oder Inhalt von cookies.txt einfügen',
    'Pegá acá el valor de "cookie" (o el archivo cookies.txt)'
  ],
  connect: [
    'Connect',
    'Verbinden',
    'Conectar'
  ],
  connecting: [
    'Connecting…',
    'Verbindung wird hergestellt…',
    'Conectando…'
  ],
  cookieOpenBefore: [
    'In Chrome or Edge, open ',
    'Öffne in Chrome oder Edge ',
    'En Chrome o Edge, abrí '
  ],
  cookieOpenAfter: [
    ' while signed in.',
    ' und melde dich an.',
    ' con tu cuenta iniciada.'
  ],
  cookieNetwork: [
    'Press F12, open the Network tab and reload the page with F5.',
    'Drücke F12, öffne den Tab „Netzwerk“ und lade die Seite mit F5 neu.',
    'Apretá F12, andá a la pestaña "Red" (Network) y recargá la página con F5.'
  ],
  cookieBrowse: [
    'Type “browse” in the filter and click the first result.',
    'Gib „browse“ in den Filter ein und klicke auf das erste Ergebnis.',
    'Escribí "browse" en el filtro y hacé clic en el primer resultado.'
  ],
  cookieCopy: [
    'Under Request Headers, right-click “cookie”, choose Copy value and paste it below.',
    'Klicke unter „Anfrageheader“ mit der rechten Maustaste auf „cookie“, kopiere den Wert und füge ihn unten ein.',
    'En "Encabezados de solicitud" (Request Headers) buscá "cookie", clic derecho → Copiar valor, y pegalo acá:'
  ],
  cookiePrivacy: [
    'Your YouTube session stays on this PC. Signing out in the browser ends this session too.',
    'Deine YouTube-Sitzung bleibt auf diesem PC. Wenn du dich im Browser abmeldest, endet auch diese Sitzung.',
    'Es tu sesión de YouTube: se guarda solo en esta PC y no se comparte con nadie. Si cerrás sesión en el navegador, acá también se corta.'
  ],
  setupTidal: [
    'Set up TIDAL',
    'TIDAL einrichten',
    'CONFIGURAR TIDAL'
  ],
  tidalSetupIntro: [
    'When TIDAL is open, Winamp can control playback, volume, the equalizer and visualizer. You can also set up TIDAL search in Winamp.',
    'Bei geöffneter TIDAL-App kannst du Wiedergabe, Lautstärke, Equalizer und Visualisierung über Winamp steuern. Du kannst zusätzlich die TIDAL-Suche in Winamp einrichten.',
    'Con la app de TIDAL abierta, el Winamp ya maneja play/pausa, temas, volumen, ecualizador y visualizador. ¿Querés además buscar y elegir música de TIDAL desde el Winamp?'
  ],
  tidalRemoteHelp: [
    'Pick music in the TIDAL app and control it from Winamp. No setup needed.',
    'Wähle Musik in der TIDAL-App und steuere sie über Winamp. Du kannst sofort loslegen.',
    'Elegís la música en la app de TIDAL y la manejás desde el Winamp. No hay que configurar nada.'
  ],
  tidalRemoteSearch: [
    'Remote control + TIDAL search',
    'Fernsteuerung + TIDAL-Suche',
    'Control remoto + buscar en TIDAL'
  ],
  tidalCatalogHelp: [
    'Find tracks, albums, artists and public playlists to build a Winamp playlist. This requires a free TIDAL developer app.',
    'Suche Titel, Alben, Künstler und öffentliche Playlists für deine Winamp-Playlist. Dafür brauchst du eine kostenlose TIDAL-Entwickler-App.',
    'Buscá temas, discos, artistas y playlists públicas y armá la playlist del Winamp. Requiere crear gratis una app en TIDAL (unos 3 minutos).'
  ],
  testAndSave: [
    'Test and save',
    'Testen und speichern',
    'Probar y guardar'
  ],
  testing: [
    'Testing…',
    'Wird geprüft…',
    'Probando…'
  ],
  tidalDashboardBefore: [
    'Open ',
    'Öffne ',
    'Entrá a '
  ],
  tidalDashboardAfter: [
    ' and sign in to your TIDAL account.',
    ' und melde dich mit deinem TIDAL-Konto an.',
    ' e iniciá sesión con tu cuenta de TIDAL.'
  ],
  tidalCreateApp: [
    'Choose Create app and give it a name, such as “Winamp Remote”.',
    'Wähle „Create app“ und vergib einen Namen, etwa „Winamp Remote“.',
    'Creá una app nueva (Create app). El nombre no importa, por ejemplo "Winamp Remote".'
  ],
  tidalPasteCredentials: [
    'Copy the app’s Client ID and Client Secret and paste them below.',
    'Kopiere die Client ID und das Client Secret der App in die Felder unten.',
    'Copiá el Client ID y el Client Secret de esa app y pegalos acá:'
  ],
  tidalCredentialsNote: [
    'The credentials are encrypted on this PC and used only to connect to TIDAL.',
    'Die Zugangsdaten werden auf diesem PC verschlüsselt gespeichert und nur für die Verbindung mit TIDAL verwendet.',
    'Se guardan cifrados en esta PC y solo se usan para hablar con TIDAL.'
  ],
  chooseMusicService: [
    'Choose a music service',
    'Musikdienst auswählen',
    'Elegir el servicio de música'
  ],
  libraryDragHint: [
    'Drag to move · Press L or Eject to show or hide',
    'Zum Verschieben ziehen · L oder Eject zum Ein- und Ausblenden',
    'Arrastrá para mover · L o el botón eject para mostrar/ocultar'
  ],
  toggleVisualizer: [
    'Show or hide the visualizer · Double-click it for full screen',
    'Visualisierung ein- oder ausblenden · Doppelklick für Vollbild',
    'Mostrar/ocultar el visualizador · doble clic en él para pantalla completa'
  ],
  skinsButton: [
    'Skins…',
    'Skins…',
    'Skins…'
  ],
  chooseSkin: [
    'Choose a featured skin, search the Skin Museum or open a .wsz file',
    'Wähle einen vorgestellten Skin, suche im Skin Museum oder öffne eine .wsz-Datei',
    'Elegir un skin: destacados, Skin Museum o un .wsz propio'
  ],
  zoomOut: [
    'Zoom out (Ctrl −)',
    'Verkleinern (Strg −)',
    'Achicar todo (Ctrl −)'
  ],
  zoomIn: [
    'Zoom in (Ctrl +) · Reset with Ctrl 0',
    'Vergrößern (Strg +) · Zurücksetzen mit Strg 0',
    'Agrandar todo (Ctrl +) · Ctrl 0 vuelve a 100%'
  ],
  hideLibrary: [
    'Hide (L)',
    'Ausblenden (L)',
    'Ocultar (L)'
  ],
  libraryTitle: [
    'Winamp Media Library · {service}',
    'Winamp-Mediathek · {service}',
    'WINAMP MEDIA LIBRARY · {service}'
  ],
  searchIn: [
    'Search {service}…',
    'In {service} suchen…',
    'Buscar en {service}…'
  ],
  serviceConnected: [
    '● {service} connected',
    '● {service} verbunden',
    '● {service} conectado'
  ],
  disconnect: [
    'Disconnect',
    'Verbindung trennen',
    'Desconectar'
  ],
  catalogWithoutSignIn: [
    'Search and browse without signing in',
    'Suche und Katalog ohne Anmeldung',
    'Búsqueda y catálogo sin login'
  ],
  catalogMode: [
    'Catalog mode',
    'Katalogmodus',
    'Modo catálogo'
  ],
  catalogBadge: [
    '● Catalog mode',
    '● Katalogmodus',
    '● Modo catálogo'
  ],
  signIn: [
    'Sign in',
    'Anmelden',
    'Iniciar sesión'
  ],
  connectService: [
    'Connect {service}',
    '{service} verbinden',
    'Conectar {service}'
  ],
  eqPermissions: [
    '⚠ EQ permission denied',
    '⚠ Kein Zugriff auf den EQ',
    '⚠ EQ sin permisos'
  ],
  eqActive: [
    '● EQ active',
    '● EQ aktiv',
    '● EQ activo'
  ],
  installEqualizer: [
    'Install Equalizer APO',
    'Equalizer APO installieren',
    'Instalar Equalizer APO'
  ],
  addFrom: [
    '+ Add from {service}',
    '+ Aus {service} hinzufügen',
    '+ Agregar desde {service}'
  ],
  searchCatalogHint: [
    'Find tracks, albums, artists or playlists (J)',
    'Titel, Alben, Künstler oder Playlists suchen (J)',
    'Buscar y elegir temas, álbumes, artistas o playlists (J)'
  ],
  googleOpening: [
    'Sign in with your Google account in the window that opened…',
    'Melde dich im geöffneten Fenster mit deinem Google-Konto an…',
    'Iniciá sesión con tu cuenta de Google en la ventana que se abrió…'
  ],
  signInOpening: [
    'Opening {service} sign-in in your browser…',
    'Die Anmeldung bei {service} wird im Browser geöffnet…',
    'Abriendo el login de {service} en el navegador…'
  ],
  disconnecting: [
    'Disconnecting…',
    'Verbindung wird getrennt…',
    'Desconectando…'
  ],
  likedTracks: [
    'Liked songs',
    'Lieblingstitel',
    'Temas favoritos'
  ],
  libraryYoutubeWelcome: [
    'Search for tracks, albums, artists or playlists above or use “+ Add from YouTube Music”. Sign in to see your favorites, playlists and mixes.',
    'Suche oben oder über „+ Aus YouTube Music hinzufügen“ nach Titeln, Alben, Künstlern oder Playlists. Melde dich an, um Favoriten, Playlists und Mixe zu sehen.',
    'YouTube Music suena desde el Winamp, sin abrir otra app. Buscá arriba (o con "+ Agregar desde YouTube Music") cualquier tema, disco, artista o playlist. Con "Iniciar sesión" aparecen tus favoritos, playlists y mixes.'
  ],
  librarySpotifyWelcome: [
    'Play music in Spotify for Windows and control it from Winamp. Use the Spotify button to connect your Premium account for search and your library.',
    'Spiele Musik in Spotify für Windows ab und steuere sie über Winamp. Verbinde über die Spotify-Schaltfläche dein Premium-Konto für die Suche und deine Mediathek.',
    'Elegí música en Spotify para Windows y controlala desde el Winamp. Para buscar temas y ver tu biblioteca desde acá, conectá tu cuenta Premium con el botón Spotify.'
  ],
  libraryTidalRemoteWelcome: [
    'Pick music in TIDAL and control it from Winamp. To enable search, choose “TIDAL…” above.',
    'Wähle Musik in TIDAL und steuere sie über Winamp. Die Suche kannst du oben über „TIDAL…“ aktivieren.',
    'Modo solo control remoto: elegí la música en la app de TIDAL y manejala desde el Winamp. Para buscar en TIDAL desde acá tocá "TIDAL…" arriba.'
  ],
  libraryTidalCatalogWelcome: [
    'Search above or use “+ Add from TIDAL” to play tracks, albums, artists or public playlists. Personal favorites, mixes and playlists require TIDAL to enable account sign-in for the app.',
    'Suche oben oder über „+ Aus TIDAL hinzufügen“ nach Titeln, Alben, Künstlern und öffentlichen Playlists. Persönliche Favoriten, Mixe und Playlists setzen voraus, dass TIDAL die Kontoanmeldung für die App freigibt.',
    'Modo catálogo: buscá arriba (o con "+ Agregar desde TIDAL") cualquier tema, disco, artista o playlist pública y reproducilo o sumalo a la playlist. Tus favoritos, mixes y playlists aparecen cuando TIDAL habilite el login de la app.'
  ],
  libraryTidalConnectWelcome: [
    'Choose “Connect TIDAL” to see your library. The Winamp controls are already available.',
    'Wähle „TIDAL verbinden“, um deine Mediathek zu sehen. Die Winamp-Steuerung kannst du bereits verwenden.',
    'Tocá "Conectar TIDAL" arriba para ver tu biblioteca. Los controles del Winamp ya funcionan sin conectar.'
  ],
  loading: [
    'Loading…',
    'Wird geladen…',
    'Cargando…'
  ],
  searchResultsFor: [
    'Search results for “{query}”',
    'Suchergebnisse für „{query}“',
    'Búsqueda: {query}'
  ],
  loadFailed: [
    'Could not load',
    'Laden fehlgeschlagen',
    'No se pudo cargar'
  ],
  play: [
    '▶ Play',
    '▶ Abspielen',
    '▶ Reproducir'
  ],
  shuffle: [
    '⤮ Shuffle',
    '⤮ Zufällig',
    '⤮ Aleatorio'
  ],
  addAll: [
    '+ Add all',
    '+ Alle hinzufügen',
    '+ Agregar todo'
  ],
  empty: [
    'Empty',
    'Leer',
    'Vacío'
  ],
  nothingHere: [
    'Nothing here yet',
    'Hier ist noch nichts',
    'Nada por acá todavía'
  ],
  tracks: [
    'Tracks',
    'Titel',
    'Temas'
  ],
  albums: [
    'Albums',
    'Alben',
    'Álbumes'
  ],
  artists: [
    'Artists',
    'Künstler',
    'Artistas'
  ],
  playlists: [
    'Playlists',
    'Playlists',
    'Playlists'
  ],
  mixes: [
    'Mixes for you',
    'Mixe für dich',
    'Mixes para vos'
  ],
  noResults: [
    'No results',
    'Keine Ergebnisse',
    'Sin resultados'
  ],
  noPlayback: [
    '{service} isn’t playing',
    '{service} spielt gerade nichts ab',
    '{service} no está reproduciendo'
  ],
  all: [
    'All',
    'Alle',
    'Todo'
  ],
  searchPlaceholder: [
    'Search tracks, albums, artists…',
    'Titel, Alben, Künstler suchen…',
    'Buscar temas, álbumes, artistas…'
  ],
  searchShortcuts: [
    '▶ Play · + Add to playlist · ↑↓ Select · Enter Open/play · Ctrl+Enter Add · Esc Close',
    '▶ Abspielen · + Zur Playlist · ↑↓ Auswählen · Enter Öffnen/Abspielen · Strg+Enter Hinzufügen · Esc Schließen',
    '▶ reproducir · + agregar a la playlist · ↑↓ elegir · Enter abrir/reproducir · Ctrl+Enter agregar · Esc cerrar'
  ],
  addFromHeading: [
    'Add from {service}',
    'Aus {service} hinzufügen',
    'AGREGAR DESDE {service}'
  ],
  enableSearch: [
    'Enable search…',
    'Suche aktivieren…',
    'Activar búsqueda…'
  ],
  enableSpotifySearch: [
    'Connect your Premium account to search and choose music from Spotify.',
    'Verbinde dein Premium-Konto, um in Spotify nach Musik zu suchen.',
    'Conectá tu cuenta Premium para buscar y elegir música de Spotify.'
  ],
  enableTidalSearch: [
    'Enable catalog mode to search and choose music from TIDAL.',
    'Aktiviere den Katalogmodus, um in TIDAL nach Musik zu suchen.',
    'Para buscar y elegir música de TIDAL desde acá, activá el modo catálogo.'
  ],
  yourLibrary: [
    'Your library',
    'Deine Mediathek',
    'Tu biblioteca'
  ],
  searching: [
    'Searching…',
    'Suche läuft…',
    'Buscando…'
  ],
  searchYoutubeHelp: [
    'Search above for tracks, albums, artists or playlists. Sign in from the Media Library to see your favorites and playlists.',
    'Suche oben nach Titeln, Alben, Künstlern oder Playlists. Melde dich in der Mediathek an, um Favoriten und Playlists zu sehen.',
    'Escribí arriba para buscar temas, discos, artistas o playlists. Iniciá sesión en la Media Library para ver tus favoritos y playlists.'
  ],
  searchTidalHelp: [
    'Search above for tracks, albums, artists or public playlists. Personal favorites, mixes and playlists require TIDAL to enable account sign-in for the app.',
    'Suche oben nach Titeln, Alben, Künstlern oder öffentlichen Playlists. Persönliche Favoriten, Mixe und Playlists setzen voraus, dass TIDAL die Kontoanmeldung für die App freigibt.',
    'Escribí arriba para buscar temas, discos, artistas o playlists públicas. Tus favoritos, mixes y playlists aparecen cuando TIDAL habilite el login de la app.'
  ],
  chooseFromLibrary: [
    'Choose from your library or search above',
    'Wähle aus deiner Mediathek oder suche oben',
    'ELEGÍ DE TU BIBLIOTECA O BUSCÁ ARRIBA'
  ],
  playAll: [
    '▶ Play all',
    '▶ Alle abspielen',
    '▶ Todo'
  ],
  playAllHint: [
    'Replace the playlist and play',
    'Playlist ersetzen und abspielen',
    'Reemplaza la playlist y reproduce'
  ],
  addAllHint: [
    'Add all to the end of the playlist',
    'Alle ans Ende der Playlist anhängen',
    'Agrega todo al final de la playlist'
  ],
  skinSearch: [
    'Search the Skin Museum (e.g. pioneer, matrix, kenwood)…',
    'Im Skin Museum suchen (z. B. pioneer, matrix, kenwood)…',
    'Buscar en el Skin Museum (ej: pioneer, matrix, kenwood)…'
  ],
  featuredSkins: [
    'Featured',
    'Empfohlen',
    'Destacados'
  ],
  skinFromFile: [
    'From file…',
    'Aus Datei…',
    'Desde archivo…'
  ],
  skinFromFileHint: [
    'Open a .wsz file on this PC',
    'Eine .wsz-Datei von diesem PC öffnen',
    'Cargar un .wsz de tu PC'
  ],
  defaultSkin: [
    'Default skin',
    'Standard-Skin',
    'Skin base'
  ],
  resetSkinHint: [
    'Restore the classic skin',
    'Den klassischen Skin wiederherstellen',
    'Volver al skin clásico'
  ],
  skinCacheHint: [
    'Click to apply · Skins are downloaded once and saved · ',
    'Zum Anwenden anklicken · Skins werden einmal heruntergeladen und gespeichert · ',
    'Clic para aplicar · se descargan una vez y quedan guardados · '
  ],
  searchingSkins: [
    'Searching for “{query}”…',
    'Suche nach „{query}“…',
    'Buscando “{query}”…'
  ],
  skinMuseumUnavailable: [
    'Could not connect to the Skin Museum',
    'Verbindung zum Skin Museum fehlgeschlagen',
    'No se pudo conectar con el Skin Museum'
  ],
  openSpotify: [
    'Open in Spotify',
    'In Spotify öffnen',
    'Abrir en Spotify'
  ],
  removeFavorite: [
    'Remove from favorites',
    'Aus Favoriten entfernen',
    'Quitar de favoritos'
  ],
  addFavorite: [
    'Add to favorites',
    'Zu Favoriten hinzufügen',
    'Agregar a favoritos'
  ],
  playItem: [
    'Play {item}',
    '{item} abspielen',
    'Reproducir {item}'
  ],
  addItem: [
    'Add {item} to the playlist',
    '{item} zur Playlist hinzufügen',
    'Agregar {item} a la playlist'
  ],
  theTrack: [
    'track',
    'Titel',
    'el tema'
  ],
  theAlbum: [
    'album',
    'Album',
    'el álbum'
  ],
  thePlaylist: [
    'playlist',
    'Playlist',
    'la playlist'
  ],
  theMix: [
    'mix',
    'Mix',
    'el mix'
  ],
  artistTracks: [
    'artist’s tracks',
    'Titel des Künstlers',
    'los temas del artista'
  ],
  doubleClickPlay: [
    'Double-click to play',
    'Doppelklick zum Abspielen',
    'Doble click: reproducir'
  ],
  clickOpenTracks: [
    'Click to view tracks',
    'Anklicken, um Titel anzuzeigen',
    'Click: ver temas'
  ],
  trackCount: [
    '{count} tracks',
    '{count} Titel',
    '{count} temas'
  ],
  webampUnsupported: [
    'Webamp isn’t supported in this environment.',
    'Webamp wird in dieser Umgebung nicht unterstützt.',
    'Webamp no es compatible con este entorno.'
  ],
  zoomLevel: [
    'Zoom {percent}%',
    'Zoom {percent}%',
    'Tamaño {percent}%'
  ],
  signInTimeout: [
    'Sign-in timed out',
    'Zeitüberschreitung bei der Anmeldung',
    'Login timed out'
  ],
  closeTab: [
    'You can close this tab now.',
    'Du kannst diesen Tab jetzt schließen.',
    'Ya podés cerrar esta pestaña.'
  ],
  signInFailed: [
    'Could not sign in.',
    'Anmeldung fehlgeschlagen.',
    'No se pudo iniciar sesión.'
  ],
  signInSuccess: [
    'Signed in successfully ✔',
    'Anmeldung erfolgreich ✔',
    'Login correcto ✔'
  ],
  oauthSignInError: [
    'Sign-in failed ({reason})',
    'Anmeldung fehlgeschlagen ({reason})',
    'Login failed: {reason}'
  ],
  oauthInvalidResponse: [
    'invalid response',
    'ungültige Antwort',
    'invalid response'
  ],
  oauthTokenError: [
    'Could not obtain an access token ({status}). {details}',
    'Zugriffstoken konnte nicht abgerufen werden ({status}). {details}',
    'Token request failed ({status}): {details}'
  ],
  oauthMissingRefresh: [
    'Please sign in again.',
    'Bitte melde dich erneut an.',
    'No refresh token; please log in again'
  ],
  loginSuperseded: [
    'This sign-in was superseded by a newer request.',
    'Eine neuere Anfrage hat diese Anmeldung ersetzt.',
    'Login was superseded'
  ],
  notSignedIn: [
    'Sign in to continue.',
    'Melde dich an, um fortzufahren.',
    'Not logged in'
  ],
  sessionChanged: [
    'Your sign-in session changed. Try again.',
    'Deine Anmeldung hat sich geändert. Versuche es erneut.',
    'Session changed during refresh'
  ],
  sessionExpired: [
    'Your session expired. Please reconnect. ({reason})',
    'Deine Sitzung ist abgelaufen. Bitte verbinde dein Konto erneut. ({reason})',
    'Session expired, please reconnect ({reason})'
  ],
  sessionChangedDuringRequest: [
    'Your sign-in session changed. Try again.',
    'Deine Anmeldung hat sich geändert. Versuche es erneut.',
    'Session changed during request'
  ],
  credentialsRejected: [
    'The developer credentials were rejected ({status}). {details}',
    'Die Entwickler-Zugangsdaten wurden abgelehnt ({status}). {details}',
    'Client credentials rejected ({status}): {details}'
  ],
  encryptionUnavailable: [
    'Windows can’t encrypt data for this account.',
    'Windows kann Daten für dieses Konto nicht verschlüsseln.',
    'Windows no permite cifrar datos en esta cuenta'
  ],
  tidalOnly: [
    'This option is only available for TIDAL.',
    'Diese Option ist nur für TIDAL verfügbar.',
    'Esto solo aplica a TIDAL'
  ],
  youtubeOnly: [
    'This option is only available for YouTube Music.',
    'Diese Option ist nur für YouTube Music verfügbar.',
    'Esto solo aplica a YouTube Music'
  ],
  unknownService: [
    'Unknown music service',
    'Unbekannter Musikdienst',
    'Servicio desconocido'
  ],
  skinSearchFailed: [
    'Could not search the Skin Museum ({status}).',
    'Suche im Skin Museum fehlgeschlagen ({status}).',
    'No se pudo buscar en el Skin Museum ({status})'
  ],
  spotifyIdInvalid: [
    'Invalid Spotify ID',
    'Ungültige Spotify-ID',
    'ID de Spotify inválido'
  ],
  spotifyClientIdInvalid: [
    'Enter a valid Client ID from the Spotify Developer Dashboard.',
    'Gib eine gültige Client ID aus dem Spotify Developer Dashboard ein.',
    'Ingresá un Client ID válido del Spotify Developer Dashboard.'
  ],
  spotifySignInPending: [
    'Spotify sign-in is already in progress.',
    'Die Spotify-Anmeldung läuft bereits.',
    'Ya hay un inicio de sesión de Spotify en curso.'
  ],
  spotifyConnectFirst: [
    'Connect Spotify from the Media Library.',
    'Verbinde Spotify in der Mediathek.',
    'Conectá Spotify desde la Media Library.'
  ],
  spotifyActivateDevice: [
    'Open Spotify on this PC with the same account and play a song to activate the device.',
    'Öffne Spotify auf diesem PC mit demselben Konto und spiele einen Titel ab, um das Gerät zu aktivieren.',
    'Abrí Spotify en esta PC con la misma cuenta y reproducí un tema para activar el dispositivo.'
  ],
  spotifyActivateRemote: [
    'Open Spotify for Windows and play a song to enable remote control.',
    'Öffne Spotify für Windows und spiele einen Titel ab, um die Fernsteuerung zu aktivieren.',
    'Abrí Spotify en Windows y reproducí un tema para activar el control remoto.'
  ],
  tidalNeedsSignIn: [
    'Access to your library requires TIDAL account sign-in. TIDAL must enable sign-in for the app first.',
    'Für deine Mediathek brauchst du eine TIDAL-Anmeldung. TIDAL muss die Anmeldung für die App zuerst freigeben.',
    'Tu biblioteca necesita el login de TIDAL (pendiente de que TIDAL habilite la app)'
  ],
  tidalNeedsCatalog: [
    'To search TIDAL, enable catalog mode using “TIDAL…” in the Media Library.',
    'Aktiviere über „TIDAL…“ in der Mediathek den Katalogmodus, um in TIDAL zu suchen.',
    'Para buscar en TIDAL activá el modo catálogo con el botón "TIDAL…" de la Media Library'
  ],
  tidalNeedsCredentials: [
    'Paste the Client ID and Client Secret for your TIDAL developer app.',
    'Füge die Client ID und das Client Secret deiner TIDAL-Entwickler-App ein.',
    'Pegá el Client ID y el Client Secret de tu app de TIDAL'
  ],
  tidalInvalidCredentials: [
    'TIDAL rejected the Client ID or Client Secret. Check that you copied both correctly.',
    'TIDAL hat die Client ID oder das Client Secret abgelehnt. Prüfe, ob du beide korrekt kopiert hast.',
    'TIDAL no aceptó ese Client ID / Client Secret. Revisá que estén bien copiados.'
  ],
  albumFallback: [
    'Album',
    'Album',
    'Álbum'
  ],
  youtubeNeedsSignIn: [
    'Sign in to YouTube Music to see your library.',
    'Melde dich bei YouTube Music an, um deine Mediathek zu sehen.',
    'Iniciá sesión en YouTube Music para ver tu biblioteca'
  ],
  youtubeLoadFailed: [
    'YouTube Music could not load. Check your internet connection.',
    'YouTube Music konnte nicht geladen werden. Prüfe deine Internetverbindung.',
    'YouTube Music no cargó. Revisá la conexión a internet.'
  ],
  youtubeClosed: [
    'YouTube Music is closed.',
    'YouTube Music ist geschlossen.',
    'YouTube Music no está abierto'
  ],
  signInCancelled: [
    'Sign-in was canceled.',
    'Die Anmeldung wurde abgebrochen.',
    'Inicio de sesión cancelado'
  ],
  youtubeMissingCookie: [
    'The SAPISID cookie is missing. Sign in to YouTube Music in your browser and copy the entire cookie value.',
    'Das SAPISID-Cookie fehlt. Melde dich im Browser bei YouTube Music an und kopiere den vollständigen Cookie-Wert.',
    'Eso no tiene la sesión de YouTube (falta la cookie SAPISID). Revisá que estés logueado y copiá todo.'
  ],
  searchCollection: [
    'Albums (CDs)',
    'Alben (CDs)',
    'ÁLBUMES (CD)'
  ],
  openSkins: [
    'Skins',
    'Skins',
    'SKINS'
  ],
  searchResultSkins: [
    '“{query}” · {count} skins',
    '„{query}“ · {count} Skins',
    '“{query}” · {count} skins'
  ],
} satisfies Record<string, [string, string, string]>

export type MessageKey = keyof typeof messages

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const message = messages[key][LANGUAGE_INDEX[language]]
  return params ? message.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : placeholder
  ) : message
}
