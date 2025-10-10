/**
 * @fileoverview 成熟度モデル - 型定義
 *
 * 目的: 段階的詳細化に対応した成熟度レベル評価システムの型定義
 * 構成: 5段階評価モデル（CMMI準拠）、5次元評価、基準定義、評価結果
 *
 * 成熟度レベル（1-5）:
 * 1. INITIAL: 基本情報のみ存在
 * 2. REPEATABLE: 構造化され一貫性がある
 * 3. DEFINED: 詳細化され標準化されている
 * 4. MANAGED: 測定可能で管理されている
 * 5. OPTIMIZED: 継続的改善が組み込まれている
 *
 * 評価ディメンション（5軸）:
 * - STRUCTURE: 構造の完全性
 * - DETAIL: 内容の詳細度
 * - TRACEABILITY: トレーサビリティ
 * - TESTABILITY: テスト可能性
 * - MAINTAINABILITY: 保守性
 *
 * 拡張ポイント:
 * - 新しいレベルを追加: MaturityLevel enum に追加（順次評価に影響）
 * - 新しいディメンションを追加: MaturityDimension enum に追加（評価軸が増加）
 * - 評価結果に新フィールド追加: ElementMaturityAssessment/ProjectMaturityAssessment に追加
 */

import type * as Business from '../../types/business/index.js';
import type * as Functional from '../../types/functional/index.js';

// 型エイリアス（簡潔な参照のため）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Actor = Functional.Actor;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UseCase = Functional.UseCase;

// ============================================================================
// 成熟度レベル定義（CMMI準拠）
// ============================================================================

/**
 * 成熟度レベル（1-5）
 *
 * CMMI（Capability Maturity Model Integration）に基づく5段階評価
 * 各レベルは前のレベルの基準を全て満たす必要がある（順次達成）
 */
export enum MaturityLevel {
  /** レベル1: 初期 - 基本情報のみ存在 */
  INITIAL = 1,

  /** レベル2: 反復可能 - 構造化され一貫性がある */
  REPEATABLE = 2,

  /** レベル3: 定義済み - 詳細化され標準化されている */
  DEFINED = 3,

  /** レベル4: 管理済み - 測定可能で管理されている */
  MANAGED = 4,

  /** レベル5: 最適化 - 継続的改善が組み込まれている */
  OPTIMIZED = 5,
}

/**
 * 成熟度レベルの詳細説明
 *
 * 各レベルの特徴と期待される状態を記述
 */
export const MaturityLevelDescription: Record<MaturityLevel, string> = {
  [MaturityLevel.INITIAL]: '基本的な情報のみが定義されている初期段階',
  [MaturityLevel.REPEATABLE]: '構造化され、チーム内で再現可能な状態',
  [MaturityLevel.DEFINED]: '詳細に定義され、組織標準に準拠している状態',
  [MaturityLevel.MANAGED]: '定量的に管理され、品質が測定可能な状態',
  [MaturityLevel.OPTIMIZED]: '継続的な改善プロセスが確立されている状態',
};

// ============================================================================
// 評価ディメンション（5軸）
// ============================================================================

/**
 * 評価ディメンション
 *
 * 成熟度を多角的に評価するための5つの軸
 * 各ディメンションは独立して評価され、全体像を形成する
 */
export enum MaturityDimension {
  /** 構造の完全性: 必要な要素が全て定義されているか */
  STRUCTURE = 'structure',

  /** 内容の詳細度: 情報が具体的で詳細に記述されているか */
  DETAIL = 'detail',

  /** トレーサビリティ: 要素間の関連が明確に追跡可能か */
  TRACEABILITY = 'traceability',

  /** テスト可能性: テストや検証が可能な形式か */
  TESTABILITY = 'testability',

  /** 保守性: 変更や拡張が容易に行えるか */
  MAINTAINABILITY = 'maintainability',
}

// ============================================================================
// 基準定義
// ============================================================================

/**
 * 成熟度評価基準
 *
 * 各レベル・ディメンションに対応する具体的な評価基準
 * maturity-criteria.ts で定義された基準の型
 */
export interface MaturityCriterion {
  /** 基準ID（一意識別子、評価ロジックで使用） */
  id: string;

  /** 基準名（短い名前） */
  name: string;

  /** 説明（基準の詳細） */
  description: string;

  /** 適用レベル（1-5） */
  level: MaturityLevel;

  /** 評価軸（どのディメンションに属するか） */
  dimension: MaturityDimension;

  /** 必須かどうか（trueの場合、このレベルに到達するために必須） */
  required: boolean;

  /** 達成条件（評価ロジックの参考情報） */
  condition: string;

  /** 重み（0-1、相対的重要度、完成率計算に使用） */
  weight: number;
}

