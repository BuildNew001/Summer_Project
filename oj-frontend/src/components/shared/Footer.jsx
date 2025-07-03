import React from 'react';
import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-[#0a0f1e] to-transparent text-slate-400 mt-20 py-8 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center mb-4">
          <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold">
            <Code className="h-7 w-7 text-cyan-400" />
            <span>Online Judge</span>
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-6 mb-6 text-sm">
          <Link to="/problems" className="hover:text-cyan-400 transition-colors">Problems</Link>
          <Link to="/my-submissions" className="hover:text-cyan-400 transition-colors">My Submissions</Link>
          <Link to="/contests" className="hover:text-cyan-400 transition-colors">Contests</Link>
        </div>
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Online Judge. A project for learning and growth.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

