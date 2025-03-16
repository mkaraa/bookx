import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, MessageSquare, ChevronDownIcon } from "lucide-react";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Listen for scroll events to add shadow to header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "";
    const username = user.username;
    if (username.length <= 2) return username.toUpperCase();
    return username.charAt(0).toUpperCase();
  };

  return (
    <header className={`bg-white sticky top-0 z-50 ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.944V2a10 10 0 00-9.95 9h2.983a7.003 7.003 0 016.967-6.056zm-1 14.112V22a10 10 0 009.95-9h-2.983a7.003 7.003 0 01-6.967 6.056zm-7.95-6.056H0a10 10 0 009.95 9v-2.944A7.003 7.003 0 013.05 13zm17.9 0H24a10 10 0 00-9.95-9v2.944a7.003 7.003 0 016.967 6.056z"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-primary">BookXchange</span>
            </Link>
          </div>
          
          {/* Desktop search */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search books, authors, categories..." 
                className="w-96 pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>
          
          {/* Right navigation section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/messages" className="text-slate-600 hover:text-primary">
                  <MessageSquare className="h-6 w-6" />
                </Link>
                <Link href="/notifications" className="text-slate-600 hover:text-primary">
                  <BellIcon className="h-6 w-6" />
                </Link>
                <Button 
                  asChild
                  className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-150 ease-in-out"
                >
                  <Link href="/create-listing">Post Ad</Link>
                </Button>
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-primary font-medium">
                        {getUserInitials()}
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">Your Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">Your Listings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="cursor-pointer">Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer" 
                      onClick={() => logoutMutation.mutate()} 
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? "Signing out..." : "Sign out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth?tab=register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile search (visible only on mobile) */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search books..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
      </div>
    </header>
  );
}
