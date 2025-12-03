import dotenv from 'dotenv';
// dotenv.config() must be called before any other imports that need it
dotenv.config();

import app from './app.js'; // Import the configured app
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database

connectDB();

// Start the server with HTTPS
const port = process.env.PORT || 5000;
const useHttps = process.env.NODE_ENV === 'production' || process.env.HTTPS_DEV === 'true';

if (useHttps) {
    try {
        const sslOptions = {
            key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
            cert: fs.readFileSync(path.join(__dirname, 'certs/cert.pem')),
        };
        https.createServer(sslOptions, app).listen(port, () => {
            logger.info(`Server is listening in HTTPS mode on https://localhost:${port}`);
        });
    } catch (error) {
        logger.error('Failed to start HTTPS server. Ensure certs/key.pem and certs/cert.pem exist.');
        process.exit(1);
    }
} else {
    app.listen(port, () => {
        logger.info(`Server is listening in HTTP mode on http://localhost:${port}`);
    });
}