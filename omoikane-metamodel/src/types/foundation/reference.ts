/**
 * @fileoverview 統一された参照型システム（Foundation Reference）
 *
 * **目的:**
 * 全ての文書間参照に使用される汎用的な型定義を提供します。
 * 型安全な参照システムにより、文書間の関係性を厳密に管理できます。
 *
 * **主要機能:**
 * 1. Ref<T>: 型付き参照型（IDと表示名）
 * 2. createRef<T>(): 参照ファクトリー関数
 * 3. RefArray<T>: 参照配列型エイリアス
 * 4. isValidRef<T>(): 参照検証ヘルパー
 * 5. extractRefIds<T>(): ID抽出ヘルパー
 *
 * **設計原則:**
 * - 型安全性: ジェネリクスで参照対象の型を保証
 * - シンプル性: 最小限のフィールド（id, displayName）
 * - 拡張性: 任意の文書型に適用可能
 *
 * **使用例:**
 * ```typescript
 * // アクター参照
 * const actorRef: Ref<Actor> = {
 *   id: 'actor-001',
 *   displayName: '購入者'
 * };
 *
 * // ユースケース参照配列
 * const useCaseRefs: RefArray<UseCase> = [
 *   { id: 'uc-001', displayName: 'ログイン' },
 *   { id: 'uc-002', displayName: '商品検索' }
 * ];
 *
 * // 参照作成
 * const ref = createRef<BusinessGoal>('goal-001', '売上向上');
 *
 * // 参照検証
 * if (isValidRef(ref)) {
 *   console.log(ref.id);
 * }
 *
 * // ID抽出
 * const ids = extractRefIds(useCaseRefs);
 * // ids = ['uc-001', 'uc-002']
 * ```
 *
 * @module types/foundation/reference
 */

// ============================================================================
// 参照型定義
// ============================================================================

/**
 * 型安全な文書参照
 *
 * **目的:**
 * 文書間の参照を型安全に表現します。
 * ジェネリクス型パラメータTにより、参照対象の型を明示的に指定できます。
 *
 * **フィールド:**
 * - id: 参照先のID（システム全体で一意）
 * - displayName: 表示名（オプション、IDEやUIでの可読性向上）
 *
 * **ジェネリクス型パラメータ:**
 * @template T - 参照対象の型（例: Actor, UseCase, BusinessGoal等）
 *
 * **使用例:**
 * ```typescript
 * // アクター参照
 * const actorRef: Ref<Actor> = {
 *   id: 'actor-001',
 *   displayName: '購入者'
 * };
 *
 * // ユースケース参照
 * const useCaseRef: Ref<UseCase> = {
 *   id: 'uc-001',
 *   displayName: 'ログイン'
 * };
 *
 * // ビジネスゴール参照
 * const goalRef: Ref<BusinessGoal> = {
 *   id: 'goal-001',
 *   displayName: '売上を20%向上させる'
 * };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Ref<T> {
  /** 参照先のID（一意識別子） */
  id: string;

  /** 表示名（任意、IDEでの可読性向上のため） */
  displayName?: string;
}

// ============================================================================
// 参照ヘルパー関数
// ============================================================================

/**
 * 参照ファクトリー関数
 *
 * **目的:**
 * 型安全に参照を作成するヘルパー関数です。
 * オブジェクトリテラルより簡潔に参照を作成できます。
 *
 * **ジェネリクス型パラメータ:**
 * @template T - 参照対象の型
 *
 * **パラメータ:**
 * @param id - 参照先のID
 * @param displayName - 表示名（任意）
 *
 * **戻り値:**
 * @returns 型付き参照
 *
 * **使用例:**
 * ```typescript
 * // オブジェクトリテラルでの作成
 * const ref1: Ref<Actor> = { id: 'actor-001', displayName: '購入者' };
 *
 * // ファクトリー関数での作成（より簡潔）
 * const ref2 = createRef<Actor>('actor-001', '購入者');
 *
 * // 表示名なしでも作成可能
 * const ref3 = createRef<UseCase>('uc-001');
 * ```
 */
