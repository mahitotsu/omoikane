/**
 * スタッフ予約変更画面遷移フロー
 *
 * 店舗スタッフによる予約変更の画面遷移を定義。
 * 一覧 → 変更フォーム → 確認 → 完了（一覧に戻る）の4ステップで構成。
 *
 * 設計上の特徴:
 * - 一覧から直接変更フローへ
 * - 変更理由の必須記録
 * - 確認画面から変更フォームへの戻りを許可
 * - 完了後は一覧に戻る
 *
 * セキュリティ考慮:
 * - スタッフ権限の確認
 * - 変更理由の記録
 * - 操作ログの記録
 *
 * 関連ユースケース:
 * - reservation-staff-change: このフローの基となるユースケース
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef, typedScreenActionRef } from '../../typed-references.js';
// typedScreenActionRef を追加しました

export const staffChangeFlow: ScreenFlow = {
  id: 'staff-change-flow',
  name: 'スタッフ予約変更フロー',
  type: 'screen-flow',
  description:
    '店舗スタッフによる予約変更の画面遷移フロー。一覧→変更フォーム→確認→完了（一覧）の4ステップ。',
  transitions: [
    {
      from: typedScreenRef('staff-reservation-list-screen'),
      to: typedScreenRef('reservation-update-form-screen'),
      trigger: typedScreenActionRef('staff-reservation-list-screen', 'staff-change'),
      condition: '変更可能な予約である',
    },
    {
      from: typedScreenRef('reservation-update-form-screen'),
      to: typedScreenRef('staff-change-confirm-screen'),
      trigger: typedScreenActionRef('reservation-update-form-screen', 'submit-update'),
      condition: 'すべてのバリデーションが通過している',
    },
    {
      from: typedScreenRef('staff-change-confirm-screen'),
      to: typedScreenRef('staff-reservation-list-screen'),
      trigger: typedScreenActionRef('staff-change-confirm-screen', 'confirm-staff-change'),
      condition: '変更理由が記録され、変更後の予約枠が確保できた',
    },
    {
      from: typedScreenRef('staff-change-confirm-screen'),
      to: typedScreenRef('reservation-update-form-screen'),
      trigger: typedScreenActionRef('staff-change-confirm-screen', 'back-to-form'),
      condition: 'ユーザーが修正を希望した',
    },
  ],  relatedUseCase: typedUseCaseRef('reservation-staff-change'),
};
