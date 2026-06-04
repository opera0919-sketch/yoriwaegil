-- 레시피
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  base_servings int DEFAULT 2,
  total_minutes int DEFAULT 30,
  difficulty text DEFAULT '보통',
  tags text[] DEFAULT '{}',
  favorite bool DEFAULT false,
  in_cart bool DEFAULT false,
  note text DEFAULT '',
  cook_count int DEFAULT 0,
  last_cooked_at timestamptz,
  version int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 재료
CREATE TABLE ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT '',
  amount numeric DEFAULT 0,
  unit text DEFAULT '',
  grp text DEFAULT '기타',
  sort_order int DEFAULT 0
);

-- 조리 단계
CREATE TABLE steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes ON DELETE CASCADE NOT NULL,
  title text DEFAULT '',
  content text DEFAULT '',
  timer_seconds int,
  sort_order int DEFAULT 0
);

-- 버전 이력
CREATE TABLE recipe_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes ON DELETE CASCADE NOT NULL,
  version int NOT NULL,
  snapshot jsonb NOT NULL,
  changed_at timestamptz DEFAULT now()
);

-- 조리 기록
CREATE TABLE cook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  cooked_at timestamptz DEFAULT now(),
  servings int DEFAULT 2,
  home_rating int CHECK (home_rating BETWEEN 1 AND 5),
  memo text
);

-- RLS 활성화
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cook_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "own recipes" ON recipes USING (user_id = auth.uid());
CREATE POLICY "own ingredients" ON ingredients USING (
  recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
);
CREATE POLICY "own steps" ON steps USING (
  recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
);
CREATE POLICY "own versions" ON recipe_versions USING (
  recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
);
CREATE POLICY "own logs" ON cook_logs USING (user_id = auth.uid());
