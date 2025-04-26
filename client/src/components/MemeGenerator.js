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
    <div className="max-w-7xl mx-auto pt-20 pb-10 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div
          className={`w-full max-w-4xl h-96 mx-auto border-2 border-dashed rounded-2xl flex flex-col justify-center items-center transition-colors duration-200 ${
            isDragging ? 'border-blue-400 bg-blue-100' : 'border-gray-400 bg-gray-200'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center w-full">
            <span className="text-gray-500 text-xl font-semibold mb-2">Drag image here</span>
            <span className="text-gray-500 mb-4">or</span>
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-blue-600 rounded-md font-medium text-white hover:bg-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-6 py-2 text-lg"
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
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
          </div>
          {preview && (
            <div className="w-full flex justify-center mt-6">
              <img
                src={preview}
                alt="Preview"
                className="max-h-40 rounded-lg shadow-lg object-contain"
              />
            </div>
          )}
        </div>
        <div className="flex justify-center mt-12">
          <button
            className="w-64 py-4 rounded-xl text-white text-2xl font-semibold shadow-md focus:outline-none"
            style={{ backgroundColor: '#FF6F61' }}
          >
            GENERATE
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemeGenerator; 