/**
 * アカウント削除フロー
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenActionRef, typedScreenRef, typedUseCaseRef } from '../../typed-references.js';

export const accountDeletionFlow: ScreenFlow = {
  id: 'account-deletion-flow',
  name: 'アカウント削除フロー',
  type: 'screen-flow',
  description: 'システム管理者がアカウントを削除するフロー',  transitions: [
    {
      from: typedScreenRef('account-list-screen'),
      to: typedScreenRef('account-deletion-confirm-screen'),
      trigger: typedScreenActionRef('account-list-screen', 'delete-account'),
    },
    {
      from: typedScreenRef('account-deletion-confirm-screen'),
      to: typedScreenRef('account-operation-complete-screen'),
      trigger: typedScreenActionRef('account-deletion-confirm-screen', 'confirm-deletion'),
    },
    {
      from: typedScreenRef('account-operation-complete-screen'),
      to: typedScreenRef('account-list-screen'),
      trigger: typedScreenActionRef('account-operation-complete-screen', 'back-to-list'),
    },
    {
      from: typedScreenRef('account-deletion-confirm-screen'),
      to: typedScreenRef('account-list-screen'),
      trigger: typedScreenActionRef('account-deletion-confirm-screen', 'cancel'),
    },
  ],  relatedUseCase: typedUseCaseRef('user-account-deletion'),
};
