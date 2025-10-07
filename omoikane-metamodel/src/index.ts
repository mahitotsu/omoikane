/**
 * @fileoverview Omoikane Metamodel - ITデリバリフレームワーク
 * 
 * **概要:**
 * TypeScriptによるユースケース・業務要件定義のための包括的なメタモデルフレームワークです。
 * 型安全性、トレーサビリティ、品質評価を統合的に提供します。
 * 
 * **アーキテクチャ:**
 * ```
 * ┌─────────────────────────────────────────────────────┐
 * │              Omoikane Metamodel                     │
 * ├─────────────────────────────────────────────────────┤
 * │  Quality Layer (品質評価層)                          │
 * │  ├─ 品質評価エンジン                                  │
 * │  ├─ AI推奨システム                                    │
 * │  └─ メトリクスダッシュボード                           │
 * ├─────────────────────────────────────────────────────┤
 * │  Type Layer (型定義層)                               │
 * │  ├─ Foundation (基礎層): 参照、文書基底、プリミティブ   │
 * │  ├─ Business (業務層): 業務要件定義                    │
 * │  ├─ Functional (機能層): ユースケース、アクター         │
 * │  └─ Cross-Cutting (横断層): トレーサビリティ           │
 * ├─────────────────────────────────────────────────────┤
 * │  Utility Layer (ユーティリティ層)                     │
 * │  ├─ stepNumber自動管理                               │
 * │  ├─ 関係性分析                                        │
 * │  └─ カバレッジ分析                                     │
 * └─────────────────────────────────────────────────────┘
 * ```
 * 
 * **主要機能:**
 * 1. **型定義フレームワーク** - レイヤー化された型システム
 * 2. **品質評価** - 自動品質評価とAI推奨
 * 3. **トレーサビリティ** - 要件とユースケースの追跡
 * 4. **関係性分析** - アクターとユースケースの関係分析
 * 5. **カバレッジ分析** - セキュリティ・ビジネスルールのカバレッジ
 * 
 * **使用例:**
 * ```typescript
 * import {
 *   Foundation,
 *   Business,
 *   Functional,
 *   CrossCutting,
 *   assessQuality,
 *   RelationshipAnalyzer
 * } from 'omoikane-metamodel';
 * 
 * // 業務要件定義の作成
 * const requirement: Business.BusinessRequirementDefinition = {
 *   id: 'br-001',
 *   name: '業務要件書',
 *   businessGoals: [...],
 *   scope: {...},
 *   metadata: {...}
 * };
 * 
 * // ユースケースの作成
 * const useCase: Functional.UseCase = {
 *   id: 'uc-001',
 *   name: '商品を購入する',
 *   actors: {
 *     primary: { id: 'actor-001', name: '購入者' }
 *   },
 *   mainFlow: [...],
 *   metadata: {...}
 * };
 * 
 * // 品質評価
 * const qualityResult = await assessQuality([requirement], [useCase]);
 * console.log(`品質スコア: ${qualityResult.overallScore}`);
 * 
 * // 関係性分析
 * const analyzer = new RelationshipAnalyzer();
 * analyzer.addUseCase(useCase);
 * const analysis = analyzer.analyze();
 * ```
 * 
 * @module index
 * @version 1.0.0
 * @license MIT
 */

// ============================================================================
// レイヤー型定義（名前空間エクスポート）
// ============================================================================

/**
 * Foundation Layer - 基礎層
 * 
 * プリミティブ型、参照型、文書基底型などの基礎的な型定義を提供します。
 * 
 * **主要な型:**
 * - `Ref<T>`: 型安全な参照型
 * - `DocumentBase`: 文書の基底型
 * - `TraceableDocument`: トレーサビリティ対応文書
 * - `Metadata`: メタデータ型
 * 
 * @example
 * ```typescript
 * import { Foundation } from 'omoikane-metamodel';
 * 
 * const ref: Foundation.Ref<MyType> = {
 *   id: 'my-001',
 *   name: 'My Document'
 * };
 * ```
 */
export * as Foundation from './types/foundation/index.js';

