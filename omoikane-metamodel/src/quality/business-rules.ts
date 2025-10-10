/**
 * @fileoverview ビジネスルールとユースケースの関連付け評価ユーティリティ（Business Rules Evaluation Utility）
 *
 * **目的:**
 * ビジネスルールがユースケースでどの程度カバーされているかを分析し、
 * 未カバーのルールを特定します。
 *
 * **主要機能:**
 * 1. buildBusinessRuleCoverage: ビジネスルールカバレッジを構築
 * 2. summarizeBusinessRules: ビジネスルール集計サマリーを生成
 * 3. calculateBusinessRuleStats: カバレッジ統計を計算
 * 4. collectBusinessRuleIds: ビジネスルールIDを収集
 *
 * **カバレッジ評価の仕組み:**
 * - ユースケースのbusinessRulesフィールドを走査
 * - ユースケースのbusinessRequirementCoverage.businessRulesフィールドを走査
 * - 各ビジネスルールが参照されているユースケースを集計
 * - 参照されていないルールを「未カバー」として特定
 *
 * **データ構造:**
 * - BusinessRuleCoverageEntry: 個別ルールのカバレッジ情報
 * - BusinessRuleSummary: 全ルールの集計サマリー
 * - BusinessRuleStats: カバレッジ統計（総数、カバー率）
 *
 * **使用例:**
 * ```typescript
 * const summary = summarizeBusinessRules(businessRules, useCases);
 * console.log(`カバー率: ${(summary.coverage.length - summary.uncoveredRules.length) / summary.coverage.length * 100}%`);
 * summary.uncoveredRules.forEach(entry => {
 *   console.log(`未カバー: ${entry.rule.id} - ${entry.rule.description}`);
 * });
 * ```
 *
 * **拡張ポイント:**
 * - カバレッジ評価のロジックをカスタマイズ
 * - 新しい統計メトリクスを追加
 *
 * @module quality/business-rules
 */

import type * as Business from '../types/business/index.js';
import type { Ref } from '../types/foundation/index.js';
import type * as Functional from '../types/functional/index.js';

// 型エイリアス
type BusinessRule = Business.BusinessRule;
type BusinessRuleRef = Ref<BusinessRule>; // 新型では Ref<T>
type UseCase = Functional.UseCase;

type BusinessRuleUseCase = UseCase;

// ============================================================================
// 型定義（Type Definitions）
// ============================================================================

/**
 * ビジネスルールカバレッジエントリ
 *
 * **用途:**
 * 個別のビジネスルールのカバレッジ情報を表現します。
 *
 * **構成:**
 * - rule: ビジネスルール
 * - coveredByUseCases: このルールをカバーしているユースケース一覧
 * - uncovered: 未カバーかどうか（true: 未カバー、false: カバー済み）
 */
export interface BusinessRuleCoverageEntry<
  Rule extends BusinessRule = BusinessRule,
  U extends BusinessRuleUseCase = BusinessRuleUseCase,
> {
  readonly rule: Rule;
  readonly coveredByUseCases: U[];
  readonly uncovered: boolean;
}

/**
 * ビジネスルール集計サマリー
 *
 * **用途:**
 * 全ビジネスルールのカバレッジ情報を集計したサマリーを表現します。
 *
 * **構成:**
 * - rules: 全ビジネスルール
 * - coverage: 各ルールのカバレッジエントリ
 * - uncoveredRules: 未カバーのルールのみ
 */
export interface BusinessRuleSummary<
  Rule extends BusinessRule = BusinessRule,
  U extends BusinessRuleUseCase = BusinessRuleUseCase,
> {
  readonly rules: readonly Rule[];
  readonly coverage: readonly BusinessRuleCoverageEntry<Rule, U>[];
  readonly uncoveredRules: readonly BusinessRuleCoverageEntry<Rule, U>[];
}

/**
 * ビジネスルール統計
 *
 * **用途:**
 * ビジネスルールのカバレッジ統計を表現します。
 *
 * **構成:**
 * - totalRules: 総ルール数
 * - totalCoveredRules: カバー済みルール数
 * - totalUncoveredRules: 未カバールール数
 * - coverageRatio: カバー率（0.0-1.0）
 */
export interface BusinessRuleStats {
  readonly totalRules: number;
  readonly totalCoveredRules: number;
  readonly totalUncoveredRules: number;
  readonly coverageRatio: number;
}

// ============================================================================
// 公開API（Public API）
// ============================================================================

/**
 * ビジネスルールカバレッジを構築
 *
 * **処理フロー:**
 * 1. 各ビジネスルールに対して以下を実行:
 * 2. ユースケースのbusinessRulesフィールドを走査して参照を探す
 * 3. ユースケースのbusinessRequirementCoverage.businessRulesを走査
 * 4. 参照しているユースケースを集計
 * 5. 参照が0件なら「未カバー」とマーク
 *
 * **使用例:**
 * ```typescript
 * const coverage = buildBusinessRuleCoverage(businessRules, useCases);
 * coverage.forEach(entry => {
 *   if (entry.uncovered) {
 *     console.log(`未カバー: ${entry.rule.id}`);
 *   } else {
 *     console.log(`カバー: ${entry.rule.id} (${entry.coveredByUseCases.length}件)`);
 *   }
 * });
 * ```
 *
 * @param businessRules ビジネスルール一覧
 * @param useCases ユースケース一覧
 * @returns ビジネスルールカバレッジエントリの配列
 */
