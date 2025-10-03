/**
 * 品質評価フレームワーク
 * メタモデルの設計品質を評価し、AI Agent 向けの推奨アクションを生成
 */

// 型定義をエクスポート
export * from './types.js';

// カバレッジ分析
export { analyzeCoverage } from './coverage-analyzer.js';

// 品質評価
export { assessQuality } from './assessor.js';

// 推奨アクション生成
export { generateRecommendations } from './recommendation-engine.js';

// 便利な統合関数
import type {
    Actor,
    BusinessRequirementDefinition,
    UseCase,
} from '../types/delivery-elements.js';

import type {
    QualityAssessmentResult,
    Recommendation,
} from './types.js';

import { assessQuality } from './assessor.js';
import { generateRecommendations } from './recommendation-engine.js';

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
} {
  const assessment = assessQuality(businessRequirements, actors, useCases);
  const recommendations = generateRecommendations(assessment, businessRequirements, actors, useCases);

  return {
    assessment,
    recommendations,
  };
}