/**
 * Business Layer - 業務層
 * 
 * 業務要件定義に関連する型を提供します。
 * 
 * **主要な型:**
 * - `BusinessRequirementDefinition`: 業務要件定義
 * - `BusinessRule`: ビジネスルール
 * - `SecurityPolicy`: セキュリティポリシー
 * 
 * @example
 * ```typescript
 * import { Business } from 'omoikane-metamodel';
 * 
 * const requirement: Business.BusinessRequirementDefinition = {
 *   id: 'br-001',
 *   name: '業務要件書',
 *   businessGoals: [...],
 *   scope: {...}
 * };
 * ```
 */
export * as Business from './types/business/index.js';

/**
 * Functional Layer - 機能層
 * 
 * ユースケース、アクターなどの機能要素の型を提供します。
 * 
 * **主要な型:**
 * - `UseCase`: ユースケース
 * - `Actor`: アクター
 * - `UseCaseStep`: ユースケースステップ
 * - `AlternativeFlow`: 代替フロー
 * 
 * @example
 * ```typescript
 * import { Functional } from 'omoikane-metamodel';
 * 
 * const useCase: Functional.UseCase = {
 *   id: 'uc-001',
 *   name: '商品を購入する',
 *   actors: { primary: { id: 'actor-001', name: '購入者' } },
 *   mainFlow: [...]
 * };
 * ```
 */
export * as Functional from './types/functional/index.js';

/**
 * Cross-Cutting Layer - 横断層
 * 
 * トレーサビリティ、バージョニングなどの横断的関心事の型を提供します。
 * 
 * **主要な型:**
 * - `TraceabilityMatrix`: トレーサビリティマトリクス
 * - `DocumentRelationship`: 文書間関係
 * - `RelationType`: 関係タイプ
 * 
 * @example
 * ```typescript
 * import { CrossCutting } from 'omoikane-metamodel';
 * 
 * const matrix: CrossCutting.TraceabilityMatrix = {
 *   id: 'tm-001',
 *   name: 'トレーサビリティマトリクス',
 *   relationships: [...]
 * };
 * ```
 */
export * as CrossCutting from './types/cross-cutting/index.js';

// ============================================================================
// Foundation層 - 主要型の再エクスポート（便利のため）
// ============================================================================

/**
 * Foundation層から頻繁に使用される型を再エクスポートします。
 * これにより、`import { Ref } from 'omoikane-metamodel'` のように
 * 簡潔にインポートできます。
 */
/**
 * Foundation層から頻繁に使用される型を再エクスポートします。
 * これにより、`import { Ref } from 'omoikane-metamodel'` のように
 * 簡潔にインポートできます。
 */

// 基礎型
export type {
    /** 一意識別子を持つオブジェクトのインターフェース */
    Identifiable,
    /** 型安全な参照型 */
    Ref,
    /** 参照型の配列 */
    RefArray,
    /** 文書の基底型 */
    DocumentBase,
    /** トレーサビリティ対応文書 */
    TraceableDocument,
    /** メタデータ型 */
    Metadata,
    /** 変更履歴エントリ */
    ChangeLogEntry,
    /** 日付範囲型 */
    DateRange
} from './types/foundation/index.js';

// インターフェース型
export type {
    /** バージョン管理可能なオブジェクト */
    Versionable,
    /** 承認可能なオブジェクト */
    Approvable,
    /** カテゴリ化可能なオブジェクト */
    Categorizable
} from './types/foundation/index.js';

// プリミティブ型
export type {
    /** 優先度レベル */
    PriorityLevel,
    /** 品質レベル */
    QualityLevel,
    /** 深刻度レベル */
    SeverityLevel
} from './types/foundation/index.js';

// ヘルパー関数
export {
    /** 参照オブジェクトを作成 */
    createRef,
    /** 参照配列からIDを抽出 */
    extractRefIds,
    /** 有効な参照かチェック */
    isValidRef,
    /** トレーサブル文書かチェック */
    isTraceableDocument,
    /** バージョン管理可能かチェック */
    isVersionable,
    /** 承認可能かチェック */
    isApprovable,
    /** カテゴリ化可能かチェック */
    isCategorizable
} from './types/foundation/index.js';

// ============================================================================
// Quality Layer - 品質評価ユーティリティ
// ============================================================================

