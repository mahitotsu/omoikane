/**
 * @fileoverview Business レイヤー統合エクスポート
 * 
 * **目的:**
 * 業務要件定義に関する型定義を統合してエクスポートします。
 * ビジネスゴール、スコープ、ステークホルダー、セキュリティポリシー、ビジネスルールなどを提供します。
 * 
 * **提供機能:**
 * 1. BusinessRequirementItem: 業務要件項目（基本要素）
 * 2. BusinessRequirementScope: スコープ定義
 * 3. SecurityPolicy: セキュリティポリシー
 * 4. BusinessRule: ビジネスルール
 * 5. BusinessRequirementDefinition: 業務要件定義文書
 * 6. BusinessRequirementCoverage: 業務要件カバレッジ情報
 * 
 * **モジュール構成:**
 * - requirements.ts: 業務要件定義型
 * 
 * **使用例:**
 * ```typescript
 * import { 
 *   BusinessRequirementDefinition, 
 *   BusinessRequirementCoverage,
 *   SecurityPolicy,
 *   BusinessRule 
 * } from './business/index.js';
 * 
 * const requirement: BusinessRequirementDefinition = {
 *   id: 'br-001',
 *   name: 'ECサイトリニューアル',
 *   title: 'ECサイトリニューアルプロジェクト',
 *   summary: 'ユーザー体験向上と売上増加',
 *   businessGoals: [...],
 *   scope: { inScope: [...], outOfScope: [...] },
 *   stakeholders: [...]
 * };
 * ```
 * 
 * @module types/business
 */

export type {
    Assumption,
    BusinessGoal,
    BusinessRequirementCoverage,
    BusinessRequirementDefinition,
    BusinessRequirementItem,
    BusinessRequirementScope,
    BusinessRule,
    Constraint,
    SecurityPolicy,
    Stakeholder,
    SuccessMetric
} from './requirements.js';

export type {
    AssumptionRef,
    BusinessGoalRef,
    BusinessRequirementDefinitionRef,
    BusinessRuleRef,
    BusinessScopeRef,
    ConstraintRef,
    SecurityPolicyRef,
    StakeholderRef,
    SuccessMetricRef
} from './references.js';
