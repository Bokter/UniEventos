export interface IMuxService {
  createLiveStream(): Promise<{
    stream_id: string;
    stream_key: string;
    playback_id: string;
  }>;
}

export const MUX_SERVICE = 'MUX_SERVICE';
