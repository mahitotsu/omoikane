/**
 * 型安全なアクター・ユースケース参照システム
 * IDE補完とコンパイル時型チェックを提供
 *
 * ⚠️ このファイルは自動生成されます
 * 手動編集は scripts/generate-typed-references.ts で行ってください
 *
 * 最終更新: 2025-10-08T13:55:33.866Z
 */

import type {
  AssumptionRef,
  BusinessGoalRef,
  BusinessRequirementDefinitionRef,
  BusinessRuleRef,
  BusinessScopeRef,
  ConstraintRef,
  SecurityPolicyRef,
  StakeholderRef,
  SuccessMetricRef,
} from './types/business/references.js';
import type { BusinessRequirementCoverage } from './types/business/requirements.js';
import type { Ref } from './types/foundation/reference.js';
import type { Actor } from './types/functional/actor.js';
import type { UseCase } from './types/functional/use-case.js';
import type { ScreenFlow } from './types/ui/screen-flow.js';
import type { Screen } from './types/ui/screen.js';
import type { ValidationRule } from './types/ui/validation-rule.js';

export type KnownBusinessRequirementId = never;

export type KnownBusinessGoalId = never;

export type KnownScopeItemId = never;

export type KnownStakeholderId = never;

export type KnownSuccessMetricId = never;

export type KnownAssumptionId = never;

export type KnownConstraintId = never;

export type KnownSecurityPolicyId = never;

export type KnownBusinessRuleId = never;

export type KnownActorId = never;

export type KnownUseCaseId = never;

export type KnownScreenId = never;

export type KnownValidationRuleId = never;

export type KnownScreenFlowId = never;

export function businessRequirementRef<T extends KnownBusinessRequirementId>(
  id: T
): BusinessRequirementDefinitionRef<T> {
  return { id, type: 'business-requirement-ref' };
}

export function businessGoalRef<T extends KnownBusinessGoalId>(id: T): BusinessGoalRef<T> {
  return { id, type: 'business-goal-ref' };
}

export function businessScopeRef<T extends KnownScopeItemId>(id: T): BusinessScopeRef<T> {
  return { id, type: 'business-scope-ref' };
}

export function stakeholderRef<T extends KnownStakeholderId>(id: T): StakeholderRef<T> {
  return { id, type: 'stakeholder-ref' };
}

export function successMetricRef<T extends KnownSuccessMetricId>(id: T): SuccessMetricRef<T> {
  return { id, type: 'success-metric-ref' };
}

export function assumptionRef<T extends KnownAssumptionId>(id: T): AssumptionRef<T> {
  return { id, type: 'assumption-ref' };
}

export function constraintRef<T extends KnownConstraintId>(id: T): ConstraintRef<T> {
  return { id, type: 'constraint-ref' };
}

export function securityPolicyRef<T extends KnownSecurityPolicyId>(
  id: T
): SecurityPolicyRef<T> {
  return { id, type: 'security-policy-ref' };
}

export function businessRuleRef<T extends KnownBusinessRuleId>(id: T): BusinessRuleRef<T> {
  return { id, type: 'business-rule-ref' };
}

/**
 * アクターへの型安全な参照
 * Ref<Actor>と互換性あり
 */
export type TypedActorRef<T extends KnownActorId = KnownActorId> = Ref<Actor> & {
  readonly id: T;
  readonly type?: 'actor-ref';
};

/**
 * ユースケースへの型安全な参照
 * Ref<UseCase>と互換性あり
 */
export type TypedUseCaseRef<T extends KnownUseCaseId = KnownUseCaseId> = Ref<UseCase> & {
  readonly id: T;
  readonly type?: 'usecase-ref';
};

export function typedActorRef<T extends KnownActorId>(id: T): TypedActorRef<T> {
  return { id, type: 'actor-ref' };
}

export function typedUseCaseRef<T extends KnownUseCaseId>(id: T): TypedUseCaseRef<T> {
  return { id, type: 'usecase-ref' };
}

export function typedScreenRef<T extends KnownScreenId>(id: T): Ref<Screen> {
  return { id };
}

export function typedValidationRuleRef<T extends KnownValidationRuleId>(id: T): Ref<ValidationRule> {
  return { id };
}

export function typedScreenFlowRef<T extends KnownScreenFlowId>(id: T): Ref<ScreenFlow> {
  return { id };
}

export function metamodelBusinessRequirementCoverage(
  coverage: MetamodelBusinessRequirementCoverage
): MetamodelBusinessRequirementCoverage {
  return coverage;
}

/**
 * 拡張アクター参照（resolveメソッド付き）
 */
export interface EnhancedActorRef<T extends KnownActorId = KnownActorId> extends TypedActorRef<T> {
  resolve(): Actor | undefined;
}

export function createActorRef<T extends KnownActorId>(
  id: T,
  actorRegistry?: Map<string, Actor>
): EnhancedActorRef<T> {
  return {
    id,
    type: 'actor-ref',
    resolve(): Actor | undefined {
      return actorRegistry?.get(id);
    },
  };
}

export interface ActorDefinition<T extends KnownActorId> {
  actor: Actor;
  ref: TypedActorRef<T>;
}

export function defineActor<T extends KnownActorId>(
  id: T,
  definition: Omit<Actor, 'id'>
): ActorDefinition<T> {
  const actor: Actor = {
    id,
    ...definition,
  };

  const ref: TypedActorRef<T> = {
    id,
    type: 'actor-ref',
  };

  return { actor, ref };
}

// 型の再エクスポート
export type { Actor, BusinessRequirementCoverage, BusinessRuleRef, SecurityPolicyRef, UseCase };

/**
 * プロジェクト固有の業務要件カバレッジ型
 * （BusinessRequirementCoverageはジェネリック型ではないため、単純なエイリアス）
 */
export type MetamodelBusinessRequirementCoverage = BusinessRequirementCoverage;

/**
 * プロジェクト固有のユースケース型
 * （UseCaseはジェネリック型ではないため、単純な拡張）
 */
export type MetamodelUseCase = UseCase & {
  businessRequirementCoverage?: MetamodelBusinessRequirementCoverage;
};

export const generatedStats = {
  actors: 0,
  useCases: 0,
  screens: 0,
  validationRules: 0,
  screenFlows: 0,
  businessRequirementIds: 0,
  businessGoals: 0,
  scopeItems: 0,
  stakeholders: 0,
  successMetrics: 0,
  assumptions: 0,
  constraints: 0,
  securityPolicies: 0,
  businessRules: 0,
  generatedAt: '2025-10-08T13:55:33.867Z',
  sourceFiles: [],
} as const;
