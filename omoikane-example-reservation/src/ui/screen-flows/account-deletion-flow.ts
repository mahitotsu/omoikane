/**
 * アカウント削除フロー
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef } from '../../typed-references.js';

export const accountDeletionFlow: ScreenFlow = {
  id: 'account-deletion-flow',
  name: 'アカウント削除フロー',
  type: 'screen-flow',
  description: 'システム管理者がアカウントを削除するフロー',
  screens: [
    typedScreenRef('account-list-screen'),
    typedScreenRef('account-deletion-confirm-screen'),
    typedScreenRef('account-operation-complete-screen'),
  ],
  transitions: [
    {
      from: typedScreenRef('account-list-screen'),
      to: typedScreenRef('account-deletion-confirm-screen'),
      trigger: 'delete-account',
    },
    {
      from: typedScreenRef('account-deletion-confirm-screen'),
      to: typedScreenRef('account-operation-complete-screen'),
      trigger: 'confirm-deletion',
    },
    {
      from: typedScreenRef('account-operation-complete-screen'),
      to: typedScreenRef('account-list-screen'),
      trigger: 'back-to-list',
    },
    {
      from: typedScreenRef('account-deletion-confirm-screen'),
      to: typedScreenRef('account-list-screen'),
      trigger: 'cancel',
    },
  ],
  startScreen: typedScreenRef('account-list-screen'),
  endScreens: [typedScreenRef('account-list-screen')],
  relatedUseCase: typedUseCaseRef('user-account-deletion'),
};
