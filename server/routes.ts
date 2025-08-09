import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { ragService } from "./services/ragService.js";
import { insertUserSchema, insertCompanionSchema, insertEmergencyEventSchema } from "@shared/schema";
import { z } from "zod";

const generateManualSchema = z.object({
  userId: z.string(),
  disasterType: z.string(),
  situation: z.object({
    locationContext: z.string(),
    canMove: z.boolean(),
    gps: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  })
});

// Mock shelter data
const mockShelters = [
  {
    id: "1",
    name: "가나초등학교",
    type: "실내 대피소",
    address: "서울시 강남구 가나로 123",
    lat: 37.561,
    lng: 126.998,
    distance: 400,
    walkingTime: 5
  },
  {
    id: "2", 
    name: "다라공원",
    type: "옥외 대피소",
    address: "서울시 강남구 다라로 456",
    lat: 37.563,
    lng: 126.995,
    distance: 650,
    walkingTime: 8
  },
  {
    id: "3",
    name: "마바실내체육관", 
    type: "구호소",
    address: "서울시 강남구 마바로 789",
    lat: 37.559,
    lng: 127.001,
    distance: 950,
    walkingTime: 12
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User management
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ 
        message: "사용자 정보 저장에 실패했습니다", 
        error: (error as Error).message 
      });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ 
        message: "사용자 정보 조회에 실패했습니다",
        error: (error as Error).message 
      });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ 
        message: "사용자 정보 수정에 실패했습니다",
        error: (error as Error).message 
      });
    }
  });

  // Companion management
  app.post("/api/companions", async (req, res) => {
    try {
      const companionData = insertCompanionSchema.parse(req.body);
      const companion = await storage.createCompanion(companionData);
      res.json(companion);
    } catch (error) {
      res.status(400).json({ 
        message: "동행 파트너 정보 저장에 실패했습니다",
        error: (error as Error).message 
      });
    }
  });

  app.get("/api/users/:userId/companions", async (req, res) => {
    try {
      const companions = await storage.getCompanionsByUserId(req.params.userId);
      res.json(companions);
    } catch (error) {
      res.status(500).json({ 
        message: "동행 파트너 정보 조회에 실패했습니다",
        error: (error as Error).message 
      });
    }
  });

  // Emergency guidance generation
  app.post("/api/manual/generate", async (req, res) => {
    try {
      const requestData = generateManualSchema.parse(req.body);
      
      // Get user profile
      const user = await storage.getUser(requestData.userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
      }

      // Prepare RAG request
      const ragRequest = {
        userProfile: {
          age: user.age,
          gender: user.gender || undefined,
          language: user.language,
          accessibility: user.accessibility || [],
          mobility: user.mobility,
          address: user.address
        },
        situation: {
          disasterType: requestData.disasterType,
          locationContext: requestData.situation.locationContext,
          canMove: requestData.situation.canMove,
          gps: requestData.situation.gps
        },
        relevantManuals: [] // Will be populated by RAG service
      };

      // Generate personalized guide
      const guide = await ragService.generatePersonalizedGuide(ragRequest);

      // Save emergency event
      await storage.createEmergencyEvent({
        userId: requestData.userId,
        type: requestData.disasterType,
        severity: "medium",
        location: requestData.situation.gps,
        situation: requestData.situation,
        personalizedGuide: JSON.stringify(guide)
      });

      res.json({
        message: "맞춤형 안전 가이드가 생성되었습니다",
        guide: guide.guide,
        audioText: guide.audioText,
        estimatedReadingTime: guide.estimatedReadingTime,
        shelters: mockShelters
      });

    } catch (error) {
      console.error("Guide generation error:", error);
      res.status(500).json({ 
        message: "맞춤형 가이드 생성에 실패했습니다",
        error: (error as Error).message 
      });
    }
  });

  // Shelter information
  app.get("/api/shelters", async (req, res) => {
    try {
      const { lat, lng } = req.query;
      
      // In a real implementation, this would calculate distances based on GPS
      // For now, return mock data with simulated distances
      res.json(mockShelters);
    } catch (error) {
      res.status(500).json({ 
        message: "대피소 정보 조회에 실패했습니다",
        error: (error as Error).message 
      });
    }
  });

  // Emergency events
  app.get("/api/users/:userId/emergencies", async (req, res) => {
    try {
      const events = await storage.getEmergencyEventsByUserId(req.params.userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ 
        message: "비상 상황 기록 조회에 실패했습니다",
        error: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
