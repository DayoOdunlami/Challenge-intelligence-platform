/**
 * Knowledge Base Search Utility
 * 
 * Provides search functionality for the knowledge base content,
 * used by the AI assistant to find relevant context.
 */

import {
  hydrogenAviationStrategy,
  hydrogenInAviation,
  hydrogenAircraft,
  hydrogenAviationStats,
} from '@/data/knowledge-base';

export interface KnowledgeBaseResult {
  id: string;
  title: string;
  category: 'policy' | 'stakeholder' | 'technology' | 'statistics';
  content: string;
  relevance: number;
  matchedSections: string[];
  source: string;
}

/**
 * All knowledge base entries
 */
const knowledgeBaseEntries = [
  {
    id: 'policy-hydrogen-strategy',
    title: 'UK Hydrogen Aviation Strategy',
    category: 'policy' as const,
    content: hydrogenAviationStrategy,
    source: 'HIA Report 2024',
  },
  {
    id: 'stakeholder-hia',
    title: 'Hydrogen in Aviation (HIA) Coalition',
    category: 'stakeholder' as const,
    content: hydrogenInAviation,
    source: 'HIA Report 2024',
  },
  {
    id: 'tech-hydrogen-aircraft',
    title: 'Hydrogen Aircraft Technology',
    category: 'technology' as const,
    content: hydrogenAircraft,
    source: 'HIA Report 2024',
  },
  {
    id: 'stats-hydrogen-aviation',
    title: 'Hydrogen Aviation Statistics',
    category: 'statistics' as const,
    content: hydrogenAviationStats,
    source: 'HIA Report 2024',
  },
];

/**
 * Simple keyword search through knowledge base
 * Returns entries sorted by relevance
 */
export function searchKnowledgeBase(query: string): KnowledgeBaseResult[] {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 2); // Filter out very short terms

  if (queryTerms.length === 0) {
    return [];
  }

  const results: KnowledgeBaseResult[] = knowledgeBaseEntries.map(entry => {
    const contentLower = entry.content.toLowerCase();
    const titleLower = entry.title.toLowerCase();

    // Count matches in title (higher weight) and content
    const titleMatches = queryTerms.filter(term => titleLower.includes(term)).length;
    const contentMatches = queryTerms.filter(term => contentLower.includes(term)).length;

    // Calculate relevance score
    const relevance = (titleMatches * 2 + contentMatches) / queryTerms.length;

    // Extract matching sections (first 200 chars around matches)
    const matchedSections: string[] = [];
    queryTerms.forEach(term => {
      const index = contentLower.indexOf(term);
      if (index !== -1) {
        const start = Math.max(0, index - 100);
        const end = Math.min(entry.content.length, index + term.length + 100);
        matchedSections.push(entry.content.substring(start, end));
      }
    });

    return {
      id: entry.id,
      title: entry.title,
      category: entry.category,
      content: entry.content,
      relevance,
      matchedSections: matchedSections.slice(0, 3), // Limit to 3 sections
      source: entry.source,
    };
  });

  // Filter out results with zero relevance and sort by relevance
  return results
    .filter(result => result.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
}

/**
 * Get knowledge base entry by ID
 */
export function getKnowledgeBaseEntry(id: string): KnowledgeBaseResult | null {
  const entry = knowledgeBaseEntries.find(e => e.id === id);
  if (!entry) return null;

  return {
    id: entry.id,
    title: entry.title,
    category: entry.category,
    content: entry.content,
    relevance: 1,
    matchedSections: [],
    source: entry.source,
  };
}

/**
 * Get all knowledge base entries by category
 */
export function getKnowledgeBaseByCategory(
  category: 'policy' | 'stakeholder' | 'technology' | 'statistics'
): KnowledgeBaseResult[] {
  return knowledgeBaseEntries
    .filter(entry => entry.category === category)
    .map(entry => ({
      id: entry.id,
      title: entry.title,
      category: entry.category,
      content: entry.content,
      relevance: 1,
      matchedSections: [],
      source: entry.source,
    }));
}

/**
 * Format knowledge base content for AI context
 * Truncates to maxLength to stay within token limits
 */
export function formatKnowledgeBaseForContext(
  results: KnowledgeBaseResult[],
  maxLength: number = 4000
): string {
  let formatted = '';
  let currentLength = 0;

  for (const result of results) {
    if (currentLength >= maxLength) break;

    const entryText = `## ${result.title} (${result.category})\nSource: ${result.source}\n\n${result.content.substring(0, maxLength - currentLength - 200)}\n\n---\n\n`;
    
    if (currentLength + entryText.length <= maxLength) {
      formatted += entryText;
      currentLength += entryText.length;
    }
  }

  return formatted;
}

