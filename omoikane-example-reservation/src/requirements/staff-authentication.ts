/**
 * 来店予約管理システム - スタッフ認証ユースケース
 *
 * **横断的前提機能:**
 * このユースケースは、スタッフがシステムを利用する前提となる認証機能を定義します。
 * 予約検索、予約変更、チェックイン等のスタッフ操作を行うユースケースは、
 * このユースケースが前提条件となります。
 *
 * **設計上の特徴:**
 * - prerequisiteUseCases機能の活用例
 * - セキュリティ要件（認証・セッション管理）の明示
 * - 監査ログの記録（操作トレーサビリティ）
 *
 * **関連ユースケース:**
 * - reservation-staff-search: 予約検索（このユースケースが前提）
 * - reservation-staff-change: 予約変更（このユースケースが前提）
 * - reservation-check-in: チェックイン（このユースケースが前提）
 * - その他全てのスタッフ操作系ユースケース
 */

import type { UseCase } from 'omoikane-metamodel';
import {
  typedActorRef,
  businessRequirementRef,
  businessGoalRef,
} from '../typed-references.js';

export const staffAuthentication: UseCase = {
  id: 'staff-authentication',
  name: 'スタッフ認証',
  type: 'usecase',
  description:
    '店舗スタッフがシステムにサインインし、認証される。このユースケースは、スタッフがシステムを利用する前提となる横断的機能である。',

  actors: {
    primary: typedActorRef('store-staff'),
  },

  preconditions: ['スタッフアカウントが登録されている', 'アカウントがアクティブである'],
  postconditions: [
    'スタッフが認証されている',
    'セッションが確立されている',
    '認証ログが記録されている',
  ],

  businessRequirementCoverage: {
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [businessGoalRef('goal-auditable-operations')],
  },

  mainFlow: [
    {
      stepId: 'input-credentials',
      actor: typedActorRef('store-staff'),
      action: 'メールアドレスとパスワードを入力する',
      expectedResult: '入力内容が受け付けられる',
    },
    {
      stepId: 'authenticate',
      actor: typedActorRef('store-staff'),
      action: '認証ボタンをクリックする',
      expectedResult: '認証が成功し、スタッフダッシュボードにリダイレクトされる',
    },
  ],

  alternativeFlows: [
    {
      id: 'invalid-credentials',
      name: '認証失敗',
      condition: 'メールアドレスまたはパスワードが間違っている',
      steps: [
        {
          actor: typedActorRef('store-staff'),
          action: 'エラーメッセージを確認する',
          expectedResult: '「メールアドレスまたはパスワードが正しくありません」と表示される',
        },
      ],
      returnToStepId: 'input-credentials',
    },
  ],

  priority: 'high',
  complexity: 'medium',
  estimatedEffort: '16時間',

  acceptanceCriteria: [
    '正しい認証情報でログインできる',
    '誤った認証情報ではログインできない',
    'ログイン操作は監査ログに記録される',
  ],
};
