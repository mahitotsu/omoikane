/**
 * @fileoverview セキュリティ要件（ポリシー）とユースケースの関連付け評価ユーティリティ（Security Requirements Evaluation Utility）
 * 
 * **目的:**
 * セキュリティポリシーがユースケースでどの程度カバーされているかを分析し、
 * 未カバーのポリシーを特定します。
 * 
 * **主要機能:**
 * 1. buildSecurityPolicyCoverage: セキュリティポリシーカバレッジを構築
 * 2. summarizeSecurityPolicies: セキュリティポリシー集計サマリーを生成
 * 3. calculateSecurityPolicyStats: カバレッジ統計を計算
 * 4. collectSecurityPolicyIds: セキュリティポリシーIDを収集
 * 
 * **カバレッジ評価の仕組み:**
 * - ユースケースのsecurityPoliciesフィールドを走査
 * - 各セキュリティポリシーが参照されているユースケースを集計
 * - 参照されていないポリシーを「未カバー」として特定
 * 
 * **データ構造:**
 * - SecurityPolicyCoverageEntry: 個別ポリシーのカバレッジ情報
 * - SecurityPolicySummary: 全ポリシーの集計サマリー
 * - SecurityPolicyStats: カバレッジ統計（総数、カバー率）
 * 
 * **使用例:**
 * ```typescript
 * const summary = summarizeSecurityPolicies(securityPolicies, useCases);
 * console.log(`カバー率: ${(summary.coverage.length - summary.uncoveredPolicies.length) / summary.coverage.length * 100}%`);
 * summary.uncoveredPolicies.forEach(entry => {
 *   console.log(`未カバー: ${entry.policy.id} - ${entry.policy.description}`);
 * });
 * ```
 * 
 * **拡張ポイント:**
 * - カバレッジ評価のロジックをカスタマイズ
 * - 新しい統計メトリクスを追加
 * 
 * @module quality/security-requirements
 */

import type * as Business from '../types/business/index.js';
import type { Ref } from '../types/foundation/index.js';
import type * as Functional from '../types/functional/index.js';

// 型エイリアス
type SecurityPolicy = Business.SecurityPolicy;
type SecurityPolicyRef = Ref<SecurityPolicy>;  // 新型では Ref<T>
type UseCase = Functional.UseCase;

export type AnyUseCase = UseCase;

// ============================================================================
// 型定義（Type Definitions）
// ============================================================================

/**
 * セキュリティポリシーカバレッジエントリ
 * 
 * **用途:**
 * 個別のセキュリティポリシーのカバレッジ情報を表現します。
 * 
 * **構成:**
 * - policy: セキュリティポリシー
 * - coveredByUseCases: このポリシーをカバーしているユースケース一覧
 * - uncovered: 未カバーかどうか（true: 未カバー、false: カバー済み）
 */
export interface SecurityPolicyCoverageEntry<
  Policy extends SecurityPolicy = SecurityPolicy,
  U extends AnyUseCase = AnyUseCase,
> {
  readonly policy: Policy;
  readonly coveredByUseCases: U[];
  readonly uncovered: boolean;
}

/**
 * セキュリティポリシー集計サマリー
 * 
 * **用途:**
 * 全セキュリティポリシーのカバレッジ情報を集計したサマリーを表現します。
 * 
 * **構成:**
 * - policies: 全セキュリティポリシー
 * - coverage: 各ポリシーのカバレッジエントリ
 * - uncoveredPolicies: 未カバーのポリシーのみ
 */
export interface SecurityPolicySummary<
  Policy extends SecurityPolicy = SecurityPolicy,
  U extends AnyUseCase = AnyUseCase,
> {
  readonly policies: readonly Policy[];
  readonly coverage: readonly SecurityPolicyCoverageEntry<Policy, U>[];
  readonly uncoveredPolicies: readonly SecurityPolicyCoverageEntry<Policy, U>[];
}

/**
 * セキュリティポリシー統計
 * 
 * **用途:**
 * セキュリティポリシーのカバレッジ統計を表現します。
 * 
 * **構成:**
 * - totalPolicies: 総ポリシー数
 * - totalCoveredPolicies: カバー済みポリシー数
 * - totalUncoveredPolicies: 未カバーポリシー数
 * - coverageRatio: カバー率（0.0-1.0）
 */
export interface SecurityPolicyStats {
  readonly totalPolicies: number;
  readonly totalCoveredPolicies: number;
  readonly totalUncoveredPolicies: number;
  readonly coverageRatio: number;
}

// ============================================================================
// 公開API（Public API）
// ============================================================================

/**
 * セキュリティポリシーカバレッジを構築
 * 
 * **処理フロー:**
 * 1. 各セキュリティポリシーに対して以下を実行:
 * 2. ユースケースのsecurityPoliciesフィールドを走査して参照を探す
 * 3. 参照しているユースケースを集計
 * 4. 参照が0件なら「未カバー」とマーク
 * 
 * **使用例:**
 * ```typescript
 * const coverage = buildSecurityPolicyCoverage(securityPolicies, useCases);
 * coverage.forEach(entry => {
 *   if (entry.uncovered) {
 *     console.log(`未カバー: ${entry.policy.id}`);
 *   } else {
 *     console.log(`カバー: ${entry.policy.id} (${entry.coveredByUseCases.length}件)`);
 *   }
 * });
 * ```
 * 
 * @param securityPolicies セキュリティポリシー一覧
 * @param useCases ユースケース一覧
 * @returns セキュリティポリシーカバレッジエントリの配列
 */
