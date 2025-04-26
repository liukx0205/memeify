import React from 'react';

function Header() {
  return (
    <header className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <h1
          className="text-6xl font-bold mb-2 cursor-pointer"
          style={{ color: '#1976D2', fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}
        >
          Memeify
        </h1>
        <p className="mt-1 text-lg text-gray-500" style={{ fontFamily: 'Fredoka, Comic Sans MS, Comic Sans, cursive' }}>
          Upload an image to create your meme!
        </p>
      </div>
    </header>
  );
}

export default Header; 