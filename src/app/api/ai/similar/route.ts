/**
 * Find Similar API Endpoint
 * 
 * POST /api/ai/similar
 * 
 * Request: { entityId: string, topK?: number, domain?: string, threshold?: number }
 * Response: { results: SearchResult[], query: { entityId, entityName } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/ai/vector-store-json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      entityId, 
      topK = 5, 
      domain,
      entityType,
      threshold = 0.5,
      usePrecision = false,
    } = body;
    
    if (!entityId) {
      return NextResponse.json(
        { error: 'entityId is required' },
        { status: 400 }
      );
    }
    
    const vectorStore = getVectorStore();
    
    // Find similar entities
    const results = await vectorStore.findSimilar(entityId, {
      topK,
      domain,
      entityType,
      threshold,
      usePrecision,
    });
    
    // Get the source entity name for context
    const record = vectorStore.getEmbeddingRecord(entityId);
    
    return NextResponse.json({
      results: results.map(r => ({
        entity: {
          id: r.entity.id,
          name: r.entity.name,
          description: r.entity.description,
          entityType: r.entity.entityType,
          domain: r.entity.domain,
        },
        similarity: r.similarity,
        similarityPercent: Math.round(r.similarity * 100),
        matchType: r.matchType,
      })),
      query: {
        entityId,
        entityName: record?.metadata.name || entityId,
      },
      meta: {
        count: results.length,
        topK,
        threshold,
      },
    });
  } catch (error: any) {
    console.error('Find similar error:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Entity not found in embeddings. Run embedding script first.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

