import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";

export default function MobileNav() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Determine if a route is active
  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  // Only show when user is logged in, otherwise hide
  if (!user) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex justify-around items-center py-2">
        <Link href="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link href="/listings" className={`flex flex-col items-center p-2 ${isActive('/listings') ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        
        <Link href="/create-listing" className="flex flex-col items-center p-2 text-white bg-primary rounded-full -mt-5 shadow-lg border-4 border-white">
          <PlusCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Post</span>
        </Link>
        
        <Link href="/messages" className={`flex flex-col items-center p-2 ${isActive('/messages') ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        
        <Link href="/profile" className={`flex flex-col items-center p-2 ${isActive('/profile') ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
