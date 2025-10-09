/**
 * アカウント操作完了画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef } from '../../typed-references.js';

export const accountOperationCompleteScreen: Screen = {
  id: 'account-operation-complete-screen',
  name: 'アカウント操作完了',
  type: 'screen',
  description: 'アカウント登録または削除の完了を表示する画面',
  screenType: 'detail',
  displayFields: [
    {
      id: 'operationType',
      name: 'operationType',
      label: '操作種別',
      dataType: 'text',
    },
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
      id: 'completedAt',
      name: 'completedAt',
      label: '完了日時',
      dataType: 'datetime',
    },
    {
      id: 'message',
      name: 'message',
      label: 'メッセージ',
      dataType: 'text',
    },
  ],
  actions: [
    {
      id: 'back-to-list',
      label: 'アカウント一覧に戻る',
      actionType: 'navigate',
      targetScreen: typedScreenRef('account-list-screen'),
      isPrimary: true,
    },
    {
      id: 'register-another',
      label: '続けて登録',
      actionType: 'navigate',
      targetScreen: typedScreenRef('account-registration-form-screen'),
    },
  ],
  requiredPermissions: ['admin:account:manage'],
};
