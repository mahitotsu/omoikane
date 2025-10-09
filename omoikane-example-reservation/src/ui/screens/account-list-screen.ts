/**
 * アカウント一覧画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef } from '../../typed-references.js';

export const accountListScreen: Screen = {
  id: 'account-list-screen',
  name: 'アカウント一覧',
  type: 'screen',
  description: 'ユーザーアカウントの一覧表示と登録・削除操作を行う管理画面',
  screenType: 'list',
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
      id: 'status',
      name: 'status',
      label: 'ステータス',
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
  ],
  actions: [
    {
      id: 'register-account',
      label: '新規アカウント登録',
      actionType: 'navigate',
      targetScreen: typedScreenRef('account-registration-form-screen'),
      isPrimary: true,
    },
    {
      id: 'delete-account',
      label: 'アカウント削除',
      actionType: 'navigate',
      targetScreen: typedScreenRef('account-deletion-confirm-screen'),
    },
    {
      id: 'refresh-list',
      label: '最新に更新',
      actionType: 'custom',
    },
  ],
  requiredPermissions: ['admin:account:manage'],
};
