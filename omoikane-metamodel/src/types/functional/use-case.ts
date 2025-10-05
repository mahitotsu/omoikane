/**
 * ユースケース型定義
 * 段階的詳細化に対応したユースケース記述
 */

import type { BusinessRequirementCoverage, BusinessRule, SecurityPolicy } from '../business/index.js';
import type { PriorityLevel, Ref, TraceableDocument } from '../foundation/index.js';
import type { ActorReference } from './actor.js';

/**
 * ユースケースの複雑度
 */
export type UseCaseComplexity = 'simple' | 'medium' | 'complex';

/**
 * 代替フローの発生確率
 */
export type FlowProbability = 'high' | 'medium' | 'low';

/**
 * 代替フローの影響度
 */
export type FlowImpact = 'critical' | 'major' | 'minor';

/**
 * ユースケースのステップ
 * 段階的詳細化に対応し、基本情報と詳細情報を分離
 */
export interface UseCaseStep {
  /** ステップID（オプション、戻り先参照に使用） */
  stepId?: string;
  
  /** ステップ番号（実行時に自動計算） */
  readonly stepNumber?: number;
  
  /** アクター */
  actor: ActorReference;
  
  /** アクションの説明 */
  action: string;
  
  /** 期待される結果 */
  expectedResult: string;
  
  /** 補足メモ */
  notes?: string;
  
  // 詳細化フィールド（オプション）
  
  /** 入力データ */
  inputData?: string[];
  
  /** バリデーションルール */
  validationRules?: string[];
  
  /** エラーハンドリング */
  errorHandling?: string[];
  
  /** パフォーマンス要件 */
  performanceRequirement?: string;
}

/**
 * 代替フロー
 * メインフローから分岐する例外的な処理の流れ
 */
export interface AlternativeFlow {
  /** 代替フローID */
  id: string;
  
  /** 代替フロー名 */
  name: string;
  
  /** 発生条件 */
  condition: string;
  
  /** ステップ */
  steps: UseCaseStep[];
  
  /** 戻り先ステップID（stepIdベースの戻り先指定） */
  returnToStepId?: string;
  
  // 詳細化フィールド（オプション）
  
  /** 発生確率 */
  probability?: FlowProbability;
  
  /** 影響度 */
  impact?: FlowImpact;
  
  /** 緩和策 */
  mitigation?: string[];
}

/**
 * ユースケース内のアクター情報
 */
export interface UseCaseActors {
  /** 主アクター */
  primary: ActorReference;
  
  /** 副アクター */
  secondary?: ActorReference[];
}

/**
 * ユースケース
 * システムとアクターの相互作用を記述
 * 段階的詳細化に対応し、基本情報と詳細情報を分離
 */
export interface UseCase extends TraceableDocument {
  /** アクター */
  actors: UseCaseActors;
  
  /** 業務要件カバレッジ */
  businessRequirementCoverage?: BusinessRequirementCoverage;
  
  /** 事前条件 */
  preconditions: string[];
  
  /** 事後条件 */
  postconditions: string[];
  
  /** メインフロー */
  mainFlow: UseCaseStep[];
  
  /** 代替フロー */
  alternativeFlows?: AlternativeFlow[];
  
  /** 優先度 */
  priority: PriorityLevel;
  
  // 詳細化フィールド（オプション）
  
  /** 複雑度 */
  complexity?: UseCaseComplexity;
  
  /** 見積もり工数 */
  estimatedEffort?: string;
  
  /** 受入基準 */
  acceptanceCriteria?: string[];
  
  /** 関連ビジネスルール */
  businessRules?: Ref<BusinessRule>[];
  
  /** ビジネス価値 */
  businessValue?: string;
  
  /** データ要件 */
  dataRequirements?: string[];
  
  /** セキュリティ要件 */
  securityRequirements?: string[];
  
  /** 関連セキュリティポリシー */
  securityPolicies?: Ref<SecurityPolicy>[];
  
  /** パフォーマンス要件 */
  performanceRequirements?: string[];
  
  /** UI要件 */
  uiRequirements?: string[];
}
