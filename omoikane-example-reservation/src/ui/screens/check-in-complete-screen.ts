/**
 * チェックイン完了画面
 * 
 * チェックイン処理が正常に完了したことを通知する画面。
 * 
 * 設計上の特徴:
 * - チェックイン完了メッセージ
 * - チェックイン時刻の表示
 * - 実際の来店人数の記録
 * - 次の予約への導線
 * 
 * 関連ユースケース:
 * - reservation-check-in: チェックインの最終ステップ
 */

import type { Screen } from 'omoikane-metamodel';

export const checkInCompleteScreen: Screen = {
  id: 'check-in-complete-screen',
  name: 'チェックイン完了画面',
  type: 'screen',
  description: 'チェックイン処理が正常に完了したことを通知する画面。チェックイン時刻と実際の人数を表示します。',
  screenType: 'detail',
  
  displayFields: [
    {
      id: 'success-message',
      name: 'successMessage',
      label: '',
      dataType: 'text',
      format: 'チェックインが完了しました',
    },
    {
      id: 'complete-reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'complete-customer-name',
      name: 'customerName',
      label: '顧客名',
      dataType: 'text',
    },
    {
      id: 'complete-checkin-time',
      name: 'checkInTime',
      label: 'チェックイン時刻',
      dataType: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      id: 'complete-actual-party-size',
      name: 'actualPartySize',
      label: '来店人数',
      dataType: 'number',
    },
    {
      id: 'complete-service',
      name: 'serviceMenu',
      label: '利用サービス',
      dataType: 'text',
    },
    {
      id: 'complete-special-request',
      name: 'specialRequest',
      label: '特記事項',
      dataType: 'text',
    },
  ],

  actions: [
    {
      id: 'back-to-list',
      label: '予約一覧に戻る',
      actionType: 'navigate',
      isPrimary: true,
    },
    {
      id: 'next-checkin',
      label: '次のチェックイン',
      actionType: 'navigate',
      isPrimary: false,
    },
  ],

  requiredPermissions: ['staff.view-reservations'],
};
