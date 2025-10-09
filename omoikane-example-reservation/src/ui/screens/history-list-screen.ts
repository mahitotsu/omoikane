/**
 * 予約履歴一覧画面
 */

import type { Screen } from 'omoikane-metamodel';
import { typedScreenRef } from '../../typed-references.js';

export const historyListScreen: Screen = {
  id: 'history-list-screen',
  name: '予約履歴一覧',
  type: 'screen',
  description: '未確認および確認済みの予約履歴を一覧表示し、既読状態の管理を行う画面',
  screenType: 'list',
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
      id: 'actionDateTime',
      name: 'actionDateTime',
      label: '操作日時',
      dataType: 'datetime',
    },
    {
      id: 'reviewStatus',
      name: 'reviewStatus',
      label: '確認状態',
      dataType: 'text',
    },
    {
      id: 'performedBy',
      name: 'performedBy',
      label: '実行者',
      dataType: 'text',
    },
  ],
  actions: [
    {
      id: 'view-detail',
      label: '詳細を見る',
      actionType: 'navigate',
      targetScreen: typedScreenRef('history-detail-screen'),
    },
    {
      id: 'mark-as-reviewed',
      label: '確認済みにする',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'refresh-list',
      label: '最新に更新',
      actionType: 'custom',
    },
  ],
  requiredPermissions: ['staff:history:read'],
};
