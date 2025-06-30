import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code, Trophy, BookOpen } from 'lucide-react';
import { fetchFeaturedProblems } from '../context/problemfetch';
const DEFAULT_OJ_LOGO_URL = '/logo-normal.png';
const HOVER_OJ_LOGO_URL = '/logo-hover.png';
import Footer from '../components/shared/Footer'
const Home = () => {
  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
     const getFeaturedProblems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const problems = await fetchFeaturedProblems(3);
        const formattedProblems = problems.map(p => ({ ...p, link: `/problems/${p._id}` }));
        setFeaturedProblems(formattedProblems);
      } catch (err) {
        setError(err.message || 'Failed to fetch featured problems.');
        setFeaturedProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    getFeaturedProblems();
  }, []);

  return (
    <>
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d152c] to-[#0a0f1e] text-white font-sans">
      <section className="relative py-32 text-center overflow-hidden bg-[url('/background-coding.jpg')] bg-cover bg-center">
        <div className="backdrop-blur-md bg-black/60 py-16 px-10 rounded-3xl w-[95%] md:w-[80%] mx-auto shadow-2xl animate-fade-in border border-white/10">
          <div
            className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 cursor-pointer group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="relative h-24 w-24">
              <img
                src={DEFAULT_OJ_LOGO_URL}
                alt="Default Logo"
                className={`absolute inset-0 h-full w-full transition-opacity duration-500 object-contain ${
                  isHovering ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <img
                src={HOVER_OJ_LOGO_URL}
                alt="Hover Logo"
                className={`absolute inset-0 h-full w-full transition-opacity duration-500 object-contain ${
                  isHovering ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
            <h1 className="text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-pink-400 via-indigo-400 to-cyan-400 animate-gradient bg-[200%_auto]">
              Online Judge
            </h1>
          </div>
          <p className="mt-6 text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Sharpen your skills, join global challenges, and rise in the ranks.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/problems">
              <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold px-8 py-3 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all">
                Dive into Problems <BookOpen className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contests">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-8 py-3 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all">
                Compete in Contests <Trophy className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#101b3f] animate-fade-in">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-red-500 animate-gradient">Featured Challenges</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Hand-picked problems to test your limits and expand your skills.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-400"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProblems.map(problem => (
                <div
                  key={problem._id}
                  className="bg-gradient-to-br from-[#1f2937] to-[#111827] border border-white/10 p-6 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all group hover:scale-105 hover:bg-opacity-90"
                >
                  <div className="flex items-center mb-4">
                    <Code className="text-cyan-400 h-6 w-6 mr-3 group-hover:rotate-6 transition-transform" />
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300">{problem.title}</h3>
                  </div>
                  <p className="text-slate-400 mb-3">Difficulty: <span className="text-white font-semibold">{problem.difficulty}</span></p>
                  <Link to={problem.link}>
                    <Button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold hover:brightness-110 hover:scale-105 transition-all rounded-xl">
                      Crack This Challenge
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/problems">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-8 py-3 text-lg rounded-2xl font-semibold">
                Browse All Problems
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-950 py-24 text-white text-center animate-fade-in-up">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-yellow-300 to-purple-500 animate-gradient bg-[200%_auto]">
            Ready to Level Up Your Coding Game?
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            Join thousands of passionate developers. Rank up, solve real-world challenges, and be part of something bigger.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button className="bg-white text-blue-800 hover:bg-slate-100 px-8 py-3 text-lg rounded-xl font-bold shadow-md hover:shadow-xl">
                Join the Community Now
              </Button>
            </Link>
            <Link to="/problems">
              <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg rounded-xl font-bold shadow-md hover:shadow-xl">
                Start Solving Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Home;
