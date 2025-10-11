/**
 * @fileoverview Omoikane Metamodel - Type Definitions（型定義統合エクスポート）
 *
 * **目的:**
 * Omoikane Metamodelの全ての型定義を統合してエクスポートします。
 * レイヤー構造に基づいた段階的な型システムを提供します。
 *
 * **レイヤー構造:**
 * ```
 * ┌─────────────────────────────────────────┐
 * │         Cross-Cutting Layer             │  横断的関心事
 * │   (Traceability, Versioning)            │  トレーサビリティ、バージョニング
 * ├─────────────────────────────────────────┤
 * │         UI Layer                        │  ユーザーインターフェース
 * │   (Screen, ScreenFlow, ValidationRule)  │  画面定義、画面遷移、バリデーション
 * ├─────────────────────────────────────────┤
 * │         Functional Layer                │  機能要件
 * │      (UseCase, Actor)                   │  ユースケース、アクター
 * ├─────────────────────────────────────────┤
 * │         Business Layer                  │  業務要件
 * │   (Business Requirements)               │  業務要件定義
 * ├─────────────────────────────────────────┤
 * │         Foundation Layer                │  基礎層
 * │   (Primitives, Reference, DocumentBase) │  プリミティブ、参照、文書基底
 * └─────────────────────────────────────────┘
 * ```
 *
 * **使用例:**
 * ```typescript
 * // レイヤー名前空間経由でアクセス（推奨）:
 * import { Foundation, Business, Functional, CrossCutting } from './types/index.js';
 *
 * const doc: Foundation.DocumentBase = {
 *   id: 'doc-001',
 *   name: 'ドキュメント',
 *   metadata: { ... }
 * };
 *
 * const actor: Functional.Actor = {
 *   id: 'actor-001',
 *   name: '購入者',
 *   ...
 * };
 *
 * // 直接インポート（型のみ）:
 * import type { Actor, UseCase } from './types/index.js';
 *
 * // ヘルパー関数のインポート:
 * import { createRef, normalizeActorRef } from './types/index.js';
 * ```
 *
 * **設計原則:**
 * 1. **レイヤー分離**: 各レイヤーは下位レイヤーのみに依存
 * 2. **段階的詳細化**: 必須フィールドのみで開始、詳細化は任意
 * 3. **型安全性**: TypeScriptのジェネリクスと型推論を最大限活用
 * 4. **拡張性**: 新しい型や機能を追加しやすい構造
 *
 * @module types
 */

// ============================================================================
// Foundation Layer（基礎層）
// ============================================================================

/**
 * Foundation Layer - 基礎層
 *
 * プリミティブ型、参照型、文書基底型など、全てのレイヤーで使用される基礎的な型定義。
 *
 * **主要な型:**
 * - Ref<T>: 軽量な参照型
 * - DocumentBase: 文書基底型
 * - Metadata: メタデータ型
 * - Identifiable: 識別可能インターフェース
 *
 * **使用例:**
 * ```typescript
 * import { Foundation } from './types/index.js';
 *
 * const ref: Foundation.Ref<MyDocument> = {
 *   id: 'doc-001',
 *   name: 'ドキュメント名'
 * };
 * ```
 */
export * as Foundation from './foundation/index.js';

/**
 * Foundation Layer - 型定義（直接エクスポート）
 *
 * **型:**
 * - DocumentBase: 文書基底型
 * - Metadata: メタデータ型
 * - Ref<T>: 参照型
 * - Identifiable: 識別可能インターフェース
 * - Versionable: バージョン管理可能インターフェース
 * - Approvable: 承認可能インターフェース
 * - Categorizable: 分類可能インターフェース
 * - TraceableDocument: トレース可能文書型
 * - PriorityLevel: 優先度レベル
 * - QualityLevel: 品質レベル
 * - SeverityLevel: 深刻度レベル
 * - DateRange: 日付範囲型
 * - ChangeLogEntry: 変更履歴エントリ型
 * - RefArray<T>: 参照配列型
 */
export type {
    Approvable,
    Categorizable,
    ChangeLogEntry,
    DateRange,
    DocumentBase,
    // 文書基底
    Identifiable,
    Metadata,
    // プリミティブ型
    PriorityLevel,
    QualityLevel,
    // 参照型
    Ref,
    RefArray,
    SeverityLevel,
    TraceableDocument,
    Versionable
} from './foundation/index.js';

