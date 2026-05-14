import ReactPlayer from "react-player";

interface LiveStreamPlayerProps {
  url: string;
}

export function LiveStreamPlayer({ url }: LiveStreamPlayerProps) {
  if (!url) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Sin transmisión</p>
          <p className="text-sm text-gray-400 mt-2">No se ha proporcionado un enlace de transmisión para este evento</p>
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