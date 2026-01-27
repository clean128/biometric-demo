/**
 * Auth Face Biometric API Integration
 * Powered by LenzId (Auth Face API) – via RapidAPI
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'auth-face-biometric-authentication-api.p.rapidapi.com';
const API_BASE_URL = `https://${RAPIDAPI_HOST}/wp-json/biometry/v1`;

/**
 * Make API request to Auth Face
 */
async function apiRequest(endpoint, body = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[API] POST ${endpoint}`, JSON.stringify(body, null, 2));
  console.log(`[API] URL: ${url}`);
  console.log(`[API] Headers: ${JSON.stringify({
    'Content-Type': 'application/json',
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST
  }, null, 2)}`);
  console.log(`[API] Body: ${JSON.stringify(body, null, 2)}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  
  console.log(`[API] Response (${response.status}):`, JSON.stringify(data, null, 2));
  
  return {
    status: response.status,
    data
  };
}

/**
 * Check if user exists in the biometric database
 * @param {string} external_user_id - User identifier
 * @returns {Promise<{exists: boolean, user?: object}>}
 */
async function getUser(external_user_id) {
  console.log(`[API] Checking if user exists: ${external_user_id}`);
  const { status, data } = await apiRequest('/users/get', { external_user_id });
  
  if (status === 404 || data.error === 'external_user_not_found') {
    return { exists: false };
  }
  
  if (data.success && data.user) {
    return { exists: true, user: data.user };
  }
  
  return { exists: false };
}

/**
 * Start biometric enrollment (registration) flow
 * @param {string} external_user_id - User identifier
 * @param {string} client_state - UUID for session tracking
 * @param {string} redirect_url - Callback URL after capture
 * @returns {Promise<{success: boolean, biometry_url?: string, error?: string}>}
 */
async function enrollUser(external_user_id, client_state, redirect_url) {
  const { data } = await apiRequest('/enroll', {
    external_user_id,
    client_state,
    redirect_url
  });
  
  if (data.success && data.biometry_url) {
    return {
      success: true,
      biometry_url: data.biometry_url,
      client_state: data.client_state
    };
  }
  
  return {
    success: false,
    error: data.error || 'Enrollment failed'
  };
}

/**
 * Start biometric verification flow
 * @param {string} external_user_id - User identifier
 * @param {string} client_state - UUID for session tracking
 * @param {string} redirect_url - Callback URL after capture
 * @returns {Promise<{success: boolean, biometry_url?: string, error?: string}>}
 */
async function verifyUser(external_user_id, client_state, redirect_url) {
  const { data } = await apiRequest('/verify', {
    external_user_id,
    client_state,
    redirect_url
  });
  
  if (data.success && data.biometry_url) {
    return {
      success: true,
      biometry_url: data.biometry_url,
      client_state: data.client_state
    };
  }
  
  return {
    success: false,
    error: data.error || 'Verification failed'
  };
}

/**
 * Get the final result of a biometric session
 * @param {string} client_state - UUID used in the session
 * @returns {Promise<object>} Result object with flow, status, reason, score, etc.
 */
async function getResult(client_state) {
  const { data } = await apiRequest('/result', { client_state });
  return data;
}

module.exports = {
  getUser,
  enrollUser,
  verifyUser,
  getResult
};
