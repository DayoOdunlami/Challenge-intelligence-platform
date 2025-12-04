/**
 * Semantic Search API Endpoint
 * 
 * POST /api/ai/search
 * 
 * Request: { 
 *   query: string, 
 *   mode?: 'semantic' | 'keyword' | 'hybrid',
 *   topK?: number, 
 *   domain?: string,
 *   entityType?: string,
 *   threshold?: number 
 * }
 * Response: { results: SearchResult[], meta: {...} }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/ai/vector-store-json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query,
      mode = 'hybrid', // Default to hybrid for best results
      topK = 10, 
      domain,
      entityType,
      threshold = 0.5,
      usePrecision = false,
    } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'query string is required' },
        { status: 400 }
      );
    }
    
    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: 'query must be at least 2 characters' },
        { status: 400 }
      );
    }
    
    const vectorStore = getVectorStore();
    const searchOptions = {
      topK,
      domain,
      entityType,
      threshold,
      usePrecision,
    };
    
    let results;
    
    switch (mode) {
      case 'semantic':
        results = await vectorStore.search(query, searchOptions);
        break;
      case 'keyword':
        results = await vectorStore.keywordSearch(query, searchOptions);
        break;
      case 'hybrid':
      default:
        results = await vectorStore.hybridSearch(query, searchOptions);
        break;
    }
    
    return NextResponse.json({
      results: results.map(r => ({
        entity: {
          id: r.entity.id,
          name: r.entity.name,
          description: r.entity.description,
          entityType: r.entity.entityType,
          domain: r.entity.domain,
          metadata: {
            sector: (r.entity.metadata as any)?.sector,
            trl: (r.entity.metadata as any)?.trl,
          },
        },
        similarity: r.similarity,
        similarityPercent: Math.round(r.similarity * 100),
        matchType: r.matchType,
      })),
      meta: {
        query,
        mode,
        count: results.length,
        topK,
        threshold,
      },
    });
  } catch (error: any) {
    console.error('Search error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for simple queries
 * GET /api/ai/search?q=hydrogen+aviation&topK=5
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json(
      { error: 'q parameter is required' },
      { status: 400 }
    );
  }
  
  // Convert to POST format
  const body = {
    query,
    mode: searchParams.get('mode') || 'hybrid',
    topK: parseInt(searchParams.get('topK') || '10'),
    domain: searchParams.get('domain') || undefined,
    entityType: searchParams.get('entityType') || undefined,
    threshold: parseFloat(searchParams.get('threshold') || '0.5'),
  };
  
  // Reuse POST handler logic
  const vectorStore = getVectorStore();
  
  try {
    const results = await vectorStore.hybridSearch(body.query, {
      topK: body.topK,
      domain: body.domain,
      entityType: body.entityType,
      threshold: body.threshold,
    });
    
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
      meta: {
        query: body.query,
        count: results.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}

