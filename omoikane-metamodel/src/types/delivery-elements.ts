/**
 * @fileoverview ITデリバリプロジェクトの基本要素型定義（LEGACY）
 * 
 * ⚠️ **LEGACY COMPATIBILITY LAYER（後方互換性レイヤー）** ⚠️
 * 
 * **重要な注意:**
 * このファイルは後方互換性のために維持されていますが、**非推奨（deprecated）**です。
 * 新しいコードでは、以下のモジュール化された型を使用してください：
 * 
 * **移行先:**
 * - Foundation.* - 基礎型（Ref<T>, DocumentBase, Metadata等）
 * - Business.* - 業務要件（BusinessRequirementDefinition, BusinessRule等）
 * - Functional.* - 機能要素（Actor, UseCase, UseCaseStep等）
 * - CrossCutting.* - 横断要素（TraceabilityMatrix, RelationType等）
 * 
 * **移行ガイド:**
 * ```typescript
 * // 旧（非推奨）:
 * import { Actor, UseCase } from './types/delivery-elements.js';
 * 
 * // 新（推奨）:
 * import { Actor } from './types/functional/index.js';
 * import { UseCase } from './types/functional/index.js';
 * import { BusinessRequirementDefinition } from './types/business/index.js';
 * ```
 * 
 * **削除予定:** Phase 3（全てのツールが新型に移行後）
 * **最終更新:** 2025-10-05
 * 
 * **移行状況:**
 * - Phase 1: 新型定義完了 ✅
 * - Phase 2: 移行ツール提供中 🔄
 * - Phase 3: 旧型削除予定 📅
 * 
 * @module types/delivery-elements
 * @deprecated このモジュール全体が非推奨です。新しいモジュール化された型を使用してください。
 */

// ============================================================================
// 基底型（非推奨）
// ============================================================================

/**
 * ITデリバリプロジェクトにおけるドキュメント要素の基底型
 * 
 * **目的:**
 * 変更履歴・バージョン・ステータスはGitで管理される前提のシンプルな基底型です。
 * 
 * **フィールド:**
 * - id: 一意識別子
 * - type: 要素タイプ
 * - owner: オーナー（所有者、責任者）
 * 
 * @deprecated 新しいコードでは `Foundation.DocumentBase` を使用してください。
 *             DocumentBaseはメタデータ、バージョン管理、トレーサビリティをサポートします。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const element: DeliveryElement = {
 *   id: 'elem-001',
 *   type: 'requirement',
 *   owner: 'alice@example.com'
 * };
 * 
 * // 新:
 * import { DocumentBase } from './foundation/index.js';
 * const element: DocumentBase = {
 *   id: 'elem-001',
 *   name: '要件001',
 *   metadata: {
 *     createdBy: 'alice@example.com',
 *     createdAt: '2024-01-01T00:00:00Z'
 *   }
 * };
 * ```
 */
export interface DeliveryElement {
  readonly id: string;
  readonly type: string;
  readonly owner: string;
}

// ============================================================================
// アクター型（非推奨）
// ============================================================================

/**
 * アクター（システム利用者・関係者）
 * 
 * **目的:**
 * システムの利用者や関係者を表現します。
 * 
 * @deprecated 新しいコードでは `Functional.Actor` を使用してください。
 *             新しいActor型はより豊富な機能とメタデータをサポートします。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const actor: Actor = {
 *   id: 'actor-001',
 *   type: 'actor',
 *   owner: 'pm@example.com',
 *   name: '購入者',
 *   description: 'ECサイトで商品を購入する',
 *   role: 'primary',
 *   responsibilities: ['商品を購入する']
 * };
 * 
 * // 新:
 * import { Actor } from './functional/index.js';
 * const actor: Actor = {
 *   id: 'actor-001',
 *   name: '購入者',
 *   description: 'ECサイトで商品を購入する',
 *   role: 'primary',
 *   responsibilities: ['商品を購入する'],
 *   metadata: {
 *     createdBy: 'pm@example.com',
 *     createdAt: '2024-01-01T00:00:00Z'
 *   }
 * };
 * ```
 */
export interface Actor extends DeliveryElement {
  readonly type: 'actor';
  name: string;
  description: string;
  role: 'primary' | 'secondary' | 'external';
  responsibilities: string[];
}

// ============================================================================
// 業務要件型（非推奨）
// ============================================================================

/**
 * 業務要件項目（ゴール・スコープ・指標などの要素）
 * 
 * @deprecated 新しいコードでは `Business.BusinessRequirementItem` を使用してください。
 */
export interface BusinessRequirementItem {
  id: string;
  description: string;
  notes?: string;
}

/**
 * 業務要件におけるスコープ定義
 * 
 * @deprecated 新しいコードでは `Business.BusinessRequirementScope` を使用してください。
 */
export interface BusinessRequirementScope {
  inScope: BusinessRequirementItem[];
  outOfScope?: BusinessRequirementItem[];
}

/**
 * 業務要件定義（システムが提供すべき業務価値と成果の整理）
 * 
 * @deprecated 新しいコードでは `Business.BusinessRequirementDefinition` を使用してください。
 *             新しい型はTraceableDocumentを継承し、より豊富な機能を提供します。
 */
export interface BusinessRequirementDefinition extends DeliveryElement {
  readonly type: 'business-requirement';
  title: string;
  summary: string;
  businessGoals: BusinessRequirementItem[];
  scope: BusinessRequirementScope;
  stakeholders: BusinessRequirementItem[];
  successMetrics?: BusinessRequirementItem[];
  assumptions?: BusinessRequirementItem[];
  constraints?: BusinessRequirementItem[];
  securityPolicies?: SecurityPolicy[];
  businessRules?: BusinessRule[];
}

/**
 * セキュリティポリシー
 * 
 * @deprecated 新しいコードでは `Business.SecurityPolicy` を使用してください。
 */
export interface SecurityPolicy extends BusinessRequirementItem {}

/**
 * ビジネスルール
 * 
 * @deprecated 新しいコードでは `Business.BusinessRule` を使用してください。
 */
export interface BusinessRule extends BusinessRequirementItem {
  category?: string;
}

// ============================================================================
// 参照型（非推奨）
// ============================================================================

/**
 * 業務要件定義への参照
 * 
 * **目的:**
 * BusinessRequirementDefinitionへの軽量な参照を提供します。
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.BusinessRequirementDefinition>` を使用してください。
 *             新しいRef<T>型は型安全性とジェネリクスをサポートします。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const ref: BusinessRequirementDefinitionRef = {
 *   requirementId: 'br-001',
 *   type: 'business-requirement-ref'
 * };
 * 
 * // 新:
 * import { Ref } from './foundation/index.js';
 * import { BusinessRequirementDefinition } from './business/index.js';
 * const ref: Ref<BusinessRequirementDefinition> = {
 *   id: 'br-001',
 *   name: '業務要件書'
 * };
 * ```
 */
export interface BusinessRequirementDefinitionRef<RequirementId extends string = string> {
  readonly requirementId: RequirementId;
  readonly type: 'business-requirement-ref';
}

/**
 * ビジネスゴールへの参照
 * @deprecated `Foundation.Ref<Business.BusinessGoal>` を使用してください
 */
export interface BusinessGoalRef<GoalId extends string = string> {
  readonly id: GoalId;
  readonly type: 'business-goal-ref';
}

/**
 * ビジネススコープへの参照
 * @deprecated `Foundation.Ref<Business.BusinessScope>` を使用してください
 */
export interface BusinessScopeRef<ScopeId extends string = string> {
  readonly id: ScopeId;
  readonly type: 'business-scope-ref';
}

/**
 * ステークホルダーへの参照
 * @deprecated `Foundation.Ref<Business.Stakeholder>` を使用してください
 */
export interface StakeholderRef<StakeholderId extends string = string> {
  readonly id: StakeholderId;
  readonly type: 'stakeholder-ref';
}

/**
 * 成功指標への参照
 * @deprecated `Foundation.Ref<Business.SuccessMetric>` を使用してください
 */
export interface SuccessMetricRef<SuccessMetricId extends string = string> {
  readonly id: SuccessMetricId;
  readonly type: 'success-metric-ref';
}

/**
 * 前提条件への参照
 * @deprecated `Foundation.Ref<Business.Assumption>` を使用してください
 */
export interface AssumptionRef<AssumptionId extends string = string> {
  readonly id: AssumptionId;
  readonly type: 'assumption-ref';
}

/**
 * 制約条件への参照
 * @deprecated `Foundation.Ref<Business.Constraint>` を使用してください
 */
export interface ConstraintRef<ConstraintId extends string = string> {
  readonly id: ConstraintId;
  readonly type: 'constraint-ref';
}

/**
 * セキュリティポリシーへの参照
 * @deprecated `Foundation.Ref<Business.SecurityPolicy>` を使用してください
 */
export interface SecurityPolicyRef<SecurityPolicyId extends string = string> {
  readonly id: SecurityPolicyId;
  readonly type: 'security-policy-ref';
}

