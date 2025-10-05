/**
 * 来店予約管理システム - 枠管理ユースケース
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


export const capacityManagement: ReservationUseCase = {
  id: 'capacity-management',
  name: '枠管理',
  description: 'キャパシティプランナーが予約枠を登録・削除する',
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
    },
    {
      stepId: 'register-slot',
      actor: typedActorRef('capacity-planner'),
      action: '開始時刻・終了時刻・最大組数を入力して枠を追加する',
      expectedResult: '入力内容が保存前チェックに進む',
    },
    {
      stepId: 'confirm-slot-publication',
      actor: typedActorRef('capacity-planner'),
      action: '検証結果を確認し問題がなければ保存を確定する',
      expectedResult: 'システムが枠を公開し、空き枠一覧が更新される',
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
};
