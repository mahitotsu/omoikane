/**
 * 来店予約管理システム - 予約変更ユースケース
 *
 * 来店者による予約内容の変更フローを定義します。
 *
 * 設計上の特徴:
 * - 予約番号と連絡先による本人確認
 * - 旧枠の取消と新枠の確定を同時実行
 * - 変更理由の記録による監査性確保
 *
 * 関連ユースケース:
 * - reservation-booking: 予約の新規登録
 * - reservation-staff-change: スタッフによる予約変更
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
  typedScreenRef,
} from '../typed-references.js';
const reservationLookupStep = {
  stepId: 'open-lookup',
  actor: typedActorRef('visitor'),
  action: '予約照会ページで予約番号と連絡先を入力し対象予約を表示する',
  expectedResult: '本人と一致する予約のみが照会される',
  screen: typedScreenRef('reservation-lookup-screen'),
  inputData: ['予約番号', '連絡先情報'],
  validationRules: ['予約番号が有効な形式であること', '連絡先情報が登録時と一致すること'],
  errorHandling: [
    '予約番号が存在しない場合はエラーメッセージを表示',
    '連絡先が一致しない場合は本人確認手順を案内',
  ],
};

const contactMismatchSteps = [
  {
    actor: typedActorRef('visitor'),
    action: '照合エラーを確認し入力内容を修正する',
    expectedResult: '誤った入力が明示され再入力が促される',
  },
  {
    actor: typedActorRef('store-staff'),
    action: '本人確認のため追加情報の提供を依頼する',
    expectedResult: '不正アクセスを防止したまま本人確認手続きが整う',
  },
];

export const reservationUpdate: ReservationUseCase = {
  id: 'reservation-update',
  name: '予約変更',
  type: 'usecase',
  description:
    '来店者が確定済みの予約内容を更新する。予約番号と連絡先による本人確認を行い、日時やサービス内容の変更を営業時間外でもセルフサービスで実行できる。旧枠の取消と新枠の確定を一連の操作として記録し、履歴の追跡可能性を維持する。',
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
    assumptions: [
      assumptionRef('assumption-manual-communications'),
      assumptionRef('assumption-standard-business-hours'),
      assumptionRef('assumption-slot-interval-1-hour'),
      assumptionRef('assumption-slot-capacity-single'),
    ],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-operation-hours-visitor'),
      constraintRef('constraint-visitor-own-reservation-only'),
    ],
    businessRules: [
      businessRuleRef('business-rule-visitor-single-reservation'),
      businessRuleRef('business-rule-visitor-cutoff'),
      businessRuleRef('business-rule-change-retain-reference'),
      businessRuleRef('business-rule-history-review-governance'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-self-service-contact-verification'),
      securityPolicyRef('security-policy-self-service-audit-log'),
    ],
  }),
  preconditions: [
    '有効な予約番号と登録済みの連絡先情報を来店者が保持している',
    '予約変更受付期限（利用予定日時の前営業日の営業時間終了まで）を過ぎていない',
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
      screen: typedScreenRef('reservation-detail-screen'),
    },
    {
      stepId: 'apply-updates',
      actor: typedActorRef('visitor'),
      action: '新しい日時やサービス内容、要望事項を入力して変更を送信する',
      expectedResult:
        'システムが空き枠の重複チェックと制約条件の検証を実行し、旧枠取消・新枠確定の準備を行う',
      screen: typedScreenRef('reservation-update-form-screen'),
    },
    {
      stepId: 'confirm-updates',
      actor: typedActorRef('visitor'),
      action: '検証結果と更新後の内容を確認して変更を確定する',
      expectedResult: '予約内容が更新される',
      screen: typedScreenRef('reservation-update-confirm-screen'),
    },
    {
      stepId: 'view-completion',
      actor: typedActorRef('visitor'),
      action: '完了画面で更新完了メッセージと更新後の予約内容を確認する',
      expectedResult:
        '予約番号は維持されたまま内容が更新され、旧枠の予約取消と新枠の予約確定が履歴に記録される',
      screen: typedScreenRef('reservation-update-complete-screen'),
    },
  ],
  alternativeFlows: [
    {
      id: 'change-cutoff-exceeded',
      name: '変更可能時間を超過',
      condition: '利用予定日時の前営業日の営業時間終了後である場合',
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
    businessRuleRef('business-rule-visitor-single-reservation'),
    businessRuleRef('business-rule-visitor-cutoff'),
    businessRuleRef('business-rule-change-retain-reference'),
    businessRuleRef('business-rule-history-review-governance'),
  ],
  priority: 'medium',
  complexity: 'medium',
  acceptanceCriteria: [
    '予約番号と連絡先による本人確認が正しく動作すること',
    '変更後の空き枠が正しく確認できること',
    '旧枠の解放と新枠の確保が同時に行われること',
    '予約番号が変更前後で維持されること',
    '変更期限を超過している場合は適切なエラーメッセージが表示されること',
    '変更履歴が未確認状態で記録されること',
  ],
  businessValue: '来店者の予定変更に柔軟に対応し、予約の継続性と履歴の追跡可能性を維持',
};
