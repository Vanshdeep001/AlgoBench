const axios = require('axios');

// Judge0 client. The instance URL and credentials come from env so we can switch
// between the public CE instance, RapidAPI, or a self-hosted instance without code changes.
//   JUDGE0_URL             e.g. https://ce.judge0.com or https://judge0-ce.p.rapidapi.com
//   JUDGE0_KEY             API key. Sent as X-RapidAPI-Key for *.rapidapi.com hosts,
//                          otherwise as X-Auth-Token (self-hosted auth).
//   JUDGE0_POLL_TIMEOUT_MS max total time to wait for a batch verdict (default 60000)

const getBaseUrl = () => (process.env.JUDGE0_URL || 'https://ce.judge0.com').replace(/\/+$/, '');

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63
  };
  return language[lang.toLowerCase()];
};

let currentKeyIndex = 0;

const getActiveKey = () => {
  const keys = [
    process.env.JUDGE0_KEY,
    process.env.JUDGE0_KEY_FALLBACK_1,
    process.env.JUDGE0_KEY_FALLBACK_2,
    process.env.JUDGE0_KEY_FALLBACK_3
  ].filter(Boolean);
  if (keys.length === 0) return null;
  return keys[currentKeyIndex % keys.length];
};

const rotateKey = () => {
  const keys = [
    process.env.JUDGE0_KEY,
    process.env.JUDGE0_KEY_FALLBACK_1,
    process.env.JUDGE0_KEY_FALLBACK_2,
    process.env.JUDGE0_KEY_FALLBACK_3
  ].filter(Boolean);
  if (keys.length > 1) {
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    console.log(`Rotating Judge0 API key to index ${currentKeyIndex}`);
  }
};

const buildHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const key = getActiveKey();
  if (key) {
    const host = new URL(getBaseUrl()).host;
    if (host.endsWith('rapidapi.com')) {
      headers['X-RapidAPI-Key'] = key;
      headers['X-RapidAPI-Host'] = host;
    } else {
      headers['X-Auth-Token'] = key;
    }
  }
  return headers;
};

const submitBatch = async (submissions) => {
  const makeRequest = () => {
    const options = {
      method: 'POST',
      url: getBaseUrl() + '/submissions/batch',
      params: { base64_encoded: 'false' },
      headers: buildHeaders(),
      data: { submissions }
    };
    return axios.request(options);
  };

  try {
    const response = await makeRequest();
    const data = response.data;
    const batchResponse = data?.submissions ?? data;
    return Array.isArray(batchResponse) ? batchResponse : data;
  } catch (error) {
    const status = error.response?.status;
    const errorMsg = String(error.response?.data?.message || '').toLowerCase();
    const isExhausted = status === 429 || status === 403 || status === 401 || errorMsg.includes('quota') || errorMsg.includes('subscribed');

    if (isExhausted) {
      rotateKey();
      try {
        console.log('Retrying submitBatch with fallback key...');
        const response = await makeRequest();
        const data = response.data;
        const batchResponse = data?.submissions ?? data;
        return Array.isArray(batchResponse) ? batchResponse : data;
      } catch (retryError) {
        console.error('Error in submitBatch (fallback key failed):', retryError.response?.data || retryError.message);
        throw retryError;
      }
    }

    console.error('Error in submitBatch:', error.response?.data || error.message);
    throw error;
  }
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const POLL_INITIAL_MS = 500;
const POLL_MAX_MS = 3000;

// Judge0 can't always represent program output as plain UTF-8 (e.g. a crash
// writing binary/garbage to stdout) and rejects the request with "cannot be
// converted to UTF-8" when base64_encoded=false. Fetch as base64 instead and
// decode the text fields ourselves - this is Judge0's documented fix.
const BASE64_FIELDS = ['source_code', 'stdin', 'expected_output', 'stdout', 'stderr', 'compile_output', 'message'];

const decodeBase64Fields = (submission) => {
  const decoded = { ...submission };
  for (const field of BASE64_FIELDS) {
    if (typeof decoded[field] === 'string' && decoded[field] !== '') {
      try {
        decoded[field] = Buffer.from(decoded[field], 'base64').toString('utf-8');
      } catch (e) {
        // leave as-is if it wasn't valid base64
      }
    }
  }
  return decoded;
};

const submitToken = async (resultToken) => {
  const makeRequest = () => {
    const options = {
      method: 'GET',
      url: getBaseUrl() + '/submissions/batch',
      params: {
        tokens: resultToken.join(','),
        base64_encoded: 'true',
        fields: '*'
      },
      headers: buildHeaders()
    };
    return axios.request(options);
  };

  const fetchData = async () => {
    try {
      const response = await makeRequest();
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorMsg = String(error.response?.data?.message || '').toLowerCase();
      const isExhausted = status === 429 || status === 403 || status === 401 || errorMsg.includes('quota') || errorMsg.includes('subscribed');

      if (isExhausted) {
        rotateKey();
        try {
          console.log('Retrying submitToken with fallback key...');
          const response = await makeRequest();
          return response.data;
        } catch (retryError) {
          console.error('Error in submitToken (fallback key failed):', retryError.response?.data || retryError.message);
          throw retryError;
        }
      }

      console.error('Error in submitToken:', error.response?.data || error.message);
      throw error;
    }
  };

  // Poll with exponential backoff and a hard deadline instead of looping forever.
  const timeoutMs = parseInt(process.env.JUDGE0_POLL_TIMEOUT_MS || '60000', 10);
  const deadline = Date.now() + timeoutMs;
  let delay = POLL_INITIAL_MS;

  while (true) {
    const result = await fetchData();
    const submissions = result?.submissions ?? result;
    const arr = Array.isArray(submissions) ? submissions : [];
    const isResultObtained = arr.length > 0 && arr.every((r) => r.status_id > 2);
    if (isResultObtained) return arr.map(decodeBase64Fields);
    if (Date.now() + delay > deadline) {
      throw new Error(`Judge0 polling timed out after ${timeoutMs}ms`);
    }
    await waiting(delay);
    delay = Math.min(delay * 2, POLL_MAX_MS);
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };
