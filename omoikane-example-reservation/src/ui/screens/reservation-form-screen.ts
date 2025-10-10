/**
 * 来店予約フォーム画面
 *
 * 来店者が予約情報を入力する画面。
 * 日時選択、サービスメニュー選択、連絡先入力を含む。
 *
 * 設計上の特徴:
 * - リアルタイム枠空き状況確認（日時選択時）
 * - 段階的なバリデーション（blur時と最終submit時）
 * - 特記事項は任意入力（アレルギー情報など）
 *
 * 関連ユースケース:
 * - reservation-booking: このフォームは予約登録の最初のステップ
 */

import type { Screen } from 'omoikane-metamodel';
import { typedValidationRuleRef } from '../../typed-references.js';

export const reservationFormScreen: Screen = {
  id: 'reservation-form-screen',
  name: '予約フォーム画面',
  type: 'screen',
  description:
    '来店者が予約情報を入力するフォーム画面。日時、サービスメニュー、連絡先を入力し、空き状況をリアルタイムで確認しながら予約を進められます。',
  screenType: 'form',

  inputFields: [
    {
      id: 'reservation-date',
      name: 'reservationDate',
      label: '予約日',
      fieldType: 'date',
      required: true,
      placeholder: '日付を選択してください',
      helpText: '本日から最大30日後まで予約可能です',
      validationRules: [
        typedValidationRuleRef('validation-future-date'),
        typedValidationRuleRef('validation-booking-window'),
      ],
    },
    {
      id: 'reservation-time',
      name: 'reservationTime',
      label: '予約時刻',
      fieldType: 'time',
      required: true,
      placeholder: '時刻を選択してください',
      helpText: '営業時間内の時刻を選択してください',
      validationRules: [
        typedValidationRuleRef('validation-business-hours'),
        typedValidationRuleRef('validation-slot-availability'),
      ],
    },
    {
      id: 'service-menu',
      name: 'serviceMenu',
      label: '利用サービス',
      fieldType: 'select',
      required: true,
      placeholder: 'サービスを選択してください',
      helpText: 'ご利用されるサービスをお選びください',
      validationRules: [typedValidationRuleRef('validation-required-field')],
    },
    {
      id: 'party-size',
      name: 'partySize',
      label: 'ご利用人数',
      fieldType: 'number',
      required: true,
      placeholder: '1',
      helpText: '1名から予約可能です',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
        typedValidationRuleRef('validation-party-size-range'),
      ],
    },
    {
      id: 'customer-name',
      name: 'customerName',
      label: 'お名前',
      fieldType: 'text',
      required: true,
      placeholder: '山田 太郎',
      helpText: '姓名をスペースで区切って入力してください',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
        typedValidationRuleRef('validation-name-min-length'),
      ],
    },
    {
      id: 'customer-email',
      name: 'customerEmail',
      label: 'メールアドレス',
      fieldType: 'email',
      required: true,
      placeholder: 'example@example.com',
      helpText: '予約確認メールの送信先です',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
        typedValidationRuleRef('validation-email-format'),
      ],
    },
    {
      id: 'customer-phone',
      name: 'customerPhone',
      label: '電話番号',
      fieldType: 'tel',
      required: true,
      placeholder: '03-1234-5678',
      helpText: '当日の緊急連絡先として使用します',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
        typedValidationRuleRef('validation-phone-format'),
      ],
    },
    {
      id: 'special-request',
      name: 'specialRequest',
      label: '特記事項（任意）',
      fieldType: 'textarea',
      required: false,
      placeholder: 'ご要望やアレルギー情報などがあればご記入ください',
      helpText: '最大500文字まで入力できます',
    },
  ],

  displayFields: [
    {
      id: 'available-slots-info',
      name: 'availableSlotsInfo',
      label: '空き状況',
      dataType: 'text',
      format: '選択した日時の空き状況がここに表示されます',
    },
  ],

  actions: [
    {
      id: 'submit-reservation',
      label: '予約内容を確認する',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'cancel-input',
      label: 'キャンセル',
      actionType: 'cancel',
      isPrimary: false,
    },
  ],
};
