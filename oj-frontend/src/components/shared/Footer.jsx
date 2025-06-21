import { Link } from 'react-router-dom';
import { TerminalSquare, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white pt-12 pb-8 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TerminalSquare className="h-8 w-8 text-[#00ffa3]" />
            <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-pink-400 text-transparent bg-clip-text">
              Online Judge
            </span>
          </div>
          <p className="text-sm text-white/60">
            Your platform for honing coding skills and competing in challenges.
          </p>
          <div className="flex items-center space-x-4">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <Link to="#" key={i} className="text-white/60 hover:text-[#00ffa3] transition-colors">
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2">
            {['/problems', '/contests', '/leaderboard', '/profile'].map((link, i) => (
              <li key={i}>
                <Link to={link} className="text-white/60 hover:text-[#00ffa3] transition-colors capitalize">
                  {link.replace('/', '') || 'Home'}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Resources</h3>
          <ul className="space-y-2">
            {['/about', '/faq', '/pricing'].map((link, i) => (
              <li key={i}>
                <Link to={link} className="text-white/60 hover:text-[#00ffa3] transition-colors capitalize">
                  {link.replace('/', '')}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + Newsletter */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Contact Us</h3>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-[#00ffa3] mt-1" />
              <span>123 Code Lane, Logicville, 10101</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-[#00ffa3]" />
              <span>(123) 555-CODE</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-[#00ffa3]" />
              <span>support@onlinejudge.com</span>
            </li>
          </ul>
          <div>
            <h4 className="text-sm font-medium text-white/90 mb-2">Subscribe to our newsletter</h4>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-[#1c1c2b] border border-white/10 text-white"
              />
              <Button className="bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-white/50">
        © {new Date().getFullYear()} Online Judge. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
