/**
 * アカウント削除確認画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef } from '../../typed-references.js';

export const accountDeletionConfirmScreen: Screen = {
  id: 'account-deletion-confirm-screen',
  name: 'アカウント削除確認',
  type: 'screen',
  description: '削除対象のアカウント情報と影響範囲を確認し、削除理由を記録',
  screenType: 'confirmation',
  displayFields: [
    {
      id: 'userId',
      name: 'userId',
      label: 'ユーザーID',
      dataType: 'text',
    },
    {
      id: 'userName',
      name: 'userName',
      label: 'ユーザー名',
      dataType: 'text',
    },
    {
      id: 'email',
      name: 'email',
      label: 'メールアドレス',
      dataType: 'text',
    },
    {
      id: 'role',
      name: 'role',
      label: 'ロール',
      dataType: 'text',
    },
    {
      id: 'createdAt',
      name: 'createdAt',
      label: '作成日時',
      dataType: 'datetime',
    },
    {
      id: 'lastLoginAt',
      name: 'lastLoginAt',
      label: '最終ログイン',
      dataType: 'datetime',
    },
    {
      id: 'impactAssessment',
      name: 'impactAssessment',
      label: '影響範囲',
      dataType: 'object',
    },
  ],
  inputFields: [
    {
      id: 'deletionReason',
      name: 'deletionReason',
      label: '削除理由',
      fieldType: 'textarea',
      required: true,
      validationRules: [],
      helpText: 'アカウント削除の理由を記録（監査用）',
    },
    {
      id: 'approvalStatus',
      name: 'approvalStatus',
      label: '承認状況',
      fieldType: 'select',
      required: true,
      validationRules: [],
      helpText: '削除承認の有無を確認',
    },
  ],
  actions: [
    {
      id: 'confirm-deletion',
      label: '削除を確定',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'cancel',
      label: 'キャンセル',
      actionType: 'navigate',
      targetScreen: typedScreenRef('account-list-screen'),
    },
  ],
  requiredPermissions: ['admin:account:manage'],
};
