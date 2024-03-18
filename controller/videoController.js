const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { URL } = require('url');

// Function to serve video as streaming embedded video
async function streamVideo(req, res) {
    const rawUrl = req.query.url;
    let url;

    if (!rawUrl) {
        return res.status(400).send('URL parameter is missing');
    }

    try {
        // Attempt to parse the URL
        url = new URL(rawUrl);
    } catch (error) {
        console.error('Invalid URL:', error);
        return res.status(400).send('Invalid URL');
    }

    // Extract filename from the URL
    const filename = path.basename(url.pathname);
    const downloadPath = path.join(__dirname, 'downloads', filename);

    try {
        // Check if the downloads folder exists, if not, create it
        const downloadsFolder = path.join(__dirname, 'downloads');
        if (!fs.existsSync(downloadsFolder)) {
            fs.mkdirSync(downloadsFolder, { recursive: true });
        }

        // Download the video from the provided URL
        const response = await axios({
            url: rawUrl,
            method: 'GET',
            responseType: 'stream'
        });

        // Create a write stream to save the downloaded video
        const fileStream = fs.createWriteStream(downloadPath);
        
        // Pipe the download stream to the write stream
        await new Promise((resolve, reject) => {
            response.data.pipe(fileStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        // Set appropriate headers for streaming video
        res.setHeader('Content-type', 'video/mp4'); // Adjust MIME type according to your video format

        // Create a read stream from the downloaded video file
        const readStream = fs.createReadStream(downloadPath);
        
        // Pipe the read stream to the response object
        readStream.pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).send('Error downloading video');
    }
}

module.exports = {
    streamVideo
};