/**
 * ビジネスルールへの参照
 * @deprecated `Foundation.Ref<Business.BusinessRule>` を使用してください
 */
export interface BusinessRuleRef<BusinessRuleId extends string = string> {
  readonly id: BusinessRuleId;
  readonly type: 'business-rule-ref';
}

// ============================================================================
// 業務要件カバレッジ型（非推奨）
// ============================================================================

/**
 * ユースケースから業務要件へのトレーサビリティ情報
 * 
 * **目的:**
 * ユースケースが業務要件をどのようにカバーしているかの追跡情報を提供します。
 * 
 * **ジェネリクス型パラメータ:**
 * - RequirementId: 業務要件定義のID型
 * - GoalId: ビジネスゴールのID型
 * - ScopeId: スコープのID型
 * - StakeholderId: ステークホルダーのID型
 * - MetricId: 成功指標のID型
 * - AssumptionId: 前提条件のID型
 * - ConstraintId: 制約条件のID型
 * - PolicyId: セキュリティポリシーのID型
 * - RuleId: ビジネスルールのID型
 * 
 * @deprecated 新しいコードでは `CrossCutting.TraceabilityMatrix` を使用してください。
 *             TraceabilityMatrixはより柔軟で強力なトレーサビリティ機能を提供します。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const coverage: BusinessRequirementCoverage = {
 *   businessRequirementRef: {
 *     requirementId: 'br-001',
 *     type: 'business-requirement-ref'
 *   },
 *   businessGoalIds: [{ id: 'goal-001', type: 'business-goal-ref' }],
 *   inScopeIds: [{ id: 'scope-001', type: 'business-scope-ref' }]
 * };
 * 
 * // 新:
 * import { TraceabilityMatrix } from './cross-cutting/index.js';
 * const matrix: TraceabilityMatrix = {
 *   id: 'tm-001',
 *   name: 'トレーサビリティマトリクス',
 *   relationships: [
 *     {
 *       source: { id: 'uc-001', name: 'ユースケース' },
 *       target: { id: 'br-001', name: '業務要件書' },
 *       type: 'satisfies'
 *     }
 *   ]
 * };
 * ```
 * 
 * @deprecated 新しいコードでは Business.BusinessRequirementCoverage を使用してください
 */
export interface BusinessRequirementCoverage<
  RequirementId extends string = string,
  GoalId extends string = string,
  ScopeId extends string = string,
  StakeholderId extends string = string,
  SuccessMetricId extends string = string,
  AssumptionId extends string = string,
  ConstraintId extends string = string,
  SecurityPolicyId extends string = string,
  BusinessRuleId extends string = string,
> {
  requirement: BusinessRequirementDefinitionRef<RequirementId>;
  businessGoals: BusinessGoalRef<GoalId>[];
  scopeItems?: BusinessScopeRef<ScopeId>[];
  stakeholders?: StakeholderRef<StakeholderId>[];
  successMetrics?: SuccessMetricRef<SuccessMetricId>[];
  assumptions?: AssumptionRef<AssumptionId>[];
  constraints?: ConstraintRef<ConstraintId>[];
  securityPolicies?: SecurityPolicyRef<SecurityPolicyId>[];
  businessRules?: BusinessRuleRef<BusinessRuleId>[];
  notes?: string;
}

// ============================================================================
// ユースケース型（非推奨）
// ============================================================================

/**
 * ユースケース（段階的詳細化対応）
 * 
 * **目的:**
 * システムの機能要件をユースケースとして表現します。
 * 段階的詳細化をサポートし、詳細フィールドはオプションです。
 * 
 * **ジェネリクス型パラメータ:**
 * 業務要件の各要素への参照をジェネリクスで型付けします。
 * 
 * @deprecated 新しいコードでは `Functional.UseCase` を使用してください。
 *             新しいUseCase型はTraceableDocumentを継承し、より豊富な機能を提供します。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const uc: UseCase = {
 *   id: 'uc-001',
 *   type: 'usecase',
 *   owner: 'pm@example.com',
 *   name: '商品を購入する',
 *   description: '購入者が商品を購入する',
 *   actors: { primary: 'actor-001' },
 *   preconditions: ['ログイン済み'],
 *   postconditions: ['注文完了'],
 *   mainFlow: [...],
 *   priority: 'high'
 * };
 * 
 * // 新:
 * import { UseCase } from './functional/index.js';
 * const uc: UseCase = {
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
 *   metadata: {
 *     createdBy: 'pm@example.com',
 *     createdAt: '2024-01-01T00:00:00Z'
 *   }
 * };
 * ```
 * 
 * @deprecated 新しいコードでは Functional.UseCase を使用してください
 */
