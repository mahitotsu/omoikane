#!/usr/bin/env bun
/**
 * 品質評価スクリプト v2.0
 * Quality Assessment Framework v2.0を使用した総合品質評価
 */

import { readdir } from 'fs/promises';
import { extname, join } from 'path';
import {
  AIRecommendationEngine,
  analyzeGraph,
  applyContext,
  assessProjectMaturity,
  buildDependencyGraph,
  inferContext,
  MetricsDashboard,
} from '../src/quality/maturity/index.js';

async function findProjectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...(await findProjectFiles(fullPath)));
      }
    } else if (entry.isFile() && extname(entry.name) === '.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

async function loadTsFile(filePath: string): Promise<any> {
  try {
    // file://プロトコルを使用して絶対パスをURLに変換
    const fileUrl = `file://${filePath}`;
    const module = await import(fileUrl);
    // defaultエクスポート、または全ての名前付きエクスポートを返す
    if (module.default) {
      return module.default;
    }
    // 名前付きエクスポートを配列として返す
    const exports = Object.keys(module)
      .filter(key => key !== 'default' && key !== '__esModule')
      .map(key => module[key]);
    return exports.length === 1 ? exports[0] : exports.length > 1 ? exports : null;
  } catch (error) {
    return null;
  }
}

async function loadProjectData(projectDir: string) {
  const files = await findProjectFiles(projectDir);
  console.log(`  ファイル数: ${files.length}`);
  
  const businessRequirements: any[] = [];
  const actors: any[] = [];
  const useCases: any[] = [];

  for (const file of files) {
    const data = await loadTsFile(file);
    if (!data) continue;

    const items = Array.isArray(data) ? data : [data];
    console.log(`  ${file.split('/').pop()}: ${items.length} items`);
    
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      
      console.log(`    - type: ${item.type}, id: ${item.id}, keys: ${Object.keys(item).slice(0, 5).join(', ')}`);
      
      // ビジネス要件の判定
      if (item.businessGoals || item.type === 'businessRequirement' || item.id?.includes('business')) {
        businessRequirements.push(item);
        console.log(`      → ビジネス要件`);
      }
      // アクターの判定
      else if (item.role || item.type === 'actor' || item.id?.includes('actor')) {
        actors.push(item);
        console.log(`      → アクター`);
      }
      // ユースケースの判定
      else if (item.actors || item.type === 'useCase' || item.id?.includes('usecase')) {
        useCases.push(item);
        console.log(`      → ユースケース`);
      }
    }
  }
  return { businessRequirements, actors, useCases };
}

function displayV2Report(
  healthScore: any,
  maturityResult: any,
  graphAnalysis: any,
  recommendations: any
) {
  console.log('\n=== 📊 品質評価レポート v2.0 ===\n');
  
  console.log('【総合健全性スコア】');
  console.log(`スコア: ${healthScore.overall}/100`);
  console.log(`レベル: ${healthScore.level.toUpperCase()}\n`);
  
  console.log('【カテゴリ別評価】');
  for (const [category, score] of Object.entries(healthScore.categories)) {
    console.log(`  ${category}: ${score}/100`);
  }
  console.log();
  
  console.log('【成熟度レベル】');
  console.log(`レベル: ${maturityResult.projectLevel}/5\n`);
  
  console.log('【依存関係グラフ】');
  console.log(`  ノード数: ${graphAnalysis.statistics.nodeCount}`);
  console.log(`  エッジ数: ${graphAnalysis.statistics.edgeCount}`);
  console.log(`  循環依存: ${graphAnalysis.circularDependencies.length}件`);
  console.log(`  孤立ノード: ${graphAnalysis.isolatedNodes.length}件\n`);
  
  console.log('【AI推奨事項】');
  console.log(`  総数: ${recommendations.recommendations.length}件`);
  console.log(`  最優先: ${recommendations.topPriority.length}件`);
  console.log(`  クイックウィン: ${recommendations.quickWins.length}件\n`);
  
  if (recommendations.topPriority.length > 0) {
    console.log('【最優先推奨事項（上位5件）】');
    for (let i = 0; i < Math.min(5, recommendations.topPriority.length); i++) {
      const rec = recommendations.topPriority[i];
      console.log(`\n  ${i + 1}. ${rec.title}`);
      console.log(`     優先度: ${rec.priority}`);
      console.log(`     工数: ${rec.effort.hours}時間`);
      console.log(`     問題: ${rec.problem}`);
    }
    console.log();
  }
  
  console.log('【強み】');
  for (const strength of healthScore.strengths) {
    console.log(`  ✓ ${strength}`);
  }
  console.log();
  
  console.log('【弱み】');
  for (const weakness of healthScore.weaknesses) {
    console.log(`  ✗ ${weakness}`);
  }
  console.log();
}

