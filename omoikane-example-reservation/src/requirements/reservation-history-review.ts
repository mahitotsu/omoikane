/**
 * 来店予約管理システム - 予約履歴確認ユースケース
 */

import {
    ReservationUseCase,
    assumptionRef,
    businessGoalRef,
    businessRequirementRef,
    businessRuleRef,
    businessScopeRef,
    constraintRef,
    reservationBusinessRequirementCoverage,
    securityPolicyRef,
    stakeholderRef,
    successMetricRef,
    typedActorRef,
} from '../typed-references.js';

export const reservationHistoryReview: ReservationUseCase = {
  id: 'reservation-history-review',
  type: 'usecase',
  owner: 'store-operations',
  name: '予約履歴確認',
  description: '店舗スタッフが予約状況と予約確定・取消履歴を確認し既読状態を更新する',
  actors: {
    primary: typedActorRef('store-staff'),
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [
      businessGoalRef('goal-auditable-operations'),
      businessGoalRef('goal-empower-store-staff'),
    ],
    scopeItems: [businessScopeRef('scope-history-oversight')],
    stakeholders: [
      stakeholderRef('stakeholder-store-staff'),
      stakeholderRef('stakeholder-store-ops-manager'),
    ],
    successMetrics: [successMetricRef('metric-audit-confirmation-lag')],
    assumptions: [assumptionRef('assumption-staff-sign-in-required')],
    constraints: [constraintRef('constraint-log-retention')],
    businessRules: [
      businessRuleRef('business-rule-history-auto-generated'),
      businessRuleRef('business-rule-history-review-toggle'),
      businessRuleRef('business-rule-history-note-sharing'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-history-access-control'),
      securityPolicyRef('security-policy-history-audit-log'),
    ],
  }),
  preconditions: [
    '店舗スタッフが予約照会画面へアクセスできる権限を持っている',
    '予約確定・取消履歴に未確認または既読対象の記録が存在する',
  ],
  postconditions: [
    '確認対象の履歴が既読状態に更新される',
    '店舗スタッフが最新の予約新規・変更・取消の発生を把握できる',
  ],
  mainFlow: [
    {
      stepId: 'open-history',
      actor: typedActorRef('store-staff'),
      action: '予約照会画面で確定・取消履歴タブを開き未確認の記録を一覧表示する',
      expectedResult: '未確認の履歴が作成日時順に表示される',
    },
    {
      stepId: 'inspect-entry',
      actor: typedActorRef('store-staff'),
      action: '各履歴の詳細を確認し関連する予約内容や担当者への共有が必要か判断する',
      expectedResult: '履歴から予約の変更点や取り消しの影響が把握できる',
    },
    {
      stepId: 'mark-reviewed',
      actor: typedActorRef('store-staff'),
      action: '内容を確認した履歴に既読状態を設定し、必要に応じてメモを追加する',
      expectedResult: '履歴の確認状態が更新され、対応メモが残る',
    },
    {
      stepId: 'verify-remaining-items',
      actor: typedActorRef('store-staff'),
      action: '既読済み履歴を除外して残件を確認する',
      expectedResult: '未確認の履歴がなくなり、対応が完了したことが把握できる',
    },
  ],
  alternativeFlows: [
    {
      id: 'no-unreviewed-entries',
      name: '未確認履歴が存在しない',
      condition: 'すべての履歴が既読済みの場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '履歴一覧で未確認の記録がないことを確認し画面を閉じる',
          expectedResult: '追加対応が不要であると判断できる',
        },
      ],
      returnToStepId: 'open-history',
    },
    {
      id: 'entry-updated-during-review',
      name: '確認中に履歴が更新された',
      condition: '確認作業中に新たな履歴が追加される場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '最新の履歴を再読み込みし、未確認項目を再度一覧表示する',
          expectedResult: '新しい履歴が未確認として表示され、確認対象に含まれる',
        },
      ],
      returnToStepId: 'open-history',
    },
  ],
  securityPolicies: [
    securityPolicyRef('security-policy-history-access-control'),
    securityPolicyRef('security-policy-history-audit-log'),
  ],
  businessRules: [
    businessRuleRef('business-rule-history-auto-generated'),
    businessRuleRef('business-rule-history-review-toggle'),
    businessRuleRef('business-rule-history-note-sharing'),
  ],
  priority: 'medium',
};
