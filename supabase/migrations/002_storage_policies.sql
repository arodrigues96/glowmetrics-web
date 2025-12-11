-- Storage RLS Policies para buckets photos e reports

-- Políticas para bucket 'photos'
-- Permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Permitir que usuários autenticados vejam suas próprias fotos
CREATE POLICY "Authenticated users can view photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'photos');

-- Permitir que usuários autenticados deletem suas próprias fotos
CREATE POLICY "Authenticated users can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photos');

-- Políticas para bucket 'reports'
-- Permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');

-- Permitir que usuários autenticados vejam seus próprios relatórios
CREATE POLICY "Authenticated users can view reports"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'reports');

-- Permitir que usuários autenticados deletem seus próprios relatórios
CREATE POLICY "Authenticated users can delete reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'reports');

