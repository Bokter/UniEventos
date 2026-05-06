import { useEffect, useRef } from 'react';

interface LiveStreamPlayerProps {
  playbackId: string;
  status: string;
}

export function LiveStreamPlayer({ playbackId, status }: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMock = playbackId.startsWith('mock_');

  // COMENTADO - Puede causar error al cargar script externo de Mux
  // TODO: Descomentar cuando se configure integración con Mux
  /*
  useEffect(() => {
    if (isMock) return; // Don't load Mux player for mock streams

    // Load Mux player script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mux/mux-player';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isMock]);
  */

  if (isMock) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
        <div className="text-center max-w-md px-4">
          <div className="mb-4 text-4xl">🎥</div>
          <p className="text-lg font-semibold mb-2">Modo Demo</p>
          <p className="text-sm text-gray-400">
            Esta es una transmisión de demostración. Para usar transmisiones en vivo reales, 
            configura tus credenciales de Mux en los secretos de Supabase (MUX_TOKEN_ID y MUX_TOKEN_SECRET).
          </p>
        </div>
      </div>
    );
  }

  if (status === 'idle') {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold">Esperando transmisión...</p>
          <p className="text-sm text-gray-400 mt-2">El organizador aún no ha iniciado la transmisión</p>
        </div>
      </div>
    );
  }

  // COMENTADO - El elemento mux-player requiere script externo
  // TODO: Descomentar cuando se configure integración con Mux
  /*
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <mux-player
        ref={videoRef}
        stream-type="live"
        playback-id={playbackId}
        metadata-video-title="Live Stream"
        primary-color="#1D9E75"
        secondary-color="#FFFFFF"
        style={{ width: '100%', height: '100%' }}
      ></mux-player>
    </div>
  );
  */
  
  // Placeholder temporal hasta configurar Mux
  return (
    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
      <div className="text-center max-w-md px-4">
        <div className="mb-4 text-4xl">📡</div>
        <p className="text-lg font-semibold mb-2">Transmisión en Vivo</p>
        <p className="text-sm text-gray-400">
          El reproductor de video aparecerá aquí cuando se configure la integración con Mux.
        </p>
      </div>
    </div>
  );
}