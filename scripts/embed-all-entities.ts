#!/usr/bin/env npx tsx

/**
 * Embed All Entities Script
 * 
 * Usage:
 *   npx tsx scripts/embed-all-entities.ts
 *   npx tsx scripts/embed-all-entities.ts --domain=atlas
 *   npx tsx scripts/embed-all-entities.ts --force
 * 
 * Options:
 *   --domain=<domain>  Only embed entities from specific domain (atlas, navigate, cpc-internal)
 *   --force            Re-embed all entities even if they already have embeddings
 *   --dry-run          Show what would be embedded without actually embedding
 */

import { unifiedEntities } from '@/data/unified';
import { JSONVectorStore } from '@/lib/ai/vector-store-json';

interface Options {
  domain?: string;
  force: boolean;
  dryRun: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    force: false,
    dryRun: false,
  };
  
  for (const arg of args) {
    if (arg.startsWith('--domain=')) {
      options.domain = arg.split('=')[1];
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }
  
  return options;
}

async function main() {
  const options = parseArgs();
  
  console.log('🚀 Starting embedding process...\n');
  
  // Filter entities
  let entities = [...unifiedEntities];
  
  if (options.domain) {
    entities = entities.filter(e => e.domain === options.domain);
    console.log(`📋 Filtered to domain: ${options.domain}`);
  }
  
  console.log(`📦 Total entities to process: ${entities.length}\n`);
  
  // Show breakdown by domain
  const byDomain = entities.reduce((acc, e) => {
    acc[e.domain] = (acc[e.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 Breakdown by domain:');
  Object.entries(byDomain).forEach(([domain, count]) => {
    console.log(`   ${domain}: ${count}`);
  });
  console.log('');
  
  // Show breakdown by entity type
  const byType = entities.reduce((acc, e) => {
    acc[e.entityType] = (acc[e.entityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 Breakdown by entity type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  console.log('');
  
  if (options.dryRun) {
    console.log('🔍 Dry run - no embeddings will be created.\n');
    console.log('Sample entities that would be embedded:');
    entities.slice(0, 5).forEach(e => {
      console.log(`   - ${e.name} (${e.domain}/${e.entityType})`);
    });
    return;
  }
  
  // Initialize vector store
  const vectorStore = new JSONVectorStore();
  await vectorStore.ensureReady();
  
  // Check existing embeddings
  if (!options.force) {
    const existingCount = entities.filter(e => vectorStore.hasEmbedding(e.id)).length;
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} entities already have embeddings.`);
      console.log('   Use --force to re-embed all.\n');
      
      // Filter to only new entities
      entities = entities.filter(e => !vectorStore.hasEmbedding(e.id));
      console.log(`📋 Embedding ${entities.length} new entities...\n`);
    }
  }
  
  if (entities.length === 0) {
    console.log('✅ All entities already embedded. Nothing to do.');
    return;
  }
  
  // Estimate time and cost
  const estimatedTimeMinutes = Math.ceil(entities.length / 5); // 5 entities per second with rate limiting
  const estimatedCost = (entities.length * 100 * 2) / 1000000 * 0.00002; // ~100 tokens per entity, 2 models
  
  console.log(`⏱️  Estimated time: ${estimatedTimeMinutes} minutes`);
  console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}\n`);
  
  // Start embedding
  const startTime = Date.now();
  
  await vectorStore.embedAll(entities, {
    onProgress: (current, total) => {
      const percent = Math.round((current / total) * 100);
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = current / elapsed;
      const remaining = Math.round((total - current) / rate);
      
      process.stdout.write(
        `\r⏳ Progress: ${current}/${total} (${percent}%) | ` +
        `${rate.toFixed(1)} entities/sec | ` +
        `~${remaining}s remaining     `
      );
    },
  });
  
  // Final stats
  const totalTime = (Date.now() - startTime) / 1000;
  const stats = vectorStore.getStats();
  
  console.log('\n');
  console.log('═══════════════════════════════════════');
  console.log('✅ Embedding complete!');
  console.log('═══════════════════════════════════════');
  console.log(`📊 Total embeddings: ${stats.count}`);
  console.log(`💾 Storage size: ${stats.size.toFixed(2)} MB`);
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`📁 Location: data/embeddings/embeddings.json`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
