/**
 * 品質評価フレームワーク
 * メタモデルの設計品質を評価し、AI Agent 向けの推奨アクションを生成
 */

// 型定義をエクスポート
export * from './security-requirements.ts';
export * from './types.ts';

// カバレッジ分析
export { analyzeCoverage } from './coverage-analyzer.ts';

// 品質評価
export { assessQuality } from './assessor.ts';

// 推奨アクション生成
export { generateRecommendations } from './recommendation-engine.ts';

// 便利な統合関数
import type { Actor, BusinessRequirementDefinition, UseCase } from '../types/delivery-elements.js';

import type { QualityAssessmentResult, Recommendation } from './types.ts';

import type { SecurityPolicyStats, SecurityPolicySummary } from './security-requirements.ts';

import { assessQuality } from './assessor.ts';
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
  const securityPolicies = businessRequirements.securityPolicies ?? [];
  const securityPolicySummary = summarizeSecurityPolicies(securityPolicies, useCases);
  const securityPolicyStats = calculateSecurityPolicyStats(securityPolicySummary.coverage);

  return {
    assessment,
    recommendations,
    securityPolicySummary,
    securityPolicyStats,
  };
}
