const express = require('express');
const multer = require('multer');
const cors = require('cors');
const FormData = require('form-data');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const { Web3 } = require('web3');

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

// Initialize Web3.js and connect to an Ethereum node
const web3 = new Web3('http://localhost:8545');

// Load the contract ABI and address
const contractABI = [
  {
    constant: false,
    inputs: [[Object], [Object]],
    name: 'storeFeature',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0xab11c7f9'
  },
  {
    constant: true,
    inputs: [[Object]],
    name: 'retrieveFeature',
    outputs: [[Object]],
    payable: false,
    stateMutability: 'view',
    type: 'function',
    signature: '0x7d876b12'
  }
];

const contractAddress = '0x4e3c6603E83675993Ff327403Fb944Db495c79b6';
const imageFeatureStore = new web3.eth.Contract(contractABI, contractAddress);

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

      // Upload the image to Python server (as in your previous code)
      const pythonServerResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData, // do not set Content-Type here
      });

      if (pythonServerResponse.ok) {
        const result = await pythonServerResponse.json();

        // Store the image features in the Ethereum smart contract
        const accounts = await web3.eth.getAccounts();
        const imageId = req.file.filename.split('_')[1].split('.')[0]; // Extract image ID from filename
        const features = result.features; // Extracted features from Python server

        // Call the smart contract's storeFeature function
        await imageFeatureStore.methods.storeFeature(imageId, features).send({ from: accounts[0] });

        res.status(200).send({ message: 'File processed and features stored', data: result });
      } else {
        console.error('Python server error');
        res.status(500).send({ message: 'Error processing file in Python server' });
      }
    } catch (error) {
      console.error('Error forwarding file to Python server or storing features:', error);
      res.status(500).send({ message: 'Error forwarding file to Python server or storing features', error: error });
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