/**
 * Foundation Layer - ヘルパー関数
 *
 * **関数:**
 * - createRef<T>(): 参照を作成
 * - isValidRef<T>(): 参照の検証
 * - extractRefIds<T>(): 参照IDの抽出
 * - isVersionable(): バージョン管理可能か判定
 * - isApprovable(): 承認可能か判定
 * - isCategorizable(): 分類可能か判定
 * - isTraceableDocument(): トレース可能文書か判定
 */
export {
    // 参照ヘルパー
    createRef,
    extractRefIds,
    isApprovable,
    isCategorizable,
    // 文書型判定
    isTraceableDocument,
    isValidRef,
    isVersionable
} from './foundation/index.js';

// ============================================================================
// Business Layer（業務層）
// ============================================================================

/**
 * Business Layer - 業務層
 *
 * 業務要件定義、ビジネスルール、セキュリティポリシーなどの業務要件関連の型定義。
 *
 * **主要な型:**
 * - BusinessRequirementDefinition: 業務要件定義
 * - BusinessRequirementItem: 業務要件項目
 * - BusinessRule: ビジネスルール
 * - SecurityPolicy: セキュリティポリシー
 *
 * **使用例:**
 * ```typescript
 * import { Business } from './types/index.js';
 *
 * const req: Business.BusinessRequirementDefinition = {
 *   id: 'br-001',
 *   name: '業務要件書',
 *   title: 'ECサイト業務要件',
 *   summary: '...',
 *   businessGoals: [...],
 *   scope: { inScope: [...], outOfScope: [...] },
 *   stakeholders: [...],
 *   metadata: { ... }
 * };
 * ```
 */
export * as Business from './business/index.js';

/**
 * Business Layer - 型定義（直接エクスポート）
 *
 * **型:**
 * - BusinessRequirementDefinition: 業務要件定義
 * - BusinessRequirementItem: 業務要件項目
 * - BusinessRequirementScope: 業務要件スコープ
 * - BusinessRequirementCoverage: 業務要件カバレッジ
 * - BusinessRule: ビジネスルール
 * - SecurityPolicy: セキュリティポリシー
 */
export type {
    BusinessRequirementCoverage,
    BusinessRequirementDefinition,
    BusinessRequirementItem,
    BusinessRequirementScope,
    BusinessRule,
    SecurityPolicy
} from './business/index.js';

// ============================================================================
// Functional Layer（機能層）
// ============================================================================

/**
 * Functional Layer - 機能層
 *
 * ユースケース、アクター、ユースケースステップなどの機能要件関連の型定義。
 *
 * **主要な型:**
 * - UseCase: ユースケース
 * - Actor: アクター
 * - UseCaseStep: ユースケースステップ
 * - AlternativeFlow: 代替フロー
 *
 * **使用例:**
 * ```typescript
 * import { Functional } from './types/index.js';
 *
 * const actor: Functional.Actor = {
 *   id: 'actor-001',
 *   name: '購入者',
 *   description: 'ECサイトで商品を購入する',
 *   role: 'primary',
 *   responsibilities: ['商品を購入する'],
 *   metadata: { ... }
 * };
 *
 * const uc: Functional.UseCase = {
 *   id: 'uc-001',
 *   name: '商品を購入する',
 *   description: '購入者が商品を購入する',
 *   actors: {
 *     primary: { id: 'actor-001', name: '購入者' }
 *   },
 *   preconditions: ['ログイン済み'],
 *   postconditions: ['注文完了'],
 *   mainFlow: [...],
 *   priority: 'high',
 *   metadata: { ... }
 * };
 * ```
 */
export * as Functional from './functional/index.js';

/**
 * Functional Layer - 型定義（直接エクスポート）
 *
 * **型:**
 * - Actor: アクター
 * - ActorRole: アクター役割
 * - ActorReference: アクター参照
 * - UseCase: ユースケース
 * - UseCaseActors: ユースケースアクター
 * - UseCaseStep: ユースケースステップ
 * - UseCaseComplexity: ユースケース複雑度
 * - AlternativeFlow: 代替フロー
 * - FlowProbability: フロー発生確率
 * - FlowImpact: フロー影響度
 */
export type {
    Actor,
    ActorReference,
    ActorRole,
    AlternativeFlow,
    FlowImpact,
    FlowProbability,
    UseCase,
    UseCaseActors,
    UseCaseComplexity,
    UseCaseStep
} from './functional/index.js';

