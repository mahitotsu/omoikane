/**
 * 型安全なアクター・ユースケース参照システム
 * IDE補完とコンパイル時型チェックを提供
 * 
 * ⚠️ このファイルは自動生成されます
 * 手動編集は scripts/generate-typed-references.ts で行ってください
 * 
 * 最終更新: 2025-10-01T16:19:54.758Z
 */

import type { Actor, DeliveryElement } from './delivery-elements';

// 既知のアクターIDの型定義（自動生成）
export type KnownActorId = 'customer'
  | 'email-service'
  | 'database-system'
  | 'validation-service'
  | 'payment-service'
  | 'shipping-service'
  | 'loyalty-service'
  | 'tracking-service'
  | 'admin'
  | 'inventory-system'
  | 'image-service'
  | 'search-service'
  | 'recommendation-engine'
  | 'cart-service'
  | 'security-service'
  | 'sms-service';

// 既知のユースケースIDの型定義（自動生成）
export type KnownUseCaseId = 'user-registration'
  | 'order-processing'
  | 'order-tracking'
  | 'product-registration'
  | 'product-search'
  | 'cart-management'
  | 'user-login'
  | 'password-reset'
  | 'user-logout';

/**
 * 型安全なアクター参照型
 */
export interface TypedActorRef<T extends KnownActorId = KnownActorId> {
  readonly actorId: T;
  readonly type: 'actor-ref';
}

/**
 * 型安全なユースケース参照型
 */
export interface TypedUseCaseRef<T extends KnownUseCaseId = KnownUseCaseId> {
  readonly useCaseId: T;
  readonly type: 'usecase-ref';
}

/**
 * 型安全なヘルパー関数 - IDE補完対応
 */
export function typedActorRef<T extends KnownActorId>(actorId: T): TypedActorRef<T> {
  return { actorId, type: 'actor-ref' };
}

export function typedUseCaseRef<T extends KnownUseCaseId>(useCaseId: T): TypedUseCaseRef<T> {
  return { useCaseId, type: 'usecase-ref' };
}

/**
 * アクター情報を含む強化された参照型
 */
export interface EnhancedActorRef<T extends KnownActorId = KnownActorId> extends TypedActorRef<T> {
  // 実行時にアクター情報を解決するためのヘルパー
  resolve(): Actor | undefined;
}

/**
 * 実行時アクター解決機能付きの参照作成
 */
export function createActorRef<T extends KnownActorId>(
  actorId: T,
  actorRegistry?: Map<string, Actor>
): EnhancedActorRef<T> {
  return {
    actorId,
    type: 'actor-ref',
    resolve(): Actor | undefined {
      return actorRegistry?.get(actorId);
    }
  };
}

/**
 * アクター定義とその型安全な参照作成を組み合わせたヘルパー
 */
export interface ActorDefinition<T extends KnownActorId> {
  actor: Actor;
  ref: TypedActorRef<T>;
}

export function defineActor<T extends KnownActorId>(
  id: T,
  definition: Omit<Actor, 'id'>
): ActorDefinition<T> {
  const actor: Actor = {
    id,
    ...definition
  };

  const ref: TypedActorRef<T> = {
    actorId: id,
    type: 'actor-ref'
  };

  return { actor, ref };
}

// 型の再エクスポート（互換性のため）
export type { Actor, DeliveryElement, UseCase } from './delivery-elements';
export interface TypedUseCase extends Omit<DeliveryElement, 'type'> {
  readonly type: 'usecase';
  name: string;
  description: string;
  actors: {
    primary: TypedActorRef;
    secondary?: TypedActorRef[];
  };
  preconditions: string[];
  postconditions: string[];
  mainFlow: TypedUseCaseStep[];
  alternativeFlows?: TypedAlternativeFlow[];
  businessValue: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TypedUseCaseStep {
  stepNumber: number;
  actor: TypedActorRef;
  action: string;
  expectedResult: string;
  notes?: string;
}

export interface TypedAlternativeFlow {
  id: string;
  name: string;
  condition: string;
  steps: TypedUseCaseStep[];
  returnToStep?: number;
}

/**
 * 生成統計情報
 */
export const generatedStats = {
  actors: 16,
  useCases: 9,
  generatedAt: '2025-10-01T16:19:54.758Z',
  sourceFiles: ['src/documents/requirements/user-registration.ts', 'src/documents/requirements/order-processing.ts', 'src/documents/requirements/product-management.ts', 'src/documents/requirements/product-browsing.ts', 'src/documents/requirements/user-authentication.ts']
} as const;
