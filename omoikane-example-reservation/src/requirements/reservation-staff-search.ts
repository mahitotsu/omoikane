/**
 * 来店予約管理システム - 店舗スタッフ予約検索ユースケース
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

export const reservationStaffSearch: ReservationUseCase = {
  id: 'reservation-staff-search',
  name: '店舗スタッフによる予約検索',
  description: '店舗スタッフが予約番号なしで、日付・連絡先・サービス内容などの条件を指定して対象予約の一覧を取得する。検索条件と結果閲覧を監査ログに記録することで、プライバシー保護と現場オペレーションの効率化を両立する。',
  actors: {
    primary: typedActorRef('store-staff'),
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [
      businessGoalRef('goal-empower-store-staff'),
      businessGoalRef('goal-visitor-self-service-flexibility'),
    ],
    scopeItems: [businessScopeRef('scope-store-staff-console')],
    stakeholders: [stakeholderRef('stakeholder-store-staff')],
    successMetrics: [successMetricRef('metric-manual-adjustment-time')],
    assumptions: [assumptionRef('assumption-staff-sign-in-required')],
    constraints: [constraintRef('constraint-privacy-minimization')],
    businessRules: [
      businessRuleRef('business-rule-search-empty-initial'),
      businessRuleRef('business-rule-search-multi-criteria'),
      businessRuleRef('business-rule-search-sort-ascending'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-staff-visibility-governance'),
      securityPolicyRef('security-policy-staff-search-audit'),
    ],
  }),
  preconditions: [
    '店舗スタッフが管理コンソールに認証済みで予約閲覧権限を持っている',
    '検索対象の予約が予約管理システムに登録されている',
  ],
  postconditions: [
    '指定した条件に基づく検索結果が空きリストまたは該当予約一覧として表示されている',
    '検索条件と実行した担当者IDが監査ログに記録されている',
  ],
  mainFlow: [
    {
      stepId: 'open-search-view',
      actor: typedActorRef('store-staff'),
      action: '予約管理コンソールで「予約検索」ビューを開く',
      expectedResult: '検索条件入力欄と空の検索結果リストが表示される',
    },
    {
      stepId: 'input-filters',
      actor: typedActorRef('store-staff'),
      action: '来店予定日、来店者名、連絡先など必要な条件を入力し検索を実行する',
      expectedResult:
        '条件に合致する予約のみが検索結果リストに表示される（該当なしの場合は空リストのまま）',
    },
    {
      stepId: 'select-reservation',
      actor: typedActorRef('store-staff'),
      action: '検索結果から対象予約を選択し詳細画面を開く',
      expectedResult: '選択した予約の詳細情報と操作メニューが確認できる',
    },
  ],
  alternativeFlows: [
    {
      id: 'no-result-found',
      name: '該当予約が見つからない',
      condition: '検索条件に一致する予約が存在しない場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '空の検索結果メッセージと条件調整のガイダンスを確認する',
          expectedResult: '条件を変更して再検索できることが明示される',
        },
      ],
      returnToStepId: 'input-filters',
    },
    {
      id: 'insufficient-permission',
      name: '閲覧権限が不足している',
      condition: '選択した予約の詳細を見る権限が不足している場合',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: '権限不足メッセージを確認し管理者への確認フローを開始する',
          expectedResult: '閲覧申請または責任者レビューが求められる',
        },
      ],
      returnToStepId: 'select-reservation',
    },
  ],
  securityPolicies: [
    securityPolicyRef('security-policy-staff-visibility-governance'),
    securityPolicyRef('security-policy-staff-search-audit'),
  ],
  businessRules: [
    businessRuleRef('business-rule-search-empty-initial'),
    businessRuleRef('business-rule-search-multi-criteria'),
    businessRuleRef('business-rule-search-sort-ascending'),
  ],
  priority: 'high',
};
