/**
 * 予約取消完了画面
 * 
 * 予約が正常に取り消されたことを通知する画面。
 * 
 * 設計上の特徴:
 * - 取消完了メッセージの表示
 * - 取り消された予約内容のサマリー
 * - 確認メール送信の案内
 * - 次回予約への導線
 * 
 * 関連ユースケース:
 * - reservation-cancel: 予約取消の最終ステップ
 */

import type { Screen } from 'omoikane-metamodel';

export const reservationCancelCompleteScreen: Screen = {
  id: 'reservation-cancel-complete-screen',
  name: '予約取消完了画面',
  type: 'screen',
  description: '予約取消が正常に完了したことを通知する画面。取り消された予約内容を表示します。',
  screenType: 'detail',
  
  displayFields: [
    {
      id: 'success-message',
      name: 'successMessage',
      label: '',
      dataType: 'text',
      format: '予約を取り消しました',
    },
    {
      id: 'cancelled-reservation-number',
      name: 'reservationNumber',
      label: '取消した予約番号',
      dataType: 'text',
    },
    {
      id: 'cancelled-date',
      name: 'reservationDate',
      label: '予約日',
      dataType: 'date',
    },
    {
      id: 'cancelled-time',
      name: 'reservationTime',
      label: '予約時刻',
      dataType: 'text',
    },
    {
      id: 'cancelled-service',
      name: 'serviceMenu',
      label: '利用サービス',
      dataType: 'text',
    },
    {
      id: 'email-notification',
      name: 'emailNotification',
      label: '',
      dataType: 'text',
      format: 'キャンセル確認メールを送信しました。',
    },
    {
      id: 'thank-you-message',
      name: 'thankYouMessage',
      label: '',
      dataType: 'text',
      format: 'またのご利用をお待ちしております。',
    },
  ],

  actions: [
    {
      id: 'back-to-home',
      label: 'トップページに戻る',
      actionType: 'navigate',
      isPrimary: true,
    },
    {
      id: 'new-reservation',
      label: '新しい予約をする',
      actionType: 'navigate',
      isPrimary: false,
    },
  ],
};
