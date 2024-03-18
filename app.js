const express = require('express');
const path = require('path');
const fs = require('fs');
const videoController = require('./controller/videoController');

const app = express();
const PORT = 3000;

// Route to handle streaming embedded video
app.get('/stream/', videoController.streamVideo);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
