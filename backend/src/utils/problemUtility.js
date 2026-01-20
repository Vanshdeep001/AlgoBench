const axios = require('axios');


const getLanguageById = (lang) => {

  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63
  }


  return language[lang.toLowerCase()];
}


const submitBatch = async (submissions) => {


  const options = {
    method: 'POST',
    url: 'https://ce.judge0.com/submissions/batch',
    params: {
      base64_encoded: 'false'
    },
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      submissions
    }
  };

  async function fetchData() {
    try {
      console.log('Sending to Judge0:', JSON.stringify(options.data, null, 2));
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error('Error in submitBatch:', error.response?.data || error.message);
      console.error('Failed request data:', JSON.stringify(options.data, null, 2));
      throw error;
    }
  }

  return await fetchData();

}


const waiting = async (timer) => {
  setTimeout(() => {
    return 1;
  }, timer);
}

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async (resultToken) => {

  const options = {
    method: 'GET',
    url: 'https://ce.judge0.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error('Error in submitToken:', error.response?.data || error.message);
      throw error;
    }
  }


  while (true) {

    const result = await fetchData();

    const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

    if (IsResultObtained)
      return result.submissions;


    await waiting(1000);
  }



}


module.exports = { getLanguageById, submitBatch, submitToken };








// 


