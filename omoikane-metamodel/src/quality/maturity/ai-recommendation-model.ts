/**
 * @fileoverview AI Agent推奨エンジン v2.0 - 型定義（AI Recommendation Model）
 *
 * **目的:**
 * 成熟度評価、コンテキスト、依存関係分析を統合した
 * 高度な推奨アクション生成システムのデータモデルを提供します。
 *
 * **主要な型定義:**
 * 1. RecommendationPriority: 推奨の優先度（4段階）
 * 2. RecommendationCategory: 推奨のカテゴリー（7種類）
 * 3. ExecutableAction: 実行可能なアクション（AIエージェント用）
 * 4. StructuredRecommendation: 構造化推奨（問題、影響、解決策、効果）
 * 5. RecommendationBundle: 推奨バンドル（関連する推奨の集合）
 * 6. QuickWin: クイックウィン（低工数・高効果の推奨）
 * 7. LongTermStrategy: 長期戦略（戦略的改善の推奨）
 * 8. AIAgentRecommendations: 統合推奨結果
 *
 * **設計思想:**
 * - AIエージェントが自律的に実行できる形式
 * - 問題→影響→解決策→効果の明確な構造
 * - ROI計算による優先順位付け
 * - コンテキスト対応の柔軟な推奨生成
 *
 * **拡張ポイント:**
 * - 新しいカテゴリーを追加: RecommendationCategoryに列挙値を追加
 * - カスタムメトリクスを追加: StructuredRecommendationにフィールド追加
 * - 新しい推奨タイプを追加: AIAgentRecommendationsにフィールド追加
 *
 * @module quality/maturity/ai-recommendation-model
 */

import type { Actor, BusinessRequirementDefinition, UseCase } from '../../types/index.js';
import type { ProjectContext } from './context-model.js';
import type { GraphAnalysisResult } from './dependency-graph-model.js';
import type { MaturityLevel, ProjectMaturityAssessment } from './maturity-model.js';

// ============================================================================
// 推奨の優先度とカテゴリー（Recommendation Priority and Category）
// ============================================================================

/**
 * 推奨の優先度
 *
 * **用途:**
 * 推奨アクションの緊急度・重要度を4段階で定義します。
 *
 * **優先度の定義:**
 * - CRITICAL: 致命的、即座に対応が必要（例: セキュリティ脆弱性、規制違反）
 * - HIGH: 高優先度、近日中に対応が必要（例: 主要機能の欠陥、重大なバグ）
 * - MEDIUM: 中優先度、計画的に対応（例: 改善提案、パフォーマンス最適化）
 * - LOW: 低優先度、余裕があれば対応（例: 軽微な改善、将来的な拡張）
 *
 * **使用例:**
 * ROI計算、アラート生成、レポート生成で優先順位付けに使用されます。
 */
export enum RecommendationPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * 推奨のカテゴリー
 *
 * **用途:**
 * 推奨アクションの改善対象を7つのカテゴリーで分類します。
 *
 * **カテゴリーの定義:**
 * - STRUCTURE: 構造の完全性（要素の欠落、関係の不整合）
 * - DETAIL: 詳細度（説明の充実度、具体性）
 * - TRACEABILITY: トレーサビリティ（追跡可能性、関連付け）
 * - TESTABILITY: テスト容易性（テストケース、検証性）
 * - MAINTAINABILITY: 保守性（文書化、可読性、拡張性）
 * - ARCHITECTURE: アーキテクチャ（依存関係、モジュール構造）
 * - QUALITY: 品質全般（総合的な品質改善）
 *
 * **使用例:**
 * カテゴリー別に推奨を集計し、どの観点で改善が必要かを可視化します。
 */
export enum RecommendationCategory {
  STRUCTURE = 'structure',
  DETAIL = 'detail',
  TRACEABILITY = 'traceability',
  TESTABILITY = 'testability',
  MAINTAINABILITY = 'maintainability',
  ARCHITECTURE = 'architecture',
  QUALITY = 'quality',
}

// ============================================================================
// 実行可能なアクション（Executable Action）
// ============================================================================

