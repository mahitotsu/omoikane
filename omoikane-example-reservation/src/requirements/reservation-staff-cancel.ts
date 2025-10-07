/**
 * 来店予約管理システム - 店舗スタッフ予約取消ユースケース
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

export const reservationStaffCancel: ReservationUseCase = {
  id: 'reservation-staff-cancel',
  name: '店舗スタッフによる予約取消',
  description: '店舗スタッフが予約番号なしで特定した予約を、業務上の判断や来店者からの依頼に基づいて取消する。取消理由と担当者IDを必須入力とし、監査ログに記録することで、顧客対応の透明性と枠の適切な解放を実現する。',
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
    successMetrics: [
      successMetricRef('metric-manual-adjustment-time'),
      successMetricRef('metric-slot-utilization'),
    ],
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
      businessRuleRef('business-rule-cancel-invalidate-reference'),
      businessRuleRef('business-rule-cancel-reason-category'),
      businessRuleRef('business-rule-no-show-cancel'),
      businessRuleRef('business-rule-record-all-reservation-actions'),
      businessRuleRef('business-rule-manual-notification'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-staff-operation-audit'),
      securityPolicyRef('security-policy-concurrency-control'),
      securityPolicyRef('security-policy-slot-release-verification'),
    ],
  }),
  preconditions: [
    '店舗スタッフが予約検索ユースケースなどで対象予約の詳細画面を開いている',
    '予約ステータスが来店済みやキャンセル済みではない',
  ],
  postconditions: [
    '予約ステータスがキャンセル済みに更新されている',
    '枠解放（予約取消）が未確認履歴として記録されている',
    '取消理由とフォロー内容が監査ログおよび予約履歴に追加されている',
  ],
  mainFlow: [
    {
      stepId: 'review-current',
      actor: typedActorRef('store-staff'),
      action: '予約詳細画面で現行ステータスと来店者情報、特記事項を確認する',
      expectedResult: '取消による影響範囲とフォロー内容が把握できる',
    },
    {
      stepId: 'initiate-cancel',
      actor: typedActorRef('store-staff'),
      action: '取消操作を選択し理由区分と詳細メモ、フォロー方法を入力する',
      expectedResult: '入力内容が形式チェックされ確認ダイアログに進む',
    },
    {
      stepId: 'confirm-cancel',
      actor: typedActorRef('store-staff'),
      action: 'キャンセル内容を最終確認し取消を確定する',
      expectedResult:
        '予約ステータスがキャンセル済みに更新され枠解放（予約取消）の履歴が未確認として追加される',
    },
  ],
  alternativeFlows: [
    {
      id: 'no-show-cancel',
      name: '未チェックインの来店予定',
      condition: '予約開始時刻を過ぎてもチェックインが完了していない場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '来店予定時刻とチェックイン状況を確認し、到着見込みをヒアリングする',
          expectedResult: '来店予定の遅延理由や到着見込みが記録される',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '到着が見込めない場合はノーショーとして予約取消を行い枠を解放する',
          expectedResult: 'キャンセルがノーショー理由で記録され枠が即時に利用可能になる',
        },
      ],
    },
    {
      id: 'concurrent-edit-detected',
      name: '他スタッフによる編集中',
      condition: '同一予約が他のスタッフによって同時に編集されている場合',
      steps: [...concurrentEditWarningSteps],
    },
    {
      id: 'visitor-notified-offline',
      name: '来店者への連絡を手動で実施',
      condition: '取消結果を来店者へ通知する必要がある場合',
      steps: [...visitorOfflineNotificationSteps],
      returnToStepId: 'confirm-cancel',
    },
  ],
  securityPolicies: [
    securityPolicyRef('security-policy-staff-operation-audit'),
    securityPolicyRef('security-policy-concurrency-control'),
    securityPolicyRef('security-policy-slot-release-verification'),
  ],
  businessRules: [
    businessRuleRef('business-rule-cancel-invalidate-reference'),
    businessRuleRef('business-rule-cancel-reason-category'),
    businessRuleRef('business-rule-no-show-cancel'),
    businessRuleRef('business-rule-record-all-reservation-actions'),
    businessRuleRef('business-rule-manual-notification'),
  ],
  priority: 'high',
  complexity: 'medium',
  acceptanceCriteria: [
    '予約検索が正しく動作すること',
    'キャンセル理由が必須で記録されること',
    '無断キャンセルの場合は専用フラグが設定されること',
    '電話で連絡できない場合の代替手段が提供されること',
    'キャンセル操作が監査ログに記録されること',
  ],
  businessValue: '店舗スタッフによる柔軟なキャンセル対応を可能にし、顧客満足度と運営効率を向上',
};
