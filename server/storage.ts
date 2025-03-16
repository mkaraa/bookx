import { users, bookListings, messages, conversations } from "@shared/schema";
import type { 
  User, InsertUser, 
  BookListing, InsertBookListing, 
  Message, InsertMessage,
  Conversation, InsertConversation
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book listing operations
  createBookListing(listing: InsertBookListing): Promise<BookListing>;
  getBookListing(id: number): Promise<BookListing | undefined>;
  getBookListings(filters?: Partial<{
    userId: number;
    category: string;
    condition: string;
    listingType: string;
    searchTerm: string;
    status: string;
  }>): Promise<BookListing[]>;
  updateBookListing(id: number, listing: Partial<InsertBookListing>): Promise<BookListing | undefined>;
  deleteBookListing(id: number): Promise<boolean>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(conversationId: number): Promise<Message[]>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByUsers(user1Id: number, user2Id: number, listingId?: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number): Promise<Conversation[]>;
  updateConversationLastMessageTime(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookListings: Map<number, BookListing>;
  private messages: Map<number, Message>;
  private conversations: Map<number, Conversation>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private listingIdCounter: number;
  private messageIdCounter: number;
  private conversationIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.bookListings = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    
    this.userIdCounter = 1;
    this.listingIdCounter = 1;
    this.messageIdCounter = 1;
    this.conversationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Book listing operations
  async createBookListing(listingData: InsertBookListing): Promise<BookListing> {
    const id = this.listingIdCounter++;
    const now = new Date();
    const listing: BookListing = {
      ...listingData,
      id,
      createdAt: now,
    };
    this.bookListings.set(id, listing);
    return listing;
  }
  
  async getBookListing(id: number): Promise<BookListing | undefined> {
    return this.bookListings.get(id);
  }
  
  async getBookListings(filters?: Partial<{
    userId: number;
    category: string;
    condition: string;
    listingType: string;
    searchTerm: string;
    status: string;
  }>): Promise<BookListing[]> {
    let listings = Array.from(this.bookListings.values());
    
    if (!filters) return listings;
    
    if (filters.userId !== undefined) {
      listings = listings.filter(listing => listing.userId === filters.userId);
    }
    
    if (filters.category) {
      listings = listings.filter(listing => listing.category === filters.category);
    }
    
    if (filters.condition) {
      listings = listings.filter(listing => listing.condition === filters.condition);
    }
    
    if (filters.listingType) {
      listings = listings.filter(listing => listing.listingType === filters.listingType);
    }
    
    if (filters.status) {
      listings = listings.filter(listing => listing.status === filters.status);
    }
    
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      listings = listings.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.author.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return listings;
  }
  
  async updateBookListing(id: number, updateData: Partial<InsertBookListing>): Promise<BookListing | undefined> {
    const listing = this.bookListings.get(id);
    if (!listing) return undefined;
    
    const updatedListing = { ...listing, ...updateData };
    this.bookListings.set(id, updatedListing);
    return updatedListing;
  }
  
  async deleteBookListing(id: number): Promise<boolean> {
    const listing = this.bookListings.get(id);
    if (!listing) return false;
    
    // Soft delete by setting status to deleted
    const updatedListing = { ...listing, status: "deleted" };
    this.bookListings.set(id, updatedListing);
    return true;
  }
  
  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      ...messageData,
      id,
      read: false,
      createdAt: now,
    };
    this.messages.set(id, message);
    
    // Update conversation last message time
    const conversation = await this.getConversationByUsers(
      message.senderId, 
      message.receiverId,
      message.listingId
    );
    
    if (conversation) {
      await this.updateConversationLastMessageTime(conversation.id);
    } else {
      // Create a new conversation if it doesn't exist
      await this.createConversation({
        user1Id: message.senderId,
        user2Id: message.receiverId,
        listingId: message.listingId
      });
    }
    
    return message;
  }
  
  async getMessages(conversationId: number): Promise<Message[]> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return [];
    
    return Array.from(this.messages.values()).filter(message => 
      (message.senderId === conversation.user1Id && message.receiverId === conversation.user2Id) ||
      (message.senderId === conversation.user2Id && message.receiverId === conversation.user1Id)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => 
      message.senderId === userId || message.receiverId === userId
    );
  }
  
  async markMessageAsRead(id: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return true;
  }
  
  // Conversation operations
  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const conversation: Conversation = {
      ...conversationData,
      id,
      lastMessageAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationByUsers(user1Id: number, user2Id: number, listingId?: number): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      conversation => (
        ((conversation.user1Id === user1Id && conversation.user2Id === user2Id) ||
        (conversation.user1Id === user2Id && conversation.user2Id === user1Id)) &&
        (listingId ? conversation.listingId === listingId : true)
      )
    );
  }
  
  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conversation => 
        conversation.user1Id === userId || conversation.user2Id === userId
      )
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }
  
  async updateConversationLastMessageTime(id: number): Promise<boolean> {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;
    
    const updatedConversation = { 
      ...conversation, 
      lastMessageAt: new Date() 
    };
    this.conversations.set(id, updatedConversation);
    return true;
  }
}

export const storage = new MemStorage();
