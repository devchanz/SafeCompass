-- Supabase 데이터베이스 테이블 생성 스크립트
-- 이 스크립트를 Supabase SQL 에디터에서 실행하세요

-- Users 테이블 생성
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  address TEXT,
  language TEXT DEFAULT 'korean',
  accessibility TEXT[],
  mobility TEXT DEFAULT 'independent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companions 테이블 생성
CREATE TABLE companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Events 테이블 생성
CREATE TABLE emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  location TEXT,
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_companions_user_id ON companions(user_id);
CREATE INDEX idx_emergency_events_user_id ON emergency_events(user_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Row Level Security (RLS) 활성화 (보안 강화)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;

-- 기본 정책 생성 (모든 사용자가 접근 가능 - 실제 운영에서는 더 제한적으로 설정)
CREATE POLICY "Enable all operations for all users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON companions FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON emergency_events FOR ALL USING (true);