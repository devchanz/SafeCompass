-- Supabase RLS (Row Level Security) 설정 SQL
-- 데이터베이스 연결 성공 후 Supabase SQL Editor에서 실행하세요

-- 1. 기존 정책들 제거 (오류 방지)
DROP POLICY IF EXISTS "Enable all access for users" ON public.users;
DROP POLICY IF EXISTS "Enable all access for companions" ON public.companions;  
DROP POLICY IF EXISTS "Enable all access for emergency_events" ON public.emergency_events;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.users;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.companions;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.emergency_events;

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;

-- 3. 전체 공개 접근 정책 (데모용 - 실제 운영시 수정 필요)
-- 모든 사용자가 모든 작업을 수행할 수 있음 (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Enable full access for users" ON public.users FOR ALL USING (true);
CREATE POLICY "Enable full access for companions" ON public.companions FOR ALL USING (true);  
CREATE POLICY "Enable full access for emergency_events" ON public.emergency_events FOR ALL USING (true);

-- 4. 성능 최적화 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_language ON public.users(language);
CREATE INDEX IF NOT EXISTS idx_users_accessibility ON public.users USING GIN(accessibility);
CREATE INDEX IF NOT EXISTS idx_companions_user_id ON public.companions(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user_id ON public.emergency_events(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_type ON public.emergency_events(type);
CREATE INDEX IF NOT EXISTS idx_emergency_events_created_at ON public.emergency_events(created_at);

-- 5. 정책 확인 쿼리 (선택사항)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';