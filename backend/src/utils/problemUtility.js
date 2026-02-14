const axios = require('axios');

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63
  };
  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://ce.judge0.com/submissions/batch',
    params: { base64_encoded: 'false' },
    headers: { 'Content-Type': 'application/json' },
    data: { submissions }
  };

  try {
    const response = await axios.request(options);
    const data = response.data;
    const batchResponse = data?.submissions ?? data;
    return Array.isArray(batchResponse) ? batchResponse : data;
  } catch (error) {
    console.error('Error in submitBatch:', error.response?.data || error.message);
    throw error;
  }
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const submitToken = async (resultToken) => {
  const options = {
    method: 'GET',
    url: 'https://ce.judge0.com/submissions/batch',
    params: {
      tokens: resultToken.join(','),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: { 'Content-Type': 'application/json' }
  };

  const fetchData = async () => {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error('Error in submitToken:', error.response?.data || error.message);
      throw error;
    }
  };

  while (true) {
    const result = await fetchData();
    const submissions = result?.submissions ?? result;
    const arr = Array.isArray(submissions) ? submissions : [];
    const isResultObtained = arr.every((r) => r.status_id > 2);
    if (isResultObtained) return arr;
    await waiting(1000);
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };
