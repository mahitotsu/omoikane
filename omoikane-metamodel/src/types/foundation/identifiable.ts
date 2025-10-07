/**
 * @fileoverview 識別可能オブジェクトの基底型定義（Foundation Identifiable）
 * 
 * **目的:**
 * 全ての文書型が実装すべき基底インターフェースを提供します。
 * IDと名前による識別、メタデータ管理、トレーサビリティ、バージョン管理、承認フローなどの
 * 共通機能を定義します。
 * 
 * **型階層:**
 * ```
 * Identifiable (基底)
 *   └─ DocumentBase (メタデータ追加)
 *        ├─ TraceableDocument (トレーサビリティ追加)
 *        ├─ Categorizable (カテゴリー分類追加)
 *        ├─ Versionable (バージョン管理追加)
 *        └─ Approvable (承認フロー追加)
 * ```
 * 
 * **提供機能:**
 * 1. Identifiable: 基本識別（id, name）
 * 2. DocumentBase: メタデータ管理
 * 3. TraceableDocument: 文書間関係性の追跡
 * 4. Categorizable: カテゴリー分類
 * 5. Versionable: バージョン管理と変更履歴
 * 6. Approvable: 承認ワークフロー
 * 7. 型判定ヘルパー関数
 * 
 * **設計原則:**
 * - 段階的拡張: 必要な機能だけを継承
 * - 型安全性: TypeScriptの型システムを最大限活用
 * - 柔軟性: カスタムメタデータで独自拡張可能
 * 
 * **使用例:**
 * ```typescript
 * // シンプルな文書
 * const doc: DocumentBase = {
 *   id: 'req-001',
 *   name: 'ユーザー登録要件',
 *   description: 'ユーザーがシステムに登録できる機能',
 *   metadata: {
 *     createdAt: '2024-01-01T00:00:00Z',
 *     createdBy: 'alice@example.com'
 *   }
 * };
 * 
 * // トレーサブルな文書
 * const traceableDoc: TraceableDocument = {
 *   ...doc,
 *   relatedDocuments: [
 *     { type: 'use-case', id: 'uc-001' }
 *   ]
 * };
 * 
 * // 型判定
 * if (isTraceableDocument(doc)) {
 *   console.log(doc.relatedDocuments);
 * }
 * ```
 * 
 * @module types/foundation/identifiable
 */

import type { Metadata } from './primitives.js';
import type { Ref } from './reference.js';

// ============================================================================
// 基底インターフェース
// ============================================================================

/**
 * 識別可能な文書の基底インターフェース
 * 
 * **目的:**
 * 全ての文書型が実装すべき最小限のインターフェースです。
 * IDと名前による一意識別を提供します。
 * 
 * **フィールド:**
 * - id: 文書の一意識別子（システム全体で一意）
 * - name: 文書名（人間が読める名前）
 * 
 * **使用例:**
 * ```typescript
 * const requirement: Identifiable = {
 *   id: 'req-001',
 *   name: 'ユーザー登録要件'
 * };
 * ```
 */
export interface Identifiable {
  /** 文書の一意識別子（例: req-001, uc-001） */
  id: string;
  
  /** 文書名（人間が読める名前） */
  name: string;
}

/**
 * 文書の基底インターフェース
 * 
 * **目的:**
 * メタデータを持つ全ての文書型が実装するインターフェースです。
 * 識別機能に加えて、説明とメタデータ管理機能を提供します。
 * 
 * **追加フィールド:**
 * - description: 文書の説明（オプション）
 * - metadata: メタデータ（作成・更新履歴、バージョン、タグ）
 * 
 * **使用例:**
 * ```typescript
 * const requirement: DocumentBase = {
 *   id: 'req-001',
 *   name: 'ユーザー登録要件',
 *   description: 'ユーザーがシステムに登録できる機能を提供する',
 *   metadata: {
 *     createdAt: '2024-01-01T00:00:00Z',
 *     createdBy: 'alice@example.com',
 *     version: '1.0.0',
 *     tags: ['authentication', 'user-management']
 *   }
 * };
 * ```
 */
