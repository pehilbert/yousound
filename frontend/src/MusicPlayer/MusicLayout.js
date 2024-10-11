// components/MusicLayout.js
import React from 'react';
import MusicPlayer from './MusicPlayer'; // Assuming you have a MusicPlayer component

const MusicLayout = ({ children }) => {
  return (
    <div className="layout">
      <header>
        {/* Your header content */}
        <h1>My Music App</h1>
      </header>

      <main>
        {/* This renders the page content */}
        {children}
      </main>

      <footer>
        {/* Music player is persistent */}
        <MusicPlayer />
      </footer>
    </div>
  );
};

export default MusicLayout;