/**
 * 実行可能なアクション
 *
 * **用途:**
 * AIエージェントが自律的に実行できるアクションを定義します。
 *
 * **構成:**
 * - id: アクション一意識別子
 * - name: アクション名
 * - command: 実行コマンド（オプション、将来のAI自律実行用）
 * - parameters: パラメータ（オプション）
 * - expectedOutcome: 期待される結果
 *
 * **使用例:**
 * ```typescript
 * const action: ExecutableAction = {
 *   id: 'action-add-precondition',
 *   name: '前提条件を追加',
 *   command: 'edit_element',
 *   parameters: {
 *     elementType: 'UseCase',
 *     elementId: 'uc-user-login',
 *     field: 'preconditions',
 *     value: ['ユーザーが登録済みであること']
 *   },
 *   expectedOutcome: 'ユースケースに前提条件が追加され、成熟度が向上する'
 * };
 * ```
 *
 * **拡張方法:**
 * - 新しいコマンドタイプを追加
 * - パラメータスキーマを定義
 * - AIエージェントの実行ロジックを実装
 */
export interface ExecutableAction {
  /** アクションID */
  id: string;

  /** アクション名 */
  name: string;

  /** 実行コマンド（AIが実行できる形式） */
  command?: string;

  /** パラメータ */
  parameters?: Record<string, unknown>;

  /** 期待される結果 */
  expectedOutcome: string;
}

// ============================================================================
// 構造化推奨（Structured Recommendation）
// ============================================================================

/**
 * 構造化推奨
 *
 * **用途:**
 * 問題、影響、解決策、効果を構造化した推奨アクションを定義します。
 *
 * **構成:**
 * 1. 基本情報: id, title, priority, category
 * 2. 問題の説明: problem（何が問題か）
 * 3. 影響範囲: scope, affectedElements, severity
 * 4. 解決策: description, steps, executables
 * 5. 期待される効果: benefits（成熟度向上、リスク軽減など）
 * 6. メタ情報: estimatedEffort, roi, source
 *
 * **影響範囲:**
 * - element: 単一要素に影響
 * - module: モジュール全体に影響
 * - project: プロジェクト全体に影響
 *
 * **ROI計算:**
 * ROI = 効果 / 工数（高いほど優先度が高い）
 *
 * **使用例:**
 * ```typescript
 * const rec: StructuredRecommendation = {
 *   id: 'rec-add-postcondition',
 *   title: 'ユースケース「ユーザーログイン」に事後条件を追加',
 *   priority: RecommendationPriority.HIGH,
 *   category: RecommendationCategory.STRUCTURE,
 *   problem: '事後条件が定義されていないため、成功状態が不明確です',
 *   impact: {
 *     scope: 'element',
 *     affectedElements: ['uc-user-login'],
 *     severity: 'high'
 *   },
 *   solution: {
 *     description: '事後条件を追加してユースケースの完全性を向上させます',
 *     steps: ['ログイン成功時の状態を明確化', '事後条件を追加'],
 *     executables: [...]
 *   },
 *   benefits: ['成熟度レベルが2→3に向上', 'テスト設計が容易になる'],
 *   estimatedEffort: 2,
 *   roi: 5.0,
 *   source: 'maturity_assessment'
 * };
 * ```
 *
 * **拡張方法:**
 * - 新しいフィールドを追加（例: assignee, deadline）
 * - カスタムメトリクスを追加
 */
export interface StructuredRecommendation {
  /** 推奨ID */
  id: string;

  /** タイトル */
  title: string;

  /** 優先度 */
  priority: RecommendationPriority;

  /** カテゴリー */
  category: RecommendationCategory;

  /** 問題の説明 */
  problem: string;

  /** 影響範囲 */
  impact: {
    scope: 'element' | 'module' | 'project';
    affectedElements: string[];
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  };

  /** 解決策 */
  solution: {
    description: string;
    steps: string[];
    executables?: ExecutableAction[];
  };

  /** 期待される効果 */
  benefits: string[];

  /** 推定工数 */
  effort: {
    hours: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };

  /** 前提条件 */
  prerequisites?: string[];

  /** リスク */
  risks?: string[];

  /** 関連リソース */
  references?: Array<{
    title: string;
    url?: string;
  }>;

  /** 根拠 */
  rationale: {
    maturityGap?: string;
    contextReason?: string;
    dependencyIssue?: string;
    bestPractice?: string;
  };
}

/**
 * 推奨バンドル（関連する推奨のグループ）
 */
export interface RecommendationBundle {
  /** バンドルID */
  id: string;

  /** バンドル名 */
  name: string;

  /** 説明 */
  description: string;

  /** バンドルに含まれる推奨 */
  recommendations: StructuredRecommendation[];

