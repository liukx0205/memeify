import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MemeGenerator() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageValid, setImageValid] = useState(true);
  const navigate = useNavigate();

  const handleImageUpload = async (event) => {
    let file;
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      file = event.dataTransfer.files[0];
    } else if (event.target.files && event.target.files.length > 0) {
      file = event.target.files[0];
    } else if (event.dataTransfer && event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item = event.dataTransfer.items[i];
        if (item.kind === 'string' && item.type === 'text/uri-list') {
          item.getAsString(async (url) => {
            try {
              if (!/^https?:\/\//i.test(url)) {
                alert('You can only drag images from your computer or from "Open image in new tab". Dragging directly from a web page is not supported.');
                return;
              }

              const fetchRes = await fetch('http://localhost:5050/api/memes/fetch-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
              });
              if (!fetchRes.ok) {
                alert('This image cannot be loaded. Please use "Open image in new tab" or upload from your computer.');
                return;
              }
              const blob = await fetchRes.blob();
              const fileFromUrl = new File([blob], 'dragged-image', { type: blob.type });
              setImage(fileFromUrl);
              const reader = new FileReader();
              reader.onloadend = () => {
                setPreview(reader.result);
              };
              reader.readAsDataURL(fileFromUrl);
            } catch (err) {
              alert('Could not load image from the web.');
            }
          });
          return;
        }
      }
    }
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }
  
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === 'string' && item.type === 'text/uri-list') {
        item.getAsString((url) => {
          if (!/^https?:\/\//i.test(url)) {
            alert('Invalid URL. Please drag a valid image.');
            return;
          }
          // Instead of fetch, create an <img> element
          const img = new Image();
          img.crossOrigin = "anonymous";  // try to handle CORS
          img.src = url;
          img.onload = async () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                const fileFromUrl = new File([blob], 'dragged-image', { type: blob.type });
                setImage(fileFromUrl);
                const reader = new FileReader();
                reader.onloadend = () => {
                  setPreview(reader.result);
                };
                reader.readAsDataURL(fileFromUrl);
              }, 'image/png');
            } catch (error) {
              console.error('Failed to process image from URL:', error);
              alert('This image could not be loaded. Try opening the image in a new tab and dragging again.');
            }
          };
          img.onerror = () => {
            alert('This image could not be loaded. Try opening the image in a new tab and dragging again.');
          };
        });
      }
    }
  };

  /*
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleImageUpload(e);
  };
  */

  const handleGenerate = async () => {
    if (!image || !description) {
      alert('Please upload an image and enter a description.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 1. Get meme caption from backend
      const captionRes = await fetch('http://localhost:5050/api/memes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const captionData = await captionRes.json();
      if (!captionRes.ok || !captionData.caption) {
        setError(captionData.error || 'Failed to generate meme caption. Please try again later.');
        setLoading(false);
        return;
      }
      const caption = captionData.caption;

      const composeData = new FormData();
      composeData.append('image', image);
      composeData.append('caption', caption);
      const composeRes = await fetch('http://localhost:5050/api/memes/compose', {
        method: 'POST',
        body: composeData,
      });
      if (!composeRes.ok) {
        setError('Failed to compose meme image. Please try again later.');
        setLoading(false);
        return;
      }
      const blob = await composeRes.blob();
      const memeUrl = URL.createObjectURL(blob);

      navigate('/result', { state: { memeUrl } });
    } catch (err) {
      setError('Failed to generate meme. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {error && (
        <div className="text-red-500 mb-4 text-lg font-semibold">{error}</div>
      )}
      <div
        className={`w-full max-w-3xl min-h-[340px] mx-auto border-2 border-dashed rounded-[2.5rem] flex flex-col justify-center items-center transition-colors duration-200 mt-4 mb-10
        ${isDragging ? 'border-blue-400 bg-blue-100' : 'border-gray-400 bg-gray-200'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ fontFamily: 'Fredoka, Comic Sans MS, Comic Sans, cursive' }}
      >
        <div className="flex flex-col items-center w-full py-8">
          <span className="text-gray-500 text-2xl font-semibold mb-2" style={{ fontFamily: 'Fredoka, Comic Sans MS, Comic Sans, cursive' }}>Drag image here</span>
          <span className="text-gray-500 mb-6" style={{ fontFamily: 'Fredoka, Comic Sans MS, Comic Sans, cursive' }}>or</span>
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-lg font-bold text-white px-8 py-3 text-xl"
            style={{ backgroundColor: '#1976D2', fontFamily: 'Fredoka, Comic Sans MS, Comic Sans, cursive' }}
          >
            Select File
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        {preview && (
          <div className="w-full flex justify-center mt-4 mb-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded-lg shadow-lg object-contain"
              onError={() => {
                setImageValid(false);
                setPreview(null);
                setError('This image cannot be loaded. Please use "Open image in new tab" or upload from your computer.');
              }}
              onLoad={() => setImageValid(true)}
            />
          </div>
        )}
      </div>
      <input
        type="text"
        className="w-96 mb-4 px-4 py-2 rounded-lg border border-gray-300 text-lg"
        placeholder="Describe your image (for meme context)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ fontFamily: 'Fredoka, Comic Sans MS, Comic Sans, cursive' }}
      />
      <button
        className="w-72 py-4 rounded-2xl text-white text-2xl font-bold shadow-md focus:outline-none mt-2 tracking-wide"
        style={{
          backgroundColor: '#FF6F61',
          fontFamily: 'Fredoka, Comic Sans MS, Comic Sans, cursive',
        }}
        onClick={handleGenerate}
        disabled={loading || !imageValid}
      >
        {loading ? 'GENERATING...' : 'GENERATE'}
      </button>
    </div>
  );
}

export default MemeGenerator; 