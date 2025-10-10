/**
 * アカウント登録フォーム画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef, typedValidationRuleRef } from '../../typed-references.js';

export const accountRegistrationFormScreen: Screen = {
  id: 'account-registration-form-screen',
  name: 'アカウント登録フォーム',
  type: 'screen',
  description: 'ユーザーID、名前、ロールなどの情報を入力して新規アカウントを作成',
  screenType: 'form',
  inputFields: [
    {
      id: 'userId',
      name: 'userId',
      label: 'ユーザーID',
      fieldType: 'text',
      required: true,
      validationRules: [],
      helpText: 'システム内で一意のユーザーID（半角英数字）',
    },
    {
      id: 'userName',
      name: 'userName',
      label: 'ユーザー名',
      fieldType: 'text',
      required: true,
      validationRules: [],
      helpText: '表示用のユーザー名',
    },
    {
      id: 'email',
      name: 'email',
      label: 'メールアドレス',
      fieldType: 'email',
      required: true,
      validationRules: [typedValidationRuleRef('validation-email-format')],
      helpText: '通知やパスワードリセットに使用',
    },
    {
      id: 'role',
      name: 'role',
      label: 'ロール',
      fieldType: 'select',
      required: true,
      validationRules: [],
      helpText: '付与する権限レベル（store-staff, capacity-planner, system-admin）',
    },
    {
      id: 'initialPassword',
      name: 'initialPassword',
      label: '初期パスワード',
      fieldType: 'text',
      required: true,
      validationRules: [],
      helpText: 'ユーザーが初回ログイン時に変更する仮パスワード',
    },
    {
      id: 'notes',
      name: 'notes',
      label: '備考',
      fieldType: 'textarea',
      required: false,
      validationRules: [],
      helpText: 'アカウント作成理由や特記事項（任意）',
    },
  ],
  actions: [
    {
      id: 'create-account',
      label: 'アカウントを作成',
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
