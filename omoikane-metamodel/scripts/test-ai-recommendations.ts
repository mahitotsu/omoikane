#!/usr/bin/env bun
/**
 * AI Agent推奨エンジン v2.0 テスト
 */

import {
    AIRecommendationEngine,
    analyzeGraph,
    applyContext,
    assessProjectMaturity,
    buildDependencyGraph,
    DevelopmentStage,
    ProjectCriticality,
    ProjectDomain,
    TeamSize,
} from '../src/quality/maturity/index.js';

// サンプルデータ
const sampleActor = {
  id: 'actor-001',
  name: 'テストアクター',
  description: 'これは30文字以上のテストアクターの説明文です。',
  role: 'primary' as const,
  responsibilities: ['責務1', '責務2'],
};

const sampleUseCase = {
  id: 'uc-001',
  name: 'テストユースケース',
  description: 'これは50文字以上のユースケース説明文です。詳細な内容を記述しています。',
  actors: {
    primary: { id: 'actor-001', name: 'テストアクター' },
  },
  mainFlow: [
    {
      stepId: 'step-1',
      actor: { id: 'actor-001', name: 'テストアクター' },
      action: 'アクション1',
      expectedResult: '期待結果1',
    },
    {
      stepId: 'step-2',
      actor: { id: 'actor-001', name: 'テストアクター' },
      action: 'アクション2',
      expectedResult: '期待結果2',
    },
  ],
  preconditions: ['事前条件1'],
  postconditions: ['事後条件1'],
  priority: 'high' as const,
};

const sampleRequirement = {
  id: 'req-001',
  name: 'テスト要件',
  description: 'これはテスト用のビジネス要件です。詳細な説明が含まれています。',
  priority: 'high' as const,
};

console.log('=== AI Agent推奨エンジン v2.0 テスト ===\n');

// 1. 成熟度評価
console.log('【1. 成熟度評価】');
const maturityAssessment = assessProjectMaturity(
  [sampleRequirement],
  [sampleActor],
  [sampleUseCase]
);

console.log(`プロジェクトレベル: ${maturityAssessment.projectLevel}`);
const elemTypes = Object.keys(maturityAssessment.elements);
console.log(`評価要素: ${elemTypes.join(', ')}`);
console.log();

// 2. コンテキスト適用
console.log('【2. コンテキスト適用】');
const context = {
  projectName: 'test-mvp-project',
  domain: ProjectDomain.ECOMMERCE,
  stage: DevelopmentStage.MVP,
  teamSize: TeamSize.SMALL,
  criticality: ProjectCriticality.MEDIUM,
  tags: ['mvp', 'test'],
};

const contextResult = applyContext(context);
console.log(`適用ルール数: ${contextResult.appliedRules.length}`);
console.log(`最終重み数: ${contextResult.finalDimensionWeights.size}個`);
console.log();

// 3. 依存関係分析
console.log('【3. 依存関係グラフ分析】');
const graph = buildDependencyGraph(
  [sampleRequirement],
  [sampleActor],
  [sampleUseCase]
);

const graphAnalysis = analyzeGraph(graph);
console.log(`ノード数: ${graphAnalysis.statistics.nodeCount}, エッジ数: ${graphAnalysis.statistics.edgeCount}`);
console.log(`循環依存: ${graphAnalysis.circularDependencies?.length || 0}個`);
console.log();

// 4. AI推奨生成
console.log('【4. AI Agent推奨生成】');
const engine = new AIRecommendationEngine();

const recommendations = engine.generateRecommendations(
  {
    maturity: maturityAssessment,
    context,
    contextResult,
    graph: graphAnalysis,
  },
  {
    maxRecommendations: 15,
    generateBundles: true,
  }
);

console.log(`\n📊 推奨サマリー:`);
console.log(`  総推奨数: ${recommendations.summary.totalRecommendations}`);
console.log(`  クリティカル: ${recommendations.summary.criticalCount}`);
console.log(`  高優先度: ${recommendations.summary.highPriorityCount}`);
console.log(`  総工数見積: ${recommendations.summary.estimatedTotalHours}時間`);
console.log(`  期待成熟度向上: +${recommendations.summary.expectedMaturityIncrease.toFixed(2)}レベル`);

if (recommendations.topPriority.length > 0) {
  console.log(`\n🔝 Top推奨 (${Math.min(5, recommendations.topPriority.length)}件):`);
  recommendations.topPriority.slice(0, 5).forEach((rec, i) => {
    console.log(`\n${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
    console.log(`   カテゴリー: ${rec.category}`);
    const problem = rec.problem.length > 60 ? rec.problem.substring(0, 60) + '...' : rec.problem;
    console.log(`   問題: ${problem}`);
    console.log(`   影響: ${rec.impact.scope} (${rec.impact.severity})`);
    console.log(`   工数: ${rec.effort.hours}時間 (${rec.effort.complexity})`);
  });
}

console.log(`\n⚡ クイックウィン: ${recommendations.quickWins.length}件`);
recommendations.quickWins.slice(0, 3).forEach((rec, i) => {
  console.log(`  ${i + 1}. ${rec.title} (${rec.effort.hours}h)`);
});

console.log(`\n🎯 長期戦略推奨: ${recommendations.longTermStrategy.length}件`);

if (recommendations.bundles.length > 0) {
  console.log(`\n📦 推奨バンドル: ${recommendations.bundles.length}件`);
  recommendations.bundles.forEach((bundle, i) => {
    console.log(`  ${i + 1}. ${bundle.name} (推奨${bundle.recommendations.length}件, 工数${bundle.totalEffort}h)`);
  });
}

console.log(`\n✅ AI推奨エンジンv2.0テスト完了！`);
