DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tickets'
      AND policyname = 'Support pode atualizar tickets'
  ) THEN
    CREATE POLICY "Support pode atualizar tickets"
    ON public.tickets
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role IN ('admin', 'support')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role IN ('admin', 'support')
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'users_update_admin_only'
  ) THEN
    CREATE POLICY "users_update_admin_only"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;
