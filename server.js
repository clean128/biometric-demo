/**
 * Biometric Authentication Demo Server
 * Powered by LenzId (Auth Face API) – via RapidAPI
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getUser, enrollUser, verifyUser, getResult } = require('./utils/api');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(express.json());

// Add security headers for camera/media access on mobile
app.use((req, res, next) => {
  // Permissions Policy for camera access
  res.setHeader('Permissions-Policy', 'camera=*, microphone=*');
  
  // Allow cross-origin for biometry redirects
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Store session info temporarily (in production, use Redis or database)
const sessions = new Map();

/**
 * Home page - Render input form
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Start biometric flow
 * - Check if user exists
 * - If not: start enrollment
 * - If yes: start verification
 */
app.post('/start-flow', async (req, res) => {
  try {
    const { external_user_id } = req.body;

    if (!external_user_id || external_user_id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'external_user_id is required'
      });
    }

    const userId = external_user_id.trim();
    
    // Generate new UUID for this session
    const client_state = uuidv4();
    const redirect_url = `${BASE_URL}/final`;

    console.log(`\n[Flow] Starting for user: ${userId}`);
    console.log(`[Flow] Client State: ${client_state}`);

    // Step 1: Check if user exists
    const userCheck = await getUser(userId);
    
    let result;
    let flow;

    if (userCheck.exists) {
      // User exists -> Start verification
      console.log(`[Flow] User exists, starting VERIFICATION`);
      flow = 'verify';
      result = await verifyUser(userId, client_state, redirect_url);
    } else {
      // User doesn't exist -> Start enrollment
      console.log(`[Flow] User not found, starting ENROLLMENT`);
      flow = 'enroll';
      result = await enrollUser(userId, client_state, redirect_url);
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to start biometric flow'
      });
    }

    // Store session info for later retrieval
    sessions.set(client_state, {
      external_user_id: userId,
      flow,
      created_at: new Date().toISOString()
    });

    console.log(`[Flow] Biometry URL received, redirecting user...`);

    return res.json({
      success: true,
      flow,
      biometry_url: result.biometry_url,
      client_state: result.client_state
    });

  } catch (error) {
    console.error('[Flow] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Callback page after biometric capture
 * User returns here with client_state in query params
 */
app.get('/final', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'final.html'));
});

/**
 * Get the result of a biometric session
 */
app.post('/get-result', async (req, res) => {
  try {
    const { client_state } = req.body;

    if (!client_state) {
      return res.status(400).json({
        success: false,
        error: 'client_state is required'
      });
    }

    console.log(`\n[Result] Fetching result for: ${client_state}`);

    // Get session info if available
    const sessionInfo = sessions.get(client_state);
    
    // Fetch result from API
    const result = await getResult(client_state);

    // Add session info to result if available
    if (sessionInfo) {
      result.session_info = sessionInfo;
    }

    console.log(`[Result] Status: ${result.status}, Flow: ${result.flow}`);

    return res.json(result);

  } catch (error) {
    console.error('[Result] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch result'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Check if SSL certificates exist for HTTPS
const sslKeyPath = path.join(__dirname, 'certs', 'key.pem');
const sslCertPath = path.join(__dirname, 'certs', 'cert.pem');
const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

// Start HTTP server
http.createServer(app).listen(PORT, () => {
  console.log(`\n🔐 Biometric Authentication Demo`);
  console.log(`   Powered by LenzId (Auth Face API) – via RapidAPI\n`);
  console.log(`   HTTP Server: http://localhost:${PORT}`);
  
  if (!process.env.RAPIDAPI_KEY) {
    console.warn('\n⚠️  Warning: RAPIDAPI_KEY not set in environment variables!');
    console.warn('   Please create a .env file with your RapidAPI key.\n');
  }
});

// Start HTTPS server if certificates exist
if (hasSSL) {
  const sslOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };
  
  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`   HTTPS Server: https://localhost:${HTTPS_PORT}`);
    console.log(`\n📱 For mobile testing, use HTTPS URL or ngrok/localtunnel`);
  });
} else {
  console.log(`\n📱 Mobile Camera Access:`);
  console.log(`   Mobile browsers require HTTPS for camera access.`);
  console.log(`   Options:`);
  console.log(`   1. Use ngrok: npx ngrok http ${PORT}`);
  console.log(`   2. Use localtunnel: npx localtunnel --port ${PORT}`);
  console.log(`   3. Generate SSL certs: npm run generate-certs`);
  console.log(`\n   Then update BASE_URL in .env to the HTTPS URL.`);
}

console.log(`\n   Callback URL: ${BASE_URL}/final\n`);
