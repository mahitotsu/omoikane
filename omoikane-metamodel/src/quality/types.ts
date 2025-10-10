/**
 * @fileoverview 品質評価フレームワークの型定義（Quality Assessment Type Definitions）
 *
 * **目的:**
 * 品質評価システム全体で使用される型定義を一元管理します。
 *
 * **主要な型カテゴリ:**
 * 1. 評価結果（QualityAssessmentResult, QualityScore, QualityIssue）
 * 2. カバレッジ（CoverageReport, ElementCoverage, CoverageDetail）
 * 3. AI推奨（Recommendation, NextActionSuggestion, UseCaseTemplate）
 * 4. 設定（QualityAssessmentConfig）
 * 5. 参照（ElementReference, OrphanedElement）
 *
 * **スコアリング体系:**
 * - value: 0-100の数値スコア
 * - level: good (80+), warning (60-79), critical (0-59)
 * - 4つの評価カテゴリ: completeness, consistency, validity, traceability
 *
 * **カバレッジ体系:**
 * - 7つの要素タイプ: ビジネスゴール、スコープ、ステークホルダー、成功指標、前提条件、制約条件、ビジネスルール
 * - 各要素がどのユースケースで使用されているかを追跡
 * - 孤立要素（orphaned elements）の検出
 *
 * **AI推奨体系:**
 * - 優先度ベースの推奨アクション
 * - テンプレートによる新規作成支援
 * - トレーサビリティの改善提案
 *
 * **拡張ポイント:**
 * - 新しい評価カテゴリを追加する場合: QualityAssessmentResult.scoresに追加
 * - 新しい要素タイプを追加する場合: ElementReference.typeとCoverageReportに追加
 * - 新しいアクションタイプを追加する場合: NextActionSuggestion.actionTypeに追加
 *
 * @module quality/types
 */

import type * as Business from '../types/business/index.js';
import type * as Functional from '../types/functional/index.js';

// ============================================================================
// 型エイリアス（新型システム）
// ============================================================================

type Actor = Functional.Actor;
type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;
type UseCase = Functional.UseCase;

// ============================================================================
// 評価結果の型定義
// ============================================================================

/**
 * 品質スコア（Quality Score）
 *
 * **構造:**
 * - value: 0-100の数値スコア（減点方式）
 * - level: スコアレベル（閾値ベース）
 * - details: 人間可読な詳細情報
 *
 * **レベル判定基準:**
 * - good: 80点以上（高品質、そのまま使用可能）
 * - warning: 60-79点（改善推奨、動作可能）
 * - critical: 59点以下（重大な問題、修正必須）
 *
 * @property value - 0-100のスコア（100が最高）
 * @property level - スコアレベル（good, warning, critical）
 * @property details - 詳細情報（例: "完全性スコア: 85/100 (減点: 15)"）
 */
export interface QualityScore {
  value: number;
  level: 'good' | 'warning' | 'critical';
  details: string;
}

/**
 * 品質評価の全体結果（Quality Assessment Result）
 *
 * **構造:**
 * - overallScore: 総合スコア（4つの評価カテゴリの重み付き平均）
 * - scores: 各カテゴリ別スコア（completeness, consistency, validity, traceability）
 * - issues: 検出された問題リスト（severity順にソート推奨）
 * - coverage: カバレッジレポート（7つの要素タイプ）
 * - timestamp: 評価実行時刻（ISO 8601形式）
 *
 * **重み:**
 * - completeness: 30%（必須要素の存在）
 * - consistency: 30%（ID整合性、参照整合性）
 * - validity: 20%（説明の充実度、適切性）
 * - traceability: 20%（カバレッジ、トレーサビリティ）
 *
 * @property overallScore - 総合品質スコア（重み付き平均）
 * @property scores - 各品質カテゴリのスコア
 * @property issues - 発見された問題のリスト
 * @property coverage - カバレッジレポート
 * @property timestamp - 評価実行時刻（ISO 8601形式、例: "2025-10-06T12:34:56.789Z"）
 */
export interface QualityAssessmentResult {
  overallScore: QualityScore;
  scores: {
    completeness: QualityScore;
    consistency: QualityScore;
    validity: QualityScore;
    traceability: QualityScore;
  };
  issues: QualityIssue[];
  coverage: CoverageReport;
  timestamp: string;
}

