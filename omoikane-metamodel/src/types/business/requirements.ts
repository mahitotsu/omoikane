/**
 * @fileoverview 業務要件定義型（Business Requirements）
 * 
 * **目的:**
 * システムが提供すべき業務価値と成果を整理するための型を定義します。
 * ビジネスゴール、スコープ、ステークホルダー、成功指標、制約条件などを構造化して記述します。
 * 
 * **型定義:**
 * 1. BusinessRequirementItem: 業務要件項目（基本要素）
 * 2. BusinessRequirementScope: スコープ定義（inScope/outOfScope）
 * 3. SecurityPolicy: セキュリティポリシー
 * 4. BusinessRule: ビジネスルール
 * 5. BusinessRequirementDefinition: 業務要件定義文書
 * 6. BusinessRequirementCoverage: 業務要件カバレッジ情報
 * 
 * **設計原則:**
 * - 構造化: 業務要件を明確な構造で整理
 * - トレーサビリティ: 機能仕様との対応関係を追跡
 * - 柔軟性: 様々なプロジェクトに適用可能
 * 
 * **使用例:**
 * ```typescript
 * // 業務要件定義
 * const requirement: BusinessRequirementDefinition = {
 *   id: 'br-001',
 *   name: 'ECサイトリニューアル業務要件',
 *   title: 'ECサイトリニューアルプロジェクト',
 *   summary: 'ユーザー体験向上と売上増加を目指したECサイトのリニューアル',
 *   businessGoals: [
 *     {
 *       id: 'goal-001',
 *       description: '年間売上を20%向上させる',
 *       notes: '現状1億円 → 目標1.2億円'
 *     }
 *   ],
 *   scope: {
 *     inScope: [
 *       { id: 'scope-001', description: '商品検索機能の改善' }
 *     ],
 *     outOfScope: [
 *       { id: 'scope-002', description: '物流システムの変更' }
 *     ]
 *   },
 *   stakeholders: [
 *     { id: 'sh-001', description: 'マーケティング部門' }
 *   ]
 * };
 * 
 * // 業務要件カバレッジ（ユースケースとの対応）
 * const coverage: BusinessRequirementCoverage = {
 *   requirement: { id: 'br-001', displayName: 'ECサイトリニューアル' },
 *   businessGoals: [
 *     { id: 'goal-001', displayName: '売上向上' }
 *   ],
 *   notes: 'このユースケースは売上向上ゴールに貢献する'
 * };
 * ```
 * 
 * @module types/business/requirements
 */

import type { Ref, TraceableDocument } from '../foundation/index.js';

// ============================================================================
// 基本要素
// ============================================================================

/**
 * 業務要件項目（ゴール・スコープ・指標などの基本要素）
 * 
 * **目的:**
 * ビジネスゴール、スコープ項目、ステークホルダー、成功指標などの
 * 基本的な要件項目を表現します。
 * 
 * **フィールド:**
 * - id: 項目ID（一意識別子）
 * - description: 項目の説明（内容、目的）
 * - notes: 補足メモ（追加情報、注意事項）
 * 
 * **使用例:**
 * ```typescript
 * // ビジネスゴール
 * const goal: BusinessRequirementItem = {
 *   id: 'goal-001',
 *   description: '年間売上を20%向上させる',
 *   notes: '現状1億円 → 目標1.2億円'
 * };
 * 
 * // スコープ項目
 * const scopeItem: BusinessRequirementItem = {
 *   id: 'scope-001',
 *   description: '商品検索機能の改善'
 * };
 * 
 * // ステークホルダー
 * const stakeholder: BusinessRequirementItem = {
 *   id: 'sh-001',
 *   description: 'マーケティング部門',
 *   notes: '主要な意思決定者'
 * };
 * ```
 */
export interface BusinessRequirementItem {
  /** 項目ID（一意識別子） */
  id: string;
  
  /** 項目の説明（内容、目的、詳細） */
  description: string;
  
  /** 補足メモ（追加情報、注意事項、制約など） */
  notes?: string;
}

