/**
 * 予約変更完了画面
 *
 * 予約変更が正常に完了したことを通知する画面。
 *
 * 設計上の特徴:
 * - 変更完了メッセージの表示
 * - 変更後の予約内容サマリー
 * - 確認メール送信の案内
 *
 * 関連ユースケース:
 * - reservation-update: 予約変更の最終ステップ
 */

import type { Screen } from 'omoikane-metamodel';

export const reservationUpdateCompleteScreen: Screen = {
  id: 'reservation-update-complete-screen',
  name: '予約変更完了画面',
  type: 'screen',
  description: '予約変更が正常に完了したことを通知する画面。変更後の予約内容を表示します。',
  screenType: 'detail',

  displayFields: [
    {
      id: 'success-message',
      name: 'successMessage',
      label: '',
      dataType: 'text',
      format: '予約内容を変更しました',
    },
    {
      id: 'complete-reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'complete-date',
      name: 'reservationDate',
      label: '予約日',
      dataType: 'date',
    },
    {
      id: 'complete-time',
      name: 'reservationTime',
      label: '予約時刻',
      dataType: 'text',
    },
    {
      id: 'complete-service',
      name: 'serviceMenu',
      label: '利用サービス',
      dataType: 'text',
    },
    {
      id: 'complete-party-size',
      name: 'partySize',
      label: 'ご利用人数',
      dataType: 'number',
    },
    {
      id: 'email-notification',
      name: 'emailNotification',
      label: '',
      dataType: 'text',
      format: '変更内容の確認メールを送信しました。',
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
      id: 'view-reservation',
      label: '予約詳細を確認',
      actionType: 'navigate',
      isPrimary: false,
    },
  ],
};
