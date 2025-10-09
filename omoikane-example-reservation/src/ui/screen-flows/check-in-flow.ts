/**
 * チェックイン画面遷移フロー
 * 
 * 来店顧客のチェックイン処理の画面遷移を定義。
 * 一覧 → チェックインコンソール → 完了の3ステップで構成。
 * 
 * 設計上の特徴:
 * - 一覧からワンクリックでチェックイン開始
 * - 人数変更など柔軟な対応
 * - チェックイン完了後は一覧に戻る
 * 
 * セキュリティ考慮:
 * - スタッフ認証の確認
 * - 二重チェックイン防止
 * - チェックイン時刻の自動記録
 * 
 * 関連ユースケース:
 * - reservation-check-in: このフローの基となるユースケース
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef } from '../../typed-references.js';

export const checkInFlow: ScreenFlow = {
  id: 'check-in-flow',
  name: 'チェックインフロー',
  type: 'screen-flow',
  description: '来店顧客のチェックイン処理の画面遷移フロー。一覧→チェックインコンソール→完了の3ステップ。',
  
  screens: [
    typedScreenRef('staff-reservation-list-screen'),
    typedScreenRef('check-in-console-screen'),
    typedScreenRef('check-in-complete-screen'),
  ],

  transitions: [
    {
      from: typedScreenRef('staff-reservation-list-screen'),
      to: typedScreenRef('check-in-console-screen'),
      trigger: 'check-in',
      condition: '予約が確定状態である',
    },
    {
      from: typedScreenRef('check-in-console-screen'),
      to: typedScreenRef('check-in-complete-screen'),
      trigger: 'confirm-checkin',
      condition: 'チェックイン情報が有効である',
    },
    {
      from: typedScreenRef('check-in-console-screen'),
      to: typedScreenRef('staff-reservation-list-screen'),
      trigger: 'cancel-checkin',
      condition: 'ユーザーがキャンセルした',
    },
    {
      from: typedScreenRef('check-in-complete-screen'),
      to: typedScreenRef('staff-reservation-list-screen'),
      trigger: 'back-to-list',
      condition: '一覧に戻る',
    },
    {
      from: typedScreenRef('check-in-complete-screen'),
      to: typedScreenRef('check-in-console-screen'),
      trigger: 'next-checkin',
      condition: '次のチェックインを続ける',
    },
  ],

  startScreen: typedScreenRef('staff-reservation-list-screen'),
  endScreens: [
    typedScreenRef('check-in-complete-screen'),
    typedScreenRef('staff-reservation-list-screen'),
  ],
  relatedUseCase: typedUseCaseRef('reservation-check-in'),
};
