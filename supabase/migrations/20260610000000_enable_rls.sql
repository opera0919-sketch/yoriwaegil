-- RLS 활성화: 읽기는 공개(anon), 쓰기는 로그인 사용자(authenticated)만.
-- 현재 앱 동작과 호환: 비로그인은 둘러보기만, 모든 쓰기는 requireLogin 뒤에서 사용자 JWT로 수행됨.

alter table public.recipes enable row level security;
alter table public.app_users enable row level security;

-- recipes: 가족 공유 앱이라 로그인 사용자는 모든 레시피를 수정/삭제할 수 있다(기존 동작 유지)
drop policy if exists "recipes_select_all" on public.recipes;
drop policy if exists "recipes_insert_auth" on public.recipes;
drop policy if exists "recipes_update_auth" on public.recipes;
drop policy if exists "recipes_delete_auth" on public.recipes;

create policy "recipes_select_all" on public.recipes
  for select to anon, authenticated using (true);
create policy "recipes_insert_auth" on public.recipes
  for insert to authenticated with check (true);
create policy "recipes_update_auth" on public.recipes
  for update to authenticated using (true) with check (true);
create policy "recipes_delete_auth" on public.recipes
  for delete to authenticated using (true);

-- app_users: 프로필은 본인 행만 생성/수정 가능 (id는 text — auth.uid() 캐스팅 필요)
drop policy if exists "app_users_select_all" on public.app_users;
drop policy if exists "app_users_insert_self" on public.app_users;
drop policy if exists "app_users_update_self" on public.app_users;

create policy "app_users_select_all" on public.app_users
  for select to anon, authenticated using (true);
create policy "app_users_insert_self" on public.app_users
  for insert to authenticated with check (id = (select auth.uid())::text);
create policy "app_users_update_self" on public.app_users
  for update to authenticated
  using (id = (select auth.uid())::text)
  with check (id = (select auth.uid())::text);
