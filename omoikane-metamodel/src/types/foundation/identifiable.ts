import type { Metadata } from './primitives.js';
import type { Ref } from './reference.js';

/**
 * 識別可能な文書の基底インターフェース
 * 全ての文書型はこのインターフェースを実装する
 */
export interface Identifiable {
  /** 文書の一意識別子 */
  id: string;
  
  /** 文書名 */
  name: string;
}

/**
 * 文書の基底インターフェース
 * メタデータを持つ全ての文書型が実装する
 */
export interface DocumentBase extends Identifiable {
  /** 文書の説明 */
  description?: string;
  
  /** メタデータ */
  metadata?: Metadata;
}

/**
 * トレーサブルな文書の基底インターフェース
 * 他の文書との関係性を持つ文書型が実装する
 */
export interface TraceableDocument extends DocumentBase {
  /** この文書が参照する他の文書 */
  relatedDocuments?: Ref<unknown>[];
  
  /** トレーサビリティのメモ */
  traceabilityNote?: string;
}

/**
 * カテゴリー分類可能な文書
 */
export interface Categorizable extends DocumentBase {
  /** カテゴリー */
  category?: string;
  
  /** サブカテゴリー */
  subcategory?: string;
}

/**
 * バージョン管理可能な文書
 */
export interface Versionable extends DocumentBase {
  /** バージョン番号 */
  version: string;
  
  /** 変更履歴 */
  changeLog?: ChangeLogEntry[];
}

/**
 * 変更履歴エントリ
 */
export interface ChangeLogEntry {
  /** バージョン */
  version: string;
  
  /** 変更日時 */
  date: string;
  
  /** 変更者 */
  author: string;
  
  /** 変更内容 */
  changes: string[];
}

/**
 * 承認可能な文書
 */
export interface Approvable extends DocumentBase {
  /** 承認ステータス */
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  
  /** 承認者 */
  approver?: string;
  
  /** 承認日時 */
  approvedAt?: string;
  
  /** 承認コメント */
  approvalComment?: string;
}

/**
 * 文書型判定ヘルパー
 */
export function isTraceableDocument(doc: DocumentBase): doc is TraceableDocument {
  return 'relatedDocuments' in doc;
}

export function isCategorizable(doc: DocumentBase): doc is Categorizable {
  return 'category' in doc;
}

export function isVersionable(doc: DocumentBase): doc is Versionable {
  return 'version' in doc && 'changeLog' in doc;
}

export function isApprovable(doc: DocumentBase): doc is Approvable {
  return 'approvalStatus' in doc;
}
