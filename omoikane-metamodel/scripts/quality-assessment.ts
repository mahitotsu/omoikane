#!/usr/bin/env bun
/**
 * 品質評価スクリプト v2.0
 * Quality Assessment Framework v2.0を使用した総合品質評価
 * 
 * 機能:
 * - プロジェクト成熟度評価 (5レベル x 5次元)
 * - コンテキスト対応評価
 * - 依存関係グラフ分析
 * - AI推奨生成 (構造化された推奨事項)
 * - メトリクスダッシュボード (健全性スコア、トレンド分析)
 * 
 * 使用方法:
 *   bun run quality-assessment [プロジェクトディレクトリ] [オプション]
 * 
 * オプション:
 *   --export        レポートをファイルにエクスポート
 *   --json          JSON形式でエクスポート
 *   --html          HTML形式でエクスポート
 *   --markdown      Markdown形式でエクスポート (デフォルト)
 *   --help          ヘルプを表示
 */

import { readdir } from 'fs/promises';
import { extname, join, resolve } from 'path';
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
    // 1. Bunのトランスパイラーでファイルを読み込み準備
    const absolutePath = resolve(filePath);
    
    // 2. 動的インポートを試行
    try {
      // file:// プロトコルを使用して絶対パスをURLに変換
      const fileUrl = `file://${absolutePath}`;
      const module = await import(fileUrl);
      
      // defaultエクスポートがあれば返す
      if (module.default) {
        return module.default;
      }
      
      // 名前付きエクスポートを配列で返す
      const namedExports = Object.keys(module)
        .filter(key => key !== 'default' && key !== '__esModule')
        .map(key => module[key])
        .filter(val => val !== undefined && val !== null);
      
      if (namedExports.length === 1) {
        return namedExports[0];
      } else if (namedExports.length > 1) {
        return namedExports;
      }
    } catch (importError) {
      // インポートに失敗した場合は静かにスキップ
      return null;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function loadProjectData(projectDir: string) {
  const files = await findProjectFiles(projectDir);
  
  const businessRequirements: any[] = [];
  const actors: any[] = [];
  const useCases: any[] = [];

  for (const file of files) {
    const data = await loadTsFile(file);
    if (!data) continue;

    // データが配列の場合は各要素を処理、単一オブジェクトならそのまま処理
    const items = Array.isArray(data) ? data : [data];
    
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      
      // ビジネス要件の判定（businessGoalsプロパティが配列として存在）
      if (item.businessGoals && Array.isArray(item.businessGoals)) {
        businessRequirements.push(item);
      }
      // アクターの判定（roleプロパティが存在）
      else if (item.role !== undefined) {
        actors.push(item);
      }
      // ユースケースの判定（actorsプロパティとmainFlowが存在）
      else if (item.actors && item.mainFlow) {
        useCases.push(item);
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
  console.log(`  レベル: ${maturityResult.projectLevel}/5\n`);
  
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
  
  if (recommendations.quickWins.length > 0) {
    console.log('【クイックウィン（すぐに実行可能）】');
    for (let i = 0; i < Math.min(5, recommendations.quickWins.length); i++) {
      const rec = recommendations.quickWins[i];
      console.log(`  • ${rec.title} (${rec.effort.hours}h)`);
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
