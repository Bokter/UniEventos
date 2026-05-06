import MuxPlayer from "@mux/mux-player-react";

interface LiveStreamPlayerProps {
  playbackId: string;
  status: string;
}

export function LiveStreamPlayer({ playbackId, status }: LiveStreamPlayerProps) {
  const isMock = playbackId.startsWith('mock_');

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

  // Reproductor real de Mux usando el componente React oficial
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <MuxPlayer
        streamType="live"
        playbackId={playbackId}
        metadataVideoTitle="Live Stream"
        primaryColor="#1D9E75"
        secondaryColor="#FFFFFF"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}