/**
 * @fileoverview Functional レイヤー統合エクスポート
 *
 * **目的:**
 * 機能仕様（ユースケース、アクター）に関する型定義を統合してエクスポートします。
 * システムの「誰が」「何を」「どのように」を記述するための型を提供します。
 *
 * **提供機能:**
 * 1. アクター型: Actor, ActorRole, ActorReference
 * 2. アクターヘルパー: normalizeActorRef, normalizeActorRefs
 * 3. ユースケース型: UseCase, UseCaseStep, UseCaseActors, AlternativeFlow
 * 4. ユースケース列挙型: UseCaseComplexity, FlowProbability, FlowImpact
 *
 * **モジュール構成:**
 * - actor.ts: アクター型定義
 * - use-case.ts: ユースケース型定義
 *
 * **使用例:**
 * ```typescript
 * import {
 *   Actor,
 *   UseCase,
 *   UseCaseStep,
 *   normalizeActorRef
 * } from './functional/index.js';
 *
 * const buyer: Actor = {
 *   id: 'actor-001',
 *   name: '購入者',
 *   role: 'primary',
 *   responsibilities: ['商品を購入する']
 * };
 *
 * const useCase: UseCase = {
 *   id: 'uc-001',
 *   name: 'ログイン',
 *   actors: { primary: typedActorRef('actor-001') },
 *   preconditions: ['ユーザーが登録済みである'],
 *   postconditions: ['ユーザーがログイン状態になる'],
 *   mainFlow: [...],
 *   priority: 'high'
 * };
 * ```
 *
 * @module types/functional
 */

// ============================================================================
// アクター
// ============================================================================

export type { Actor, ActorReference, ActorRole } from './actor.js';

export { normalizeActorRef, normalizeActorRefs } from './actor.js';

// ============================================================================
// ユースケース
// ============================================================================

export type {
  AlternativeFlow,
  FlowImpact,
  FlowProbability,
  UseCase,
  UseCaseActors,
  UseCaseComplexity,
  UseCaseStep,
} from './use-case.js';
