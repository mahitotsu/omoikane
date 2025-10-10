/**
 * スタッフ予約一覧画面
 *
 * 検索結果の予約一覧を表示する画面。
 * 各予約に対して詳細確認、変更、取消、チェックインの操作が可能です。
 *
 * 設計上の特徴:
 * - ページネーション対応（大量データ対応）
 * - ソート機能（日時、顧客名等）
 * - クイックアクション（一覧から直接操作）
 * - 色分け表示（ステータス別）
 *
 * セキュリティ考慮:
 * - スタッフ権限の確認
 * - 操作ログの記録
 *
 * 関連ユースケース:
 * - reservation-staff-search: 検索結果の表示
 * - reservation-staff-change: 一覧から変更
 * - reservation-staff-cancel: 一覧から取消
 * - reservation-check-in: 一覧からチェックイン
 */

import type { Screen } from 'omoikane-metamodel';

export const staffReservationListScreen: Screen = {
  id: 'staff-reservation-list-screen',
  name: 'スタッフ予約一覧画面',
  type: 'screen',
  description:
    '検索結果の予約一覧を表示し、各予約に対する操作（詳細、変更、取消、チェックイン）を提供します。',
  screenType: 'list',

  displayFields: [
    {
      id: 'list-reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'list-status',
      name: 'status',
      label: 'ステータス',
      dataType: 'text',
    },
    {
      id: 'list-date',
      name: 'reservationDate',
      label: '予約日',
      dataType: 'date',
      format: 'YYYY-MM-DD',
    },
    {
      id: 'list-time',
      name: 'reservationTime',
      label: '予約時刻',
      dataType: 'text',
    },
    {
      id: 'list-customer-name',
      name: 'customerName',
      label: '顧客名',
      dataType: 'text',
    },
    {
      id: 'list-phone',
      name: 'customerPhone',
      label: '電話番号',
      dataType: 'text',
    },
    {
      id: 'list-party-size',
      name: 'partySize',
      label: '人数',
      dataType: 'number',
    },
    {
      id: 'list-service',
      name: 'serviceMenu',
      label: 'サービス',
      dataType: 'text',
    },
  ],

  actions: [
    {
      id: 'view-detail',
      label: '詳細',
      actionType: 'navigate',
      isPrimary: false,
    },
    {
      id: 'check-in',
      label: 'チェックイン',
      actionType: 'custom',
      isPrimary: true,
    },
    {
      id: 'staff-change',
      label: '変更',
      actionType: 'navigate',
      isPrimary: false,
    },
    {
      id: 'staff-cancel',
      label: '取消',
      actionType: 'navigate',
      isPrimary: false,
    },
    {
      id: 'back-to-search',
      label: '検索に戻る',
      actionType: 'navigate',
      isPrimary: false,
    },
  ],

  requiredPermissions: ['staff.view-reservations'],
};
