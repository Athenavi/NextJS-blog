-- Create activity logging tables for tracking user actions

-- Activity types table for categorization
CREATE TABLE IF NOT EXISTS public.activity_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  color_class VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  activity_type_id INTEGER REFERENCES public.activity_types(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'article', 'media', 'user', 'comment', etc.
  entity_id VARCHAR(50), -- ID of the affected entity
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB, -- Additional data like file size, article title, etc.
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activity tables
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_types (public read access)
CREATE POLICY "activity_types_public_read" ON public.activity_types
  FOR SELECT USING (true);

-- RLS policies for activity_logs
CREATE POLICY "activity_logs_public_read" ON public.activity_logs
  FOR SELECT USING (true);

CREATE POLICY "activity_logs_authenticated_insert" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type_id ON public.activity_logs(activity_type_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON public.activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON public.activity_logs(status);

-- Insert default activity types
INSERT INTO public.activity_types (code, name, description, icon, color_class) VALUES
  ('article_created', '创建文章', '用户创建了新文章', '📝', 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'),
  ('article_updated', '更新文章', '用户更新了文章', '✏️', 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'),
  ('article_deleted', '删除文章', '用户删除了文章', '🗑️', 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'),
  ('article_published', '发布文章', '用户发布了文章', '📢', 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'),
  ('media_uploaded', '上传媒体', '用户上传了媒体文件', '📁', 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'),
  ('media_deleted', '删除媒体', '用户删除了媒体文件', '🗑️', 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'),
  ('user_registered', '用户注册', '新用户注册', '👤', 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'),
  ('user_login', '用户登录', '用户登录系统', '🔑', 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'),
  ('user_logout', '用户登出', '用户登出系统', '🚪', 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'),
  ('comment_created', '创建评论', '用户创建了评论', '💬', 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'),
  ('comment_deleted', '删除评论', '用户删除了评论', '🗑️', 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'),
  ('profile_updated', '更新资料', '用户更新了个人资料', '👤', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'),
  ('password_changed', '修改密码', '用户修改了密码', '🔒', 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'),
  ('role_assigned', '分配角色', '为用户分配了角色', '👑', 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'),
  ('permission_granted', '授予权限', '为用户授予了权限', '✅', 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200')
ON CONFLICT (code) DO NOTHING;

-- Create function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_activity_code VARCHAR(50),
  p_entity_type VARCHAR(50),
  p_entity_id VARCHAR(50),
  p_title VARCHAR(255),
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address VARCHAR(45) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  v_activity_type_id INTEGER;
  v_log_id BIGINT;
BEGIN
  -- Get activity type ID
  SELECT id INTO v_activity_type_id 
  FROM public.activity_types 
  WHERE code = p_activity_code;
  
  IF v_activity_type_id IS NULL THEN
    RAISE EXCEPTION 'Activity type with code % not found', p_activity_code;
  END IF;
  
  -- Insert activity log
  INSERT INTO public.activity_logs (
    user_id, activity_type_id, entity_type, entity_id, 
    title, description, metadata, ip_address, user_agent
  ) VALUES (
    p_user_id, v_activity_type_id, p_entity_type, p_entity_id,
    p_title, p_description, p_metadata, p_ip_address, p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_activity(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, VARCHAR, TEXT) TO authenticated;

-- Create function to get user activities with pagination
CREATE OR REPLACE FUNCTION public.get_user_activities(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL,
  p_activity_type VARCHAR(50) DEFAULT NULL,
  p_entity_type VARCHAR(50) DEFAULT NULL
) RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  username VARCHAR(255),
  user_avatar VARCHAR(255),
  activity_type_code VARCHAR(50),
  activity_type_name VARCHAR(100),
  activity_type_icon VARCHAR(10),
  activity_type_color VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  metadata JSONB,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    u.username,
    u.profile_picture as user_avatar,
    at.code as activity_type_code,
    at.name as activity_type_name,
    at.icon as activity_type_icon,
    at.color_class as activity_type_color,
    al.entity_type,
    al.entity_id,
    al.title,
    al.description,
    al.metadata,
    al.status,
    al.created_at
  FROM public.activity_logs al
  JOIN public.activity_types at ON al.activity_type_id = at.id
  LEFT JOIN public.users u ON al.user_id = u.id
  WHERE (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (p_activity_type IS NULL OR at.code = p_activity_type)
    AND (p_entity_type IS NULL OR al.entity_type = p_entity_type)
  ORDER BY al.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_activities(INTEGER, INTEGER, UUID, VARCHAR, VARCHAR) TO authenticated;
