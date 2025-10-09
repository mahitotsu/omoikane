/**
 * 予約詳細画面
 * 
 * 照会された予約の詳細情報を表示し、変更・取消のアクションを提供する画面。
 * 
 * 設計上の特徴:
 * - 予約内容の完全な表示（読み取り専用）
 * - 変更・取消ボタンからそれぞれのフローへ遷移
 * - キャンセル期限の表示と判定
 * 
 * 関連ユースケース:
 * - reservation-update: 「予約を変更する」ボタンから遷移
 * - reservation-cancel: 「予約を取り消す」ボタンから遷移
 */

import type { Screen } from 'omoikane-metamodel';

export const reservationDetailScreen: Screen = {
  id: 'reservation-detail-screen',
  name: '予約詳細画面',
  type: 'screen',
  description: '照会された予約の詳細情報を表示し、変更・取消の操作を提供する画面。',
  screenType: 'detail',
  
  displayFields: [
    {
      id: 'detail-reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'detail-status',
      name: 'status',
      label: '予約状態',
      dataType: 'text',
    },
    {
      id: 'detail-date',
      name: 'reservationDate',
      label: '予約日',
      dataType: 'date',
    },
    {
      id: 'detail-time',
      name: 'reservationTime',
      label: '予約時刻',
      dataType: 'text',
    },
    {
      id: 'detail-service',
      name: 'serviceMenu',
      label: '利用サービス',
      dataType: 'text',
    },
    {
      id: 'detail-party-size',
      name: 'partySize',
      label: 'ご利用人数',
      dataType: 'number',
    },
    {
      id: 'detail-name',
      name: 'customerName',
      label: 'お名前',
      dataType: 'text',
    },
    {
      id: 'detail-email',
      name: 'customerEmail',
      label: 'メールアドレス',
      dataType: 'text',
    },
    {
      id: 'detail-phone',
      name: 'customerPhone',
      label: '電話番号',
      dataType: 'text',
    },
    {
      id: 'detail-special-request',
      name: 'specialRequest',
      label: '特記事項',
      dataType: 'text',
    },
    {
      id: 'detail-cancellation-deadline',
      name: 'cancellationDeadline',
      label: 'キャンセル期限',
      dataType: 'datetime',
      format: 'YYYY-MM-DD HH:mm',
    },
  ],

  actions: [
    {
      id: 'update-reservation',
      label: '予約を変更する',
      actionType: 'navigate',
      isPrimary: true,
    },
    {
      id: 'cancel-reservation',
      label: '予約を取り消す',
      actionType: 'navigate',
      isPrimary: false,
    },
    {
      id: 'back-to-lookup',
      label: '戻る',
      actionType: 'navigate',
      isPrimary: false,
    },
  ],
};
