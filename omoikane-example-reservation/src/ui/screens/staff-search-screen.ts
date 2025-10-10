/**
 * スタッフ予約検索画面
 *
 * 店舗スタッフが予約を検索するための画面。
 * 複数の検索条件（日付、顧客名、電話番号、予約番号）をサポートします。
 *
 * 設計上の特徴:
 * - 複数検索条件の組み合わせ可能
 * - 日付範囲での検索
 * - 検索結果は一覧画面へ遷移
 * - 高度な検索機能（ステータス絞り込み）
 *
 * セキュリティ考慮:
 * - スタッフ認証済みであることが前提
 * - 検索結果の件数制限（パフォーマンス保護）
 *
 * 関連ユースケース:
 * - reservation-staff-search: スタッフ予約検索
 * - reservation-staff-change: 検索から変更へ
 * - reservation-staff-cancel: 検索から取消へ
 */

import type { Screen } from 'omoikane-metamodel';
import { typedValidationRuleRef } from '../../typed-references.js';

export const staffSearchScreen: Screen = {
  id: 'staff-search-screen',
  name: 'スタッフ予約検索画面',
  type: 'screen',
  description:
    '店舗スタッフが予約を検索する画面。日付、顧客名、電話番号、予約番号などの複数条件で検索できます。',
  screenType: 'form',

  inputFields: [
    {
      id: 'search-date-from',
      name: 'searchDateFrom',
      label: '予約日（開始）',
      fieldType: 'date',
      required: false,
      placeholder: '開始日を選択',
      helpText: '検索対象期間の開始日（省略可）',
    },
    {
      id: 'search-date-to',
      name: 'searchDateTo',
      label: '予約日（終了）',
      fieldType: 'date',
      required: false,
      placeholder: '終了日を選択',
      helpText: '検索対象期間の終了日（省略可）',
    },
    {
      id: 'search-customer-name',
      name: 'searchCustomerName',
      label: '顧客名',
      fieldType: 'text',
      required: false,
      placeholder: '山田',
      helpText: '部分一致で検索します',
    },
    {
      id: 'search-phone',
      name: 'searchPhone',
      label: '電話番号',
      fieldType: 'tel',
      required: false,
      placeholder: '03-1234-5678',
      helpText: 'ハイフンなしでも検索できます',
      validationRules: [typedValidationRuleRef('validation-phone-format')],
    },
    {
      id: 'search-reservation-number',
      name: 'searchReservationNumber',
      label: '予約番号',
      fieldType: 'text',
      required: false,
      placeholder: 'RES-20231015-0001',
      helpText: '完全一致で検索します',
      validationRules: [typedValidationRuleRef('validation-reservation-number-format')],
    },
    {
      id: 'search-status',
      name: 'searchStatus',
      label: 'ステータス',
      fieldType: 'select',
      required: false,
      placeholder: 'すべて',
      helpText: '特定のステータスで絞り込みます',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'confirmed', label: '予約確定' },
        { value: 'checked-in', label: '来店済み' },
        { value: 'cancelled', label: 'キャンセル済み' },
        { value: 'no-show', label: '無断キャンセル' },
      ],
    },
  ],

  actions: [
    {
      id: 'search-reservations',
      label: '検索する',
      actionType: 'submit',
      isPrimary: true,
    },
    {
      id: 'clear-search',
      label: 'クリア',
      actionType: 'custom',
      isPrimary: false,
    },
  ],

  requiredPermissions: ['staff.search-reservations'],
};
