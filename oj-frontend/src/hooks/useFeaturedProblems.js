import { useState, useEffect } from 'react';
import { fetchFeaturedProblems as apiFetchFeaturedProblems } from '../context/problemfetch.jsx';
export const useFeaturedProblems = (count) => {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProblems = async () => {
      try {
        const res = await apiFetchFeaturedProblems(count);
        const formatted = res.map(p => ({ ...p, link: `/problems/${p._id}` }));
        setProblems(formatted);
      } catch (err) {
        setError('Failed to load challenges. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getProblems();
  }, [count]);

  return { problems, isLoading, error };
};

