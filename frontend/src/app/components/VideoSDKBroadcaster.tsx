import React, { useCallback, useEffect, useRef, useState } from "react";
import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { Video, VideoOff, Mic, MicOff, Tv, Power, Radio, SwitchCamera } from "lucide-react";
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
  selectedCamId,
  selectedMicId,
}: {
  eventoId: number;
  onClose: () => void;
  selectedCamId?: string;
  selectedMicId?: string;
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
    changeWebcam,
    changeMic,
  } = useMeeting();

  // Aplica la cámara/micrófono elegidos en el lobby una vez unidos a la sala.
  // Es tolerante a fallos: si falla o la API no existe, la sala sigue
  // funcionando con el dispositivo por defecto (el flujo ya probado).
  const devicesAppliedRef = useRef(false);
  useEffect(() => {
    // Aplicamos la cámara/micrófono elegidos SOLO cuando la webcam ya está
    // encendida; si lo hacemos antes, VideoSDK ignora el cambio y deja la cámara
    // por defecto (frontal en móvil). Reintentamos un par de veces por si la
    // pista tarda en estar lista.
    if (devicesAppliedRef.current) return;
    if (!localParticipant?.webcamOn) return;
    devicesAppliedRef.current = true;

    let attempts = 0;
    const apply = () => {
      attempts += 1;
      if (selectedCamId && typeof changeWebcam === "function") {
        try {
          changeWebcam(selectedCamId);
        } catch (err) {
          console.error("No se pudo aplicar la cámara seleccionada:", err);
        }
      }
      if (selectedMicId && typeof changeMic === "function") {
        try {
          changeMic(selectedMicId);
        } catch (err) {
          console.error("No se pudo aplicar el micrófono seleccionado:", err);
        }
      }
      // Reintento: a veces el primer changeWebcam no "engancha" en móvil.
      if (attempts < 3) setTimeout(apply, 700);
    };
    const t = setTimeout(apply, 400);

    return () => clearTimeout(t);
  }, [localParticipant?.webcamOn, selectedCamId, selectedMicId, changeWebcam, changeMic]);

  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  // Lista de cámaras disponibles para alternar frontal/trasera en móvil.
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [camIndex, setCamIndex] = useState(0);
  const [isSwitchingCam, setIsSwitchingCam] = useState(false);

  useEffect(() => {
    if (!localParticipant?.webcamOn) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((ds) => setCameras(ds.filter((d) => d.kind === "videoinput")))
      .catch(() => {});
  }, [localParticipant?.webcamOn]);

  const handleSwitchCamera = async () => {
    if (cameras.length < 2 || isSwitchingCam) return;
    const next = (camIndex + 1) % cameras.length;
    setIsSwitchingCam(true);
    try {
      changeWebcam(cameras[next].deviceId);
      setCamIndex(next);
    } catch (err) {
      console.error("No se pudo alternar la cámara:", err);
    } finally {
      // Pequeño bloqueo para evitar toques repetidos mientras VideoSDK cambia.
      setTimeout(() => setIsSwitchingCam(false), 800);
    }
  };

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
      // Solo publicamos a los asistentes cuando el stream está realmente reproducible
      // y existe una URL: HLS_STARTED puede devolver 404 todavía y deja al viewer
      // "cargando" o reintentando.
      const isPlayable = hlsState === "HLS_PLAYABLE";

      if (isPlayable && playbackUrl) {
        try {
          await syncBackendEstado("live", playbackUrl);
          if (prev !== "HLS_PLAYABLE") {
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

          {cameras.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwitchCamera}
              disabled={isSwitchingCam || !isCamOn}
              title="Cambiar entre cámara frontal y trasera"
              className="rounded-full h-12 w-12 border-zinc-800 bg-zinc-800 text-white disabled:opacity-50"
            >
              <SwitchCamera className="h-5 w-5" />
            </Button>
          )}
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

/**
 * Sala de espera previa: solicita permisos de cámara/micrófono, muestra una
 * previsualización y deja elegir qué dispositivo usar antes de entrar a la sala.
 */
function Lobby({
  meetingId,
  onJoin,
  onCancel,
}: {
  meetingId: string;
  onJoin: (selection: { camId: string; micId: string }) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [camId, setCamId] = useState<string>("");
  const [micId, setMicId] = useState<string>("");
  const [permission, setPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [error, setError] = useState<string | null>(null);

  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startPreview = useCallback(
    async (deviceId?: string, audioDeviceId?: string) => {
      try {
        stopPreview();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPermission("granted");
        setError(null);

        // enumerateDevices solo expone labels tras conceder permisos.
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === "videoinput");
        const ms = devices.filter((d) => d.kind === "audioinput");
        setCameras(cams);
        setMics(ms);

        const activeCam = stream.getVideoTracks()[0]?.getSettings().deviceId;
        const activeMic = stream.getAudioTracks()[0]?.getSettings().deviceId;
        setCamId(deviceId || activeCam || cams[0]?.deviceId || "");
        setMicId(audioDeviceId || activeMic || ms[0]?.deviceId || "");
      } catch (err) {
        console.error("Error al solicitar permisos de medios:", err);
        setPermission("denied");
        setError(
          "No se pudo acceder a la cámara o al micrófono. Concede los permisos en el navegador y vuelve a intentarlo.",
        );
      }
    },
    [stopPreview],
  );

  useEffect(() => {
    void startPreview();
    return () => stopPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCamChange = (id: string) => {
    setCamId(id);
    void startPreview(id, micId || undefined);
  };

  const handleMicChange = (id: string) => {
    setMicId(id);
    void startPreview(camId || undefined, id);
  };

  const handleJoin = () => {
    stopPreview();
    onJoin({ camId, micId });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="relative rounded-xl overflow-hidden bg-zinc-950 aspect-video w-full shadow-lg border border-zinc-800">
        {permission === "granted" ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover transform scale-x-[-1]"
            playsInline
            muted
            autoPlay
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-zinc-400 bg-zinc-900 px-6 text-center">
            {permission === "denied" ? (
              <>
                <VideoOff className="h-12 w-12 mb-2 stroke-[1.5] text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3" />
                <span className="text-sm">Solicitando permisos de cámara y micrófono…</span>
              </>
            )}
          </div>
        )}
      </div>

      {permission === "granted" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Video className="h-3.5 w-3.5" /> Cámara
            </span>
            <select
              value={camId}
              onChange={(e) => handleCamChange(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {cameras.map((c, i) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Cámara ${i + 1}`}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Mic className="h-3.5 w-3.5" /> Micrófono
            </span>
            <select
              value={micId}
              onChange={(e) => handleMicChange(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {mics.map((m, i) => (
                <option key={m.deviceId} value={m.deviceId}>
                  {m.label || `Micrófono ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <Button
          variant="ghost"
          onClick={() => {
            stopPreview();
            onCancel();
          }}
          className="text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800 hover:bg-zinc-800/40 rounded-full px-4"
        >
          Cancelar
        </Button>

        {permission === "denied" ? (
          <Button
            onClick={() => void startPreview()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-6 py-2.5 rounded-full"
          >
            Reintentar permisos
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={permission !== "granted"}
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-violet-600/20 disabled:opacity-50"
          >
            <Tv className="h-4 w-4" />
            Entrar a la sala
          </Button>
        )}
      </div>
      <p className="text-[11px] text-zinc-500 text-center">Sala ID: {meetingId}</p>
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
  const [phase, setPhase] = useState<"setup" | "connecting" | "live">("setup");
  const [devices, setDevices] = useState<{ camId: string; micId: string } | null>(null);

  // Tras salir del lobby esperamos un instante a que el navegador libere
  // la cámara/micrófono del preview antes de que el SDK los vuelva a tomar.
  // Sin esta pausa, el SDK recibe NotReadableError y la webcam nunca enciende.
  useEffect(() => {
    if (phase !== "connecting") return;
    const t = setTimeout(() => setPhase("live"), 500);
    return () => clearTimeout(t);
  }, [phase]);

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
          <p className="text-xs text-zinc-400 mt-1">
            {phase === "live" ? `Sala ID: ${meetingId}` : "Configura tu cámara antes de entrar"}
          </p>
        </div>
        <div className="bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full text-xs font-semibold text-violet-400">
          {phase === "live" ? "Transmisión en vivo" : "Preparando"}
        </div>
      </div>

      {phase === "setup" ? (
        <Lobby
          meetingId={meetingId}
          onCancel={onClose}
          onJoin={(selection) => {
            setDevices(selection);
            setPhase("connecting");
          }}
        />
      ) : phase === "connecting" ? (
        <div className="flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 aspect-video w-full text-zinc-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3" />
            <p className="text-sm">Conectando a la sala…</p>
          </div>
        </div>
      ) : (
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
        >
          <MeetingControls
            eventoId={eventoId}
            onClose={onClose}
            selectedCamId={devices?.camId}
            selectedMicId={devices?.micId}
          />
        </MeetingProvider>
      )}
    </div>
  );
}
