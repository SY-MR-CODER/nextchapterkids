-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    stories_this_month INTEGER DEFAULT 0,
    subscription_reset_date TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create children table
CREATE TABLE children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    reading_level VARCHAR(50),
    favorite_books TEXT[], -- Array of favorite books
    interests TEXT,
    stories_generated INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create stories table
CREATE TABLE stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    child_name VARCHAR(255) NOT NULL,
    story_content TEXT NOT NULL,
    favorite_books TEXT[],
    imagination_prompt TEXT,
    age INTEGER,
    reading_level VARCHAR(50),
    subscription_plan VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_child_id ON stories(child_id);
CREATE INDEX idx_stories_created_at ON stories(created_at);

-- Disable Row Level Security for now (since we're using custom auth)
-- In production, you might want to enable RLS and create proper policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE children DISABLE ROW LEVEL SECURITY;
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;

-- Insert a test user (you'll need to hash the password properly)
INSERT INTO users (id, parent_name, email, password_hash, subscription_plan) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Test Parent', 
    'test@example.com', 
    'test123', -- In production, this should be properly hashed
    'free'
);

-- Insert a test child
INSERT INTO children (user_id, name, age, reading_level, favorite_books, interests, stories_generated)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Emma',
    7,
    'intermediate',
    ARRAY['Harry Potter', 'The Cat in the Hat'],
    'unicorns, rainbows, and magical adventures',
    3
);