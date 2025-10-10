/**
 * @fileoverview トレーサビリティ管理（Cross-Cutting Traceability）
 *
 * **目的:**
 * 文書間の関係性を追跡・管理するための型定義を提供します。
 * 要件、ユースケース、テストケースなどの文書間の関連性を明確にし、
 * トレーサビリティマトリクスの構築と検証を支援します。
 *
 * **型定義:**
 * 1. RelationType: 関係タイプ（implements, depends-on, derived-from等）
 * 2. DocumentRelationship: 文書間の明示的な関係
 * 3. TraceabilityMatrix: トレーサビリティマトリクス
 * 4. TraceabilityValidation: トレーサビリティ検証結果
 * 5. TraceabilityIssue: トレーサビリティの問題
 * 6. TraceabilityAnalysis: トレーサビリティ分析結果
 *
 * **設計原則:**
 * - 型安全性: ジェネリクスで関係元・関係先の型を保証
 * - 明示性: 関係タイプを列挙型で明確に定義
 * - 検証可能性: 検証と分析機能をサポート
 *
 * **使用例:**
 * ```typescript
 * // 文書間の関係定義
 * const relationship: DocumentRelationship<UseCase, BusinessRequirement> = {
 *   type: RelationType.IMPLEMENTS,
 *   source: { id: 'uc-001', displayName: 'ログイン' },
 *   target: { id: 'req-001', displayName: 'ユーザー認証要件' },
 *   description: 'ログインユースケースはユーザー認証要件を実装する',
 *   strength: 'strong'
 * };
 *
 * // トレーサビリティマトリクス
 * const matrix: TraceabilityMatrix = {
 *   id: 'tm-001',
 *   name: 'ECサイトトレーサビリティ',
 *   relationships: [relationship, ...],
 *   createdAt: '2024-01-01T00:00:00Z'
 * };
 *
 * // トレーサビリティ検証
 * const validation: TraceabilityValidation = {
 *   documentId: 'uc-001',
 *   isValid: true,
 *   issues: []
 * };
 * ```
 *
 * @module types/cross-cutting/traceability
 */

import type { Ref } from '../foundation/index.js';

// ============================================================================
// 関係タイプ定義
// ============================================================================

/**
 * 関係タイプ
 *
 * **目的:**
 * 文書間の関係性の種類を定義します。
 * トレーサビリティマトリクスで使用される標準的な関係タイプを列挙します。
 *
 * **関係タイプ定義:**
 * - IMPLEMENTS: 実装する（ユースケース → 要件）
 *   下位の文書が上位の文書を実装する関係
 *   例: ユースケース → ビジネス要件
 *
 * - DEPENDS_ON: 依存する
 *   一方の文書が他方の文書に依存する関係
 *   例: ユースケースA → ユースケースB
 *
 * - DERIVED_FROM: 派生する
 *   一方の文書が他方の文書から派生した関係
 *   例: 詳細設計 → 概要設計
 *
 * - REFERENCES: 参照する
 *   一方の文書が他方の文書を参照する一般的な関係
 *   例: ドキュメント → 用語集
 *
 * - VERIFIES: 検証する
 *   一方の文書が他方の文書を検証する関係
 *   例: テストケース → ユースケース
 *
 * - SUPERSEDES: 置換する
 *   新しい文書が古い文書を置き換える関係
 *   例: 新要件 → 旧要件
 *
 * - RELATES_TO: 関連する
 *   一般的な関連性を示す関係
 *   例: 関連する要件同士
 *
 * **使用例:**
 * ```typescript
 * const type1: RelationType = RelationType.IMPLEMENTS;
 * const type2: RelationType = RelationType.VERIFIES;
 * ```
 */
export enum RelationType {
  /** 実装する（ユースケース → 要件、実装 → 設計） */
  IMPLEMENTS = 'implements',

  /** 依存する（文書Aが文書Bに依存） */
  DEPENDS_ON = 'depends-on',

  /** 派生する（文書Aが文書Bから派生） */
  DERIVED_FROM = 'derived-from',

  /** 参照する（文書Aが文書Bを参照） */
  REFERENCES = 'references',

  /** 検証する（テストケース → ユースケース/要件） */
  VERIFIES = 'verifies',

  /** 置換する（新文書が旧文書を置き換え） */
  SUPERSEDES = 'supersedes',

  /** 関連する（一般的な関連性） */
  RELATES_TO = 'relates-to',
}

// ============================================================================
// 文書関係性
// ============================================================================

