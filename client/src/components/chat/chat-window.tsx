import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Send, Loader2 } from "lucide-react";

type ChatWindowProps = {
  conversation: {
    id: number;
    user1Id: number;
    user2Id: number;
    listingId?: number;
    otherUser: {
      id: number;
      username: string;
    } | null;
    listing: {
      id: number;
      title: string;
    } | null;
  };
  currentUserId: number;
};

export default function ChatWindow({ conversation, currentUserId }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch messages for this conversation
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${conversation.id}/messages`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const messageData = {
        senderId: currentUserId,
        receiverId: conversation.otherUser?.id as number,
        listingId: conversation.listingId,
        content
      };
      const res = await apiRequest("POST", "/api/messages", messageData);
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      // Refetch messages after sending
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversation.id}/messages`] });
      // Refetch conversations list to update last message
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle message submission
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  // Handle Enter key to send message (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize the textarea when the content changes
  useEffect(() => {
    autoResize();
  }, [newMessage]);

  // Format timestamp
  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // If it's today, just show the time
      if (new Date().toDateString() === date.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Otherwise show relative time (yesterday, 2 days ago, etc)
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h2 className="font-semibold">{conversation.otherUser?.username || "User"}</h2>
          {conversation.listing && (
            <Link 
              href={`/listings/${conversation.listing.id}`}
              className="text-sm text-primary hover:underline"
            >
              {conversation.listing.title}
            </Link>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 break-words ${
                    isCurrentUser
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div>{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isCurrentUser ? "text-indigo-100" : "text-gray-500"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            rows={1}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="h-[60px] w-[60px]"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
