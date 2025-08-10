# Overview

'안전나침반' (Safe Compass) is a Progressive Web App (PWA) designed to provide personalized emergency response guidance during earthquakes. The application combines pre-registered user profile information with real-time situation data to generate customized safety manuals using RAG (Retrieval-Augmented Generation) technology. Built as a full-stack TypeScript application, it features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database integration via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (2025-08-10)
- **완전한 다국어 OpenAI API 및 PUSH 알림 시스템 통합 (2025-08-10)**:
  - OpenAI API 다국어 프롬프트 시스템 완전 구현 (한국어, 영어, 베트남어, 중국어)
  - 사용자 언어 선택에 따른 맞춤형 재난 대응 가이드 생성 
  - PUSH 알림 자동 감지 및 표시 시스템 개선 - 데모 실행 후 실시간 알림 작동
  - 중복 토스트 알림 문제 완전 해결 - 단일 알림 시스템으로 통합
  - 새로운 Supabase PostgreSQL 데이터베이스 스키마 적용 완료 (Transaction pooling)
  - OpenAI gpt-4o 모델 활용한 언어별 안전 가이드 실시간 생성 시스템
- **PUSH 알림 다국어화 및 완료 시 제거 구현 (2025-08-10)**:
  - PUSH 알림 제목/내용을 4개 언어(한국어, 영어, 베트남어, 중국어)로 다국어화
  - 사용자가 맞춤형 가이드 페이지 완료 시 PUSH 알림 자동 제거 기능 추가
  - TTS 음성 안내를 하드코딩된 한국어에서 사용자 선택 언어로 개선
  - 언어별 정확한 음성 설정 (ko-KR, en-US, vi-VN, zh-CN)
  - 자동 재난 모니터링 시스템 비활성화하여 수동 시뮬레이션만 허용
- **완전한 재난 대응 워크플로우 구현 (2025-08-10)**:
  - 개발 모드 → 재난 시스템 데모 → 지진 시뮬레이션 → Dashboard PUSH 알림 순차 진행
  - 중복 사용자 정보 입력 제거: Emergency에서 바로 OpenAI API 호출하는 /simple-guide 페이지 구현
  - OpenAI API 호출 로깅 및 디버깅 시스템 추가 (실제 gpt-4o 모델 사용)
  - 1차 DB 정보 + 2차 상황 입력 → 직접 개인화 가이드 생성 (단계별 매뉴얼, 대피소 안내, SOS 연락)
  - PUSH 알림에서 화재 → 지진으로 재난 타입 변경으로 일관된 지진 대응 시스템
- **T-Map API 보행자 경로 완전 해결**:
  - 공식 T-Map API 문서 분석으로 정확한 매개변수 설정 완료
  - 클라이언트 API 키 설정 오류 수정으로 실제 T-Map 경로 호출 성공
  - 파란색 실선: T-Map 실제 보행 경로 (218m, 158초, 12개 정확한 좌표)
  - 빨간색 점선: API 오류시 직선 거리 대체 경로
  - 실시간 GPS 기반 정확한 출발지-대피소 간 경로 계산
  - 지도 범례에 경로 타입 구분 표시로 사용자 이해도 향상
  - AccessibilityTest 컴포넌트로 TTS, 진동, 위치, 알림 기능 완전 테스트 가능
  - QR 코드 생성으로 모바일 환경 접근성 테스트 지원
  - /accessibility-test 독립 경로로 포괄적 접근성 검증 환경 제공
- **React Context Error Resolution (Critical Fix)**:
  - Completely rebuilt LanguageContext.tsx to resolve "Cannot read properties of null (reading 'useState')" error
  - Fixed React hooks import issues and component structure
  - Replaced problematic React.FC pattern with direct function components
  - Ensured proper ReactNode typing for children props
- **Enhanced API Performance & Coverage**:
  - Increased API call volume from 1,000 to 5,000 shelters (10 → 50 pages)
  - Expanded search to 50km radius for better regional coverage
  - Successfully retrieving 50+ real earthquake shelters in Daejeon area
  - Optimized filtering to show top 50 closest shelters to user
- **T-Map API Walking Route Integration**:
  - Implemented tmapService.ts with complete pedestrian route calculation
  - Real walking route display using T-Map Pedestrian API
  - Fallback to straight-line routes when API unavailable
  - Enhanced route visualization with distance and time information
  - Interactive shelter markers trigger real route calculation
- **TypeScript Error Resolution**:
  - Fixed all Shelter[] type casting issues in ShelterMapFixed.tsx
  - Proper generic typing for useQuery hooks
  - Eliminated LSP diagnostics errors across codebase
