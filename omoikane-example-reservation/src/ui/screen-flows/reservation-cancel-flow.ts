/**
 * 予約取消画面遷移フロー
 *
 * 来店者による予約取消の画面遷移を定義。
 * 照会 → 詳細 → 取消確認 → 完了の4ステップで構成。
 *
 * 設計上の特徴:
 * - 照会画面で本人確認（予約番号+連絡先）
 * - 詳細画面から取消フローへ分岐
 * - 取消確認画面で最終確認（二重確認）
 * - 完了画面は終点（取消操作は不可逆）
 *
 * セキュリティ考慮:
 * - 各画面でセッション検証
 * - 予約番号と連絡先の一致確認
 * - キャンセル期限チェック
 * - 取消操作の監査ログ記録
 *
 * 関連ユースケース:
 * - reservation-cancel: このフローの基となるユースケース
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef } from '../../typed-references.js';

export const reservationCancelFlow: ScreenFlow = {
  id: 'reservation-cancel-flow',
  name: '予約取消フロー',
  type: 'screen-flow',
  description:
    '来店者による予約取消の画面遷移フロー。照会→詳細→取消確認→完了の4ステップ。取消は不可逆操作。',

  screens: [
    typedScreenRef('reservation-lookup-screen'),
    typedScreenRef('reservation-detail-screen'),
    typedScreenRef('reservation-cancel-confirm-screen'),
    typedScreenRef('reservation-cancel-complete-screen'),
  ],

  transitions: [
    {
      from: typedScreenRef('reservation-lookup-screen'),
      to: typedScreenRef('reservation-detail-screen'),
      trigger: 'lookup-reservation',
      condition: '予約番号と連絡先が一致した',
    },
    {
      from: typedScreenRef('reservation-detail-screen'),
      to: typedScreenRef('reservation-cancel-confirm-screen'),
      trigger: 'cancel-reservation',
      condition: 'キャンセル期限内である',
    },
    {
      from: typedScreenRef('reservation-cancel-confirm-screen'),
      to: typedScreenRef('reservation-cancel-complete-screen'),
      trigger: 'confirm-cancel',
      condition: 'ユーザーが最終確認した',
    },
    {
      from: typedScreenRef('reservation-cancel-confirm-screen'),
      to: typedScreenRef('reservation-detail-screen'),
      trigger: 'back-to-detail',
      condition: 'ユーザーが取消をキャンセルした',
    },
  ],

  startScreen: typedScreenRef('reservation-lookup-screen'),
  endScreens: [typedScreenRef('reservation-cancel-complete-screen')],
  relatedUseCase: typedUseCaseRef('reservation-cancel'),
};
