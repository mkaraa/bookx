import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { BOOK_CATEGORIES, BOOK_CONDITIONS, LISTING_TYPES } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define form schema
const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  author: z.string().min(2, "Author name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  condition: z.string().min(1, "Please select the book condition"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Please enter a price"),
  imageUrl: z.string().optional(),
  listingType: z.string().min(1, "Please select if you're selling or buying"),
  location: z.string().min(2, "Please enter your location"),
});

type CreateListingValues = z.infer<typeof createListingSchema>;

export default function CreateListingPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form setup
  const form = useForm<CreateListingValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      author: "",
      category: "",
      condition: "",
      description: "",
      price: "",
      imageUrl: "",
      listingType: "",
      location: user?.location || "",
    },
  });

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingValues) => {
      const res = await apiRequest("POST", "/api/listings", {
        ...data,
        userId: user!.id,
        status: "active"
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Listing created",
        description: "Your book listing has been created successfully.",
      });
      navigate(`/listings/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(data: CreateListingValues) {
    createListingMutation.mutate(data);
  }

  // Handle image URL change and preview
  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setPreviewUrl(url);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Book Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Listing Type */}
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select listing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LISTING_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === 'sell' ? 'I want to sell a book' : 'I want to buy a book'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose whether you're selling or looking to buy a book.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Book Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter book title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Author */}
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BOOK_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Condition */}
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select book condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BOOK_CONDITIONS.map((condition) => (
                              <SelectItem key={condition} value={condition}>
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the book, including any highlights or defects" 
                          className="h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="Enter price" 
                            {...field} 
                            onChange={(e) => {
                              // Allow only numeric input with decimal point
                              const value = e.target.value.replace(/[^0-9.]/g, '');
                              // Ensure only one decimal point
                              const parts = value.split('.');
                              if (parts.length > 2) {
                                return;
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter image URL" 
                          {...field} 
                          onChange={(e) => handleImageUrlChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a URL to an image of the book.
                      </FormDescription>
                      <FormMessage />
                      {previewUrl && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Preview:</p>
                          <img 
                            src={previewUrl} 
                            alt="Book preview" 
                            className="w-32 h-32 object-cover border rounded"
                            onError={() => setPreviewUrl(null)}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/listings")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createListingMutation.isPending}
                  >
                    {createListingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Listing"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
