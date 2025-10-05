/**
 * 統一された参照型システム
 * 全ての文書間参照に使用される汎用的な型定義
 */

/**
 * 型安全な文書参照
 * 
 * @template T - 参照対象の型（例: Actor, UseCase, BusinessGoal等）
 * 
 * @example
 * ```typescript
 * // アクター参照
 * const actorRef: Ref<Actor> = { id: 'actor-001', displayName: '購入者' };
 * 
 * // ユースケース参照
 * const useCaseRef: Ref<UseCase> = { id: 'uc-001', displayName: 'ログイン' };
 * ```
 */
export interface Ref<T> {
  /** 参照先のID（一意識別子） */
  id: string;
  
  /** 表示名（任意、IDEでの可読性向上のため） */
  displayName?: string;
}

/**
 * 参照ファクトリー関数
 * 型安全に参照を作成するヘルパー関数
 * 
 * @template T - 参照対象の型
 * @param id - 参照先のID
 * @param displayName - 表示名（任意）
 * @returns 型付き参照
 * 
 * @example
 * ```typescript
 * const actorRef = createRef<Actor>('actor-001', '購入者');
 * ```
 */
export function createRef<T>(id: string, displayName?: string): Ref<T> {
  return { id, displayName };
}

/**
 * 参照配列型
 * 複数の参照を扱う場合の型エイリアス
 * 
 * @template T - 参照対象の型
 */
export type RefArray<T> = Ref<T>[];

/**
 * 参照検証ヘルパー
 * 参照が有効かどうかをチェック
 * 
 * @template T - 参照対象の型
 * @param ref - チェック対象の参照
 * @returns 参照が有効な場合true
 */
export function isValidRef<T>(ref: Ref<T> | undefined | null): ref is Ref<T> {
  return ref !== undefined && ref !== null && typeof ref.id === 'string' && ref.id.length > 0;
}

/**
 * 参照ID抽出ヘルパー
 * 参照からIDのみを抽出
 * 
 * @template T - 参照対象の型
 * @param refs - 参照または参照配列
 * @returns ID配列
 * 
 * @example
 * ```typescript
 * const ids = extractRefIds([
 *   { id: 'actor-001', displayName: '購入者' },
 *   { id: 'actor-002', displayName: '管理者' }
 * ]);
 * // ids = ['actor-001', 'actor-002']
 * ```
 */
export function extractRefIds<T>(refs: Ref<T> | Ref<T>[]): string[] {
  const refArray = Array.isArray(refs) ? refs : [refs];
  return refArray.filter(isValidRef).map(ref => ref.id);
}
