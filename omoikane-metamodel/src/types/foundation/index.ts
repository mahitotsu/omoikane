/**
 * Foundation レイヤー
 * 全ての文書型の基礎となるプリミティブ型、参照型、文書基底インターフェース
 */

// プリミティブ型
export type {
    DateRange, Metadata, PriorityLevel, QualityLevel,
    SeverityLevel
} from './primitives.js';

// 参照型システム
export type {
    Ref,
    RefArray
} from './reference.js';

export {
    createRef, extractRefIds, isValidRef
} from './reference.js';

// 文書基底インターフェース
export type {
    Approvable, Categorizable, ChangeLogEntry, DocumentBase, Identifiable, TraceableDocument, Versionable
} from './identifiable.js';

export {
    isApprovable, isCategorizable, isTraceableDocument, isVersionable
} from './identifiable.js';