/**
 * セキュリティ要件カバレッジ分析
 * 
 * ユースケースがセキュリティポリシーをどの程度カバーしているかを分析します。
 */
export type {
    /** 任意のユースケース型（型安全性のため） */
    AnyUseCase,
    /** セキュリティポリシーカバレッジエントリ */
    SecurityPolicyCoverageEntry,
    /** セキュリティポリシー統計 */
    SecurityPolicyStats,
    /** セキュリティポリシーサマリー */
    SecurityPolicySummary
} from './quality/security-requirements.js';

export {
    /** セキュリティポリシーカバレッジを構築 */
    buildSecurityPolicyCoverage,
    /** セキュリティポリシー統計を計算 */
    calculateSecurityPolicyStats,
    /** セキュリティポリシーIDを収集 */
    collectSecurityPolicyIds,
    /** セキュリティポリシーをサマリー */
    summarizeSecurityPolicies
} from './quality/security-requirements.js';

/**
 * ビジネスルールカバレッジ分析
 * 
 * ユースケースがビジネスルールをどの程度カバーしているかを分析します。
 */
export type {
    /** ビジネスルールカバレッジエントリ */
    BusinessRuleCoverageEntry,
    /** ビジネスルール統計 */
    BusinessRuleStats,
    /** ビジネスルールサマリー */
    BusinessRuleSummary
} from './quality/business-rules.ts';

export {
    /** ビジネスルールカバレッジを構築 */
    buildBusinessRuleCoverage,
    /** ビジネスルール統計を計算 */
    calculateBusinessRuleStats,
    /** ビジネスルールIDを収集 */
    collectBusinessRuleIds,
    /** ビジネスルールをサマリー */
    summarizeBusinessRules
} from './quality/business-rules.ts';

/**
 * 品質評価エンジン
 * 
 * 業務要件定義とユースケースの品質を総合的に評価します。
 * 
 * @example
 * ```typescript
 * import { assessQuality } from 'omoikane-metamodel';
 * 
 * const result = await assessQuality(
 *   [businessRequirement],
 *   [useCase1, useCase2]
 * );
 * 
 * console.log(`品質スコア: ${result.overallScore}`);
 * console.log(`改善提案: ${result.recommendations.length}件`);
 * ```
 */
export { assessQuality } from './quality/assessor.js';

/**
 * 品質評価結果型
 */
export type { QualityAssessmentResult } from './quality/types.js';

// ============================================================================
// Utility Layer - ユーティリティ関数
// ============================================================================

/**
 * stepNumber自動管理ユーティリティ
 * 
 * ユースケースステップのstepNumberを自動的に計算・管理します。
 * 
 * @example
 * ```typescript
 * import { enrichStepsWithNumbers } from 'omoikane-metamodel';
 * 
 * const enrichedUseCase = enrichStepsWithNumbers(useCase);
 * // mainFlowの各ステップにstepNumberが自動付与される
 * ```
 */
export {
    /** ステップにstepNumberを自動付与 */
    enrichStepsWithNumbers,
    /** stepIdまたはstepNumberでステップを検索 */
    findStepByIdOrNumber,
    /** 改善された注文処理例（デモ用） */
    improvedOrderProcessing
} from './types/step-number-solution.js';

/**
 * 関係性分析ユーティリティ
 * 
 * アクターとユースケースの関係を分析し、キーパーソンや複雑なユースケースを特定します。
 * 
 * @example
 * ```typescript
 * import { RelationshipAnalyzer } from 'omoikane-metamodel';
 * 
 * const analyzer = new RelationshipAnalyzer();
 * analyzer.addActor(actor1);
 * analyzer.addActor(actor2);
 * analyzer.addUseCase(useCase1);
 * analyzer.addUseCase(useCase2);
 * 
 * const analysis = analyzer.analyze();
 * console.log(analyzer.generateReport(analysis));
 * ```
 */
export type {
    /** アクター×ユースケース関係 */
    ActorUseCaseRelationship,
    /** 関係性分析結果 */
    RelationshipAnalysis
} from './types/relationship-analyzer.js';

export {
    /** 関係性アナライザークラス */
    RelationshipAnalyzer
} from './types/relationship-analyzer.js';

