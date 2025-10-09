/**
 * スタッフ予約変更確認画面
 * 
 * スタッフによる予約変更内容を確認し、最終確定する画面。
 * 来店者向けの変更確認画面とほぼ同じだが、スタッフ権限で操作します。
 * 
 * 設計上の特徴:
 * - 変更前・変更後の比較表示
 * - 変更理由の記録（必須）
 * - 操作スタッフIDの記録
 * - 監査ログへの記録
 * 
 * セキュリティ考慮:
 * - スタッフ権限の確認
 * - 変更理由の必須入力
 * - 操作履歴の記録
 * 
 * 関連ユースケース:
 * - reservation-staff-change: スタッフによる予約変更
 */

import type { Screen } from 'omoikane-metamodel';
import { typedValidationRuleRef } from '../../typed-references.js';

export const staffChangeConfirmScreen: Screen = {
  id: 'staff-change-confirm-screen',
  name: 'スタッフ予約変更確認画面',
  type: 'screen',
  description: 'スタッフによる予約変更内容を確認し、最終確定する画面。変更理由を記録します。',
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
  ],

  inputFields: [
    {
      id: 'change-reason',
      name: 'changeReason',
      label: '変更理由（必須）',
      fieldType: 'textarea',
      required: true,
      placeholder: '顧客からの電話依頼、店舗都合など',
      helpText: '変更の理由を明確に記載してください（監査ログに記録されます）',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
      ],
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
      id: 'confirm-staff-change',
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

  requiredPermissions: ['staff.modify-reservations'],
};