/**
 * 業務要件におけるスコープ定義
 * 
 * **目的:**
 * プロジェクトのスコープ（範囲）を明確に定義します。
 * スコープ内項目とスコープ外項目を明示的に区別します。
 * 
 * **フィールド:**
 * - inScope: スコープ内項目（プロジェクトで実施する項目）
 * - outOfScope: スコープ外項目（プロジェクトで実施しない項目、明示的に除外）
 * 
 * **使用例:**
 * ```typescript
 * const scope: BusinessRequirementScope = {
 *   inScope: [
 *     { id: 'scope-001', description: '商品検索機能の改善' },
 *     { id: 'scope-002', description: '決済フローの最適化' },
 *     { id: 'scope-003', description: 'レスポンシブデザイン対応' }
 *   ],
 *   outOfScope: [
 *     { id: 'scope-101', description: '物流システムの変更' },
 *     { id: 'scope-102', description: 'ERP連携' }
 *   ]
 * };
 * ```
 */
export interface BusinessRequirementScope {
  /** スコープ内項目（プロジェクトで実施する項目） */
  inScope: BusinessRequirementItem[];
  
  /** スコープ外項目（明示的に除外する項目） */
  outOfScope?: BusinessRequirementItem[];
}

// ============================================================================
// セキュリティポリシーとビジネスルール
// ============================================================================

/**
 * セキュリティポリシー
 * 
 * **目的:**
 * システムが遵守すべきセキュリティポリシーを定義します。
 * BusinessRequirementItemを継承し、同じ構造を持ちます。
 * 
 * **使用例:**
 * ```typescript
 * const policy: SecurityPolicy = {
 *   id: 'sec-001',
 *   description: 'パスワードは最低8文字、大文字・小文字・数字・記号を含む',
 *   notes: 'NIST SP 800-63Bに準拠'
 * };
 * ```
 */
export interface SecurityPolicy extends BusinessRequirementItem {}

/**
 * ビジネスルール
 * 
 * **目的:**
 * ビジネスロジックやビジネス上の制約を定義します。
 * BusinessRequirementItemを継承し、カテゴリー分類機能を追加します。
 * 
 * **フィールド:**
 * - id: ルールID
 * - description: ルールの説明
 * - notes: 補足メモ
 * - category: ルールのカテゴリー（計算、検証、承認など）
 * 
 * **使用例:**
 * ```typescript
 * const rule: BusinessRule = {
 *   id: 'rule-001',
 *   description: '合計金額が10,000円以上の場合、送料無料',
 *   category: '計算ルール',
 *   notes: 'キャンペーン期間中は5,000円以上で送料無料'
 * };
 * ```
 */
export interface BusinessRule extends BusinessRequirementItem {
  /** ルールのカテゴリー（計算、検証、承認、通知など） */
  category?: string;
}

// ============================================================================
// 業務要件定義文書
// ============================================================================

