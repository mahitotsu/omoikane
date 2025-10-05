/**
 * 成熟度モデル - 型定義
 * 
 * 段階的詳細化に対応した成熟度レベル評価システム
 * プロジェクトの進化を5段階で評価し、次のステップを明確化
 */

import type * as Business from '../../types/business/index.js';
import type * as Functional from '../../types/functional/index.js';

// 型エイリアス
type Actor = Functional.Actor;
type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;
type UseCase = Functional.UseCase;

/**
 * 成熟度レベル（CMMI準拠）
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
 * 成熟度レベルの説明
 */
export const MaturityLevelDescription: Record<MaturityLevel, string> = {
  [MaturityLevel.INITIAL]: '基本的な情報のみが定義されている初期段階',
  [MaturityLevel.REPEATABLE]: '構造化され、チーム内で再現可能な状態',
  [MaturityLevel.DEFINED]: '詳細に定義され、組織標準に準拠している状態',
  [MaturityLevel.MANAGED]: '定量的に管理され、品質が測定可能な状態',
  [MaturityLevel.OPTIMIZED]: '継続的な改善プロセスが確立されている状態',
};

/**
 * 評価軸（ディメンション）
 */
export enum MaturityDimension {
  /** 構造の完全性 */
  STRUCTURE = 'structure',
  
  /** 内容の詳細度 */
  DETAIL = 'detail',
  
  /** トレーサビリティ */
  TRACEABILITY = 'traceability',
  
  /** テスト可能性 */
  TESTABILITY = 'testability',
  
  /** 保守性 */
  MAINTAINABILITY = 'maintainability',
}

/**
 * 成熟度評価基準
 */
export interface MaturityCriterion {
  /** 基準ID */
  id: string;
  
  /** 基準名 */
  name: string;
  
  /** 説明 */
  description: string;
  
  /** 適用レベル */
  level: MaturityLevel;
  
  /** 評価軸 */
  dimension: MaturityDimension;
  
  /** 必須かどうか */
  required: boolean;
  
  /** 達成条件 */
  condition: string;
  
  /** 重み（相対的重要度） */
  weight: number;
}

/**
 * 基準評価結果
 */
export interface CriterionEvaluation {
  /** 基準 */
  criterion: MaturityCriterion;
  
  /** 満たしているか */
  satisfied: boolean;
  
  /** 充足度（0-1） */
  score: number;
  
  /** 証拠・理由 */
  evidence: string;
  
  /** 改善提案 */
  suggestion?: string;
}

/**
 * ディメンション別成熟度
 */
export interface DimensionMaturity {
  /** 評価軸 */
  dimension: MaturityDimension;
  
  /** 現在のレベル */
  currentLevel: MaturityLevel;
  
  /** 達成率（0-1） */
  completionRate: number;
  
  /** 評価詳細 */
  evaluations: CriterionEvaluation[];
  
  /** 次のレベルまでの不足基準 */
  missingCriteria: MaturityCriterion[];
}

/**
 * 要素の成熟度評価結果
 */
export interface ElementMaturityAssessment {
  /** 要素ID */
  elementId: string;
  
  /** 要素タイプ */
  elementType: 'business-requirement' | 'actor' | 'usecase';
  
  /** 総合成熟度レベル */
  overallLevel: MaturityLevel;
  
  /** 総合達成率（0-1） */
  overallCompletionRate: number;
  
  /** ディメンション別評価 */
  dimensions: DimensionMaturity[];
  
  /** 達成済み基準 */
  satisfiedCriteria: MaturityCriterion[];
  
  /** 未達成基準 */
  unsatisfiedCriteria: MaturityCriterion[];
  
  /** 次のレベルへの道筋 */
  nextSteps: NextStep[];
  
  /** 次のレベルまでの推定工数 */
  estimatedEffort?: string;
}

/**
 * 次のステップ
 */
export interface NextStep {
  /** 優先度 */
  priority: 'high' | 'medium' | 'low';
  
  /** アクション */
  action: string;
  
  /** 理由 */
  rationale: string;
  
  /** 達成するとアンロックされる基準 */
  unlocksCriteria: string[];
  
  /** 推定所要時間 */
  estimatedTime?: string;
}

/**
 * プロジェクト全体の成熟度評価
 */
export interface ProjectMaturityAssessment {
  /** 評価日時 */
  timestamp: string;
  
  /** プロジェクト全体の成熟度レベル */
  projectLevel: MaturityLevel;
  
  /** 要素別評価 */
  elements: {
    businessRequirements?: ElementMaturityAssessment;
    actors: ElementMaturityAssessment[];
    useCases: ElementMaturityAssessment[];
  };
  
  /** ディメンション別の全体傾向 */
  overallDimensions: DimensionMaturity[];
  
  /** 強み */
  strengths: string[];
  
  /** 改善領域 */
  improvementAreas: string[];
  
  /** 推奨される次のアクション */
  recommendedActions: NextStep[];
  
  /** 成熟度分布 */
  distribution: {
    [key in MaturityLevel]: number;
  };
}

/**
 * 成熟度比較（時系列）
 */
export interface MaturityComparison {
  /** 前回評価 */
  previous?: ProjectMaturityAssessment;
  
  /** 今回評価 */
  current: ProjectMaturityAssessment;
  
  /** 向上した要素 */
  improvements: string[];
  
  /** 低下した要素 */
  regressions: string[];
  
  /** レベルアップした要素 */
  levelUps: Array<{
    elementId: string;
    fromLevel: MaturityLevel;
    toLevel: MaturityLevel;
  }>;
}