/**
 * 品質問題の定義（Quality Issue）
 *
 * **構造:**
 * - severity: 深刻度（critical > warning > info）
 * - category: 問題カテゴリ（4つの評価観点のいずれか）
 * - elementType: 問題のある要素タイプ（businessGoal, actor, useCaseなど）
 * - elementId: 問題のある要素ID（特定の要素を識別）
 * - description: 問題の説明（何が問題か）
 * - impact: ビジネスへの影響（なぜ問題か）
 * - suggestion: 推奨される対応アクション（どう修正するか）
 *
 * **重要度の判断基準:**
 * - critical: 修正しないとシステムが動作しない（必須要素の欠如、ID重複など）
 * - warning: 品質が低下するが動作可能（説明不足、カバレッジ低など）
 * - info: 改善推奨だが許容範囲（軽微な問題）
 *
 * @property severity - 深刻度（critical: 修正必須, warning: 改善推奨, info: 軽微）
 * @property category - 問題のカテゴリ（4つの評価観点）
 * @property elementType - 問題のある要素タイプ
 * @property elementId - 問題のある要素ID
 * @property description - 問題の説明
 * @property impact - ビジネスへの影響
 * @property suggestion - 推奨される対応アクション
 */
export interface QualityIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'completeness' | 'consistency' | 'validity' | 'traceability';
  elementType: string;
  elementId: string;
  description: string;
  impact: string;
  suggestion: string;
}

// ============================================================================
// AI推奨の型定義
// ============================================================================

/**
 * AI Agent向けの推奨アクション（Recommendation）
 *
 * **目的:**
 * AIエージェントが品質問題を自動修正する際の指示を提供します。
 *
 * **構造:**
 * - priority: 優先度（high > medium > low）
 * - actionType: アクションタイプ（作成、更新、削除など）
 * - action: 具体的なアクション説明（何をするか）
 * - rationale: 理由（なぜこのアクションが必要か）
 * - affectedElements: 影響を受ける要素ID配列
 * - template: 新規作成時のテンプレート（オプション）
 *
 * **優先度の判断基準:**
 * - high: critical問題の修正、必須要素の追加
 * - medium: warning問題の修正、カバレッジ改善
 * - low: info問題の修正、品質向上
 *
 * @property priority - 優先度（high: 緊急, medium: 推奨, low: 任意）
 * @property actionType - アクションタイプ（例: "create_usecase", "update_coverage"）
 * @property action - アクションの説明
 * @property rationale - なぜこのアクションが必要か
 * @property affectedElements - 影響を受ける要素ID配列
 * @property template - 新規作成時のテンプレート（オプション）
 */
export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  actionType: string;
  action: string;
  rationale: string;
  affectedElements: string[];
  template?: RecommendationTemplate;
}

/**
 * 推奨アクションのテンプレート（Recommendation Template）
 *
 * **目的:**
 * 新規要素作成時の雛形を提供します。
 *
 * @property type - テンプレートタイプ（例: "usecase", "actor", "businessGoal"）
 * @property content - テンプレートの内容（型は動的、UseCaseTemplateなど）
 */
export interface RecommendationTemplate {
  type: string;
  content: any;
}

// ============================================================================
// カバレッジの型定義
// ============================================================================

/**
 * カバレッジレポート（Coverage Report）
 *
 * **目的:**
 * ビジネス要求定義の各要素がユースケースで使用されているかを追跡します。
 *
 * **7つの要素タイプ:**
 * 1. businessGoals: ビジネスゴール
 * 2. scopeItems: スコープ項目（inScope）
 * 3. stakeholders: ステークホルダー
 * 4. successMetrics: 成功指標
 * 5. assumptions: 前提条件
 * 6. constraints: 制約条件
 * 7. businessRules: ビジネスルール
 *
 * **追加情報:**
 * - orphanedElements: 孤立要素（アクターなど）
 *
 * @property businessGoals - ビジネスゴールのカバレッジ
 * @property scopeItems - スコープ項目のカバレッジ
 * @property stakeholders - ステークホルダーのカバレッジ
 * @property successMetrics - 成功指標のカバレッジ
 * @property assumptions - 前提条件のカバレッジ
 * @property constraints - 制約条件のカバレッジ
 * @property businessRules - ビジネスルールのカバレッジ
 * @property orphanedElements - 孤立した要素（どのユースケースからも使用されていない）
 */
