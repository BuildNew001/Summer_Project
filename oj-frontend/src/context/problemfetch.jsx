import axios from 'axios'
const API_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

export const fetchProblems = async () => {
  try {
    const response = await api.get('/problems')
    return response.data.data
  } catch (error) {
    console.error('Error fetching problems:', error)
    throw error.response?.data || new Error('Server error')
  }
}

export const fetchProblemById = async id => {
  try {
    const response = await api.get(`/problems/${id}`)
    return response.data.data
  } catch (error) {
    console.error(`Error fetching problem ${id}:`, error)
    throw error.response?.data || new Error('Server error')
  }
}
export const fetchFeaturedProblems = async (limit = 3) => {
  try {
    const response = await api.get(`/problems/featured`, { params: { limit } })
    return response.data.data
  } catch (error) {
    console.error('Error fetching featured problems:', error)
    throw error.response?.data || new Error('Server error')
  }
}
export const submitCode = async ({ problemId, language, code }) => {
  try {
    const response = await api.post('/submissions', {
      problemId,
      language,
      code
    })
    return response.data
  } catch (error) {
    console.error('Error submitting code:', error)
    throw error.response?.data || new Error('Server error')
  }
}

export const fetchMySubmissions = async () => {
  try {
    const response = await api.get('/submissions');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error.response?.data || new Error('Server error');
  }
};

export const fetchSubmissionById = async (id) => {
  try {
    const response = await api.get(`/submissions/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching submission ${id}:`, error);
    throw error.response?.data || new Error('Server error');
  }
};

export const runCode = async (language, code, input) => {
  try {
    const response = await api.post('/run', {
      language,
      code,
      input,
    });
    return response.data;
  } catch (error) {
    console.error('Error running code:', error);
    throw error.response?.data || new Error('Server error');
  }
};

export const createProblem = async (problemData) => {
  try {
    const response = await api.post('/problems', problemData);
    return response.data;
  } catch (error) {
    console.error('Error creating problem:', error);
    throw error.response?.data || new Error('Server error');
  }
};

export const updateProblem = async (id, problemData) => {
  try {
    const response = await api.put(`/problems/${id}`, problemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating problem ${id}:`, error);
    throw error.response?.data || new Error('Server error');
  }
};

export const deleteProblem = async (id) => {
  try {
    await api.delete(`/problems/${id}`);
  } catch (error) {
    console.error(`Error deleting problem ${id}:`, error);
    throw error.response?.data || new Error('Server error');
  }
};
