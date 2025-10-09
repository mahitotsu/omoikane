/**
 * 予約枠登録フォーム画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef, typedValidationRuleRef } from '../../typed-references.js';

export const capacitySlotFormScreen: Screen = {
  id: 'capacity-slot-form-screen',
  name: '予約枠登録フォーム',
  type: 'screen',
  description: '予約枠の開始時刻、終了時刻、最大組数を入力して新規枠を作成',
  screenType: 'form',
  inputFields: [
    {
      id: 'slotDate',
      name: 'slotDate',
      label: '対象日',
      fieldType: 'date',
      required: true,
      validationRules: [],
      helpText: '予約枠を設定する日付',
    },
    {
      id: 'startTime',
      name: 'startTime',
      label: '開始時刻',
      fieldType: 'time',
      required: true,
      validationRules: [],
      helpText: '予約枠の開始時刻（営業時間内）',
    },
    {
      id: 'endTime',
      name: 'endTime',
      label: '終了時刻',
      fieldType: 'time',
      required: true,
      validationRules: [],
      helpText: '予約枠の終了時刻（営業時間内）',
    },
    {
      id: 'maxCapacity',
      name: 'maxCapacity',
      label: '最大組数',
      fieldType: 'number',
      required: true,
      validationRules: [typedValidationRuleRef('validation-party-size-range')],
      helpText: 'この時間帯に受け入れ可能な最大組数',
    },
    {
      id: 'serviceType',
      name: 'serviceType',
      label: 'サービス種別',
      fieldType: 'select',
      required: false,
      validationRules: [],
      helpText: 'この枠で提供するサービスの種類（任意）',
    },
    {
      id: 'notes',
      name: 'notes',
      label: '備考',
      fieldType: 'textarea',
      required: false,
      validationRules: [],
      helpText: '枠に関する特記事項（任意）',
    },
  ],
  actions: [
    {
      id: 'validate-slot',
      label: '内容を確認',
      actionType: 'navigate',
      targetScreen: typedScreenRef('capacity-slot-confirm-screen'),
      isPrimary: true,
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