export function createRef<T>(id: string, displayName?: string): Ref<T> {
  return { id, displayName };
}

/**
 * 参照配列型
 *
 * **目的:**
 * 複数の参照を扱う場合の型エイリアスです。
 * コードの可読性を向上させます。
 *
 * **ジェネリクス型パラメータ:**
 * @template T - 参照対象の型
 *
 * **使用例:**
 * ```typescript
 * const actorRefs: RefArray<Actor> = [
 *   { id: 'actor-001', displayName: '購入者' },
 *   { id: 'actor-002', displayName: '管理者' }
 * ];
 *
 * // Ref<Actor>[]と同じ意味だが、より明確
 * const useCaseRefs: RefArray<UseCase> = [
 *   { id: 'uc-001', displayName: 'ログイン' },
 *   { id: 'uc-002', displayName: '商品検索' }
 * ];
 * ```
 */
export type RefArray<T> = Ref<T>[];

/**
 * 参照検証ヘルパー
 *
 * **目的:**
 * 参照が有効かどうかをチェックします。
 * TypeScriptの型ガード（type guard）として機能し、
 * undefined/nullチェックとID妥当性チェックを行います。
 *
 * **検証内容:**
 * 1. undefined/nullでないこと
 * 2. idフィールドが文字列型であること
 * 3. idが空文字列でないこと
 *
 * **ジェネリクス型パラメータ:**
 * @template T - 参照対象の型
 *
 * **パラメータ:**
 * @param ref - チェック対象の参照
 *
 * **戻り値:**
 * @returns 参照が有効な場合true
 *
 * **使用例:**
 * ```typescript
 * function processRef(ref: Ref<Actor> | undefined) {
 *   if (isValidRef(ref)) {
 *     // この中ではrefはRef<Actor>型として扱われる
 *     console.log(ref.id);
 *   } else {
 *     console.log('無効な参照です');
 *   }
 * }
 *
 * // 検証例
 * isValidRef({ id: 'actor-001' }); // true
 * isValidRef({ id: '' }); // false（空文字列）
 * isValidRef(undefined); // false
 * isValidRef(null); // false
 * ```
 */
export function isValidRef<T>(ref: Ref<T> | undefined | null): ref is Ref<T> {
  return ref !== undefined && ref !== null && typeof ref.id === 'string' && ref.id.length > 0;
}

/**
 * 参照ID抽出ヘルパー
 *
 * **目的:**
 * 参照または参照配列からIDのみを抽出します。
 * 無効な参照は自動的にフィルタリングされます。
 *
 * **処理内容:**
 * 1. 単一参照を配列に変換（配列の場合はそのまま）
 * 2. 無効な参照をフィルタリング（isValidRefで検証）
 * 3. IDのみを抽出して配列として返す
 *
 * **ジェネリクス型パラメータ:**
 * @template T - 参照対象の型
 *
 * **パラメータ:**
 * @param refs - 参照または参照配列
 *
 * **戻り値:**
 * @returns ID配列
 *
 * **使用例:**
 * ```typescript
 * // 単一参照からID抽出
 * const id = extractRefIds({ id: 'actor-001', displayName: '購入者' });
 * // id = ['actor-001']
 *
 * // 参照配列からID抽出
 * const ids = extractRefIds([
 *   { id: 'actor-001', displayName: '購入者' },
 *   { id: 'actor-002', displayName: '管理者' },
 *   { id: '', displayName: '無効' } // 空文字列は除外される
 * ]);
 * // ids = ['actor-001', 'actor-002']
 *
 * // 無効な参照を含む配列
 * const mixedIds = extractRefIds([
 *   { id: 'uc-001', displayName: 'ログイン' },
 *   null as any, // 除外される
 *   { id: 'uc-002', displayName: '商品検索' }
 * ]);
 * // mixedIds = ['uc-001', 'uc-002']
 * ```
 */
export function extractRefIds<T>(refs: Ref<T> | Ref<T>[]): string[] {
  const refArray = Array.isArray(refs) ? refs : [refs];
  return refArray.filter(isValidRef).map(ref => ref.id);
}