  /** 実行順序 */
  executionOrder: string[];

  /** 総工数見積もり */
  totalEffort: number;

  /** 期待される成熟度向上 */
  expectedMaturityImprovement: {
    currentLevel: MaturityLevel;
    targetLevel: MaturityLevel;
  };
}

/**
 * AIエージェント推奨結果
 */
export interface AIAgentRecommendations {
  /** 生成日時 */
  timestamp: string;

  /** プロジェクトコンテキスト */
  context?: ProjectContext;

  /** 全推奨リスト */
  recommendations: StructuredRecommendation[];

  /** 優先推奨（Top N） */
  topPriority: StructuredRecommendation[];

  /** 推奨バンドル */
  bundles: RecommendationBundle[];

  /** クイックウィン（すぐに実行できる改善） */
  quickWins: StructuredRecommendation[];

  /** 長期戦略推奨 */
  longTermStrategy: StructuredRecommendation[];

  /** サマリー */
  summary: {
    totalRecommendations: number;
    criticalCount: number;
    highPriorityCount: number;
    estimatedTotalHours: number;
    expectedMaturityIncrease: number;
  };
}

/**
 * 推奨生成オプション
 */
export interface RecommendationOptions {
  /** 推奨の最大数 */
  maxRecommendations?: number;

  /** 最小優先度 */
  minPriority?: RecommendationPriority;

  /** カテゴリーフィルター */
  categories?: RecommendationCategory[];

  /** 実行可能なアクションのみ */
  executableOnly?: boolean;

  /** 工数上限（時間） */
  maxEffortHours?: number;

  /** バンドル生成を有効化 */
  generateBundles?: boolean;
}

/**
 * テンプレート型推奨（v2）
 */
export interface AIRecommendationTemplate {
  /** テンプレートID */
  id: string;

  /** 適用条件 */
  condition: (data: {
    maturity?: ProjectMaturityAssessment;
    context?: ProjectContext;
    graph?: GraphAnalysisResult;
    requirements?: BusinessRequirementDefinition[];
    actors?: Actor[];
    useCases?: UseCase[];
  }) => boolean;

  /** 推奨生成関数 */
  generate: (data: {
    maturity?: ProjectMaturityAssessment;
    context?: ProjectContext;
    graph?: GraphAnalysisResult;
    requirements?: BusinessRequirementDefinition[];
    actors?: Actor[];
    useCases?: UseCase[];
  }) => StructuredRecommendation[];
}

/**
 * 推奨の実行結果
 */
export interface RecommendationExecutionResult {
  /** 推奨ID */
  recommendationId: string;

  /** 実行ステータス */
  status: 'success' | 'partial' | 'failed';

  /** 実行されたアクション */
  executedActions: string[];

  /** 実際の工数（時間） */
  actualEffort: number;

  /** 成熟度の変化 */
  maturityChange?: {
    before: MaturityLevel;
    after: MaturityLevel;
  };

  /** 実行ログ */
  log: string[];

  /** エラー */
  errors?: string[];
}

/**
 * AI学習用フィードバック
 */
export interface RecommendationFeedback {
  /** 推奨ID */
  recommendationId: string;

  /** 有用性評価（1-5） */
  usefulness: number;

  /** 実行難易度（1-5） */
  difficulty: number;

  /** 効果評価（1-5） */
  effectiveness: number;

  /** コメント */
  comments?: string;

  /** 実行した/しない理由 */
  decision: 'executed' | 'deferred' | 'rejected';

  /** フィードバック日時 */
  timestamp: string;
}

/**
 * 推奨トレンド分析
 */
export interface RecommendationTrends {
  /** 期間 */
  period: {
    start: string;
    end: string;
  };

  /** 生成された推奨総数 */
  totalGenerated: number;

  /** 実行された推奨数 */
  totalExecuted: number;

  /** 実行率 */
  executionRate: number;

  /** カテゴリー別統計 */
  byCategory: Map<
    RecommendationCategory,
    {
      generated: number;
      executed: number;
      avgEffectiveness: number;
    }
  >;

  /** 優先度別統計 */
  byPriority: Map<
    RecommendationPriority,
    {
      generated: number;
      executed: number;
    }
  >;

  /** 平均実行時間 */
  avgExecutionTime: number;

  /** トップ推奨テンプレート */
  topTemplates: Array<{
    templateId: string;
    usageCount: number;
    avgEffectiveness: number;
  }>;
}
