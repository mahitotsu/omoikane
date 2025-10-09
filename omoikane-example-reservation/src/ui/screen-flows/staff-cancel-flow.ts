/**
 * スタッフ予約取消画面遷移フロー
 * 
 * 店舗スタッフによる予約取消の画面遷移を定義。
 * 一覧 → 取消確認 → 完了（一覧に戻る）の3ステップで構成。
 * 
 * 設計上の特徴:
 * - 一覧から直接取消フローへ
 * - 取消理由の必須記録
 * - 顧客への通知オプション
 * - 完了後は一覧に戻る
 * - 不可逆操作の警告
 * 
 * セキュリティ考慮:
 * - スタッフ権限の確認
 * - 取消理由の記録
 * - 操作ログの記録
 * - 二重確認
 * 
 * 関連ユースケース:
 * - reservation-staff-cancel: このフローの基となるユースケース
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef } from '../../typed-references.js';

export const staffCancelFlow: ScreenFlow = {
  id: 'staff-cancel-flow',
  name: 'スタッフ予約取消フロー',
  type: 'screen-flow',
  description: '店舗スタッフによる予約取消の画面遷移フロー。一覧→取消確認→完了（一覧）の3ステップ。不可逆操作。',
  
  screens: [
    typedScreenRef('staff-reservation-list-screen'),
    typedScreenRef('staff-cancel-confirm-screen'),
    typedScreenRef('staff-reservation-list-screen'),
  ],

  transitions: [
    {
      from: typedScreenRef('staff-reservation-list-screen'),
      to: typedScreenRef('staff-cancel-confirm-screen'),
      trigger: 'staff-cancel',
      condition: '取消可能な予約である',
    },
    {
      from: typedScreenRef('staff-cancel-confirm-screen'),
      to: typedScreenRef('staff-reservation-list-screen'),
      trigger: 'confirm-staff-cancel',
      condition: '取消理由が記録され、ユーザーが最終確認した',
    },
    {
      from: typedScreenRef('staff-cancel-confirm-screen'),
      to: typedScreenRef('staff-reservation-list-screen'),
      trigger: 'back-to-detail',
      condition: 'ユーザーが取消をキャンセルした',
    },
  ],

  startScreen: typedScreenRef('staff-reservation-list-screen'),
  endScreens: [typedScreenRef('staff-reservation-list-screen')],
  relatedUseCase: typedUseCaseRef('reservation-staff-cancel'),
};
