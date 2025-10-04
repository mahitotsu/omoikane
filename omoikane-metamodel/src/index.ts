/**
 * Omoikane Metamodel - ITDelivery Framework
 *
 * TypeScriptによるユースケース・要件定義のためのメタモデル
 */

// 基本型定義をエクスポート
export type {
  Actor,
  ActorRef,
  AlternativeFlow,
  AssumptionRef,
  BusinessGoalRef,
  BusinessRequirementCoverage,
  BusinessRequirementDefinition,
  BusinessRequirementDefinitionRef,
  BusinessRequirementItem,
  BusinessRequirementScope,
  BusinessScopeRef,
  ConstraintRef,
  DeliveryElement,
  SecurityPolicy,
  SecurityPolicyRef,
  StakeholderRef,
  SuccessMetricRef,
  UseCase,
  UseCaseRef,
  UseCaseStep,
} from './types/delivery-elements.js';

export type {
  AnyUseCase,
  SecurityPolicyCoverageEntry,
  SecurityPolicyStats,
  SecurityPolicySummary,
} from './quality/security-requirements.js';

// ヘルパー関数をエクスポート
export {
  actorRef,
  assumptionRef,
  businessGoalRef,
  businessRequirementRef,
  businessScopeRef,
  constraintRef,
  securityPolicyRef,
  stakeholderRef,
  successMetricRef,
  useCaseRef,
} from './types/delivery-elements.js';

export {
  buildSecurityPolicyCoverage,
  calculateSecurityPolicyStats,
  collectSecurityPolicyIds,
  summarizeSecurityPolicies,
} from './quality/security-requirements.js';

// stepNumber自動管理ユーティリティ
export {
  enrichStepsWithNumbers,
  findStepByIdOrNumber,
  improvedOrderProcessing,
} from './types/step-number-solution.js';

// 関係性分析
export type {
  ActorUseCaseRelationship,
  RelationshipAnalysis,
} from './types/relationship-analyzer.js';

export { RelationshipAnalyzer } from './types/relationship-analyzer.js';
