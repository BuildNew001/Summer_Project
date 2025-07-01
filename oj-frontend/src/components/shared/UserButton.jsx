import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "../../lib/utils";
import {
  User,
  Code,
  Settings,
  LogOut,
  LayoutDashboard,
  Trophy,
} from "lucide-react";

const getAvatarUrl = (seed) =>
  `https://robohash.org/${encodeURIComponent(seed)}.png?set=set1&size=100x100`;

const UserButton = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!authUser) return null;

  const name = authUser.UserName || "User";
  const email = authUser.email || "user@example.com";
  const role = authUser.role || "user";
  const avatarURL = getAvatarUrl(email);
  const initials = name.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none group">
          <Avatar
            className={cn(
              "h-10 w-10 ring-2 ring-[#00ffa3] group-hover:ring-pink-500 transition-all duration-300 shadow-lg rounded-full overflow-hidden"
            )}
          >
            <AvatarImage src={avatarURL} alt={name} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-700 text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 z-[100] rounded-xl shadow-2xl border border-white/10 bg-[#1e1e2f]/95 backdrop-blur-md text-slate-200"
      >
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{name}</p>
            <p className="text-xs leading-none text-slate-400">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/my-submissions" className="cursor-pointer">
              <Code className="mr-2 h-4 w-4" />
              <span>My Submissions</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {role === "admin" && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-slate-500">Admin</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/admin/problems" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" /><span>Manage Problems</span></Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/contests" className="cursor-pointer"><Trophy className="mr-2 h-4 w-4" /><span>Manage Contests</span></Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
