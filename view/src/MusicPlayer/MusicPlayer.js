// components/MusicPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';  // Import the CSS for styling

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
  
    const togglePlayPause = () => {
      const audio = audioRef.current;
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    };
  
    return (
      <div className="music-player">
        <audio ref={audioRef} src="/path/to/song.mp3"></audio>
        <div className="button-container">
          <div className={isPlaying ? 'square' : 'triangle'} onClick={togglePlayPause}></div>
        </div>
      </div>
    );
  };
  

export default MusicPlayer;