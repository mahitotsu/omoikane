/**
 * @fileoverview アクター型定義（Functional Actor）
 * 
 * **目的:**
 * システムの利用者や関係者（アクター）を表す型を定義します。
 * ユースケースや要件におけるアクターの役割と責務を明確に記述します。
 * 
 * **型定義:**
 * 1. ActorRole: アクターの役割（primary, secondary, external）
 * 2. Actor: アクター本体（ID、名前、役割、責務）
 * 3. ActorReference: アクター参照型（文字列またはRef<Actor>）
 * 4. normalizeActorRef(): 参照正規化関数
 * 5. normalizeActorRefs(): 参照配列正規化関数
 * 
 * **アクター役割の定義:**
 * - primary: 主要アクター（システムの主要な利用者）
 * - secondary: 副次アクター（システムを支援する関係者）
 * - external: 外部アクター（外部システムや組織）
 * 
 * **使用例:**
 * ```typescript
 * // 主要アクター（購入者）
 * const buyer: Actor = {
 *   id: 'actor-001',
 *   name: '購入者',
 *   role: 'primary',
 *   responsibilities: [
 *     '商品を検索する',
 *     '商品を購入する',
 *     '注文履歴を確認する'
 *   ],
 *   metadata: {
 *     createdAt: '2024-01-01T00:00:00Z',
 *     createdBy: 'analyst@example.com'
 *   }
 * };
 * 
 * // 副次アクター（管理者）
 * const admin: Actor = {
 *   id: 'actor-002',
 *   name: '管理者',
 *   role: 'secondary',
 *   responsibilities: [
 *     'ユーザーを管理する',
 *     '商品を管理する',
 *     'システムを監視する'
 *   ]
 * };
 * 
 * // アクター参照
 * const actorRef: ActorReference = 'actor-001';
 * const actorId = normalizeActorRef(actorRef); // 'actor-001'
 * ```
 * 
 * @module types/functional/actor
 */

import type { DocumentBase, Ref } from '../foundation/index.js';

// ============================================================================
// アクター型定義
// ============================================================================

/**
 * アクターの役割
 * 
 * **役割定義:**
 * - primary: 主要アクター
 *   システムの主要な利用者。システムの主要な機能を使用する。
 *   例: 購入者、会員、エンドユーザー
 * 
 * - secondary: 副次アクター
 *   システムを支援する関係者。主要アクターをサポートする。
 *   例: 管理者、オペレーター、サポート担当者
 * 
 * - external: 外部アクター
 *   外部システムや組織。システムと連携する外部エンティティ。
 *   例: 決済システム、配送業者、外部API
 * 
 * **使用例:**
 * ```typescript
 * const buyerRole: ActorRole = 'primary';
 * const adminRole: ActorRole = 'secondary';
 * const paymentSystemRole: ActorRole = 'external';
 * ```
 */
export type ActorRole = 'primary' | 'secondary' | 'external';

/**
 * アクター（システム利用者・関係者）
 * 
 * **目的:**
 * システムの利用者や関係者を表します。
 * ユースケースにおける「誰が」を明確に定義します。
 * 
 * **フィールド:**
 * - id: アクターID（一意識別子）
 * - name: アクター名（人間が読める名前）
 * - role: アクターの役割（primary, secondary, external）
 * - responsibilities: 責務・役割の説明リスト
 * - description: アクターの説明（オプション、DocumentBaseから継承）
 * - metadata: メタデータ（オプション、DocumentBaseから継承）
 * 
 * **使用例:**
 * ```typescript
 * const buyer: Actor = {
 *   id: 'actor-001',
 *   name: '購入者',
 *   type: 'actor',
 *   description: 'ECサイトで商品を購入する一般ユーザー',
 *   role: 'primary',
 *   responsibilities: [
 *     '商品を検索する',
 *     '商品を購入する',
 *     '注文履歴を確認する',
 *     'レビューを投稿する'
 *   ],
 *   metadata: {
 *     createdAt: '2024-01-01T00:00:00Z',
 *     createdBy: 'analyst@example.com',
 *     version: '1.0.0',
 *     tags: ['user', 'customer']
 *   }
 * };
 * ```
 */
