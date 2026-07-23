-- Grant full permissions to postgres, service_role on public schema tables and sequences
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated, anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated, anon;

-- Note: RLS policies will still protect tables from unauthorized access for anon and authenticated roles.
