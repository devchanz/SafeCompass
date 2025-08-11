# Overview

'안전나침반' (Safe Compass) is a Progressive Web App (PWA) designed to provide personalized emergency response guidance during earthquakes. The application combines pre-registered user profile information with real-time situation data to generate customized safety manuals using RAG (Retrieval-Augmented Generation) technology. It aims to offer tailored guidance, including step-by-step manuals, shelter information, and SOS contact, to enhance safety and potentially save lives during seismic events.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built as a Progressive Web App using React with TypeScript, Wouter for routing, and TanStack Query for state management and API communication. UI components are built with shadcn/ui on top of Radix UI primitives and styled with Tailwind CSS. PWA features include service worker registration for offline functionality, push notifications for emergency alerts, and a responsive design optimized for mobile devices. It also implements comprehensive accessibility features including text-to-speech, haptic feedback, and adaptive UI scaling, alongside multi-language support (Korean, English, Vietnamese, Chinese).

## Backend Architecture
The server is built with Express.js following a RESTful API design pattern. It includes service layers for RAG-based personalized guide generation, speech synthesis, and haptic feedback. The backend interacts with a PostgreSQL database via Drizzle ORM.

## Data Storage Design
The database schema, defined using Drizzle ORM, models users (personal information, accessibility preferences), companions (emergency contacts), and emergency events (disaster response history). It utilizes Supabase PostgreSQL for data persistence, with JSONB fields for complex data.

## Authentication and User Management
The application uses a simplified user management system with demo user IDs. User profiles store comprehensive accessibility information (visual/hearing impairments, mobility limitations, language preferences) to enable personalized emergency responses.

## Emergency Response System
The core workflow involves real-time disaster detection from Korean government APIs triggering push notifications. The system uses a Rule-based classification approach (LLM analysis disabled for cost optimization) to categorize disasters into 위급재난/긴급재난/일반재난. Users input their current situation, which is combined with their pre-registered profile to generate personalized safety guides using OpenAI's GPT models and a local knowledge base. The system supports multi-language responses and includes features like GPS-based SOS messaging to companions or emergency services, and T-Map API integration for shelter navigation.

# External Dependencies

- **OpenAI API**: For RAG-based personalized guide generation using GPT models.
- **Supabase PostgreSQL**: Database hosting service for data persistence.
- **Vercel**: Potential deployment platform.
- **Google Fonts**: For Korean language support (Noto Sans KR).
- **Font Awesome**: Icon library.
- **T-Map API**: For shelter routing, navigation, and pedestrian path calculation.
- **Browser APIs**: Service Workers, Push Notifications, Geolocation, Speech Synthesis, and Vibration APIs.
- **shadcn/ui**: Component library for UI.
- **Tailwind CSS**: Utility-first CSS framework.
- **행정안전부_지진_대피장소 API (DSSP-IF-00706)**: For real earthquake shelter data.
- **재난안전데이터공유플랫폼 API (DSSP-IF-00247)**: Real-time emergency disaster message monitoring from Korean government.