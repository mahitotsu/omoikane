/**
 * キャパシティ管理フロー
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef, typedScreenActionRef } from '../../typed-references.js';
// typedScreenActionRef を追加しました

export const capacityManagementFlow: ScreenFlow = {
  id: 'capacity-management-flow',
  name: 'キャパシティ管理フロー',
  type: 'screen-flow',
  description: 'キャパシティプランナーが予約枠を登録・削除するフロー',
  screens: [
    typedScreenRef('capacity-calendar-screen'),
    typedScreenRef('capacity-slot-form-screen'),
    typedScreenRef('capacity-slot-confirm-screen'),
  ],
  transitions: [
    {
      from: typedScreenRef('capacity-calendar-screen'),
      to: typedScreenRef('capacity-slot-form-screen'),
      trigger: typedScreenActionRef('capacity-calendar-screen', 'add-slot'),
    },
    {
      from: typedScreenRef('capacity-slot-form-screen'),
      to: typedScreenRef('capacity-slot-confirm-screen'),
      trigger: typedScreenActionRef('capacity-slot-form-screen', 'validate-slot'),
    },
    {
      from: typedScreenRef('capacity-slot-confirm-screen'),
      to: typedScreenRef('capacity-calendar-screen'),
      trigger: typedScreenActionRef('capacity-slot-confirm-screen', 'confirm-registration'),
    },
    {
      from: typedScreenRef('capacity-slot-form-screen'),
      to: typedScreenRef('capacity-calendar-screen'),
      trigger: typedScreenActionRef('capacity-slot-form-screen', 'cancel'),
    },
    {
      from: typedScreenRef('capacity-slot-confirm-screen'),
      to: typedScreenRef('capacity-slot-form-screen'),
      trigger: typedScreenActionRef('capacity-slot-confirm-screen', 'back-to-form'),
    },
    {
      from: typedScreenRef('capacity-slot-confirm-screen'),
      to: typedScreenRef('capacity-calendar-screen'),
      trigger: typedScreenActionRef('capacity-slot-confirm-screen', 'cancel'),
    },
  ],
  startScreen: typedScreenRef('capacity-calendar-screen'),
  endScreens: [
    typedScreenRef('capacity-calendar-screen'),
    typedScreenRef('capacity-slot-confirm-screen'),
  ],
  relatedUseCase: typedUseCaseRef('capacity-management'),
};
