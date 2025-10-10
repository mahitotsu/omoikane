/**
 * アカウント登録フロー
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef } from '../../typed-references.js';

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
      trigger: 'register-account',
    },
    {
      from: typedScreenRef('account-registration-form-screen'),
      to: typedScreenRef('account-operation-complete-screen'),
      trigger: 'create-account',
    },
    {
      from: typedScreenRef('account-operation-complete-screen'),
      to: typedScreenRef('account-list-screen'),
      trigger: 'back-to-list',
    },
    {
      from: typedScreenRef('account-operation-complete-screen'),
      to: typedScreenRef('account-registration-form-screen'),
      trigger: 'register-another',
    },
    {
      from: typedScreenRef('account-registration-form-screen'),
      to: typedScreenRef('account-list-screen'),
      trigger: 'cancel',
    },
  ],
  startScreen: typedScreenRef('account-list-screen'),
  endScreens: [
    typedScreenRef('account-list-screen'),
    typedScreenRef('account-operation-complete-screen'),
  ],
  relatedUseCase: typedUseCaseRef('user-account-registration'),
};
