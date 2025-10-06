/**
 * 共有アクター定義
 * 各ユースケースからは typedActorRef('actor-id') で参照する
 */

import type { Functional } from 'omoikane-metamodel';

type Actor = Functional.Actor;

export const visitor: Actor = {
  id: 'visitor',
  name: '来店者',
  description: '店舗のサービスを利用するために予約を行う顧客。営業時間外でも自ら予約の登録・変更・取消を実施でき、予約番号と連絡先で予約内容を照会できる。店舗への来店時にはチェックイン操作を行い、過去の予約履歴を確認することもできる。',
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
  name: '店舗スタッフ',
  description: '来店者の予約内容を確認し当日の受け入れ準備を整えるスタッフ。全予約情報を検索・閲覧でき、来店者からの変更・取消リクエストに対応する。予約確定・取消の履歴を確認し、未確認の操作を既読にする権限を持つ。店舗現場でのオペレーション効率化を担う。',
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
  name: 'キャパシティプランナー',
  description: '予約可能な枠を作成・整理する店舗運営担当者。営業日程と提供サービスに基づいて予約枠を新規登録し、不要になった枠を削除する。枠の稼働状況を把握し、適切な予約受付キャパシティを維持することで、過剰予約や空予約を防ぐ責任を持つ。',
  role: 'primary',
  responsibilities: ['予約枠の新規登録', '不要になった枠の削除', '枠情報のメンテナンス'],
};

export const systemAdmin: Actor = {
  id: 'system-admin',
  name: 'システム管理者',
  description: 'ユーザー登録・削除および権限設定を行う管理者。店舗スタッフやキャパシティプランナーなどのシステム利用者のアカウントを作成・管理し、各ユーザーに適切なロールを割り当てる。セキュリティポリシーと最小権限の原則に従い、システム全体のアクセス制御を維持する。',
  role: 'primary',
  responsibilities: [
    'ユーザーの登録・削除',
    '権限（ロール）の付与・変更',
    '監査やセキュリティ方針に基づく定期的なアカウント整備',
  ],
};
