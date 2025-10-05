/**
 * Functional レイヤー
 * 機能仕様（ユースケース、アクター）に関する型定義
 */

export type {
    Actor,
    ActorReference, ActorRole
} from './actor.js';

export {
    normalizeActorRef,
    normalizeActorRefs
} from './actor.js';

export type {
    AlternativeFlow, FlowImpact, FlowProbability, UseCase, UseCaseActors, UseCaseComplexity, UseCaseStep
} from './use-case.js';

