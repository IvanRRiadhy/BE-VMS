import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// ✅ Gunakan tipe dari global videojs
type VideoJsPlayer = videojs.Player;
type VideoJsPlayerOptions = videojs.PlayerOptions;

interface Props {
  options: Partial<VideoJsPlayerOptions>;
}

const VideoPlayer: React.FC<Props> = ({ options }) => {
  const videoRef = useRef(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      playerRef.current = videojs(videoRef.current, options, () => {
        console.log('Video.js ready');
      });
    } else if (playerRef.current) {
      playerRef.current.src(options.sources!);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options]);

  return (
    <div data-vjs-player style={{ marginTop: '20px' }}>
      <video ref={videoRef} className="video-js vjs-default-skin" controls playsInline />
    </div>
  );
};

export default VideoPlayer;
