import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BookListing, BOOK_CATEGORIES, BOOK_CONDITIONS, LISTING_TYPES } from "@shared/schema";
import BookCard from "@/components/ui/book-card";
import SearchFilter from "@/components/search-filter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ListingsPage() {
  // Parsing query parameters
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category') || "";
  const initialCondition = params.get('condition') || "";
  const initialListingType = params.get('listingType') || "";
  const initialSearchTerm = params.get('search') || "";

  // State for filters
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState(initialCondition);
  const [listingType, setListingType] = useState(initialListingType);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Construct the query for React Query
  const queryKey = [
    "/api/listings",
    { 
      category,
      condition,
      listingType,
      search: searchTerm
    }
  ];

  // Fetch listings with filters
  const { data: listings = [], isLoading, refetch } = useQuery<BookListing[]>({
    queryKey,
    queryFn: async ({ queryKey }) => {
      const [url, filters] = queryKey;
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category as string);
      if (filters.condition) params.append('condition', filters.condition as string);
      if (filters.listingType) params.append('listingType', filters.listingType as string);
      if (filters.search) params.append('search', filters.search as string);
      
      const queryString = params.toString();
      const fetchUrl = `${url}${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    }
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (condition) params.append('condition', condition);
    if (listingType) params.append('listingType', listingType);
    if (searchTerm) params.append('search', searchTerm);
    
    const queryString = params.toString();
    const newUrl = `/listings${queryString ? `?${queryString}` : ''}`;
    
    window.history.replaceState({}, '', newUrl);
  }, [category, condition, listingType, searchTerm]);

  // Apply filters and refetch
  const applyFilters = () => {
    refetch();
  };

  // Reset filters
  const resetFilters = () => {
    setCategory("");
    setCondition("");
    setListingType("");
    setSearchTerm("");
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-start md:space-x-6">
          {/* Filters Sidebar */}
          <div className="md:w-64 space-y-6 mb-6 md:mb-0">
            <SearchFilter
              categories={BOOK_CATEGORIES}
              conditions={BOOK_CONDITIONS}
              listingTypes={LISTING_TYPES}
              selectedCategory={category}
              selectedCondition={condition}
              selectedListingType={listingType}
              searchTerm={searchTerm}
              onCategoryChange={setCategory}
              onConditionChange={setCondition}
              onListingTypeChange={setListingType}
              onSearchChange={setSearchTerm}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Book Listings</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm">View:</span>
                <button 
                  className={`p-2 rounded ${view === 'grid' ? 'text-primary bg-indigo-100' : 'text-slate-400 hover:text-primary hover:bg-indigo-100'}`}
                  onClick={() => setView('grid')}
                  title="Grid view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  className={`p-2 rounded ${view === 'list' ? 'text-primary bg-indigo-100' : 'text-slate-400 hover:text-primary hover:bg-indigo-100'}`}
                  onClick={() => setView('list')}
                  title="List view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Applied Filters */}
            {(category || condition || listingType || searchTerm) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <div className="bg-indigo-100 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {category && (
                  <div className="bg-indigo-100 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    Category: {category}
                    <button onClick={() => setCategory("")} className="ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {condition && (
                  <div className="bg-indigo-100 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    Condition: {condition}
                    <button onClick={() => setCondition("")} className="ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {listingType && (
                  <div className="bg-indigo-100 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    Type: {listingType === 'sell' ? 'Selling' : 'Buying'}
                    <button onClick={() => setListingType("")} className="ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="text-sm"
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Listings Grid/List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length > 0 ? (
              <div className={
                view === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {listings.map((listing) => (
                  <BookCard 
                    key={listing.id} 
                    listing={listing} 
                    viewMode={view} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
                <Button onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