export interface UseCase<
  RequirementId extends string = string,
  GoalId extends string = string,
  ScopeId extends string = string,
  StakeholderId extends string = string,
  SuccessMetricId extends string = string,
  AssumptionId extends string = string,
  ConstraintId extends string = string,
  SecurityPolicyId extends string = string,
  BusinessRuleId extends string = string,
> extends DeliveryElement {
  readonly type: 'usecase';
  name: string;
  description: string;
  actors: {
    primary: string | ActorRef;
    secondary?: (string | ActorRef)[];
  };
  businessRequirementCoverage?: BusinessRequirementCoverage<
    RequirementId,
    GoalId,
    ScopeId,
    StakeholderId,
    SuccessMetricId,
    AssumptionId,
    ConstraintId,
    SecurityPolicyId,
    BusinessRuleId
  >;
  preconditions: string[];
  postconditions: string[];
  mainFlow: UseCaseStep[];
  alternativeFlows?: AlternativeFlow[];
  priority: 'high' | 'medium' | 'low';
  // 詳細化フィールド（オプション）
  complexity?: 'simple' | 'medium' | 'complex';
  estimatedEffort?: string;
  acceptanceCriteria?: string[];
  businessRules?: BusinessRuleRef<BusinessRuleId>[];
  businessValue?: string;
  dataRequirements?: string[];
  securityRequirements?: string[];
  securityPolicies?: SecurityPolicyRef<SecurityPolicyId>[];
  performanceRequirements?: string[];
  uiRequirements?: string[];
}

// ============================================================================
// ユースケースステップ・フロー型（非推奨）
// ============================================================================

/**
 * ユースケースのステップ（段階的詳細化対応）
 * 
 * **目的:**
 * ユースケースの個別のステップを表現します。
 * 
 * **フィールド:**
 * - stepId: オプショナルなステップID（開発者が指定、戻り先参照に使用）
 * - stepNumber: 実行時に配列インデックスから自動計算される
 * - actor: ステップを実行するアクター
 * - action: アクションの説明
 * - expectedResult: 期待される結果
 * 
 * @deprecated 新しいコードでは `Functional.UseCaseStep` を使用してください。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const step: UseCaseStep = {
 *   stepId: 'step-1',
 *   actor: 'actor-001',
 *   action: '商品を選択する',
 *   expectedResult: '商品が選択される'
 * };
 * 
 * // 新:
 * import { UseCaseStep } from './functional/index.js';
 * const step: UseCaseStep = {
 *   stepId: 'step-1',
 *   actor: { id: 'actor-001', name: '購入者' },
 *   action: '商品を選択する',
 *   expectedResult: '商品が選択される'
 * };
 * ```
 */
export interface UseCaseStep {
  // オプショナルなstepId（開発者が指定、戻り先参照に使用）
  stepId?: string;

  // 実行時に配列インデックスから自動計算される
  readonly stepNumber?: number;

  actor: string | ActorRef;
  action: string;
  expectedResult: string;
  notes?: string;
  // 詳細化フィールド（オプション）
  inputData?: string[];
  validationRules?: string[];
  errorHandling?: string[];
  performanceRequirement?: string;
}

/**
 * 代替フロー（段階的詳細化対応）
 * 
 * **目的:**
 * ユースケースの代替フローを表現します。
 * 
 * **フィールド:**
 * - id: 代替フローのID
 * - name: 代替フローの名前
 * - condition: 代替フローの発生条件
 * - steps: 代替フローのステップ
 * - returnToStepId: stepIdベースの戻り先指定（統一）
 * 
 * @deprecated 新しいコードでは `Functional.AlternativeFlow` を使用してください。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const altFlow: AlternativeFlow = {
 *   id: 'alt-1',
 *   name: '在庫切れ',
 *   condition: '商品の在庫がない',
 *   steps: [...],
 *   returnToStepId: 'step-1'
 * };
 * 
 * // 新:
 * import { AlternativeFlow } from './functional/index.js';
 * const altFlow: AlternativeFlow = {
 *   id: 'alt-1',
 *   name: '在庫切れ',
 *   condition: '商品の在庫がない',
 *   steps: [...],
 *   returnToStepId: 'step-1'
 * };
 * ```
 */
export interface AlternativeFlow {
  id: string;
  name: string;
  condition: string;
  steps: UseCaseStep[];

  // stepIdベースの戻り先指定（統一）
  returnToStepId?: string;

