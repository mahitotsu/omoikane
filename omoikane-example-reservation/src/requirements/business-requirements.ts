/**
 * 来店予約管理システム - 業務要件定義
 *
 * 本システムの全体的な業務要件を定義します。
 * すべてのユースケースは businessRequirementCoverage を通じて
 * この業務要件定義とトレーサビリティを確保します。
 *
 * 構成要素:
 * - businessGoals: ビジネス目標
 * - scopeItems: スコープ項目
 * - stakeholders: ステークホルダー
 * - successMetrics: 成功指標
 * - assumptions: 前提条件
 * - constraints: 制約条件
 * - securityPolicies: セキュリティポリシー
 * - businessRules: ビジネスルール
 */

import type { Business } from 'omoikane-metamodel';

type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;

export const reservationBusinessRequirements: BusinessRequirementDefinition = {
  id: 'reservation-business-requirements',
  name: '来店予約管理システム 業務要件定義',
  title: '来店予約管理システム 業務要件定義',
  type: 'business-requirement',
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
      description: '全ての予約操作と履歴を追跡できる状態を維持する',
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
        id: 'scope-business-day-configuration',
        description: '曜日または日付指定で営業日／非営業日を設定する機能',
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
        description: '予約時の決済や取消時の返金処理',
      },
      {
        id: 'scope-loyalty-integration',
        description: 'ロイヤリティプログラムとの連携機能',
      },
      {
        id: 'scope-offline-approval-management',
        description: '店舗スタッフと責任者間の承認ワークフロー（システム外で実施）',
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
      description: '店舗スタッフとキャパシティプランナーはシステムへのサインインが必要とする',
    },
    {
      id: 'assumption-standard-business-hours',
      description:
        '店舗の基本営業時間は平日（月〜金）の9:00〜18:00とし「前営業日の営業時間終了」は営業日の前日18:00を指す',
    },
    {
      id: 'assumption-holiday-manual-registration',
      description: '祝日は自動設定されずキャパシティプランナーが営業日／非営業日を手動登録する',
    },
    {
      id: 'assumption-slot-interval-1-hour',
      description: '予約枠は1時間単位で設定され開始時刻は1時間刻みとする',
    },
    {
      id: 'assumption-slot-capacity-single',
      description:
        '各予約枠の受入上限は1組を基本としキャパシティプランナーが事前に上限値を設定する',
    },
  ],
  constraints: [
    {
      id: 'constraint-privacy-minimization',
      description: '予約情報は必要最小限の個人情報のみを保存する',
    },
    {
      id: 'constraint-operation-hours-visitor',
      description: '来店者による予約・変更・取消は予約日時の前営業日の営業時間終了までに限定する',
    },
    {
      id: 'constraint-staff-change-anytime-unless-checked-in',
      description: '店舗スタッフによる予約変更は来店確認済みでない限り営業時間外でも可能とする',
    },
    {
      id: 'constraint-log-retention',
      description:
        '予約操作ログと履歴は記録日時から1年間（翌年同日・同時刻まで）保存し保管期限後に削除する',
    },
    {
      id: 'constraint-no-double-booking',
      description: '同一時間枠での重複予約を技術的に防止する',
    },
    {
      id: 'constraint-visitor-own-reservation-only',
      description: '来店者は自分の予約のみアクセス可能とし他人の予約を閲覧・変更できないようにする',
    },
    {
      id: 'constraint-late-arrival-grace-period',
      description:
        '予約開始時刻から15分以内の遅刻は受付対象としそれ以降はスタッフ判断で枠を解放または再調整する',
    },
  ],
  businessRules: [
    {
      id: 'business-rule-history-review-governance',
      category: 'process',
      description: '履歴の確認・既読化は予約履歴確認ユースケースで実施する',
    },
    {
      id: 'business-rule-manual-notification',
      category: 'communication',
      description: '来店者への通知は自動送信せず、必要に応じて手動連絡手順に従う',
    },
    {
      id: 'business-rule-visitor-single-reservation',
      category: 'scope',
      description:
        '予約は来店者本人1名分のみを対象とし来店者は自分が作成した予約のみ確認・変更できる',
    },
    {
      id: 'business-rule-reservation-number-display-once',
      category: 'process',
      description: '予約番号は予約完了画面にのみ表示され来店者が控えることを前提とする',
    },
    {
      id: 'business-rule-record-all-reservation-actions',
      category: 'audit',
      description:
        '予約の確定・変更・取消操作は履歴に記録され履歴確認ユースケースで確認未済／済の状態を更新する',
    },
    {
      id: 'business-rule-history-review-status',
      category: 'audit',
      description: '履歴には確認未済／済の状態が付与され店舗スタッフが更新を把握できる',
    },
    {
      id: 'business-rule-visitor-cutoff',
      category: 'process',
      description:
        '来店者によるオンライン予約・変更・取消は利用予定日時の前営業日の営業時間終了までに限定する',
    },
    {
      id: 'business-rule-cancel-invalidate-reference',
      category: 'process',
      description: 'キャンセル完了後は予約番号が無効化される',
    },
    {
      id: 'business-rule-cancel-reason-category',
      category: 'process',
      description:
        'キャンセル理由の入力は任意とし入力する場合は定義済みカテゴリーから選択し自由記述欄で補足できる',
    },
    {
      id: 'business-rule-no-show-cancel',
      category: 'process',
      description: 'チェックインが行われない予約は所定の猶予時間後にノーショーとして取消できる',
    },
    {
      id: 'business-rule-change-retain-reference',
      category: 'process',
      description: '変更後も予約番号を維持する',
    },
    {
      id: 'business-rule-history-auto-generated',
      category: 'audit',
      description: '履歴は予約新規・変更・取消の都度自動生成する',
    },
    {
      id: 'business-rule-history-review-toggle',
      category: 'process',
      description: '既読状態は履歴単位で管理し再確認が必要な場合は未確認に戻せる',
    },
    {
      id: 'business-rule-history-note-sharing',
      category: 'communication',
      description: '履歴のメモ入力は任意だが残した内容を他のスタッフと共有する',
    },
    {
      id: 'business-rule-search-empty-initial',
      category: 'process',
      description: '検索ビューの初期表示では検索結果を自動表示せず空リストとする',
    },
    {
      id: 'business-rule-search-multi-criteria',
      category: 'process',
      description: '検索条件は日付・氏名・連絡先・ステータスなど複数条件の組み合わせを許容する',
    },
    {
      id: 'business-rule-search-sort-ascending',
      category: 'process',
      description: '検索結果の並び順は来店予定日時の昇順を既定とする',
    },
    {
      id: 'business-rule-role-segregation',
      category: 'compliance',
      description: 'ロール付与は定義済みの職務分掌に従う',
    },
    {
      id: 'business-rule-account-deletion-approval',
      category: 'compliance',
      description: 'ユーザー削除は関連業務の影響を確認し責任者の承認を得る',
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
        'セルフサービスからの予約確定・変更・取消リクエストをすべて監査ログに記録し不正操作の追跡に備える',
    },
    {
      id: 'security-policy-staff-visibility-governance',
      description:
        '店舗スタッフの予約閲覧を担当店舗と権限レベルに基づき制御し必要最小限の個人情報のみを検索結果で表示する',
    },
    {
      id: 'security-policy-history-access-control',
      description:
        '予約の確定・取消履歴への閲覧および既読更新を権限を持つスタッフに限定し履歴データを署名付きで保全する',
    },
    {
      id: 'security-policy-history-audit-log',
      description: '履歴の閲覧・既読操作を担当者IDとともに監査ログへ記録し定期レビューを実施する',
    },
    {
      id: 'security-policy-staff-operation-audit',
      description:
        'スタッフによる予約変更・取消では担当者IDと理由の入力を必須とし変更前後の差分を履歴と監査ログに残す',
    },
    {
      id: 'security-policy-concurrency-control',
      description:
        'スタッフ操作で予約変更・取消を確定する際に最新ロック状態を再確認し競合検知時には処理を中断する',
    },
    {
      id: 'security-policy-slot-release-verification',
      description: '予約取消で解放された枠を確認済みフラグ付与前に外部システムへ連携しない',
    },
    {
      id: 'security-policy-staff-search-audit',
      description:
        '店舗スタッフによる予約検索の検索条件と結果閲覧を監査ログに保持し定期的にレビューする',
    },
    {
      id: 'security-policy-account-admin-audit',
      description:
        'システム管理者によるユーザー登録・削除操作をすべて監査ログに記録し削除前に影響範囲と承認状況を確認する',
    },
    {
      id: 'security-policy-least-privilege',
      description: 'ユーザーとロールの付与を最小権限の原則に従い不要な権限を発行しない',
    },
  ],
};
