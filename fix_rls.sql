-- Only create the UPDATE policy if it doesn't exist
CREATE POLICY "requests_update" ON project_requests FOR UPDATE USING (true) WITH CHECK (true);
