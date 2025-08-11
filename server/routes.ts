import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { ragService } from "./services/ragService.js";
import { DisasterClassificationService } from "./services/disasterClassificationService.js";
import { UserClassificationService } from "./services/userClassificationService.js";
import { EmergencyNotificationService } from "./services/emergencyNotificationService.js";
import { insertUserSchema, insertCompanionSchema, insertEmergencyEventSchema } from "@shared/schema";
import { generatePersonalizedGuide } from "./services/openai";
import { disasterMonitoring } from "./services/disasterMonitoringService.js";
import disasterRoutes from "./routes/disaster.js";
import pdfRoutes from "./routes/pdf.js";
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

// 서비스 인스턴스 생성
const disasterService = new DisasterClassificationService();
const notificationService = new EmergencyNotificationService(disasterService);

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
  
  // 재난 API 라우트 등록
  app.use('/api/disaster', disasterRoutes);
  
  // PDF 업로드 및 RAG 처리 라우트 등록
  app.use('/api/pdf', pdfRoutes);

  // 재난 모니터링 상태 확인 API
  app.get('/api/disaster-monitoring/status', (req, res) => {
    const status = disasterMonitoring.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  });

  // 실제 재난 API에서 최신 재난 정보 가져오기
  app.get('/api/disaster/latest', async (req, res) => {
    try {
      const { disasterMessageAPI } = await import('./services/disasterMessageAPI.js');
      
      // 실제 정부 재난 API에서 최신 정보 확인
      const activeDisaster = await disasterMessageAPI.hasActiveDisaster();
      
      if (!activeDisaster.active || !activeDisaster.latestMessage) {
        return res.json({
          success: true,
          message: '현재 활성화된 재난 정보가 없습니다',
          data: null
        });
      }
      
      const message = activeDisaster.latestMessage;
      
      res.json({
        success: true,
        message: '최신 재난 정보를 성공적으로 가져왔습니다',
        data: {
          id: message.SN,
          title: message.DST_SE_NM || '재난문자',
          content: message.MSG_CN,
          location: message.RCPTN_RGN_NM,
          severity: message.EMRGC_STEP_NM || '알 수 없음',
          timestamp: message.CRT_DT,
          type: '재난문자',
          source: '행정안전부'
        }
      });
      
    } catch (error) {
      console.error('최신 재난 정보 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '재난 정보 조회에 실패했습니다',
        message: (error as Error).message
      });
    }
  });

  // 재난 모니터링 시작/중지 API
  app.post('/api/disaster-monitoring/start', async (req, res) => {
    try {
      await disasterMonitoring.startMonitoring();
      res.json({
        success: true,
        message: '재난 모니터링이 시작되었습니다'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '재난 모니터링 시작에 실패했습니다'
      });
    }
  });

  app.post('/api/disaster-monitoring/stop', (req, res) => {
    try {
      disasterMonitoring.stopMonitoring();
      res.json({
        success: true,
        message: '재난 모니터링이 중지되었습니다'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '재난 모니터링 중지에 실패했습니다'
      });
    }
  });

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

  // 실제 재난 API 테스트
  app.post('/api/emergency/test-real-api', async (req, res) => {
    try {
      console.log('🧪 실제 재난 API 테스트 요청됨');
      
      const realAlert = await notificationService.testRealDisasterAPI();
      
      res.json({
        success: true,
        message: '실제 재난 API 테스트 완료',
        realData: realAlert,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('실제 API 테스트 오류:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
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
          mobility: user.mobility as "independent" | "assisted" | "unable",
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

      // Generate personalized guide using RAG for reliability
      const guide = await ragService.generatePersonalizedGuide(ragRequest);

      // Save emergency event
      await storage.createEmergencyEvent({
        userId: requestData.userId,
        type: requestData.disasterType,
        severity: "medium",
        classification: "지진",
        location: requestData.situation.gps,
        situation: requestData.situation,
        personalizedGuide: JSON.stringify(guide)
      });

      // 한국수어 키워드 생성
      const { extractKSLKeywords } = await import('./services/openai.js');
      const kslKeywords = extractKSLKeywords(
        guide.audioText + ' ' + (guide.guide?.primaryActions?.join(' ') || '지진 대피'), 
        requestData.disasterType
      );

      res.json({
        message: "맞춤형 안전 가이드가 생성되었습니다",
        guide: guide.guide,
        audioText: guide.audioText,
        estimatedReadingTime: guide.estimatedReadingTime,
        kslKeywords: kslKeywords, // 한국수어 키워드 추가
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

  // Generate personalized guide with OpenAI
  app.post("/api/guides/personalized", async (req, res) => {
    const { userId, userProfile, situation, relevantManuals } = req.body;

    try {
      let finalUserProfile = userProfile;
      
      // userId가 있으면 DB에서 조회, 없으면 직접 전달된 userProfile 사용
      if (userId) {
        console.log("🔍 사용자 조회 시도:", userId);
        const dbUserProfile = await storage.getUser(userId);
        console.log("👤 조회된 사용자 프로필:", dbUserProfile);
        
        if (dbUserProfile) {
          finalUserProfile = dbUserProfile;
        }
      }
      
      // userProfile이 직접 전달되었거나 DB에서 조회된 경우
      if (finalUserProfile) {
        console.log("✅ 최종 사용자 프로필:", finalUserProfile);
        
        // RAG 서비스 사용으로 변경하여 신뢰성 높은 정보 제공
        const { ragService } = await import('./services/ragService.js');
        const guide = await ragService.generatePersonalizedGuide({
          userProfile: {
            ...finalUserProfile,
            gender: finalUserProfile.gender || undefined,
            accessibility: finalUserProfile.accessibility || [],
            mobility: finalUserProfile.mobility as "independent" | "assisted" | "unable"
          },
          situation,

        });

        res.json(guide);
      } else {
        return res.status(404).json({ error: "User profile not found" });
      }
    } catch (error) {
      console.error("Error generating personalized guide:", error);
      res.status(500).json({ 
        error: "Failed to generate guide",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Shelter information - 실제 API 연동 대응
  app.get("/api/shelters/:lat/:lng", async (req, res) => {
    try {
      const { lat, lng } = req.params;
      
      if (!lat || !lng) {
        return res.status(400).json({
          message: "위치 정보(lat, lng)가 필요합니다",
          error: "Missing required parameters"
        });
      }

      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      // 실제 API 연동 시도
      const { ShelterService } = await import('./services/shelterService');
      const shelterService = new ShelterService();
      
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

      console.log('🗺️ T-Map 도보 경로 계산 시작:', { startX, startY, endX, endY });

      try {
        const tmapResponse = await fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'appKey': tmapApiKey
          },
          body: JSON.stringify({
            startX: parseFloat(startX.toString()),
            startY: parseFloat(startY.toString()),
            endX: parseFloat(endX.toString()),
            endY: parseFloat(endY.toString()),
            startName: encodeURIComponent("출발지"),
            endName: encodeURIComponent("대피소"),
            reqCoordType: "WGS84GEO",
            resCoordType: "WGS84GEO"
          })
        });

        if (!tmapResponse.ok) {
          console.error('T-Map API 응답 오류:', tmapResponse.status);
          return res.status(tmapResponse.status).json({ 
            error: `T-Map API 오류: ${tmapResponse.status}` 
          });
        }

        const tmapData = await tmapResponse.json();
        
        if (!tmapData.features || tmapData.features.length === 0) {
          return res.status(404).json({ error: "경로를 찾을 수 없습니다" });
        }

        // T-Map 응답에서 경로 정보 파싱
        const coordinates: [number, number][] = [];
        let totalDistance = 0;
        let totalTime = 0;

        tmapData.features.forEach((feature: any) => {
          if (feature.geometry.type === 'LineString') {
            const coords = feature.geometry.coordinates;
            coords.forEach((coord: number[]) => {
              coordinates.push([coord[1], coord[0]]); // [lat, lng] 순서로 변환
            });
          }

          // 거리와 시간 정보 추출
          if (feature.properties) {
            if (feature.properties.totalDistance) {
              totalDistance = feature.properties.totalDistance;
            }
            if (feature.properties.totalTime) {
              totalTime = feature.properties.totalTime;
            }
          }
        });

        console.log(`✅ T-Map 도보 경로 파싱 완료: ${coordinates.length}개 좌표, ${totalDistance}m, ${totalTime}초`);

        res.json({
          totalDistance,
          totalTime,
          coordinates
        });

      } catch (error) {
        console.error('❌ T-Map API 호출 오류:', error);
        res.status(500).json({ 
          error: "T-Map API 호출 실패",
          details: (error as Error).message 
        });
      }
    } catch (error) {
      console.error('❌ T-Map 라우트 전체 오류:', error);
      res.status(500).json({ 
        error: "경로 계산 중 오류가 발생했습니다"
      });
    }
  });

  const httpServer = createServer(app);
  // 서비스 인스턴스 생성
  const disasterService = new DisasterClassificationService();
  const userClassificationService = new UserClassificationService();
  const emergencyService = new EmergencyNotificationService();

  // 재난 모니터링 시작
  emergencyService.startMonitoring();

  // Enhanced Emergency System API
  
  // 재난 분류 및 알림
  app.post("/api/disaster/classify", async (req, res) => {
    try {
      const { disasterText, location, userLocation } = req.body;
      const result = await disasterService.classifyDisaster(disasterText, location, userLocation);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // 2차 사용자 분류
  app.post("/api/emergency/classify-user", async (req, res) => {
    try {
      const { userId, situation } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
      }

      const classification = userClassificationService.classifyUser(user, situation);
      res.json(classification);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // 현재 활성 알림 가져오기
  app.get("/api/emergency/current-alert", (req, res) => {
    const alert = emergencyService.getActiveAlert();
    res.json(alert);
  });

  // 알림 읽음 처리
  app.post("/api/emergency/mark-read", (req, res) => {
    emergencyService.markAlertAsRead();
    res.json({ success: true });
  });

  // 사용자 대응 완료시 알림 제거
  app.post("/api/emergency/mark-completed", (req, res) => {
    emergencyService.markEmergencyCompleted();
    res.json({ success: true, message: "재난 대응 완료 - 알림 제거됨" });
  });

  // 재난 상황 종료
  app.post("/api/emergency/all-clear", async (req, res) => {
    try {
      await emergencyService.sendAllClearNotification();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // 데모용 긴급 상황 트리거 (다국어 지원)
  app.post("/api/emergency/demo", async (req, res) => {
    try {
      const { disasterType = 'earthquake', language = 'ko' } = req.body;
      const notification = await emergencyService.triggerEmergencyDemo(disasterType, language);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // 접근성 알림 관련 라우트
  app.get('/api/accessibility/latest-alert', (req, res) => {
    try {
      const latestAlert = emergencyService.getLatestAccessibilityAlert?.() || null;
      res.json({ 
        success: true, 
        alert: latestAlert 
      });
    } catch (error) {
      console.error('접근성 알림 조회 실패:', error);
      res.status(500).json({ success: false, message: '접근성 알림 조회에 실패했습니다' });
    }
  });

  app.post('/api/accessibility/clear-alert', (req, res) => {
    try {
      if (emergencyService.clearAccessibilityAlert) {
        emergencyService.clearAccessibilityAlert();
      }
      res.json({ success: true, message: '접근성 알림이 초기화되었습니다' });
    } catch (error) {
      console.error('접근성 알림 초기화 실패:', error);
      res.status(500).json({ success: false, message: '접근성 알림 초기화에 실패했습니다' });
    }
  });

  // OpenAI API 테스트 엔드포인트
  app.post("/api/test/openai", async (req, res) => {
    try {
      console.log('🔧 OpenAI API 테스트 시작...');
      
      // 직접 OpenAI API 호출 테스트
      const OpenAI = await import('openai');
      const openai = new OpenAI.default({ 
        apiKey: process.env.OPENAI_API_KEY 
      });

      console.log('🔧 API Key 존재 여부:', !!process.env.OPENAI_API_KEY);
      console.log('🔧 API Key 앞 10자리:', process.env.OPENAI_API_KEY?.substring(0, 10));

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: "안녕하세요! 간단한 테스트입니다. '테스트 성공'이라고 답해주세요."
          }
        ],
        max_tokens: 50
      });

      console.log('🔧 OpenAI 응답 받음:', response.choices[0].message.content);

      res.json({
        success: true,
        message: "OpenAI API 호출 성공",
        result: response.choices[0].message.content,
        usage: response.usage
      });
    } catch (error) {
      console.error('❌ OpenAI API 테스트 실패:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        type: (error as any).type,
        code: (error as any).code
      });
    }
  });

  return httpServer;
}
