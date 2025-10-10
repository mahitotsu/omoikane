/**
 * @fileoverview Business層 - 参照型定義
 *
 * **目的:**
 * 業務要件に関連する各要素への型安全な参照型を提供します。
 * これらの型はインスタンスプロジェクトのtyped-references.tsで使用されます。
 *
 * **提供する参照型:**
 * - BusinessRequirementDefinitionRef: 業務要件定義への参照
 * - BusinessGoalRef: ビジネスゴールへの参照
 * - BusinessScopeRef: スコープ項目への参照
 * - StakeholderRef: ステークホルダーへの参照
 * - SuccessMetricRef: 成功指標への参照
 * - AssumptionRef: 前提条件への参照
 * - ConstraintRef: 制約条件への参照
 * - SecurityPolicyRef: セキュリティポリシーへの参照
 * - BusinessRuleRef: ビジネスルールへの参照
 *
 * **設計思想:**
 * - 型安全性: ジェネリクスによりIDの型を保証
 * - 一貫性: Ref<T>を拡張し、追加の`type`フィールドで識別
 * - 互換性: Ref<T>が期待される場所でも使用可能
 * - 自動生成対応: インスタンスプロジェクトで型安全な参照関数を生成可能
 *
 * **使用例:**
 * ```typescript
 * // インスタンスプロジェクトのtyped-references.tsで使用
 * import type { BusinessGoalRef } from 'omoikane-metamodel';
 *
 * export function businessGoalRef<T extends KnownBusinessGoalId>(
 *   id: T
 * ): BusinessGoalRef<T> {
 *   return { id, type: 'business-goal-ref' };
 * }
 *
 * // Ref<T>が期待される場所でも使用可能
 * const coverage: BusinessRequirementCoverage = {
 *   requirement: businessRequirementRef('req-001'), // Ref<T>互換
 *   businessGoals: [businessGoalRef('goal-001')],   // Ref<T>互換
 * };
 * ```
 *
 * @module types/business/references
 */

import type { Ref } from '../foundation/reference.js';

/**
 * 業務要件定義への参照
 *
 * **特徴:**
 * - `Ref<T>`と完全互換（`id`と`displayName`を持つ）
 * - 追加の`type`フィールドで参照型を識別
 * - `BusinessRequirementCoverage.requirement`フィールドで直接使用可能
 *
 * @template T - 業務要件定義ID型（インスタンスプロジェクトで具体化）
 */
export type BusinessRequirementDefinitionRef<T = string> = Ref<unknown> & {
  /** 業務要件定義ID */
  id: T;
  /** 参照型識別子 */
  type?: 'business-requirement-ref';
};

/**
 * ビジネスゴールへの参照
 *
 * @template T - ビジネスゴールID型（インスタンスプロジェクトで具体化）
 */
export type BusinessGoalRef<T = string> = Ref<unknown> & {
  /** ビジネスゴールID */
  id: T;
  /** 参照型識別子 */
  type?: 'business-goal-ref';
};

/**
 * スコープ項目への参照
 *
 * @template T - スコープ項目ID型（インスタンスプロジェクトで具体化）
 */
export type BusinessScopeRef<T = string> = Ref<unknown> & {
  /** スコープ項目ID */
  id: T;
  /** 参照型識別子 */
  type?: 'business-scope-ref';
};

/**
 * ステークホルダーへの参照
 *
 * @template T - ステークホルダーID型（インスタンスプロジェクトで具体化）
 */
export type StakeholderRef<T = string> = Ref<unknown> & {
  /** ステークホルダーID */
  id: T;
  /** 参照型識別子 */
  type?: 'stakeholder-ref';
};

/**
 * 成功指標への参照
 *
 * @template T - 成功指標ID型（インスタンスプロジェクトで具体化）
 */
export type SuccessMetricRef<T = string> = Ref<unknown> & {
  /** 成功指標ID */
  id: T;
  /** 参照型識別子 */
  type?: 'success-metric-ref';
};

/**
 * 前提条件への参照
 *
 * @template T - 前提条件ID型（インスタンスプロジェクトで具体化）
 */
export type AssumptionRef<T = string> = Ref<unknown> & {
  /** 前提条件ID */
  id: T;
  /** 参照型識別子 */
  type?: 'assumption-ref';
};

/**
 * 制約条件への参照
 *
 * @template T - 制約条件ID型（インスタンスプロジェクトで具体化）
 */
export type ConstraintRef<T = string> = Ref<unknown> & {
  /** 制約条件ID */
  id: T;
  /** 参照型識別子 */
  type?: 'constraint-ref';
};

/**
 * セキュリティポリシーへの参照
 *
 * @template T - セキュリティポリシーID型（インスタンスプロジェクトで具体化）
 */
export type SecurityPolicyRef<T = string> = Ref<unknown> & {
  /** セキュリティポリシーID */
  id: T;
  /** 参照型識別子 */
  type?: 'security-policy-ref';
};

/**
 * ビジネスルールへの参照
 *
 * @template T - ビジネスルールID型（インスタンスプロジェクトで具体化）
 */
export type BusinessRuleRef<T = string> = Ref<unknown> & {
  /** ビジネスルールID */
  id: T;
  /** 参照型識別子 */
  type?: 'business-rule-ref';
};
