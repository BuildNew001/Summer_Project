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
