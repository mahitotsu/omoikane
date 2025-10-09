/**
 * 型安全なアクター・ユースケース参照システム
 * IDE補完とコンパイル時型チェックを提供
 *
 * ⚠️ このファイルは自動生成されます
 * 手動編集は scripts/generate-typed-references.ts で行ってください
 *
 * 最終更新: 2025-10-09T14:19:24.182Z
 */

import type {
  Actor,
  AssumptionRef,
  BusinessGoalRef,
  BusinessRequirementCoverage,
  BusinessRequirementDefinitionRef,
  BusinessScopeRef,
  ConstraintRef,
  BusinessRuleRef,
  SecurityPolicyRef,
  StakeholderRef,
  SuccessMetricRef,
  UseCase,
  Screen,
  ValidationRule,
  ScreenFlow,
  Ref,
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

export type KnownAssumptionId = 'assumption-holiday-manual-registration'
  | 'assumption-manual-communications'
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

export type KnownActorId = 'capacity-planner'
  | 'store-staff'
  | 'system-admin'
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

export type KnownScreenId = 'reservation-cancel-complete-screen'
  | 'reservation-update-complete-screen'
  | 'account-operation-complete-screen'
  | 'reservation-cancel-confirm-screen'
  | 'reservation-update-confirm-screen'
  | 'account-registration-form-screen'
  | 'account-deletion-confirm-screen'
  | 'reservation-update-form-screen'
  | 'staff-reservation-list-screen'
  | 'capacity-slot-confirm-screen'
  | 'reservation-complete-screen'
  | 'staff-cancel-confirm-screen'
  | 'staff-change-confirm-screen'
  | 'reservation-confirm-screen'
  | 'capacity-slot-form-screen'
  | 'reservation-detail-screen'
  | 'reservation-lookup-screen'
  | 'capacity-calendar-screen'
  | 'check-in-complete-screen'
  | 'check-in-console-screen'
  | 'reservation-form-screen'
  | 'history-detail-screen'
  | 'account-list-screen'
  | 'history-list-screen'
  | 'staff-search-screen';

export type KnownValidationRuleId = 'validation-booking-window'
  | 'validation-business-hours'
  | 'validation-cancellation-deadline'
  | 'validation-email-format'
  | 'validation-future-date'
  | 'validation-name-min-length'
  | 'validation-no-duplicate-reservation'
  | 'validation-party-size-range'
  | 'validation-phone-format'
  | 'validation-required-field'
  | 'validation-reservation-number-format'
  | 'validation-slot-availability';

export type KnownScreenFlowId = 'account-registration-flow'
  | 'capacity-management-flow'
  | 'reservation-booking-flow'
  | 'reservation-cancel-flow'
  | 'reservation-update-flow'
  | 'account-deletion-flow'
  | 'history-review-flow'
  | 'staff-cancel-flow'
  | 'staff-change-flow'
  | 'staff-search-flow'
  | 'check-in-flow';

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
export function typedActorRef<T extends KnownActorId>(id: T): Ref<Actor> & { id: T } {
  return { id };
}

/**
 * ユースケースへの型安全な参照
 * Ref<UseCase>と互換性あり
 */
export function typedUseCaseRef<T extends KnownUseCaseId>(id: T): Ref<UseCase> & { id: T } {
  return { id };
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

export function reservationBusinessRequirementCoverage(
  coverage: ReservationBusinessRequirementCoverage
): ReservationBusinessRequirementCoverage {
  return coverage;
}

export type {
  Actor,
  BusinessRequirementCoverage,
  BusinessRuleRef,
  SecurityPolicyRef,
  UseCase,
} from 'omoikane-metamodel';

export type ReservationBusinessRequirementCoverage = BusinessRequirementCoverage;

export type ReservationUseCase = UseCase & {
  businessRequirementCoverage?: ReservationBusinessRequirementCoverage;
};

export const generatedStats = {
  actors: 4,
  useCases: 11,
  screens: 25,
  validationRules: 12,
  screenFlows: 11,
  businessRequirementIds: 1,
  businessGoals: 6,
  scopeItems: 8,
  stakeholders: 5,
  successMetrics: 5,
  assumptions: 7,
  constraints: 7,
  securityPolicies: 11,
  businessRules: 19,
  generatedAt: '2025-10-09T14:19:24.183Z',
  sourceFiles: ['/home/akring/omoikane/omoikane-example-reservation/src/actors.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/account-administration.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/business-requirements.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/capacity-management.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-booking.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-cancel.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-check-in.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-history-review.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-cancel.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-change.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-staff-search.ts', '/home/akring/omoikane/omoikane-example-reservation/src/requirements/reservation-update.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/account-deletion-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/account-registration-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/capacity-management-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/check-in-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/history-review-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/reservation-booking-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/reservation-cancel-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/reservation-update-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/staff-cancel-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/staff-change-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screen-flows/staff-search-flow.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/account-deletion-confirm-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/account-list-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/account-operation-complete-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/account-registration-form-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/capacity-calendar-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/capacity-slot-confirm-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/capacity-slot-form-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/check-in-complete-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/check-in-console-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/history-detail-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/history-list-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-cancel-complete-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-cancel-confirm-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-complete-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-confirm-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-detail-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-form-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-lookup-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-update-complete-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-update-confirm-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/reservation-update-form-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/staff-cancel-confirm-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/staff-change-confirm-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/staff-reservation-list-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/screens/staff-search-screen.ts', '/home/akring/omoikane/omoikane-example-reservation/src/ui/validation-rules.ts'],
} as const;
