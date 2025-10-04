/**
 * 来店予約管理システム - 予約登録ユースケース
 */

import type { Actor } from 'omoikane-metamodel';
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

export const visitor: Actor = {
  id: 'visitor',
  type: 'actor',
  owner: 'customer-experience',
  name: '来店者',
  description: '店舗のサービスを利用するために予約を行う顧客',
  role: 'primary',
  responsibilities: [
    '希望日時の入力',
    '希望サービス内容の指定',
    '連絡手段の確認',
    '自身の予約情報の確認・変更・取消',
  ],
};

export const storeStaff: Actor = {
  id: 'store-staff',
  type: 'actor',
  owner: 'store-operations',
  name: '店舗スタッフ',
  description: '来店者の予約内容を確認し当日の受け入れ準備を整えるスタッフ',
  role: 'secondary',
  responsibilities: [
    '予約内容の確認',
    'スタッフアサイン',
    '全予約情報の照会と共有',
    'キャンセルリクエストに伴う準備調整',
    '予約枠ロック・リリース履歴の確認と確認状態の更新',
  ],
};

export const reservationBooking: ReservationUseCase = {
  id: 'reservation-booking',
  type: 'usecase',
  owner: 'customer-experience',
  name: '予約登録',
  description: '来店者が希望日時に合わせて予約を登録する',
  actors: {
    primary: typedActorRef('visitor'),
    secondary: [typedActorRef('store-staff')],
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [
      businessGoalRef('goal-self-service-booking'),
      businessGoalRef('goal-accurate-capacity'),
    ],
    scopeItems: [businessScopeRef('scope-online-booking')],
    stakeholders: [
      stakeholderRef('stakeholder-visitor'),
      stakeholderRef('stakeholder-store-ops-manager'),
    ],
    successMetrics: [successMetricRef('metric-booking-completion-rate')],
    assumptions: [assumptionRef('assumption-manual-communications')],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-operation-hours-visitor'),
      constraintRef('constraint-no-double-booking'),
    ],
  }),
  preconditions: [
    '店舗の営業時間と提供サービスが公開されている',
    '来店者がユーザー登録やログインなしで予約ページにアクセスできる',
  ],
  postconditions: [
    '予約が確定し画面上に予約番号と内容が表示されている',
    '店舗スタッフの業務リストに予約が追加されている',
    '来店者が予約番号と連絡先で照会・変更できるページへのアクセス方法を理解している',
    '確定時の予約枠ロックが履歴に未確認状態で記録されている',
  ],
  mainFlow: [
    {
      stepId: 'open-calendar',
      actor: typedActorRef('visitor'),
      action: '予約カレンダーから希望日と時間帯を選択する',
      expectedResult: '空き枠と所要時間の候補が表示される',
    },
    {
      stepId: 'enter-details',
      actor: typedActorRef('visitor'),
      action: '希望するサービスメニューと利用目的を入力する',
      expectedResult: 'サービス内容がリアルタイムでバリデーションされる',
    },
    {
      stepId: 'lock-slot',
      actor: typedActorRef('visitor'),
      action: '入力内容を送信し選択した枠の確定操作を完了する',
      expectedResult:
        'システムが対象枠をロックし履歴に未確認のロック記録を追加、予約番号を画面に表示する',
    },
    {
      actor: typedActorRef('visitor'),
      action: '表示された予約番号と照会手順を確認し控える',
      expectedResult: '予約照会・変更ページへの到達手順が明示される',
    },
  ],
  alternativeFlows: [
    {
      id: 'slot-unavailable',
      name: '空き枠が確保できない',
      condition: '選択中に同じ枠が別の予約で確保された場合',
      steps: [
        {
          actor: typedActorRef('visitor'),
          action: '画面上の枠確保失敗メッセージを確認し代替候補を検討する',
          expectedResult: '選択可能な別枠と履歴に残された失敗記録を参照できる',
        },
        {
          actor: typedActorRef('visitor'),
          action: '候補から別の枠を選んで再度入力内容を確認する',
          expectedResult: '新しい枠で予約が続行される',
        },
      ],
      returnToStepId: 'enter-details',
    },
  ],
  securityRequirements: [
    '来店者は予約番号と連絡先情報の照合により予約情報へアクセスできる',
    '来店者による他者の予約番号入力は連絡先照合で拒否される',
    '店舗スタッフは業務権限に基づき全予約情報を閲覧・共有できる',
    'ロック・リリース履歴は閲覧権限のあるスタッフのみが参照・確認状態更新できる',
    '履歴データは改ざん防止のため監査ログとして保持される',
  ],
  businessRules: [
    '予約は来店者本人1名分のみを対象とする',
    '来店者は自分が作成した予約のみ確認・変更できる',
    '予約番号は予約完了画面にのみ表示され来店者が控えることを前提とする',
    '予約枠のロックおよびリリース操作は履歴に記録される',
    '履歴には確認未済／済の状態が付与され店舗スタッフが更新を把握できる',
    '履歴の確認・既読化は予約履歴確認ユースケースで実施する',
  ],
  priority: 'high',
};
