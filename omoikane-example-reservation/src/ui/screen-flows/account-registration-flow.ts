/**
 * アカウント登録フロー
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef, typedScreenActionRef } from '../../typed-references.js';
// typedScreenActionRef を追加しました

export const accountRegistrationFlow: ScreenFlow = {
  id: 'account-registration-flow',
  name: 'アカウント登録フロー',
  type: 'screen-flow',
  description: 'システム管理者が新規アカウントを登録するフロー',
  screens: [
    typedScreenRef('account-list-screen'),
    typedScreenRef('account-registration-form-screen'),
    typedScreenRef('account-operation-complete-screen'),
  ],
  transitions: [
    {
      from: typedScreenRef('account-list-screen'),
      to: typedScreenRef('account-registration-form-screen'),
      trigger: typedScreenActionRef('account-list-screen', 'register-account'),
    },
    {
      from: typedScreenRef('account-registration-form-screen'),
      to: typedScreenRef('account-operation-complete-screen'),
      trigger: typedScreenActionRef('account-registration-form-screen', 'create-account'),
    },
    {
      from: typedScreenRef('account-operation-complete-screen'),
      to: typedScreenRef('account-list-screen'),
      trigger: typedScreenActionRef('account-operation-complete-screen', 'back-to-list'),
    },
    {
      from: typedScreenRef('account-operation-complete-screen'),
      to: typedScreenRef('account-registration-form-screen'),
      trigger: typedScreenActionRef('account-operation-complete-screen', 'register-another'),
    },
    {
      from: typedScreenRef('account-registration-form-screen'),
      to: typedScreenRef('account-list-screen'),
      trigger: typedScreenActionRef('account-registration-form-screen', 'cancel'),
    },
  ],
  startScreen: typedScreenRef('account-list-screen'),
  endScreens: [
    typedScreenRef('account-list-screen'),
    typedScreenRef('account-operation-complete-screen'),
  ],
  relatedUseCase: typedUseCaseRef('user-account-registration'),
};
