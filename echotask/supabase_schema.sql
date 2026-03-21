-- Script à exécuter dans le SQL Editor de Supabase

-- 1. Création de la table tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  clean_text TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  due TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted BOOLEAN DEFAULT false,
  is_dirty BOOLEAN DEFAULT false -- utile principalement côté client, mais on peut le stocker
);

-- 2. Activer RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 3. Politique : Les utilisateurs peuvent voir uniquement leurs propres tâches
CREATE POLICY "Users can view their own tasks" 
  ON tasks FOR SELECT 
  USING (auth.uid() = user_id);

-- 4. Politique : Les utilisateurs peuvent insérer leurs propres tâches
CREATE POLICY "Users can insert their own tasks" 
  ON tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 5. Politique : Les utilisateurs peuvent mettre à jour leurs propres tâches
CREATE POLICY "Users can update their own tasks" 
  ON tasks FOR UPDATE 
  USING (auth.uid() = user_id);

-- 6. Politique : Les utilisateurs peuvent supprimer leurs propres tâches (même si on utilise le soft delete)
CREATE POLICY "Users can delete their own tasks" 
  ON tasks FOR DELETE 
  USING (auth.uid() = user_id);

-- 7. Activer le temps réel (Realtime) sur la table tasks
alter publication supabase_realtime add table tasks;
