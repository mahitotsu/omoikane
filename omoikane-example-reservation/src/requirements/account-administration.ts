/**
 * 来店予約管理システム - アカウント管理ユースケース
 * 
 * システム管理者が店舗スタッフアカウントの登録・削除を行う機能を定義します。
 * 
 * 設計上の特徴:
 * - 2つのユースケース（登録・削除）を1ファイルで定義
 * - 店舗スタッフIDとパスワードの管理
 * - アカウント削除は論理削除（システムからの完全削除ではない）
 * 
 * セキュリティ考慮事項:
 * - パスワードの初期設定とハッシュ化
 * - アカウント操作の監査ログ記録
 * - 削除されたアカウントによる操作の防止
 * 
 * 関連ユースケース:
 * - 店舗スタッフによる全ての予約操作（認証の前提）
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
  typedUseCaseRef,
} from '../typed-references.js';


export const userAccountRegistration: ReservationUseCase = {
  id: 'user-account-registration',
  name: 'ユーザー登録',
  type: 'usecase',
  prerequisiteUseCases: [typedUseCaseRef('staff-authentication')],
  description: 'システム管理者がユーザー情報と適切なロールを指定して新規ユーザーを登録する。最小権限の原則に従い、業務に必要な権限のみを付与し、登録操作と担当者IDを監査ログに記録することで、アクセス制御の透明性とセキュリティを確保する。',
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
    businessRules: [businessRuleRef('business-rule-role-segregation')],
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
      screen: typedScreenRef('account-list-screen'),
    },
    {
      stepId: 'enter-user-info',
      actor: typedActorRef('system-admin'),
      action: 'ユーザー情報と付与するロールを入力する',
      expectedResult: '入力内容の形式チェックが完了する',
      screen: typedScreenRef('account-registration-form-screen'),
    },
    {
      stepId: 'create-user',
      actor: typedActorRef('system-admin'),
      action: '登録を実行しユーザーを作成する',
      expectedResult: '新規ユーザーが作成され指定ロールが付与される',
      screen: typedScreenRef('account-operation-complete-screen'),
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
  businessRules: [businessRuleRef('business-rule-role-segregation')],
  priority: 'medium',
  complexity: 'simple',
  acceptanceCriteria: [
    'ユーザーIDとロールが正しく入力バリデーションされること',
    'ユーザー登録後、即座にシステムアクセスが可能になること',
    '重複するユーザーIDがある場合はエラーが表示されること',
    'ロールの権限が適切に適用されること',
    '登録操作が監査ログに記録されること',
  ],
  businessValue: 'ユーザー管理の効率化とアクセス制御の適切な運用により、セキュリティとコンプライアンスを維持',
};

export const userAccountDeletion: ReservationUseCase = {
  id: 'user-account-deletion',
  name: 'ユーザー削除',
  type: 'usecase',
  prerequisiteUseCases: [typedUseCaseRef('staff-authentication')],
  description: 'システム管理者が不要になったユーザーアカウントを削除し、システムへのアクセスを無効化する。削除前に影響範囲と承認状況を確認し、削除操作と担当者IDを監査ログに記録することで、セキュリティとコンプライアンスを維持する。',
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
    businessRules: [businessRuleRef('business-rule-account-deletion-approval')],
    securityPolicies: [
      securityPolicyRef('security-policy-account-admin-audit'),
      securityPolicyRef('security-policy-least-privilege'),
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
      screen: typedScreenRef('account-list-screen'),
    },
    {
      stepId: 'select-user',
      actor: typedActorRef('system-admin'),
      action: '削除対象のユーザーを検索し選択する',
      expectedResult: '対象ユーザーの詳細と影響範囲が表示される',
      screen: typedScreenRef('account-deletion-confirm-screen'),
    },
    {
      stepId: 'confirm-deletion',
      actor: typedActorRef('system-admin'),
      action: '削除理由を入力し確認のうえ削除を実行する',
      expectedResult: 'ユーザーが削除され関連アクセスが無効化される',
      screen: typedScreenRef('account-operation-complete-screen'),
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
  ],
  businessRules: [businessRuleRef('business-rule-account-deletion-approval')],
  priority: 'medium',
  complexity: 'simple',
  acceptanceCriteria: [
    '削除対象ユーザーが正しく検索・表示されること',
    '削除前に影響範囲の確認が表示されること',
    '承認が必要な場合は承認プロセスが開始されること',
    '削除後、即座にシステムアクセスが無効化されること',
    '削除操作が監査ログに記録されること',
  ],
  businessValue: 'ユーザーライフサイクル管理の適切な運用により、セキュリティリスクを最小化し、監査性を確保',
};