export function buildSecurityPolicyCoverage<Policy extends SecurityPolicy, U extends AnyUseCase>(
  securityPolicies: readonly Policy[],
  useCases: readonly U[]
): SecurityPolicyCoverageEntry<Policy, U>[] {
  return securityPolicies.map(policy => {
    const coveredByUseCases = useCases.filter(useCase =>
      (useCase.securityPolicies ?? []).some(policyRef => matchesPolicy(policyRef, policy))
    );

    return {
      policy,
      coveredByUseCases,
      uncovered: coveredByUseCases.length === 0,
    };
  });
}

/**
 * セキュリティポリシー集計サマリーを生成
 * 
 * **処理フロー:**
 * 1. buildSecurityPolicyCoverageを呼び出してカバレッジを構築
 * 2. 未カバーのポリシーをフィルタリング
 * 3. サマリーオブジェクトを構築して返す
 * 
 * **使用例:**
 * ```typescript
 * const summary = summarizeSecurityPolicies(securityPolicies, useCases);
 * console.log(`総ポリシー数: ${summary.policies.length}`);
 * console.log(`未カバー数: ${summary.uncoveredPolicies.length}`);
 * summary.uncoveredPolicies.forEach(entry => {
 *   console.log(`  - ${entry.policy.id}: ${entry.policy.description}`);
 * });
 * ```
 * 
 * @param securityPolicies セキュリティポリシー一覧
 * @param useCases ユースケース一覧
 * @returns セキュリティポリシー集計サマリー
 */
export function summarizeSecurityPolicies<Policy extends SecurityPolicy, U extends AnyUseCase>(
  securityPolicies: readonly Policy[],
  useCases: readonly U[]
): SecurityPolicySummary<Policy, U> {
  const coverage = buildSecurityPolicyCoverage(securityPolicies, useCases);
  const uncoveredPolicies = coverage.filter(entry => entry.uncovered);

  return {
    policies: securityPolicies,
    coverage,
    uncoveredPolicies,
  };
}

/**
 * セキュリティポリシーカバレッジ統計を計算
 * 
 * **計算内容:**
 * - totalPolicies: カバレッジエントリの総数
 * - totalCoveredPolicies: uncovered=falseのエントリ数
 * - totalUncoveredPolicies: totalPolicies - totalCoveredPolicies
 * - coverageRatio: totalCoveredPolicies / totalPolicies（0件の場合は1.0）
 * 
 * **使用例:**
 * ```typescript
 * const coverage = buildSecurityPolicyCoverage(securityPolicies, useCases);
 * const stats = calculateSecurityPolicyStats(coverage);
 * console.log(`カバー率: ${(stats.coverageRatio * 100).toFixed(1)}%`);
 * console.log(`未カバー: ${stats.totalUncoveredPolicies}件`);
 * ```
 * 
 * @param coverage セキュリティポリシーカバレッジエントリの配列
 * @returns セキュリティポリシー統計
 */
export function calculateSecurityPolicyStats<Policy extends SecurityPolicy, U extends AnyUseCase>(
  coverage: readonly SecurityPolicyCoverageEntry<Policy, U>[]
): SecurityPolicyStats {
  const totalPolicies = coverage.length;
  const totalCoveredPolicies = coverage.filter(entry => !entry.uncovered).length;
  const totalUncoveredPolicies = totalPolicies - totalCoveredPolicies;
  const coverageRatio = totalPolicies === 0 ? 1 : totalCoveredPolicies / totalPolicies;

  return {
    totalPolicies,
    totalCoveredPolicies,
    totalUncoveredPolicies,
    coverageRatio,
  };
}

/**
 * セキュリティポリシーIDを収集
 * 
 * **処理内容:**
 * - policyRefsから各参照のIDを抽出
 * - Ref型の参照からidフィールドを取得
 * 
 * **使用例:**
 * ```typescript
 * const policyIds = collectSecurityPolicyIds(useCase.securityPolicies);
 * console.log(`参照ポリシー数: ${policyIds.length}`);
 * ```
 * 
 * @param policyRefs セキュリティポリシー参照の配列
 * @returns セキュリティポリシーIDの配列
 */
export function collectSecurityPolicyIds(
  policyRefs: readonly SecurityPolicyRef[] | undefined
): string[] {
  return (policyRefs ?? []).map(ref => ref.id);
}

// ============================================================================
// 内部ヘルパー関数（Internal Helper Functions）
// ============================================================================

/**
 * セキュリティポリシー参照が一致するかチェック
 * 
 * **処理内容:**
 * - policyRefとpolicyのIDが一致するか確認
 * - policyRefがundefinedの場合はfalseを返す
 * 
 * @param policyRef セキュリティポリシー参照
 * @param policy 検索対象のセキュリティポリシー
 * @returns IDが一致する場合true
 */
function matchesPolicy(policyRef: SecurityPolicyRef | undefined, policy: SecurityPolicy): boolean {
  return Boolean(policyRef && policyRef.id === policy.id);
}
