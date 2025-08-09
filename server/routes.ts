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
      console.log('Creating user via API:', userData);
      const user = await storage.createUser(userData);
      console.log('User created successfully:', user);
      res.json(user);
    } catch (error) {
      console.error('User creation failed:', error);
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
        // shelters는 별도 API에서 가져오므로 제거
        shelters: []
      });

    } catch (error) {
      console.error("Guide generation error:", error);
      res.status(500).json({ 
        message: "맞춤형 가이드 생성에 실패했습니다",
        error: (error as Error).message 
      });
    }
  });

  // Shelter information - 실제 API 연동 대응
  app.get("/api/shelters", async (req, res) => {
    try {
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          message: "위치 정보(lat, lng)가 필요합니다",
          error: "Missing required parameters"
        });
      }

      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      
      // 실제 API 연동 시도
      const { createShelterService } = await import('./services/shelterService');
      const shelterService = createShelterService();
      
      if (shelterService) {
        console.log(`🌍 실제 API로 대피소 검색: 위치(${userLat}, ${userLng})`);
        try {
          const realShelters = await shelterService.getNearbyRealShelters(userLat, userLng, 10);
          
          if (realShelters.length > 0) {
            console.log(`✅ 실제 대피소 ${realShelters.length}개 발견`);
            return res.json(realShelters);
          } else {
            console.log('⚠️ 해당 위치 주변에 대피소가 없음');
            return res.json([]);
          }
        } catch (error) {
          console.error('❌ 대피소 API 호출 실패:', error);
          return res.status(500).json({
            message: "대피소 정보 조회에 실패했습니다",
            error: (error as Error).message
          });
        }
      }

      // 서비스 생성 실패
      console.warn('⚠️ 대피소 서비스 생성 실패');
      return res.status(503).json({
        message: "대피소 데이터 서비스를 이용할 수 없습니다",
        error: "서비스 초기화 실패"
      });
      
    } catch (error) {
      console.error("❌ 대피소 조회 오류:", error);
      res.status(500).json({ 
        message: "대피소 정보 조회에 실패했습니다",
        error: (error as Error).message,
        requiresApiSetup: true
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

  // T-Map route calculation endpoint
  app.post("/api/tmap/route", async (req, res) => {
    try {
      const { startX, startY, endX, endY } = req.body;
      
      if (!startX || !startY || !endX || !endY) {
        return res.status(400).json({ error: "출발지와 목적지 좌표가 필요합니다" });
      }

      const tmapApiKey = process.env.TMAP_API_KEY;
      if (!tmapApiKey) {
        return res.status(500).json({ error: "T-Map API 키가 설정되지 않았습니다" });
      }

      // Call T-Map Directions API
      const response = await fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'appKey': tmapApiKey
        },
        body: JSON.stringify({
          startX: startX.toString(),
          startY: startY.toString(),
          endX: endX.toString(),
          endY: endY.toString(),
          reqCoordType: 'WGS84GEO',
          resCoordType: 'EPSG3857',
          startName: '출발지',
          endName: '목적지'
        })
      });

      if (!response.ok) {
        throw new Error(`T-Map API error: ${response.status}`);
      }

      const routeData = await response.json();
      res.json(routeData);
    } catch (error) {
      console.error("T-Map route calculation failed:", error);
      res.status(500).json({ error: "경로 계산 중 오류가 발생했습니다" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
