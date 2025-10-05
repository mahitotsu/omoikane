/**
 * アクター型定義
 * システムの利用者や関係者を表す
 */

import type { DocumentBase, Ref } from '../foundation/index.js';

/**
 * アクターの役割
 */
export type ActorRole = 'primary' | 'secondary' | 'external';

/**
 * アクター（システム利用者・関係者）
 */
export interface Actor extends DocumentBase {
  /** アクターの役割 */
  role: ActorRole;
  
  /** 責務・役割の説明 */
  responsibilities: string[];
}

/**
 * アクター参照情報
 * ユースケースステップなどで使用される柔軟な参照形式
 */
export type ActorReference = string | Ref<Actor>;

/**
 * アクター参照をID文字列に正規化
 * 
 * @param actorRef - アクター参照（文字列またはRef）
 * @returns アクターID
 */
export function normalizeActorRef(actorRef: ActorReference): string {
  return typeof actorRef === 'string' ? actorRef : actorRef.id;
}

/**
 * アクター参照配列をID配列に正規化
 * 
 * @param actorRefs - アクター参照の配列
 * @returns アクターID配列
 */
export function normalizeActorRefs(actorRefs: ActorReference[]): string[] {
  return actorRefs.map(normalizeActorRef);
}
