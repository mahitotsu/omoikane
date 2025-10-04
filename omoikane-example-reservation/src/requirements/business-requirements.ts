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
      description: '来店者が営業時間外でも予約内容の変更や取消を自己完結できるようにする',
    },
    {
      id: 'goal-admin-managed-accounts',
      description: 'システム管理者が適切な権限設定のもとでユーザーの登録・削除を行えるようにする',
    },
    {
      id: 'goal-accurate-capacity',
      description: '予約枠の確保（予約確定）と解放（予約取消）を適切に管理し過剰予約や空予約を防ぐ',
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
        description: 'スタッフが予約確定・取消の履歴や操作記録をレビューする業務',
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
      description: '予約枠の実利用率（確定予約数/利用可能枠数）および不要な枠確保発生率',
    },
    {
      id: 'metric-audit-confirmation-lag',
      description: '予約確定・取消履歴が確認済みになるまでの平均時間',
    },
    {
      id: 'metric-admin-access-readiness',
      description: '管理アカウントの登録・削除要求が完了するまでの平均リードタイム',
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
      description:
        '来店者による予約・変更・取消が可能なのは予約する日時の前日の営業時間終了までとする',
    },
    {
      id: 'constraint-staff-change-anytime-unless-checked-in',
      description:
        '店舗スタッフによる予約変更は来店確認済みでない限り営業時間に関係なくいつでも可能とする',
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
    {
      id: 'constraint-late-arrival-grace-period',
      description:
        '予約開始時刻から15分以内の遅刻は受付対象としそれ以降はスタッフ判断で枠を解放または再調整する',
    },
  ],
  securityPolicies: [
    {
      id: 'security-policy-self-service-contact-verification',
      description:
        'セルフサービス経路では予約番号と登録済み連絡先の照合を必須とし本人以外のアクセスを拒否する',
    },
    {
      id: 'security-policy-self-service-audit-log',
      description:
        'セルフサービスからの予約確定・変更・取消リクエストはすべて監査ログに記録し不正操作の追跡に備える',
    },
    {
      id: 'security-policy-staff-visibility-governance',
      description:
        '店舗スタッフの予約閲覧は担当店舗と権限レベルに基づき制御し必要最小限の個人情報のみを検索結果で表示する',
    },
    {
      id: 'security-policy-history-access-control',
      description:
        '予約の確定・取消履歴への閲覧および既読更新は権限を持つスタッフに限定し履歴データを署名付きで保全する',
    },
    {
      id: 'security-policy-history-audit-log',
      description: '履歴の閲覧・既読操作は担当者IDとともに監査ログへ記録し定期レビューを実施する',
    },
    {
      id: 'security-policy-staff-operation-audit',
      description:
        'スタッフによる予約変更・取消では担当者IDと理由の入力を必須とし変更前後の差分を履歴と監査ログに残す',
    },
    {
      id: 'security-policy-concurrency-control',
      description:
        'スタッフ操作で予約変更・取消を確定する際は最新ロック状態を再確認し競合検知時には処理を中断する',
    },
    {
      id: 'security-policy-slot-release-verification',
      description: '予約取消で解放された枠は確認済みフラグ付与前に外部システムへ連携しない',
    },
    {
      id: 'security-policy-staff-search-audit',
      description:
        '店舗スタッフによる予約検索は検索条件と結果閲覧の記録を監査ログに保持し定期的にレビューする',
    },
    {
      id: 'security-policy-account-admin-audit',
      description: 'システム管理者によるユーザー登録・削除操作はすべて監査ログに記録する',
    },
    {
      id: 'security-policy-least-privilege',
      description: 'ユーザーとロールの付与は最小権限の原則に従い不要な権限を発行しない',
    },
    {
      id: 'security-policy-account-deletion-approval',
      description: 'ユーザー削除前に影響範囲と承認状況を確認し必要な承認フローを完了させる',
    },
  ],
};
