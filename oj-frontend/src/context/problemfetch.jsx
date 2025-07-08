import api from '../lib/api';

const handleApiError = (error, context) => {
  console.error(`Error ${context}:`, error);
  throw error.response?.data || new Error('Server error');
};

export const fetchProblems = async () => {
  try {
    const response = await api.get('/api/problems')
    return response.data.data
  } catch (error) {
    handleApiError(error, 'fetching problems');
  }
}

export const fetchProblemById = async id => {
  try {
    const response = await api.get(`/api/problems/${id}`)
    return response.data.data
  } catch (error) {
    handleApiError(error, `fetching problem ${id}`);
  }
}
export const fetchFeaturedProblems = async (limit = 3) => {
  try {
    const response = await api.get(`/api/problems/featured`, { params: { limit } })
    return response.data.data
  } catch (error) {
    handleApiError(error, 'fetching featured problems');
  }
}
export const submitCode = async ({ problemId, language, code }) => {
  try {
    const response = await api.post('/api/submissions', { problemId, language, code });
    return response.data
  } catch (error) {
    handleApiError(error, 'submitting code');
  }
}

export const fetchMySubmissions = async () => {
  try {
    const response = await api.get('/api/submissions');
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'fetching submissions');
  }
};

export const fetchSubmissionById = async (id) => {
  try {
    const response = await api.get(`/api/submissions/${id}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, `fetching submission ${id}`);
  }
};

export const runCode = async (language, code, input) => {
  try {
    const response = await api.post('/api/run', { language, code, input });
    return response.data;
  } catch (error) {
    handleApiError(error, 'running code');
  }
};

export const createProblem = async (problemData) => {
  try {
    const response = await api.post('/api/problems', problemData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'creating problem');
  }
};

export const updateProblem = async (id, problemData) => {
  try {
    const response = await api.put(`/api/problems/${id}`, problemData);
    return response.data;
  } catch (error) {
    handleApiError(error, `updating problem ${id}`);
  }
};

export const deleteProblem = async (id) => {
  try {
    await api.delete(`/api/problems/${id}`);
  } catch (error) {
    handleApiError(error, `deleting problem ${id}`);
  }
};

export const getAIReview = async ({ problemId, code }) => {
  try {
    const response = await api.post('/api/ai', { problemId, code });
    return response.data;
  } catch (error) {
    handleApiError(error, 'getting AI review');
  }
};
