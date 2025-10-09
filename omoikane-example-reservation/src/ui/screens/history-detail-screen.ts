/**
 * 予約履歴詳細画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef } from '../../typed-references.js';

export const historyDetailScreen: Screen = {
  id: 'history-detail-screen',
  name: '予約履歴詳細',
  type: 'screen',
  description: '履歴の詳細情報を表示し、確認メモを追加する画面',
  screenType: 'detail',
  displayFields: [
    {
      id: 'historyId',
      name: 'historyId',
      label: '履歴ID',
      dataType: 'text',
    },
    {
      id: 'actionType',
      name: 'actionType',
      label: '操作種別',
      dataType: 'text',
    },
    {
      id: 'actionDateTime',
      name: 'actionDateTime',
      label: '操作日時',
      dataType: 'datetime',
    },
    {
      id: 'reservationNumber',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'customerName',
      name: 'customerName',
      label: '来店者名',
      dataType: 'text',
    },
    {
      id: 'beforeData',
      name: 'beforeData',
      label: '変更前',
      dataType: 'object',
    },
    {
      id: 'afterData',
      name: 'afterData',
      label: '変更後',
      dataType: 'object',
    },
    {
      id: 'performedBy',
      name: 'performedBy',
      label: '実行者',
      dataType: 'text',
    },
    {
      id: 'reviewStatus',
      name: 'reviewStatus',
      label: '確認状態',
      dataType: 'text',
    },
    {
      id: 'reviewedBy',
      name: 'reviewedBy',
      label: '確認者',
      dataType: 'text',
    },
    {
      id: 'reviewedAt',
      name: 'reviewedAt',
      label: '確認日時',
      dataType: 'datetime',
    },
  ],
  inputFields: [
    {
      id: 'reviewNote',
      name: 'reviewNote',
      label: '確認メモ',
      fieldType: 'textarea',
      required: false,
      validationRules: [],
      helpText: '履歴確認時のメモや共有事項を記録',
    },
  ],
  actions: [
    {
      id: 'mark-reviewed',
      label: '確認済みにする',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'back-to-list',
      label: '一覧に戻る',
      actionType: 'navigate',
      targetScreen: typedScreenRef('history-list-screen'),
    },
  ],
  requiredPermissions: ['staff:history:read', 'staff:history:update'],
};
