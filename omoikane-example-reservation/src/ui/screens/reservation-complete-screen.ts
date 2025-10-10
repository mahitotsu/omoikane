/**
 * 予約完了画面
 *
 * 予約が正常に完了したことを通知し、予約番号を表示する画面。
 *
 * 設計上の特徴:
 * - 予約番号の表示（予約照会や変更時に必要）
 * - 確認メール送信の案内
 * - 次のアクションへの導線（トップに戻る、予約確認など）
 * - 予約内容のサマリー表示
 *
 * 関連ユースケース:
 * - reservation-booking: 予約登録の最終ステップ
 */

import type { Screen } from 'omoikane-metamodel';

export const reservationCompleteScreen: Screen = {
  id: 'reservation-complete-screen',
  name: '予約完了画面',
  type: 'screen',
  description:
    '予約が正常に完了したことを通知する画面。予約番号と予約内容のサマリーを表示し、確認メールの送信を案内します。',
  screenType: 'detail',

  displayFields: [
    {
      id: 'success-message',
      name: 'successMessage',
      label: '',
      dataType: 'text',
      format: 'ご予約が完了しました',
    },
    {
      id: 'reservation-number',
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
      id: 'complete-name',
      name: 'customerName',
      label: 'お名前',
      dataType: 'text',
    },
    {
      id: 'complete-email',
      name: 'customerEmail',
      label: 'メールアドレス',
      dataType: 'text',
    },
    {
      id: 'complete-phone',
      name: 'customerPhone',
      label: '電話番号',
      dataType: 'text',
    },
    {
      id: 'email-notification',
      name: 'emailNotification',
      label: '',
      dataType: 'text',
      format:
        'ご登録のメールアドレスに予約確認メールを送信しました。メールが届かない場合は、迷惑メールフォルダをご確認ください。',
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
      label: '予約内容を確認する',
      actionType: 'navigate',
      isPrimary: false,
    },
    {
      id: 'print-confirmation',
      label: '予約確認書を印刷',
      actionType: 'download',
      isPrimary: false,
    },
  ],
};
