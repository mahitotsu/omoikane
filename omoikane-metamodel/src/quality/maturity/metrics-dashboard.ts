/**
 * @fileoverview メトリクスダッシュボード（Metrics Dashboard）
 *
 * **目的:**
 * 品質メトリクスの収集、分析、可視化を一元管理し、
 * プロジェクトの健全性をリアルタイムで追跡します。
 *
 * **主要機能:**
 * 1. スナップショット管理: 時系列でメトリクスを記録
 * 2. トレンド分析: 過去データから傾向を分析
 * 3. 健全性スコア計算: 5つの観点から総合評価
 * 4. アラート生成: 閾値を超えた場合に警告
 * 5. 比較分析: 2つのスナップショットを比較
 * 6. レポート生成: JSON/Markdown/HTML形式でエクスポート
 * 7. チャートデータ生成: 可視化用のデータ構造を提供
 *
 * **データモデル:**
 * - MetricsSnapshot: 特定時点のメトリクススナップショット
 * - MetricsTrend: トレンド分析結果（成長率、予測値）
 * - ProjectHealthScore: 総合健全性スコア（5観点）
 * - MetricsAlert: アラート情報（severity, message, recommendation）
 * - MetricsComparison: 2つのスナップショットの比較結果
 *
 * **健全性スコアの5観点:**
 * 1. maturity: 成熟度の総合スコア
 * 2. coverage: カバレッジ率
 * 3. dependency: 依存関係の健全性
 * 4. recommendation: 推奨事項の実施率
 * 5. trend: トレンドの方向性
 *
 * **アルゴリズム:**
 * - トレンド分析: 線形回帰（最小二乗法）で成長率を計算
 * - 健全性スコア: 重み付け平均（configで設定可能）
 * - アラート生成: 閾値ベース + ルールベース
 *
 * **拡張ポイント:**
 * - customMetricsで独自メトリクスを追加可能
 * - healthThresholdsで閾値をカスタマイズ可能
 * - exportFormatsで新しいエクスポート形式を追加可能
 *
 * @module quality/maturity/metrics-dashboard
 */

import type { AIAgentRecommendations } from './ai-recommendation-model.js';
import type { ProjectContext } from './context-model.js';
import type { GraphAnalysisResult } from './dependency-graph-model.js';
import type { MaturityDimension, ProjectMaturityAssessment } from './maturity-model.js';
import type {
  ChartData,
  DashboardConfig,
  DashboardDataStore,
  DashboardReport,
  ExportOptions,
  MetricsAlert,
  MetricsComparison,
  MetricsSnapshot,
  MetricsTrend,
  ProjectHealthScore,
} from './metrics-dashboard-model.js';

// ============================================================================
// メトリクスダッシュボードクラス（MetricsDashboard Class）
// ============================================================================

/**
 * メトリクスダッシュボード
 *
 * **責務:**
 * プロジェクトの品質メトリクスを時系列で管理し、分析・可視化を提供します。
 *
 * **主要メソッド:**
 * - createSnapshot: 新しいスナップショットを作成
 * - analyzeTrends: トレンド分析を実行
 * - calculateHealthScore: 健全性スコアを計算
 * - generateAlerts: アラートを生成
 * - compareSnapshots: 2つのスナップショットを比較
 * - generateReport: レポートを生成
 * - generateChartData: チャート用データを生成
 *
 * **使用例:**
 * ```typescript
 * const dashboard = new MetricsDashboard({
 *   maxSnapshots: 100,
 *   healthThresholds: { excellent: 90, good: 75, fair: 60, poor: 40 }
 * });
 *
 * const snapshot = dashboard.createSnapshot({
 *   maturity: assessmentResult,
 *   graph: graphResult,
 *   recommendations: aiRecommendations,
 *   context: projectContext
 * });
 *
 * const trends = dashboard.analyzeTrends();
 * const health = dashboard.calculateHealthScore();
 * const alerts = dashboard.generateAlerts();
 * ```
 *
 * **拡張ポイント:**
 * - DashboardConfigで動作をカスタマイズ
 * - customMetricsで独自メトリクスを追加
 * - exportFormatsで新しいエクスポート形式を追加
 */
export class MetricsDashboard {
  private dataStore: DashboardDataStore;
  private config: DashboardConfig;

  /**
   * コンストラクタ
   *
   * **設定項目:**
   * - autoSnapshotInterval: 自動スナップショット間隔（分）
   * - maxSnapshots: 保持する最大スナップショット数
   * - trendAnalysisPeriod: トレンド分析期間（日）
   * - healthThresholds: 健全性スコアの閾値
   * - customMetrics: カスタムメトリクス定義
   * - exportFormats: エクスポート形式
   *
   * @param config ダッシュボード設定（オプション）
   */
  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = {
      autoSnapshotInterval: config.autoSnapshotInterval || 60,
      maxSnapshots: config.maxSnapshots || 100,
      trendAnalysisPeriod: config.trendAnalysisPeriod || 30,
      healthThresholds: config.healthThresholds || {
        excellent: 90,
        good: 75,
        fair: 60,
        poor: 40,
      },
      customMetrics: config.customMetrics || [],
      exportFormats: config.exportFormats || ['json', 'markdown', 'html'],
    };

