/**
 * 予約確認画面
 *
 * 入力された予約情報を確認し、最終確定する画面。
 *
 * 設計上の特徴:
 * - 入力内容の表示のみ（編集不可）
 * - 戻るボタンで修正可能
 * - 確定ボタン押下で予約確定処理を実行
 * - 予約番号の自動生成はこのステップで実施
 *
 * 関連ユースケース:
 * - reservation-booking: 予約登録の確認ステップ
 */

import type { Screen } from 'omoikane-metamodel';

export const reservationConfirmScreen: Screen = {
  id: 'reservation-confirm-screen',
  name: '予約確認画面',
  type: 'screen',
  description:
    '来店者が入力した予約情報を確認し、最終確定を行う画面。入力内容が正確であることを確認した上で予約を確定します。',
  screenType: 'confirmation',

  displayFields: [
    {
      id: 'confirm-date',
      name: 'reservationDate',
      label: '予約日',
      dataType: 'date',
    },
    {
      id: 'confirm-time',
      name: 'reservationTime',
      label: '予約時刻',
      dataType: 'text',
    },
    {
      id: 'confirm-service',
      name: 'serviceMenu',
      label: '利用サービス',
      dataType: 'text',
    },
    {
      id: 'confirm-party-size',
      name: 'partySize',
      label: 'ご利用人数',
      dataType: 'number',
    },
    {
      id: 'confirm-name',
      name: 'customerName',
      label: 'お名前',
      dataType: 'text',
    },
    {
      id: 'confirm-email',
      name: 'customerEmail',
      label: 'メールアドレス',
      dataType: 'text',
    },
    {
      id: 'confirm-phone',
      name: 'customerPhone',
      label: '電話番号',
      dataType: 'text',
    },
    {
      id: 'confirm-special-request',
      name: 'specialRequest',
      label: '特記事項',
      dataType: 'text',
    },
  ],

  actions: [
    {
      id: 'confirm-booking',
      label: 'この内容で予約する',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'back-to-form',
      label: '修正する',
      actionType: 'navigate',
      isPrimary: false,
    },
    {
      id: 'no-available-slots',
      label: '予約枠なし',
      actionType: 'custom',
    },
  ],
};