export function buildBusinessRuleCoverage<Rule extends BusinessRule, U extends BusinessRuleUseCase>(
  businessRules: readonly Rule[],
  useCases: readonly U[]
): BusinessRuleCoverageEntry<Rule, U>[] {
  return businessRules.map(rule => {
    const coveredByUseCases = useCases.filter(
      useCase =>
        hasBusinessRuleReference(useCase.businessRules ?? [], rule) ||
        hasBusinessRuleReference(useCase.businessRequirementCoverage?.businessRules ?? [], rule)
    );

    return {
      rule,
      coveredByUseCases,
      uncovered: coveredByUseCases.length === 0,
    };
  });
}

/**
 * ビジネスルール集計サマリーを生成
 *
 * **処理フロー:**
 * 1. buildBusinessRuleCoverageを呼び出してカバレッジを構築
 * 2. 未カバーのルールをフィルタリング
 * 3. サマリーオブジェクトを構築して返す
 *
 * **使用例:**
 * ```typescript
 * const summary = summarizeBusinessRules(businessRules, useCases);
 * console.log(`総ルール数: ${summary.rules.length}`);
 * console.log(`未カバー数: ${summary.uncoveredRules.length}`);
 * summary.uncoveredRules.forEach(entry => {
 *   console.log(`  - ${entry.rule.id}: ${entry.rule.description}`);
 * });
 * ```
 *
 * @param businessRules ビジネスルール一覧
 * @param useCases ユースケース一覧
 * @returns ビジネスルール集計サマリー
 */
export function summarizeBusinessRules<Rule extends BusinessRule, U extends BusinessRuleUseCase>(
  businessRules: readonly Rule[],
  useCases: readonly U[]
): BusinessRuleSummary<Rule, U> {
  const coverage = buildBusinessRuleCoverage(businessRules, useCases);
  const uncoveredRules = coverage.filter(entry => entry.uncovered);

  return {
    rules: businessRules,
    coverage,
    uncoveredRules,
  };
}

/**
 * ビジネスルールカバレッジ統計を計算
 *
 * **計算内容:**
 * - totalRules: カバレッジエントリの総数
 * - totalCoveredRules: uncovered=falseのエントリ数
 * - totalUncoveredRules: totalRules - totalCoveredRules
 * - coverageRatio: totalCoveredRules / totalRules（0件の場合は1.0）
 *
 * **使用例:**
 * ```typescript
 * const coverage = buildBusinessRuleCoverage(businessRules, useCases);
 * const stats = calculateBusinessRuleStats(coverage);
 * console.log(`カバー率: ${(stats.coverageRatio * 100).toFixed(1)}%`);
 * console.log(`未カバー: ${stats.totalUncoveredRules}件`);
 * ```
 *
 * @param coverage ビジネスルールカバレッジエントリの配列
 * @returns ビジネスルール統計
 */
export function calculateBusinessRuleStats<
  Rule extends BusinessRule,
  U extends BusinessRuleUseCase,
>(coverage: readonly BusinessRuleCoverageEntry<Rule, U>[]): BusinessRuleStats {
  const totalRules = coverage.length;
  const totalCoveredRules = coverage.filter(entry => !entry.uncovered).length;
  const totalUncoveredRules = totalRules - totalCoveredRules;
  const coverageRatio = totalRules === 0 ? 1 : totalCoveredRules / totalRules;

  return {
    totalRules,
    totalCoveredRules,
    totalUncoveredRules,
    coverageRatio,
  };
}

/**
 * ビジネスルールIDを収集
 *
 * **処理内容:**
 * - ruleRefsから各参照のIDを抽出
 * - 文字列型の参照はそのまま使用
 * - Ref型の参照はidフィールドを取得
 * - 空のIDは除外
 *
 * **使用例:**
 * ```typescript
 * const ruleIds = collectBusinessRuleIds(useCase.businessRules);
 * console.log(`参照ルール数: ${ruleIds.length}`);
 * ```
 *
 * @param ruleRefs ビジネスルール参照の配列
 * @returns ビジネスルールIDの配列
 */
export function collectBusinessRuleIds(
  ruleRefs: readonly (BusinessRuleRef | string)[] | undefined
): string[] {
  return (ruleRefs ?? [])
    .map(ref => (typeof ref === 'string' ? ref : ref.id))
    .filter((id): id is string => Boolean(id));
}

// ============================================================================
// 内部ヘルパー関数（Internal Helper Functions）
// ============================================================================

/**
 * ビジネスルール参照を持つかチェック
 *
 * **処理内容:**
 * - refs内に指定されたruleのIDが存在するか確認
 * - 文字列型参照とRef型参照の両方をサポート
 *
 * @param refs ビジネスルール参照の配列
 * @param rule 検索対象のビジネスルール
 * @returns 参照が存在する場合true
 */
function hasBusinessRuleReference(
  refs: readonly (BusinessRuleRef | string)[] | undefined,
  rule: BusinessRule
): boolean {
  return (refs ?? []).some(ref => {
    if (typeof ref === 'string') {
      return ref === rule.id;
    }
    return ref.id === rule.id;
  });
}
