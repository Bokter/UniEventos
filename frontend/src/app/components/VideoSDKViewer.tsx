import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Radio, Tv, AlertCircle } from "lucide-react";

interface VideoSDKViewerProps {
  meetingId: string;
  estado: "idle" | "live" | "ended";
  hlsUrl: string | null;
}

function HlsPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  // El autoplay en móvil (iOS/Android) solo se permite si el video está silenciado.
  // Arrancamos muteado para garantizar la reproducción del vivo y ofrecemos
  // un botón para activar el sonido.
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
    if (!next) video.play().catch(() => {});
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const initPlayer = () => {
      setHasError(false);
      // Imprescindible para autoplay en móvil: muteado + inline.
      video.muted = true;
      video.playsInline = true;
      setIsMuted(true);

      // Soporte nativo para HLS (Safari/iOS)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((err) => console.log("Autoplay bloqueado:", err));
        });
      }
      // Soporte usando hls.js (Chrome, Firefox, Edge, etc.)
      else if (Hls.isSupported()) {
        hls = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((err) => console.log("Autoplay bloqueado:", err));
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && data.response?.code === 404) {
              setHasError(true);
              return;
            }
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("Error fatal de red en HLS, intentando recuperar...", data);
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("Error fatal de medios en HLS, intentando recuperar...", data);
                hls?.recoverMediaError();
                break;
              default:
                console.error("Error fatal HLS no recuperable:", data);
                setHasError(true);
                break;
            }
          }
        });
      } else {
        setHasError(true);
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950 text-zinc-400 p-4">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2 stroke-[1.5]" />
        <p className="text-sm font-semibold">La señal en vivo no está disponible</p>
        <p className="text-xs text-zinc-600 mt-1">
          El organizador puede haber pausado o finalizado. Actualiza la página en unos segundos.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        autoPlay
        muted
        className="w-full h-full object-contain"
      />
      <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-red-600/20">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        EN VIVO
      </div>
      {isMuted && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg hover:bg-black/90"
        >
          🔊 Activar sonido
        </button>
      )}
    </div>
  );
}

export function VideoSDKViewer({ meetingId, estado, hlsUrl }: VideoSDKViewerProps) {
  // Estado "idle"
  if (estado === "idle") {
    return (
      <div className="aspect-video bg-zinc-950 rounded-2xl flex flex-col items-center justify-center text-zinc-400 border border-zinc-900 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/10 to-transparent pointer-events-none" />
        <div className="text-center z-10 p-6">
          <div className="relative w-16 h-16 bg-violet-600/10 border border-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
            <Tv className="h-7 w-7 text-violet-500 stroke-[1.5]" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-zinc-950 animate-pulse" />
          </div>
          <h4 className="text-lg font-bold text-white">Transmisión Programada</h4>
          <p className="text-sm text-zinc-500 max-w-sm mt-2 mx-auto">
            El organizador ha preparado la sala. La transmisión comenzará tan pronto como el organizador inicie el stream.
          </p>
        </div>
      </div>
    );
  }

  // Estado "ended"
  if (estado === "ended") {
    return (
      <div className="aspect-video bg-zinc-950 rounded-2xl flex flex-col items-center justify-center text-zinc-500 border border-zinc-900 shadow-2xl relative overflow-hidden">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radio className="h-7 w-7 text-zinc-600 stroke-[1.5]" />
          </div>
          <h4 className="text-lg font-bold text-zinc-300">Transmisión Finalizada</h4>
          <p className="text-sm text-zinc-600 max-w-sm mt-2 mx-auto">
            Esta transmisión ha terminado. ¡Gracias por asistir!
          </p>
        </div>
      </div>
    );
  }

  // Estado "live" pero URL no disponible todavía
  if (estado === "live" && !hlsUrl) {
    return (
      <div className="aspect-video bg-zinc-950 rounded-2xl flex flex-col items-center justify-center text-zinc-400 border border-zinc-900 shadow-2xl">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4" />
          <h4 className="text-md font-semibold text-white">Conectando con el en vivo...</h4>
          <p className="text-xs text-zinc-600 mt-2">
            La señal se está preparando. Esto puede tomar unos segundos.
          </p>
        </div>
      </div>
    );
  }

  // Estado "live" y listo para reproducir
  return (
    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-900 relative">
      <HlsPlayer url={hlsUrl!} />
    </div>
  );
}
