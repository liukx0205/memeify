import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { memeUrl } = location.state || {};

  if (!memeUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">No meme found!</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Your Meme</h2>
      <img
        src={memeUrl}
        alt="Generated Meme"
        className="rounded-lg shadow-lg max-w-full max-h-[80vh]"
      />
      <button
        onClick={() => navigate('/')}
        className="px-8 py-3 bg-green-500 text-white rounded-lg mt-6 text-lg"
      >
        Generate Another Meme
      </button>
    </div>
  );
}

export default ResultPage;
