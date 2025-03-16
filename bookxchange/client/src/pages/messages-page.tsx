import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MessageList from "@/components/chat/message-list";
import ChatWindow from "@/components/chat/chat-window";
import { Loader2 } from "lucide-react";

type EnhancedConversation = {
  id: number;
  user1Id: number;
  user2Id: number;
  lastMessageAt: string;
  listingId?: number;
  otherUser: {
    id: number;
    username: string;
  } | null;
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    senderId: number;
    read: boolean;
  } | null;
  listing: {
    id: number;
    title: string;
  } | null;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<EnhancedConversation | null>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<EnhancedConversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    enabled: !!user,
  });

  // Select first conversation by default if none selected
  if (conversations.length > 0 && !selectedConversation) {
    setSelectedConversation(conversations[0]);
  }

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="bg-indigo-100 text-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No Messages Yet</h2>
            <p className="text-gray-500 mb-6">
              When you contact book sellers or buyers, your conversations will appear here.
            </p>
            <a 
              href="/listings" 
              className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-indigo-700"
            >
              Browse Books
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row h-[70vh]">
              {/* Conversation List */}
              <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
                <MessageList 
                  conversations={conversations}
                  selectedConversationId={selectedConversation?.id}
                  onSelectConversation={setSelectedConversation}
                  currentUserId={user?.id || 0}
                />
              </div>
              
              {/* Chat Window */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <ChatWindow 
                    conversation={selectedConversation}
                    currentUserId={user?.id || 0}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a conversation to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
