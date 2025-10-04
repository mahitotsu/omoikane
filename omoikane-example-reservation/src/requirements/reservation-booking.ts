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
  securityPolicyRef,
  stakeholderRef,
  successMetricRef,
  typedActorRef,
} from '../typed-references.js';
import {
  historyReviewBusinessRule,
  visitorSingleReservationBusinessRule,
} from './common-policies.js';

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
    '予約確定・取消履歴の確認と確認状態の更新',
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
      stakeholderRef('stakeholder-store-staff'),
      stakeholderRef('stakeholder-store-ops-manager'),
    ],
    successMetrics: [successMetricRef('metric-booking-completion-rate')],
    assumptions: [assumptionRef('assumption-manual-communications')],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-operation-hours-visitor'),
      constraintRef('constraint-no-double-booking'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-self-service-contact-verification'),
      securityPolicyRef('security-policy-self-service-audit-log'),
      securityPolicyRef('security-policy-staff-visibility-governance'),
      securityPolicyRef('security-policy-history-access-control'),
      securityPolicyRef('security-policy-history-audit-log'),
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
    '予約確定操作が履歴に未確認状態で記録されている',
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
      stepId: 'confirm-reservation',
      actor: typedActorRef('visitor'),
      action: '入力内容を送信し選択した枠の確定操作を完了する',
      expectedResult:
        'システムが対象枠を予約確定として登録し履歴に未確認の確定記録を追加、予約番号を画面に表示する',
    },
    {
      stepId: 'acknowledge-reservation-reference',
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
          expectedResult: '選択可能な別枠が提示され再選択のガイダンスが表示される',
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
  securityPolicies: [
    securityPolicyRef('security-policy-self-service-contact-verification'),
    securityPolicyRef('security-policy-self-service-audit-log'),
    securityPolicyRef('security-policy-staff-visibility-governance'),
    securityPolicyRef('security-policy-history-access-control'),
    securityPolicyRef('security-policy-history-audit-log'),
  ],
  businessRules: [
    visitorSingleReservationBusinessRule,
    '来店者は自分が作成した予約のみ確認・変更できる',
    '予約番号は予約完了画面にのみ表示され来店者が控えることを前提とする',
    '予約の確定および取消操作は履歴に記録される',
    '履歴には確認未済／済の状態が付与され店舗スタッフが更新を把握できる',
    historyReviewBusinessRule,
  ],
  priority: 'high',
};
