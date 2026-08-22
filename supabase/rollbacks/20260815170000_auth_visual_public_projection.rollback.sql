-- Safe rollback for the public projection. The identity function must be restored
-- from 20260815100000_unified_account_dashboard.sql before deploying this rollback.
drop function if exists public.get_public_homepage_content(text);
