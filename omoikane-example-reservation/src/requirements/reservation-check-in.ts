/**
 * 来店予約管理システム - チェックインユースケース
 * 
 * 来店者の到着時に店舗スタッフが実行するチェックイン操作を定義します。
 * 
 * 設計上の特徴:
 * - 予約ステータスを「来店済み」に更新
 * - チェックイン後の予約変更・取消を制限
 * - 対応準備開始のトリガーとなる重要な操作
 * 
 * ビジネス上の意義:
 * - 枠の適切な管理とオペレーション整合性の確保
 * - No-show（無断欠席）の検出基準
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
} from '../typed-references.js';

export const reservationCheckIn: ReservationUseCase = {
  id: 'reservation-check-in',
  name: '来店受付',
  type: 'usecase',
  description: '来店者が店舗に到着した際に店舗スタッフがチェックイン操作を行い、予約ステータスを「来店済み」に更新する。これにより対応準備が開始され、以降の予約変更・取消を制限することで、オペレーションの整合性と枠の適切な管理を実現する。',
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
    assumptions: [
      assumptionRef('assumption-single-location'),
      assumptionRef('assumption-standard-business-hours'),
  assumptionRef('assumption-slot-interval-1-hour'),
    ],
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
      screen: typedScreenRef('check-in-console-screen'),
      inputData: ['予約名または予約番号'],
      validationRules: ['入力された情報が有効な形式であること'],
      errorHandling: ['不正な形式の場合は再入力を促す'],
    },
    {
      stepId: 'open-console',
      actor: typedActorRef('store-staff'),
      action: 'チェックインコンソールで予約を検索し対象レコードを開く',
      expectedResult: '対象予約が表示され来店ステータス変更が可能になる',
      screen: typedScreenRef('check-in-console-screen'),
      validationRules: [
        '予約が存在すること',
        '予約が「確定済み」状態であること',
      ],
      errorHandling: [
        '予約が見つからない場合は手動検索を案内',
        'キャンセル済みの場合はその旨を表示',
      ],
    },
    {
      stepId: 'register-arrival',
      actor: typedActorRef('store-staff'),
      action: 'チェックインコンソールで来店済みに更新し必要なメモを記録する',
      expectedResult: '予約カレンダー上のステータスが「来店済み」に変更される',
      screen: typedScreenRef('check-in-complete-screen'),
      validationRules: [
        'チェックイン時刻が予約枠の範囲内またはgrace period内であること',
      ],
      errorHandling: [
        '大幅な遅刻の場合は受け入れ可否の確認を促す',
      ],
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
  complexity: 'simple',
  acceptanceCriteria: [
    '予約検索が名前または予約番号で正しく動作すること',
    'チェックイン後、予約ステータスが「来店済み」に更新されること',
    '遅刻の場合、15分以内は受け入れ、超過時は判断が記録されること',
    'チェックイン後は予約変更・取消ができなくなること',
    '予約が見つからない場合は適切なエラーハンドリングが行われること',
  ],
  businessValue: '店舗スタッフの受付業務を効率化し、予約枠の適切な管理と顧客対応の品質向上を実現',
};
