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
    stakeholderRef,
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

export const userAccountAdministration: ReservationUseCase = {
  id: 'user-account-administration',
  type: 'usecase',
  owner: 'system-operations',
  name: 'ユーザーアカウント管理',
  description:
    'システム管理者が適切な権限設定のもとでユーザーの登録・削除を行い、アクセス制御を維持する',
  actors: {
    primary: typedActorRef('system-admin'),
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [businessGoalRef('goal-admin-managed-accounts')],
    scopeItems: [businessScopeRef('scope-account-administration')],
    stakeholders: [stakeholderRef('stakeholder-system-admin')],
    assumptions: [assumptionRef('assumption-staff-sign-in-required')],
    constraints: [
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-log-retention'),
    ],
  }),
  preconditions: [
    'システム管理者が管理コンソールにサインインしている',
    '管理対象のユーザーデータ要件が定義済みである',
  ],
  postconditions: [
    '登録・削除結果が反映され、必要な権限が付与・剥奪されている',
    '実施内容と担当者IDが監査ログに記録されている',
  ],
  mainFlow: [
    {
      stepId: 'open-admin-console',
      actor: typedActorRef('system-admin'),
      action: '管理コンソールのアカウント管理画面を開く',
      expectedResult: 'ユーザー一覧と新規登録/削除の操作メニューが表示される',
    },
    {
      stepId: 'create-user',
      actor: typedActorRef('system-admin'),
      action: 'ユーザー情報と付与する権限を入力して登録を実行する',
      expectedResult: '新規ユーザーが作成され、指定した権限が付与される',
    },
    {
      stepId: 'delete-user',
      actor: typedActorRef('system-admin'),
      action: '不要なユーザーを選択し削除を実行する',
      expectedResult: '対象ユーザーが削除され、関連するアクセスが無効化される',
    },
  ],
  alternativeFlows: [
    {
      id: 'validation-error',
      name: '入力値の検証エラー',
      condition: '必須項目不足や権限設定の不整合がある場合',
      steps: [
        {
          actor: typedActorRef('system-admin'),
          action: 'エラーメッセージを確認し不足項目や権限設定を修正する',
          expectedResult: '再実行により登録または削除が成功する',
        },
      ],
      returnToStepId: 'create-user',
    },
    {
      id: 'insufficient-permission',
      name: '管理操作の権限不足',
      condition: 'システム管理者ロールが欠落している、または追加認可が必要な場合',
      steps: [
        {
          actor: typedActorRef('system-admin'),
          action: '追加の承認フローまたはロール付与を依頼する',
          expectedResult: '必要な権限が付与され操作を再開できる',
        },
      ],
      returnToStepId: 'open-admin-console',
    },
  ],
  securityRequirements: [
    '全てのアカウント操作は担当者IDと操作内容を監査ログに記録する',
    '最小権限の原則に従い不要な権限は付与しない',
  ],
  businessRules: [
    'ユーザー削除は関連業務の影響を確認し責任者の承認を得る',
    '権限付与・剥奪は定義済みロールと職務分掌に従う',
  ],
  priority: 'medium',
};
