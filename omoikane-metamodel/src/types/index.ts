/**
 * Omoikane Metamodel - Type Definitions
 * 
 * レイヤー構造:
 * - Foundation: 基礎層（プリミティブ、参照、文書基底）
 * - Business: 業務層（業務要件定義）
 * - Functional: 機能層（ユースケース、アクター）
 * - Cross-Cutting: 横断層（トレーサビリティ、バージョニング）
 */

// ===== Foundation Layer =====
export * as Foundation from './foundation/index.js';

export type {
    Approvable, Categorizable, ChangeLogEntry, DateRange, DocumentBase,
    // 文書基底
    Identifiable, Metadata,
    // プリミティブ型
    PriorityLevel, QualityLevel,
    // 参照型
    Ref,
    RefArray, SeverityLevel, TraceableDocument, Versionable
} from './foundation/index.js';

export {
    // 参照ヘルパー
    createRef, extractRefIds, isApprovable, isCategorizable,
    // 文書型判定
    isTraceableDocument, isValidRef, isVersionable
} from './foundation/index.js';

// ===== Business Layer =====
export * as Business from './business/index.js';

export type {
    BusinessRequirementCoverage, BusinessRequirementDefinition, BusinessRequirementItem,
    BusinessRequirementScope, BusinessRule, SecurityPolicy
} from './business/index.js';

// ===== Functional Layer =====
export * as Functional from './functional/index.js';

export type {
    Actor,
    ActorReference, ActorRole, AlternativeFlow, FlowImpact, FlowProbability, UseCase, UseCaseActors, UseCaseComplexity, UseCaseStep
} from './functional/index.js';

export {
    normalizeActorRef,
    normalizeActorRefs
} from './functional/index.js';

// ===== Cross-Cutting Layer =====
export * as CrossCutting from './cross-cutting/index.js';

export {
    RelationType
} from './cross-cutting/index.js';

export type {
    DocumentRelationship, TraceabilityAnalysis, TraceabilityIssue, TraceabilityMatrix,
    TraceabilityValidation
} from './cross-cutting/index.js';

// ===== Legacy Compatibility =====
// 既存コードとの互換性のため、旧型定義もre-exportする
export * from './delivery-elements.js';
