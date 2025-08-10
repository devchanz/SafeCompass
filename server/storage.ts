import { type User, type InsertUser, type Companion, type InsertCompanion, type EmergencyEvent, type InsertEmergencyEvent } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, companions, emergencyEvents } from "@shared/schema";
import { eq } from 'drizzle-orm';

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Companions
  getCompanionsByUserId(userId: string): Promise<Companion[]>;
  createCompanion(companion: InsertCompanion): Promise<Companion>;
  
  // Emergency Events
  createEmergencyEvent(event: InsertEmergencyEvent): Promise<EmergencyEvent>;
  getEmergencyEventsByUserId(userId: string): Promise<EmergencyEvent[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companions: Map<string, Companion>;
  private emergencyEvents: Map<string, EmergencyEvent>;

  constructor() {
    this.users = new Map();
    this.companions = new Map();
    this.emergencyEvents = new Map();
    
    // Only add demo data in development mode and if explicitly enabled
    this.seedDemoData();
  }

  private seedDemoData() {
    // Check if we're in development and demo data is requested
    const enableDemoData = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEMO_DATA === 'true';
    
    if (enableDemoData) {
      const demoUser: User = {
        id: 'demo-user-1',
        name: '김민수',
        age: 34,
        gender: '남성',
        address: '서울특별시 강남구 역삼동 123-45',
        language: 'korean',
        accessibility: ['visual'],
        mobility: 'independent',
        createdAt: new Date()
      };
      
      const demoCompanion: Companion = {
        id: 'demo-companion-1',
        userId: 'demo-user-1',
        name: '김영희',
        phone: '010-1234-5678',
        relationship: 'family'
      };

      this.users.set(demoUser.id, demoUser);
      this.companions.set(demoCompanion.id, demoCompanion);
      console.log('Demo data loaded for development');
    } else {
      console.log('Starting with clean storage - no demo data');
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      gender: insertUser.gender || null,
      accessibility: Array.isArray(insertUser.accessibility) ? insertUser.accessibility as string[] : [],
      language: insertUser.language || 'ko',
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { 
      ...existingUser, 
      ...updates,
      gender: updates.gender !== undefined ? updates.gender || null : existingUser.gender,
      accessibility: updates.accessibility !== undefined ? (Array.isArray(updates.accessibility) ? updates.accessibility as string[] : []) : existingUser.accessibility
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCompanionsByUserId(userId: string): Promise<Companion[]> {
    return Array.from(this.companions.values()).filter(
      (companion) => companion.userId === userId
    );
  }

  async createCompanion(insertCompanion: InsertCompanion): Promise<Companion> {
    const id = randomUUID();
    const companion: Companion = { ...insertCompanion, id };
    this.companions.set(id, companion);
    return companion;
  }

  async createEmergencyEvent(insertEvent: InsertEmergencyEvent): Promise<EmergencyEvent> {
    const id = randomUUID();
    const event: EmergencyEvent = { 
      ...insertEvent,
      id,
      location: insertEvent.location || null,
      situation: insertEvent.situation ? {
        locationContext: insertEvent.situation.locationContext,
        canMove: insertEvent.situation.canMove,
        additionalInfo: typeof insertEvent.situation.additionalInfo === 'string' ? insertEvent.situation.additionalInfo : undefined
      } : null,
      magnitude: insertEvent.magnitude || null,
      personalizedGuide: insertEvent.personalizedGuide || null,
      userClassification: insertEvent.userClassification || null,
      createdAt: new Date()
    };
    this.emergencyEvents.set(id, event);
    return event;
  }

  async getEmergencyEventsByUserId(userId: string): Promise<EmergencyEvent[]> {
    return Array.from(this.emergencyEvents.values()).filter(
      (event) => event.userId === userId
    );
  }
}

// Database Storage Implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    // DATABASE_URL 유효성 검사 및 정리
    const dbUrl = process.env.DATABASE_URL.trim();
    if (dbUrl.includes('pospostgresql') || !dbUrl.startsWith('postgresql://')) {
      console.error('⚠️ DATABASE_URL이 손상되었습니다. 메모리 저장소를 사용하세요.');
      throw new Error('DATABASE_URL format is invalid');
    }
    
    console.log('Initializing DatabaseStorage with Supabase PostgreSQL');
    const sql = postgres(dbUrl);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      console.log(`Getting user with id: ${id}`);
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      console.log(`User query result:`, result);
      return result[0];
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log('Creating user with data:', insertUser);
      const userData = {
        ...insertUser,
        accessibility: Array.isArray(insertUser.accessibility) ? insertUser.accessibility as string[] : [],
        gender: insertUser.gender || null,
      };
      console.log('Processed user data:', userData);
      const result = await this.db.insert(users).values([userData]).returning();
      console.log('User creation result:', result);
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const cleanedData = {
      ...updateData,
      accessibility: Array.isArray(updateData.accessibility) ? updateData.accessibility as string[] : [],
      gender: updateData.gender || null,
    };
    const result = await this.db.update(users).set(cleanedData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getCompanionsByUserId(userId: string): Promise<Companion[]> {
    return await this.db.select().from(companions).where(eq(companions.userId, userId));
  }

  async createCompanion(companion: InsertCompanion): Promise<Companion> {
    const result = await this.db.insert(companions).values(companion).returning();
    return result[0];
  }

  async createEmergencyEvent(event: InsertEmergencyEvent): Promise<EmergencyEvent> {
    const eventData = {
      ...event,
      location: event.location || null,
      situation: event.situation ? {
        locationContext: event.situation.locationContext,
        canMove: event.situation.canMove,
        additionalInfo: typeof event.situation.additionalInfo === 'string' ? event.situation.additionalInfo : undefined
      } : null,
      personalizedGuide: event.personalizedGuide || null,
    };
    const result = await this.db.insert(emergencyEvents).values([eventData]).returning();
    return result[0];
  }

  async getEmergencyEventsByUserId(userId: string): Promise<EmergencyEvent[]> {
    return await this.db.select().from(emergencyEvents).where(eq(emergencyEvents.userId, userId));
  }
}

// Create a smart storage that can handle database connection failures
class SmartStorage implements IStorage {
  private primaryStorage: IStorage;
  private fallbackStorage: IStorage;
  private useDatabase: boolean;

  constructor() {
    this.fallbackStorage = new MemStorage();
    this.useDatabase = false;

    if (process.env.DATABASE_URL) {
      try {
        console.log('Attempting to use DatabaseStorage with Supabase');
        this.primaryStorage = new DatabaseStorage();
        this.useDatabase = true;
      } catch (error) {
        console.error('Failed to initialize DatabaseStorage, using MemStorage:', error);
        this.primaryStorage = this.fallbackStorage;
      }
    } else {
      console.log('Using MemStorage (no DATABASE_URL found)');
      this.primaryStorage = this.fallbackStorage;
    }
  }

  private async executeWithFallback<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.useDatabase) {
      return operation();
    }

    try {
      const result = await operation.call(this.primaryStorage);
      return result;
    } catch (error) {
      console.error('Database operation failed, falling back to MemStorage:', error);
      // DB 실패 시 완전히 메모리 저장소로 전환
      this.useDatabase = false;
      this.primaryStorage = this.fallbackStorage;
      // 폴백 저장소로 다시 실행
      return operation.call(this.fallbackStorage);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.executeWithFallback(() => this.primaryStorage.getUser(id));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.executeWithFallback(() => this.primaryStorage.createUser(insertUser));
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    return this.executeWithFallback(() => this.primaryStorage.updateUser(id, updateData));
  }

  async getCompanionsByUserId(userId: string): Promise<Companion[]> {
    return this.executeWithFallback(() => this.primaryStorage.getCompanionsByUserId(userId));
  }

  async createCompanion(companion: InsertCompanion): Promise<Companion> {
    return this.executeWithFallback(() => this.primaryStorage.createCompanion(companion));
  }

  async createEmergencyEvent(event: InsertEmergencyEvent): Promise<EmergencyEvent> {
    return this.executeWithFallback(() => this.primaryStorage.createEmergencyEvent(event));
  }

  async getEmergencyEventsByUserId(userId: string): Promise<EmergencyEvent[]> {
    return this.executeWithFallback(() => this.primaryStorage.getEmergencyEventsByUserId(userId));
  }
}

export const storage = new SmartStorage();