export interface CoverageReport {
  businessGoals: ElementCoverage;
  scopeItems: ElementCoverage;
  stakeholders: ElementCoverage;
  successMetrics: ElementCoverage;
  assumptions: ElementCoverage;
  constraints: ElementCoverage;
  businessRules: ElementCoverage;
  orphanedElements: OrphanedElement[];
}

/**
 * 要素のカバレッジ情報（Element Coverage）
 *
 * **カバレッジ率の計算:**
 * - coverage = covered / total
 * - 1つでもユースケースで使用されていればカバーされたと判定
 *
 * @property total - 全要素数
 * @property covered - カバーされた要素数（1回以上使用された）
 * @property coverage - カバレッジ率（0.0-1.0、例: 0.85 = 85%）
 * @property uncovered - カバーされていない要素のリスト
 * @property details - カバー状況の詳細（各要素のusedBy情報を含む）
 */
export interface ElementCoverage {
  total: number;
  covered: number;
  coverage: number;
  uncovered: ElementReference[];
  details: CoverageDetail[];
}

/**
 * カバレッジの詳細情報（Coverage Detail）
 *
 * **用途:**
 * 各要素がどのユースケースで使用されているかを詳細に追跡します。
 *
 * @property element - 要素の参照情報（type, id, descriptionなど）
 * @property usedBy - この要素を利用しているユースケースID配列
 * @property isCovered - カバーされているかどうか（usedBy.length > 0）
 */
export interface CoverageDetail {
  element: ElementReference;
  usedBy: string[];
  isCovered: boolean;
}

/**
 * 孤立した要素（Orphaned Element）
 *
 * **定義:**
 * どのユースケースからも使用されていない要素。
 *
 * **検出対象:**
 * - アクター: どのユースケースのprimaryまたはsecondaryにも含まれていない
 * - 他の要素はElementCoverage.uncoveredで確認可能
 *
 * @property element - 要素の参照情報
 * @property reason - 孤立の理由（例: "このアクターを使用するユースケースが存在しません"）
 * @property suggestedUsage - 推奨される対応策の配列（例: ["〇〇が主体となるユースケースを作成する"]）
 */
export interface OrphanedElement {
  element: ElementReference;
  reason: string;
  suggestedUsage: string[];
}

// ============================================================================
// 参照と設定の型定義
// ============================================================================

/**
 * 要素の参照情報（Element Reference）
 *
 * **目的:**
 * 型に依存しない汎用的な要素参照を提供します。
 *
 * **9つの要素タイプ:**
 * - businessGoal: ビジネスゴール
 * - scopeItem: スコープ項目
 * - stakeholder: ステークホルダー
 * - successMetric: 成功指標
 * - assumption: 前提条件
 * - constraint: 制約条件
 * - businessRule: ビジネスルール
 * - actor: アクター
 * - usecase: ユースケース
 *
 * @property type - 要素タイプ（9種類のいずれか）
 * @property id - 要素ID（一意識別子）
 * @property name - 要素名（オプション、表示用）
 * @property description - 説明（オプション、詳細情報）
 */
export interface ElementReference {
  type:
    | 'businessGoal'
    | 'scopeItem'
    | 'stakeholder'
    | 'successMetric'
    | 'assumption'
    | 'constraint'
    | 'businessRule'
    | 'actor'
    | 'usecase';
  id: string;
  name?: string;
  description?: string;
}

