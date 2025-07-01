import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import { fetchProblems } from '../context/problemfetch';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const difficultyColorMap = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    const getProblems = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProblems();
        const normalized = data.map((p) => ({
          ...p,
          difficulty: p.difficulty?.toLowerCase() || 'unknown',
        }));

        setProblems(normalized);
        setFilteredProblems(normalized);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch problems. Please try again later.');
        setProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    getProblems();
  }, []);

  useEffect(() => {
    let filtered = problems;

    if (search) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(
        (p) => p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    setFilteredProblems(filtered);
  }, [search, difficultyFilter, problems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#101b3f] text-white font-sans px-4 py-10 sm:px-8 md:px-16">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text drop-shadow-lg">
            Problem Set
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Filter by difficulty, search by title, and solve coding challenges.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-[220px] rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-cyan-400">
              <SelectValue placeholder="Filter by Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f172a] border border-white/10 text-white rounded-xl shadow-lg">
              <SelectItem value="all" className="hover:bg-white/10 cursor-pointer">All Difficulties</SelectItem>
              <SelectItem value="easy" className="hover:bg-white/10 cursor-pointer">Easy</SelectItem>
              <SelectItem value="medium" className="hover:bg-white/10 cursor-pointer">Medium</SelectItem>
              <SelectItem value="hard" className="hover:bg-white/10 cursor-pointer">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center shadow-lg">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">An Error Occurred</h3>
            <p className="text-red-300">{error}</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center text-slate-400 mt-10 text-lg">
            No matching problems found.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col justify-between space-y-4 transition transform hover:scale-[1.02]"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{problem.title}</h3>
                  <Badge className={`${difficultyColorMap[problem.difficulty]} text-white px-3 py-1 text-sm`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </Badge>
                  <p className="mt-2 text-slate-300 text-sm">
                    <span className="font-medium">Author:</span> {problem.author?.UserName || 'N/A'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(problem.tags) && problem.tags.length > 0 ? (
                      problem.tags.map((tag, i) => (
                        <Badge key={i} className="bg-blue-600/30 text-blue-200 hover:bg-blue-600/40">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm">No Tags</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Link to={`/problems/${problem._id}`}>
                    <Button
                      variant="ghost"
                      className="text-cyan-400 hover:bg-cyan-400/20 hover:text-cyan-300 transition"
                    >
                      Solve
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemsPage;