/**
 * 業務要件定義文書
 * 
 * **目的:**
 * システムが提供すべき業務価値と成果を整理した文書です。
 * プロジェクトの目的、スコープ、ステークホルダー、成功指標などを構造化して記述します。
 * 
 * **必須フィールド:**
 * - id: 文書ID
 * - name: 文書名
 * - title: タイトル
 * - summary: サマリー
 * - businessGoals: ビジネスゴール
 * - scope: スコープ
 * - stakeholders: ステークホルダー
 * 
 * **オプションフィールド:**
 * - successMetrics: 成功指標
 * - assumptions: 前提条件
 * - constraints: 制約条件
 * - securityPolicies: セキュリティポリシー
 * - businessRules: ビジネスルール
 * 
 * **TraceableDocumentからの継承:**
 * - relatedDocuments: 関連文書
 * - traceabilityNote: トレーサビリティのメモ
 * - description: 文書の説明
 * - metadata: メタデータ
 * 
 * **使用例:**
 * ```typescript
 * const requirement: BusinessRequirementDefinition = {
 *   id: 'br-001',
 *   name: 'ECサイトリニューアル業務要件',
 *   title: 'ECサイトリニューアルプロジェクト',
 *   summary: 'ユーザー体験向上と売上増加を目指したECサイトのリニューアル',
 *   businessGoals: [
 *     {
 *       id: 'goal-001',
 *       description: '年間売上を20%向上させる',
 *       notes: '現状1億円 → 目標1.2億円'
 *     },
 *     {
 *       id: 'goal-002',
 *       description: 'コンバージョン率を3%から5%に向上させる'
 *     }
 *   ],
 *   scope: {
 *     inScope: [
 *       { id: 'scope-001', description: '商品検索機能の改善' },
 *       { id: 'scope-002', description: '決済フローの最適化' }
 *     ],
 *     outOfScope: [
 *       { id: 'scope-101', description: '物流システムの変更' }
 *     ]
 *   },
 *   stakeholders: [
 *     { id: 'sh-001', description: 'マーケティング部門' },
 *     { id: 'sh-002', description: '営業部門' }
 *   ],
 *   successMetrics: [
 *     { id: 'metric-001', description: '月間売上高' },
 *     { id: 'metric-002', description: 'コンバージョン率' }
 *   ],
 *   assumptions: [
 *     { id: 'assume-001', description: '既存顧客データは移行可能' }
 *   ],
 *   constraints: [
 *     { id: 'const-001', description: '予算は500万円以内' },
 *     { id: 'const-002', description: 'リリースは3ヶ月以内' }
 *   ],
 *   securityPolicies: [
 *     {
 *       id: 'sec-001',
 *       description: 'パスワードは最低8文字、大文字・小文字・数字・記号を含む'
 *     }
 *   ],
 *   businessRules: [
 *     {
 *       id: 'rule-001',
 *       description: '合計金額が10,000円以上の場合、送料無料',
 *       category: '計算ルール'
 *     }
 *   ],
 *   metadata: {
 *     createdAt: '2024-01-01T00:00:00Z',
 *     createdBy: 'pm@example.com',
 *     version: '1.0.0'
 *   }
 * };
 * ```
 */
export interface BusinessRequirementDefinition extends TraceableDocument {
  /** タイトル（プロジェクトや要件定義のタイトル） */
  title: string;
  
  /** サマリー（要件定義の概要、目的） */
  summary: string;
  
  /** ビジネスゴール（達成すべき目標のリスト） */
  businessGoals: BusinessRequirementItem[];
  
  /** スコープ（プロジェクトの範囲、inScope/outOfScope） */
  scope: BusinessRequirementScope;
  
  /** ステークホルダー（関係者、意思決定者） */
  stakeholders: BusinessRequirementItem[];
  
  /** 成功指標（目標達成を測定する指標） */
  successMetrics?: BusinessRequirementItem[];
  
  /** 前提条件（プロジェクト実施の前提となる条件） */
  assumptions?: BusinessRequirementItem[];
  
  /** 制約条件（予算、スケジュール、技術的制約など） */
  constraints?: BusinessRequirementItem[];
  
  /** セキュリティポリシー（遵守すべきセキュリティ要件） */
  securityPolicies?: SecurityPolicy[];
  
  /** ビジネスルール（ビジネスロジック、業務ルール） */
  businessRules?: BusinessRule[];
}

// ============================================================================
// 業務要件カバレッジ
// ============================================================================

