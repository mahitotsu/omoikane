/**
 * キャパシティカレンダー管理画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef } from '../../typed-references.js';

export const capacityCalendarScreen: Screen = {
  id: 'capacity-calendar-screen',
  name: 'キャパシティカレンダー',
  type: 'screen',
  description: '営業日と予約枠の設定状況を確認し、枠の追加・削除を行う管理画面',
  screenType: 'form',
  displayFields: [
    {
      id: 'selectedDate',
      name: 'selectedDate',
      label: '選択日',
      dataType: 'date',
    },
    {
      id: 'existingSlots',
      name: 'existingSlots',
      label: '既存の予約枠',
      dataType: 'object',
    },
    {
      id: 'availableCapacity',
      name: 'availableCapacity',
      label: '空き状況',
      dataType: 'object',
    },
  ],
  inputFields: [
    {
      id: 'targetDate',
      name: 'targetDate',
      label: '対象日',
      fieldType: 'date',
      required: true,
      validationRules: [],
      helpText: '枠を設定する営業日を選択',
    },
  ],
  actions: [
    {
      id: 'add-slot',
      label: '枠を追加',
      actionType: 'navigate',
      targetScreen: typedScreenRef('capacity-slot-form-screen'),
      isPrimary: true,
    },
    {
      id: 'delete-slot',
      label: '枠を削除',
      actionType: 'submit',
    },
    {
      id: 'view-reservations',
      label: '予約状況を見る',
      actionType: 'navigate',
      targetScreen: typedScreenRef('staff-reservation-list-screen'),
    },
  ],
  requiredPermissions: ['admin:capacity:manage'],
};
