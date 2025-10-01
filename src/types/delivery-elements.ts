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
 * ユースケース（段階的詳細化対応）
 */
export interface UseCase extends DeliveryElement {
  readonly type: 'usecase';
  name: string;
  description: string;
  actors: {
    primary: string | ActorRef;
    secondary?: (string | ActorRef)[];
  };
  preconditions: string[];
  postconditions: string[];
  mainFlow: UseCaseStep[];
  alternativeFlows?: AlternativeFlow[];
  businessValue: string;
  priority: 'high' | 'medium' | 'low';
  // 詳細化フィールド（オプション）
  complexity?: 'simple' | 'medium' | 'complex';
  estimatedEffort?: string;
  acceptanceCriteria?: string[];
  businessRules?: string[];
  dataRequirements?: string[];
  securityRequirements?: string[];
  performanceRequirements?: string[];
  uiRequirements?: string[];
}

/**
 * ユースケースのステップ（段階的詳細化対応）
 */
export interface UseCaseStep {
  stepNumber: number;
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
 * stepId拡張されたUseCaseStep（stepNumber自動管理用）
 */
export interface EnhancedUseCaseStep extends Omit<UseCaseStep, 'stepNumber'> {
  // オプショナルなstepId（開発者が指定、戻り先参照に使用）
  stepId?: string;
  
  // 実行時に配列インデックスから自動計算される
  readonly stepNumber?: number;
}

/**
 * 代替フロー（段階的詳細化対応）
 */
export interface AlternativeFlow {
  id: string;
  name: string;
  condition: string;
  steps: UseCaseStep[];
  returnToStep?: number;
  // 詳細化フィールド（オプション）
  probability?: 'high' | 'medium' | 'low';
  impact?: 'critical' | 'major' | 'minor';
  mitigation?: string[];
}

/**
 * stepId対応の代替フロー
 */
export interface EnhancedAlternativeFlow extends Omit<AlternativeFlow, 'steps' | 'returnToStep'> {
  steps: EnhancedUseCaseStep[];
  
  // stepIdベースの戻り先指定（統一）
  returnToStepId?: string;
}

/**
 * アクター参照型
 */
export interface ActorRef {
  readonly actorId: string;
  readonly type: 'actor-ref';
}

/**
 * 拡張されたUseCase（stepId対応）
 */
export interface EnhancedUseCase extends Omit<UseCase, 'mainFlow' | 'alternativeFlows'> {
  mainFlow: EnhancedUseCaseStep[];
  alternativeFlows?: EnhancedAlternativeFlow[];
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