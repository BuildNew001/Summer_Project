import {Link} from 'react-router-dom';
import { TerminalSquare, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto pt-12 pb-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
               <TerminalSquare className="h-8 w-8 text-[#F08080]" /> 
              <span className="text-xl font-bold">Online Judge</span>
            </div>
            <p className="text-gray-400 text-sm">
               Your platform for honing coding skills and competing in challenges.
            </p>
            <div className="flex items-center space-x-4">
              <Link to="#" className="text-gray-400 hover:text-[#F08080] transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-[#F08080] transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-[#F08080] transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-[#F08080] transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* For Job Seekers */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/problems" className="text-gray-400 hover:text-[#F08080] transition-colors">
                  Problems
                </Link>
              </li>
              <li>
                <Link to="/contests" className="text-gray-400 hover:text-[#F08080] transition-colors">
                  Contests
                </Link>
              </li>
              <li>
                 <Link to="/leaderboard" className="text-gray-400 hover:text-[#F08080] transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                 <Link to="/profile" className="text-gray-400 hover:text-[#F08080] transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#F08080] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
               <Link to="/faq" className="text-gray-400 hover:text-[#F08080] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-[#F08080] transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-[#F08080] shrink-0 mt-0.5" /> 
                <span className="text-gray-400">123 Code Lane, Logicville, 10101</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-[#F08080] shrink-0" />
                <span className="text-gray-400">(123) 555-CODE</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-[#F08080] shrink-0" />
                <span className="text-gray-400">support@onlinejudge.com</span>
              </li>
            </ul>
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Subscribe to our newsletter</h4>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button className="bg-[#F08080] hover:bg-[#E57373] text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Online Judge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;