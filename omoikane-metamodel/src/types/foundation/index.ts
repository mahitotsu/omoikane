/**
 * @fileoverview Foundation レイヤー統合エクスポート
 * 
 * **目的:**
 * 全ての文書型の基礎となる型定義を統合してエクスポートします。
 * プリミティブ型、参照型システム、文書基底インターフェースを提供します。
 * 
 * **提供機能:**
 * 1. プリミティブ型: PriorityLevel, Metadata, DateRange, QualityLevel, SeverityLevel
 * 2. 参照型システム: Ref<T>, RefArray<T>, createRef, isValidRef, extractRefIds
 * 3. 文書基底インターフェース: Identifiable, DocumentBase, TraceableDocument, Categorizable, Versionable, Approvable
 * 4. 型判定ヘルパー: isTraceableDocument, isCategorizable, isVersionable, isApprovable
 * 
 * **モジュール構成:**
 * - primitives.ts: プリミティブ型定義
 * - reference.ts: 参照型システム
 * - identifiable.ts: 識別可能オブジェクトの基底型
 * 
 * **使用例:**
 * ```typescript
 * import { 
 *   DocumentBase, 
 *   Ref, 
 *   createRef, 
 *   PriorityLevel 
 * } from './foundation/index.js';
 * 
 * const doc: DocumentBase = {
 *   id: 'req-001',
 *   name: 'ユーザー登録要件',
 *   metadata: { version: '1.0.0' }
 * };
 * 
 * const ref = createRef<DocumentBase>('req-001', 'ユーザー登録要件');
 * const priority: PriorityLevel = 'high';
 * ```
 * 
 * @module types/foundation
 */

// ============================================================================
// プリミティブ型
// ============================================================================

export type {
    DateRange, Metadata, PriorityLevel, QualityLevel,
    SeverityLevel
} from './primitives.js';

// ============================================================================
// 参照型システム
// ============================================================================

export type {
    Ref,
    RefArray
} from './reference.js';

export {
    createRef, extractRefIds, isValidRef
} from './reference.js';

// ============================================================================
// 文書基底インターフェース
// ============================================================================

export type {
    Approvable, Categorizable, ChangeLogEntry, DocumentBase, Identifiable, TraceableDocument, Versionable
} from './identifiable.js';

export {
    isApprovable, isCategorizable, isTraceableDocument, isVersionable
} from './identifiable.js';

