# Overview

'안전나침반' (Safe Compass) is a Progressive Web App (PWA) designed to provide personalized emergency response guidance during earthquakes. The application combines pre-registered user profile information with real-time situation data to generate customized safety manuals using RAG (Retrieval-Augmented Generation) technology. Built as a full-stack TypeScript application, it features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database integration via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built as a Progressive Web App using React with TypeScript. The application uses Wouter for client-side routing and TanStack Query for state management and API communication. The UI is constructed with shadcn/ui components built on top of Radix UI primitives and styled with Tailwind CSS. The PWA features include service worker registration for offline functionality, push notifications for emergency alerts, and a responsive design optimized for mobile devices.

## Backend Architecture
The server is built with Express.js and follows a RESTful API design pattern. The backend includes service layers for RAG-based personalized guide generation, speech synthesis, and haptic feedback services. The application uses an in-memory storage implementation as the default storage layer, with interfaces designed to easily swap to database-backed storage using Drizzle ORM.

## Data Storage Design
The database schema is defined using Drizzle ORM with PostgreSQL as the target database. Three main entities are modeled: users (storing personal information and accessibility preferences), companions (emergency contacts), and emergency events (disaster response history). The schema supports JSONB fields for complex data like GPS coordinates and accessibility settings.

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