    this.dataStore = {
      snapshots: [],
      milestones: [],
      config: this.config,
      lastUpdated: new Date().toISOString(),
    };
  }

  // ============================================================================
  // スナップショット管理（Snapshot Management）
  // ============================================================================

  /**
   * スナップショットを作成
   *
   * **処理フロー:**
   * 1. 成熟度評価結果から次元スコアを抽出
   * 2. 要素数をカウント（ビジネス要件、アクター、ユースケース）
   * 3. 依存関係グラフの統計を抽出
   * 4. AI推奨事項の統計を抽出
   * 5. スナップショットを作成してdataStoreに保存
   * 6. maxSnapshotsを超えた場合は古いものを削除
   *
   * **スナップショットの構成:**
   * - timestamp: スナップショット作成日時
   * - maturityLevel: 総合成熟度レベル
   * - dimensionScores: 各次元のスコア
   * - elementCounts: 要素数
   * - graphMetrics: 依存関係グラフのメトリクス
   * - recommendationMetrics: AI推奨事項のメトリクス
   * - context: プロジェクトコンテキスト
   *
   * **使用例:**
   * ```typescript
   * const snapshot = dashboard.createSnapshot({
   *   maturity: assessmentResult,
   *   graph: graphAnalysis,
   *   recommendations: aiRecs,
   *   context: projectContext
   * });
   * console.log(snapshot.maturityLevel); // → 3
   * console.log(snapshot.dimensionScores.get(MaturityDimension.STRUCTURE)); // → 0.85
   * ```
   *
   * **注意:**
   * - maxSnapshotsを超えた場合、最も古いスナップショットが自動削除される
   * - スナップショットは時系列順にソートされる
   *
   * @param data スナップショット作成に必要なデータ
   * @returns 作成されたスナップショット
   */
  createSnapshot(data: {
    maturity: ProjectMaturityAssessment;
    graph?: GraphAnalysisResult;
    recommendations?: AIAgentRecommendations;
    context?: ProjectContext;
  }): MetricsSnapshot {
    const dimensionScores = new Map<MaturityDimension, number>();
    for (const dim of data.maturity.overallDimensions) {
      dimensionScores.set(dim.dimension, dim.completionRate);
    }

    // 要素数をカウント
    const elementCounts = {
      businessRequirements: data.maturity.elements.businessRequirements ? 1 : 0,
      actors: Array.isArray(data.maturity.elements.actors)
        ? data.maturity.elements.actors.length
        : data.maturity.elements.actors
          ? 1
          : 0,
      useCases: Array.isArray(data.maturity.elements.useCases)
        ? data.maturity.elements.useCases.length
        : data.maturity.elements.useCases
          ? 1
          : 0,
    };

    // 未達成基準数をカウント
    let unsatisfiedCriteriaCount = 0;
    for (const [, elementOrArray] of Object.entries(data.maturity.elements)) {
      const elements = Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
      for (const element of elements) {
        if (element && element.unsatisfiedCriteria) {
          unsatisfiedCriteriaCount += element.unsatisfiedCriteria.length;
        }
      }
    }

    const snapshot: MetricsSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: new Date().toISOString(),
      maturityLevel: data.maturity.projectLevel,
      dimensionScores,
      elementCounts,
      overallCompletionRate: this.calculateOverallCompletionRate(data.maturity),
      unsatisfiedCriteriaCount,
      recommendationCount: {
        total: data.recommendations?.summary.totalRecommendations || 0,
        critical: data.recommendations?.summary.criticalCount || 0,
        high: data.recommendations?.summary.highPriorityCount || 0,
      },
      graphStats: data.graph
        ? {
            nodeCount: data.graph.statistics.nodeCount,
            edgeCount: data.graph.statistics.edgeCount,
            circularDependencies: data.graph.circularDependencies?.length || 0,
            isolatedNodes: data.graph.isolatedNodes?.length || 0,
            circularDependenciesBySeverity: {
              critical:
                data.graph.circularDependencies?.filter(c => c.severity === 'critical').length || 0,
              high: data.graph.circularDependencies?.filter(c => c.severity === 'high').length || 0,
              medium:
                data.graph.circularDependencies?.filter(c => c.severity === 'medium').length || 0,
              low: data.graph.circularDependencies?.filter(c => c.severity === 'low').length || 0,
              info: data.graph.circularDependencies?.filter(c => c.severity === 'info').length || 0,
            },
            coherenceIssues: data.graph.coherenceValidation
              ? {
                  high: data.graph.coherenceValidation.issuesBySeverity.high,
                  medium: data.graph.coherenceValidation.issuesBySeverity.medium,
                  low: data.graph.coherenceValidation.issuesBySeverity.low,
                }
              : undefined,
          }
        : undefined,
      context: data.context,
    };

    // スナップショットを保存
    this.dataStore.snapshots.push(snapshot);

    // 最大数を超えたら古いものを削除
    if (this.dataStore.snapshots.length > this.config.maxSnapshots!) {
      this.dataStore.snapshots.shift();
    }

    this.dataStore.lastUpdated = new Date().toISOString();

    // マイルストーンをチェック
    this.checkMilestones(snapshot);

    return snapshot;
  }

  // ============================================================================
  // 健全性スコア計算（Health Score Calculation）
  // ============================================================================

  /**
   * プロジェクト健全性スコアを計算
   *
   * **計算アルゴリズム:**
   * 1. maturity: (成熟度レベル / 5) × 100
   * 2. completeness: 完全性率 × 100
   * 3. consistency: 100 - (次元間の分散 × 200) ※分散が小さいほど高スコア
   * 4. traceability: トレーサビリティ次元スコア × 100
   * 5. architecture: 100 - (循環依存数 × 10) - (孤立ノード数 × 5)
   *
   * **総合スコア（加重平均）:**
   * - maturity: 30%
   * - completeness: 25%
   * - consistency: 15%
   * - traceability: 15%
   * - architecture: 15%
   *
   * **健全性レベル（configで設定可能）:**
   * - excellent: 90以上
   * - good: 75-89
   * - fair: 60-74
   * - poor: 40-59
   * - critical: 40未満
   *
   * **強み・弱みの判定:**
   * - 強み: カテゴリースコア ≥ 80
   * - 弱み: カテゴリースコア < 60
   *
   * **使用例:**
   * ```typescript
   * const snapshot = dashboard.createSnapshot({ maturity: assessment });
   * const health = dashboard.calculateHealthScore(snapshot);
   * console.log(health.overall); // → 75
   * console.log(health.level); // → "good"
   * console.log(health.strengths); // → ["完全性: 85点"]
   * console.log(health.weaknesses); // → ["アーキテクチャ: 55点"]
   * ```
   *
   * **拡張ポイント:**
   * - healthThresholdsで閾値をカスタマイズ可能
   * - 重み付けをconfigで変更可能（将来の拡張）
   *
   * @param snapshot メトリクススナップショット
   * @returns プロジェクト健全性スコア
   */
  calculateHealthScore(snapshot: MetricsSnapshot): ProjectHealthScore {
    // カテゴリー別スコア計算
    const maturityScore = (snapshot.maturityLevel / 5) * 100;
    const completenessScore = snapshot.overallCompletionRate * 100;

    // 一貫性スコア（ディメンション間のばらつきが少ないほど高い）
    const dimensionValues = Array.from(snapshot.dimensionScores.values());
    const avgDimension = dimensionValues.reduce((a, b) => a + b, 0) / dimensionValues.length;
    const variance =
      dimensionValues.reduce((sum, val) => sum + Math.pow(val - avgDimension, 2), 0) /
      dimensionValues.length;
    const consistencyScore = Math.max(0, 100 - variance * 200);

    // トレーサビリティスコア
    const traceabilityScore =
      (snapshot.dimensionScores.get('traceability' as MaturityDimension) || 0) * 100;

    // アーキテクチャスコア（重大な循環依存・孤立ノード・整合性エラーがないほど高い）
    // info レベルの循環（画面遷移の双方向性等）は減点対象外
    let architectureScore = 100;
    if (snapshot.graphStats) {
      // info レベルを除いた重大な循環のみカウント
      const criticalCycles =
        (snapshot.graphStats.circularDependenciesBySeverity?.critical || 0) +
        (snapshot.graphStats.circularDependenciesBySeverity?.high || 0);
      const mediumCycles = snapshot.graphStats.circularDependenciesBySeverity?.medium || 0;
      const lowCycles = snapshot.graphStats.circularDependenciesBySeverity?.low || 0;

      architectureScore -= criticalCycles * 15; // 重大な循環は大きく減点
      architectureScore -= mediumCycles * 8; // 中程度の循環は中減点
      architectureScore -= lowCycles * 3; // 軽微な循環は小減点
      architectureScore -= snapshot.graphStats.isolatedNodes * 5;

      // 整合性エラー（UseCaseとScreenFlowの不一致）の減点
      if (snapshot.graphStats.coherenceIssues) {
        architectureScore -= snapshot.graphStats.coherenceIssues.high * 10; // 高重大度の整合性エラー
        architectureScore -= snapshot.graphStats.coherenceIssues.medium * 5; // 中重大度の整合性エラー
        architectureScore -= snapshot.graphStats.coherenceIssues.low * 2; // 低重大度の整合性エラー
      }

      architectureScore = Math.max(0, architectureScore);
    }

    const categories = {
      maturity: Math.round(maturityScore),
      completeness: Math.round(completenessScore),
      consistency: Math.round(consistencyScore),
      traceability: Math.round(traceabilityScore),
      architecture: Math.round(architectureScore),
    };

    // 総合スコア（加重平均）
    const overall = Math.round(
      maturityScore * 0.3 +
        completenessScore * 0.25 +
        consistencyScore * 0.15 +
        traceabilityScore * 0.15 +
        architectureScore * 0.15
    );

    // レベル判定
    let level: ProjectHealthScore['level'];
    if (overall >= this.config.healthThresholds!.excellent) {
      level = 'excellent';
    } else if (overall >= this.config.healthThresholds!.good) {
      level = 'good';
    } else if (overall >= this.config.healthThresholds!.fair) {
      level = 'fair';
    } else if (overall >= this.config.healthThresholds!.poor) {
      level = 'poor';
    } else {
      level = 'critical';
    }

    // 強みと弱点を特定
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const categoryLabels: Record<string, string> = {
      maturity: '成熟度レベル',
      completeness: '完全性',
      consistency: '一貫性',
      traceability: 'トレーサビリティ',
      architecture: 'アーキテクチャ',
    };

    for (const [key, value] of Object.entries(categories)) {
      const label = categoryLabels[key] || key;
      if (value >= 80) {
        strengths.push(`${label}: ${value}点`);
      } else if (value < 60) {
        weaknesses.push(`${label}: ${value}点`);
      }
    }

    // 総合評価コメント
    const assessment = this.generateHealthAssessment(overall, level, categories);

    return {
      overall,
      level,
      categories,
      strengths,
      weaknesses,
      assessment,
    };
  }

  /**
   * トレンド分析
   */
  analyzeTrend(metricName: string, period?: { start: string; end: string }): MetricsTrend | null {
    if (this.dataStore.snapshots.length < 2) {
      return null;
    }

    // 期間フィルタリング
    let snapshots = this.dataStore.snapshots;
    if (period) {
      const startTime = new Date(period.start).getTime();
      const endTime = new Date(period.end).getTime();
      snapshots = snapshots.filter(s => {
        const time = new Date(s.timestamp).getTime();
        return time >= startTime && time <= endTime;
      });
    }

    if (snapshots.length < 2) {
      return null;
    }

    // データポイント抽出
    const dataPoints = snapshots
      .map(s => ({
        timestamp: s.timestamp,
        value: this.extractMetricValue(s, metricName),
      }))
      .filter(p => p.value !== null) as Array<{ timestamp: string; value: number }>;

    if (dataPoints.length === 0) {
      return null;
    }

    // 統計計算
    const values = dataPoints.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    // トレンド判定
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changeRate = ((lastValue - firstValue) / firstValue) * 100;

    let trend: 'improving' | 'stable' | 'declining';
    if (Math.abs(changeRate) < 5) {
      trend = 'stable';
    } else if (changeRate > 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }

    return {
      metric: metricName,
      period: {
        start: snapshots[0].timestamp,
        end: snapshots[snapshots.length - 1].timestamp,
      },
      dataPoints,
      statistics: {
        min,
        max,
        average,
        median,
        trend,
        changeRate,
      },
    };
  }

  // ============================================================================
  // スナップショット比較（Snapshot Comparison）
  // ============================================================================

  /**
   * スナップショット比較
   *
   * **比較内容:**
   * 1. 成熟度レベルの変化
   * 2. 完成率の変化
   * 3. 各次元スコアの変化
   * 4. 期間（日数・時間）
   * 5. 改善/悪化の判定
   *
   * **次元スコア変化の構造:**
   * - before: 前のスコア
   * - after: 後のスコア
   * - change: 変化量（after - before）
   * - improved: 改善したか（change > 0）
   *
   * **期間計算:**
   * - 日数と時間を計算（例: 7日5時間）
   *
   * **使用例:**
   * ```typescript
   * const snapshot1 = dashboard.createSnapshot({ maturity: assessment1 });
   * const snapshot2 = dashboard.createSnapshot({ maturity: assessment2 });
   * const comparison = dashboard.compareSnapshots(snapshot1.id, snapshot2.id);
   *
   * if (comparison) {
   *   console.log(comparison.summary);
   *   console.log(`期間: ${comparison.periodDays}日${comparison.periodHours}時間`);
   *   comparison.dimensionChanges.forEach((change, dim) => {
   *     console.log(`${dim}: ${change.change > 0 ? '↑' : '↓'} ${Math.abs(change.change * 100).toFixed(1)}%`);
   *   });
   * }
   * ```
   *
   * **注意:**
   * - 存在しないIDを指定するとnullを返す
   *
   * **拡張ポイント:**
   * - 比較サマリーのフォーマットをカスタマイズ可能
   *
   * @param beforeId 前のスナップショットID
   * @param afterId 後のスナップショットID
   * @returns スナップショット比較結果、存在しない場合はnull
   */
  compareSnapshots(beforeId: string, afterId: string): MetricsComparison | null {
    const before = this.dataStore.snapshots.find(s => s.id === beforeId);
    const after = this.dataStore.snapshots.find(s => s.id === afterId);

    if (!before || !after) {
      return null;
    }

    // ディメンションスコア変化
    const dimensionScores = new Map();
    for (const [dim, afterScore] of after.dimensionScores.entries()) {
      const beforeScore = before.dimensionScores.get(dim) || 0;
      const change = afterScore - beforeScore;
      dimensionScores.set(dim, {
        before: beforeScore,
        after: afterScore,
        change,
        improved: change > 0,
      });
    }

    // 期間計算
    const beforeTime = new Date(before.timestamp).getTime();
    const afterTime = new Date(after.timestamp).getTime();
    const diffMs = afterTime - beforeTime;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const maturityImproved = after.maturityLevel > before.maturityLevel;
    const completionImproved = after.overallCompletionRate > before.overallCompletionRate;

    const summary = this.generateComparisonSummary({
      maturityImproved,
      completionImproved,
      maturityChange: after.maturityLevel - before.maturityLevel,
      completionChange: after.overallCompletionRate - before.overallCompletionRate,
      days,
    });

    return {
      snapshots: { before, after },
      changes: {
        maturityLevel: {
          before: before.maturityLevel,
          after: after.maturityLevel,
          improved: maturityImproved,
        },
        dimensionScores,
        completionRate: {
          before: before.overallCompletionRate,
          after: after.overallCompletionRate,
          change: after.overallCompletionRate - before.overallCompletionRate,
          improved: completionImproved,
        },
      },
      duration: { days, hours },
      summary,
    };
  }

  // ============================================================================
  // レポート生成（Report Generation）
  // ============================================================================

  /**
   * ダッシュボードレポート生成
   *
   * **レポートタイプ:**
   * - summary: サマリーレポート（最新スナップショット、健全性スコア、アラート）
   * - detailed: 詳細レポート（トレンド分析、全スナップショット、推奨事項）
   * - trend: トレンドレポート（時系列分析、予測値）
   * - comparison: 比較レポート（期間内の変化）
   *
   * **レポート構成:**
   * 1. 基本情報: レポートタイプ、生成日時、対象期間
   * 2. 最新スナップショット: 現在の状態
   * 3. 健全性スコア: 総合評価、カテゴリー別評価
   * 4. トレンド分析: 主要メトリクスの推移（成熟度、完成率、推奨数）
   * 5. アラート: 現在の問題点
   * 6. 推奨事項: 改善アクション
   * 7. マイルストーン: 達成した目標
   *
   * **トレンド分析:**
   * - maturityLevel: 成熟度レベルの推移
   * - completionRate: 完成率の推移
   * - recommendationCount: 推奨事項数の推移
   *
   * **使用例:**
   * ```typescript
   * const report = dashboard.generateReport('detailed');
   * console.log(report.currentHealth.overall); // → 75
   * console.log(report.alerts.length); // → 2
   * report.trends.forEach(t => {
   *   console.log(`${t.metric}: 成長率 ${t.growthRate.toFixed(2)}% (${t.direction})`);
   * });
   * ```
   *
   * **注意:**
   * - スナップショットが存在しない場合はエラーをスロー
   *
   * **拡張ポイント:**
   * - 新しいレポートタイプを追加可能
   * - カスタムトレンド分析を追加可能
   *
   * @param type レポートタイプ（デフォルト: summary）
   * @returns ダッシュボードレポート
   * @throws スナップショットが存在しない場合
   */
  generateReport(type: DashboardReport['type'] = 'summary'): DashboardReport {
    if (this.dataStore.snapshots.length === 0) {
      throw new Error('スナップショットがありません');
    }

    const latestSnapshot = this.dataStore.snapshots[this.dataStore.snapshots.length - 1];
    const currentHealth = this.calculateHealthScore(latestSnapshot);

    // トレンド分析
    const trends: MetricsTrend[] = [];
    const metricNames = ['maturityLevel', 'completionRate', 'recommendationCount'];
    for (const metricName of metricNames) {
      const trend = this.analyzeTrend(metricName);
      if (trend) {
        trends.push(trend);
      }
    }

    // 主要指標
    const keyMetrics = this.calculateKeyMetrics(latestSnapshot);

    // インサイト生成
    const insights = this.generateInsights(currentHealth, trends);

    // 次のアクション
    const nextActions = this.generateNextActions(currentHealth, latestSnapshot);

    return {
      id: `report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      type,
      title: `品質ダッシュボードレポート (${type})`,
      currentHealth,
      latestSnapshot,
      trends,
      milestones: this.dataStore.milestones,
      keyMetrics,
      recommendationSummary: {
        total: latestSnapshot.recommendationCount.total,
        addressed: 0, // TODO: 実装
        pending: latestSnapshot.recommendationCount.total,
        topPriority: [], // TODO: 実装
      },
      insights,
      nextActions,
    };
  }

  /**
   * チャートデータ生成
   */
  generateChartData(type: ChartData['type'], metricName: string): ChartData | null {
    const trend = this.analyzeTrend(metricName);
    if (!trend) {
      return null;
    }

    return {
      type,
      title: `${metricName} トレンド`,
      labels: trend.dataPoints.map(p => new Date(p.timestamp).toLocaleDateString('ja-JP')),
      datasets: [
        {
          label: metricName,
          data: trend.dataPoints.map(p => p.value),
          color: '#3b82f6',
        },
      ],
      options: {
        xAxisLabel: '日付',
        yAxisLabel: metricName,
        showLegend: true,
      },
    };
  }

  // ============================================================================
  // アラート生成（Alert Generation）
  // ============================================================================

  /**
   * アラート生成
   *
   * **アラート条件:**
   * 1. 成熟度レベルが2以下 → warning
   * 2. 完成率が50%未満 → error
   * 3. 循環依存が存在 → error
   * 4. 孤立ノードが存在 → warning
   * 5. ディメンションスコアが60%未満 → warning
   *
   * **アラート情報:**
   * - id: 一意識別子
   * - severity: error, warning, info
   * - message: アラートメッセージ
   * - triggeredAt: アラート発生日時
   * - metric: メトリクス名
   * - threshold: 閾値（オプション）
   * - actualValue: 実測値
   * - recommendedAction: 推奨アクション
   *
   * **使用例:**
   * ```typescript
   * const snapshot = dashboard.createSnapshot({ maturity: assessment });
   * const alerts = dashboard.generateAlerts(snapshot);
   * alerts.forEach(a => {
   *   if (a.severity === 'error') {
   *     console.error(a.message, a.recommendedAction);
   *   }
   * });
   * ```
   *
   * **拡張ポイント:**
   * - 新しいアラート条件を追加可能
   * - カスタム閾値を設定可能（将来の拡張）
   *
   * @param snapshot メトリクススナップショット
   * @returns アラートの配列
   */
  generateAlerts(snapshot: MetricsSnapshot): MetricsAlert[] {
    const alerts: MetricsAlert[] = [];

    // 成熟度レベルが低い
    if (snapshot.maturityLevel <= 2) {
      alerts.push({
        id: `alert-maturity-${Date.now()}`,
        severity: 'warning',
        message: `プロジェクト成熟度がレベル${snapshot.maturityLevel}と低い状態です`,
        triggeredAt: new Date().toISOString(),
        metric: 'maturityLevel',
        actualValue: snapshot.maturityLevel,
        recommendedAction: '成熟度向上のための推奨事項を確認してください',
      });
    }

    // 完成率が低い
    if (snapshot.overallCompletionRate < 0.5) {
      alerts.push({
        id: `alert-completion-${Date.now()}`,
        severity: 'error',
        message: `完成率が${(snapshot.overallCompletionRate * 100).toFixed(0)}%と低い状態です`,
        triggeredAt: new Date().toISOString(),
        metric: 'completionRate',
        threshold: 0.5,
        actualValue: snapshot.overallCompletionRate,
        recommendedAction: '未達成基準の充足を優先してください',
      });
    }

    // 問題のある循環依存がある（critical/high/mediumのみ警告）
    if (snapshot.graphStats && snapshot.graphStats.circularDependenciesBySeverity) {
      const {
        critical = 0,
        high = 0,
        medium = 0,
      } = snapshot.graphStats.circularDependenciesBySeverity;
      const problemCycles = critical + high + medium;

      if (problemCycles > 0) {
        let severity: 'error' | 'warning' | 'info' = 'warning';
        if (critical > 0) {
          severity = 'error';
        } else if (high > 0) {
          severity = 'error';
        }

        alerts.push({
          id: `alert-circular-${Date.now()}`,
          severity,
          message: `${problemCycles}個の要対応の循環依存が検出されました（Critical: ${critical}, High: ${high}, Medium: ${medium}）`,
          triggeredAt: new Date().toISOString(),
          metric: 'circularDependencies',
          actualValue: problemCycles,
          recommendedAction: '循環依存の解消を優先してください',
        });
      }
    }

    return alerts;
  }

  /**
   * データエクスポート
   */
  export(options: ExportOptions): string {
    const { format, include = {} } = options;

    // デフォルトで全て含める
    const includeAll = {
      snapshots: include.snapshots !== false,
      trends: include.trends !== false,
      milestones: include.milestones !== false,
      recommendations: include.recommendations !== false,
      charts: include.charts !== false,
    };

    const data: any = {
      exportedAt: new Date().toISOString(),
      config: this.config,
    };

    if (includeAll.snapshots) {
      data.snapshots = this.dataStore.snapshots;
    }

    if (includeAll.milestones) {
      data.milestones = this.dataStore.milestones;
    }

    if (includeAll.trends) {
      data.trends = ['maturityLevel', 'completionRate']
        .map(m => this.analyzeTrend(m))
        .filter(Boolean);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);

      case 'markdown':
        return this.exportAsMarkdown(data);

      case 'html':
        return this.exportAsHTML(data);

      case 'csv':
        return this.exportAsCSV(data);

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // ===== プライベートメソッド =====

  private calculateOverallCompletionRate(maturity: ProjectMaturityAssessment): number {
    const rates: number[] = [];
    for (const [, elementOrArray] of Object.entries(maturity.elements)) {
      const elements = Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
      for (const element of elements) {
        if (element && element.overallCompletionRate !== undefined) {
          rates.push(element.overallCompletionRate);
        }
      }
    }
    return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  }

  private checkMilestones(snapshot: MetricsSnapshot): void {
    // 成熟度レベル達成
    const existingLevelMilestone = this.dataStore.milestones.find(
      m => m.type === 'maturity-level' && m.details.includes(`レベル${snapshot.maturityLevel}`)
    );

    if (!existingLevelMilestone && snapshot.maturityLevel >= 2) {
      this.dataStore.milestones.push({
        id: `milestone-level-${snapshot.maturityLevel}-${Date.now()}`,
        name: `成熟度レベル${snapshot.maturityLevel}達成`,
        achievedAt: snapshot.timestamp,
        type: 'maturity-level',
        details: `プロジェクトが成熟度レベル${snapshot.maturityLevel}に到達しました`,
        snapshotId: snapshot.id,
      });
    }

    // 完成率マイルストーン
    if (snapshot.overallCompletionRate >= 0.8) {
      const existing = this.dataStore.milestones.find(
        m => m.type === 'completion-rate' && m.details.includes('80%')
      );
      if (!existing) {
        this.dataStore.milestones.push({
          id: `milestone-completion-80-${Date.now()}`,
          name: '完成率80%達成',
          achievedAt: snapshot.timestamp,
          type: 'completion-rate',
          details: 'プロジェクト完成率が80%を超えました',
          snapshotId: snapshot.id,
        });
      }
    }
  }

  private extractMetricValue(snapshot: MetricsSnapshot, metricName: string): number | null {
    switch (metricName) {
      case 'maturityLevel':
        return snapshot.maturityLevel;
      case 'completionRate':
        return snapshot.overallCompletionRate;
      case 'recommendationCount':
        return snapshot.recommendationCount.total;
      case 'criticalRecommendations':
        return snapshot.recommendationCount.critical;
      case 'nodeCount':
        return snapshot.graphStats?.nodeCount || 0;
      case 'circularDependencies':
        return snapshot.graphStats?.circularDependencies || 0;
      default:
        return null;
    }
  }

  private generateHealthAssessment(
    overall: number,
    level: ProjectHealthScore['level'],
    categories: ProjectHealthScore['categories']
  ): string {
    const levelDescriptions = {
      excellent: '優れた品質状態です。現在のレベルを維持しつつ、さらなる改善を目指しましょう。',
      good: '良好な品質状態です。いくつかの改善余地がありますが、全体的に健全です。',
      fair: '普通の品質状態です。重点的な改善が必要な領域があります。',
      poor: '品質に課題があります。早急な改善が必要です。',
      critical: '深刻な品質問題があります。即座の対応が必要です。',
    };

    let assessment = levelDescriptions[level];

    // 最も低いカテゴリーを特定
    const lowest = Object.entries(categories).sort((a, b) => a[1] - b[1])[0];
    if (lowest[1] < 60) {
      assessment += ` 特に${lowest[0]}の改善が重要です。`;
    }

    return assessment;
  }

  private generateComparisonSummary(data: {
    maturityImproved: boolean;
    completionImproved: boolean;
    maturityChange: number;
    completionChange: number;
    days: number;
  }): string {
    const parts: string[] = [];

    if (data.maturityImproved) {
      parts.push(`成熟度が${data.maturityChange}レベル向上`);
    } else if (data.maturityChange < 0) {
      parts.push(`成熟度が${Math.abs(data.maturityChange)}レベル低下`);
    }

    if (data.completionImproved) {
      parts.push(`完成率が${(data.completionChange * 100).toFixed(1)}%向上`);
    } else if (data.completionChange < 0) {
      parts.push(`完成率が${Math.abs(data.completionChange * 100).toFixed(1)}%低下`);
    }

    const period = data.days > 0 ? `${data.days}日間で` : '';
    return `${period}${parts.join('、')}しました。`;
  }

  private calculateKeyMetrics(snapshot: MetricsSnapshot): Array<{
    name: string;
    current: number;
    previous?: number;
    change?: number;
    unit: string;
  }> {
    const metrics: Array<{
      name: string;
      current: number;
      previous?: number;
      change?: number;
      unit: string;
    }> = [
      {
        name: '成熟度レベル',
        current: snapshot.maturityLevel,
        unit: 'level',
      },
      {
        name: '完成率',
        current: Math.round(snapshot.overallCompletionRate * 100),
        unit: '%',
      },
      {
        name: '推奨事項',
        current: snapshot.recommendationCount.total,
        unit: '件',
      },
    ];

    // 前回の値と比較
    if (this.dataStore.snapshots.length >= 2) {
      const previous = this.dataStore.snapshots[this.dataStore.snapshots.length - 2];
      metrics[0].previous = previous.maturityLevel;
      metrics[0].change = snapshot.maturityLevel - previous.maturityLevel;

      metrics[1].previous = Math.round(previous.overallCompletionRate * 100);
      metrics[1].change = metrics[1].current - metrics[1].previous;

      metrics[2].previous = previous.recommendationCount.total;
      metrics[2].change = snapshot.recommendationCount.total - previous.recommendationCount.total;
    }

    return metrics;
  }

  private generateInsights(health: ProjectHealthScore, trends: MetricsTrend[]): string[] {
    const insights: string[] = [];

    // 健全性に基づくインサイト
    if (health.level === 'excellent') {
      insights.push('プロジェクトは優れた品質状態を維持しています');
    } else if (health.level === 'poor' || health.level === 'critical') {
      insights.push('プロジェクトの品質改善が急務です');
    }

    // トレンドに基づくインサイト
    for (const trend of trends) {
      if (trend.statistics.trend === 'improving') {
        insights.push(
          `${trend.metric}が改善傾向にあります（+${trend.statistics.changeRate.toFixed(1)}%）`
        );
      } else if (trend.statistics.trend === 'declining') {
        insights.push(
          `${trend.metric}が低下傾向にあります（${trend.statistics.changeRate.toFixed(1)}%）`
        );
      }
    }

    // 強みに基づくインサイト
    if (health.strengths.length > 0) {
      insights.push(`強み: ${health.strengths.join('、')}`);
    }

    return insights;
  }

  private generateNextActions(health: ProjectHealthScore, snapshot: MetricsSnapshot): string[] {
    const actions: string[] = [];

    // 弱点に基づくアクション
    for (const weakness of health.weaknesses) {
      actions.push(`${weakness}の改善に注力する`);
    }

    // 未達成基準に基づくアクション
    if (snapshot.unsatisfiedCriteriaCount > 0) {
      actions.push(`${snapshot.unsatisfiedCriteriaCount}個の未達成基準を充足する`);
    }

    // 推奨事項に基づくアクション
    if (snapshot.recommendationCount.critical > 0) {
      actions.push(`${snapshot.recommendationCount.critical}件のクリティカル推奨を実行する`);
    }

    // グラフ問題に基づくアクション
    if (snapshot.graphStats) {
      if (snapshot.graphStats.circularDependencies > 0) {
        actions.push(`${snapshot.graphStats.circularDependencies}個の循環依存を解消する`);
      }
      if (snapshot.graphStats.isolatedNodes > 0) {
        actions.push(`${snapshot.graphStats.isolatedNodes}個の孤立要素を統合する`);
      }
    }

    return actions.slice(0, 5); // Top 5のみ
  }

  private exportAsMarkdown(data: any): string {
    let md = '# 品質メトリクスダッシュボード\n\n';
    md += `エクスポート日時: ${data.exportedAt}\n\n`;

    if (data.snapshots && data.snapshots.length > 0) {
      md += '## スナップショット\n\n';
      const latest = data.snapshots[data.snapshots.length - 1];
      md += `- 成熟度レベル: ${latest.maturityLevel}\n`;
      md += `- 完成率: ${(latest.overallCompletionRate * 100).toFixed(1)}%\n`;
      md += `- 推奨事項: ${latest.recommendationCount.total}件\n\n`;
    }

    if (data.trends && data.trends.length > 0) {
      md += '## トレンド\n\n';
      for (const trend of data.trends) {
        md += `### ${trend.metric}\n`;
        md += `- トレンド: ${trend.statistics.trend}\n`;
        md += `- 変化率: ${trend.statistics.changeRate.toFixed(1)}%\n\n`;
      }
    }

    return md;
  }

  private exportAsHTML(data: any): string {
    let html =
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Dashboard</title></head><body>';
    html += '<h1>品質メトリクスダッシュボード</h1>';
    html += `<p>エクスポート日時: ${data.exportedAt}</p>`;

    if (data.snapshots && data.snapshots.length > 0) {
      const latest = data.snapshots[data.snapshots.length - 1];
      html += '<h2>最新スナップショット</h2>';
      html += '<ul>';
      html += `<li>成熟度レベル: ${latest.maturityLevel}</li>`;
      html += `<li>完成率: ${(latest.overallCompletionRate * 100).toFixed(1)}%</li>`;
      html += '</ul>';
    }

    html += '</body></html>';
    return html;
  }

  private exportAsCSV(data: any): string {
    if (!data.snapshots || data.snapshots.length === 0) {
      return '';
    }

    let csv = 'timestamp,maturityLevel,completionRate,recommendationCount\n';
    for (const snapshot of data.snapshots) {
      csv += `${snapshot.timestamp},${snapshot.maturityLevel},${snapshot.overallCompletionRate},${snapshot.recommendationCount.total}\n`;
    }

    return csv;
  }

  /**
   * データストアを取得
   */
  getDataStore(): DashboardDataStore {
    return this.dataStore;
  }

  /**
   * データストアをロード
   */
  loadDataStore(store: DashboardDataStore): void {
    this.dataStore = store;
    this.config = store.config;
  }
}

/**
 * デフォルトダッシュボードのエクスポート
 */
export const defaultDashboard = new MetricsDashboard();
