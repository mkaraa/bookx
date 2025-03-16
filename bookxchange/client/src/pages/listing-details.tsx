import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { BookListing, InsertMessage } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Loader2, MessageSquare, Heart, Share2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  // Fetch listing details
  const { data: listing, isLoading, error } = useQuery<BookListing>({
    queryKey: [`/api/listings/${id}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch listing");
      return res.json();
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: InsertMessage) => {
      const res = await apiRequest("POST", "/api/messages", messageData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller.",
      });
      setMessage("");
      setContactDialogOpen(false);
      // Invalidate conversations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle sending message
  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact the seller.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    if (listing) {
      sendMessageMutation.mutate({
        senderId: user.id,
        receiverId: listing.userId,
        listingId: listing.id,
        content: message,
      });
    }
  };

  // Handle share button
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this book: ${listing?.title} by ${listing?.author}`,
        url: window.location.href,
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Listing URL copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="w-full max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Listing Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              The book listing you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              className="mt-6" 
              onClick={() => navigate("/listings")}
            >
              Browse Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Determine if the current user is the owner of the listing
  const isOwner = user && user.id === listing.userId;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Book Image */}
            <div className="md:w-1/3 relative">
              <div className="h-full min-h-[300px] md:min-h-[500px] bg-slate-100 flex items-center justify-center">
                {listing.imageUrl ? (
                  <img 
                    src={listing.imageUrl} 
                    alt={listing.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
                    {listing.condition}
                  </span>
                </div>
                {listing.listingType === 'buy' && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Wanted
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="md:w-2/3 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-primary mb-1">{listing.category}</div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{listing.title}</h1>
                  <p className="text-lg text-gray-600 mt-1">by {listing.author}</p>
                </div>
                <div className="text-xl md:text-2xl font-bold text-secondary">
                  ${parseFloat(listing.price).toFixed(2)}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-gray-900">{listing.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Listing Type</h3>
                  <p className="text-gray-900 capitalize">{listing.listingType === 'sell' ? 'For Sale' : 'Wanted'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                  <p className="text-gray-900">{listing.condition}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Listed</h3>
                  <p className="text-gray-900">{new Date(listing.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                {isOwner ? (
                  <Button variant="outline" className="border-primary text-primary">
                    Edit Listing
                  </Button>
                ) : (
                  <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <MessageSquare size={16} />
                        Contact Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact About: {listing.title}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-4">
                        <Textarea
                          placeholder="Write your message here..."
                          className="h-32"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button 
                          className="w-full" 
                          onClick={handleSendMessage}
                          disabled={sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Message'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <Button variant="outline" className="gap-2" onClick={handleShare}>
                  <Share2 size={16} />
                  Share
                </Button>
                <Button variant="outline" className="gap-2">
                  <Heart size={16} />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Information */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">About the Seller</h2>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-medium">
              {/* Display seller initials - would come from user data */}
              JS
            </div>
            <div>
              <div className="font-medium">John Smith</div>
              <div className="text-sm text-gray-500">{listing.location}</div>
            </div>
          </div>
        </div>

        {/* Related Listings - simplified implementation */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Similar Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Would fetch and display related listings here */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-center p-6">
                <p className="text-gray-500">No similar listings found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
