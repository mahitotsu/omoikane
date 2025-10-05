#!/usr/bin/env bun

/**
 * 依存関係グラフ分析のテスト
 */

import {
    analyzeChangeImpact,
    analyzeGraph,
    analyzeLayering,
    buildDependencyGraph,
} from '../src/quality/maturity/index.ts';
import type { Actor, BusinessRequirementDefinition, UseCase } from '../src/types/index.ts';

console.log('🔍 依存関係グラフ分析のテスト\n');
console.log('='.repeat(60));
console.log('');

// テスト用のサンプルデータを作成
const sampleRequirement: BusinessRequirementDefinition = {
  id: 'br-001',
  name: 'オンライン予約システム',
  title: 'オンライン予約システム',
  summary: 'ユーザーがオンラインで予約できるシステム',
  businessGoals: [
    { id: 'goal-1', description: '予約プロセスの自動化' },
    { id: 'goal-2', description: 'ユーザー体験の向上' },
  ],
  scope: {
    inScope: [
      { id: 'scope-1', description: '予約管理' },
      { id: 'scope-2', description: 'ユーザー管理' },
    ],
  },
  stakeholders: [
    { id: 'sh-1', description: 'エンドユーザー' },
    { id: 'sh-2', description: 'システム管理者' },
  ],
  businessRules: [
    { id: 'rule-1', description: '予約は24時間前までキャンセル可能' },
    { id: 'rule-2', description: '同一ユーザーは同時に3件まで予約可能' },
  ],
  securityPolicies: [
    { id: 'policy-1', description: 'ユーザー認証必須' },
  ],
};

const actors: Actor[] = [
  {
    id: 'actor-user',
    name: '一般ユーザー',
    description: 'システムを利用する一般ユーザー',
    role: 'primary',
    responsibilities: ['予約を作成', '予約をキャンセル'],
  },
  {
    id: 'actor-admin',
    name: '管理者',
    description: 'システムを管理する管理者',
    role: 'secondary',
    responsibilities: ['予約を管理', 'ユーザーを管理'],
  },
];

const useCases: UseCase[] = [
  {
    id: 'uc-001',
    name: '予約を作成する',
    description: 'ユーザーが新しい予約を作成する',
    actors: {
      primary: 'actor-user',
    },
    mainFlow: [
      {
        stepId: '1',
        actor: 'actor-user',
        action: 'システムにログイン',
        expectedResult: 'ログイン成功',
      },
      {
        stepId: '2',
        actor: 'actor-user',
        action: '予約フォームを入力',
        expectedResult: 'フォーム入力完了',
      },
      {
        stepId: '3',
        actor: 'システム',
        action: '予約を保存',
        expectedResult: '予約確認メール送信',
      },
    ],
    preconditions: ['ユーザーが登録済み'],
    postconditions: ['予約が作成されている'],
    priority: 'high',
    businessRequirementCoverage: {
      requirement: { id: 'br-001' },
      businessGoals: [{ id: 'goal-1' }, { id: 'goal-2' }],
    },
    businessRules: [{ id: 'rule-2' }],
    securityPolicies: [{ id: 'policy-1' }],
  },
  {
    id: 'uc-002',
    name: '予約をキャンセルする',
    description: 'ユーザーが既存の予約をキャンセルする',
    actors: {
      primary: 'actor-user',
    },
    mainFlow: [
      {
        stepId: '1',
        actor: 'actor-user',
        action: '予約一覧を表示',
        expectedResult: '予約一覧表示',
      },
      {
        stepId: '2',
        actor: 'actor-user',
        action: 'キャンセルボタンをクリック',
        expectedResult: 'キャンセル確認ダイアログ表示',
      },
      {
        stepId: '3',
        actor: 'システム',
        action: '予約をキャンセル',
        expectedResult: 'キャンセル完了メール送信',
      },
    ],
    preconditions: ['予約が存在する'],
    postconditions: ['予約がキャンセル済み'],
    priority: 'high',
    businessRequirementCoverage: {
      requirement: { id: 'br-001' },
      businessGoals: [{ id: 'goal-2' }],
    },
    businessRules: [{ id: 'rule-1' }],
    securityPolicies: [{ id: 'policy-1' }],
  },
  {
    id: 'uc-003',
    name: '予約を管理する',
    description: '管理者が全ての予約を管理する',
    actors: {
      primary: 'actor-admin',
    },
    mainFlow: [
      {
        stepId: '1',
        actor: 'actor-admin',
        action: '管理画面にログイン',
        expectedResult: 'ログイン成功',
      },
      {
        stepId: '2',
        actor: 'actor-admin',
        action: '予約一覧を表示',
        expectedResult: '全予約一覧表示',
      },
    ],
    preconditions: ['管理者権限を持つ'],
    postconditions: [],
    priority: 'medium',
    businessRequirementCoverage: {
      requirement: { id: 'br-001' },
      businessGoals: [{ id: 'goal-1' }],
    },
    securityPolicies: [{ id: 'policy-1' }],
  },
];

