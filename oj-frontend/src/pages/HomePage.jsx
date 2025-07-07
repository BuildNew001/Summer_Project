import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Trophy, BookOpen, Code, ArrowRight } from 'lucide-react';
import { useFeaturedProblems } from '../hooks/useFeaturedProblems';
import Footer from '../components/shared/Footer';
import { useAuth } from '../context/AuthContext';

const DEFAULT_OJ_LOGO_URL = '/logo-normal.png';
const HOVER_OJ_LOGO_URL = '/logo-hover.png';

const Home = () => {
  const { problems: featuredProblems, isLoading, error } = useFeaturedProblems(3);
  const [isHovering, setIsHovering] = useState(false);
  const { user } = useAuth();

  const SkeletonCard = () => (
    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-slate-700 rounded-md"></div>
        <div className="w-3/4 h-6 bg-slate-700 rounded-md"></div>
      </div>
      <div className="w-1/2 h-5 bg-slate-700 rounded-md mb-4"></div>
      <div className="w-full h-10 bg-slate-700 rounded-lg"></div>
    </div>
  );

  const heroTitle = "Online Judge Terminal";
  const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.3,
        staggerChildren: 0.06,
      },
    },
  };
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <>
      <main
        className="min-h-screen text-slate-200 font-sans bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "linear-gradient(rgba(10, 15, 30, 0.85), rgba(10, 15, 30, 0.85)), url('/bg.png')"
        }}>
        <section
          className="relative flex items-center justify-center text-center py-32 px-6 text-white overflow-hidden h-screen"
        >
          <div
            className="absolute inset-0 z-0 opacity-20" // Reduced opacity from 50 to 20 for a more subtle grid effect.
            style={{
              backgroundImage: 'linear-gradient(rgba(200, 220, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 220, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div
              className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 cursor-pointer group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="relative h-24 w-24 shrink-0">
                <img
                  src={DEFAULT_OJ_LOGO_URL}
                  alt="Logo"
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 object-contain ${
                    isHovering ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <img
                  src={HOVER_OJ_LOGO_URL}
                  alt="Logo Hover"
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 object-contain ${
                    isHovering ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              <motion.h1
                className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-green-300 via-cyan-400 to-blue-500 animate-gradient bg-[200%_auto]"
                variants={sentenceVariants}
                initial="hidden"
                animate="visible"
              >
                {heroTitle.split("").map((char, index) => (
                  <motion.span key={char + "-" + index} variants={letterVariants}>
                    {char}
                  </motion.span>
                ))}
              </motion.h1>
            </motion.div>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
              Solve challenges. Rank up. Conquer algorithms like a hacker. Track progress, earn trophies, and master DSA skills.
            </p>
            <div className="mt-10 flex justify-center flex-wrap gap-4 sm:gap-6">
              <Link to="/problems">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 text-lg rounded-lg font-bold transition-all duration-500 bg-[length:200%_auto] hover:bg-right-center">
                    Start Solving <BookOpen className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/contests">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="border-fuchsia-500 text-fuchsia-400 px-6 py-3 text-lg rounded-lg font-bold bg-transparent hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-pink-500 hover:text-white hover:border-transparent  transition-all duration-300">
                    Join Contests <Trophy className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-20 px-6 bg-transparent">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-red-500 animate-gradient mb-2">
              Featured Challenges
            </h2>
            <p className="text-center text-slate-400 mb-12">
              Push your limits with these curated problems.
            </p>
            {isLoading ? ( 
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-red-400">{error}</p>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={cardContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {featuredProblems.map((problem, i) => (
                  <motion.div
                    key={problem._id}
                    className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 group"
                    variants={cardVariants}
                    whileHover={{ y: -10, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Code className="text-cyan-400" />
                      <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">{problem.title}</h3>
                    </div>
                    <p className="text-slate-400 mb-3">
                      Difficulty:{' '}
                      <span
                        className={`font-semibold ${
                          problem.difficulty === 'Easy'
                            ? 'text-green-400'
                            : problem.difficulty === 'Medium'
                            ? 'text-yellow-400'
                            : 'text-red-500'
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </p>
                    <Link to={problem.link}>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold transition-all duration-500 bg-[length:200%_auto] group-hover:bg-right-center">
                        Solve Now
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div className="text-center mt-12">
              <Link to="/problems">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="border-cyan-600 text-cyan-300 bg-transparent px-8 py-3 text-lg rounded-lg font-bold hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:border-transparent  transition-all duration-300">
                    Explore All Problems <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>
        {!user && (
          <section className="py-20 text-white">
            <div className="max-w-4xl mx-auto px-6">
              <div className="relative border border-fuchsia-500/30 bg-gradient-to-br from-slate-900 to-[#0a0f1e] p-10 rounded-3xl shadow-2xl shadow-fuchsia-500/10 text-center overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-fuchsia-500/20 via-cyan-500/10 to-transparent rounded-full animate-pulse blur-3xl"></div>
                <h2 className="relative text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400 animate-gradient bg-[200%_auto]">
                  Ready to Dive In?
                </h2>
                <p className="relative mt-4 text-slate-400 text-lg">
                  Sign up or jump straight into challenges. No distractions — just code.
                </p>
                <div className="relative mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/signup">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-lg px-8 py-3 rounded-xl font-bold transition-all duration-500 bg-[length:200%_auto] hover:bg-right-center">
                        Create Account
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/problems">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="w-full sm:w-auto border-cyan-400 text-cyan-300 bg-transparent text-lg px-8 py-3 rounded-xl font-bold hover:bg-gradient-to-r hover:from-cyan-400 hover:to-teal-400 hover:text-white hover:border-transparent transition-all duration-300">
                        Solve Problems
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
};

export default Home;