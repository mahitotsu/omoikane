/**
 * メトリクスダッシュボード - 型定義
 * 
 * 品質メトリクスの可視化、トレンド追跡、レポート生成
 */

import type { ProjectContext } from './context-model.js';
import type { MaturityDimension, MaturityLevel } from './maturity-model.js';

/**
 * メトリクススナップショット（特定時点の測定値）
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
  };
  
  /** プロジェクトコンテキスト */
  context?: ProjectContext;
  
  /** カスタムメタデータ */
  metadata?: Record<string, unknown>;
}

/**
 * メトリクストレンド（時系列データ）
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
    dimensionScores: Map<MaturityDimension, {
      before: number;
      after: number;
      change: number;
      improved: boolean;
    }>;
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
