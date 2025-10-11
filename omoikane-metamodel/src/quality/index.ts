/**
 * @fileoverview 品質評価フレームワーク（Quality Assessment Framework）
 *
 * **目的:**
 * メタモデルの設計品質を多面的に評価し、AI Agent向けの推奨アクションを生成します。
 *
 * **主要機能:**
 * 1. 品質評価: 完全性、一貫性、妥当性、追跡可能性を評価
 * 2. カバレッジ分析: ビジネスルール、セキュリティポリシーのカバレッジを分析
 * 3. 成熟度評価: CMMI準拠の5段階評価（INITIAL → OPTIMIZED）
 * 4. 推奨アクション生成: 具体的な改善アクションを生成
 * 5. 統合評価: 全評価を統合した包括的な品質レポート
 *
 * **エクスポート:**
 * - 型定義: BusinessRuleSummary, SecurityPolicySummary, QualityAssessmentResult
 * - 関数: assessQuality, analyzeCoverage, generateRecommendations, performFullQualityAssessment
 * - 成熟度評価: maturity/*（別モジュール）
 *
 * **使用例:**
 * ```typescript
 * import { performFullQualityAssessment } from './quality/index.js';
 *
 * const result = performFullQualityAssessment(
 *   businessRequirements,
 *   actors,
 *   useCases
 * );
 *
 * console.log(`品質スコア: ${result.qualityAssessment.overallScore}`);
 * console.log(`ビジネスルールカバー率: ${result.businessRuleStats.coverageRatio * 100}%`);
 * console.log(`推奨アクション: ${result.recommendations.length}件`);
 * ```
 *
 * **拡張ポイント:**
 * - 新しい評価観点を追加
 * - カスタム統計メトリクスを追加
 * - 統合評価ロジックをカスタマイズ
 *
 * @module quality
 */

// ============================================================================
// 型定義エクスポート（Type Exports）
// ============================================================================

export * from './business-rules.ts';
export * from './security-requirements.ts';
export * from './types.ts';

// ============================================================================
// 成熟度評価エクスポート（Maturity Assessment Exports）
// ============================================================================

// 成熟度評価（新機能）
export * from './maturity/index.js';

// ============================================================================
// バリデーターエクスポート（Validators Exports）
// ============================================================================

// 命名規約・整合性バリデーター
export * from './validators/index.js';

// ============================================================================
// 関数エクスポート（Function Exports）
// ============================================================================

// カバレッジ分析
export { analyzeCoverage } from './coverage-analyzer.ts';

// 品質評価
export { assessQuality } from './assessor.ts';

// 推奨アクション生成
export { generateRecommendations } from './recommendation-engine.ts';

// ============================================================================
// 統合評価関数（Integrated Assessment Function）
// ============================================================================

// 便利な統合関数
import type * as Business from '../types/business/index.js';
import type * as Functional from '../types/functional/index.js';

import type { QualityAssessmentResult, Recommendation } from './types.ts';

// 型エイリアス
type Actor = Functional.Actor;
type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;
type UseCase = Functional.UseCase;

import type { BusinessRuleStats, BusinessRuleSummary } from './business-rules.ts';
import type { SecurityPolicyStats, SecurityPolicySummary } from './security-requirements.ts';

import { assessQuality } from './assessor.ts';
import { calculateBusinessRuleStats, summarizeBusinessRules } from './business-rules.ts';
import { generateRecommendations } from './recommendation-engine.ts';
import {
    calculateSecurityPolicyStats,
    summarizeSecurityPolicies,
} from './security-requirements.ts';

/**
 * 品質評価と推奨アクション生成を一括実行
 *
 * **処理フロー:**
 * 1. 品質評価（完全性、一貫性、妥当性、追跡可能性）を実行
 * 2. 推奨アクション生成を実行
 * 3. ビジネスルールカバレッジを集計
 * 4. セキュリティポリシーカバレッジを集計
 * 5. 統合結果を返す
 *
 * **返却値:**
 * - assessment: 品質評価結果
 * - recommendations: 推奨アクション一覧
 * - businessRuleSummary: ビジネスルール集計サマリー
 * - businessRuleStats: ビジネスルールカバレッジ統計
 * - securityPolicySummary: セキュリティポリシー集計サマリー
 * - securityPolicyStats: セキュリティポリシーカバレッジ統計
 *
 * **使用例:**
 * ```typescript
 * const result = performQualityAssessment(
 *   businessRequirements,
 *   actors,
 *   useCases
 * );
 *
 * console.log(`品質スコア: ${result.assessment.overallScore}`);
 * console.log(`問題数: ${result.assessment.issues.length}`);
 * console.log(`推奨アクション: ${result.recommendations.length}件`);
 * console.log(`ビジネスルールカバー率: ${(result.businessRuleStats.coverageRatio * 100).toFixed(1)}%`);
 * console.log(`セキュリティポリシーカバー率: ${(result.securityPolicyStats.coverageRatio * 100).toFixed(1)}%`);
 * ```
 *
 * @param businessRequirements ビジネス要件定義
 * @param actors アクター一覧
 * @param useCases ユースケース一覧
 * @returns 統合品質評価結果
 */
export function performQualityAssessment(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[]
): {
  assessment: QualityAssessmentResult;
  recommendations: Recommendation[];
  businessRuleSummary: BusinessRuleSummary;
  businessRuleStats: BusinessRuleStats;
  securityPolicySummary: SecurityPolicySummary;
  securityPolicyStats: SecurityPolicyStats;
} {
  const assessment = assessQuality(businessRequirements, actors, useCases);
  const recommendations = generateRecommendations(
    assessment,
    businessRequirements,
    actors,
    useCases
  );
  const businessRules = businessRequirements.businessRules ?? [];
  const businessRuleSummary = summarizeBusinessRules(businessRules, useCases);
  const businessRuleStats = calculateBusinessRuleStats(businessRuleSummary.coverage);
  const securityPolicies = businessRequirements.securityPolicies ?? [];
  const securityPolicySummary = summarizeSecurityPolicies(securityPolicies, useCases);
  const securityPolicyStats = calculateSecurityPolicyStats(securityPolicySummary.coverage);

  return {
    assessment,
    recommendations,
    businessRuleSummary,
    businessRuleStats,
    securityPolicySummary,
    securityPolicyStats,
  };
}
