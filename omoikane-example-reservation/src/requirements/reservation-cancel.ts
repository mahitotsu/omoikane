/**
 * 来店予約管理システム - 予約取消ユースケース
 */

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
  alreadyCheckedInSelfServiceSteps,
  contactMismatchSteps,
  reservationLookupStep,
} from './common-flows.js';
import {
  historyReviewBusinessRule,
  reservationCancellationHistoryBusinessRule,
  validReservationReferencePrecondition,
} from './common-policies.js';

export const reservationCancel: ReservationUseCase = {
  id: 'reservation-cancel',
  type: 'usecase',
  owner: 'customer-experience',
  name: '予約取消',
  description: '来店者が確定済み予約を取消し、枠を解放する',
  actors: {
    primary: typedActorRef('visitor'),
    secondary: [typedActorRef('store-staff')],
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [businessGoalRef('goal-visitor-self-service-flexibility')],
    scopeItems: [businessScopeRef('scope-visitor-self-service-management')],
    stakeholders: [
      stakeholderRef('stakeholder-visitor'),
      stakeholderRef('stakeholder-store-staff'),
    ],
    successMetrics: [
      successMetricRef('metric-manual-adjustment-time'),
      successMetricRef('metric-slot-utilization'),
    ],
    assumptions: [assumptionRef('assumption-manual-communications')],
    constraints: [
      constraintRef('constraint-operation-hours-visitor'),
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-visitor-own-reservation-only'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-self-service-contact-verification'),
      securityPolicyRef('security-policy-self-service-audit-log'),
    ],
  }),
  preconditions: [
    validReservationReferencePrecondition,
    '予約ステータスが「来店済み」や「キャンセル済み」ではない',
  ],
  postconditions: [
    '対象予約のステータスが「キャンセル済み」に更新されている',
    '解放された枠が空き状況に反映され他の来店者が利用可能になる',
    '店舗スタッフの業務リストと担当者割り当てが更新される',
    'キャンセルによる枠解放（予約取消）が履歴に未確認状態で記録されている',
  ],
  mainFlow: [
    reservationLookupStep,
    {
      stepId: 'review-policy',
      actor: typedActorRef('visitor'),
      action: 'キャンセルポリシーと取消による影響（キャンセル料など）を確認する',
      expectedResult: '取消条件と費用が明示される',
    },
    {
      stepId: 'confirm-cancel',
      actor: typedActorRef('visitor'),
      action: '取消理由を入力しキャンセルを確定する',
      expectedResult:
        'システムが予約ステータスをキャンセル済みに更新し、枠解放（予約取消）を未確認記録として履歴に追加した上で確認画面を表示する',
    },
  ],
  alternativeFlows: [
    {
      id: 'cancel-cutoff-exceeded',
      name: 'キャンセル可能時間を超過',
      condition: '利用予定日時の前日営業終了後である場合',
      steps: [
        {
          actor: typedActorRef('visitor'),
          action: '照会ページでオンラインキャンセル不可のメッセージと連絡窓口を確認する',
          expectedResult: '直前キャンセルの対応方法が明示される',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '電話やチャットでのキャンセル相談を受け最終判断を行う',
          expectedResult: '特例対応の要否が決定し記録される',
        },
      ],
      returnToStepId: 'open-lookup',
    },
    {
      id: 'already-checked-in',
      name: '来店済み予約のキャンセル',
      condition: '予約が既に来店済みとして処理されている場合',
      steps: [...alreadyCheckedInSelfServiceSteps],
      returnToStepId: 'open-lookup',
    },
    {
      id: 'contact-mismatch',
      name: '照合に失敗',
      condition: '入力した連絡先が予約情報と一致しない場合',
      steps: [...contactMismatchSteps],
      returnToStepId: 'open-lookup',
    },
  ],
  securityPolicies: [
    securityPolicyRef('security-policy-self-service-contact-verification'),
    securityPolicyRef('security-policy-self-service-audit-log'),
  ],
  businessRules: [
    'オンラインでのキャンセルは利用予定日時の前日営業時間終了まで可能',
    'キャンセル完了後は予約番号が無効化される',
    'キャンセル理由は必須入力で統計分析に活用される',
    reservationCancellationHistoryBusinessRule,
    historyReviewBusinessRule,
  ],
  priority: 'medium',
};
