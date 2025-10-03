/**
 * 型安全なアクター・ユースケース参照システム
 * IDE補完とコンパイル時型チェックを提供
 *
 * ⚠️ このファイルは自動生成されます
 * 手動編集は scripts/generate-typed-references.ts で行ってください
 *
 * 最終更新: 2025-10-03T17:36:18.440Z
 */

import type {
  Actor,
  AssumptionRef,
  BusinessGoalRef,
  BusinessRequirementCoverage,
  BusinessRequirementDefinitionRef,
  BusinessScopeRef,
  ConstraintRef,
  StakeholderRef,
  SuccessMetricRef,
  UseCase,
} from 'omoikane-metamodel';

export type KnownBusinessRequirementId = 'reservation-business-requirements';

export type KnownBusinessGoalId = 'goal-accurate-capacity'
  | 'goal-auditable-operations'
  | 'goal-empower-store-staff'
  | 'goal-flexible-adjustments'
  | 'goal-self-service-booking';

export type KnownScopeItemId = 'scope-capacity-planning'
  | 'scope-history-oversight'
  | 'scope-online-booking'
  | 'scope-store-staff-console'
  | 'scope-visit-check-in'
  | 'scope-visitor-self-service-management';

export type KnownStakeholderId = 'stakeholder-capacity-planner'
  | 'stakeholder-store-ops-manager'
  | 'stakeholder-store-staff'
  | 'stakeholder-system-admin'
  | 'stakeholder-visitor';

export type KnownSuccessMetricId = 'metric-audit-confirmation-lag'
  | 'metric-booking-completion-rate'
  | 'metric-manual-adjustment-time'
  | 'metric-slot-utilization';

export type KnownAssumptionId = 'assumption-manual-communications'
  | 'assumption-single-location'
  | 'assumption-staff-sign-in-required'
  | 'assumption-user-accounts-with-roles';

export type KnownConstraintId = 'constraint-log-retention'
  | 'constraint-operation-hours'
  | 'constraint-privacy-minimization';

export type KnownActorId = 'capacity-planner'
  | 'store-staff'
  | 'visitor';

export type KnownUseCaseId = 'reservation-history-review'
  | 'reservation-staff-cancel'
  | 'reservation-staff-change'
  | 'reservation-staff-search'
  | 'reservation-check-in'
  | 'capacity-management'
  | 'reservation-booking'
  | 'reservation-cancel'
  | 'reservation-update';

export function businessRequirementRef<T extends KnownBusinessRequirementId>(
  requirementId: T
): BusinessRequirementDefinitionRef<T> {
  return { requirementId, type: 'business-requirement-ref' };
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

export interface TypedActorRef<T extends KnownActorId = KnownActorId> {
  readonly actorId: T;
  readonly type: 'actor-ref';
}

export interface TypedUseCaseRef<T extends KnownUseCaseId = KnownUseCaseId> {
  readonly useCaseId: T;
  readonly type: 'usecase-ref';
}

export function typedActorRef<T extends KnownActorId>(actorId: T): TypedActorRef<T> {
  return { actorId, type: 'actor-ref' };
}

export function typedUseCaseRef<T extends KnownUseCaseId>(useCaseId: T): TypedUseCaseRef<T> {
  return { useCaseId, type: 'usecase-ref' };
}

export function reservationBusinessRequirementCoverage(
  coverage: ReservationBusinessRequirementCoverage
): ReservationBusinessRequirementCoverage {
  return coverage;
}

export interface EnhancedActorRef<T extends KnownActorId = KnownActorId> extends TypedActorRef<T> {
  resolve(): Actor | undefined;
}

export function createActorRef<T extends KnownActorId>(
  actorId: T,
  actorRegistry?: Map<string, Actor>
): EnhancedActorRef<T> {
  return {
    actorId,
    type: 'actor-ref',
    resolve(): Actor | undefined {
      return actorRegistry?.get(actorId);
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
    actorId: id,
    type: 'actor-ref',
  };

  return { actor, ref };
}

export type { Actor, BusinessRequirementCoverage, UseCase } from 'omoikane-metamodel';

export type ReservationBusinessRequirementCoverage = BusinessRequirementCoverage<
  KnownBusinessRequirementId,
  KnownBusinessGoalId,
  KnownScopeItemId,
  KnownStakeholderId,
  KnownSuccessMetricId,
  KnownAssumptionId,
  KnownConstraintId
>;

export type ReservationUseCase = UseCase<
  KnownBusinessRequirementId,
  KnownBusinessGoalId,
  KnownScopeItemId,
  KnownStakeholderId,
  KnownSuccessMetricId,
  KnownAssumptionId,
  KnownConstraintId
> & {
  businessRequirementCoverage: ReservationBusinessRequirementCoverage;
};

export const generatedStats = {
  actors: 3,
  useCases: 9,
  businessRequirementIds: 1,
  businessGoals: 5,
  scopeItems: 6,
  stakeholders: 5,
  successMetrics: 4,
  assumptions: 4,
  constraints: 3,
  generatedAt: '2025-10-03T17:36:18.440Z',
  sourceFiles: ['/home/akring/omoikane/omoikane-example-reservation/src/requirements/business-requirements.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/capacity-management.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-booking.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-cancel.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-check-in.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-history-review.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-cancel.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-change.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-search.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-update.ts'],
} as const;