/**
 * ユースケーステンプレート（UseCase Template）
 *
 * **目的:**
 * AIエージェントが新しいユースケースを作成する際の雛形を提供します。
 *
 * **推奨フィールド:**
 * - suggestedId: 命名規則に沿ったID（例: "UC_ProductBrowsing_SearchByCategory"）
 * - suggestedName: 明確な名前（例: "カテゴリ別商品検索"）
 * - suggestedDescription: 詳細な説明（目的、利用者、価値）
 * - suggestedActors: 関係するアクター（primary必須、secondary任意）
 * - suggestedCoverage: カバーすべきビジネス要求要素
 *
 * @property suggestedId - 推奨されるユースケースID
 * @property suggestedName - 推奨される名前
 * @property suggestedDescription - 推奨される説明
 * @property suggestedActors - 推奨されるアクター（primary必須、secondary任意）
 * @property suggestedCoverage - 推奨される業務要件カバレッジ（7つの要素タイプ）
 */
export interface UseCaseTemplate {
  suggestedId: string;
  suggestedName: string;
  suggestedDescription: string;
  suggestedActors: {
    primary: string;
    secondary?: string[];
  };
  suggestedCoverage: {
    businessGoals?: string[];
    scopeItems?: string[];
    stakeholders?: string[];
    successMetrics?: string[];
    assumptions?: string[];
    constraints?: string[];
    businessRules?: string[];
  };
}

/**
 * 品質評価の設定（Quality Assessment Config）
 *
 * **目的:**
 * 品質評価の厳密性とカバレッジ要件を設定します。
 *
 * **閾値の使い方:**
 * - minimumCoverageThreshold: これを下回るとcritical問題として報告（例: 0.6 = 60%）
 * - warningCoverageThreshold: これを下回るとwarning問題として報告（例: 0.8 = 80%）
 *
 * **厳密性レベル:**
 * - strict: 全ての問題を報告、高い閾値（推奨: 80%以上）
 * - moderate: 重要な問題のみ報告、中程度の閾値（推奨: 60%以上）
 * - lenient: critical問題のみ報告、低い閾値（推奨: 40%以上）
 *
 * @property minimumCoverageThreshold - カバレッジの最低閾値（0.0-1.0、例: 0.6 = 60%）
 * @property warningCoverageThreshold - 警告を出すカバレッジ閾値（0.0-1.0、例: 0.8 = 80%）
 * @property excludedElementTypes - 評価を無視する要素タイプ配列（オプション）
 * @property strictnessLevel - 厳密性レベル（strict, moderate, lenient）
 */
export interface QualityAssessmentConfig {
  minimumCoverageThreshold: number;
  warningCoverageThreshold: number;
  excludedElementTypes?: string[];
  strictnessLevel: 'strict' | 'moderate' | 'lenient';
}

/**
 * 品質評価の入力データ（Quality Assessment Input）
 *
 * **目的:**
 * 品質評価に必要な全てのデータをまとめて提供します。
 *
 * @property businessRequirements - 業務要件定義
 * @property actors - アクター一覧
 * @property useCases - ユースケース一覧
 * @property config - 評価設定（オプション、未指定時はデフォルト設定を使用）
 */
export interface QualityAssessmentInput {
  businessRequirements: BusinessRequirementDefinition;
  actors: Actor[];
  useCases: UseCase[];
  config?: QualityAssessmentConfig;
}

/**
 * 次のアクション提案（Next Action Suggestion）
 *
 * **目的:**
 * AIエージェントが次に実行すべきアクションを優先度順に提案します。
 *
 * **4つのアクションタイプ:**
 * - create_usecase: 新しいユースケースを作成（template提供）
 * - update_coverage: 既存ユースケースのカバレッジを更新
 * - add_stakeholder: 新しいステークホルダーを追加
 * - refine_scope: スコープを明確化
 *
 * @property actionType - アクションタイプ（4種類のいずれか）
 * @property template - テンプレート（新規作成時、例: UseCaseTemplate）
 * @property targetElements - 対象となる要素ID配列
 * @property reason - 理由（なぜこのアクションが必要か）
 * @property priority - 実行優先度（数値、高いほど優先、例: 1が最優先）
 * @property prerequisites - 実行に必要な前提条件（オプション、例: ["BG001が定義されていること"]）
 */
export interface NextActionSuggestion {
  actionType: 'create_usecase' | 'update_coverage' | 'add_stakeholder' | 'refine_scope';
  template?: UseCaseTemplate;
  targetElements: string[];
  reason: string;
  priority: number;
  prerequisites?: string[];
}
