/**
 * 予約登録画面遷移フロー
 *
 * 来店者による予約登録の画面遷移を定義。
 * フォーム入力 → 確認 → 完了の3ステップで構成。
 *
 * 設計上の特徴:
 * - 確認画面から入力画面への戻りを許可（修正可能）
 * - 予約枠なしの場合は入力画面に戻る（代替フロー対応）
 * - 完了画面は終点（戻れない）
 *
 * セキュリティ考慮:
 * - 各遷移でセッション検証
 * - CSRF対策トークンの検証
 *
 * 関連ユースケース:
 * - reservation-booking: このフローの基となるユースケース
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef, typedScreenActionRef } from '../../typed-references.js';
// typedScreenActionRef を追加しました

export const reservationBookingFlow: ScreenFlow = {
  id: 'reservation-booking-flow',
  name: '予約登録フロー',
  type: 'screen-flow',
  description:
    '来店者による予約登録の画面遷移フロー。入力→確認→完了の3ステップで、確認画面からは入力画面への戻りも可能。',

  screens: [
    typedScreenRef('reservation-form-screen'),
    typedScreenRef('reservation-confirm-screen'),
    typedScreenRef('reservation-complete-screen'),
  ],

  transitions: [
    {
      from: typedScreenRef('reservation-form-screen'),
      to: typedScreenRef('reservation-confirm-screen'),
      trigger: typedScreenActionRef('reservation-form-screen', 'submit-reservation'),
      condition: 'すべての入力バリデーションが通過している',
    },
    {
      from: typedScreenRef('reservation-confirm-screen'),
      to: typedScreenRef('reservation-complete-screen'),
      trigger: typedScreenActionRef('reservation-confirm-screen', 'confirm-booking'),
      condition: '予約枠が確保でき、予約番号が生成された',
    },
    {
      from: typedScreenRef('reservation-confirm-screen'),
      to: typedScreenRef('reservation-form-screen'),
      trigger: typedScreenActionRef('reservation-confirm-screen', 'back-to-form'),
      condition: 'ユーザーが修正を希望した',
    },
    {
      from: typedScreenRef('reservation-confirm-screen'),
      to: typedScreenRef('reservation-form-screen'),
      trigger: typedScreenActionRef('reservation-confirm-screen', 'no-available-slots'),
      condition: '予約枠がなくなった（他のユーザーが先に予約した）',
    },
  ],

  startScreen: typedScreenRef('reservation-form-screen'),
  endScreens: [typedScreenRef('reservation-complete-screen')],
  relatedUseCase: typedUseCaseRef('reservation-booking'),
};
