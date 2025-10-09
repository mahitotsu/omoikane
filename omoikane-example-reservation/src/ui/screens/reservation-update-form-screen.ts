/**
 * 予約変更フォーム画面
 * 
 * 既存の予約内容を変更するためのフォーム画面。
 * 予約登録フォームと類似しているが、既存データが初期値として設定されます。
 * 
 * 設計上の特徴:
 * - 既存の予約内容がデフォルト値として表示
 * - 変更可能な項目: 日時、サービス、人数、特記事項
 * - 変更不可項目: 予約番号、連絡先（本人確認情報）
 * - 変更後は確認画面へ遷移
 * 
 * 関連ユースケース:
 * - reservation-update: 予約変更のメインフロー
 */

import type { Screen } from 'omoikane-metamodel';
import { typedValidationRuleRef } from '../../typed-references.js';

export const reservationUpdateFormScreen: Screen = {
  id: 'reservation-update-form-screen',
  name: '予約変更フォーム画面',
  type: 'screen',
  description: '既存予約の内容を変更するフォーム画面。日時、サービス、人数、特記事項を変更できます。',
  screenType: 'form',
  
  displayFields: [
    {
      id: 'current-reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      dataType: 'text',
    },
    {
      id: 'current-customer-name',
      name: 'customerName',
      label: 'お名前',
      dataType: 'text',
    },
  ],

  inputFields: [
    {
      id: 'new-reservation-date',
      name: 'reservationDate',
      label: '予約日',
      fieldType: 'date',
      required: true,
      placeholder: '日付を選択してください',
      helpText: '新しい予約日を選択してください（変更しない場合は現在の日付のまま）',
      validationRules: [
        typedValidationRuleRef('validation-future-date'),
        typedValidationRuleRef('validation-booking-window'),
      ],
    },
    {
      id: 'new-reservation-time',
      name: 'reservationTime',
      label: '予約時刻',
      fieldType: 'time',
      required: true,
      placeholder: '時刻を選択してください',
      helpText: '新しい予約時刻を選択してください',
      validationRules: [
        typedValidationRuleRef('validation-business-hours'),
        typedValidationRuleRef('validation-slot-availability'),
      ],
    },
    {
      id: 'new-service-menu',
      name: 'serviceMenu',
      label: '利用サービス',
      fieldType: 'select',
      required: true,
      placeholder: 'サービスを選択してください',
      helpText: '変更後のサービスを選択してください',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
      ],
    },
    {
      id: 'new-party-size',
      name: 'partySize',
      label: 'ご利用人数',
      fieldType: 'number',
      required: true,
      placeholder: '1',
      helpText: '変更後の人数を入力してください',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
        typedValidationRuleRef('validation-party-size-range'),
      ],
    },
    {
      id: 'new-special-request',
      name: 'specialRequest',
      label: '特記事項（任意）',
      fieldType: 'textarea',
      required: false,
      placeholder: 'ご要望やアレルギー情報などがあればご記入ください',
      helpText: '最大500文字まで入力できます',
    },
  ],

  actions: [
    {
      id: 'submit-update',
      label: '変更内容を確認する',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'cancel-update',
      label: 'キャンセル',
      actionType: 'cancel',
      isPrimary: false,
    },
  ],
};
