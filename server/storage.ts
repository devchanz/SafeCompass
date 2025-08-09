import { type User, type InsertUser, type Companion, type InsertCompanion, type EmergencyEvent, type InsertEmergencyEvent } from "@shared/schema";
import { randomUUID } from "crypto";

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
      relationship: 'family',
      createdAt: new Date()
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
      accessibility: Array.isArray(insertUser.accessibility) ? insertUser.accessibility : null,
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
      accessibility: updates.accessibility !== undefined ? (Array.isArray(updates.accessibility) ? updates.accessibility : null) : existingUser.accessibility
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

export const storage = new MemStorage();
