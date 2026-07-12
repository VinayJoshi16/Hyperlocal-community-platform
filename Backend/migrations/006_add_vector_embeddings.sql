-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Add index on embedding for fast cosine distance similarity queries
CREATE INDEX IF NOT EXISTS posts_embedding_idx ON posts USING hnsw (embedding vector_cosine_ops);
