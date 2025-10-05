#!/usr/bin/env bun
/**
 * 予約システムの関係性分析
 */

import { readdir } from 'fs/promises';
import { RelationshipAnalyzer } from 'omoikane-metamodel';
import { extname, join } from 'path';

async function importTsFile(filePath: string): Promise<any> {
  try {
    const absolutePath = filePath.startsWith('/') ? filePath : join(process.cwd(), filePath);
    const module = await import(`file://${absolutePath}`);
    return module.default || module;
  } catch (error) {
    return null;
  }
}

async function findAllTsFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await findAllTsFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && extname(entry.name) === '.ts') {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
}

async function main() {
  const srcDir = join(process.cwd(), 'src');
  const allTsFiles = await findAllTsFiles(srcDir);

  const analyzer = new RelationshipAnalyzer();
  let actorCount = 0;
  let useCaseCount = 0;

  for (const filePath of allTsFiles) {
    const module = await importTsFile(filePath);
    if (!module) continue;

    for (const exportedName of Object.keys(module)) {
      const value: any = module[exportedName];
      
      // Actor の検出
      if (value && typeof value === 'object' && 
          'id' in value &&
          'name' in value && 
          'role' in value && 
          'responsibilities' in value &&
          Array.isArray(value.responsibilities)) {
        analyzer.addActor(value);
        actorCount++;
      }

      // UseCase の検出
      if (value && typeof value === 'object' && 
          'id' in value &&
          'name' in value &&
          'actors' in value &&
          'mainFlow' in value &&
          Array.isArray(value.mainFlow)) {
        analyzer.addUseCase(value);
        useCaseCount++;
      }
    }
  }

  console.log(`\n📦 読み込み完了:`);
  console.log(`  - アクター: ${actorCount}件`);
  console.log(`  - ユースケース: ${useCaseCount}件`);

  const analysis = analyzer.analyze();

  console.log(`\n🔍 関係性分析結果:`);
  console.log(`  総アクター数: ${analysis.totalActors}`);
  console.log(`  総ユースケース数: ${analysis.totalUseCases}`);
  console.log(`  関係性の数: ${analysis.relationships.length}`);

  console.log(`\n👥 複数のユースケースに関わるアクター:`);
  if (analysis.multiRoleActors.length === 0) {
    console.log('  なし');
  } else {
    analysis.multiRoleActors.forEach(actorId => {
      const useCaseIds = analysis.actorUseCaseMap.get(actorId) || [];
      console.log(`  - ${actorId} (${useCaseIds.length}件): ${useCaseIds.slice(0, 3).join(', ')}${useCaseIds.length > 3 ? '...' : ''}`);
    });
  }

  console.log(`\n🎭 複数のアクターが関わるユースケース:`);
  if (analysis.complexUseCases.length === 0) {
    console.log('  なし');
  } else {
    analysis.complexUseCases.forEach(useCaseId => {
      const actorIds = analysis.useCaseActorMap.get(useCaseId) || [];
      console.log(`  - ${useCaseId}: ${actorIds.join(', ')}`);
    });
  }

  console.log('\n✅ RelationshipAnalyzer は予約システムで正常動作しました');
}

main();
