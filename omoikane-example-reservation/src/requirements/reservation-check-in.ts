/**
 * 来店予約管理システム - 来店受付ユースケース
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

export const reservationCheckIn: ReservationUseCase = {
  id: 'reservation-check-in',
  type: 'usecase',
  owner: 'store-operations',
  name: '来店受付',
  description: '来店者が店舗到着を通知し受付手続きが完了する',
  actors: {
    primary: typedActorRef('store-staff'),
    secondary: [typedActorRef('visitor')],
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [
      businessGoalRef('goal-accurate-capacity'),
      businessGoalRef('goal-empower-store-staff'),
    ],
    scopeItems: [businessScopeRef('scope-visit-check-in')],
    stakeholders: [
      stakeholderRef('stakeholder-store-staff'),
      stakeholderRef('stakeholder-visitor'),
    ],
    successMetrics: [successMetricRef('metric-slot-utilization')],
    assumptions: [assumptionRef('assumption-single-location')],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-staff-change-anytime-unless-checked-in'),
      constraintRef('constraint-late-arrival-grace-period'),
    ],
  }),
  preconditions: [
    '予約が確定済みでチェックイン可能時間内である',
    '店舗スタッフがチェックインコンソールにログインしている',
  ],
  postconditions: [
    '来店者のステータスが「来店済み」へ更新される',
    '店舗スタッフが対応準備を開始できる状態になる',
  ],
  mainFlow: [
    {
      stepId: 'confirm-arrival',
      actor: typedActorRef('store-staff'),
      action: '来店者から予約名または予約番号をヒアリングする',
      expectedResult: '必要な検索条件が揃いチェックイン準備が整う',
    },
    {
      stepId: 'open-console',
      actor: typedActorRef('store-staff'),
      action: 'チェックインコンソールで予約を検索し対象レコードを開く',
      expectedResult: '対象予約が表示され来店ステータス変更が可能になる',
    },
    {
      stepId: 'register-arrival',
      actor: typedActorRef('store-staff'),
      action: 'チェックインコンソールで来店済みに更新し必要なメモを記録する',
      expectedResult: '予約カレンダー上のステータスが「来店済み」に変更される',
    },
  ],
  alternativeFlows: [
    {
      id: 'late-arrival',
      name: '遅刻の受付',
      condition: 'チェックイン時間が予約枠開始から一定時間経過している場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '遅刻理由をヒアリングしコンソールに遅刻メモを記録する',
          expectedResult: '遅刻に関する情報と到着時刻が共有される',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '遅刻理由を確認し受け入れ可否を判断する',
          expectedResult:
            '15分以内は継続受け入れ、15分を超える場合は枠解放または再調整の判断が記録される',
        },
      ],
      returnToStepId: 'register-arrival',
    },
    {
      id: 'reservation-not-found',
      name: '予約情報が見つからない',
      condition: '入力された予約コードが存在しない場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: 'コンソールにエラーが表示され手動検索への切り替えを案内する',
          expectedResult: '来店者がスタッフによる追加確認を待てる',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '予約カレンダーで検索し手動でチェックイン処理を行う',
          expectedResult: '予約が正しく紐づけられるか、当日受付に切り替わる',
        },
      ],
      returnToStepId: 'confirm-arrival',
    },
  ],
  priority: 'medium',
};
