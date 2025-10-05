/**
 * 業務要件定義型
 * システムが提供すべき業務価値と成果の整理
 */

import type { Ref, TraceableDocument } from '../foundation/index.js';

/**
 * 業務要件項目（ゴール・スコープ・指標などの基本要素）
 */
export interface BusinessRequirementItem {
  /** 項目ID */
  id: string;
  
  /** 項目の説明 */
  description: string;
  
  /** 補足メモ */
  notes?: string;
}

/**
 * 業務要件におけるスコープ定義
 */
export interface BusinessRequirementScope {
  /** スコープ内項目 */
  inScope: BusinessRequirementItem[];
  
  /** スコープ外項目 */
  outOfScope?: BusinessRequirementItem[];
}

/**
 * セキュリティポリシー
 * BusinessRequirementItemを継承
 */
export interface SecurityPolicy extends BusinessRequirementItem {}

/**
 * ビジネスルール
 * BusinessRequirementItemを継承し、カテゴリー分類が可能
 */
export interface BusinessRule extends BusinessRequirementItem {
  /** ルールのカテゴリー */
  category?: string;
}

/**
 * 業務要件定義文書
 * システムが提供すべき業務価値と成果を整理した文書
 */
export interface BusinessRequirementDefinition extends TraceableDocument {
  /** タイトル */
  title: string;
  
  /** サマリー */
  summary: string;
  
  /** ビジネスゴール */
  businessGoals: BusinessRequirementItem[];
  
  /** スコープ */
  scope: BusinessRequirementScope;
  
  /** ステークホルダー */
  stakeholders: BusinessRequirementItem[];
  
  /** 成功指標 */
  successMetrics?: BusinessRequirementItem[];
  
  /** 前提条件 */
  assumptions?: BusinessRequirementItem[];
  
  /** 制約条件 */
  constraints?: BusinessRequirementItem[];
  
  /** セキュリティポリシー */
  securityPolicies?: SecurityPolicy[];
  
  /** ビジネスルール */
  businessRules?: BusinessRule[];
}

/**
 * 業務要件カバレッジ情報
 * ユースケースなどの機能仕様が、どの業務要件をカバーしているかを追跡
 * 
 * @template TRequirement - 業務要件定義の型
 * @template TGoal - ビジネスゴールの型
 * @template TScope - スコープ項目の型
 * @template TStakeholder - ステークホルダーの型
 * @template TMetric - 成功指標の型
 * @template TAssumption - 前提条件の型
 * @template TConstraint - 制約条件の型
 * @template TSecurityPolicy - セキュリティポリシーの型
 * @template TBusinessRule - ビジネスルールの型
 */
export interface BusinessRequirementCoverage<
  TRequirement = BusinessRequirementDefinition,
  TGoal = BusinessRequirementItem,
  TScope = BusinessRequirementItem,
  TStakeholder = BusinessRequirementItem,
  TMetric = BusinessRequirementItem,
  TAssumption = BusinessRequirementItem,
  TConstraint = BusinessRequirementItem,
  TSecurityPolicy = SecurityPolicy,
  TBusinessRule = BusinessRule,
> {
  /** 業務要件定義への参照 */
  requirement: Ref<TRequirement>;
  
  /** カバーするビジネスゴール */
  businessGoals: Ref<TGoal>[];
  
  /** カバーするスコープ項目 */
  scopeItems?: Ref<TScope>[];
  
  /** 関連するステークホルダー */
  stakeholders?: Ref<TStakeholder>[];
  
  /** 関連する成功指標 */
  successMetrics?: Ref<TMetric>[];
  
  /** 関連する前提条件 */
  assumptions?: Ref<TAssumption>[];
  
  /** 関連する制約条件 */
  constraints?: Ref<TConstraint>[];
  
  /** 関連するセキュリティポリシー */
  securityPolicies?: Ref<TSecurityPolicy>[];
  
  /** 関連するビジネスルール */
  businessRules?: Ref<TBusinessRule>[];
  
  /** カバレッジに関する補足 */
  notes?: string;
}
