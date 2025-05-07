/**
 * Camb.ai Narrator Service (Text-to-Speech)
 * Uses Camb.ai API key and text-to-speech endpoint.
 * 
 * NOTE: You must have a Camb.ai API key to use this service.
 */

// Use our proxy API endpoint to avoid CORS issues
const TTS_API_ENDPOINT = "/api/text-to-speech";

// In-memory API key
let cambApiKey: string | null = null;
let voiceId: number | null = null;

// Voice cache - store available voices
let availableVoices: Array<{id: number, voice_name: string}> = [];

// Initialize the narrator with Camb.ai API key
export async function initNarrator(apiKey: string, selectedVoiceId?: number): Promise<boolean> {
  try {
    if (!apiKey || apiKey.trim() === "") {
      console.error("API key cannot be empty");
      return false;
    }
    
    cambApiKey = apiKey;
    
    // Validate API key first
    const apiKeyValid = await testApiKey(apiKey);
    if (!apiKeyValid.success) {
      console.error("Invalid API key:", apiKeyValid.message);
      return false;
    }
    
    // Fetch available voices
    const voices = await fetchVoices();
    if (!voices || voices.length === 0) {
      console.error("Failed to fetch voices or no voices available");
      return false;
    }
    
    // If no specific voice ID is provided, use the first available voice
    if (!selectedVoiceId) {
      voiceId = voices[0].id;
      console.log(`No voice ID provided, using first available voice: ${voices[0].voice_name} (ID: ${voiceId})`);
    } else {
      // Check if the selected voice ID exists
      const voiceExists = voices.some(v => v.id === selectedVoiceId);
      if (voiceExists) {
        voiceId = selectedVoiceId;
        const voiceName = voices.find(v => v.id === selectedVoiceId)?.voice_name || 'Unknown';
        console.log(`Using selected voice: ${voiceName} (ID: ${voiceId})`);
      } else {
        // If not, fall back to the first voice
        voiceId = voices[0].id;
        console.log(`Selected voice ID ${selectedVoiceId} not found, using first available voice: ${voices[0].voice_name} (ID: ${voiceId})`);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Failed to initialize Camb.ai narrator:", error);
    return false;
  }
}

// Fetch available voices from Camb.ai
export async function fetchVoices(): Promise<Array<{id: number, voice_name: string}> | null> {
  if (!cambApiKey) {
    console.error("API key not set. Call initNarrator first.");
    return null;
  }

  try {
    console.log("Fetching available voices from Camb.ai...");
    
    const voicesResp = await fetch(`${TTS_API_ENDPOINT}/list-voices`, {
      method: "GET",
      headers: { 
        "x-api-key": cambApiKey,
        "Accept": "application/json"
      }
    });
    
    if (!voicesResp.ok) {
      console.error("Failed to fetch voices:", voicesResp.status);
      const errorText = await voicesResp.text().catch(() => "Unknown error");
      console.error("Error details:", errorText);
      return null;
    }
    
    const data = await voicesResp.json();
    console.log("Voices response:", data);
    
    // Handle different response formats
    let voices = [];
    
    if (data && Array.isArray(data)) {
      voices = data;
    } else if (data && data.payload && Array.isArray(data.payload)) {
      voices = data.payload;
    } else {
      console.error("Unexpected voices response format:", data);
      return null;
    }
    
    // Cache the voices
    availableVoices = voices;
    console.log(`Fetched ${voices.length} voices`);
    
    return voices;
  } catch (error) {
    console.error("Error fetching voices:", error);
    return null;
  }
}

// Get cached voices or fetch if not available
export async function getVoices(): Promise<Array<{id: number, voice_name: string}>> {
  if (availableVoices.length > 0) {
    return availableVoices;
  }
  
  const voices = await fetchVoices();
  return voices || [];
}

// Set the voice to use for narration
export function setVoice(newVoiceId: number): boolean {
  if (!cambApiKey) {
    console.error("API key not set. Call initNarrator first.");
    return false;
  }
  
  voiceId = newVoiceId;
  return true;
}

// Camb.ai API Key Validation
export async function testApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim() === "") {
    return { success: false, message: "API key cannot be empty" };
  }
  
  try {
    console.log("Testing Camb.ai API key...");
    
    // Use a simple fetch with timeout to verify network connectivity first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Test the API key by fetching available voices
      const voicesResp = await fetch(`${TTS_API_ENDPOINT}/list-voices`, {
        method: "GET",
        headers: { 
          "x-api-key": apiKey,
          "Accept": "application/json"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const voicesStatus = voicesResp.status;
      console.log("Camb.ai API response status:", voicesStatus);
      
      if (voicesResp.ok) {
        const data = await voicesResp.json();
        console.log("Camb.ai API response data:", data);
        
        // For Camb.ai, the response structure might be different than expected
        // Check for valid response in multiple possible formats
        if (
          (data && data.payload && Array.isArray(data.payload)) || 
          (data && Array.isArray(data)) ||
          (data && data.status_code === 200)
        ) {
          return { success: true, message: "API key is valid!" };
        } else {
          console.error("Unexpected response format:", data);
          return { success: false, message: "Invalid response format from Camb.ai API" };
        }
      } else {
        // Try to get the error details
        let errorBody;
        try {
          errorBody = await voicesResp.json();
        } catch (e) {
          console.error("Error parsing response JSON:", e);
          errorBody = null;
        }
        
        console.log("Camb.ai API error response:", errorBody);
        
        let errMsg = "Invalid API key or Camb.ai API access error";
        
        if (voicesStatus === 401 || voicesStatus === 403) {
          errMsg = "Authentication failed: Invalid Camb.ai API key or insufficient permissions.";
        } else if (voicesStatus === 400) {
          errMsg = "Bad request: The API parameters are invalid.";
        } else if (voicesStatus === 404) {
          errMsg = "Endpoint not found: The Camb.ai API endpoint URL may be incorrect.";
        } else if (voicesStatus === 429) {
          errMsg = "Rate limit exceeded: Too many requests to the Camb.ai API.";
        } else if (errorBody && errorBody.message) {
          errMsg = `Camb.ai API error: ${errorBody.message}`;
        }
        
        return { success: false, message: errMsg };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError; // Let the outer catch block handle this
    }
  } catch (error: any) {
    console.error("Camb.ai API key validation error:", error);
    
    let errorMessage = "Unknown error validating Camb.ai API key";
    
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      errorMessage = "Network error: Unable to connect to Camb.ai API. Check your internet connection or firewall settings.";
    } else if (error.name === "AbortError") {
      errorMessage = "Connection timeout: The request to Camb.ai API took too long to respond.";
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return { success: false, message: errorMessage };
  }
}

// Check if Camb.ai narrator is initialized
export function isNarratorInitialized(): boolean {
  return !!cambApiKey && !!voiceId;
}

// Get and process the TTS result using the run_id
async function getTtsResult(runId: string): Promise<string | null> {
  try {
    console.log("Fetching TTS result for run ID:", runId);

    const resultResp = await fetch(`${TTS_API_ENDPOINT}/tts-result/${runId}`, {
      method: "GET",
      headers: {
        "x-api-key": cambApiKey!,
        "Accept": "audio/wav, audio/mpeg, audio/mp3, audio/*, application/json" // Accept audio formats with fallback to JSON
      }
    });

    if (!resultResp.ok) {
      console.error("Failed to get TTS result:", resultResp.status);
      const errorText = await resultResp.text().catch(() => "Unknown error");
      console.error("Error details:", errorText);
      return null;
    }

    // Check the Content-Type to handle either audio or JSON response
    const contentType = resultResp.headers.get("Content-Type") || "";
    console.log("TTS result Content-Type:", contentType);

    try {
      if (contentType.includes("audio/") || contentType.includes("application/octet-stream")) {
        // Direct audio response - convert to blob URL
        console.log("Processing audio response from Camb.ai");
        const audioBlob = await resultResp.blob();
        
        if (audioBlob.size === 0) {
          console.error("Received empty audio blob");
          return null;
        }
        
        const audioType = contentType.includes("audio/") ? contentType : "audio/wav"; // Default to wav if content type is generic
        console.log(`Creating audio blob URL with type: ${audioType}, size: ${audioBlob.size} bytes`);
        
        const processedBlob = new Blob([audioBlob], { type: audioType });
        return URL.createObjectURL(processedBlob);
      } else if (contentType.includes("application/json")) {
        // JSON response - might contain a URL or base64 audio data
        const jsonData = await resultResp.json();
        console.log("TTS result JSON:", jsonData);
        
        // Camb.ai might return the data differently than expected
        const payload = jsonData.payload || jsonData;
        
        if (payload.url) {
          // If the response contains a direct URL to the audio
          console.log("Found direct audio URL in response:", payload.url);
          return payload.url;
        } else if (payload.audio_content || payload.audio || payload.data) {
          // If response contains base64 audio content in any of these fields
          const base64Audio = payload.audio_content || payload.audio || payload.data;
          console.log("Found base64 audio content in response");
          
          try {
            const byteCharacters = atob(base64Audio);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const audioBlob = new Blob([byteArray], { type: "audio/wav" });
            
            console.log(`Created audio blob from base64 data, size: ${audioBlob.size} bytes`);
            return URL.createObjectURL(audioBlob);
          } catch (base64Error) {
            console.error("Error processing base64 audio:", base64Error);
            return null;
          }
        }
        
        console.error("No audio data found in JSON response:", jsonData);
        return null;
      }

      console.error("Unsupported content type from TTS result:", contentType);
      return null;
    } catch (processingError) {
      console.error("Error processing TTS result:", processingError);
      return null;
    }
  } catch (error) {
    console.error("Error getting TTS result:", error);
    return null;
  }
}

// Check TTS task status until it completes
async function pollTtsStatus(taskId: string, maxAttempts = 15): Promise<string | null> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      console.log(`Polling TTS status for task ${taskId} (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const statusResp = await fetch(`${TTS_API_ENDPOINT}/tts/${taskId}`, {
        method: "GET",
        headers: {
          "x-api-key": cambApiKey!,
          "Accept": "application/json"
        }
      });

      if (!statusResp.ok) {
        console.error("Failed to check TTS status:", statusResp.status);
        const errorText = await statusResp.text().catch(() => "Unknown error");
        console.error("Error details:", errorText);
        
        // Wait longer between retries if we encounter errors
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        continue;
      }

      const statusData = await statusResp.json();
      console.log("TTS status response:", statusData);

      // Handle different response formats based on Camb.ai API
      // Expected: {"status_code": 200, "message": "OK", "payload": {"status": "SUCCESS", "run_id": "some-id"}}
      const payload = statusData.payload || statusData;
      const status = payload.status || "UNKNOWN";
      const runId = payload.run_id || null;

      if (status === "SUCCESS" && runId) {
        console.log("TTS job completed successfully with run ID:", runId);
        return runId;
      } else if (status === "FAILED" || status === "ERROR") {
        console.error("TTS job failed:", statusData);
        return null;
      } else if (status === "PROCESSING" || status === "PENDING") {
        console.log(`TTS job is ${status.toLowerCase()}. Waiting...`);
      } else {
        console.log(`Unknown TTS job status: ${status}. Continuing to poll...`);
      }

      // Wait before checking again - exponential backoff
      const waitTime = Math.min(1500 * (attempts + 1), 5000);
      console.log(`Waiting ${waitTime}ms before next poll...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempts++;
    } catch (error) {
      console.error("Error checking TTS status:", error);
      
      // Wait longer between retries if we encounter errors
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
  }

  console.error("Timed out waiting for TTS job to complete");
  return null;
}

// Narrate text using Camb.ai's Text-to-Speech API
export async function narrateText(
  text: string,
  language: number | string = 1, // Default to English (1)
  gender: number | string = 1,   // Default to Male (1)
  customVoiceId?: number         // Optional custom voice ID to override the default
): Promise<string | null> {
  if (!cambApiKey || !voiceId) {
    console.error("Camb.ai API key or voice ID not set. Call initNarrator first.");
    return null;
  }

  try {
    // Use custom voice ID if provided, otherwise use the default
    const voiceIdToUse = customVoiceId || voiceId;
    
    // Make sure voiceId is a valid number
    const numericVoiceId = parseInt(String(voiceIdToUse), 10);
    
    if (isNaN(numericVoiceId)) {
      console.error("Invalid voice ID:", voiceIdToUse);
      return null;
    }
    
    // Ensure language is a valid number
    const numericLanguage = typeof language === 'string' ? 1 : Number(language);
    // Ensure gender is a valid number
    const numericGender = typeof gender === 'string' ? 1 : Number(gender);
    
    console.log("Calling Camb.ai API with voice ID:", numericVoiceId);
    
    // Prepare payload according to Camb.ai docs example
    // https://client.camb.ai/apis/tts
    const ttsPayload = {
      text: text,
      voice_id: numericVoiceId,
      language: numericLanguage, // Required field - English (1) by default
      gender: numericGender      // Required field - Male (1) by default
      // Omitting optional fields that might cause validation errors
    };
    
    console.log("TTS request payload:", ttsPayload);
    
    // Step 1: Initiate TTS job
    const ttsResp = await fetch(`${TTS_API_ENDPOINT}/tts`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": cambApiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(ttsPayload)
    });

    if (!ttsResp.ok) {
      const status = ttsResp.status;
      console.error("Camb.ai API error status:", status);
      
      const errorBody = await ttsResp.json().catch(() => null);
      console.error("Camb.ai API error response:", errorBody);
      
      // If we got a 422 error with invalid voice_id, try to fetch voices and retry with first available voice
      if (status === 422 && errorBody && 
          ((Array.isArray(errorBody.detail) && errorBody.detail.some(d => d.loc?.includes('voice_id'))) ||
           (typeof errorBody.detail === 'string' && errorBody.detail.includes('voice_id')))) {
        
        console.log("Voice ID issue detected, attempting to fetch and use first available voice...");
        const voices = await fetchVoices();
        
        if (voices && voices.length > 0) {
          voiceId = voices[0].id;
          console.log(`Retrying with voice: ${voices[0].voice_name} (ID: ${voiceId})`);
          
          // Recurse with the new voice ID
          return narrateText(text, language, gender);
        }
      }
      
      let errMsg = "Failed to call Camb.ai API for narration";
      
      // Special handling for 422 errors to provide better feedback
      if (status === 422 && errorBody && errorBody.detail) {
        const details = Array.isArray(errorBody.detail) ? errorBody.detail : [errorBody.detail];
        const errorDetails = details.map((d: any) => {
          if (d.loc && d.msg) {
            return `${d.loc.join('.')}: ${d.msg}`;
          }
          return JSON.stringify(d);
        }).join('; ');
        
        errMsg += ": " + errorDetails;
      } else if (errorBody && errorBody.message) {
        errMsg += ": " + errorBody.message;
      } else if (errorBody && errorBody.error) {
        errMsg += ": " + errorBody.error;
      } else if (errorBody && errorBody.details) {
        errMsg += ": " + JSON.stringify(errorBody.details);
      }
      
      console.error(errMsg);
      return null;
    }
    
    const ttsData = await ttsResp.json();
    console.log("TTS response:", ttsData);

    // Handle different response formats
    // Based on Camb.ai docs: {"status_code": 200, "message": "OK", "payload": {"task_id": "09b12f04-9f9a-4e92-9723-fab0e21d3e26"}}
    const taskId = ttsData.task_id || 
                 (ttsData.payload && ttsData.payload.task_id);
                 
    if (!taskId) {
      console.error("No task_id found in response:", ttsData);
      return null;
    }
    
    console.log("Got task ID:", taskId);

    // Step 2: Poll for TTS job completion
    const runId = await pollTtsStatus(taskId);
    if (!runId) {
      return null;
    }

    // Step 3: Get the TTS result audio file
    return await getTtsResult(runId);
  } catch (error) {
    console.error("Error in Camb.ai narrateText:", error);
    return null;
  }
}

// Release audio resources
export function releaseAudioUrl(url: string) {
  URL.revokeObjectURL(url);
}

// Format product details for narration
export function formatProductNarration(product: any) {
  const { name, description, price, sizes, inStock } = product;
  
  let narration = `${name}. `;
  narration += `${description} `;
  narration += `This product costs $${price}. `;
  
  if (sizes && sizes.length > 0) {
    narration += `Available in sizes: ${sizes.join(", ")}. `;
  }
  
  narration += inStock ? "This item is currently in stock." : "Sorry, this item is currently out of stock.";
  
  if (product.rating) {
    narration += ` Customer rating: ${product.rating} out of 5 stars.`;
  }
  
  return narration;
}
