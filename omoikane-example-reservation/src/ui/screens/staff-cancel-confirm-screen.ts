/**
 * スタッフ予約取消確認画面
 * 
 * スタッフによる予約取消を確認し、最終実行する画面。
 * 来店者向けの取消確認画面とほぼ同じだが、スタッフ権限で操作します。
 * 
 * 設計上の特徴:
 * - 取消対象の予約内容表示
 * - 取消理由の記録（必須）
 * - 操作スタッフIDの記録
 * - 監査ログへの記録
 * - 顧客への通知オプション
 * 
 * セキュリティ考慮:
 * - スタッフ権限の確認
 * - 取消理由の必須入力
 * - 操作履歴の記録
 * - 不可逆操作の警告
 * 
 * 関連ユースケース:
 * - reservation-staff-cancel: スタッフによる予約取消
 */

import type { Screen } from 'omoikane-metamodel';
import { typedValidationRuleRef } from '../../typed-references.js';

export const staffCancelConfirmScreen: Screen = {
  id: 'staff-cancel-confirm-screen',
  name: 'スタッフ予約取消確認画面',
  type: 'screen',
  description: 'スタッフによる予約取消を確認し、最終実行する画面。取消理由を記録します。',
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
      label: '顧客名',
      dataType: 'text',
    },
    {
      id: 'cancel-phone',
      name: 'customerPhone',
      label: '電話番号',
      dataType: 'text',
    },
    {
      id: 'warning-message',
      name: 'warningMessage',
      label: '',
      dataType: 'text',
      format: '⚠️ この操作は取り消せません。本当にキャンセルしてもよろしいですか？',
    },
  ],

  inputFields: [
    {
      id: 'cancel-reason',
      name: 'cancelReason',
      label: '取消理由（必須）',
      fieldType: 'textarea',
      required: true,
      placeholder: '顧客からの電話依頼、店舗都合、無断キャンセルなど',
      helpText: '取消の理由を明確に記載してください（監査ログに記録されます）',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
      ],
    },
    {
      id: 'notify-customer',
      name: 'notifyCustomer',
      label: '顧客に通知する',
      fieldType: 'checkbox',
      required: false,
      defaultValue: 'true',
      helpText: 'チェックすると顧客にキャンセル通知メールを送信します',
    },
    {
      id: 'staff-note',
      name: 'staffNote',
      label: '備考（任意）',
      fieldType: 'textarea',
      required: false,
      placeholder: '追加の注意事項など',
    },
  ],

  actions: [
    {
      id: 'confirm-staff-cancel',
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

  requiredPermissions: ['staff.cancel-reservations'],
};
