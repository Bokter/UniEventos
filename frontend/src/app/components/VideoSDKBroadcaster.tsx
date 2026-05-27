import React, { useCallback, useEffect, useRef, useState } from "react";
import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { Video, VideoOff, Mic, MicOff, Tv, Power, Radio } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { eventosApi } from "../services/api.service";

interface VideoSDKBroadcasterProps {
  meetingId: string;
  token: string;
  eventoId: number;
  sessionKey: string;
  onClose: () => void;
}

function ParticipantView({ participantId }: { participantId: string }) {
  const { webcamStream, webcamOn, micOn } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (webcamOn && webcamStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => console.error("Error al reproducir video:", err));
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-zinc-950 aspect-video w-full shadow-lg border border-zinc-800">
      {webcamOn ? (
        <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" playsInline muted autoPlay />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full text-zinc-400 bg-zinc-900">
          <VideoOff className="h-12 w-12 mb-2 stroke-[1.5]" />
          <span className="text-sm">La cámara está desactivada</span>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${micOn ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        Tú (Organizador)
      </div>
    </div>
  );
}

function resolveHlsPlaybackUrl(hlsUrls: {
  playbackHlsUrl?: string;
  livestreamUrl?: string;
  downstreamUrl?: string;
} | null | undefined): string | null {
  if (!hlsUrls) return null;
  return hlsUrls.playbackHlsUrl ?? hlsUrls.livestreamUrl ?? hlsUrls.downstreamUrl ?? null;
}

function isHlsLiveState(state: string | null | undefined): boolean {
  return state === "HLS_STARTED" || state === "HLS_PLAYABLE" || state === "HLS_STARTING";
}

function MeetingControls({
  eventoId,
  onClose,
}: {
  eventoId: number;
  onClose: () => void;
}) {
  const {
    join,
    leave,
    localParticipant,
    startHls,
    stopHls,
    hlsState,
    hlsUrls,
    toggleWebcam,
    toggleMic,
  } = useMeeting();

  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const isUpdatingBackendRef = useRef(false);
  const prevHlsStateRef = useRef<string | null>(null);
  const userEndedHlsRef = useRef(false);
  const isUnmountingRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const hlsStateRef = useRef(hlsState);
  const localParticipantRef = useRef(localParticipant);

  useEffect(() => {
    hlsStateRef.current = hlsState;
  }, [hlsState]);

  useEffect(() => {
    localParticipantRef.current = localParticipant;
  }, [localParticipant]);

  useEffect(() => {
    if (localParticipant) {
      setIsCamOn(localParticipant.webcamOn);
      setIsMicOn(localParticipant.micOn);
    }
  }, [localParticipant?.webcamOn, localParticipant?.micOn, localParticipant]);

  const syncBackendEstado = useCallback(
    async (estado: "idle" | "live" | "ended", hlsUrl?: string | null) => {
      if (isUpdatingBackendRef.current) return;
      isUpdatingBackendRef.current = true;
      try {
        await eventosApi.actualizarEstadoStream(eventoId, estado, hlsUrl);
      } catch (error) {
        console.error("Error al sincronizar estado de transmisión:", error);
        throw error;
      } finally {
        isUpdatingBackendRef.current = false;
      }
    },
    [eventoId],
  );

  useEffect(() => {
    join();
    hasJoinedRef.current = true;

    return () => {
      void (async () => {
        isUnmountingRef.current = true;
        const state = hlsStateRef.current;
        const participant = localParticipantRef.current;

        if (isHlsLiveState(state)) {
          try {
            stopHls();
          } catch {
            /* ignore */
          }
        }

        if (participant?.webcamOn) toggleWebcam();
        if (participant?.micOn) toggleMic();

        try {
          leave();
        } catch {
          /* ignore */
        }

        if (!userEndedHlsRef.current) {
          try {
            await syncBackendEstado("idle", null);
          } catch {
            /* ignore */
          }
        }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prev = prevHlsStateRef.current;
    prevHlsStateRef.current = hlsState;

    const syncHlsWithBackend = async () => {
      if (isUnmountingRef.current) return;

      const playbackUrl = resolveHlsPlaybackUrl(hlsUrls);
      const isPlayable = hlsState === "HLS_STARTED" || hlsState === "HLS_PLAYABLE";

      if (isPlayable && playbackUrl) {
        try {
          await syncBackendEstado("live", playbackUrl);
          if (hlsState === "HLS_PLAYABLE" && prev !== "HLS_PLAYABLE") {
            toast.success("¡Transmisión EN VIVO publicada para los asistentes!");
          }
        } catch {
          toast.error("Error al actualizar estado en el servidor");
        }
        return;
      }

      const wasLive =
        prev === "HLS_STARTED" || prev === "HLS_STARTING" || prev === "HLS_PLAYABLE";
      if (hlsState === "HLS_STOPPED" && wasLive && userEndedHlsRef.current) {
        userEndedHlsRef.current = false;
        try {
          await syncBackendEstado("ended", null);
          toast.info("Transmisión detenida para los espectadores");
        } catch {
          console.error("Error al finalizar stream en backend");
        }
      }
    };

    syncHlsWithBackend();
  }, [hlsState, hlsUrls, syncBackendEstado]);

  const releaseMediaAndLeave = useCallback(async () => {
    if (!hasJoinedRef.current) return;

    isUnmountingRef.current = true;

    if (isHlsLiveState(hlsState)) {
      try {
        stopHls();
      } catch {
        /* sala ya desconectada */
      }
    }

    if (localParticipant?.webcamOn) {
      toggleWebcam();
    }
    if (localParticipant?.micOn) {
      toggleMic();
    }

    try {
      leave();
    } catch {
      /* ignore */
    }

    hasJoinedRef.current = false;

    if (!userEndedHlsRef.current) {
      try {
        await syncBackendEstado("idle", null);
      } catch {
        /* ignore al cerrar */
      }
    }
  }, [hlsState, localParticipant, stopHls, toggleWebcam, toggleMic, leave, syncBackendEstado]);

  const handleExit = async () => {
    await releaseMediaAndLeave();
    onClose();
  };

  const handleToggleWebcam = () => {
    toggleWebcam();
    setIsCamOn((prev) => !prev);
  };

  const handleToggleMic = () => {
    toggleMic();
    setIsMicOn((prev) => !prev);
  };

  const handleStartTransmitting = () => {
    if (hlsState === "HLS_STATE_NOT_STARTED" || hlsState === "HLS_STOPPED") {
      toast.info("Iniciando transmisión HLS...");
      startHls({
        layout: {
          type: "GRID",
          priority: "SPEAKER",
          gridSize: 4,
        },
        theme: "DARK",
        mode: "video-and-audio",
      });
    }
  };

  const handleStopTransmitting = () => {
    if (!isHlsLiveState(hlsState) || hlsState === "HLS_STARTING" || hlsState === "HLS_STOPPING") {
      return;
    }
    if (confirm("¿Detener la transmisión en vivo? Los espectadores dejarán de ver el stream.")) {
      userEndedHlsRef.current = true;
      toast.info("Deteniendo transmisión...");
      stopHls();
    }
  };

  const isLive = hlsState === "HLS_STARTED" || hlsState === "HLS_PLAYABLE";

  return (
    <div className="flex flex-col gap-6">
      {localParticipant ? (
        <ParticipantView participantId={localParticipant.id} />
      ) : (
        <div className="flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 aspect-video w-full text-zinc-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3" />
            <p className="text-sm">Iniciando cámara y micrófono...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleWebcam}
            className={`rounded-full h-12 w-12 border-zinc-800 ${isCamOn ? "bg-zinc-800 text-white" : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"}`}
          >
            {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleMic}
            className={`rounded-full h-12 w-12 border-zinc-800 ${isMicOn ? "bg-zinc-800 text-white" : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"}`}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isLive ? (
            <Button
              variant="destructive"
              onClick={handleStopTransmitting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
              <Radio className="h-4 w-4 animate-pulse text-white" />
              Detener Transmisión
            </Button>
          ) : (
            <Button
              onClick={handleStartTransmitting}
              disabled={hlsState === "HLS_STARTING" || hlsState === "HLS_STOPPING"}
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <Tv className="h-4 w-4" />
              {hlsState === "HLS_STARTING" ? "Iniciando..." : hlsState === "HLS_STOPPING" ? "Deteniendo..." : "Transmitir en Vivo"}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={handleExit}
            className="text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800 hover:bg-zinc-800/40 rounded-full px-4"
          >
            <Power className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>

      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-300">Estado VideoSDK:</span>
          <span>
            {(hlsState === "HLS_STATE_NOT_STARTED" || hlsState === "HLS_STOPPED") && "Preparado"}
            {hlsState === "HLS_STARTING" && "Iniciando HLS..."}
            {isLive && "Transmitiendo en Vivo"}
            {hlsState === "HLS_STOPPING" && "Deteniendo HLS..."}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${isLive ? "bg-red-500 animate-ping" : "bg-zinc-600"}`}
          />
          {isLive ? "LIVE" : "STANDBY"}
        </div>
      </div>
    </div>
  );
}

export function VideoSDKBroadcaster({
  meetingId,
  token,
  eventoId,
  sessionKey,
  onClose,
}: VideoSDKBroadcasterProps) {
  if (!token || token === "mock-token" || meetingId === "mock-room-id") {
    return (
      <div className="p-6 text-center text-zinc-300">
        <p className="font-semibold text-white mb-2">Transmisión en vivo no disponible</p>
        <p className="text-sm text-zinc-400">
          Configura <code className="text-violet-400">VIDEOSDK_API_KEY</code> y{" "}
          <code className="text-violet-400">VIDEOSDK_SECRET_KEY</code> en el backend y vuelve a crear la sala.
        </p>
        <Button variant="ghost" onClick={onClose} className="mt-4 text-zinc-400">
          Cerrar
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl shadow-2xl max-w-3xl mx-auto w-full text-white">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="h-5 w-5 text-violet-500" />
            Panel del Transmisor
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Sala ID: {meetingId}</p>
        </div>
        <div className="bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full text-xs font-semibold text-violet-400 animate-pulse">
          Transmisión en vivo
        </div>
      </div>

      <MeetingProvider
        key={sessionKey}
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: true,
          name: "Organizador",
          mode: "SEND_AND_RECV",
        }}
        token={token}
        joinWithoutUserInteraction
      >
        <MeetingControls eventoId={eventoId} onClose={onClose} />
      </MeetingProvider>
    </div>
  );
}
