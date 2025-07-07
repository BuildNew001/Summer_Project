const axios = require('axios');
const asyncHandler = require('express-async-handler');

const runCode = asyncHandler(async (req, res) => {
  const { code, language, input } = req.body;
  const RUN_PORT = process.env.RUN_PORT;
  const RUN_SERVICE_HOST = process.env.RUN_SERVICE_HOST;

  if (!RUN_PORT || !RUN_SERVICE_HOST) {
    console.error('RUN_PORT or RUN_SERVICE_HOST is not defined in environment variables.');
    res.status(500);
    throw new Error('Server configuration error: Code execution service connection details are not set.');
  }

  if (!code || !language) {
    res.status(400);
    throw new Error('Code and language are required fields.');
  }

  const targetUrl = `http://${RUN_SERVICE_HOST}:${RUN_PORT}/api/run`;

  try {
    const response = await axios.post(targetUrl, {
      code,
      language,
      input,
    });
    if (response.data && response.data.success === false) {
      console.error('Code execution failed:', response.data.error);
      res.status(400).json(response.data);
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    console.error(`Error proxying request to code execution service at ${targetUrl}:`, error.message);

    if (error.response) {
       res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error('No response received from execution service. Check if the service is running and accessible.');
      res.status(502).json({ success: false, error: 'The code execution service is currently unavailable or not responding.' });
    } else {
      console.error('Error setting up the request to the execution service:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error while preparing the request for code execution.' });
    }
  }
});

module.exports = {
    runCode,
};
