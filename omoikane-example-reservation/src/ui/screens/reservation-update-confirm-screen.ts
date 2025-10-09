/**
 * 予約変更確認画面
 * 
 * 変更内容を確認し、最終的に変更を確定する画面。
 * 変更前と変更後の内容を並べて表示します。
 * 
 * 設計上の特徴:
 * - 変更前・変更後の比較表示
 * - 戻るボタンで再編集可能
 * - 確定ボタンで変更実行
 * 
 * 関連ユースケース:
 * - reservation-update: 予約変更の確認ステップ
 */

import type { Screen } from 'omoikane-metamodel';

export const reservationUpdateConfirmScreen: Screen = {
  id: 'reservation-update-confirm-screen',
  name: '予約変更確認画面',
  type: 'screen',
  description: '予約の変更内容を確認し、最終確定を行う画面。変更前と変更後の内容を比較表示します。',
  screenType: 'confirmation',
  
  displayFields: [
    {
      id: 'confirm-reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'before-date',
      name: 'beforeDate',
      label: '変更前の予約日',
      dataType: 'date',
    },
    {
      id: 'after-date',
      name: 'afterDate',
      label: '変更後の予約日',
      dataType: 'date',
    },
    {
      id: 'before-time',
      name: 'beforeTime',
      label: '変更前の予約時刻',
      dataType: 'text',
    },
    {
      id: 'after-time',
      name: 'afterTime',
      label: '変更後の予約時刻',
      dataType: 'text',
    },
    {
      id: 'before-service',
      name: 'beforeService',
      label: '変更前のサービス',
      dataType: 'text',
    },
    {
      id: 'after-service',
      name: 'afterService',
      label: '変更後のサービス',
      dataType: 'text',
    },
    {
      id: 'before-party-size',
      name: 'beforePartySize',
      label: '変更前の人数',
      dataType: 'number',
    },
    {
      id: 'after-party-size',
      name: 'afterPartySize',
      label: '変更後の人数',
      dataType: 'number',
    },
    {
      id: 'after-special-request',
      name: 'afterSpecialRequest',
      label: '特記事項',
      dataType: 'text',
    },
  ],

  actions: [
    {
      id: 'confirm-update',
      label: 'この内容で変更する',
      actionType: 'submit',
      confirmationRequired: true,
      confirmationMessage: '予約内容を変更してもよろしいですか？',
      isPrimary: true,
    },
    {
      id: 'back-to-form',
      label: '修正する',
      actionType: 'navigate',
      isPrimary: false,
    },
  ],
};
