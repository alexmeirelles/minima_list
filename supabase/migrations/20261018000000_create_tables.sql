-- Migration: Create profiles, someday_lists, and todos with Row Level Security

-- 1. Profiles & Preferences table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  workspace_name TEXT DEFAULT '',
  dark_mode BOOLEAN DEFAULT false,
  grid_column_size INTEGER DEFAULT 5,
  accent_color TEXT DEFAULT '#852CE6',
  text_size TEXT DEFAULT 'M',
  spacing TEXT DEFAULT 'M',
  show_completed BOOLEAN DEFAULT true,
  show_lines BOOLEAN DEFAULT true,
  bullet_style TEXT DEFAULT 'none',
  rollover_enabled BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'pt',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Someday lists table
CREATE TABLE IF NOT EXISTS public.someday_lists (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date_key TEXT, -- ISO string YYYY-MM-DD for weekday tasks
  list_id TEXT,  -- ID of someday_list for Someday tasks
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_todos_user_date ON public.todos(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_todos_user_list ON public.todos(user_id, list_id);
CREATE INDEX IF NOT EXISTS idx_someday_lists_user ON public.someday_lists(user_id, order_index);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.someday_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Someday Lists Policies
DROP POLICY IF EXISTS "Users can view own someday lists" ON public.someday_lists;
CREATE POLICY "Users can view own someday lists" ON public.someday_lists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own someday lists" ON public.someday_lists;
CREATE POLICY "Users can insert own someday lists" ON public.someday_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own someday lists" ON public.someday_lists;
CREATE POLICY "Users can update own someday lists" ON public.someday_lists
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own someday lists" ON public.someday_lists;
CREATE POLICY "Users can delete own someday lists" ON public.someday_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Todos Policies
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
CREATE POLICY "Users can view own todos" ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own todos" ON public.todos;
CREATE POLICY "Users can insert own todos" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own todos" ON public.todos;
CREATE POLICY "Users can update own todos" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own todos" ON public.todos;
CREATE POLICY "Users can delete own todos" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to automatically provision profile and default lists on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  -- Insert default Someday lists
  INSERT INTO public.someday_lists (id, user_id, name, order_index) VALUES
    ('someday-default', NEW.id, 'Someday', 0),
    (gen_random_uuid()::text, NEW.id, 'Lista de compras', 1),
    (gen_random_uuid()::text, NEW.id, 'Filmes para assistir', 2),
    (gen_random_uuid()::text, NEW.id, 'Livros para ler', 3),
    (gen_random_uuid()::text, NEW.id, 'Ideias', 4);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
