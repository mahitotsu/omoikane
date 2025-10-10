/**
 * @fileoverview メトリクスダッシュボード - 型定義（Metrics Dashboard Model）
 *
 * **目的:**
 * 品質メトリクスの可視化、トレンド追跡、レポート生成のためのデータモデルを提供します。
 *
 * **主要な型定義:**
 * 1. MetricsSnapshot: 特定時点のメトリクススナップショット
 * 2. MetricsTrend: 時系列トレンドデータ
 * 3. ProjectHealthScore: プロジェクト健全性スコア（5観点）
 * 4. MetricsAlert: メトリクスアラート
 * 5. MetricsComparison: 2つのスナップショットの比較結果
 * 6. DashboardReport: ダッシュボードレポート
 * 7. ChartData: チャート可視化データ
 * 8. DashboardConfig: ダッシュボード設定
 *
 * **設計思想:**
 * - 時系列データの効率的な管理
 * - 複数の可視化形式をサポート（折れ線、棒グラフ、レーダーチャート）
 * - エクスポート形式の柔軟性（JSON, Markdown, HTML, CSV）
 * - カスタムメトリクスの拡張可能性
 *
 * **拡張ポイント:**
 * - 新しいメトリクスを追加: MetricsSnapshotにフィールド追加
 * - 新しいチャートタイプを追加: ChartDataにtypeを追加
 * - カスタムエクスポート形式を追加: DashboardConfigのexportFormatsに追加
 *
 * @module quality/maturity/metrics-dashboard-model
 */

import type { ProjectContext } from './context-model.js';
import type { MaturityDimension, MaturityLevel } from './maturity-model.js';

// ============================================================================
// メトリクススナップショット（Metrics Snapshot）
// ============================================================================

/**
 * メトリクススナップショット（特定時点の測定値）
 *
 * **用途:**
 * プロジェクトの品質メトリクスを特定時点で記録し、時系列分析を可能にします。
 *
 * **構成:**
 * 1. 基本情報: id, timestamp
 * 2. 成熟度情報: maturityLevel, dimensionScores, overallCompletionRate
 * 3. 要素数情報: elementCounts（ビジネス要件、アクター、ユースケース）
 * 4. 基準情報: unsatisfiedCriteriaCount
 * 5. 推奨情報: recommendationCount（total, critical, high）
 * 6. グラフ情報: graphStats（ノード数、エッジ数、循環依存、孤立ノード）
 * 7. コンテキスト情報: context（プロジェクトコンテキスト）
 * 8. メタデータ: metadata（カスタム情報）
 *
 * **使用例:**
 * ```typescript
 * const snapshot: MetricsSnapshot = {
 *   id: 'snapshot-2024-01-01',
 *   timestamp: '2024-01-01T00:00:00Z',
 *   maturityLevel: 3,
 *   dimensionScores: new Map([
 *     [MaturityDimension.STRUCTURE, 0.85],
 *     [MaturityDimension.DETAIL, 0.75]
 *   ]),
 *   elementCounts: { businessRequirements: 5, actors: 3, useCases: 10 },
 *   overallCompletionRate: 0.80,
 *   unsatisfiedCriteriaCount: 5,
 *   recommendationCount: { total: 10, critical: 2, high: 5 }
 * };
 * ```
 *
 * **拡張方法:**
 * 新しいメトリクスを追加する場合は、ここにフィールドを追加します。
 */
export interface MetricsSnapshot {
  /** スナップショットID */
  id: string;

  /** 測定日時 */
  timestamp: string;

  /** プロジェクト成熟度レベル */
  maturityLevel: MaturityLevel;

  /** ディメンション別スコア */
  dimensionScores: Map<MaturityDimension, number>;

  /** 要素数 */
  elementCounts: {
    businessRequirements: number;
    actors: number;
    useCases: number;
  };

  /** 総合完成率（0-1） */
  overallCompletionRate: number;

