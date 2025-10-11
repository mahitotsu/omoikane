/**
 * スタッフ予約検索画面遷移フロー
 *
 * 店舗スタッフによる予約検索の画面遷移を定義。
 * 検索 → 一覧表示の2ステップで構成。
 *
 * 設計上の特徴:
 * - 複数検索条件のサポート
 * - 一覧から各種操作へ分岐可能
 * - 検索条件の保持（一覧から戻った時）
 *
 * セキュリティ考慮:
 * - スタッフ認証の確認
 * - 権限レベルのチェック
 *
 * 関連ユースケース:
 * - reservation-staff-search: このフローの基となるユースケース
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef, typedScreenActionRef } from '../../typed-references.js';
// typedScreenActionRef を追加しました

export const staffSearchFlow: ScreenFlow = {
  id: 'staff-search-flow',
  name: 'スタッフ予約検索フロー',
  type: 'screen-flow',
  description: '店舗スタッフによる予約検索の画面遷移フロー。検索→一覧表示の2ステップ。',
  transitions: [
    {
      from: typedScreenRef('staff-search-screen'),
      to: typedScreenRef('staff-reservation-list-screen'),
      trigger: typedScreenActionRef('staff-search-screen', 'search-reservations'),
      condition: '検索条件が有効である',
    },
    {
      from: typedScreenRef('staff-reservation-list-screen'),
      to: typedScreenRef('staff-search-screen'),
      trigger: typedScreenActionRef('staff-reservation-list-screen', 'back-to-search'),
      condition: 'ユーザーが検索条件を変更したい',
    },
  ],  relatedUseCase: typedUseCaseRef('reservation-staff-search'),
};
