/**
 * 来店予約管理システム - 枠管理ユースケース
 * 
 * キャパシティプランナーによる予約枠の登録・削除を定義します。
 * 
 * 設計上の特徴:
 * - 営業日程とサービス提供計画に基づいた枠設定
 * - 既存予約との衝突チェック
 * - 来店者向け空き枠一覧への即時反映
 * 
 * 注意事項:
 * - 祝日は手動登録を前提（assumption参照）
 * - 予約枠は1時間単位を想定（assumption参照）
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
    typedScreenRef,
    typedUseCaseRef,
} from '../typed-references.js';


export const capacityManagement: ReservationUseCase = {
  id: 'capacity-management',
  name: '枠管理',
  type: 'usecase',
  prerequisiteUseCases: [typedUseCaseRef('staff-authentication')],
  description: 'キャパシティプランナーが営業日程とサービス提供計画に基づいて予約枠を登録・削除し、適切な受付キャパシティを維持する。既存予約との衝突を防ぎ、変更内容を即座に来店者向けの空き枠一覧に反映することで、過剰予約や空予約のリスクを最小化する。',
  actors: {
    primary: typedActorRef('capacity-planner'),
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [businessGoalRef('goal-accurate-capacity')],
    scopeItems: [
      businessScopeRef('scope-capacity-planning'),
      businessScopeRef('scope-business-day-configuration'),
    ],
    stakeholders: [stakeholderRef('stakeholder-capacity-planner')],
    successMetrics: [successMetricRef('metric-slot-utilization')],
    assumptions: [
    assumptionRef('assumption-single-location'),
    assumptionRef('assumption-standard-business-hours'),
    assumptionRef('assumption-holiday-manual-registration'),
    assumptionRef('assumption-slot-interval-1-hour'),
    assumptionRef('assumption-slot-capacity-single'),
    ],
    constraints: [
      constraintRef('constraint-no-double-booking'),
      constraintRef('constraint-log-retention'),
    ],
  }),
  preconditions: [
    '管理者が予約カレンダーの編集権限を持っている',
    '営業日と時間帯の基本設定が完了している',
  ],
  postconditions: [
    '予約カレンダーに新しい枠が反映される、または不要な枠が削除される',
    '変更内容が来店者向けの空き枠一覧に即時反映される',
  ],
  mainFlow: [
    {
      stepId: 'open-admin-view',
      actor: typedActorRef('capacity-planner'),
      action: '予約カレンダーの管理画面で対象日を選択する',
      expectedResult: '該当日の既存枠と空き状況が表示される',
      screen: typedScreenRef('capacity-calendar-screen'),
    },
    {
      stepId: 'register-slot',
      actor: typedActorRef('capacity-planner'),
      action: '開始時刻・終了時刻・最大組数を入力して枠を追加する',
      expectedResult: '入力内容が保存前チェックに進む',
      screen: typedScreenRef('capacity-slot-form-screen'),
    },
    {
      stepId: 'confirm-slot-publication',
      actor: typedActorRef('capacity-planner'),
      action: '検証結果を確認し問題がなければ保存を確定する',
      expectedResult: 'システムが枠を公開し、空き枠一覧が更新される',
      screen: typedScreenRef('capacity-slot-confirm-screen'),
    },
  ],
  alternativeFlows: [
    {
      id: 'slot-conflict',
      name: '重複枠の検知',
      condition: '登録しようとした枠が既存の枠と時間帯が重なる場合',
      steps: [
        {
          actor: typedActorRef('capacity-planner'),
          action: 'システムからの重複警告を確認し時間帯の調整案を検討する',
          expectedResult: '重複箇所が明確になり修正方針が決まる',
        },
      ],
      returnToStepId: 'register-slot',
    },
    {
      id: 'delete-slot',
      name: '不要枠の削除',
      condition: '既存の枠を利用停止にしたい場合',
      steps: [
        {
          actor: typedActorRef('capacity-planner'),
          action: '対象枠を選択し削除操作を実行する',
          expectedResult: '削除対象の枠が確認モーダルに表示される',
        },
        {
          actor: typedActorRef('capacity-planner'),
          action: '削除を確定して枠一覧から該当枠を除外する',
          expectedResult: '枠が一覧から消え来店者に表示されなくなる',
        },
      ],
      returnToStepId: 'open-admin-view',
    },
  ],
  priority: 'low',
  complexity: 'simple',
  acceptanceCriteria: [
    '営業日時の入力が正しくバリデーションされること',
    '重複する枠がある場合は警告が表示されること',
    '枠の登録後、即座に来店者の予約画面に反映されること',
    '削除対象に予約が入っている場合は警告が表示されること',
    '枠の登録・削除履歴が記録されること',
  ],
  businessValue: '予約受付キャパシティの適切な管理により、過剰予約や空予約を防止し、店舗運営の効率を最大化',
};
