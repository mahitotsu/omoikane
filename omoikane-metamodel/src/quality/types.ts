/**
 * 品質評価フレームワークの型定義
 */

import type {
    Actor,
    BusinessRequirementDefinition,
    UseCase,
} from '../types/delivery-elements.js';

/**
 * 品質スコア
 */
export interface QualityScore {
  value: number; // 0-100のスコア
  level: 'good' | 'warning' | 'critical'; // スコアレベル
  details: string; // 詳細情報
}

/**
 * 品質評価の全体結果
 */
export interface QualityAssessmentResult {
  /** 総合品質スコア */
  overallScore: QualityScore;
  /** 各品質カテゴリのスコア */
  scores: {
    completeness: QualityScore;
    consistency: QualityScore;
    validity: QualityScore;
    traceability: QualityScore;
  };
  /** 発見された問題のリスト */
  issues: QualityIssue[];
  /** カバレッジレポート */
  coverage: CoverageReport;
  /** 評価実行時刻 */
  timestamp: string;
}

/**
 * 品質問題の定義
 */
export interface QualityIssue {
  /** 深刻度 */
  severity: 'critical' | 'warning' | 'info';
  /** 問題のカテゴリ */
  category: 'completeness' | 'consistency' | 'validity' | 'traceability';
  /** 問題のある要素タイプ */
  elementType: string;
  /** 問題のある要素ID */
  elementId: string;
  /** 問題の説明 */
  description: string;
  /** ビジネスへの影響 */
  impact: string;
  /** 推奨される対応アクション */
  suggestion: string;
}

/**
 * AI Agent向けの推奨アクション
 */
export interface Recommendation {
  /** 優先度 */
  priority: 'high' | 'medium' | 'low';
  /** アクションタイプ */
  actionType: string;
  /** アクションの説明 */
  action: string;
  /** なぜこのアクションが必要か */
  rationale: string;
  /** 影響を受ける要素 */
  affectedElements: string[];
  /** 新規作成時のテンプレート（オプション） */
  template?: RecommendationTemplate;
}

/**
 * 推奨アクションのテンプレート
 */
export interface RecommendationTemplate {
  /** テンプレートタイプ */
  type: string;
  /** テンプレートの内容 */
  content: any;
}

/**
 * カバレッジレポート
 */
export interface CoverageReport {
  /** ビジネスゴールのカバレッジ */
  businessGoals: ElementCoverage;
  /** スコープ項目のカバレッジ */
  scopeItems: ElementCoverage;
  /** ステークホルダーのカバレッジ */
  stakeholders: ElementCoverage;
  /** 成功指標のカバレッジ */
  successMetrics: ElementCoverage;
  /** 前提条件のカバレッジ */
  assumptions: ElementCoverage;
  /** 制約条件のカバレッジ */
  constraints: ElementCoverage;
  /** 孤立した要素 */
  orphanedElements: OrphanedElement[];
}

/**
 * 要素のカバレッジ情報
 */
export interface ElementCoverage {
  /** 全要素数 */
  total: number;
  /** カバーされた要素数 */
  covered: number;
  /** カバレッジ率 (0-1) */
  coverage: number;
  /** カバーされていない要素 */
  uncovered: ElementReference[];
  /** カバー状況の詳細 */
  details: CoverageDetail[];
}

/**
 * カバレッジの詳細情報
 */
export interface CoverageDetail {
  /** 要素の参照 */
  element: ElementReference;
  /** この要素を利用しているユースケース */
  usedBy: string[];
  /** カバーされているかどうか */
  isCovered: boolean;
}

/**
 * 孤立した要素
 */
export interface OrphanedElement {
  /** 要素の参照 */
  element: ElementReference;
  /** 孤立の理由 */
  reason: string;
  /** 推奨される対応 */
  suggestedUsage: string[];
}

/**
 * 要素の参照情報
 */
export interface ElementReference {
  /** 要素タイプ */
  type: 'businessGoal' | 'scopeItem' | 'stakeholder' | 'successMetric' | 'assumption' | 'constraint' | 'actor' | 'usecase';
  /** 要素ID */
  id: string;
  /** 要素名（オプション） */
  name?: string;
  /** 説明（オプション） */
  description?: string;
}

/**
 * ユースケーステンプレート
 */
export interface UseCaseTemplate {
  /** 推奨されるユースケースID */
  suggestedId: string;
  /** 推奨される名前 */
  suggestedName: string;
  /** 推奨される説明 */
  suggestedDescription: string;
  /** 推奨されるアクター */
  suggestedActors: {
    primary: string;
    secondary?: string[];
  };
  /** 推奨される業務要件カバレッジ */
  suggestedCoverage: {
    businessGoals?: string[];
    scopeItems?: string[];
    stakeholders?: string[];
    successMetrics?: string[];
    assumptions?: string[];
    constraints?: string[];
  };
}

/**
 * 品質評価の設定
 */
export interface QualityAssessmentConfig {
  /** カバレッジの最低閾値 */
  minimumCoverageThreshold: number;
  /** 警告を出すカバレッジ閾値 */
  warningCoverageThreshold: number;
  /** 評価を無視する要素タイプ */
  excludedElementTypes?: string[];
  /** 厳密性レベル */
  strictnessLevel: 'strict' | 'moderate' | 'lenient';
}

/**
 * 品質評価の入力データ
 */
export interface QualityAssessmentInput {
  /** 業務要件定義 */
  businessRequirements: BusinessRequirementDefinition;
  /** アクター一覧 */
  actors: Actor[];
  /** ユースケース一覧 */
  useCases: UseCase[];
  /** 評価設定 */
  config?: QualityAssessmentConfig;
}

/**
 * 次のアクション提案
 */
export interface NextActionSuggestion {
  /** アクションタイプ */
  actionType: 'create_usecase' | 'update_coverage' | 'add_stakeholder' | 'refine_scope';
  /** テンプレート（新規作成時） */
  template?: UseCaseTemplate;
  /** 対象となる要素ID */
  targetElements: string[];
  /** 理由 */
  reason: string;
  /** 実行優先度 */
  priority: number;
  /** 実行に必要な前提条件 */
  prerequisites?: string[];
}