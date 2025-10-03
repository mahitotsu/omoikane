/**
 * 来店予約管理システム - 店舗スタッフ予約変更ユースケース
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

export const reservationStaffChange: ReservationUseCase = {
  id: 'reservation-staff-change',
  type: 'usecase',
  owner: 'store-operations',
  name: '店舗スタッフによる予約変更',
  description: '店舗スタッフが予約番号なしで特定した予約内容を編集し、来店者の希望に合わせて調整する',
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
    successMetrics: [successMetricRef('metric-manual-adjustment-time')],
    assumptions: [
      assumptionRef('assumption-manual-communications'),
      assumptionRef('assumption-staff-sign-in-required'),
    ],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-staff-change-anytime-unless-checked-in'),
    ],
  }),
  preconditions: [
    '店舗スタッフが予約検索ユースケースなどで対象予約の詳細画面を開いている',
    '予約ステータスが変更可能な状態（来店済み・キャンセル済み以外）である',
  ],
  postconditions: [
    '編集した予約内容がシステムに反映されている',
    '旧枠のリリースと新枠のロックが未確認履歴として記録されている',
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
      expectedResult: '予約内容が更新され履歴に変更記録とロック・リリース情報が追加される',
    },
  ],
  alternativeFlows: [
    {
      id: 'already-checked-in',
      name: '来店済み予約の変更要求',
      condition: '予約が既に来店済みとして処理されている場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '変更不可のメッセージを確認し代替案（取消や再予約の案内）を検討する',
          expectedResult: 'ポリシーに従い変更不可であることが明確になり別手段が提示される',
        },
      ],
      returnToStepId: 'review-details',
    },
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
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '編集中である旨の警告と担当スタッフ情報を確認し、連絡または待機を決定する',
          expectedResult: '変更操作の同時実行による競合を回避できる',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '緊急時には追加認証を経て編集権限を奪取し理由を記録する',
          expectedResult: '強制取得の履歴が監査用に保存され、ロック状態が更新される',
        },
      ],
      returnToStepId: 'edit-fields',
    },
    {
      id: 'visitor-notified-offline',
      name: '来店者への案内を別途実施',
      condition: '変更内容を来店者に伝える必要がある場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '外部手段（電話・メールなど）で連絡する計画をメモに記録する',
          expectedResult: '自動通知を送らずフォロー方法が共有される',
        },
      ],
      returnToStepId: 'confirm-change',
    },
  ],
  securityRequirements: [
    '予約内容変更時には担当者IDと理由の入力を必須とし監査ログに記録する',
    '変更前後の内容差分を履歴に保持し責任者がレビューできるようにする',
    '他スタッフのロック状態を可視化し不要な競合を防止する',
  ],
  businessRules: [
    '変更対象となる日時・サービスは容量と運用ルールを満たす必要がある',
    '変更後も予約番号は維持する',
    '変更による枠リリースとロックは履歴確認ユースケースで確認済みに更新する',
    '来店者への通知は自動送信せず、必要に応じて手動連絡手順に従う',
    '営業時間外でも来店確認済みでない予約は変更可能とする',
  ],
  priority: 'high',
};
