/**
 * 来店予約管理システム - バリデーションルール定義
 * 
 * 予約システムで使用する各種バリデーションルールを定義します。
 * これらのルールは複数の画面で再利用されます。
 * 
 * カテゴリ:
 * - 基本入力検証: メール、電話番号、必須入力
 * - 日時検証: 未来日付、営業時間内、予約期限
 * - 予約固有検証: 重複予約、キャンセル期限
 * 
 * 注意:
 * - relatedBusinessRuleは業務要件定義でビジネスルールが定義された後に参照を追加します
 */

import type { ValidationRule } from 'omoikane-metamodel';
// import { businessRuleRef } from '../typed-references.js';

// ========================================
// 基本入力検証
// ========================================

/**
 * メールアドレス形式検証
 * 
 * 予約通知の送信先として使用されるため、正確な形式検証が必要。
 */
export const emailFormatValidation: ValidationRule = {
  id: 'validation-email-format',
  name: 'メールアドレス形式検証',
  type: 'validation-rule',
  description: '有効なメールアドレス形式であることを検証します。RFC 5322準拠の基本的なパターンマッチングを行います。',
  ruleType: 'email',
  errorMessage: '有効なメールアドレスを入力してください（例: example@example.com）',
  validateOn: ['blur', 'submit'],
};

/**
 * 電話番号形式検証
 * 
 * 日本国内の電話番号形式（ハイフンあり・なし両対応）。
 * 緊急時の連絡先として使用されます。
 */
export const phoneFormatValidation: ValidationRule = {
  id: 'validation-phone-format',
  name: '電話番号形式検証',
  type: 'validation-rule',
  description: '日本国内の電話番号形式を検証します。ハイフンあり（03-1234-5678）またはなし（09012345678）の両方に対応。',
  ruleType: 'tel',
  parameters: {
    pattern: '^(0\\d{1,4}-\\d{1,4}-\\d{4}|0\\d{9,10})$',
  },
  errorMessage: '有効な電話番号を入力してください（例: 03-1234-5678 または 09012345678）',
  validateOn: ['blur', 'submit'],
};

/**
 * 必須入力検証
 * 
 * 汎用的な必須入力チェック。
 * 各入力フィールドで個別にインスタンス化して使用。
 */
export const requiredFieldValidation: ValidationRule = {
  id: 'validation-required-field',
  name: '必須入力検証',
  type: 'validation-rule',
  description: 'フィールドが空でないことを検証します。空白文字のみの入力も不可とします。',
  ruleType: 'required',
  errorMessage: 'この項目は必須です',
  validateOn: ['blur', 'submit'],
};

/**
 * 名前の最小文字数検証
 */
export const nameMinLengthValidation: ValidationRule = {
  id: 'validation-name-min-length',
  name: '名前最小文字数検証',
  type: 'validation-rule',
  description: '名前が最低2文字以上であることを検証します。',
  ruleType: 'minLength',
  parameters: {
    length: 2,
  },
  errorMessage: '名前は2文字以上で入力してください',
  validateOn: ['blur', 'submit'],
};

// ========================================
// 日時検証
// ========================================

/**
 * 未来日付検証
 * 
 * 予約日は必ず未来の日付でなければならない。
 * 当日予約の可否はビジネスルールで別途制御。
 */
export const futureDateValidation: ValidationRule = {
  id: 'validation-future-date',
  name: '未来日付検証',
  type: 'validation-rule',
  description: '選択された日付が未来（本日以降）であることを検証します。過去日付の予約は不可。',
  ruleType: 'custom',
  parameters: {
    validationType: 'futureDate',
    allowToday: true, // 当日予約を許可するか（ビジネスルールと連動）
  },
  errorMessage: '予約日は本日以降の日付を選択してください',
  warningMessage: '当日予約は確定まで時間がかかる場合があります',
  // TODO: ビジネスルール定義後に追加
  // relatedBusinessRule: businessRuleRef('rule-advance-booking-limit'),
  requiresServerValidation: true, // サーバー側でもタイムゾーンを考慮して検証
  validateOn: ['change', 'submit'],
};

/**
 * 営業時間内検証
 * 
 * 選択された時刻が店舗の営業時間内であることを確認。
 * 営業時間はビジネスルールで定義される。
 */
export const businessHoursValidation: ValidationRule = {
  id: 'validation-business-hours',
  name: '営業時間内検証',
  type: 'validation-rule',
  description: '選択された時刻が店舗の営業時間内であることを検証します。営業時間は店舗設定に基づきます。',
  ruleType: 'businessRule',
  parameters: {
    businessHoursStart: '10:00',
    businessHoursEnd: '20:00',
  },
  errorMessage: '予約時刻は営業時間内（10:00〜20:00）を選択してください',
  // TODO: ビジネスルール定義後に追加
  // relatedBusinessRule: businessRuleRef('rule-business-hours'),
  requiresServerValidation: true,
  validateOn: ['change', 'submit'],
};