export interface DocumentBase extends Identifiable {
  /** 文書の説明（概要、目的など） */
  description?: string;
  
  /** メタデータ（作成・更新履歴、バージョン、タグ、カスタム情報） */
  metadata?: Metadata;
}

// ============================================================================
// 拡張インターフェース
// ============================================================================

/**
 * トレーサブルな文書の基底インターフェース
 * 
 * **目的:**
 * 他の文書との関係性を持つ文書型が実装するインターフェースです。
 * 要件トレーサビリティやインパクト分析に使用されます。
 * 
 * **追加フィールド:**
 * - relatedDocuments: この文書が参照する他の文書のリスト
 * - traceabilityNote: トレーサビリティに関するメモ
 * 
 * **使用例:**
 * ```typescript
 * const requirement: TraceableDocument = {
 *   id: 'req-001',
 *   name: 'ユーザー登録要件',
 *   description: 'ユーザーがシステムに登録できる機能',
 *   relatedDocuments: [
 *     { type: 'use-case', id: 'uc-001' },
 *     { type: 'test-case', id: 'tc-001' }
 *   ],
 *   traceabilityNote: 'ユースケースuc-001から派生、テストケースtc-001で検証'
 * };
 * ```
 */
export interface TraceableDocument extends DocumentBase {
  /** この文書が参照する他の文書（要件、ユースケース、テストケースなど） */
  relatedDocuments?: Ref<unknown>[];
  
  /** トレーサビリティのメモ（関係性の説明、派生理由など） */
  traceabilityNote?: string;
}

/**
 * カテゴリー分類可能な文書
 * 
 * **目的:**
 * 文書をカテゴリーで分類・整理できるようにします。
 * 階層的な分類（カテゴリー → サブカテゴリー）をサポートします。
 * 
 * **追加フィールド:**
 * - category: カテゴリー（大分類）
 * - subcategory: サブカテゴリー（小分類）
 * 
 * **使用例:**
 * ```typescript
 * const requirement: Categorizable = {
 *   id: 'req-001',
 *   name: 'ユーザー登録要件',
 *   category: 'functional',
 *   subcategory: 'authentication'
 * };
 * ```
 */
export interface Categorizable extends DocumentBase {
  /** カテゴリー（大分類、例: functional, non-functional, business） */
  category?: string;
  
  /** サブカテゴリー（小分類、例: authentication, performance, security） */
  subcategory?: string;
}

/**
 * バージョン管理可能な文書
 * 
 * **目的:**
 * 文書のバージョン管理と変更履歴の記録を可能にします。
 * セマンティックバージョニング（major.minor.patch）を推奨します。
 * 
 * **追加フィールド:**
 * - version: バージョン番号（必須）
 * - changeLog: 変更履歴（オプション）
 * 
 * **使用例:**
 * ```typescript
 * const requirement: Versionable = {
 *   id: 'req-001',
 *   name: 'ユーザー登録要件',
 *   version: '2.1.0',
 *   changeLog: [
 *     {
 *       version: '2.1.0',
 *       date: '2024-03-01T00:00:00Z',
 *       author: 'bob@example.com',
 *       changes: ['メールアドレス検証機能を追加']
 *     },
 *     {
 *       version: '2.0.0',
 *       date: '2024-02-01T00:00:00Z',
 *       author: 'alice@example.com',
 *       changes: ['OAuth2.0認証に対応', 'パスワードポリシーを強化']
 *     }
 *   ]
 * };
 * ```
 */
export interface Versionable extends DocumentBase {
  /** バージョン番号（セマンティックバージョニング推奨、例: 1.2.3） */
  version: string;
  
  /** 変更履歴（バージョン毎の変更内容） */
  changeLog?: ChangeLogEntry[];
}

