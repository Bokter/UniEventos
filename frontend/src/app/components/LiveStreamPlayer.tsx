import { VideoSDKViewer } from "./VideoSDKViewer";
import ReactPlayer from "react-player";

interface LiveStreamPlayerProps {
  meetingId?: string | null;
  estado?: "idle" | "live" | "ended";
  hlsUrl?: string | null;
  url?: string;
}

export function LiveStreamPlayer({ meetingId, estado = "idle", hlsUrl, url }: LiveStreamPlayerProps) {
  // Si tenemos un meetingId, renderizamos el visor nativo de VideoSDK con HLS
  if (meetingId) {
    return <VideoSDKViewer meetingId={meetingId} estado={estado} hlsUrl={hlsUrl} />;
  }

  if (!url) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Sin transmisión</p>
          <p className="text-sm text-gray-400 mt-2">No se ha iniciado una transmisión en vivo para este evento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        playing={false}
        config={{
          youtube: {
            playerVars: { showinfo: 1, origin: typeof window !== 'undefined' ? window.location.origin : '' }
          }
        }}
      />
    </div>
  );
}