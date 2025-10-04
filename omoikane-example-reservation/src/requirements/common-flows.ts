/**
 * 共有代替フロー定義
 */

import { typedActorRef } from '../typed-references.js';

export const contactMismatchSteps = [
  {
    actor: typedActorRef('visitor'),
    action: '照合エラーを確認し入力内容を修正する',
    expectedResult: '誤った入力が明示され再入力が促される',
  },
  {
    actor: typedActorRef('store-staff'),
    action: '本人確認のため追加情報の提供を依頼する',
    expectedResult: '不正アクセスを防止したまま本人確認手続きが整う',
  },
] as const;

export const visitorOfflineNotificationSteps = [
  {
    actor: typedActorRef('store-staff'),
    action: '電話やメールなど外部手段での連絡計画をメモに記録する',
    expectedResult: '自動通知を送らずフォロー方法が共有される',
  },
] as const;

export const alreadyCheckedInSelfServiceSteps = [
  {
    actor: typedActorRef('visitor'),
    action: 'キャンセルや変更がオンラインでは行えない旨の案内を確認する',
    expectedResult: '来店済みで手続きできない理由と連絡方法が明示される',
  },
  {
    actor: typedActorRef('store-staff'),
    action: '状況を確認し必要に応じて返金やクレーム対応などのフォローを記録する',
    expectedResult: 'アフターケアのタスクと責任者が履歴に残る',
  },
] as const;

export const concurrentEditWarningSteps = [
  {
    actor: typedActorRef('store-staff'),
    action: '編集中である旨の警告を確認する',
    expectedResult: '同時編集を避けるため操作は中断される',
  },
] as const;

export const reservationLookupStep = {
  stepId: 'open-lookup',
  actor: typedActorRef('visitor'),
  action: '予約照会ページで予約番号と連絡先を入力し対象予約を表示する',
  expectedResult: '本人と一致する予約のみが照会される',
} as const;
