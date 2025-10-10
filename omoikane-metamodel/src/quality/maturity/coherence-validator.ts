/**
 * @fileoverview UseCaseとScreenFlowの整合性検証（Coherence Validator）
 * 
 * **目的:**
 * UseCaseのmainFlowで定義された画面遷移順序と、
 * ScreenFlowの遷移定義の整合性を検証します。
 * 
 * **検証内容:**
 * 1. 画面順序の一致性
 * 2. 遷移の完全性（すべての遷移が定義されているか）
 * 3. 開始・終了画面の一致性
 * 4. 遷移条件の明示性
 * 
 * **用途:**
 * - アーキテクチャ評価の一部として実行
 * - 設計書の品質チェック
 * - 実装前のバリデーション
 * 
 * @module quality/maturity/coherence-validator
 */

import type { ScreenFlow, UseCase } from '../../types/index.js';
import type {
    CoherenceIssue,
    CoherenceValidationResult
} from './dependency-graph-model.js';

// ============================================================================
// 公開API: 整合性検証
// ============================================================================

/**
 * UseCaseとScreenFlowの整合性を検証
 * 
 * @param useCases ユースケースリスト
 * @param screenFlows 画面遷移フローリスト
 * @returns 整合性検証結果
 */
export function validateUseCaseScreenFlowCoherence(
  useCases: UseCase[],
  screenFlows: ScreenFlow[]
): CoherenceValidationResult {
  const issues: CoherenceIssue[] = [];
  const issuesByUseCase = new Map<string, CoherenceIssue[]>();
  
  // ScreenFlowをマップ化（高速検索用）
  const screenFlowMap = new Map<string, ScreenFlow>();
  for (const flow of screenFlows) {
    if (flow.relatedUseCase) {
      screenFlowMap.set(flow.relatedUseCase.id, flow);
    }
  }
  
  // 各UseCaseについて検証
  for (const useCase of useCases) {
    const useCaseIssues: CoherenceIssue[] = [];
    
    // 関連するScreenFlowを取得
    const screenFlow = screenFlowMap.get(useCase.id);
    
    if (!screenFlow) {
      // ScreenFlowが存在しない場合はスキップ（低優先度の問題）
      continue;
    }
    
    // 1. 画面順序の検証
    const screenSequenceIssues = validateScreenSequence(useCase, screenFlow);
    useCaseIssues.push(...screenSequenceIssues);
    
    // 2. 遷移の完全性検証
    const transitionIssues = validateTransitions(useCase, screenFlow);
    useCaseIssues.push(...transitionIssues);
    
    // 3. 開始・終了画面の検証
    const boundaryIssues = validateBoundaryScreens(useCase, screenFlow);
    useCaseIssues.push(...boundaryIssues);
    
    if (useCaseIssues.length > 0) {
      issuesByUseCase.set(useCase.id, useCaseIssues);
      issues.push(...useCaseIssues);
    }
  }
  
  // 重大度別に集計
  const issuesBySeverity = {
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };
  
  return {
    valid: issues.length === 0,
    totalUseCases: useCases.length,
    totalScreenFlows: screenFlows.length,
    totalIssues: issues.length,
    issues,
    issuesBySeverity,
    issuesByUseCase,
  };
}

// ============================================================================
// 内部関数: 個別検証ロジック
// ============================================================================

/**
 * 画面順序の一致性を検証
 */
function validateScreenSequence(
  useCase: UseCase,
  screenFlow: ScreenFlow
): CoherenceIssue[] {
  const issues: CoherenceIssue[] = [];
  
  // UseCaseから画面順序を抽出
  const useCaseScreens = extractScreenSequence(useCase);
  
  // ScreenFlowから画面順序を抽出
  const flowScreens = screenFlow.screens.map(s => s.id);
  
  // 順序が完全に一致するかチェック
  if (!arraysEqual(useCaseScreens, flowScreens)) {
    issues.push({
      type: 'screen-sequence-mismatch',
      severity: 'high',
      description: `画面遷移順序が不一致です。UseCase: [${useCaseScreens.join(' → ')}]、ScreenFlow: [${flowScreens.join(' → ')}]`,
      useCaseId: useCase.id,
      screenFlowId: screenFlow.id,
      expected: useCaseScreens.join(' → '),
      actual: flowScreens.join(' → '),
      affectedScreenIds: [...new Set([...useCaseScreens, ...flowScreens])],
    });
  }
  
  return issues;
}

