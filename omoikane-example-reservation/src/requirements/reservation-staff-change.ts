/**
 * 来店予約管理システム - 店舗スタッフ予約変更ユースケース
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
const concurrentEditWarningSteps = [
  {
    actor: typedActorRef('store-staff'),
    action: '編集中である旨の警告を確認する',
    expectedResult: '同時編集を避けるため操作は中断される',
  },
] as const;

const visitorOfflineNotificationSteps = [
  {
    actor: typedActorRef('store-staff'),
    action: '電話やメールなど外部手段での連絡計画をメモに記録する',
    expectedResult: '自動通知を送らずフォロー方法が共有される',
  },
] as const;

export const reservationStaffChange: ReservationUseCase = {
  id: 'reservation-staff-change',
  name: '店舗スタッフによる予約変更',
  description:
    '店舗スタッフが予約番号なしで特定した予約内容を編集し、来店者の希望に合わせて調整する',
  actors: {
    primary: typedActorRef('store-staff'),
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [
      businessGoalRef('goal-empower-store-staff'),
      businessGoalRef('goal-auditable-operations'),
    ],
    scopeItems: [businessScopeRef('scope-store-staff-console')],
    stakeholders: [stakeholderRef('stakeholder-store-staff')],
    successMetrics: [successMetricRef('metric-manual-adjustment-time')],
    assumptions: [
      assumptionRef('assumption-manual-communications'),
      assumptionRef('assumption-staff-sign-in-required'),
      assumptionRef('assumption-slot-capacity-single'),
    ],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-staff-change-anytime-unless-checked-in'),
    ],
    businessRules: [
      businessRuleRef('business-rule-change-retain-reference'),
      businessRuleRef('business-rule-manual-notification'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-staff-operation-audit'),
      securityPolicyRef('security-policy-concurrency-control'),
    ],
  }),
  preconditions: [
    '店舗スタッフが予約検索ユースケースなどで対象予約の詳細画面を開いている',
    '予約ステータスが変更可能な状態（来店済み・キャンセル済み以外）である',
  ],
  postconditions: [
    '編集した予約内容がシステムに反映されている',
    '旧枠の予約取消と新枠の予約確定が未確認履歴として記録されている',
    '変更理由と担当者IDが監査ログおよび予約履歴に追記されている',
  ],
  mainFlow: [
    {
      stepId: 'review-details',
      actor: typedActorRef('store-staff'),
      action: '予約詳細画面で現行の日時、サービス内容、担当者割り当てを確認する',
      expectedResult: '変更対象となる項目と制約条件が把握できる',
    },
    {
      stepId: 'edit-fields',
      actor: typedActorRef('store-staff'),
      action: '変更フォームで日時、サービス、担当者、メモなど必要な項目を編集する',
      expectedResult: '入力した内容が即時に形式チェックされる',
    },
    {
      stepId: 'validate-updates',
      actor: typedActorRef('store-staff'),
      action: '変更内容を確認し検証ボタンを押下する',
      expectedResult: '枠重複や担当者アサイン制約などが検証され、問題がなければ確認画面に進む',
    },
    {
      stepId: 'confirm-change',
      actor: typedActorRef('store-staff'),
      action: '変更理由とフォロー計画を入力し更新を確定する',
      expectedResult: '予約内容が更新され履歴に変更記録と枠の予約取消・予約確定情報が追加される',
    },
  ],
  alternativeFlows: [
    {
      id: 'validation-error',
      name: '検証に失敗する',
      condition: '変更内容が制約条件に違反している場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: 'エラー内容（空き枠不足、担当者スケジュール衝突など）を確認し編集内容を見直す',
          expectedResult: '修正すべき項目と理由が提示される',
        },
      ],
      returnToStepId: 'edit-fields',
    },
    {
      id: 'concurrent-edit-detected',
      name: '他スタッフによる編集中',
      condition: '同じ予約が他のスタッフによってロックされている場合',
      steps: [...concurrentEditWarningSteps],
    },
    {
      id: 'visitor-notified-offline',
      name: '来店者への案内を別途実施',
      condition: '変更内容を来店者に伝える必要がある場合',
      steps: [...visitorOfflineNotificationSteps],
      returnToStepId: 'confirm-change',
    },
  ],
  securityPolicies: [
    securityPolicyRef('security-policy-staff-operation-audit'),
    securityPolicyRef('security-policy-concurrency-control'),
  ],
  businessRules: [
    businessRuleRef('business-rule-change-retain-reference'),
    businessRuleRef('business-rule-manual-notification'),
  ],
  priority: 'high',
};