export interface Actor extends DocumentBase {
  /** 文書型識別子（固定値: 'actor'） */
  type?: 'actor';
  
  /** アクターの役割（primary, secondary, external） */
  role: ActorRole;
  
  /** 責務・役割の説明（アクターが実行する操作や期待される振る舞い） */
  responsibilities: string[];
  
  /** アクターのゴール（このアクターが達成したい目標、オプション） */
  goals?: string[];
}

// ============================================================================
// アクター参照型
// ============================================================================

/**
 * アクター参照情報
 * 
 * **目的:**
 * ユースケースステップなどで使用される柔軟な参照形式を提供します。
 * 文字列ID（簡潔）またはRef<Actor>（型安全）の両方をサポートします。
 * 
 * **形式:**
 * - string: アクターID（シンプルな参照）
 * - Ref<Actor>: 型付き参照（IDと表示名）
 * 
 * **使用例:**
 * ```typescript
 * // 文字列での参照
 * const actorRef1: ActorReference = 'actor-001';
 * 
 * // Ref<Actor>での参照
 * const actorRef2: ActorReference = { 
 *   id: 'actor-001', 
 *   displayName: '購入者' 
 * };
 * 
 * // ユースケースステップでの使用
 * const step = {
 *   stepNumber: 1,
 *   actor: typedActorRef('actor-001'), // ActorReferenceとして使用
 *   action: '商品を検索する'
 * };
 * ```
 */
export type ActorReference = string | Ref<Actor>;

// ============================================================================
// アクター参照ヘルパー関数
// ============================================================================

/**
 * アクター参照をID文字列に正規化
 * 
 * **目的:**
 * ActorReference（文字列またはRef<Actor>）を統一的にID文字列に変換します。
 * 参照形式の違いを吸収し、一貫したID処理を可能にします。
 * 
 * **処理内容:**
 * - 文字列の場合: そのまま返す
 * - Ref<Actor>の場合: idフィールドを抽出
 * 
 * **パラメータ:**
 * @param actorRef - アクター参照（文字列またはRef）
 * 
 * **戻り値:**
 * @returns アクターID
 * 
 * **使用例:**
 * ```typescript
 * // 文字列参照を正規化
 * const id1 = normalizeActorRef('actor-001');
 * // id1 = 'actor-001'
 * 
 * // Ref参照を正規化
 * const id2 = normalizeActorRef({ 
 *   id: 'actor-001', 
 *   displayName: '購入者' 
 * });
 * // id2 = 'actor-001'
 * 
 * // 柔軟な参照処理
 * function processActor(actorRef: ActorReference) {
 *   const actorId = normalizeActorRef(actorRef);
 *   console.log(`Processing actor: ${actorId}`);
 * }
 * ```
 */
export function normalizeActorRef(actorRef: ActorReference): string {
  return typeof actorRef === 'string' ? actorRef : actorRef.id;
}

/**
 * アクター参照配列をID配列に正規化
 * 
 * **目的:**
 * ActorReference配列を統一的にID文字列配列に変換します。
 * 複数のアクター参照を一括処理する際に便利です。
 * 
 * **処理内容:**
 * 各要素をnormalizeActorRefで正規化し、ID配列を生成します。
 * 
 * **パラメータ:**
 * @param actorRefs - アクター参照の配列
 * 
 * **戻り値:**
 * @returns アクターID配列
 * 
 * **使用例:**
 * ```typescript
 * // 混在した参照配列を正規化
 * const refs: ActorReference[] = [
 *   'actor-001',
 *   { id: 'actor-002', displayName: '管理者' },
 *   'actor-003'
 * ];
 * const ids = normalizeActorRefs(refs);
 * // ids = ['actor-001', 'actor-002', 'actor-003']
 * 
 * // ユースケースで複数アクターを扱う
 * function getActorIds(actors: ActorReference[]): string[] {
 *   return normalizeActorRefs(actors);
 * }
 * ```
 */
export function normalizeActorRefs(actorRefs: ActorReference[]): string[] {
  return actorRefs.map(normalizeActorRef);
}
