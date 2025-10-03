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
      description: '来店者が店舗の営業時間内で自ら予約を確定できるようにする',
    },
    {
      id: 'goal-flexible-adjustments',
      description: '予約内容の変更や取消をポリシーに沿って迅速に完結できるようにする',
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
    ],
    outOfScope: [
      {
        id: 'scope-automated-notifications',
        description: 'メールやアプリ通知などの自動送信機能',
      },
      {
        id: 'scope-payment-processing',
        description: '予約時の決済や返金処理',
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
      description: '予約枠を設計し供給量を調整する担当者',
    },
    {
      id: 'stakeholder-store-ops-manager',
      description: '店舗全体の運営と監査対応を統括する責任者',
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
      description: '予約枠のロックとリリースが適切に行われている比率',
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
      id: 'assumption-authenticated-staff',
      description: '店舗スタッフは管理コンソールへ認証済みである',
    },
  ],
  constraints: [
    {
      id: 'constraint-privacy-minimization',
      description: '予約情報は必要最小限の個人情報のみ保存する',
    },
    {
      id: 'constraint-operation-hours',
      description: '予約・変更・取消は定義された営業時間ポリシーに従う',
    },
    {
      id: 'constraint-log-retention',
      description: '予約操作ログは監査要件に従い一定期間保存する',
    },
  ],
};