/**
 * 変更履歴エントリ
 * 
 * **目的:**
 * バージョン毎の変更内容を記録します。
 * 
 * **フィールド:**
 * - version: バージョン番号
 * - date: 変更日時（ISO 8601形式）
 * - author: 変更者（メールアドレスやユーザーID）
 * - changes: 変更内容のリスト
 * 
 * **使用例:**
 * ```typescript
 * const entry: ChangeLogEntry = {
 *   version: '2.1.0',
 *   date: '2024-03-01T00:00:00Z',
 *   author: 'bob@example.com',
 *   changes: [
 *     'メールアドレス検証機能を追加',
 *     '登録フォームのUIを改善'
 *   ]
 * };
 * ```
 */
export interface ChangeLogEntry {
  /** バージョン番号 */
  version: string;
  
  /** 変更日時（ISO 8601形式） */
  date: string;
  
  /** 変更者（メールアドレスやユーザーID） */
  author: string;
  
  /** 変更内容のリスト */
  changes: string[];
}

/**
 * 承認可能な文書
 * 
 * **目的:**
 * 文書の承認ワークフローを管理します。
 * ドラフト → 承認待ち → 承認/却下の流れをサポートします。
 * 
 * **追加フィールド:**
 * - approvalStatus: 承認ステータス（必須）
 * - approver: 承認者
 * - approvedAt: 承認日時
 * - approvalComment: 承認コメント
 * 
 * **ステータス定義:**
 * - draft: ドラフト（作成中）
 * - pending: 承認待ち（レビュー依頼済み）
 * - approved: 承認済み（承認者による承認完了）
 * - rejected: 却下（承認者による却下）
 * 
 * **使用例:**
 * ```typescript
 * const requirement: Approvable = {
 *   id: 'req-001',
 *   name: 'ユーザー登録要件',
 *   approvalStatus: 'approved',
 *   approver: 'manager@example.com',
 *   approvedAt: '2024-01-15T10:30:00Z',
 *   approvalComment: '要件は明確で実装可能です。承認します。'
 * };
 * ```
 */
export interface Approvable extends DocumentBase {
  /** 承認ステータス */
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  
  /** 承認者（メールアドレスやユーザーID） */
  approver?: string;
  
  /** 承認日時（ISO 8601形式） */
  approvedAt?: string;
  
  /** 承認コメント（承認理由や却下理由） */
  approvalComment?: string;
}

// ============================================================================
// 型判定ヘルパー関数
// ============================================================================

/**
 * TraceableDocument型判定ヘルパー
 * 
 * **目的:**
 * 文書がTraceableDocumentインターフェースを実装しているか判定します。
 * TypeScriptの型ガード（type guard）として機能します。
 * 
 * **使用例:**
 * ```typescript
 * function processDocument(doc: DocumentBase) {
 *   if (isTraceableDocument(doc)) {
 *     // この中ではdocはTraceableDocument型として扱われる
 *     console.log(doc.relatedDocuments);
 *   }
 * }
 * ```
 * 
 * @param doc 判定対象の文書
 * @returns TraceableDocumentならtrue
 */
export function isTraceableDocument(doc: DocumentBase): doc is TraceableDocument {
  return 'relatedDocuments' in doc;
}

/**
 * Categorizable型判定ヘルパー
 * 
 * **目的:**
 * 文書がCategorizableインターフェースを実装しているか判定します。
 * 
 * @param doc 判定対象の文書
 * @returns Categorizableならtrue
 */
export function isCategorizable(doc: DocumentBase): doc is Categorizable {
  return 'category' in doc;
}

/**
 * Versionable型判定ヘルパー
 * 
 * **目的:**
 * 文書がVersionableインターフェースを実装しているか判定します。
 * versionとchangeLogの両方のフィールドを確認します。
 * 
 * @param doc 判定対象の文書
 * @returns Versionableならtrue
 */
export function isVersionable(doc: DocumentBase): doc is Versionable {
  return 'version' in doc && 'changeLog' in doc;
}

/**
 * Approvable型判定ヘルパー
 * 
 * **目的:**
 * 文書がApprovableインターフェースを実装しているか判定します。
 * 
 * @param doc 判定対象の文書
 * @returns Approvableならtrue
 */
export function isApprovable(doc: DocumentBase): doc is Approvable {
  return 'approvalStatus' in doc;
}
