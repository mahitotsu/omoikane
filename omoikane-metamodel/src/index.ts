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

// ===== レイヤー型定義 =====
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

// ===== Quality Utilities =====
export type {
    AnyUseCase,
    SecurityPolicyCoverageEntry,
    SecurityPolicyStats,
    SecurityPolicySummary
} from './quality/security-requirements.js';

export type {
    BusinessRuleCoverageEntry, BusinessRuleStats, BusinessRuleSummary
} from './quality/business-rules.ts';

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

// ===== Utilities =====

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

// 品質評価
export { assessQuality } from './quality/assessor.js';
export type { QualityAssessmentResult } from './quality/types.js';