/**
 * 型付き文書関係
 *
 * **目的:**
 * 2つの文書間の明示的な関係を表現します。
 * 型安全性を保ちながら、柔軟に文書間の関係を定義できます。
 *
 * **ジェネリクス型パラメータ:**
 * @template TSource - 関係元の文書型（デフォルト: unknown）
 * @template TTarget - 関係先の文書型（デフォルト: unknown）
 *
 * **フィールド:**
 * - type: 関係タイプ（RelationType列挙型）
 * - source: 関係元文書への参照
 * - target: 関係先文書への参照
 * - description: 関係の説明（オプション）
 * - strength: 関係の強度（strong/weak、オプション）
 *
 * **関係の強度:**
 * - strong: 強い関係（一方が変更されると他方も変更が必要）
 * - weak: 弱い関係（一方の変更が他方に影響しない可能性がある）
 *
 * **使用例:**
 * ```typescript
 * // ユースケース → ビジネス要件の実装関係
 * const impl: DocumentRelationship<UseCase, BusinessRequirement> = {
 *   type: RelationType.IMPLEMENTS,
 *   source: { id: 'uc-001', displayName: 'ログイン' },
 *   target: { id: 'req-001', displayName: 'ユーザー認証要件' },
 *   description: 'ログインユースケースはユーザー認証要件を実装する',
 *   strength: 'strong'
 * };
 *
 * // テストケース → ユースケースの検証関係
 * const verify: DocumentRelationship<TestCase, UseCase> = {
 *   type: RelationType.VERIFIES,
 *   source: { id: 'tc-001', displayName: 'ログインテスト' },
 *   target: { id: 'uc-001', displayName: 'ログイン' },
 *   description: 'ログインテストはログインユースケースを検証する',
 *   strength: 'strong'
 * };
 *
 * // 要件間の依存関係
 * const depends: DocumentRelationship = {
 *   type: RelationType.DEPENDS_ON,
 *   source: { id: 'req-002', displayName: '商品購入要件' },
 *   target: { id: 'req-001', displayName: 'ユーザー認証要件' },
 *   description: '商品購入にはログインが必要',
 *   strength: 'strong'
 * };
 * ```
 */
export interface DocumentRelationship<TSource = unknown, TTarget = unknown> {
  /** 関係タイプ（implements, depends-on, verifies等） */
  type: RelationType;

  /** 関係元文書への参照 */
  source: Ref<TSource>;

  /** 関係先文書への参照 */
  target: Ref<TTarget>;

  /** 関係の説明（関係の詳細、理由、注意事項など） */
  description?: string;

  /** 関係の強度（strong: 強い関係、weak: 弱い関係） */
  strength?: 'strong' | 'weak';
}

// ============================================================================
// トレーサビリティマトリクス
// ============================================================================

/**
 * トレーサビリティマトリックス
 *
 * **目的:**
 * 複数の文書間の関係性を一覧管理します。
 * プロジェクト全体のトレーサビリティを可視化し、要件の実装状況を追跡します。
 *
 * **フィールド:**
 * - id: マトリックスID
 * - name: マトリックス名
 * - description: 説明
 * - relationships: 関係のリスト
 * - createdAt: 作成日時
 * - updatedAt: 最終更新日時
 *
 * **使用例:**
 * ```typescript
 * const matrix: TraceabilityMatrix = {
 *   id: 'tm-001',
 *   name: 'ECサイトリニューアル トレーサビリティ',
 *   description: 'ECサイトプロジェクトの要件～実装～テストのトレーサビリティ',
 *   relationships: [
 *     {
 *       type: RelationType.IMPLEMENTS,
 *       source: { id: 'uc-001', displayName: 'ログイン' },
 *       target: { id: 'req-001', displayName: 'ユーザー認証要件' }
 *     },
 *     {
 *       type: RelationType.VERIFIES,
 *       source: { id: 'tc-001', displayName: 'ログインテスト' },
 *       target: { id: 'uc-001', displayName: 'ログイン' }
 *     },
 *     // ... その他の関係
 *   ],
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-03-15T10:30:00Z'
 * };
 * ```
 */
export interface TraceabilityMatrix {
  /** マトリックスID（一意識別子） */
  id: string;

  /** マトリックス名（人間が読める名前） */
  name: string;

  /** 説明（マトリクスの目的、スコープ） */
  description?: string;

  /** 関係のリスト（文書間の関係性を全て列挙） */
  relationships: DocumentRelationship[];

  /** 作成日時（ISO 8601形式） */
  createdAt?: string;

  /** 最終更新日時（ISO 8601形式） */
  updatedAt?: string;
}

// ============================================================================
// トレーサビリティ検証
// ============================================================================

