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
    }
    // Note: transition.condition はオプションフィールドであり、必須ではない
    // expectedResult は「ステップ実行後の結果」であり、遷移条件ではないため検証しない
  }
  
  return issues;
}

/**
 * 開始・終了画面の一致性を検証
 * 
 * **設計思想:**
 * - startScreen: UseCaseの最初のステップとScreenFlowの開始画面は一致すべき
 * - endScreens: UseCaseの最後のステップの画面がScreenFlowの終了画面リストに含まれるべき
 * 
 * **endScreensの解釈:**
 * ScreenFlow.endScreensは「このフローで到達可能な終了点（出口）」を表現します。
 * 複数の終了画面がある場合（正常完了画面、キャンセル後の一覧画面など）、
 * すべての出口をendScreensに含めることで、UI実装者に有益な情報を提供します。
 * 
 * UseCaseの最後のステップの画面は、少なくとも1つのendScreenとして含まれるべきです。
 * これにより、ビジネスユースケースの終了点とScreenFlowの終了点の整合性が保たれます。
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

// ============================================================================
// 公開API: 前提ユースケースの検証
// ============================================================================

/**
 * 前提ユースケースの存在と整合性を検証
 * 
 * **検証内容:**
 * 1. prerequisiteUseCasesで参照されているユースケースが存在するか
 * 2. 循環参照がないか（A→B→Aのような依存）
 * 3. 前提ユースケースの優先度が適切か（前提は同等以上の優先度）
 * 
 * @param useCases ユースケースリスト
 * @returns 検証結果
 */
export function validatePrerequisiteUseCases(
  useCases: UseCase[]
): CoherenceValidationResult {
  const issues: CoherenceIssue[] = [];
  const issuesByUseCase = new Map<string, CoherenceIssue[]>();
  
  // UseCaseをマップ化（高速検索用）
  const useCaseMap = new Map<string, UseCase>();
  for (const uc of useCases) {
    useCaseMap.set(uc.id, uc);
  }
  
  // 各UseCaseについて検証
  for (const useCase of useCases) {
    if (!useCase.prerequisiteUseCases || useCase.prerequisiteUseCases.length === 0) {
      continue;
    }
    
    const useCaseIssues: CoherenceIssue[] = [];
    
    // 1. 参照先の存在チェック
    for (const prerequisiteRef of useCase.prerequisiteUseCases) {
      const prerequisite = useCaseMap.get(prerequisiteRef.id);
      
      if (!prerequisite) {
        useCaseIssues.push({
          type: 'prerequisite-usecase-missing',
          severity: 'high',
          description: `前提ユースケース「${prerequisiteRef.id}」が存在しません`,
          useCaseId: useCase.id,
          expected: prerequisiteRef.id,
          actual: '存在しない',
          affectedStepIds: [],
          affectedScreenIds: [],
        });
      } else {
        // 2. 優先度チェック（前提は同等以上の優先度であるべき）
        const priorityOrder: Record<string, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        
        const currentPriority = priorityOrder[useCase.priority] || 0;
        const prerequisitePriority = priorityOrder[prerequisite.priority] || 0;
        
        if (prerequisitePriority < currentPriority) {
          useCaseIssues.push({
            type: 'prerequisite-priority-mismatch',
            severity: 'medium',
            description: `前提ユースケース「${prerequisite.name}」の優先度（${prerequisite.priority}）が、このユースケースの優先度（${useCase.priority}）より低い`,
            useCaseId: useCase.id,
            expected: `優先度 >= ${useCase.priority}`,
            actual: `優先度 = ${prerequisite.priority}`,
            affectedStepIds: [],
            affectedScreenIds: [],
          });
        }
        
        // 3. 循環参照チェック
        const visited = new Set<string>();
        const hasCircular = checkCircularPrerequisite(
          prerequisite,
          useCase.id,
          useCaseMap,
          visited
        );
        
        if (hasCircular) {
          useCaseIssues.push({
            type: 'prerequisite-circular-dependency',
            severity: 'high',
            description: `前提ユースケースに循環参照が検出されました: ${useCase.id} ↔ ${prerequisite.id}`,
            useCaseId: useCase.id,
            expected: '前提ユースケースに循環参照なし',
            actual: '循環参照あり',
            affectedStepIds: [],
            affectedScreenIds: [],
          });
        }
      }
    }
    
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
    totalScreenFlows: 0,  // N/A for this validation
    totalIssues: issues.length,
    issues,
    issuesBySeverity,
    issuesByUseCase,
  };
}

/**
 * 循環参照をチェック（再帰的）
 */
function checkCircularPrerequisite(
  current: UseCase,
  targetId: string,
  useCaseMap: Map<string, UseCase>,
  visited: Set<string>
): boolean {
  if (visited.has(current.id)) {
    return false;  // 既に訪問済み（このパスでは循環なし）
  }
  
  if (current.id === targetId) {
    return true;  // 循環参照発見
  }
  
  visited.add(current.id);
  
  if (!current.prerequisiteUseCases || current.prerequisiteUseCases.length === 0) {
    return false;
  }
  
  for (const prerequisiteRef of current.prerequisiteUseCases) {
    const prerequisite = useCaseMap.get(prerequisiteRef.id);
    if (prerequisite && checkCircularPrerequisite(prerequisite, targetId, useCaseMap, visited)) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// 公開API: フロー設計の妥当性検証（成熟度非影響）
// ============================================================================

/**
 * UseCaseのフロー設計の妥当性を検証
 * 
 * ステップ数が極端に少ない、または多い場合に情報/警告を出します。
 * この検証は成熟度スコアには影響せず、設計の参考情報として提供されます。
 * 
 * **検証内容:**
 * - 1ステップ: 情報レベル（ユースケースとして不完全な可能性）
 * - 15ステップ超: 警告レベル（分割を検討すべき）
 * 
 * @param useCases ユースケースリスト
 * @returns フロー設計に関する情報・警告のリスト
 */
export function validateFlowDesign(useCases: UseCase[]): {
  info: string[];
  warnings: string[];
} {
  const info: string[] = [];
  const warnings: string[] = [];
  
  for (const useCase of useCases) {
    const stepCount = useCase.mainFlow?.length ?? 0;
    
    if (stepCount === 1) {
      info.push(
        `[${useCase.id}] ${useCase.name}: 1ステップのみ。` +
        `通常のユースケースは複数ステップで構成されますが、` +
        `シンプルな通知や参照のみのユースケースでは問題ありません。`
      );
    } else if (stepCount > 15) {
      warnings.push(
        `[${useCase.id}] ${useCase.name}: ${stepCount}ステップ。` +
        `ステップ数が多すぎる可能性があります。` +
        `複数のユースケースへの分割を検討してください。`
      );
    }
  }
  
  return { info, warnings };
}