/**
 * Functional Layer - ヘルパー関数
 *
 * **関数:**
 * - normalizeActorRef(): アクター参照を正規化
 * - normalizeActorRefs(): 複数のアクター参照を正規化
 */
export { normalizeActorRef, normalizeActorRefs } from './functional/index.js';

// ============================================================================
// UI Layer（UI層）
// ============================================================================

/**
 * UI Layer - ユーザーインターフェース層
 *
 * 画面定義、画面遷移、バリデーションルール等のUI要素を提供。
 *
 * **主要な型:**
 * - Screen: 画面定義
 * - ScreenFlow: 画面遷移
 * - ValidationRule: バリデーションルール
 * - InputField: 入力フィールド
 * - DisplayField: 表示フィールド
 * - ScreenAction: 画面アクション
 *
 * **使用例:**
 * ```typescript
 * import { UI } from './types/index.js';
 *
 * const screen: UI.Screen = {
 *   id: 'form-screen',
 *   name: 'フォーム画面',
 *   screenType: 'form',
 *   inputFields: [
 *     {
 *       id: 'email',
 *       name: 'email',
 *       label: 'メールアドレス',
 *       fieldType: 'email',
 *       required: true,
 *       validationRules: [{ id: 'validation-email-format' }]
 *     }
 *   ],
 *   metadata: { ... }
 * };
 * ```
 */
export * as UI from './ui/index.js';

/**
 * UI Layer - 型定義（直接エクスポート）
 *
 * **型:**
 * - Screen: 画面定義
 * - ScreenType: 画面タイプ
 * - ScreenFlow: 画面遷移フロー
 * - ScreenTransition: 画面遷移
 * - ScreenActionRef: 画面アクション参照
 * - ValidationRule: バリデーションルール
 * - ValidationRuleType: バリデーションルールタイプ
 * - InputField: 入力フィールド
 * - FieldType: フィールドタイプ
 * - SelectOption: 選択肢
 * - DisplayField: 表示フィールド
 * - DisplayFieldType: 表示フィールドタイプ
 * - ScreenAction: 画面アクション
 * - ScreenActionType: 画面アクションタイプ
 */
export type {
    DisplayField,
    DisplayFieldType,
    FieldType,
    InputField,
    Screen,
    ScreenAction,
    ScreenActionRef,
    ScreenActionType,
    ScreenFlow,
    ScreenTransition,
    ScreenType,
    SelectOption,
    ValidationRule,
    ValidationRuleType
} from './ui/index.js';

// ============================================================================
// Cross-Cutting Layer（横断層）
// ============================================================================

/**
 * Cross-Cutting Layer - 横断層
 *
 * トレーサビリティ、バージョニングなど、複数のレイヤーにまたがる横断的関心事の型定義。
 *
 * **主要な型:**
 * - TraceabilityMatrix: トレーサビリティマトリクス
 * - DocumentRelationship: ドキュメント関係性
 * - RelationType: 関係性タイプ
 *
 * **使用例:**
 * ```typescript
 * import { CrossCutting } from './types/index.js';
 *
 * const matrix: CrossCutting.TraceabilityMatrix = {
 *   id: 'tm-001',
 *   name: 'トレーサビリティマトリクス',
 *   relationships: [
 *     {
 *       source: { id: 'uc-001', name: 'ユースケース' },
 *       target: { id: 'br-001', name: '業務要件書' },
 *       type: 'satisfies'
 *     }
 *   ],
 *   metadata: { ... }
 * };
 * ```
 */
export * as CrossCutting from './cross-cutting/index.js';

/**
 * Cross-Cutting Layer - Enum定義（直接エクスポート）
 *
 * **Enum:**
 * - RelationType: 関係性タイプ（satisfies, implements, derives, refines, traces等）
 */
export { RelationType } from './cross-cutting/index.js';

/**
 * Cross-Cutting Layer - 型定義（直接エクスポート）
 *
 * **型:**
 * - TraceabilityMatrix: トレーサビリティマトリクス
 * - DocumentRelationship: ドキュメント関係性
 * - TraceabilityAnalysis: トレーサビリティ分析結果
 * - TraceabilityValidation: トレーサビリティ検証結果
 * - TraceabilityIssue: トレーサビリティ問題
 */
export type {
    DocumentRelationship,
    TraceabilityAnalysis,
    TraceabilityIssue,
    TraceabilityMatrix,
    TraceabilityValidation
} from './cross-cutting/index.js';

