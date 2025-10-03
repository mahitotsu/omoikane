/**
 * 来店予約管理システム - 店舗スタッフ予約取消ユースケース
 */

import {
    ReservationUseCase,
    assumptionRef,
    businessGoalRef,
    businessRequirementRef,
    businessScopeRef,
    constraintRef,
    reservationBusinessRequirementCoverage,
    stakeholderRef,
    successMetricRef,
    typedActorRef,
} from '../typed-references.js';

export const reservationStaffCancel: ReservationUseCase = {
  id: 'reservation-staff-cancel',
  type: 'usecase',
  owner: 'store-operations',
  name: '店舗スタッフによる予約取消',
  description: '店舗スタッフが予約番号なしで特定した予約を、業務判断に基づいて取消する',
  actors: {
    primary: typedActorRef('store-staff'),
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [
      businessGoalRef('goal-empower-store-staff'),
      businessGoalRef('goal-flexible-adjustments'),
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
      assumptionRef('assumption-user-accounts-with-roles'),
    ],
    constraints: [constraintRef('constraint-privacy-minimization')],
  }),
  preconditions: [
    '店舗スタッフが予約検索ユースケースなどで対象予約の詳細画面を開いている',
    '予約ステータスが来店済みやキャンセル済みではない',
  ],
  postconditions: [
    '予約ステータスがキャンセル済みに更新されている',
    '枠リリースが未確認履歴として記録されている',
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
        '予約ステータスがキャンセル済みに更新され枠リリース履歴が未確認として追加される',
    },
  ],
  alternativeFlows: [
    {
      id: 'already-completed',
      name: '来店済み予約の取消要求',
      condition: '予約が既に来店済みとして扱われている場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '取消不可メッセージを確認し返金やアフターケアのフォロー計画を記録する',
          expectedResult: '来店済み予約に対する対応方針が履歴に残る',
        },
      ],
      returnToStepId: 'review-current',
    },
    {
      id: 'concurrent-edit-detected',
      name: '他スタッフによる編集中',
      condition: '同一予約が他のスタッフによって同時に編集されている場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '編集中の旨と担当者情報を確認し、連絡または待機を判断する',
          expectedResult: '操作競合が回避される',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '緊急対応が必要な場合は追加認証を経て編集権限を取得し理由を記録する',
          expectedResult: '強制取得の履歴が監査用に保存される',
        },
      ],
      returnToStepId: 'initiate-cancel',
    },
    {
      id: 'visitor-notified-offline',
      name: '来店者への連絡を手動で実施',
      condition: '取消結果を来店者へ通知する必要がある場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '電話やメールなど外部手段での連絡計画をメモに記録する',
          expectedResult: '自動通知を行わずフォロー方法が共有される',
        },
      ],
      returnToStepId: 'confirm-cancel',
    },
  ],
  securityRequirements: [
    '予約取消は担当者IDと理由入力を必須とし監査ログに記録する',
    '取消操作は権限レベルに応じて制限し責任者レビュー対象とする',
    '取消後の空き枠情報は他システムと同期する前に確認済みフラグを付ける',
  ],
  businessRules: [
    'キャンセル完了後は予約番号を無効化し再利用不可とする',
    'キャンセル理由は定義済みカテゴリーから選択し自由記述欄で補足する',
    '枠リリース履歴は履歴確認ユースケースで確認済みに更新する',
    '来店者への通知は自動で送付せず手動連絡手順に従う',
  ],
  priority: 'high',
};
