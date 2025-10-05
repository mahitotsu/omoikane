/**
 * 品質評価フレームワーク
 * メタモデルの設計品質を評価し、AI Agent 向けの推奨アクションを生成
 */

// 型定義をエクスポート
export * from './business-rules.ts';
export * from './security-requirements.ts';
export * from './types.ts';

// カバレッジ分析
export { analyzeCoverage } from './coverage-analyzer.ts';

// 品質評価
export { assessQuality } from './assessor.ts';

// 推奨アクション生成
export { generateRecommendations } from './recommendation-engine.ts';

// 便利な統合関数
import type * as Business from '../types/business/index.js';
import type * as Functional from '../types/functional/index.js';

import type { QualityAssessmentResult, Recommendation } from './types.ts';

// 型エイリアス
type Actor = Functional.Actor;
type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;
type UseCase = Functional.UseCase;

import type {
    BusinessRuleStats,
    BusinessRuleSummary,
} from './business-rules.ts';
import type { SecurityPolicyStats, SecurityPolicySummary } from './security-requirements.ts';

import { assessQuality } from './assessor.ts';
import {
    calculateBusinessRuleStats,
    summarizeBusinessRules,
} from './business-rules.ts';
import { generateRecommendations } from './recommendation-engine.ts';
import {
    calculateSecurityPolicyStats,
    summarizeSecurityPolicies,
} from './security-requirements.ts';

/**
 * 品質評価と推奨アクション生成を一括実行
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