- **Previous Implementation Features**:
  - Language selection UI completely redesigned with flag icons on left, expandable interface for 10 languages (4 active, 6 coming soon)
  - Footer text changed from "지진 재난 대응 AI 가이던스 플랫폼" to "맞춤형 재난 대응 솔루션"
  - Fixed balanced border design (both sides now have proper borders)
  - Language selection flows to Registration page with selected language preserved in database
  - Multi-language support implemented in Registration page with t() translation function
  - Dashboard completely multilingualized (Korean, English, Vietnamese, Chinese)
  - Fixed duplicate language selection UI issue by cleaning up LanguageContext structure
- **Cache Management & Code Cleanup**:
  - Removed legacy unused files: ShelterMap.tsx, ShelterMapSimple.tsx
  - Created comprehensive cache management utilities (cacheUtils.ts)
  - Added dedicated cache clearing page (/clear-cache.html) with full browser cache control
  - Integrated cache clearing buttons in Dashboard demo section
  - Fixed navigation issues caused by stale cache/cookie data
- **Security & API Improvements**:
  - Moved hardcoded API key to secure environment variable (DISASTER_API_KEY)
  - Fixed TypeScript location type errors in ShelterMapInteractive
  - Expanded shelter search radius to 100km for better coverage
- **T-Map Interactive Map Implementation**: 
  - Created ShelterMapInteractive.tsx with full Leaflet integration (replaced T-Map due to key limitations)
  - Real-time GPS location tracking with user position marker
  - Interactive shelter markers with click-to-select functionality
  - Visual route calculation and polyline display from user to selected shelter
  - Automatic map bounds adjustment to show full route
  - Color-coded shelter types (blue=실내, green=옥외, purple=구호소)
  - Real shelter coordinate data integration from backend API
  - Enhanced UI with map status indicators and shelter information cards
- **Real Disaster Response Platform API Integration**:
  - Connected to 행정안전부_지진_대피장소 API (DSSP-IF-00706)
  - Secure API key management through environment variables
  - Created comprehensive ShelterService with distance calculation and filtering
  - Replaced dummy Seoul Gangnam data with authentic nationwide shelter data
  - Automatic shelter type classification (공터→옥외, 건물→실내, etc.)
  - Distance-based sorting and capacity information from real government data

# System Architecture

## Frontend Architecture
The client-side is built as a Progressive Web App using React with TypeScript. The application uses Wouter for client-side routing and TanStack Query for state management and API communication. The UI is constructed with shadcn/ui components built on top of Radix UI primitives and styled with Tailwind CSS. The PWA features include service worker registration for offline functionality, push notifications for emergency alerts, and a responsive design optimized for mobile devices.

## Backend Architecture
The server is built with Express.js and follows a RESTful API design pattern. The backend includes service layers for RAG-based personalized guide generation, speech synthesis, and haptic feedback services. The application uses an in-memory storage implementation as the default storage layer, with interfaces designed to easily swap to database-backed storage using Drizzle ORM.

## Data Storage Design
The database schema is defined using Drizzle ORM with PostgreSQL as the target database. Three main entities are modeled: users (storing personal information and accessibility preferences), companions (emergency contacts), and emergency events (disaster response history). The schema supports JSONB fields for complex data like GPS coordinates and accessibility settings.

**Updated**: The application now uses real Supabase PostgreSQL database instead of in-memory storage. The DatabaseStorage class automatically handles database operations using Drizzle ORM, with automatic fallback to MemStorage if DATABASE_URL is not configured.

## Authentication and User Management
The application uses a simplified user management system with demo user IDs for proof-of-concept purposes. User profiles store comprehensive accessibility information including visual/hearing impairments, mobility limitations, and language preferences to enable personalized emergency responses.

## Emergency Response System
The core emergency workflow begins with disaster detection (currently mocked) that triggers push notifications to users. Users input their current situation (location context, mobility status) which combines with their pre-registered profile to generate personalized safety guides using OpenAI's GPT models and a local knowledge base of emergency manuals.

## Accessibility and Internationalization
The application implements comprehensive accessibility features including text-to-speech for visually impaired users, haptic feedback for hearing-impaired users, and adaptive UI scaling for elderly users. Multi-language support is built into the system with Korean as the primary language and English support included.

# External Dependencies

- **OpenAI API**: Powers the RAG-based personalized guide generation using GPT models for creating customized emergency response instructions
- **Neon Database**: PostgreSQL database hosting service for production data persistence (configured via DATABASE_URL environment variable)
- **Vercel**: Likely deployment platform based on the project structure and build configuration
- **Google Fonts**: Noto Sans KR font family for Korean language support
- **Font Awesome**: Icon library for emergency and safety-related iconography
- **T-Map API**: Referenced for shelter routing and navigation features (implementation pending)
- **Browser APIs**: Extensive use of PWA APIs including Service Workers, Push Notifications, Geolocation, Speech Synthesis, and Vibration APIs
- **shadcn/ui**: Component library built on Radix UI primitives providing accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming