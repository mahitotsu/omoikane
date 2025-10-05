#!/usr/bin/env bun
/**
 * メトリクスダッシュボード テスト
 */

import {
    AIRecommendationEngine,
    analyzeGraph,
    applyContext,
    assessProjectMaturity,
    buildDependencyGraph,
    DevelopmentStage,
    MetricsDashboard,
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

console.log('=== メトリクスダッシュボード テスト ===\n');

// ダッシュボード初期化
console.log('【1. ダッシュボード初期化】');
const dashboard = new MetricsDashboard({
  autoSnapshotInterval: 30,
  maxSnapshots: 50,
  trendAnalysisPeriod: 30,
});
console.log('✅ ダッシュボード初期化完了');
console.log();

// スナップショット作成（1回目）
console.log('【2. 初回スナップショット作成】');
const maturity1 = assessProjectMaturity(
  [sampleRequirement],
  [sampleActor],
  [sampleUseCase]
);
const context = {
  projectName: 'test-project',
  domain: ProjectDomain.ECOMMERCE,
  stage: DevelopmentStage.MVP,
  teamSize: TeamSize.SMALL,
  criticality: ProjectCriticality.MEDIUM,
};
const graph1 = buildDependencyGraph(
  [sampleRequirement],
  [sampleActor],
  [sampleUseCase]
);
const graphAnalysis1 = analyzeGraph(graph1);
const engine = new AIRecommendationEngine();
const recommendations1 = engine.generateRecommendations({
  maturity: maturity1,
  context,
  contextResult: applyContext(context),
  graph: graphAnalysis1,
});

const snapshot1 = dashboard.createSnapshot({
  maturity: maturity1,
  graph: graphAnalysis1,
  recommendations: recommendations1,
  context,
});

console.log(`スナップショットID: ${snapshot1.id}`);
console.log(`成熟度レベル: ${snapshot1.maturityLevel}`);
console.log(`完成率: ${(snapshot1.overallCompletionRate * 100).toFixed(1)}%`);
console.log(`推奨数: ${snapshot1.recommendationCount.total}件`);
console.log();

// 健全性スコア計算
console.log('【3. 健全性スコア計算】');
const healthScore = dashboard.calculateHealthScore(snapshot1);
console.log(`総合スコア: ${healthScore.overall}/100`);
console.log(`レベル: ${healthScore.level}`);
console.log(`カテゴリー別スコア:`);
for (const [category, score] of Object.entries(healthScore.categories)) {
  console.log(`  - ${category}: ${score}`);
}
console.log(`強み: ${healthScore.strengths.length}件`);
console.log(`弱点: ${healthScore.weaknesses.length}件`);
console.log(`評価: ${healthScore.assessment}`);
console.log();

// 2回目のスナップショット（改善後をシミュレート）
console.log('【4. 2回目スナップショット作成（改善シミュレーション）】');
// 少し待機して時間差を作る
await new Promise(resolve => setTimeout(resolve, 100));

// 改善版データ（同じデータだが時間差）
const snapshot2 = dashboard.createSnapshot({
  maturity: maturity1,
  graph: graphAnalysis1,
  recommendations: recommendations1,
  context,
});

console.log(`新スナップショットID: ${snapshot2.id}`);
console.log(`スナップショット総数: ${dashboard.getDataStore().snapshots.length}`);
console.log();

// トレンド分析
console.log('【5. トレンド分析】');
const trend = dashboard.analyzeTrend('maturityLevel');
if (trend) {
  console.log(`メトリクス: ${trend.metric}`);
  console.log(`データポイント数: ${trend.dataPoints.length}`);
  console.log(`トレンド: ${trend.statistics.trend}`);
  console.log(`変化率: ${trend.statistics.changeRate.toFixed(1)}%`);
  console.log(`平均値: ${trend.statistics.average.toFixed(2)}`);
} else {
  console.log('トレンドデータが不足しています（スナップショット2件以上必要）');
}
console.log();

// スナップショット比較
console.log('【6. スナップショット比較】');
if (dashboard.getDataStore().snapshots.length >= 2) {
  const comparison = dashboard.compareSnapshots(snapshot1.id, snapshot2.id);
  if (comparison) {
    console.log(`比較期間: ${comparison.duration.days}日 ${comparison.duration.hours}時間`);
    console.log(`サマリー: ${comparison.summary}`);
    console.log(`成熟度: ${comparison.changes.maturityLevel.before} → ${comparison.changes.maturityLevel.after}`);
    console.log(`完成率: ${(comparison.changes.completionRate.before * 100).toFixed(1)}% → ${(comparison.changes.completionRate.after * 100).toFixed(1)}%`);
  }
} else {
  console.log('比較には2つのスナップショットが必要です');
}
console.log();

// アラート生成
console.log('【7. アラート生成】');
const alerts = dashboard.generateAlerts(snapshot1);
console.log(`アラート数: ${alerts.length}件`);
alerts.forEach((alert, i) => {
  console.log(`  ${i + 1}. [${alert.severity.toUpperCase()}] ${alert.message}`);
  if (alert.recommendedAction) {
    console.log(`     推奨: ${alert.recommendedAction}`);
  }
});
console.log();

// ダッシュボードレポート生成
console.log('【8. ダッシュボードレポート生成】');
const report = dashboard.generateReport('summary');
console.log(`レポートID: ${report.id}`);
console.log(`タイトル: ${report.title}`);
console.log(`健全性: ${report.currentHealth.overall}/100 (${report.currentHealth.level})`);
console.log(`トレンド数: ${report.trends.length}`);
console.log(`マイルストーン数: ${report.milestones.length}`);
console.log(`主要指標数: ${report.keyMetrics.length}`);
console.log(`インサイト数: ${report.insights.length}`);
console.log(`次のアクション数: ${report.nextActions.length}`);
console.log();

if (report.insights.length > 0) {
  console.log('📊 インサイト:');
  report.insights.forEach((insight, i) => {
    console.log(`  ${i + 1}. ${insight}`);
  });
  console.log();
}

if (report.nextActions.length > 0) {
  console.log('🎯 次のアクション:');
  report.nextActions.forEach((action, i) => {
    console.log(`  ${i + 1}. ${action}`);
  });
  console.log();
}

// チャートデータ生成
console.log('【9. チャートデータ生成】');
const chartData = dashboard.generateChartData('line', 'maturityLevel');
if (chartData) {
  console.log(`チャートタイプ: ${chartData.type}`);
  console.log(`タイトル: ${chartData.title}`);
  console.log(`データセット数: ${chartData.datasets.length}`);
  console.log(`ラベル数: ${chartData.labels.length}`);
} else {
  console.log('チャートデータの生成にはより多くのスナップショットが必要です');
}
console.log();

// エクスポート
console.log('【10. データエクスポート】');
const jsonExport = dashboard.export({ format: 'json' });
console.log(`JSON形式: ${jsonExport.length}文字`);

const mdExport = dashboard.export({ format: 'markdown' });
console.log(`Markdown形式: ${mdExport.length}文字`);

const htmlExport = dashboard.export({ format: 'html' });
console.log(`HTML形式: ${htmlExport.length}文字`);

const csvExport = dashboard.export({ format: 'csv' });
console.log(`CSV形式: ${csvExport.length}文字`);
console.log();

console.log('✅ メトリクスダッシュボードテスト完了！');
console.log(`\n📈 サマリー:`);
console.log(`  - スナップショット: ${dashboard.getDataStore().snapshots.length}件`);
console.log(`  - マイルストーン: ${dashboard.getDataStore().milestones.length}件`);
console.log(`  - 健全性スコア: ${healthScore.overall}/100`);
console.log(`  - アラート: ${alerts.length}件`);
console.log(`  - エクスポート形式: 4種類対応`);
