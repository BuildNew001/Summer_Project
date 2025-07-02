import React from 'react';
import { Link } from 'react-router-dom';
import { TerminalSquare, Github, Twitter, Linkedin } from 'lucide-react';

const FooterLink = ({ to, children }) => (
  <Link to={to} className="text-slate-400 hover:text-[#00ffa3] transition-colors duration-300 text-sm">
    {children}
  </Link>
);

const SocialIcon = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-500 hover:text-[#00d4ff] transition-colors duration-300 transform hover:scale-110"
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-[#0f172a]/50 border-t border-slate-800 mt-auto">
      <div className="container mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          
          {/* Logo and Brand */}
          <div className="flex flex-col items-center md:items-start md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 group mb-2">
              <TerminalSquare className="h-8 w-8 text-[#00d4ff] group-hover:text-[#00ffa3] transition-all duration-300" />
              <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#00ffa3]">
                Online Judge
              </span>
            </Link>
            <p className="text-slate-500 text-sm max-w-xs">
              Hone your skills, solve challenges, and climb the leaderboard.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-semibold text-slate-200 tracking-wider uppercase text-sm mb-1">Navigate</h3>
            <FooterLink to="/problems">Problems</FooterLink>
            <FooterLink to="/contests">Contests</FooterLink>
            <FooterLink to="/leaderboard">Leaderboard</FooterLink>
          </div>

          {/* Company/Info Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-semibold text-slate-200 tracking-wider uppercase text-sm mb-1">Info</h3>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Online Judge. All Rights Reserved.
          </p>
          <div className="flex space-x-6">
            <SocialIcon href="https://github.com"><Github className="h-5 w-5" /></SocialIcon>
            <SocialIcon href="https://twitter.com"><Twitter className="h-5 w-5" /></SocialIcon>
            <SocialIcon href="https://linkedin.com"><Linkedin className="h-5 w-5" /></SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