  /** 未達成基準数 */
  unsatisfiedCriteriaCount: number;

  /** 推奨数 */
  recommendationCount: {
    total: number;
    critical: number;
    high: number;
  };

  /** グラフ統計 */
  graphStats?: {
    nodeCount: number;
    edgeCount: number;
    circularDependencies: number;
    isolatedNodes: number;
    /** 重大度別の循環依存数 */
    circularDependenciesBySeverity?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
    /** 重大度別の整合性エラー数（UseCaseとScreenFlowの不一致） */
    coherenceIssues?: {
      high: number;
      medium: number;
      low: number;
    };
  };

  /** プロジェクトコンテキスト */
  context?: ProjectContext;

  /** カスタムメタデータ */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// メトリクストレンド（Metrics Trend）
// ============================================================================

/**
 * メトリクストレンド（時系列データ）
 *
 * **用途:**
 * メトリクスの時系列変化を分析し、トレンド方向、成長率、予測値を提供します。
 *
 * **構成:**
 * 1. 基本情報: metric, period（start, end）
 * 2. データポイント: dataPoints（timestamp, value）
 * 3. トレンド統計: statistics（min, max, average, median, stdDev）
 * 4. トレンド分析: direction（improving, declining, stable）, growthRate, forecast
 *
 * **トレンド方向:**
 * - improving: 改善傾向（成長率 > 0）
 * - declining: 悪化傾向（成長率 < 0）
 * - stable: 安定（成長率 ≈ 0）
 *
 * **使用例:**
 * ```typescript
 * const trend: MetricsTrend = {
 *   metric: 'maturityLevel',
 *   period: { start: '2024-01-01', end: '2024-01-31' },
 *   dataPoints: [
 *     { timestamp: '2024-01-01', value: 2 },
 *     { timestamp: '2024-01-15', value: 2.5 },
 *     { timestamp: '2024-01-31', value: 3 }
 *   ],
 *   statistics: { min: 2, max: 3, average: 2.5, median: 2.5, stdDev: 0.5 },
 *   direction: 'improving',
 *   growthRate: 0.5,
 *   forecast: { nextValue: 3.5, confidence: 0.85 }
 * };
 * ```
 */
export interface MetricsTrend {
  /** メトリクス名 */
  metric: string;

  /** 期間 */
  period: {
    start: string;
    end: string;
  };

  /** データポイント */
  dataPoints: Array<{
    timestamp: string;
    value: number;
  }>;

  /** トレンド統計 */
  statistics: {
    min: number;
    max: number;
    average: number;
    median: number;
    trend: 'improving' | 'stable' | 'declining';
    changeRate: number; // 変化率（%）
  };
}

/**
 * プロジェクト健全性スコア
 */
export interface ProjectHealthScore {
  /** 総合スコア（0-100） */
  overall: number;

  /** レベル */
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

  /** カテゴリー別スコア */
  categories: {
    maturity: number;
    completeness: number;
    consistency: number;
    traceability: number;
    architecture: number;
  };

  /** 強み */
  strengths: string[];

  /** 弱点 */
  weaknesses: string[];

  /** 総合評価コメント */
  assessment: string;
}

/**
 * マイルストーン
 */
export interface Milestone {
  /** マイルストーンID */
  id: string;

  /** 名前 */
  name: string;

  /** 達成日時 */
  achievedAt: string;

  /** マイルストーンタイプ */
  type: 'maturity-level' | 'completion-rate' | 'custom';

  /** 詳細 */
  details: string;

  /** 関連スナップショット */
  snapshotId: string;
}

/**
 * ダッシュボードレポート
 */
export interface DashboardReport {
  /** レポートID */
  id: string;

  /** 生成日時 */
  generatedAt: string;

  /** レポートタイプ */
  type: 'summary' | 'detailed' | 'executive' | 'technical';

  /** タイトル */
  title: string;

  /** 期間 */
  period?: {
    start: string;
    end: string;
  };

