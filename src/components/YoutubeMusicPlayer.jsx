import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Disc3 } from 'lucide-react';
import { motion } from 'framer-motion';

const YouTubeMusicPlayer = ({ videoId = 'lVCqH2kl9fI' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          }
        }
      });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!playerReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!playerReady) return;

    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };
  
  const handleHoverStart = () => {
    if (!isPlaying) {
      discControls.start({
        rotate: 15,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 10
        }
      });
    }
  };

  const discVariants = {
    playing: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    },
    paused: {
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 10
      }
    }
  };

  return (
    <>
      <div id="youtube-player" className="hidden" />
      <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white flex items-center gap-3">
        <motion.button
          onClick={togglePlay}
          className=""
          disabled={!playerReady}
          whileHover={{ rotateZ: '30deg' }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            variants={discVariants}
            animate={isPlaying ? "playing" : "paused"}
          >
            <Disc3 className={`w-8 h-8 ${!playerReady && 'opacity-50'}`} />
          </motion.div>
        </motion.button>
        <motion.button
          onClick={toggleMute}
          className=""
          disabled={!playerReady}
          whileHover={{ rotateZ: '-10deg' }}
        >
          {isMuted ? (
            <VolumeX className={`w-6 h-6 ${!playerReady && 'opacity-50'}`} />
          ) : (
            <Volume2 className={`w-6 h-6 ${!playerReady && 'opacity-50'}`} />
          )}
        </motion.button>
      </div>
    </>
  );
};

export default YouTubeMusicPlayer;