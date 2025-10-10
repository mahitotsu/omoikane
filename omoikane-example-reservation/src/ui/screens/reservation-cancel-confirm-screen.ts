/**
 * 予約取消確認画面
 *
 * 予約の取消を確認し、最終的に取消を実行する画面。
 * 取消は重要なアクションのため、確認メッセージを表示します。
 *
 * 設計上の特徴:
 * - 取消対象の予約内容を完全表示
 * - 取消の影響（返金ポリシー等）を明示
 * - 確認メッセージでの二重確認
 * - キャンセル期限のチェック
 *
 * セキュリティ考慮:
 * - キャンセル期限を過ぎている場合はエラー表示
 * - 取消操作の記録（監査ログ）
 *
 * 関連ユースケース:
 * - reservation-cancel: 予約取消のメインフロー
 */

import type { Screen } from 'omoikane-metamodel';

export const reservationCancelConfirmScreen: Screen = {
  id: 'reservation-cancel-confirm-screen',
  name: '予約取消確認画面',
  type: 'screen',
  description: '予約取消の確認画面。取消対象の予約内容を表示し、本当に取り消すかを確認します。',
  screenType: 'confirmation',

  displayFields: [
    {
      id: 'cancel-reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'cancel-date',
      name: 'reservationDate',
      label: '予約日',
      dataType: 'date',
    },
    {
      id: 'cancel-time',
      name: 'reservationTime',
      label: '予約時刻',
      dataType: 'text',
    },
    {
      id: 'cancel-service',
      name: 'serviceMenu',
      label: '利用サービス',
      dataType: 'text',
    },
    {
      id: 'cancel-party-size',
      name: 'partySize',
      label: 'ご利用人数',
      dataType: 'number',
    },
    {
      id: 'cancel-name',
      name: 'customerName',
      label: 'お名前',
      dataType: 'text',
    },
    {
      id: 'cancellation-policy',
      name: 'cancellationPolicy',
      label: 'キャンセルポリシー',
      dataType: 'text',
      format:
        '予約時刻の24時間前までのキャンセルは無料です。それ以降のキャンセルは店舗にお電話ください。',
    },
    {
      id: 'warning-message',
      name: 'warningMessage',
      label: '',
      dataType: 'text',
      format: '⚠️ この操作は取り消せません。本当にキャンセルしてもよろしいですか？',
    },
  ],

  actions: [
    {
      id: 'confirm-cancel',
      label: '予約を取り消す',
      actionType: 'submit',
      confirmationRequired: true,
      confirmationMessage: '予約を取り消してもよろしいですか？この操作は取り消せません。',
      isPrimary: true,
    },
    {
      id: 'back-to-detail',
      label: 'キャンセルしない',
      actionType: 'navigate',
      isPrimary: false,
    },
  ],
};
