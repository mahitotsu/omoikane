/**
 * 来店予約管理システム - アカウント管理（システム管理者）
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

export const systemAdmin: Actor = {
  id: 'system-admin',
  type: 'actor',
  owner: 'system-operations',
  name: 'システム管理者',
  description: 'ユーザー登録・削除および権限設定を行う管理者',
  role: 'primary',
  responsibilities: [
    'ユーザーの登録・削除',
    '権限（ロール）の付与・変更',
    '監査やセキュリティ方針に基づく定期的なアカウント整備',
  ],
};

export const userAccountRegistration: ReservationUseCase = {
  id: 'user-account-registration',
  type: 'usecase',
  owner: 'system-operations',
  name: 'ユーザー登録',
  description: 'システム管理者がユーザー情報と権限を指定して新規ユーザーを登録する',
  actors: { primary: typedActorRef('system-admin') },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [businessGoalRef('goal-admin-managed-accounts')],
    scopeItems: [businessScopeRef('scope-account-administration')],
    stakeholders: [stakeholderRef('stakeholder-system-admin')],
    successMetrics: [successMetricRef('metric-admin-access-readiness')],
    assumptions: [assumptionRef('assumption-staff-sign-in-required')],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-log-retention'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-account-admin-audit'),
      securityPolicyRef('security-policy-least-privilege'),
    ],
  }),
  preconditions: [
    'システム管理者が管理コンソールにサインインしている',
    '必要なユーザーデータ項目とロールが定義済みである',
  ],
  postconditions: [
    '新規ユーザーが作成され、指定した権限が付与されている',
    '作業内容と担当者IDが監査ログに記録されている',
  ],
  mainFlow: [
    {
      stepId: 'open-admin-console',
      actor: typedActorRef('system-admin'),
      action: '管理コンソールのアカウント管理画面を開く',
      expectedResult: 'ユーザー一覧と新規登録操作メニューが表示される',
    },
    {
      stepId: 'enter-user-info',
      actor: typedActorRef('system-admin'),
      action: 'ユーザー情報と付与するロールを入力する',
      expectedResult: '入力内容の形式チェックが完了する',
    },
    {
      stepId: 'create-user',
      actor: typedActorRef('system-admin'),
      action: '登録を実行しユーザーを作成する',
      expectedResult: '新規ユーザーが作成され指定ロールが付与される',
    },
  ],
  alternativeFlows: [
    {
      id: 'validation-error',
      name: '入力値の検証エラー',
      condition: '必須項目不足やロール不整合がある場合',
      steps: [
        {
          actor: typedActorRef('system-admin'),
          action: 'エラーメッセージを確認し不足項目やロール設定を修正する',
          expectedResult: '修正後に登録が成功する',
        },
      ],
      returnToStepId: 'enter-user-info',
    },
    {
      id: 'insufficient-permission',
      name: '管理操作の権限不足',
      condition: '管理者ロールが不足している、または追加認可が必要な場合',
      steps: [
        {
          actor: typedActorRef('system-admin'),
          action: '承認フローを開始するかロール付与を依頼する',
          expectedResult: '必要な権限が付与され操作を再開できる',
        },
      ],
      returnToStepId: 'open-admin-console',
    },
  ],
  securityPolicies: [
    securityPolicyRef('security-policy-account-admin-audit'),
    securityPolicyRef('security-policy-least-privilege'),
  ],
  businessRules: ['ロール付与は定義済みの職務分掌に従う'],
  priority: 'medium',
};

export const userAccountDeletion: ReservationUseCase = {
  id: 'user-account-deletion',
  type: 'usecase',
  owner: 'system-operations',
  name: 'ユーザー削除',
  description: 'システム管理者が不要なユーザーを削除しアクセスを無効化する',
  actors: { primary: typedActorRef('system-admin') },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [businessGoalRef('goal-admin-managed-accounts')],
    scopeItems: [businessScopeRef('scope-account-administration')],
    stakeholders: [stakeholderRef('stakeholder-system-admin')],
    successMetrics: [successMetricRef('metric-admin-access-readiness')],
    assumptions: [assumptionRef('assumption-staff-sign-in-required')],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-log-retention'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-account-admin-audit'),
      securityPolicyRef('security-policy-least-privilege'),
      securityPolicyRef('security-policy-account-deletion-approval'),
    ],
  }),
  preconditions: [
    'システム管理者が管理コンソールにサインインしている',
    '削除対象ユーザーの影響範囲が確認されている',
  ],
  postconditions: [
    '対象ユーザーが削除され関連アクセスが無効化されている',
    '作業内容と担当者IDが監査ログに記録されている',
  ],
  mainFlow: [
    {
      stepId: 'open-admin-console',
      actor: typedActorRef('system-admin'),
      action: '管理コンソールのアカウント管理画面を開く',
      expectedResult: 'ユーザー一覧と削除操作メニューが表示される',
    },
    {
      stepId: 'select-user',
      actor: typedActorRef('system-admin'),
      action: '削除対象のユーザーを検索し選択する',
      expectedResult: '対象ユーザーの詳細と影響範囲が表示される',
    },
    {
      stepId: 'confirm-deletion',
      actor: typedActorRef('system-admin'),
      action: '削除理由を入力し確認のうえ削除を実行する',
      expectedResult: 'ユーザーが削除され関連アクセスが無効化される',
    },
  ],
  alternativeFlows: [
    {
      id: 'cannot-delete-due-to-dependency',
      name: '依存関係により削除不可',
      condition: '削除対象が監査中や必須ロールに紐付くなど削除制約がある場合',
      steps: [
        {
          actor: typedActorRef('system-admin'),
          action: '削除制約の詳細を確認し代替（無効化やロール剥奪）を実施する',
          expectedResult: 'リスクが回避され、必要に応じて後日削除が可能になる',
        },
      ],
      returnToStepId: 'select-user',
    },
    {
      id: 'insufficient-permission',
      name: '管理操作の権限不足',
      condition: '管理者ロールが不足している、または追加認可が必要な場合',
      steps: [
        {
          actor: typedActorRef('system-admin'),
          action: '承認フローを開始するかロール付与を依頼する',
          expectedResult: '必要な権限が付与され操作を再開できる',
        },
      ],
      returnToStepId: 'open-admin-console',
    },
  ],
  securityPolicies: [
    securityPolicyRef('security-policy-account-admin-audit'),
    securityPolicyRef('security-policy-least-privilege'),
    securityPolicyRef('security-policy-account-deletion-approval'),
  ],
  businessRules: ['ユーザー削除は関連業務の影響を確認し責任者の承認を得る'],
  priority: 'medium',
};
