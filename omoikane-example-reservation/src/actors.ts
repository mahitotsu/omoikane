/**
 * 共有アクター定義
 * 各ユースケースからは typedActorRef('actor-id') で参照する
 */

import type { Actor } from 'omoikane-metamodel';

export const visitor: Actor = {
  id: 'visitor',
  type: 'actor',
  owner: 'customer-experience',
  name: '来店者',
  description: '店舗のサービスを利用するために予約を行う顧客',
  role: 'primary',
  responsibilities: [
    '希望日時の入力',
    '希望サービス内容の指定',
    '連絡手段の確認',
    '自身の予約情報の確認・変更・取消',
  ],
};

export const storeStaff: Actor = {
  id: 'store-staff',
  type: 'actor',
  owner: 'store-operations',
  name: '店舗スタッフ',
  description: '来店者の予約内容を確認し当日の受け入れ準備を整えるスタッフ',
  role: 'secondary',
  responsibilities: [
    '予約内容の確認',
    'スタッフアサイン',
    '全予約情報の照会と共有',
    'キャンセルリクエストに伴う準備調整',
    '予約確定・取消履歴の確認と確認状態の更新',
  ],
};

export const capacityPlanner: Actor = {
  id: 'capacity-planner',
  type: 'actor',
  owner: 'store-operations',
  name: 'キャパシティプランナー',
  description: '予約可能な枠を作成・整理する店舗運営担当者',
  role: 'primary',
  responsibilities: ['予約枠の新規登録', '不要になった枠の削除', '枠情報のメンテナンス'],
};

export const systemAdmin: Actor = {
  id: 'system-admin',
  type: 'actor',
  owner: 'system-operations',
  name: 'システム管理者',
  description: 'ユーザー登録・削除および権限設定を行う管理者',
  role: 'primary',
  responsibilities: [
    'ユーザーの登録・削除',
    '権限（ロール）の付与・変更',
    '監査やセキュリティ方針に基づく定期的なアカウント整備',
  ],
};
