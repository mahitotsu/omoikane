/**
 * 予約枠登録確認画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef } from '../../typed-references.js';

export const capacitySlotConfirmScreen: Screen = {
  id: 'capacity-slot-confirm-screen',
  name: '予約枠登録確認',
  type: 'screen',
  description: '登録する予約枠の内容と重複チェック結果を確認する画面',
  screenType: 'confirmation',
  displayFields: [
    {
      id: 'slotDate',
      name: 'slotDate',
      label: '対象日',
      dataType: 'date',
    },
    {
      id: 'timeRange',
      name: 'timeRange',
      label: '時間帯',
      dataType: 'text',
    },
    {
      id: 'maxCapacity',
      name: 'maxCapacity',
      label: '最大組数',
      dataType: 'number',
    },
    {
      id: 'serviceType',
      name: 'serviceType',
      label: 'サービス種別',
      dataType: 'text',
    },
    {
      id: 'validationStatus',
      name: 'validationStatus',
      label: '検証結果',
      dataType: 'text',
    },
    {
      id: 'conflictingSlots',
      name: 'conflictingSlots',
      label: '重複する枠',
      dataType: 'object',
    },
  ],
  actions: [
    {
      id: 'confirm-registration',
      label: '登録を確定',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'back-to-form',
      label: '修正する',
      actionType: 'navigate',
      targetScreen: typedScreenRef('capacity-slot-form-screen'),
    },
    {
      id: 'cancel',
      label: 'キャンセル',
      actionType: 'navigate',
      targetScreen: typedScreenRef('capacity-calendar-screen'),
    },
  ],
  requiredPermissions: ['admin:capacity:manage'],
};
