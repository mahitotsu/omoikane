/**
 * Omoikane Metamodel - ITDelivery Framework
 *
 * TypeScriptによるユースケース・要件定義のためのメタモデル
 * 
 * 【レイヤー構造】
 * - Foundation: 基礎層（プリミティブ、参照、文書基底）
 * - Business: 業務層（業務要件定義）
 * - Functional: 機能層（ユースケース、アクター）
 * - Cross-Cutting: 横断層（トレーサビリティ、バージョニング）
 */

// ===== 新しいレイヤー型定義 =====
export * as Business from './types/business/index.js';
export * as CrossCutting from './types/cross-cutting/index.js';
export * as Foundation from './types/foundation/index.js';
export * as Functional from './types/functional/index.js';

// Foundationレイヤーから主要な型をre-export（便利のため）
export type {
    Approvable, Categorizable, ChangeLogEntry, DateRange, DocumentBase, Identifiable, Metadata, PriorityLevel, QualityLevel, Ref,
    RefArray, SeverityLevel, TraceableDocument, Versionable
} from './types/foundation/index.js';

export {
    createRef, extractRefIds, isApprovable, isCategorizable, isTraceableDocument, isValidRef, isVersionable
} from './types/foundation/index.js';

// ===== 既存の型定義（後方互換性のため） =====
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
    BusinessRequirementScope, BusinessRule,
    BusinessRuleRef, BusinessScopeRef,
    ConstraintRef,
    DeliveryElement,
    SecurityPolicy,
    SecurityPolicyRef, StakeholderRef,
    SuccessMetricRef,
    UseCase,
    UseCaseRef,
    UseCaseStep
} from './types/delivery-elements.js';

export type {
    AnyUseCase,
    SecurityPolicyCoverageEntry,
    SecurityPolicyStats,
    SecurityPolicySummary
} from './quality/security-requirements.js';

export type {
    BusinessRuleCoverageEntry, BusinessRuleStats, BusinessRuleSummary
} from './quality/business-rules.ts';

// ヘルパー関数をエクスポート
export {
    actorRef,
    assumptionRef,
    businessGoalRef,
    businessRequirementRef, businessRuleRef, businessScopeRef,
    constraintRef, securityPolicyRef,
    stakeholderRef,
    successMetricRef,
    useCaseRef
} from './types/delivery-elements.js';

export {
    buildBusinessRuleCoverage,
    calculateBusinessRuleStats,
    collectBusinessRuleIds,
    summarizeBusinessRules
} from './quality/business-rules.ts';

export {
    buildSecurityPolicyCoverage,
    calculateSecurityPolicyStats,
    collectSecurityPolicyIds,
    summarizeSecurityPolicies
} from './quality/security-requirements.js';

// stepNumber自動管理ユーティリティ
export {
    enrichStepsWithNumbers,
    findStepByIdOrNumber,
    improvedOrderProcessing
} from './types/step-number-solution.js';

// 関係性分析
export type {
    ActorUseCaseRelationship,
    RelationshipAnalysis
} from './types/relationship-analyzer.js';

export { RelationshipAnalyzer } from './types/relationship-analyzer.js';
