const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

const app = express();

// Set up multer for storing uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, 'image_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Enable CORS for client-side
app.use(cors());

// Route for file upload and forwarding to Python server
app.post('/upload', upload.single('image'), async (req, res) => {
  if (req.file) {
    try {
      const formData = new FormData();
      // Use the file stream directly
      const fileStream = fs.createReadStream(req.file.path);

      formData.append('image', fileStream, {
        filename: req.file.originalname,
      });

      const pythonServerResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData, // do not set Content-Type here
      });

      if (pythonServerResponse.ok) {
        const result = await pythonServerResponse.json();
        console.log('Python server response:', result);
        res.status(200).send({ message: 'File processed', data: result });
      } else {
        console.error('Python server error');
        res.status(500).send({ message: 'Error processing file in Python server' });
      }
    } catch (error) {
      console.error('Error forwarding file to Python server:', error);
      res.status(500).send({ message: 'Error forwarding file to Python server', error: error });
    }
  } else {
    res.status(400).send({ message: 'No file uploaded.' });
  }
});

// Serve static files from 'public' directory (optional)
app.use(express.static('public'));

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
