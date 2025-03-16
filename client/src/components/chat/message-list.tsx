import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

type MessageListProps = {
  conversations: Array<{
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
  }>;
  selectedConversationId?: number;
  onSelectConversation: (conversation: any) => void;
  currentUserId: number;
};

export default function MessageList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId
}: MessageListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">No conversations yet</p>
      </div>
    );
  }

  // Format time difference
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "";
    }
  };

  // Get first letter of username for avatar
  const getUserInitial = (username?: string) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  // Check if a message is unread (if receiver is current user and not read)
  const isUnread = (conversation: any) => {
    return (
      conversation.lastMessage &&
      conversation.lastMessage.senderId !== currentUserId &&
      !conversation.lastMessage.read
    );
  };

  return (
    <div className="h-full">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-slate-50 ${
            selectedConversationId === conversation.id
              ? "bg-indigo-50"
              : ""
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 text-primary w-10 h-10 rounded-full flex items-center justify-center font-medium">
              {getUserInitial(conversation.otherUser?.username)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium truncate">
                  {conversation.otherUser?.username || "Unknown User"}
                </h3>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatTime(conversation.lastMessageAt)}
                </span>
              </div>
              
              {conversation.listing && (
                <div className="mt-1 mb-1">
                  <Badge variant="outline" className="text-xs truncate max-w-full">
                    {conversation.listing.title}
                  </Badge>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-1">
                <p className={`text-sm truncate ${isUnread(conversation) ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                  {conversation.lastMessage?.content || "No messages yet"}
                </p>
                
                {isUnread(conversation) && (
                  <Badge className="ml-1.5 h-2 w-2 rounded-full p-0" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
