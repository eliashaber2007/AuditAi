DROP TRIGGER IF EXISTS on_auth_user_created_grant_credit ON auth.users;
DROP FUNCTION IF EXISTS public.grant_initial_credit();