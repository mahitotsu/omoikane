/**
 * Omoikane Example Reservation - 来店予約管理システム
 *
 * このファイルは本プロジェクトのエントリーポイントであり、
 * すべての要件定義要素（アクター、業務要件、ユースケース、UI定義）をエクスポートします。
 *
 * エクスポート順序:
 * 1. actors - 全ユースケースから参照される共通定義
 * 2. typed-references - 型安全な参照システム
 * 3. requirements - 業務要件とユースケース定義
 * 4. ui - 画面定義、バリデーションルール、画面遷移フロー
 */

export * from './actors.js';
export * from './typed-references.js';

export * from './requirements/account-administration.js';
export * from './requirements/business-requirements.js';
export * from './requirements/capacity-management.js';
export * from './requirements/reservation-booking.js';
export * from './requirements/reservation-cancel.js';
export * from './requirements/reservation-check-in.js';
export * from './requirements/reservation-history-review.js';
export * from './requirements/reservation-staff-cancel.js';
export * from './requirements/reservation-staff-change.js';
export * from './requirements/reservation-staff-search.js';
export * from './requirements/reservation-update.js';

export * from './ui/index.js';
