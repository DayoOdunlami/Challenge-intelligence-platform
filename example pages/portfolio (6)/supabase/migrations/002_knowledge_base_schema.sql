-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_sources table to track different sources
CREATE TABLE knowledge_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('website', 'pdf', 'docx', 'manual')),
  url TEXT, -- For websites and file URLs
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create knowledge_documents table for processed content
CREATE TABLE knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  url TEXT, -- Original URL if from web scraping
  file_path TEXT, -- File path if uploaded document
  word_count INTEGER,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}' -- Store additional metadata like headers, tags, etc.
);

-- Create knowledge_chunks table for text chunks with embeddings
CREATE TABLE knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  word_count INTEGER,
  embedding vector(1536), -- OpenAI ada-002 embedding dimension
  metadata JSONB DEFAULT '{}', -- Store chunk-specific metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_tags table for categorization
CREATE TABLE knowledge_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#006E51', -- Hex color for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for document-tag relationships
CREATE TABLE document_tags (
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES knowledge_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

-- Create search_queries table to track what users are searching for
CREATE TABLE search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  user_session VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_documents_source_id ON knowledge_documents(source_id);
CREATE INDEX idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_sources_type ON knowledge_sources(type);
CREATE INDEX idx_knowledge_sources_status ON knowledge_sources(status);
CREATE INDEX idx_knowledge_documents_title ON knowledge_documents USING gin(to_tsvector('english', title));
CREATE INDEX idx_knowledge_chunks_content ON knowledge_chunks USING gin(to_tsvector('english', content));

-- Insert default tags
INSERT INTO knowledge_tags (name, description, color) VALUES
('Station Innovation', 'Content related to station innovation projects', '#006E51'),
('Transport Planning', 'Transport planning and infrastructure content', '#4CAF50'),
('Commercial Insights', 'Commercial and business-related information', '#2196F3'),
('Passenger Experience', 'Content about passenger experience and services', '#FF9800'),
('Policy & Regulation', 'Policy documents and regulatory information', '#9C27B0'),
('Technology', 'Technology solutions and innovations', '#00BCD4'),
('Funding & Investment', 'Information about funding opportunities and investment', '#795548');

-- Create function to search knowledge base using vector similarity
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  source_id uuid,
  title varchar(500),
  content text,
  similarity float,
  source_name varchar(255),
  source_type varchar(50),
  tags text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kc.id as chunk_id,
    kd.id as document_id,
    ks.id as source_id,
    kd.title,
    kc.content,
    (kc.embedding <=> query_embedding) * -1 + 1 as similarity,
    ks.name as source_name,
    ks.type as source_type,
    COALESCE(
      ARRAY(
        SELECT kt.name 
        FROM document_tags dt 
        JOIN knowledge_tags kt ON dt.tag_id = kt.id 
        WHERE dt.document_id = kd.id
      ), 
      ARRAY[]::text[]
    ) as tags
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  JOIN knowledge_sources ks ON kd.source_id = ks.id
  WHERE (kc.embedding <=> query_embedding) * -1 + 1 > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to get document statistics
CREATE OR REPLACE FUNCTION get_knowledge_stats()
RETURNS TABLE (
  total_sources bigint,
  total_documents bigint,
  total_chunks bigint,
  sources_by_type jsonb,
  recent_updates bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM knowledge_sources) as total_sources,
    (SELECT COUNT(*) FROM knowledge_documents) as total_documents,
    (SELECT COUNT(*) FROM knowledge_chunks) as total_chunks,
    (
      SELECT jsonb_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM knowledge_sources
        GROUP BY type
      ) t
    ) as sources_by_type,
    (
      SELECT COUNT(*)
      FROM knowledge_sources
      WHERE last_updated > NOW() - INTERVAL '7 days'
    ) as recent_updates;
END;
$$;
