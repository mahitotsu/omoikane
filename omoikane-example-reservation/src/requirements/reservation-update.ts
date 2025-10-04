/**
 * 来店予約管理システム - 予約変更ユースケース
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
import { contactMismatchSteps, reservationLookupStep } from './common-flows.js';
import {
  historyReviewBusinessRule,
  validReservationReferencePrecondition,
  visitorSingleReservationBusinessRule,
} from './common-policies.js';

export const reservationUpdate: ReservationUseCase = {
  id: 'reservation-update',
  type: 'usecase',
  owner: 'customer-experience',
  name: '予約変更',
  description: '来店者が確定済み予約の内容を更新する',
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
    successMetrics: [successMetricRef('metric-manual-adjustment-time')],
    assumptions: [assumptionRef('assumption-manual-communications')],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-operation-hours-visitor'),
      constraintRef('constraint-visitor-own-reservation-only'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-self-service-contact-verification'),
      securityPolicyRef('security-policy-self-service-audit-log'),
    ],
  }),
  preconditions: [
    validReservationReferencePrecondition,
    '予約変更受付期限（利用予定日時の前日営業時間終了まで）を過ぎていない',
  ],
  postconditions: [
    '予約内容が最新の情報に更新されている',
    '変更履歴が記録され店舗スタッフの業務リストに反映されている',
    '旧枠の予約取消と新枠の予約確定が履歴に未確認状態で記録されている',
  ],
  mainFlow: [
    reservationLookupStep,
    {
      stepId: 'review-current',
      actor: typedActorRef('visitor'),
      action: '表示された現行内容を確認し変更したい項目を選択する',
      expectedResult: '変更対象の項目が編集モードで表示される',
    },
    {
      stepId: 'apply-updates',
      actor: typedActorRef('visitor'),
      action: '新しい日時やサービス内容、要望事項を入力して変更を送信する',
      expectedResult:
        'システムが空き枠の重複チェックと制約条件の検証を実行し、旧枠取消・新枠確定の準備を行う',
    },
    {
      stepId: 'confirm-updates',
      actor: typedActorRef('visitor'),
      action: '検証結果と更新後の内容を確認して変更を確定する',
      expectedResult:
        '予約番号は維持されたまま内容が更新され、旧枠の予約取消と新枠の予約確定が履歴に未確認記録として追加される',
    },
  ],
  alternativeFlows: [
    {
      id: 'change-cutoff-exceeded',
      name: '変更可能時間を超過',
      condition: '利用予定日時の前日営業終了後である場合',
      steps: [
        {
          actor: typedActorRef('visitor'),
          action: '照会ページで変更不可のメッセージと店舗への連絡方法を確認する',
          expectedResult: 'オンラインでは変更できないことが明示される',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '店舗ホットライン経由での相談を受け対応方針を判断する',
          expectedResult: '特例対応の要否が決定し記録される',
        },
      ],
      returnToStepId: 'open-lookup',
    },
    {
      id: 'conflict-detected',
      name: '空き枠の確保に失敗',
      condition: '変更後の日時に十分な空きがない場合',
      steps: [
        {
          actor: typedActorRef('visitor'),
          action: 'システムから候補枠の提案と再選択を求められる',
          expectedResult: '選択可能な別枠やサービス調整案が提示される',
        },
      ],
      returnToStepId: 'review-current',
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
    visitorSingleReservationBusinessRule,
    '予約変更は利用予定日時の前日営業時間終了まで可能',
    '変更後の予約番号は変わらない',
    '変更内容は枠の容量制約と店舗の運用ルールを満たしている必要がある',
    '変更に伴う旧枠の予約取消と新枠の予約確定は履歴に記録され確認未済／済で管理される',
    historyReviewBusinessRule,
  ],
  priority: 'medium',
};
