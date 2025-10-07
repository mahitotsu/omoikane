/**
 * 来店予約管理システム - 予約登録ユースケース
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


export const reservationBooking: ReservationUseCase = {
  id: 'reservation-booking',
  name: '予約登録',
  description: '来店者が希望日時と利用サービスを選択して予約を新規登録する。営業時間外でもセルフサービスで予約を確定でき、予約番号と予約内容が画面に表示される。予約確定操作は履歴に記録され、店舗スタッフの業務リストに即座に反映される。',
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
    assumptions: [
      assumptionRef('assumption-manual-communications'),
      assumptionRef('assumption-standard-business-hours'),
  assumptionRef('assumption-slot-interval-1-hour'),
      assumptionRef('assumption-slot-capacity-single'),
    ],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-operation-hours-visitor'),
      constraintRef('constraint-no-double-booking'),
    ],
    businessRules: [
      businessRuleRef('business-rule-visitor-single-reservation'),
      businessRuleRef('business-rule-reservation-number-display-once'),
      businessRuleRef('business-rule-record-all-reservation-actions'),
      businessRuleRef('business-rule-history-review-status'),
      businessRuleRef('business-rule-history-review-governance'),
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
      validationRules: [
        '選択日が現在日時以降であること',
        '選択時刻が営業時間内であること',
      ],
      errorHandling: [
        '過去の日時が選択された場合はエラーメッセージを表示',
        '営業時間外が選択された場合は代替時間帯を提案',
      ],
    },
    {
      stepId: 'enter-details',
      actor: typedActorRef('visitor'),
      action: '希望するサービスメニューと利用目的を入力する',
      expectedResult: 'サービス内容がリアルタイムでバリデーションされる',
      inputData: ['サービスメニューID', '利用目的（任意）', '連絡先情報'],
      validationRules: [
        'サービスメニューが有効なものであること',
        '連絡先情報が有効な形式であること',
      ],
      errorHandling: [
        '無効なサービスメニューの場合はエラーを表示し有効な選択肢を提示',
        '連絡先形式が不正な場合は形式例を表示',
      ],
    },
    {
      stepId: 'confirm-reservation',
      actor: typedActorRef('visitor'),
      action: '入力内容を送信し選択した枠の確定操作を完了する',
      expectedResult:
        'システムが対象枠を予約確定として登録し履歴に未確認の確定記録を追加、予約番号を画面に表示する',
      validationRules: [
        '選択した枠が依然として利用可能であること',
        '同一連絡先での重複予約がないこと',
      ],
      errorHandling: [
        '枠が確保できない場合は代替枠を提案',
        '重複予約の場合は既存予約の情報を表示',
      ],
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
    businessRuleRef('business-rule-visitor-single-reservation'),
    businessRuleRef('business-rule-reservation-number-display-once'),
    businessRuleRef('business-rule-record-all-reservation-actions'),
    businessRuleRef('business-rule-history-review-status'),
    businessRuleRef('business-rule-history-review-governance'),
  ],
  priority: 'high',
  complexity: 'medium',
  acceptanceCriteria: [
    '希望日時の空き枠が正しく表示されること',
    '同時アクセスによる二重予約が発生しないこと',
    '予約番号が一意に発行され画面に表示されること',
    '予約確定後、店舗スタッフの業務リストに即座に反映されること',
    '予約履歴に未確認状態で記録されること',
    '予約番号と連絡先で照会可能な状態になること',
  ],
  businessValue: '来店者の利便性向上と店舗運営の効率化を実現し、営業時間外でも予約受付が可能となる',
};
