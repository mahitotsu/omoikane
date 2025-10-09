/**
 * 予約照会画面
 * 
 * 来店者が既存の予約を検索・照会する画面。
 * 予約番号と連絡先（メールまたは電話）で本人確認を行います。
 * 
 * 設計上の特徴:
 * - 予約番号+連絡先による二要素認証
 * - 予約が見つかれば詳細画面へ遷移
 * - セキュリティ: ブルートフォース攻撃対策（試行回数制限）
 * 
 * 関連ユースケース:
 * - reservation-update: 予約変更の起点
 * - reservation-cancel: 予約取消の起点
 */

import type { Screen } from 'omoikane-metamodel';
import { typedValidationRuleRef } from '../../typed-references.js';

export const reservationLookupScreen: Screen = {
  id: 'reservation-lookup-screen',
  name: '予約照会画面',
  type: 'screen',
  description: '来店者が予約番号と連絡先を入力して既存予約を照会する画面。本人確認のため両方の入力が必要です。',
  screenType: 'form',
  
  inputFields: [
    {
      id: 'reservation-number',
      name: 'reservationNumber',
      label: '予約番号',
      fieldType: 'text',
      required: true,
      placeholder: 'RES-20231015-0001',
      helpText: '予約完了メールに記載されている予約番号を入力してください',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
        typedValidationRuleRef('validation-reservation-number-format'),
      ],
    },
    {
      id: 'contact-info',
      name: 'contactInfo',
      label: 'メールアドレスまたは電話番号',
      fieldType: 'text',
      required: true,
      placeholder: 'example@example.com または 03-1234-5678',
      helpText: '予約時に登録したメールアドレスまたは電話番号を入力してください',
      validationRules: [
        typedValidationRuleRef('validation-required-field'),
      ],
    },
  ],

  actions: [
    {
      id: 'lookup-reservation',
      label: '予約を照会する',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'back-to-home',
      label: '戻る',
      actionType: 'cancel',
      isPrimary: false,
    },
  ],
};
