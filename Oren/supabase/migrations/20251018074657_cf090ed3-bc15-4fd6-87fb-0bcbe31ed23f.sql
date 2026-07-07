-- Drop existing public access policies
DROP POLICY IF EXISTS "Public access to clients" ON public.clients;
DROP POLICY IF EXISTS "Public access to bills" ON public.bills;
DROP POLICY IF EXISTS "Public access to quotations" ON public.quotations;
DROP POLICY IF EXISTS "Public access to projects" ON public.projects;

-- Clients table - Restrict to authenticated users only
CREATE POLICY "Authenticated users can view clients"
ON public.clients
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete clients"
ON public.clients
FOR DELETE
TO authenticated
USING (true);

-- Bills table - Restrict to authenticated users only
CREATE POLICY "Authenticated users can view bills"
ON public.bills
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert bills"
ON public.bills
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update bills"
ON public.bills
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete bills"
ON public.bills
FOR DELETE
TO authenticated
USING (true);

-- Quotations table - Restrict to authenticated users only
CREATE POLICY "Authenticated users can view quotations"
ON public.quotations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert quotations"
ON public.quotations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotations"
ON public.quotations
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete quotations"
ON public.quotations
FOR DELETE
TO authenticated
USING (true);

-- Projects table - Restrict to authenticated users only
CREATE POLICY "Authenticated users can view projects"
ON public.projects
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (true);

-- Ratings table - Keep public access for the public rating feature
-- (already has proper policies)