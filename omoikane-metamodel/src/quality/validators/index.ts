/**
 * @fileoverview バリデーター統合エクスポート
 *
 * **目的:**
 * 品質評価のための各種バリデーターを統合してエクスポートします。
 *
 * **提供するバリデーター:**
 * 1. naming-consistency: 命名規約の一貫性評価
 * 2. flow-consistency: ScreenFlowとUseCaseの整合性評価
 *
 * **使用例:**
 * ```typescript
 * import {
 *   assessNamingConsistency,
 *   assessFlowConsistency
 * } from './validators/index.js';
 *
 * const namingResult = assessNamingConsistency(actors, useCases, businessReqs);
 * const flowResult = assessFlowConsistency(useCases, screenFlows, screens);
 * ```
 *
 * @module quality/validators
 */

// ============================================================================
// 命名規約の一貫性
// ============================================================================

export type {
    FileNamingAssessment,
    IdNamingAssessment,
    NamingConsistencyAssessment,
    NamingStyle,
    NamingStyleAnalysis,
    StepIdNamingAssessment,
    TerminologyConsistency
} from './naming-consistency.js';

export {
    assessFileNaming,
    assessIdNaming,
    assessNamingConsistency,
    assessStepIdNaming,
    assessTerminologyConsistency,
    detectNamingStyle,
    toKebabCase
} from './naming-consistency.js';

// ============================================================================
// ScreenFlowとUseCaseの整合性
// ============================================================================

export type {
    ActionConsistency,
    FlowConsistencyAssessment,
    ScreenOrderComparison,
    TransitionCompleteness,
    TransitionTriggerValidity
} from './flow-consistency.js';

export {
    assessActionConsistency,
    assessFlowConsistency,
    assessScreenOrderConsistency,
    assessTransitionCompleteness,
    assessTransitionTriggerValidity
} from './flow-consistency.js';

