import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBookListingSchema, insertMessageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Map to store active connections
  const activeConnections: Map<number, WebSocket> = new Map();
  
  wss.on('connection', (ws: WebSocket) => {
    let userId: number | null = null;
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle user identification
        if (data.type === 'identify') {
          userId = Number(data.userId);
          if (userId) {
            activeConnections.set(userId, ws);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        activeConnections.delete(userId);
      }
    });
  });
  
  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: Request, res: Response, next: () => void) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "You must be logged in to access this resource" });
  };
  
  // Book Listing Routes
  
  // Create a new book listing
  app.post("/api/listings", ensureAuthenticated, async (req, res) => {
    try {
      const listingData = insertBookListingSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const newListing = await storage.createBookListing(listingData);
      res.status(201).json(newListing);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create listing" });
      }
    }
  });
  
  // Get all listings with optional filters
  app.get("/api/listings", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.userId) filters.userId = Number(req.query.userId);
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.condition) filters.condition = req.query.condition as string;
      if (req.query.listingType) filters.listingType = req.query.listingType as string;
      if (req.query.search) filters.searchTerm = req.query.search as string;
      
      // Default to active listings unless specified
      filters.status = req.query.status || "active";
      
      const listings = await storage.getBookListings(filters);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });
  
  // Get a specific listing
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const listing = await storage.getBookListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });
  
  // Update a listing
  app.patch("/api/listings/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const listing = await storage.getBookListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this listing" });
      }
      
      const updatedData = insertBookListingSchema.partial().parse(req.body);
      const updatedListing = await storage.updateBookListing(id, updatedData);
      
      res.json(updatedListing);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update listing" });
      }
    }
  });
  
  // Delete a listing (soft delete)
  app.delete("/api/listings/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const listing = await storage.getBookListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to delete this listing" });
      }
      
      await storage.deleteBookListing(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });
  
  // Messaging Routes
  
  // Send a message
  app.post("/api/messages", ensureAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id
      });
      
      // Check if recipient exists
      const recipient = await storage.getUser(messageData.receiverId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Check if listing exists if listingId is provided
      if (messageData.listingId) {
        const listing = await storage.getBookListing(messageData.listingId);
        if (!listing) {
          return res.status(404).json({ message: "Listing not found" });
        }
      }
      
      const newMessage = await storage.createMessage(messageData);
      
      // Send real-time notification via WebSocket
      const recipientWs = activeConnections.get(messageData.receiverId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({
          type: 'new_message',
          message: newMessage
        }));
      }
      
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });
  
  // Get conversations for the current user
  app.get("/api/conversations", ensureAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getConversationsByUser(req.user!.id);
      
      // Enhance with user info and last message
      const enhancedConversations = await Promise.all(
        conversations.map(async (conversation) => {
          // Get the other user in the conversation
          const otherUserId = 
            conversation.user1Id === req.user!.id 
              ? conversation.user2Id 
              : conversation.user1Id;
          
          const otherUser = await storage.getUser(otherUserId);
          
          // Get the last message
          const messages = await storage.getMessages(conversation.id);
          const lastMessage = messages.length > 0 
            ? messages[messages.length - 1] 
            : null;
          
          // Get listing info if available
          let listing = null;
          if (conversation.listingId) {
            listing = await storage.getBookListing(conversation.listingId);
          }
          
          return {
            ...conversation,
            otherUser: otherUser ? {
              id: otherUser.id,
              username: otherUser.username,
            } : null,
            lastMessage,
            listing: listing ? {
              id: listing.id,
              title: listing.title,
            } : null,
          };
        })
      );
      
      res.json(enhancedConversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get messages for a specific conversation
  app.get("/api/conversations/:id/messages", ensureAuthenticated, async (req, res) => {
    try {
      const conversationId = Number(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Check if user is part of the conversation
      if (conversation.user1Id !== req.user!.id && conversation.user2Id !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view these messages" });
      }
      
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Mark a message as read
  app.patch("/api/messages/:id/read", ensureAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.markMessageAsRead(id);
      
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  
  return httpServer;
}
