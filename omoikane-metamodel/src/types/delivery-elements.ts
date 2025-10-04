// ITデリバリプロジェクトの基本要素型定義

/**
 * ITデリバリプロジェクトにおけるドキュメント要素の基底型
 * 変更履歴・バージョン・ステータスはGitで管理
 */
export interface DeliveryElement {
  readonly id: string;
  readonly type: string;
  readonly owner: string;
}

/**
 * アクター（システム利用者・関係者）
 */
export interface Actor extends DeliveryElement {
  readonly type: 'actor';
  name: string;
  description: string;
  role: 'primary' | 'secondary' | 'external';
  responsibilities: string[];
}

/**
 * 業務要件項目（ゴール・スコープ・指標などの要素）
 */
export interface BusinessRequirementItem {
  id: string;
  description: string;
  notes?: string;
}

/**
 * 業務要件におけるスコープ定義
 */
export interface BusinessRequirementScope {
  inScope: BusinessRequirementItem[];
  outOfScope?: BusinessRequirementItem[];
}

/**
 * 業務要件定義（システムが提供すべき業務価値と成果の整理）
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

export interface SecurityPolicy extends BusinessRequirementItem {}

export interface BusinessRule extends BusinessRequirementItem {
  category?: string;
}

/**
 * 業務要件参照オブジェクト
 */
export interface BusinessRequirementDefinitionRef<RequirementId extends string = string> {
  readonly requirementId: RequirementId;
  readonly type: 'business-requirement-ref';
}

export interface BusinessGoalRef<GoalId extends string = string> {
  readonly id: GoalId;
  readonly type: 'business-goal-ref';
}

export interface BusinessScopeRef<ScopeId extends string = string> {
  readonly id: ScopeId;
  readonly type: 'business-scope-ref';
}

export interface StakeholderRef<StakeholderId extends string = string> {
  readonly id: StakeholderId;
  readonly type: 'stakeholder-ref';
}

export interface SuccessMetricRef<SuccessMetricId extends string = string> {
  readonly id: SuccessMetricId;
  readonly type: 'success-metric-ref';
}

export interface AssumptionRef<AssumptionId extends string = string> {
  readonly id: AssumptionId;
  readonly type: 'assumption-ref';
}

export interface ConstraintRef<ConstraintId extends string = string> {
  readonly id: ConstraintId;
  readonly type: 'constraint-ref';
}

export interface SecurityPolicyRef<SecurityPolicyId extends string = string> {
  readonly id: SecurityPolicyId;
  readonly type: 'security-policy-ref';
}

export interface BusinessRuleRef<BusinessRuleId extends string = string> {
  readonly id: BusinessRuleId;
  readonly type: 'business-rule-ref';
}

/**
 * ユースケースから業務要件へのトレーサビリティ情報
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

/**
 * ユースケース（段階的詳細化対応）
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

/**
 * ユースケースのステップ（段階的詳細化対応）
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

/**
 * アクター参照型
 */
export interface ActorRef {
  readonly actorId: string;
  readonly type: 'actor-ref';
}

/**
 * ユースケース参照型
 */
export interface UseCaseRef {
  readonly useCaseId: string;
  readonly type: 'usecase-ref';
}

// ヘルパー関数
export function actorRef(actorId: string): ActorRef {
  return { actorId, type: 'actor-ref' };
}

export function useCaseRef(useCaseId: string): UseCaseRef {
  return { useCaseId, type: 'usecase-ref' };
}

export function businessRequirementRef<RequirementId extends string>(
  requirementId: RequirementId
): BusinessRequirementDefinitionRef<RequirementId> {
  return { requirementId, type: 'business-requirement-ref' };
}

export function businessGoalRef<GoalId extends string>(id: GoalId): BusinessGoalRef<GoalId> {
  return { id, type: 'business-goal-ref' };
}

export function businessScopeRef<ScopeId extends string>(id: ScopeId): BusinessScopeRef<ScopeId> {
  return { id, type: 'business-scope-ref' };
}

export function stakeholderRef<StakeholderId extends string>(
  id: StakeholderId
): StakeholderRef<StakeholderId> {
  return { id, type: 'stakeholder-ref' };
}

export function successMetricRef<SuccessMetricId extends string>(
  id: SuccessMetricId
): SuccessMetricRef<SuccessMetricId> {
  return { id, type: 'success-metric-ref' };
}

export function assumptionRef<AssumptionId extends string>(
  id: AssumptionId
): AssumptionRef<AssumptionId> {
  return { id, type: 'assumption-ref' };
}

export function constraintRef<ConstraintId extends string>(
  id: ConstraintId
): ConstraintRef<ConstraintId> {
  return { id, type: 'constraint-ref' };
}

export function securityPolicyRef<SecurityPolicyId extends string>(
  id: SecurityPolicyId
): SecurityPolicyRef<SecurityPolicyId> {
  return { id, type: 'security-policy-ref' };
}

export function businessRuleRef<BusinessRuleId extends string>(
  id: BusinessRuleId
): BusinessRuleRef<BusinessRuleId> {
  return { id, type: 'business-rule-ref' };
}
