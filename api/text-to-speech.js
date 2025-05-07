// Proxy API for Google's Text-to-Speech API to avoid CORS issues
// Export a serverless function that forwards requests to Google's API

/**
 * Proxy handler for Google Text-to-Speech API
 * Works with both Vercel serverless functions and regular Node.js server
 */

// Proxy API for Camb.ai Text-to-Speech API to avoid CORS issues
// Export a serverless function that forwards requests to Camb.ai

// Base URL for Camb.ai API
const CAMB_API_BASE_URL = "https://client.camb.ai/apis";

export default async function handler(req, res) {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  // Get the path from the request URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace('/api/text-to-speech', '');
  
  // Extract API key from headers
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    let cambApiUrl;
    let fetchOptions = {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      }
    };

    // For debugging
    console.log(`Processing path: ${path}, full URL: ${req.url}`);

    // Handle different endpoints
    if (path === '/list-voices' || path === '' || path === '/') {
      // List voices endpoint
      cambApiUrl = `${CAMB_API_BASE_URL}/list-voices`;
      fetchOptions.method = 'GET';
    } else if (path === '/tts') {
      // TTS initiation endpoint
      cambApiUrl = `${CAMB_API_BASE_URL}/tts`;
      fetchOptions.method = 'POST';
      fetchOptions.headers['Content-Type'] = 'application/json';
      
      // Get request body for POST requests
      const body = req.body;
      if (!body) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
      
      // Sanitize the body to ensure it has the correct format for Camb.ai
      const sanitizedBody = {
        text: body.text || '',
        voice_id: Number(body.voice_id),
        language: Number(body.language) || 1, // Default to English (1) if not provided
        gender: Number(body.gender) || 1     // Default to Male (1) if not provided
      };
      
      // Validate voice_id is a number
      if (isNaN(sanitizedBody.voice_id)) {
        return res.status(400).json({ 
          error: 'Invalid voice_id', 
          detail: 'voice_id must be a valid number' 
        });
      }
      
      console.log('TTS request body:', JSON.stringify(sanitizedBody));
      fetchOptions.body = JSON.stringify(sanitizedBody);
    } else if (path.startsWith('/tts/')) {
      // TTS status check endpoint - Extract the task ID
      const taskId = path.replace('/tts/', '');
      cambApiUrl = `${CAMB_API_BASE_URL}/tts/${taskId}`;
      fetchOptions.method = 'GET';
    } else if (path.startsWith('/tts-result/')) {
      // TTS result fetch endpoint - Extract the run ID
      const runId = path.replace('/tts-result/', '');
      cambApiUrl = `${CAMB_API_BASE_URL}/tts-result/${runId}`;
      fetchOptions.method = 'GET';
      
      console.log(`Fetching TTS result for run ID: ${runId}`);
      
      // For audio files, we need to return the raw response
      const response = await fetch(cambApiUrl, fetchOptions);
      
      if (!response.ok) {
        console.error(`Error fetching TTS result: ${response.status}`);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return res.status(response.status).json(errorData);
      }
      
      // Return the audio file with appropriate headers
      const audioBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('Content-Type') || 'audio/wav';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(Buffer.from(audioBuffer));
    } else {
      // Unknown endpoint
      console.error(`Unknown endpoint: ${path}`);
      return res.status(404).json({ 
        error: 'Unknown endpoint',
        message: 'The requested endpoint does not exist',
        details: { path, url: req.url }
      });
    }

    // Make the request to Camb.ai API
    console.log(`Making request to: ${cambApiUrl}`);
    
    try {
      const response = await fetch(cambApiUrl, fetchOptions);
      
      // Get the response data
      const data = await response.json().catch(error => {
        console.error(`Error parsing JSON response: ${error}`);
        return { error: 'Invalid JSON response' };
      });
      
      console.log(`Camb.ai API response status: ${response.status}`);
      console.log(`Camb.ai API response:`, JSON.stringify(data).substring(0, 200) + '...');

      // For error responses, include more details
      if (!response.ok) {
        const errorResponse = {
          error: 'Camb.ai API error',
          status: response.status,
          statusText: response.statusText,
          details: data
        };
        console.error('Error response from Camb.ai:', errorResponse);
        
        return res.status(response.status).json(errorResponse);
      }

      // Forward the response back to the client
      return res.status(response.status).json(data);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({
        error: 'Error connecting to Camb.ai API',
        message: fetchError.message
      });
    }
  } catch (error) {
    console.error('Error proxying to Camb.ai API:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy request to Camb.ai API', 
      details: error.message 
    });
  }
} 