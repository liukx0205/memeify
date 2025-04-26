import React, { useState } from 'react';

function MemeGenerator() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = async (event) => {
    let file;
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      file = event.dataTransfer.files[0];
    } else if (event.target.files && event.target.files.length > 0) {
      file = event.target.files[0];
    } else if (event.dataTransfer && event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      // Try to get image URL from dragged web image
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item = event.dataTransfer.items[i];
        if (item.kind === 'string' && item.type === 'text/uri-list') {
          item.getAsString(async (url) => {
            try {
              const response = await fetch(url);
              const blob = await response.blob();
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

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleImageUpload(e);
  };

  return (
    <div className="flex flex-col items-center w-full">
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
            />
          </div>
        )}
      </div>
      <button
        className="w-72 py-4 rounded-2xl text-white text-2xl font-bold shadow-md focus:outline-none mt-2 tracking-wide"
        style={{
          backgroundColor: '#FF6F61',
          fontFamily: 'Fredoka, Comic Sans MS, Comic Sans, cursive',
        }}
      >
        GENERATE
      </button>
    </div>
  );
}

export default MemeGenerator; 