  // 詳細化フィールド（オプション）
  probability?: 'high' | 'medium' | 'low';
  impact?: 'critical' | 'major' | 'minor';
  mitigation?: string[];
}

// ============================================================================
// アクター・ユースケース参照型（非推奨）
// ============================================================================

/**
 * アクター参照型
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Functional.Actor>` を使用してください。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const ref = actorRef('actor-001');
 * 
 * // 新:
 * import { Ref } from './foundation/index.js';
 * import { Actor } from './functional/index.js';
 * const ref: Ref<Actor> = { id: 'actor-001', name: '購入者' };
 * ```
 */
export interface ActorRef {
  readonly actorId: string;
  readonly type: 'actor-ref';
}

/**
 * ユースケース参照型
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Functional.UseCase>` を使用してください。
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const ref = useCaseRef('uc-001');
 * 
 * // 新:
 * import { Ref } from './foundation/index.js';
 * import { UseCase } from './functional/index.js';
 * const ref: Ref<UseCase> = { id: 'uc-001', name: '商品を購入する' };
 * ```
 */
export interface UseCaseRef {
  readonly useCaseId: string;
  readonly type: 'usecase-ref';
}

// ============================================================================
// ヘルパー関数（非推奨）
// ============================================================================

/**
 * アクター参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Functional.Actor>` を直接使用してください。
 * 
 * @param actorId - アクターID
 * @returns ActorRef オブジェクト
 * 
 * **移行例:**
 * ```typescript
 * // 旧:
 * const ref = actorRef('actor-001');
 * 
 * // 新:
 * const ref: Ref<Actor> = { id: 'actor-001', name: '購入者' };
 * ```
 */
export function actorRef(actorId: string): ActorRef {
  return { actorId, type: 'actor-ref' };
}

/**
 * ユースケース参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Functional.UseCase>` を直接使用してください。
 * 
 * @param useCaseId - ユースケースID
 * @returns UseCaseRef オブジェクト
 */
export function useCaseRef(useCaseId: string): UseCaseRef {
  return { useCaseId, type: 'usecase-ref' };
}

/**
 * 業務要件定義参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.BusinessRequirementDefinition>` を直接使用してください。
 */
export function businessRequirementRef<RequirementId extends string>(
  requirementId: RequirementId
): BusinessRequirementDefinitionRef<RequirementId> {
  return { requirementId, type: 'business-requirement-ref' };
}

/**
 * ビジネスゴール参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.BusinessGoal>` を直接使用してください。
 */
export function businessGoalRef<GoalId extends string>(id: GoalId): BusinessGoalRef<GoalId> {
  return { id, type: 'business-goal-ref' };
}

/**
 * ビジネススコープ参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.BusinessScope>` を直接使用してください。
 */
export function businessScopeRef<ScopeId extends string>(id: ScopeId): BusinessScopeRef<ScopeId> {
  return { id, type: 'business-scope-ref' };
}

/**
 * ステークホルダー参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.Stakeholder>` を直接使用してください。
 */
export function stakeholderRef<StakeholderId extends string>(
  id: StakeholderId
): StakeholderRef<StakeholderId> {
  return { id, type: 'stakeholder-ref' };
}

/**
 * 成功指標参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.SuccessMetric>` を直接使用してください。
 */
export function successMetricRef<SuccessMetricId extends string>(
  id: SuccessMetricId
): SuccessMetricRef<SuccessMetricId> {
  return { id, type: 'success-metric-ref' };
}

/**
 * 前提条件参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.Assumption>` を直接使用してください。
 */
export function assumptionRef<AssumptionId extends string>(
  id: AssumptionId
): AssumptionRef<AssumptionId> {
  return { id, type: 'assumption-ref' };
}

/**
 * 制約条件参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.Constraint>` を直接使用してください。
 */
export function constraintRef<ConstraintId extends string>(
  id: ConstraintId
): ConstraintRef<ConstraintId> {
  return { id, type: 'constraint-ref' };
}

/**
 * セキュリティポリシー参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.SecurityPolicy>` を直接使用してください。
 */
export function securityPolicyRef<SecurityPolicyId extends string>(
  id: SecurityPolicyId
): SecurityPolicyRef<SecurityPolicyId> {
  return { id, type: 'security-policy-ref' };
}

/**
 * ビジネスルール参照を作成するヘルパー関数
 * 
 * @deprecated 新しいコードでは `Foundation.Ref<Business.BusinessRule>` を直接使用してください。
 */
export function businessRuleRef<BusinessRuleId extends string>(
  id: BusinessRuleId
): BusinessRuleRef<BusinessRuleId> {
  return { id, type: 'business-rule-ref' };
}
