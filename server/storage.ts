import { type User, type InsertUser, type Companion, type InsertCompanion, type EmergencyEvent, type InsertEmergencyEvent } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
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
    
    // Add demo user for testing
    this.seedDemoData();
  }

  private seedDemoData() {
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
      accessibility: insertUser.accessibility || null,
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
      accessibility: updates.accessibility !== undefined ? updates.accessibility : existingUser.accessibility
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
      personalizedGuide: insertEvent.personalizedGuide || null,
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
    console.log('Initializing DatabaseStorage with DATABASE_URL');
    const sql = neon(process.env.DATABASE_URL);
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
        accessibility: Array.isArray(insertUser.accessibility) ? insertUser.accessibility : null,
        gender: insertUser.gender || null,
      };
      console.log('Processed user data:', userData);
      const result = await this.db.insert(users).values(userData).returning();
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
      accessibility: Array.isArray(updateData.accessibility) ? updateData.accessibility : null,
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
      situation: event.situation || null,
      personalizedGuide: event.personalizedGuide || null,
    };
    const result = await this.db.insert(emergencyEvents).values(eventData).returning();
    return result[0];
  }

  async getEmergencyEventsByUserId(userId: string): Promise<EmergencyEvent[]> {
    return await this.db.select().from(emergencyEvents).where(eq(emergencyEvents.userId, userId));
  }
}

// Switch between MemStorage and DatabaseStorage
// Use DatabaseStorage for production, MemStorage for development/testing
let storage: IStorage;

try {
  if (process.env.DATABASE_URL) {
    console.log('Using DatabaseStorage with Supabase');
    storage = new DatabaseStorage();
  } else {
    console.log('Using MemStorage (no DATABASE_URL found)');
    storage = new MemStorage();
  }
} catch (error) {
  console.error('Failed to initialize DatabaseStorage, falling back to MemStorage:', error);
  storage = new MemStorage();
}

export { storage };
