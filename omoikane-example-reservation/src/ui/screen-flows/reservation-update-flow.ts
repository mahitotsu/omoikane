/**
 * 予約変更画面遷移フロー
 *
 * 来店者による予約変更の画面遷移を定義。
 * 照会 → 詳細 → 変更フォーム → 確認 → 完了の5ステップで構成。
 *
 * 設計上の特徴:
 * - 照会画面で本人確認（予約番号+連絡先）
 * - 詳細画面から変更フローへ分岐
 * - 確認画面から変更フォームへの戻りを許可
 * - 完了画面は終点
 *
 * セキュリティ考慮:
 * - 各画面でセッション検証
 * - 予約番号と連絡先の一致確認
 * - キャンセル期限チェック
 *
 * 関連ユースケース:
 * - reservation-update: このフローの基となるユースケース
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef, typedScreenActionRef } from '../../typed-references.js';
// typedScreenActionRef を追加しました

export const reservationUpdateFlow: ScreenFlow = {
  id: 'reservation-update-flow',
  name: '予約変更フロー',
  type: 'screen-flow',
  description:
    '来店者による予約変更の画面遷移フロー。照会→詳細→変更フォーム→確認→完了の5ステップ。',
  transitions: [
    {
      from: typedScreenRef('reservation-lookup-screen'),
      to: typedScreenRef('reservation-detail-screen'),
      trigger: typedScreenActionRef('reservation-lookup-screen', 'lookup-reservation'),
      condition: '予約番号と連絡先が一致した',
    },
    {
      from: typedScreenRef('reservation-detail-screen'),
      to: typedScreenRef('reservation-update-form-screen'),
      trigger: typedScreenActionRef('reservation-detail-screen', 'update-reservation'),
      condition: 'キャンセル期限内である',
    },
    {
      from: typedScreenRef('reservation-update-form-screen'),
      to: typedScreenRef('reservation-update-confirm-screen'),
      trigger: typedScreenActionRef('reservation-update-form-screen', 'submit-update'),
      condition: 'すべてのバリデーションが通過している',
    },
    {
      from: typedScreenRef('reservation-update-confirm-screen'),
      to: typedScreenRef('reservation-update-complete-screen'),
      trigger: typedScreenActionRef('reservation-update-confirm-screen', 'confirm-update'),
      condition: '変更後の予約枠が確保できた',
    },
    {
      from: typedScreenRef('reservation-update-confirm-screen'),
      to: typedScreenRef('reservation-update-form-screen'),
      trigger: typedScreenActionRef('reservation-update-confirm-screen', 'back-to-form'),
      condition: 'ユーザーが修正を希望した',
    },
    {
      from: typedScreenRef('reservation-update-confirm-screen'),
      to: typedScreenRef('reservation-update-form-screen'),
      trigger: typedScreenActionRef('reservation-update-confirm-screen', 'no-available-slots'),
      condition: '変更後の予約枠がなくなった',
    },
  ],  relatedUseCase: typedUseCaseRef('reservation-update'),
};
