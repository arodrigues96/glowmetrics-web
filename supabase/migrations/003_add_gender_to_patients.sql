-- Adicionar coluna gender na tabela patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS gender TEXT;

-- Comentário: gender pode ser 'masculino' ou 'feminino', ou NULL para pacientes existentes