/**
 * 遷移の完全性を検証
 */
function validateTransitions(
  useCase: UseCase,
  screenFlow: ScreenFlow
): CoherenceIssue[] {
  const issues: CoherenceIssue[] = [];
  
  // UseCaseのステップから期待される遷移を抽出
  for (let i = 0; i < useCase.mainFlow.length - 1; i++) {
    const currentStep = useCase.mainFlow[i];
    const nextStep = useCase.mainFlow[i + 1];
    
    if (!currentStep.screen || !nextStep.screen) {
      continue;
    }
    
    const fromScreenId = currentStep.screen.id;
    const toScreenId = nextStep.screen.id;
    
    // 同じ画面内の遷移はスキップ
    if (fromScreenId === toScreenId) {
      continue;
    }
    
    // ScreenFlowに該当する遷移が存在するかチェック
    const transition = screenFlow.transitions.find(
      t => t.from.id === fromScreenId && t.to.id === toScreenId
    );
    
    if (!transition) {
      issues.push({
        type: 'transition-missing',
        severity: 'high',
        description: `画面遷移が未定義です: ${fromScreenId} → ${toScreenId}`,
        useCaseId: useCase.id,
        screenFlowId: screenFlow.id,
        expected: `${fromScreenId} → ${toScreenId}`,
        actual: '未定義',
        affectedStepIds: [currentStep.stepId, nextStep.stepId].filter((id): id is string => !!id),
        affectedScreenIds: [fromScreenId, toScreenId],
      });
    } else if (!transition.condition && currentStep.expectedResult) {
      // 遷移条件の欠落チェック
      issues.push({
        type: 'transition-condition-missing',
        severity: 'low',
        description: `画面遷移の条件が未定義です: ${fromScreenId} → ${toScreenId}（UseCaseでは「${currentStep.expectedResult}」が期待される）`,
        useCaseId: useCase.id,
        screenFlowId: screenFlow.id,
        expected: currentStep.expectedResult,
        actual: '未定義',
        affectedStepIds: currentStep.stepId ? [currentStep.stepId] : [],
        affectedScreenIds: [fromScreenId, toScreenId],
      });
    }
  }
  
  return issues;
}

/**
 * 開始・終了画面の一致性を検証
 */
function validateBoundaryScreens(
  useCase: UseCase,
  screenFlow: ScreenFlow
): CoherenceIssue[] {
  const issues: CoherenceIssue[] = [];
  
  // 開始画面の検証
  const firstScreen = useCase.mainFlow[0]?.screen;
  if (firstScreen && screenFlow.startScreen) {
    if (firstScreen.id !== screenFlow.startScreen.id) {
      issues.push({
        type: 'start-screen-mismatch',
        severity: 'medium',
        description: `開始画面が不一致です: UseCase=${firstScreen.id}、ScreenFlow=${screenFlow.startScreen.id}`,
        useCaseId: useCase.id,
        screenFlowId: screenFlow.id,
        expected: firstScreen.id,
        actual: screenFlow.startScreen.id,
        affectedScreenIds: [firstScreen.id, screenFlow.startScreen.id],
      });
    }
  }
  
  // 終了画面の検証
  const lastScreen = useCase.mainFlow[useCase.mainFlow.length - 1]?.screen;
  if (lastScreen && screenFlow.endScreens && screenFlow.endScreens.length > 0) {
    const endScreenIds = screenFlow.endScreens.map(s => s.id);
    if (!endScreenIds.includes(lastScreen.id)) {
      issues.push({
        type: 'end-screen-mismatch',
        severity: 'medium',
        description: `終了画面が不一致です: UseCaseの最後の画面「${lastScreen.id}」がScreenFlowの終了画面リストに含まれていません`,
        useCaseId: useCase.id,
        screenFlowId: screenFlow.id,
        expected: lastScreen.id,
        actual: endScreenIds.join(', '),
        affectedScreenIds: [lastScreen.id, ...endScreenIds],
      });
    }
  }
  
  return issues;
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * UseCaseのmainFlowから画面順序を抽出
 */
function extractScreenSequence(useCase: UseCase): string[] {
  const screens: string[] = [];
  let lastScreenId: string | null = null;
  
  for (const step of useCase.mainFlow) {
    if (step.screen && step.screen.id !== lastScreenId) {
      screens.push(step.screen.id);
      lastScreenId = step.screen.id;
    }
  }
  
  return screens;
}

/**
 * 配列が等しいかチェック
 */
function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  
  return true;
}
