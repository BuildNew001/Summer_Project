import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Code, Trophy, BookOpen } from "lucide-react";

const Home = () => {
  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);

        // Uncomment and replace with actual API call
        // const response = await fetch('/api/v1/problems/featured');
        // if (!response.ok) throw new Error('Failed to fetch problems');
        // const data = await response.json();
        // setFeaturedProblems(data);

        // Simulated mock API response
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockData = [
          { id: 1, title: "Two Sum Challenge", difficulty: "Easy", link: "/problems/1" },
          { id: 2, title: "Binary Tree Traversal", difficulty: "Medium", link: "/problems/2" },
          { id: 3, title: "Shortest Path Algorithm", difficulty: "Hard", link: "/problems/3" },
        ];
        setFeaturedProblems(mockData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setFeaturedProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#f08080] to-[#e57373] text-white py-20 md:py-32">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Welcome to Online Judge{" "}
            <span className="block">Sharpen Your Coding Skills</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/90">
            Solve challenging problems, compete in contests, and climb the leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link to="/problems" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-white text-[#F08080] hover:bg-gray-100"
              >
                Explore Problems <BookOpen className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link to="/contests" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-[#333] hover:bg-[#222] text-white"
              >
                View Contests <Trophy className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Challenges Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Challenges</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dive into some of our popular problems and see where you stand.
            </p>
          </div>

          {isLoading && (
            <div className="text-center py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f08080]"></div>
            </div>
          )}

          {error && (
            <p className="text-center text-red-500 py-10">Error: {error}</p>
          )}

          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {featuredProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-3">
                      <Code className="h-6 w-6 text-[#f08080] mr-3" />
                      <h3 className="text-xl font-semibold">{problem.title}</h3>
                    </div>
                    <p className="text-gray-500 mb-1">
                      Difficulty: {problem.difficulty}
                    </p>
                    <Link to={problem.link}>
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-[#f08080] text-[#f08080] hover:bg-pink-50 hover:text-[#e57373]"
                      >
                        View Problem
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link to="/problems">
                  <Button className="bg-[#F08080] hover:bg-[#E57373] text-white">
                    See All Problems
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#F08080] py-16 text-white">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Test Your Skills?</h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of coders who are improving daily on Online Judge.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link to="/signup" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-white text-[#F08080] hover:bg-gray-100"
              >
                Create Account
              </Button>
            </Link>
            <Link to="/problems" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-[#333] hover:bg-[#222] text-white"
              >
                Explore Challenges
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