  /** 現在の健全性スコア */
  currentHealth: ProjectHealthScore;

  /** 最新スナップショット */
  latestSnapshot: MetricsSnapshot;

  /** トレンド */
  trends: MetricsTrend[];

  /** マイルストーン */
  milestones: Milestone[];

  /** 主要指標 */
  keyMetrics: Array<{
    name: string;
    current: number;
    previous?: number;
    change?: number;
    unit: string;
  }>;

  /** 推奨事項サマリー */
  recommendationSummary: {
    total: number;
    addressed: number;
    pending: number;
    topPriority: string[];
  };

  /** インサイト */
  insights: string[];

  /** 次のアクション */
  nextActions: string[];
}

/**
 * ダッシュボード設定
 */
export interface DashboardConfig {
  /** 自動スナップショット間隔（分） */
  autoSnapshotInterval?: number;

  /** 保持するスナップショット数 */
  maxSnapshots?: number;

  /** トレンド分析期間（日） */
  trendAnalysisPeriod?: number;

  /** 健全性スコアの閾値 */
  healthThresholds?: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };

  /** カスタムメトリクス */
  customMetrics?: Array<{
    name: string;
    description: string;
    calculator: (snapshot: MetricsSnapshot) => number;
  }>;

  /** エクスポート形式 */
  exportFormats?: ('json' | 'markdown' | 'html' | 'csv')[];
}

/**
 * メトリクス比較結果
 */
export interface MetricsComparison {
  /** 比較対象 */
  snapshots: {
    before: MetricsSnapshot;
    after: MetricsSnapshot;
  };

  /** 変化 */
  changes: {
    maturityLevel: {
      before: MaturityLevel;
      after: MaturityLevel;
      improved: boolean;
    };
    dimensionScores: Map<
      MaturityDimension,
      {
        before: number;
        after: number;
        change: number;
        improved: boolean;
      }
    >;
    completionRate: {
      before: number;
      after: number;
      change: number;
      improved: boolean;
    };
  };

  /** 期間 */
  duration: {
    days: number;
    hours: number;
  };

  /** サマリー */
  summary: string;
}

/**
 * ダッシュボードデータストレージ
 */
export interface DashboardDataStore {
  /** スナップショット一覧 */
  snapshots: MetricsSnapshot[];

  /** マイルストーン一覧 */
  milestones: Milestone[];

  /** 設定 */
  config: DashboardConfig;

  /** 最終更新日時 */
  lastUpdated: string;
}

/**
 * チャートデータ
 */
export interface ChartData {
  /** チャートタイプ */
  type: 'line' | 'bar' | 'radar' | 'pie';

  /** タイトル */
  title: string;

  /** ラベル */
  labels: string[];

  /** データセット */
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;

  /** オプション */
  options?: {
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
  };
}

/**
 * メトリクスアラート
 */
export interface MetricsAlert {
  /** アラートID */
  id: string;

  /** 重大度 */
  severity: 'info' | 'warning' | 'error' | 'critical';

  /** メッセージ */
  message: string;

  /** 発生日時 */
  triggeredAt: string;

  /** 関連メトリクス */
  metric: string;

  /** 閾値 */
  threshold?: number;

  /** 実際の値 */
  actualValue?: number;

  /** 推奨アクション */
  recommendedAction?: string;
}

/**
 * ダッシュボードエクスポート形式
 */
export type ExportFormat = 'json' | 'markdown' | 'html' | 'csv';

/**
 * エクスポートオプション
 */
export interface ExportOptions {
  /** 形式 */
  format: ExportFormat;

  /** ファイル名 */
  filename?: string;

  /** 期間フィルター */
  period?: {
    start: string;
    end: string;
  };

  /** 含める要素 */
  include?: {
    snapshots?: boolean;
    trends?: boolean;
    milestones?: boolean;
    recommendations?: boolean;
    charts?: boolean;
  };

  /** テンプレート */
  template?: string;
}
