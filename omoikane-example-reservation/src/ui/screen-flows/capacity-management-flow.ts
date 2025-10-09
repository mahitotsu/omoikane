/**
 * キャパシティ管理フロー
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef } from '../../typed-references.js';

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
      trigger: 'add-slot',
    },
    {
      from: typedScreenRef('capacity-slot-form-screen'),
      to: typedScreenRef('capacity-slot-confirm-screen'),
      trigger: 'validate-slot',
    },
    {
      from: typedScreenRef('capacity-slot-confirm-screen'),
      to: typedScreenRef('capacity-calendar-screen'),
      trigger: 'confirm-registration',
    },
    {
      from: typedScreenRef('capacity-slot-form-screen'),
      to: typedScreenRef('capacity-calendar-screen'),
      trigger: 'cancel',
    },
    {
      from: typedScreenRef('capacity-slot-confirm-screen'),
      to: typedScreenRef('capacity-slot-form-screen'),
      trigger: 'back-to-form',
    },
    {
      from: typedScreenRef('capacity-slot-confirm-screen'),
      to: typedScreenRef('capacity-calendar-screen'),
      trigger: 'cancel',
    },
  ],
  startScreen: typedScreenRef('capacity-calendar-screen'),
  endScreens: [typedScreenRef('capacity-calendar-screen')],
  relatedUseCase: typedUseCaseRef('capacity-management'),
};
