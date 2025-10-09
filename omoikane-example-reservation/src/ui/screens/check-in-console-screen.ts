/**
 * チェックインコンソール画面
 * 
 * 来店した顧客のチェックイン処理を行う画面。
 * 予約状態を「来店済み」に更新します。
 * 
 * 設計上の特徴:
 * - 予約内容の確認表示
 * - チェックイン時刻の自動記録
 * - 特記事項の確認（アレルギー情報等）
 * - 人数変更の対応
 * 
 * セキュリティ考慮:
 * - スタッフ権限の確認
 * - チェックイン操作ログの記録
 * - 二重チェックイン防止
 * 
 * 関連ユースケース:
 * - reservation-check-in: チェックインのメインフロー
 */

import type { Screen } from 'omoikane-metamodel';

export const checkInConsoleScreen: Screen = {
  id: 'check-in-console-screen',
  name: 'チェックインコンソール画面',
  type: 'screen',
  description: '来店した顧客のチェックイン処理を行う画面。予約状態を来店済みに更新します。',
  screenType: 'form',
  
  displayFields: [
    {
      id: 'checkin-reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'checkin-customer-name',
      name: 'customerName',
      label: '顧客名',
      dataType: 'text',
    },
    {
      id: 'checkin-date',
      name: 'reservationDate',
      label: '予約日',
      dataType: 'date',
    },
    {
      id: 'checkin-time',
      name: 'reservationTime',
      label: '予約時刻',
      dataType: 'text',
    },
    {
      id: 'checkin-service',
      name: 'serviceMenu',
      label: '利用サービス',
      dataType: 'text',
    },
    {
      id: 'checkin-reserved-party-size',
      name: 'reservedPartySize',
      label: '予約人数',
      dataType: 'number',
    },
    {
      id: 'checkin-special-request',
      name: 'specialRequest',
      label: '特記事項',
      dataType: 'text',
    },
    {
      id: 'checkin-time-display',
      name: 'checkInTime',
      label: 'チェックイン時刻',
      dataType: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],

  inputFields: [
    {
      id: 'actual-party-size',
      name: 'actualPartySize',
      label: '実際の来店人数',
      fieldType: 'number',
      required: true,
      placeholder: '1',
      helpText: '予約人数と異なる場合は実際の人数を入力してください',
    },
    {
      id: 'checkin-note',
      name: 'checkInNote',
      label: '備考（任意）',
      fieldType: 'textarea',
      required: false,
      placeholder: '席の変更、追加注文など',
      helpText: 'チェックイン時の特記事項があれば記入してください',
    },
  ],

  actions: [
    {
      id: 'confirm-checkin',
      label: 'チェックインする',
      actionType: 'submit',
      confirmationRequired: true,
      confirmationMessage: 'この予約をチェックインしてもよろしいですか？',
      isPrimary: true,
    },
    {
      id: 'cancel-checkin',
      label: 'キャンセル',
      actionType: 'cancel',
      isPrimary: false,
    },
  ],

  requiredPermissions: ['staff.check-in-reservations'],
};
