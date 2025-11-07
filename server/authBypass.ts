// Development-only authentication bypass
// DO NOT USE IN PRODUCTION
// This allows admin access without full authentication setup

import type { RequestHandler } from "express";
import { storage } from "./storage";

// Simple API key authentication for admin (development/testing)
export const adminApiKeyAuth: RequestHandler = async (req, res, next) => {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check for API key in header or query
  const apiKey = req.headers["x-admin-api-key"] || req.query.apiKey;
  const devApiKey = process.env.DEV_ADMIN_API_KEY || "dev-admin-key-12345";

  if (apiKey === devApiKey) {
    // Create a mock user for development
    (req as any).user = {
      claims: {
        sub: "dev-admin-user",
        email: "admin@artinyxus.com"
      }
    };
    (req as any).isAuthenticated = () => true;
    return next();
  }

  res.status(401).json({ message: "Invalid API key" });
};

// Check if user is admin (bypass version)
export const isAdminBypass: RequestHandler = async (req, res, next) => {
  // Only in development
  if (process.env.NODE_ENV === "production") {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = (req as any).user;
  
  if (!user || !user.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if user exists and is admin
    const dbUser = await storage.getUser(user.claims.sub);
    
    // If user doesn't exist, create admin user automatically (dev only)
    if (!dbUser) {
      await storage.upsertUser({
        id: user.claims.sub,
        email: user.claims.email || "admin@artinyxus.com",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true
      });
      return next();
    }

    if (!dbUser.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking admin status" });
  }
};