async function main() {
  const projectDir = process.argv[2] || process.cwd();
  console.log(`\n品質評価を実行中: ${projectDir}\n`);

  try {
    console.log('📁 プロジェクトデータを読み込んでいます...');
    const { businessRequirements, actors, useCases } = await loadProjectData(projectDir);
    console.log(`  要件定義: ${businessRequirements.length}件`);
    console.log(`  アクター: ${actors.length}件`);
    console.log(`  ユースケース: ${useCases.length}件\n`);

    console.log('📊 成熟度を評価しています...');
    const maturityResult = assessProjectMaturity(businessRequirements, actors, useCases);
    console.log(`  完了: レベル ${maturityResult.projectLevel}/5\n`);

    console.log('🎯 コンテキストを分析しています...');
    const partialContext = inferContext(projectDir, businessRequirements);
    // デフォルト値で完全なコンテキストを構築
    const context = {
      projectName: partialContext.projectName || 'Unknown Project',
      domain: partialContext.domain || 'general',
      stage: partialContext.stage || 'poc',
      teamSize: partialContext.teamSize || 'solo',
      criticality: partialContext.criticality || 'experimental',
      tags: partialContext.tags || [],
    };
    const contextResult = applyContext(context as any);
    console.log(`  完了: ${context.domain} / ${context.stage}\n`);

    console.log('🔗 依存関係を分析しています...');
    const graph = buildDependencyGraph(businessRequirements, actors, useCases);
    const graphAnalysis = analyzeGraph(graph);
    console.log(`  完了: ${graphAnalysis.statistics.nodeCount}ノード\n`);

    console.log('🤖 AI推奨事項を生成しています...');
    const recommendationEngine = new AIRecommendationEngine();
    const recommendations = recommendationEngine.generateRecommendations({
      maturity: maturityResult,
      context: context as any,
      contextResult,
      graph: graphAnalysis,
    });
    console.log(`  完了: ${recommendations.recommendations.length}件\n`);

    console.log('📈 メトリクスを記録しています...');
    const dashboard = new MetricsDashboard();
    const snapshot = dashboard.createSnapshot({
      maturity: maturityResult,
      graph: graphAnalysis,
      recommendations,
      context: context as any,
    });
    const healthScore = dashboard.calculateHealthScore(snapshot);
    console.log(`  完了\n`);

    displayV2Report(healthScore, maturityResult, graphAnalysis, recommendations);

    if (process.argv.includes('--export')) {
      const format = process.argv.includes('--html') ? 'html' :
                     process.argv.includes('--json') ? 'json' : 'markdown';
      const exported = dashboard.export({ format });
      const fs = await import('fs/promises');
      const filename = `quality-report-${Date.now()}.${format}`;
      await fs.writeFile(filename, exported);
      console.log(`✅ レポートをエクスポート: ${filename}\n`);
    }

    const alerts = dashboard.generateAlerts(snapshot);
    if (alerts.length > 0) {
      console.log('⚠️  警告:');
      for (const alert of alerts) {
        console.log(`  ${alert.message}`);
      }
      console.log();
    }

    if (healthScore.overall < 40) {
      console.log('❌ 品質が基準を満たしていません\n');
      process.exit(1);
    } else if (healthScore.overall < 75) {
      console.log('⚠️  品質改善の余地があります\n');
      process.exit(0);
    } else {
      console.log('✅ 品質基準を満たしています\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