/**
 * 業務要件カバレッジ情報
 * 
 * **目的:**
 * ユースケースなどの機能仕様が、どの業務要件をカバーしているかを追跡します。
 * トレーサビリティマトリクスを構築し、要件の実装状況を管理します。
 * 
 * **ジェネリクス型パラメータ:**
 * @template TRequirement - 業務要件定義の型（デフォルト: BusinessRequirementDefinition）
 * @template TGoal - ビジネスゴールの型（デフォルト: BusinessRequirementItem）
 * @template TScope - スコープ項目の型（デフォルト: BusinessRequirementItem）
 * @template TStakeholder - ステークホルダーの型（デフォルト: BusinessRequirementItem）
 * @template TMetric - 成功指標の型（デフォルト: BusinessRequirementItem）
 * @template TAssumption - 前提条件の型（デフォルト: BusinessRequirementItem）
 * @template TConstraint - 制約条件の型（デフォルト: BusinessRequirementItem）
 * @template TSecurityPolicy - セキュリティポリシーの型（デフォルト: SecurityPolicy）
 * @template TBusinessRule - ビジネスルールの型（デフォルト: BusinessRule）
 * 
 * **フィールド:**
 * - requirement: 業務要件定義への参照（必須）
 * - businessGoals: カバーするビジネスゴール（必須）
 * - scopeItems: カバーするスコープ項目（オプション）
 * - stakeholders: 関連するステークホルダー（オプション）
 * - successMetrics: 関連する成功指標（オプション）
 * - assumptions: 関連する前提条件（オプション）
 * - constraints: 関連する制約条件（オプション）
 * - securityPolicies: 関連するセキュリティポリシー（オプション）
 * - businessRules: 関連するビジネスルール（オプション）
 * - notes: カバレッジに関する補足（オプション）
 * 
 * **使用例:**
 * ```typescript
 * // ユースケース「ログイン」の業務要件カバレッジ
 * const coverage: BusinessRequirementCoverage = {
 *   requirement: { 
 *     id: 'br-001', 
 *     displayName: 'ECサイトリニューアル' 
 *   },
 *   businessGoals: [
 *     { id: 'goal-001', displayName: '売上向上' },
 *     { id: 'goal-002', displayName: 'ユーザー体験向上' }
 *   ],
 *   scopeItems: [
 *     { id: 'scope-001', displayName: 'ユーザー認証機能' }
 *   ],
 *   securityPolicies: [
 *     { id: 'sec-001', displayName: 'パスワードポリシー' }
 *   ],
 *   businessRules: [
 *     { id: 'rule-001', displayName: 'ログイン試行回数制限' }
 *   ],
 *   notes: 'このユースケースはセキュアなログイン機能を提供し、売上向上とUX向上に貢献する'
 * };
 * 
 * // トレーサビリティマトリクス構築
 * const useCase: UseCase = {
 *   id: 'uc-001',
 *   name: 'ログイン',
 *   businessRequirementCoverage: coverage,
 *   // ... その他のフィールド
 * };
 * ```
 */
export interface BusinessRequirementCoverage<
  TRequirement = BusinessRequirementDefinition,
  TGoal = BusinessRequirementItem,
  TScope = BusinessRequirementItem,
  TStakeholder = BusinessRequirementItem,
  TMetric = BusinessRequirementItem,
  TAssumption = BusinessRequirementItem,
  TConstraint = BusinessRequirementItem,
  TSecurityPolicy = SecurityPolicy,
  TBusinessRule = BusinessRule,
> {
  /** 業務要件定義への参照（どの業務要件をカバーしているか） */
  requirement: Ref<TRequirement>;
  
  /** カバーするビジネスゴール（どの目標に貢献するか） */
  businessGoals: Ref<TGoal>[];
  
  /** カバーするスコープ項目（どのスコープ項目を実装するか） */
  scopeItems?: Ref<TScope>[];
  
  /** 関連するステークホルダー（どの関係者が関与するか） */
  stakeholders?: Ref<TStakeholder>[];
  
  /** 関連する成功指標（どの指標に影響するか） */
  successMetrics?: Ref<TMetric>[];
  
  /** 関連する前提条件（どの前提に依存するか） */
  assumptions?: Ref<TAssumption>[];
  
  /** 関連する制約条件（どの制約を考慮するか） */
  constraints?: Ref<TConstraint>[];
  
  /** 関連するセキュリティポリシー（どのポリシーを適用するか） */
  securityPolicies?: Ref<TSecurityPolicy>[];
  
  /** 関連するビジネスルール（どのルールを実装するか） */
  businessRules?: Ref<TBusinessRule>[];
  
  /** カバレッジに関する補足（実装方針、注意事項など） */
  notes?: string;
}