/**
 * 予約期限検証（事前予約制限）
 * 
 * 予約は最大N日先まで、最低M時間前までという制約。
 */
export const bookingWindowValidation: ValidationRule = {
  id: 'validation-booking-window',
  name: '予約期限検証',
  type: 'validation-rule',
  description: '予約可能な期間内（最大90日先まで、最低1時間前まで）であることを検証します。',
  ruleType: 'custom',
  parameters: {
    maxDaysAhead: 90,
    minHoursAhead: 1,
  },
  errorMessage: '予約は1時間後から90日先までの期間で選択してください',
  // TODO: ビジネスルール定義後に追加
  // relatedBusinessRule: businessRuleRef('rule-advance-booking-limit'),
  requiresServerValidation: true,
  validateOn: ['change', 'submit'],
};

// ========================================
// 予約固有検証
// ========================================

/**
 * 重複予約検証
 * 
 * 同一連絡先・同一日時での重複予約を防止。
 * サーバーサイドでの検証が必須。
 */
export const noDuplicateReservationValidation: ValidationRule = {
  id: 'validation-no-duplicate-reservation',
  name: '重複予約検証',
  type: 'validation-rule',
  description: '同一の連絡先（メールまたは電話）で同一日時の予約が既に存在しないことを検証します。',
  ruleType: 'businessRule',
  errorMessage: 'この日時には既に予約が存在します。別の日時を選択してください。',
  // TODO: ビジネスルール定義後に追加
  // relatedBusinessRule: businessRuleRef('rule-no-duplicate-reservation'),
  requiresServerValidation: true, // 必ずサーバー側で検証
  validateOn: ['submit'],
};

/**
 * 予約枠空き検証
 * 
 * 選択された日時に空き枠があることを確認。
 * リアルタイムでの空き状況確認が必要。
 */
export const slotAvailabilityValidation: ValidationRule = {
  id: 'validation-slot-availability',
  name: '予約枠空き検証',
  type: 'validation-rule',
  description: '選択された日時に予約可能な空き枠が存在することを検証します。',
  ruleType: 'custom',
  parameters: {
    checkRealtime: true,
  },
  errorMessage: '選択された日時は満席です。別の日時を選択してください。',
  // TODO: ビジネスルール定義後に追加
  // relatedBusinessRule: businessRuleRef('rule-capacity-limit'),
  requiresServerValidation: true,
  validateOn: ['change', 'submit'],
};

/**
 * キャンセル期限検証
 * 
 * 予約のキャンセルは指定時間前までという制約。
 * キャンセルユースケースで使用。
 */
export const cancellationDeadlineValidation: ValidationRule = {
  id: 'validation-cancellation-deadline',
  name: 'キャンセル期限検証',
  type: 'validation-rule',
  description: '予約のキャンセルが期限内（予約時刻の24時間前まで）であることを検証します。',
  ruleType: 'custom',
  parameters: {
    hoursBeforeReservation: 24,
  },
  errorMessage: 'キャンセルは予約時刻の24時間前までに行ってください。それ以降のキャンセルは店舗にお電話ください。',
  // TODO: ビジネスルール定義後に追加
  // relatedBusinessRule: businessRuleRef('rule-cancellation-deadline'),
  requiresServerValidation: true,
  validateOn: ['submit'],
};

/**
 * 予約番号形式検証
 * 
 * 予約番号が正しい形式（例: RES-20231015-0001）であることを確認。
 */
export const reservationNumberFormatValidation: ValidationRule = {
  id: 'validation-reservation-number-format',
  name: '予約番号形式検証',
  type: 'validation-rule',
  description: '予約番号が正しい形式（RES-YYYYMMDD-####）であることを検証します。',
  ruleType: 'pattern',
  parameters: {
    pattern: '^RES-\\d{8}-\\d{4}$',
  },
  errorMessage: '予約番号の形式が正しくありません（例: RES-20231015-0001）',
  validateOn: ['blur', 'submit'],
};

// ========================================
// エクスポート
// ========================================

/**
 * 全バリデーションルールの配列
 */
export const allValidationRules: ValidationRule[] = [
  // 基本入力検証
  emailFormatValidation,
  phoneFormatValidation,
  requiredFieldValidation,
  nameMinLengthValidation,
  
  // 日時検証
  futureDateValidation,
  businessHoursValidation,
  bookingWindowValidation,
  
  // 予約固有検証
  noDuplicateReservationValidation,
  slotAvailabilityValidation,
  cancellationDeadlineValidation,
  reservationNumberFormatValidation,
];