// ============================================================================
// 評価結果
// ============================================================================

/**
 * 基準評価結果
 *
 * 1つの基準に対する評価結果
 */
export interface CriterionEvaluation {
  /** 基準 */
  criterion: MaturityCriterion;

  /** 満たしているか（true/false） */
  satisfied: boolean;

  /** 充足度（0-1、現在は0または1のみ） */
  score: number;

  /** 証拠・理由（評価根拠、推奨事項に使用） */
  evidence: string;

  /** 改善提案（オプション） */
  suggestion?: string;
}

/**
 * ディメンション別成熟度
 *
 * 1つのディメンション（評価軸）に対する評価結果
 */
export interface DimensionMaturity {
  /** 評価軸 */
  dimension: MaturityDimension;

  /** 現在のレベル（このディメンションで達成した最高レベル） */
  currentLevel: MaturityLevel;

  /** 達成率（0-1、重み付き完成率） */
  completionRate: number;

  /** 評価詳細（このディメンションの全基準評価） */
  evaluations: CriterionEvaluation[];

  /** 次のレベルまでの不足基準 */
  missingCriteria: MaturityCriterion[];
}

/**
 * 要素の成熟度評価結果
 *
 * 1つの要素（ユースケース、アクター、業務要件）の評価結果
 */
export interface ElementMaturityAssessment {
  /** 要素ID */
  elementId: string;

  /** 要素タイプ */
  elementType: 'business-requirement' | 'actor' | 'usecase';

  /** 総合成熟度レベル（全ての必須基準を満たす最高レベル） */
  overallLevel: MaturityLevel;

  /** 総合達成率（0-1、重み付き平均） */
  overallCompletionRate: number;

  /** ディメンション別評価（5ディメンション） */
  dimensions: DimensionMaturity[];

  /** 達成済み基準 */
  satisfiedCriteria: MaturityCriterion[];

  /** 未達成基準 */
  unsatisfiedCriteria: MaturityCriterion[];

  /** 次のレベルへの道筋（優先順位付き） */
  nextSteps: NextStep[];

  /** 次のレベルまでの推定工数（人間が読める形式） */
  estimatedEffort?: string;
}

/**
 * 次のステップ（推奨アクション）
 *
 * レベルアップのための具体的なアクション
 */
export interface NextStep {
  /** 優先度（high: 次のレベルに必須、medium: 重要、low: 推奨） */
  priority: 'high' | 'medium' | 'low';

  /** アクション（具体的な作業内容） */
  action: string;

  /** 理由（なぜこのアクションが必要か） */
  rationale: string;

  /** 達成するとアンロックされる基準ID */
  unlocksCriteria: string[];

  /** 推定所要時間（small/medium/large） */
  estimatedTime?: string;
}

// ============================================================================
// プロジェクトレベル評価
// ============================================================================

/**
 * プロジェクト全体の成熟度評価
 *
 * 全要素を集約したプロジェクトレベルの評価結果
 * プロジェクトレベル = 最弱の要素のレベル（最弱リンクの原則）
 */
export interface ProjectMaturityAssessment {
  /** 評価日時（ISO 8601形式） */
  timestamp: string;

  /** プロジェクト全体の成熟度レベル（全要素の最小値） */
  projectLevel: MaturityLevel;

  /** 要素別評価 */
  elements: {
    /** 業務要件（現在は1つのみ） */
    businessRequirements?: ElementMaturityAssessment;
    /** 全アクターの評価 */
    actors: ElementMaturityAssessment[];
    /** 全ユースケースの評価 */
    useCases: ElementMaturityAssessment[];
  };

  /** ディメンション別の全体傾向（5ディメンション集約） */
  overallDimensions: DimensionMaturity[];

  /** 強み（80%以上のディメンション） */
  strengths: string[];

  /** 改善領域（60%未満のディメンション） */
  improvementAreas: string[];

  /** 推奨される次のアクション（優先順位付き） */
  recommendedActions: NextStep[];

  /** 成熟度分布（各レベルの要素数） */
  distribution: {
    [key in MaturityLevel]: number;
  };
}

// ============================================================================
// 時系列比較
// ============================================================================

/**
 * 成熟度比較（時系列）
 *
 * 前回と今回の評価を比較し、進捗を可視化
 */
export interface MaturityComparison {
  /** 前回評価 */
  previous?: ProjectMaturityAssessment;

  /** 今回評価 */
  current: ProjectMaturityAssessment;

  /** 向上した要素（ID一覧） */
  improvements: string[];

  /** 低下した要素（ID一覧） */
  regressions: string[];

  /** レベルアップした要素 */
  levelUps: Array<{
    elementId: string;
    fromLevel: MaturityLevel;
    toLevel: MaturityLevel;
  }>;
}
