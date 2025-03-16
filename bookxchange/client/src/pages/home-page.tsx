import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookListing, BOOK_CATEGORIES } from "@shared/schema";
import { useState } from "react";
import BookCard from "@/components/ui/book-card";
import CategoryCard from "@/components/category-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch featured listings
  const { data: listings = [], isLoading } = useQuery<BookListing[]>({
    queryKey: ["/api/listings", { status: "active", limit: 4 }],
    queryFn: async () => {
      const res = await fetch("/api/listings?status=active&limit=4");
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    }
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/listings?search=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                Find your next great read at student-friendly prices
              </h1>
              <p className="text-lg mb-6 text-indigo-100">
                Buy and sell second-hand books directly with other students and readers. No middleman, better prices.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  className="bg-white text-primary hover:bg-indigo-100 font-medium"
                >
                  <Link href="/listings">Find Books</Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  <Link href="/create-listing">Sell Books</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
                alt="Stack of books"
                className="rounded-lg shadow-lg max-w-full h-auto"
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {BOOK_CATEGORIES.slice(0, 6).map((category, index) => (
              <CategoryCard
                key={category}
                category={category}
                count={1000 - index * 150} // Simulate counts
                onClick={() => window.location.href = `/listings?category=${encodeURIComponent(category)}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Listings</h2>
            <div className="flex items-center">
              <span className="mr-2 text-sm">View:</span>
              <button className="p-2 text-primary bg-indigo-100 rounded mr-1" title="Grid view">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-100 rounded" title="List view">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Skeleton loading state
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="relative pb-[140%]">
                    <Skeleton className="absolute inset-0 w-full h-full" />
                  </div>
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              listings.length > 0 ? (
                listings.map((listing) => (
                  <BookCard key={listing.id} listing={listing} />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">No listings found</p>
                </div>
              )
            )}
          </div>

          <div className="flex justify-center mt-8">
            <Button variant="outline" asChild className="border-primary text-primary hover:bg-indigo-50 font-medium">
              <Link href="/listings">View All Listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">How BookXchange Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Connect directly with other students and book enthusiasts to buy and sell second-hand books at fair prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Create a Listing</h3>
              <p className="text-slate-600">
                Whether you want to sell a book or find one, create a detailed listing with photos and condition information.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Connect</h3>
              <p className="text-slate-600">
                Get messages from interested buyers or sellers. Discuss details through our integrated messaging system.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Exchange</h3>
              <p className="text-slate-600">
                Arrange a meeting to complete the exchange. Rate and review your experience afterward.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
