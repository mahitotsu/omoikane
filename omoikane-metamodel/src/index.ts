/**
 * Omoikane Metamodel - ITDelivery Framework
 * 
 * TypeScriptによるユースケース・要件定義のためのメタモデル
 */

// 基本型定義をエクスポート
export type {
    Actor, ActorRef, AlternativeFlow, DeliveryElement, UseCase, UseCaseRef, UseCaseStep
} from './types/delivery-elements.js';

// ヘルパー関数をエクスポート
export {
    actorRef,
    useCaseRef
} from './types/delivery-elements.js';

// stepNumber自動管理ユーティリティ
export {
    enrichStepsWithNumbers,
    findStepByIdOrNumber,
    improvedOrderProcessing
} from './types/step-number-solution.js';

// 関係性分析
export type {
    ActorUseCaseRelationship,
    RelationshipAnalysis
} from './types/relationship-analyzer.js';

export {
    RelationshipAnalyzer
} from './types/relationship-analyzer.js';
