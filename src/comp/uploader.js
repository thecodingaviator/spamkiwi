import React, { useState } from 'react';

function Uploader() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Handler for file input change
  const handleFileChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  // Handler for file upload
  const uploadImage = async () => {
    if (!selectedImage) {
      alert('Please select an image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:5500/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Image uploaded successfully');
        // Handle successful upload here (e.g., clear the selection, display a message)
        
        // Clear the selection
        // setSelectedImage(null);

        // Display a message
        alert('Image uploaded successfully');
      } else {
        console.error('Upload failed');

        // Handle errors here
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading the image', error);
      // Handle network errors here
      alert('Error uploading the image');
    }
  };

  return (
    <div>
      <h2>Image Uploader</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={uploadImage}>Upload Image</button>
    </div>
  );
}

export default Uploader;
