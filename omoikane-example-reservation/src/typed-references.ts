/**
 * 型安全なアクター・ユースケース参照システム
 * IDE補完とコンパイル時型チェックを提供
 *
 * ⚠️ このファイルは自動生成されます
 * 手動編集は scripts/generate-typed-references.ts で行ってください
 *
 * 最終更新: 2025-10-05T00:00:00.000Z
 */

import type {
  Actor,
  AssumptionRef,
  BusinessGoalRef,
  BusinessRequirementCoverage,
  BusinessRequirementDefinitionRef,
  BusinessRuleRef,
  BusinessScopeRef,
  ConstraintRef,
  SecurityPolicyRef,
  StakeholderRef,
  SuccessMetricRef,
  UseCase,
} from 'omoikane-metamodel';

export type KnownBusinessRequirementId = 'reservation-business-requirements';

export type KnownBusinessGoalId = 'goal-accurate-capacity'
  | 'goal-admin-managed-accounts'
  | 'goal-auditable-operations'
  | 'goal-empower-store-staff'
  | 'goal-self-service-booking'
  | 'goal-visitor-self-service-flexibility';

export type KnownScopeItemId = 'scope-account-administration'
  | 'scope-business-day-configuration'
  | 'scope-capacity-planning'
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

export type KnownSuccessMetricId = 'metric-admin-access-readiness'
  | 'metric-audit-confirmation-lag'
  | 'metric-booking-completion-rate'
  | 'metric-manual-adjustment-time'
  | 'metric-slot-utilization';

export type KnownAssumptionId = 'assumption-manual-communications'
  | 'assumption-holiday-manual-registration'
  | 'assumption-single-location'
  | 'assumption-slot-capacity-single'
  | 'assumption-slot-interval-1-hour'
  | 'assumption-staff-sign-in-required'
  | 'assumption-standard-business-hours';

export type KnownConstraintId = 'constraint-late-arrival-grace-period'
  | 'constraint-log-retention'
  | 'constraint-no-double-booking'
  | 'constraint-operation-hours-visitor'
  | 'constraint-privacy-minimization'
  | 'constraint-staff-change-anytime-unless-checked-in'
  | 'constraint-visitor-own-reservation-only';

export type KnownSecurityPolicyId = 'security-policy-account-admin-audit'
  | 'security-policy-concurrency-control'
  | 'security-policy-history-access-control'
  | 'security-policy-history-audit-log'
  | 'security-policy-least-privilege'
  | 'security-policy-self-service-audit-log'
  | 'security-policy-self-service-contact-verification'
  | 'security-policy-slot-release-verification'
  | 'security-policy-staff-operation-audit'
  | 'security-policy-staff-search-audit'
  | 'security-policy-staff-visibility-governance';

export type KnownBusinessRuleId = 'business-rule-account-deletion-approval'
  | 'business-rule-cancel-invalidate-reference'
  | 'business-rule-cancel-reason-category'
  | 'business-rule-change-retain-reference'
  | 'business-rule-history-auto-generated'
  | 'business-rule-history-note-sharing'
  | 'business-rule-history-review-governance'
  | 'business-rule-history-review-status'
  | 'business-rule-history-review-toggle'
  | 'business-rule-manual-notification'
  | 'business-rule-no-show-cancel'
  | 'business-rule-record-all-reservation-actions'
  | 'business-rule-reservation-number-display-once'
  | 'business-rule-role-segregation'
  | 'business-rule-search-empty-initial'
  | 'business-rule-search-multi-criteria'
  | 'business-rule-search-sort-ascending'
  | 'business-rule-visitor-cutoff'
  | 'business-rule-visitor-single-reservation';

export type KnownActorId = 'system-admin'
  | 'capacity-planner'
  | 'store-staff'
  | 'visitor';

export type KnownUseCaseId = 'reservation-history-review'
  | 'reservation-staff-cancel'
  | 'reservation-staff-change'
  | 'reservation-staff-search'
  | 'user-account-deletion'
  | 'user-account-registration'
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

export function securityPolicyRef<T extends KnownSecurityPolicyId>(
  id: T
): SecurityPolicyRef<T> {
  return { id, type: 'security-policy-ref' };
}

export function businessRuleRef<T extends KnownBusinessRuleId>(id: T): BusinessRuleRef<T> {
  return { id, type: 'business-rule-ref' };
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

export type {
  Actor,
  BusinessRequirementCoverage,
  BusinessRuleRef,
  SecurityPolicyRef,
  UseCase
} from 'omoikane-metamodel';

export type ReservationBusinessRequirementCoverage = BusinessRequirementCoverage<
  KnownBusinessRequirementId,
  KnownBusinessGoalId,
  KnownScopeItemId,
  KnownStakeholderId,
  KnownSuccessMetricId,
  KnownAssumptionId,
  KnownConstraintId,
  KnownSecurityPolicyId,
  KnownBusinessRuleId
>;

export type ReservationUseCase = UseCase<
  KnownBusinessRequirementId,
  KnownBusinessGoalId,
  KnownScopeItemId,
  KnownStakeholderId,
  KnownSuccessMetricId,
  KnownAssumptionId,
  KnownConstraintId,
  KnownSecurityPolicyId,
  KnownBusinessRuleId
> & {
  businessRequirementCoverage: ReservationBusinessRequirementCoverage;
};

export const generatedStats = {
  actors: 4,
  useCases: 11,
  businessRequirementIds: 1,
  businessGoals: 6,
  scopeItems: 7,
  stakeholders: 5,
  successMetrics: 5,
  assumptions: 6,
  constraints: 7,
  securityPolicies: 12,
  businessRules: 27,
  generatedAt: '2025-10-04T17:59:26.607Z',
  sourceFiles: ['/home/akring/omoikane/omoikane-example-reservation/src/requirements/account-administration.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/business-requirements.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/capacity-management.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-booking.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-cancel.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-check-in.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-history-review.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-cancel.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-change.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-search.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-update.ts'],
} as const;
