-- 요리외길 실제 스키마 (앱 코드의 toRow/fromRow 기준, 비정규화 JSON 구조)
-- Supabase 대시보드 → SQL Editor 에서 실행.

-- 사용자 프로필
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY,            -- auth.users.id 와 동일
  name text DEFAULT '사용자',
  emoji text DEFAULT '🧑‍🍳',
  color text DEFAULT '',
  avatar_url text DEFAULT '',
  profile_set bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 레시피 (재료/단계/즐겨찾기/메모 등은 JSON 컬럼으로 보관)
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT '기타',
  title text NOT NULL,
  description text DEFAULT '',
  base_servings int DEFAULT 2,
  total_minutes int DEFAULT 30,
  difficulty text DEFAULT '보통',
  tags jsonb DEFAULT '[]',
  ingredients jsonb DEFAULT '[]',
  steps jsonb DEFAULT '[]',
  created_by text DEFAULT '',
  updated_by text DEFAULT '',
  favorites jsonb DEFAULT '[]',
  in_cart_by jsonb DEFAULT '[]',
  notes jsonb DEFAULT '{}',
  comments jsonb DEFAULT '[]',
  cook_logs jsonb DEFAULT '[]',
  source_url text DEFAULT '',
  source_title text DEFAULT '',
  version int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- RLS: 공유형 가계 레시피 박스
--  · 로그인 사용자: 모든 레시피/프로필 읽기·쓰기 (가족 공유)
--  · 비로그인(anon): 읽기 전용 둘러보기
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes   ENABLE ROW LEVEL SECURITY;

-- 재실행 가능하도록 기존 정책 제거 후 재생성
DROP POLICY IF EXISTS "recipes read"  ON recipes;
DROP POLICY IF EXISTS "recipes write" ON recipes;
DROP POLICY IF EXISTS "users read"    ON app_users;
DROP POLICY IF EXISTS "users write"   ON app_users;
DROP POLICY IF EXISTS "users self"    ON app_users;
-- 과거 스키마의 정책명도 정리
DROP POLICY IF EXISTS "own recipes"   ON recipes;

-- 누구나 읽기 (둘러보기 허용)
CREATE POLICY "recipes read" ON recipes FOR SELECT USING (true);
CREATE POLICY "users read"   ON app_users FOR SELECT USING (true);

-- 로그인 사용자는 모든 레시피 변경 가능 (INSERT/UPDATE/DELETE)
CREATE POLICY "recipes write" ON recipes
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 프로필은 본인 것만 생성/수정
CREATE POLICY "users self" ON app_users
  FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Realtime 반영용 (대시보드 Replication 에서 recipes, app_users 활성화 필요)
