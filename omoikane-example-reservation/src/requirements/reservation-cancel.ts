/**
 * 来店予約管理システム - 予約取消ユースケース
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
const reservationLookupStep = {
  stepId: 'open-lookup',
  actor: typedActorRef('visitor'),
  action: '予約照会ページで予約番号と連絡先を入力し対象予約を表示する',
  expectedResult: '本人と一致する予約のみが照会される',
  inputData: ['予約番号', '連絡先情報'],
  validationRules: [
    '予約番号が有効な形式であること',
    '連絡先情報が登録時と一致すること',
  ],
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

const alreadyCheckedInSelfServiceSteps = [
  {
    actor: typedActorRef('visitor'),
    action: 'キャンセルや変更がオンラインでは行えない旨の案内を確認する',
    expectedResult: '来店済みで手続きできない理由と連絡方法が明示される',
  },
  {
    actor: typedActorRef('store-staff'),
    action: '状況を確認し必要に応じて返金やクレーム対応などのフォローを記録する',
    expectedResult: 'アフターケアのタスクと責任者が履歴に残る',
  },
];

export const reservationCancel: ReservationUseCase = {
  id: 'reservation-cancel',
  name: '予約取消',
  description: '来店者が確定済みの予約を取消し、予約していた枠を解放する。予約番号と連絡先による本人確認を行い、取消理由を記録することで、枠の適切な再利用と監査性を確保する。営業時間外でもセルフサービスで取消可能。',
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
    assumptions: [
      assumptionRef('assumption-manual-communications'),
      assumptionRef('assumption-standard-business-hours'),
      assumptionRef('assumption-slot-interval-1-hour'),
    ],
    constraints: [
      constraintRef('constraint-operation-hours-visitor'),
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-visitor-own-reservation-only'),
    ],
    businessRules: [
      businessRuleRef('business-rule-visitor-cutoff'),
      businessRuleRef('business-rule-cancel-invalidate-reference'),
      businessRuleRef('business-rule-cancel-reason-category'),
      businessRuleRef('business-rule-record-all-reservation-actions'),
      businessRuleRef('business-rule-history-review-governance'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-self-service-contact-verification'),
      securityPolicyRef('security-policy-self-service-audit-log'),
    ],
  }),
  preconditions: [
    '有効な予約番号と登録済みの連絡先情報を来店者が保持している',
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
  action: '必要に応じて取消理由を入力しキャンセルを確定する',
      expectedResult:
        'システムが予約ステータスをキャンセル済みに更新し、枠解放（予約取消）を未確認記録として履歴に追加した上で確認画面を表示する',
    },
  ],
  alternativeFlows: [
    {
      id: 'cancel-cutoff-exceeded',
      name: 'キャンセル可能時間を超過',
  condition: '利用予定日時の前営業日の営業時間終了後である場合',
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
    businessRuleRef('business-rule-visitor-cutoff'),
    businessRuleRef('business-rule-cancel-invalidate-reference'),
    businessRuleRef('business-rule-cancel-reason-category'),
    businessRuleRef('business-rule-record-all-reservation-actions'),
    businessRuleRef('business-rule-history-review-governance'),
  ],
  priority: 'medium',
  complexity: 'medium',
  acceptanceCriteria: [
    '予約番号と連絡先による本人確認が正しく動作すること',
    'キャンセルポリシーと費用が明確に表示されること',
    'キャンセル後、枠が即座に空き状態に戻ること',
    'キャンセル期限を超過している場合は適切なエラーメッセージが表示されること',
    'キャンセル履歴が未確認状態で記録されること',
  ],
  businessValue: '来店者の予定変更に柔軟に対応し、枠の有効活用と店舗運営の効率化を実現',
};
