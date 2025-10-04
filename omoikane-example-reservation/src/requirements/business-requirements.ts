/**
 * 来店予約管理システム - 業務要件定義
 */

import type { BusinessRequirementDefinition } from 'omoikane-metamodel';

export const reservationBusinessRequirements: BusinessRequirementDefinition = {
  id: 'reservation-business-requirements',
  type: 'business-requirement',
  owner: 'store-operations',
  title: '来店予約管理システム 業務要件定義',
  summary:
    '来店者のセルフサービスによる予約と、店舗スタッフによる対面業務を両立させ、履歴管理と監査性を確保する',
  businessGoals: [
    {
      id: 'goal-self-service-booking',
      description: '来店者が営業時間外でも自ら予約を確定できるようにする',
    },
    {
      id: 'goal-visitor-self-service-flexibility',
      description:
        '来店者が営業時間外でも予約内容の変更や取消を自己完結できるようにする',
    },
    {
      id: 'goal-admin-managed-accounts',
      description: 'システム管理者が適切な権限設定のもとでユーザーの登録・削除を行えるようにする',
    },
    {
      id: 'goal-accurate-capacity',
      description: '予約枠のロック・リリースを適切に管理し過剰予約や空予約を防ぐ',
    },
    {
      id: 'goal-auditable-operations',
      description: '全ての予約操作と履歴が追跡できる状態を維持する',
    },
    {
      id: 'goal-empower-store-staff',
      description: '店舗スタッフが現場で迅速に予約検索・変更・取消を行えるようにする',
    },
  ],
  scope: {
    inScope: [
      {
        id: 'scope-online-booking',
        description: '来店者が予約サイトから予約を新規登録する機能',
      },
      {
        id: 'scope-visitor-self-service-management',
        description: '来店者による予約内容の照会・変更・取消',
      },
      {
        id: 'scope-store-staff-console',
        description: '店舗スタッフが予約を検索し変更・取消できる業務画面',
      },
      {
        id: 'scope-capacity-planning',
        description: 'キャパシティプランナーが枠を登録・整理する業務',
      },
      {
        id: 'scope-visit-check-in',
        description: '来店時に予約状況を確認し対応を確定する手続き',
      },
      {
        id: 'scope-history-oversight',
        description: 'スタッフがロック・リリース履歴や操作記録をレビューする業務',
      },
      {
        id: 'scope-account-administration',
        description: 'システム管理者によるユーザー登録・削除と権限設定の管理',
      },
    ],
    outOfScope: [
      {
        id: 'scope-automated-notifications',
        description: 'メールやアプリ通知などの自動送信機能',
      },
      {
        id: 'scope-payment-processing',
        description: '予約時の決済や、取り消し時の返金',
      },
      {
        id: 'scope-loyalty-integration',
        description: 'ロイヤリティプログラムとの統合',
      },
    ],
  },
  stakeholders: [
    {
      id: 'stakeholder-visitor',
      description: 'サービスを利用する顧客',
    },
    {
      id: 'stakeholder-store-staff',
      description: '予約対応や当日運用を担う現場スタッフ',
    },
    {
      id: 'stakeholder-capacity-planner',
      description: '予約枠を設計する担当者',
    },
    {
      id: 'stakeholder-store-ops-manager',
      description: '店舗全体の運営と予約履歴・操作ログの監査確認を担う責任者',
    },
    {
      id: 'stakeholder-system-admin',
      description: 'ユーザーの登録・削除および権限設定を管理するシステム管理者',
    },
  ],
  successMetrics: [
    {
      id: 'metric-booking-completion-rate',
      description: '来店者が予約プロセスを完了できた割合',
    },
    {
      id: 'metric-manual-adjustment-time',
      description: '予約調整・取消にかかる平均処理時間',
    },
    {
      id: 'metric-slot-utilization',
      description: '予約枠の実利用率（確定予約数/利用可能枠数）および無駄ロック発生率',
    },
    {
      id: 'metric-audit-confirmation-lag',
      description: 'ロック・リリース履歴が確認済みになるまでの平均時間',
    },
  ],
  assumptions: [
    {
      id: 'assumption-manual-communications',
      description: '来店者との詳細調整は電話やメールなど手動で行う',
    },
    {
      id: 'assumption-single-location',
      description: '本例では単一店舗の予約のみを対象とする',
    },
    {
      id: 'assumption-staff-sign-in-required',
      description: '店舗スタッフとキャパシティプランナーはシステムへのサインインが必要である',
    },
  ],
  constraints: [
    {
      id: 'constraint-privacy-minimization',
      description: '予約情報は必要最小限の個人情報のみ保存する',
    },
    {
      id: 'constraint-operation-hours-visitor',
      description: '来店者による予約・変更・取消が可能なのは予約する日時の前日の営業時間終了までとする',
    },
    {
      id: 'constraint-staff-change-anytime-unless-checked-in',
      description: '店舗スタッフによる予約変更は来店確認済みでない限り営業時間に関係なくいつでも可能とする',
    },
    {
      id: 'constraint-log-retention',
      description: '予約操作ログは監査要件に従い一定期間保存する',
    },
    {
      id: 'constraint-no-double-booking',
      description: '同一時間枠での重複予約は技術的に防止する',
    },
    {
      id: 'constraint-visitor-own-reservation-only',
      description: '来店者は自分の予約のみアクセス可能とし他人の予約は閲覧・変更できない',
    },
  ],
};
