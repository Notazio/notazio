-- Execute este script no SQL Editor do seu painel do Supabase

-- 1. Cria a tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name TEXT DEFAULT '', -- Nome completo do usuário
    logo TEXT, -- Logo em base64 (string)
    color_primary TEXT DEFAULT '#2563eb',
    color_secondary TEXT DEFAULT '#0f172a',
    emitter_name TEXT DEFAULT '',
    emitter_doc TEXT DEFAULT '',
    emitter_phone TEXT DEFAULT '',
    emitter_email TEXT DEFAULT '',
    emitter_address TEXT DEFAULT ''
);

-- 2. Habilita o RLS (Row Level Security) para perfis
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.user_profiles;

CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem criar seu próprio perfil" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- 2.1 Adiciona a coluna name caso a tabela já existisse
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';

-- 3. Cria a tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    document TEXT DEFAULT '', -- CPF/CNPJ
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT ''
);

-- 4. Habilita o RLS para clientes
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários gerenciam seus próprios clientes" ON public.clients;
CREATE POLICY "Usuários gerenciam seus próprios clientes" ON public.clients FOR ALL USING (auth.uid() = user_id);

-- 5. Cria a tabela de documentos (recibos/orçamentos)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    type TEXT NOT NULL, -- 'receipt' ou 'estimate'
    number TEXT NOT NULL, -- Número do documento
    date TEXT NOT NULL, -- Data de emissão
    client_name TEXT NOT NULL, -- Nome do cliente gravado no momento (caso exclua o cliente)
    client_document TEXT DEFAULT '',
    value NUMERIC(10, 2) NOT NULL,
    description TEXT,
    items JSONB DEFAULT '[]'::jsonb, -- Se houver lista de itens no futuro
    status TEXT DEFAULT 'gerado' -- 'gerado', 'pago', etc.
);

-- 6. Habilita o RLS para documentos
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários gerenciam seus próprios documentos" ON public.documents;
CREATE POLICY "Usuários gerenciam seus próprios documentos" ON public.documents FOR ALL USING (auth.uid() = user_id);

-- 7. Função que cria um perfil automaticamente quando alguém se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, emitter_email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Gatilho (Trigger) que roda a função acima
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
