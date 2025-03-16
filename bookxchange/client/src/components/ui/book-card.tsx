import { Link } from "wouter";
import { BookListing } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useState } from "react";

interface BookCardProps {
  listing: BookListing;
  viewMode?: "grid" | "list";
  showStatus?: boolean;
}

export default function BookCard({ listing, viewMode = "grid", showStatus = false }: BookCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // Truncate title and description for better display
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Determine condition badge color
  const getConditionColor = (condition: string) => {
    const colors: { [key: string]: string } = {
      'Like New': 'bg-emerald-100 text-emerald-800',
      'Very Good': 'bg-teal-100 text-teal-800',
      'Good': 'bg-yellow-100 text-yellow-800',
      'Fair': 'bg-orange-100 text-orange-800',
      'Poor': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  // Get seller initials from title (would be from user data in a full implementation)
  const getSellerInitials = () => {
    const title = listing.title || "";
    const words = title.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  if (viewMode === "list") {
    return (
      <Link href={`/listings/${listing.id}`}>
        <div className="book-card bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex">
          <div className="relative h-32 w-24 flex-shrink-0">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
            {listing.listingType === 'buy' && (
              <div className="absolute top-1 left-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Wanted</Badge>
              </div>
            )}
          </div>
          <div className="p-4 flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-primary">{listing.category}</span>
              <span className="text-sm font-bold text-orange-500">${parseFloat(listing.price).toFixed(2)}</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{truncateText(listing.title, 50)}</h3>
            <p className="text-sm text-slate-600 mb-2">{listing.author}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{listing.location}</span>
              </div>
              
              <Badge className={cn("ml-2", getConditionColor(listing.condition))}>
                {listing.condition}
              </Badge>
              
              {showStatus && listing.status !== 'active' && (
                <Badge variant="outline" className="ml-2">
                  {listing.status === 'sold' ? 'Sold' : 'Inactive'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default grid view
  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="book-card bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        <div className="relative pb-[140%]">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-slate-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={getConditionColor(listing.condition)}>
              {listing.condition}
            </Badge>
          </div>
          {listing.listingType === 'buy' && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Wanted</Badge>
            </div>
          )}
          {!listing.listingType === 'buy' && (
            <button 
              className={`absolute top-2 left-2 p-1.5 rounded-full ${isWishlisted ? 'bg-rose-50 text-rose-500' : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500'}`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          )}
          
          {showStatus && listing.status !== 'active' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="text-lg py-1 px-3">{listing.status === 'sold' ? 'SOLD' : 'INACTIVE'}</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-primary">{listing.category}</span>
            <span className="text-sm font-bold text-orange-500">${parseFloat(listing.price).toFixed(2)}</span>
          </div>
          <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{listing.title}</h3>
          <p className="text-sm text-slate-600 mb-2 line-clamp-1">{listing.author}</p>
          <div className="flex items-center text-sm text-slate-500 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-primary font-medium">
                {getSellerInitials()}
              </div>
              <span className="ml-1.5 text-xs text-slate-600">{`User ${listing.userId}`}</span>
            </div>
            <button className="text-xs bg-primary hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition duration-150 ease-in-out">
              Contact
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
