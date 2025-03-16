import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BookListing } from "@shared/schema";
import BookCard from "@/components/ui/book-card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, MessageSquare, UserCircle } from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();

  // Fetch user's listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery<BookListing[]>({
    queryKey: ["/api/listings", { userId: user?.id }],
    queryFn: async ({ queryKey }) => {
      const [url, filters] = queryKey;
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId as string);
      
      const res = await fetch(`${url}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
    enabled: !!user,
  });

  // Filter active and inactive listings
  const activeListings = listings.filter(listing => listing.status === 'active');
  const inactiveListings = listings.filter(listing => listing.status !== 'active');

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return <div className="text-center py-10">Please log in to view your profile.</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="bg-primary h-32 relative"></div>
          <div className="px-6 pb-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 text-primary w-20 h-20 rounded-full -mt-10 border-4 border-white flex items-center justify-center text-xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4 -mt-10">
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
                {user.location && <p className="text-gray-500 text-sm">{user.location}</p>}
              </div>
              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  className="gap-2" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign Out"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 text-center mt-6 border-t pt-6">
              <div>
                <div className="text-2xl font-bold">{activeListings.length}</div>
                <div className="text-gray-500">Active Listings</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{inactiveListings.length}</div>
                <div className="text-gray-500">Sold/Deleted</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-gray-500">Messages</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="listings">
          <TabsList className="mb-8">
            <TabsTrigger value="listings" className="gap-2">
              <BookOpen size={16} />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare size={16} />
              Messages
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <UserCircle size={16} />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Book Listings</h2>
              <Button asChild>
                <Link href="/create-listing">Create New Listing</Link>
              </Button>
            </div>

            {listingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <BookCard key={listing.id} listing={listing} showStatus />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-500 mb-4">Start selling or requesting books today.</p>
                <Button asChild>
                  <Link href="/create-listing">Create Your First Listing</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages">
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">View your messages</h3>
              <p className="text-gray-500 mb-4">Check your conversations with other users.</p>
              <Button asChild>
                <Link href="/messages">Go to Messages</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Settings</h3>
              <p className="text-gray-500 mb-4">
                Account settings functionality will be available soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