// グラフを構築
console.log('📊 グラフ構築中...\n');
const graph = buildDependencyGraph([sampleRequirement], actors, useCases);

console.log(`ノード数: ${graph.nodes.size}`);
console.log(`エッジ数: ${graph.edges.length}`);
console.log('');

// グラフ分析を実行
console.log('🔬 グラフ分析実行中...\n');
const analysis = analyzeGraph(graph);

console.log('📈 統計情報');
console.log('='.repeat(60));
console.log(`ノード総数: ${analysis.statistics.nodeCount}`);
console.log(`エッジ総数: ${analysis.statistics.edgeCount}`);
console.log(`平均入次数: ${analysis.statistics.averageInDegree.toFixed(2)}`);
console.log(`平均出次数: ${analysis.statistics.averageOutDegree.toFixed(2)}`);
console.log(`最大深度: ${analysis.statistics.maxDepth}`);
console.log(`連結成分数: ${analysis.statistics.connectedComponents}`);
console.log(`循環依存数: ${analysis.statistics.cycleCount}`);
console.log(`孤立ノード数: ${analysis.statistics.isolatedNodes}`);
console.log('');

console.log('📊 ノードタイプ別統計');
console.log('='.repeat(60));
analysis.statistics.nodesByType.forEach((count, type) => {
  console.log(`${type}: ${count}個`);
});
console.log('');

console.log('🔗 エッジタイプ別統計');
console.log('='.repeat(60));
analysis.statistics.edgesByType.forEach((count, type) => {
  console.log(`${type}: ${count}個`);
});
console.log('');

// ノード重要度
console.log('⭐ ノード重要度ランキング (Top 10)');
console.log('='.repeat(60));
analysis.nodeImportance.slice(0, 10).forEach((ni, index) => {
  const node = graph.nodes.get(ni.nodeId);
  console.log(
    `${index + 1}. ${node?.name} (${ni.nodeId})`
  );
  console.log(`   タイプ: ${node?.type}, 重要度: ${ni.importance}`);
  console.log(`   入次数: ${ni.inDegree}, 出次数: ${ni.outDegree}`);
  console.log('');
});

// 警告と推奨事項
if (analysis.warnings.length > 0) {
  console.log('⚠️  警告');
  console.log('='.repeat(60));
  analysis.warnings.forEach(warning => console.log(warning));
  console.log('');
}

if (analysis.recommendations.length > 0) {
  console.log('💡 推奨事項');
  console.log('='.repeat(60));
  analysis.recommendations.forEach(rec => console.log(rec));
  console.log('');
}

// 変更影響分析
console.log('🎯 変更影響分析: br-001 を変更した場合');
console.log('='.repeat(60));
const impactAnalysis = analyzeChangeImpact(graph, 'br-001');
console.log(`対象ノード: ${impactAnalysis.targetNode}`);
console.log(`直接影響: ${impactAnalysis.directImpact.length}個`);
console.log(`間接影響: ${impactAnalysis.indirectImpact.length}個`);
console.log(`総影響数: ${impactAnalysis.totalImpactCount}個`);
console.log(`推定工数: ${impactAnalysis.estimatedEffort}`);
console.log('');

if (impactAnalysis.directImpact.length > 0) {
  console.log('直接影響を受けるノード:');
  impactAnalysis.directImpact.forEach(nodeId => {
    const node = graph.nodes.get(nodeId);
    console.log(`  - ${node?.name} (${nodeId})`);
  });
  console.log('');
}

if (impactAnalysis.criticalNodes.length > 0) {
  console.log('重要な影響ノード:');
  impactAnalysis.criticalNodes.forEach(nodeId => {
    const node = graph.nodes.get(nodeId);
    console.log(`  - ${node?.name} (${nodeId})`);
  });
  console.log('');
}

// レイヤー分析
console.log('🏗️  レイヤー分析');
console.log('='.repeat(60));
const layerAnalysis = analyzeLayering(graph);
console.log(`健全性スコア: ${layerAnalysis.healthScore}/100`);
console.log('');

console.log('レイヤー構成:');
layerAnalysis.layers.forEach(layer => {
  console.log(`レベル ${layer.level}: ${layer.description} (${layer.nodes.length}ノード)`);
  layer.nodes.slice(0, 3).forEach(nodeId => {
    const node = graph.nodes.get(nodeId);
    console.log(`  - ${node?.name}`);
  });
  if (layer.nodes.length > 3) {
    console.log(`  ... 他${layer.nodes.length - 3}個`);
  }
});
console.log('');

if (layerAnalysis.violations.length > 0) {
  console.log('⚠️  レイヤー違反:');
  layerAnalysis.violations.forEach(v => {
    const fromNode = graph.nodes.get(v.from);
    const toNode = graph.nodes.get(v.to);
    console.log(
      `  - ${fromNode?.name} (レベル${v.fromLevel}) → ${toNode?.name} (レベル${v.toLevel}) [${v.severity}]`
    );
  });
  console.log('');
}

console.log('='.repeat(60));
console.log('✅ 依存関係グラフ分析のテストが完了しました');