/**
 * トレーサビリティ検証結果
 *
 * **目的:**
 * 文書のトレーサビリティを検証した結果を表します。
 * 参照の整合性、循環依存、孤立文書などの問題を検出します。
 *
 * **フィールド:**
 * - documentId: 検証対象の文書ID
 * - isValid: 検証が成功したか
 * - issues: 問題のリスト
 *
 * **使用例:**
 * ```typescript
 * // 検証成功
 * const validResult: TraceabilityValidation = {
 *   documentId: 'uc-001',
 *   isValid: true,
 *   issues: []
 * };
 *
 * // 検証失敗（問題あり）
 * const invalidResult: TraceabilityValidation = {
 *   documentId: 'uc-002',
 *   isValid: false,
 *   issues: [
 *     {
 *       type: 'missing-reference',
 *       message: 'ビジネス要件への参照が欠落しています',
 *       reference: { id: 'req-002', displayName: '商品検索要件' }
 *     },
 *     {
 *       type: 'broken-link',
 *       message: '参照先の文書が見つかりません',
 *       reference: { id: 'req-999', displayName: '削除済み要件' }
 *     }
 *   ]
 * };
 * ```
 */
export interface TraceabilityValidation {
  /** 検証対象の文書ID */
  documentId: string;

  /** 検証が成功したか（true: 問題なし、false: 問題あり） */
  isValid: boolean;

  /** 問題のリスト（検証エラーや警告） */
  issues: TraceabilityIssue[];
}

/**
 * トレーサビリティの問題
 *
 * **目的:**
 * トレーサビリティ検証で検出された問題を表します。
 *
 * **問題タイプ:**
 * - missing-reference: 参照が欠落している
 *   必要な参照が定義されていない
 *   例: ユースケースにビジネス要件への参照がない
 *
 * - broken-link: リンク切れ
 *   参照先の文書が存在しない
 *   例: 削除された要件を参照している
 *
 * - circular-dependency: 循環依存
 *   文書間で循環参照が発生している
 *   例: 文書A → 文書B → 文書A
 *
 * - orphaned-document: 孤立文書
 *   どの文書からも参照されていない
 *   例: 使われていない要件
 *
 * **使用例:**
 * ```typescript
 * const issue1: TraceabilityIssue = {
 *   type: 'missing-reference',
 *   message: 'ビジネス要件への参照が欠落しています',
 *   reference: { id: 'req-001', displayName: 'ユーザー認証要件' }
 * };
 *
 * const issue2: TraceabilityIssue = {
 *   type: 'orphaned-document',
 *   message: 'どのユースケースからも参照されていません'
 * };
 * ```
 */
export interface TraceabilityIssue {
  /** 問題のタイプ */
  type: 'missing-reference' | 'broken-link' | 'circular-dependency' | 'orphaned-document';

  /** 問題の説明（エラーメッセージ） */
  message: string;

  /** 関連する参照（該当する場合） */
  reference?: Ref<unknown>;
}

// ============================================================================
// トレーサビリティ分析
// ============================================================================

/**
 * トレーサビリティ分析結果
 *
 * **目的:**
 * 文書間の関係性の統計情報を提供します。
 * プロジェクト全体のトレーサビリティの健全性を評価します。
 *
 * **フィールド:**
 * - totalDocuments: 総文書数
 * - totalRelationships: 総関係数
 * - relationshipsByType: 関係タイプ別の統計
 * - orphanedDocuments: 孤立文書のリスト
 * - coveragePercentage: カバレッジパーセンテージ
 *
 * **使用例:**
 * ```typescript
 * const analysis: TraceabilityAnalysis = {
 *   totalDocuments: 150,
 *   totalRelationships: 300,
 *   relationshipsByType: {
 *     [RelationType.IMPLEMENTS]: 80,
 *     [RelationType.VERIFIES]: 60,
 *     [RelationType.DEPENDS_ON]: 40,
 *     [RelationType.DERIVED_FROM]: 30,
 *     [RelationType.REFERENCES]: 50,
 *     [RelationType.SUPERSEDES]: 20,
 *     [RelationType.RELATES_TO]: 20
 *   },
 *   orphanedDocuments: [
 *     { id: 'req-999', displayName: '未使用要件' }
 *   ],
 *   coveragePercentage: 95.3
 * };
 *
 * // カバレッジ評価
 * if (analysis.coveragePercentage >= 90) {
 *   console.log('トレーサビリティは良好です');
 * } else if (analysis.coveragePercentage >= 70) {
 *   console.log('トレーサビリティは改善が必要です');
 * } else {
 *   console.log('トレーサビリティは不十分です');
 * }
 * ```
 */
export interface TraceabilityAnalysis {
  /** 総文書数（マトリクス内の全文書） */
  totalDocuments: number;

  /** 総関係数（全ての文書間関係） */
  totalRelationships: number;

  /** 関係タイプ別の統計（各関係タイプの出現回数） */
  relationshipsByType: Record<RelationType, number>;

  /** 孤立文書のリスト（どの文書からも参照されていない文書） */
  orphanedDocuments: Ref<unknown>[];

  /** カバレッジパーセンテージ（0-100、参照されている文書の割合） */
  coveragePercentage: number;
}
