/**
 * @fileoverview ScreenFlowとUseCaseの整合性評価
 *
 * **目的:**
 * UseCaseで定義された画面フローと、ScreenFlowで定義された遷移の整合性を検証します。
 *
 * **評価対象:**
 * 1. 画面順序の整合性（循環パターンを考慮）
 * 2. アクションの整合性（Screen定義 vs ScreenFlow vs UseCase）
 * 3. 遷移トリガーの妥当性
 * 4. 遷移の完全性（すべての画面遷移が定義されているか）
 *
 * **使用例:**
 * ```typescript
 * import { assessFlowConsistency } from './flow-consistency.js';
 *
 * const result = assessFlowConsistency(useCases, screenFlows, screens);
 * console.log(`整合性スコア: ${result.overallScore}/100`);
 * ```
 *
 * @module quality/validators/flow-consistency
 */

import type {
    Screen,
    ScreenActionRef,
    ScreenFlow,
    UseCase,
} from '../../types/index.js';

// ============================================================================
// 型定義
// ============================================================================

/**
 * 画面順序の比較結果
 */
export interface ScreenOrderComparison {
  useCaseId: string;
  useCaseName: string;
  screenFlowId: string;
  screenFlowName: string;
  status: 'consistent' | 'mismatch' | 'partial-match';
  useCaseScreens: string[]; // UseCaseで使用される画面（順序付き）
  flowScreens: string[]; // ScreenFlowで定義された画面（順序なし）
  difference?: {
    inUseCaseOnly: string[];
    inFlowOnly: string[];
  };
}

/**
 * アクションの整合性チェック結果
 */
export interface ActionConsistency {
  matches: number;
  mismatches: Array<{
    useCaseId: string;
    screenFlowId: string;
    issue: string;
    screenId: string;
    actionId: string;
    definedInScreen: boolean; // Screen定義に存在するか
    referencedInFlow: boolean; // ScreenFlowで参照されているか
    referencedInUseCase: boolean; // UseCaseで参照されているか
  }>;
}

/**
 * 遷移トリガーの妥当性チェック結果
 */
export interface TransitionTriggerValidity {
  validTriggers: number;
  invalidTriggers: Array<{
    screenFlowId: string;
    from: string;
    to: string;
    trigger: ScreenActionRef;
    issue: 'action-not-defined' | 'screen-mismatch' | 'missing-screen';
  }>;
}

/**
 * 遷移の完全性チェック結果
 */
export interface TransitionCompleteness {
  completeFlows: string[];
  incompleteFlows: Array<{
    screenFlowId: string;
    missingTransitions: Array<{
      from: string;
      to: string;
      reason: string;
    }>;
  }>;
}

/**
 * ScreenFlowとUseCaseの整合性評価結果
 */
export interface FlowConsistencyAssessment {
  overallScore: number; // 0-100
  screenOrderConsistency: {
    matches: ScreenOrderComparison[];
    mismatches: ScreenOrderComparison[];
    score: number; // 0-100
  };
  actionConsistency: ActionConsistency & { score: number };
  transitionTriggerValidity: TransitionTriggerValidity & { score: number };
  transitionCompleteness: TransitionCompleteness & { score: number };
  recommendations: Array<{
    category: 'screen-order' | 'action' | 'trigger' | 'completeness';
    priority: 'high' | 'medium' | 'low';
    message: string;
    affectedElements: string[];
    suggestedAction: string;
  }>;
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * 配列から重複を除去
 */
function uniqueArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * ScreenActionRefから画面IDとアクションIDを抽出
 */
function parseScreenActionRef(ref: ScreenActionRef): {
  screenId: string;
  actionId: string;
} {
  return {
    screenId: ref.screenId,
    actionId: ref.actionId,
  };
}

/**
 * UseCaseから画面順序を抽出（循環考慮）
 */
function extractScreenOrderFromUseCase(useCase: UseCase): string[] {
  const screens: string[] = [];

  // メインフローから抽出
  for (const step of useCase.mainFlow) {
    if (step.screen) {
      screens.push(step.screen.id);
    }
  }

  // 代替フローから抽出（オプション）
  if (useCase.alternativeFlows) {
    for (const altFlow of useCase.alternativeFlows) {
      if (altFlow.steps) {
        for (const step of altFlow.steps) {
          if (step.screen) {
            screens.push(step.screen.id);
          }
        }
      }
    }
  }

  return screens; // 重複を残す（循環を検出するため）
}

/**
 * ScreenFlowから画面集合を抽出
 */
function extractScreensFromFlow(screenFlow: ScreenFlow): string[] {
  const screens = new Set<string>();

  // transitionsがない場合は空配列を返す
  if (!screenFlow.transitions || screenFlow.transitions.length === 0) {
    return [];
  }

  for (const transition of screenFlow.transitions) {
    screens.add(transition.from.id);
    screens.add(transition.to.id);
  }

  return Array.from(screens);
}

/**
 * 循環を除去して配列を正規化
 *
 * **例:**
 * [A, B, C, A] → [A, B, C]（最後の循環を除去）
 */
function removeCyclicSuffix(arr: string[]): string[] {
  if (arr.length < 2) return arr;

  const firstElement = arr[0];
  const lastElement = arr[arr.length - 1];

  // 最初と最後が同じ場合、最後の要素を除去
  if (firstElement === lastElement) {
    return arr.slice(0, -1);
  }

  return arr;
}

// ============================================================================
// 画面順序の整合性評価
// ============================================================================

/**
 * 画面順序の整合性を評価
 *
 * **評価ロジック:**
 * 1. UseCaseから画面順序を抽出（循環考慮）
 * 2. ScreenFlowから画面集合を抽出
 * 3. 循環を除去して比較
 * 4. 一致率を計算
 *
 * @param useCases - ユースケース配列
 * @param screenFlows - 画面フロー配列
 * @returns 画面順序の整合性評価結果
 */
export function assessScreenOrderConsistency(
  useCases: UseCase[],
  screenFlows: ScreenFlow[]
): {
  matches: ScreenOrderComparison[];
  mismatches: ScreenOrderComparison[];
  score: number;
} {
  const matches: ScreenOrderComparison[] = [];
  const mismatches: ScreenOrderComparison[] = [];

  // ScreenFlowをrelatedUseCaseでマッピング
  const flowMap = new Map<string, ScreenFlow[]>();
  for (const flow of screenFlows) {
    // relatedUseCaseがない場合はスキップ
    if (!flow.relatedUseCase?.id) {
      continue;
    }
    const useCaseId = flow.relatedUseCase.id;
    if (!flowMap.has(useCaseId)) {
      flowMap.set(useCaseId, []);
    }
    flowMap.get(useCaseId)!.push(flow);
  }

  for (const useCase of useCases) {
    const relatedFlows = flowMap.get(useCase.id) || [];

    for (const flow of relatedFlows) {
      const useCaseScreens = extractScreenOrderFromUseCase(useCase);
      const flowScreens = extractScreensFromFlow(flow);

      // 循環を除去
      const normalizedUseCaseScreens = removeCyclicSuffix(useCaseScreens);
      const uniqueUseCaseScreens = uniqueArray(normalizedUseCaseScreens);
      const sortedFlowScreens = [...flowScreens].sort();
      const sortedUseCaseScreens = [...uniqueUseCaseScreens].sort();

      // 比較
      const isConsistent =
        JSON.stringify(sortedFlowScreens) ===
        JSON.stringify(sortedUseCaseScreens);

      const comparison: ScreenOrderComparison = {
        useCaseId: useCase.id,
        useCaseName: useCase.name,
        screenFlowId: flow.id,
        screenFlowName: flow.name || flow.id,
        status: isConsistent ? 'consistent' : 'mismatch',
        useCaseScreens: normalizedUseCaseScreens,
        flowScreens,
      };

      if (!isConsistent) {
        const inUseCaseOnly = uniqueUseCaseScreens.filter(
          (s) => !flowScreens.includes(s)
        );
        const inFlowOnly = flowScreens.filter(
          (s) => !uniqueUseCaseScreens.includes(s)
        );

        comparison.difference = {
          inUseCaseOnly,
          inFlowOnly,
        };

        // 部分的に一致している場合
        if (inUseCaseOnly.length + inFlowOnly.length < flowScreens.length / 2) {
          comparison.status = 'partial-match';
        }

        mismatches.push(comparison);
      } else {
        matches.push(comparison);
      }
    }
  }

  const total = matches.length + mismatches.length;
  const score = total > 0 ? (matches.length / total) * 100 : 100;

  return {
    matches,
    mismatches,
    score,
  };
}

// ============================================================================
// アクションの整合性評価
// ============================================================================

/**
 * アクションの整合性を評価
 *
 * **評価内容:**
 * - Screen定義にアクションが存在するか
 * - ScreenFlowの遷移トリガーで参照されているアクションが定義されているか
 * - UseCaseStepで参照されているアクションが定義されているか
 *
 * @param useCases - ユースケース配列
 * @param screenFlows - 画面フロー配列
 * @param screens - 画面配列
 * @returns アクションの整合性評価結果
 */
export function assessActionConsistency(
  useCases: UseCase[],
  screenFlows: ScreenFlow[],
  screens: Screen[]
): ActionConsistency & { score: number } {
  const mismatches: ActionConsistency['mismatches'] = [];
  let totalChecks = 0;

  // 画面IDでScreenをマッピング
  const screenMap = new Map<string, Screen>();
  for (const screen of screens) {
    screenMap.set(screen.id, screen);
  }

  // ScreenFlowの遷移トリガーをチェック
  for (const flow of screenFlows) {
    // transitionsがない場合はスキップ
    if (!flow.transitions || flow.transitions.length === 0) {
      continue;
    }

    for (const transition of flow.transitions) {
      totalChecks++;
      const { screenId, actionId } = parseScreenActionRef(transition.trigger);

      const screen = screenMap.get(screenId);
      const definedInScreen =
        screen?.actions?.some((a) => a.id === actionId) || false;

      if (!definedInScreen) {
        // relatedUseCaseがない場合は「unknown」とする
        const useCaseId = flow.relatedUseCase?.id || 'unknown';
        mismatches.push({
          useCaseId,
          screenFlowId: flow.id,
          issue: 'action-not-defined-in-screen',
          screenId,
          actionId,
          definedInScreen: false,
          referencedInFlow: true,
          referencedInUseCase: false, // TODO: UseCaseStepから検出
        });
      }
    }
  }

  const matches = totalChecks - mismatches.length;
  const score = totalChecks > 0 ? (matches / totalChecks) * 100 : 100;

  return {
    matches,
    mismatches,
    score,
  };
}

// ============================================================================
// 遷移トリガーの妥当性評価
// ============================================================================

/**
 * 遷移トリガーの妥当性を評価
 *
 * **評価内容:**
 * - 遷移トリガーの画面IDが遷移元画面と一致するか
 * - トリガーで参照されている画面が存在するか
 *
 * @param screenFlows - 画面フロー配列
 * @param screens - 画面配列
 * @returns 遷移トリガーの妥当性評価結果
 */
export function assessTransitionTriggerValidity(
  screenFlows: ScreenFlow[],
  screens: Screen[]
): TransitionTriggerValidity & { score: number } {
  const invalidTriggers: TransitionTriggerValidity['invalidTriggers'] = [];
  let totalTriggers = 0;

  const screenIds = new Set(screens.map((s) => s.id));

  for (const flow of screenFlows) {
    // transitionsがない場合はスキップ
    if (!flow.transitions || flow.transitions.length === 0) {
      continue;
    }

    for (const transition of flow.transitions) {
      totalTriggers++;
      const fromScreenId = transition.from.id;
      const { screenId: triggerScreenId, actionId } = parseScreenActionRef(
        transition.trigger
      );

      // トリガーの画面が存在するか
      if (!screenIds.has(triggerScreenId)) {
        invalidTriggers.push({
          screenFlowId: flow.id,
          from: fromScreenId,
          to: transition.to.id,
          trigger: transition.trigger,
          issue: 'missing-screen',
        });
        continue;
      }

      // 遷移元画面とトリガーの画面が一致するか
      if (fromScreenId !== triggerScreenId) {
        invalidTriggers.push({
          screenFlowId: flow.id,
          from: fromScreenId,
          to: transition.to.id,
          trigger: transition.trigger,
          issue: 'screen-mismatch',
        });
      }
    }
  }

  const validTriggers = totalTriggers - invalidTriggers.length;
  const score = totalTriggers > 0 ? (validTriggers / totalTriggers) * 100 : 100;

  return {
    validTriggers,
    invalidTriggers,
    score,
  };
}

// ============================================================================
// 遷移の完全性評価
// ============================================================================

/**
 * 遷移の完全性を評価
 *
 * **評価内容:**
 * - 全ての画面から適切な遷移が定義されているか
 * - 終了画面以外に出力エッジがあるか
 *
 * @param screenFlows - 画面フロー配列
 * @returns 遷移の完全性評価結果
 */
export function assessTransitionCompleteness(
  screenFlows: ScreenFlow[]
): TransitionCompleteness & { score: number } {
  const completeFlows: string[] = [];
  const incompleteFlows: TransitionCompleteness['incompleteFlows'] = [];

  for (const flow of screenFlows) {
    // transitionsがない場合はスキップ
    if (!flow.transitions || flow.transitions.length === 0) {
      continue;
    }

    const screens = extractScreensFromFlow(flow);
    const outDegree = new Map<string, number>();

    // 初期化
    for (const screen of screens) {
      outDegree.set(screen, 0);
    }

    // 出次数を計算
    for (const transition of flow.transitions) {
      const from = transition.from.id;
      outDegree.set(from, (outDegree.get(from) || 0) + 1);
    }

    // 出次数0の画面（終了画面候補）
    const endScreens = screens.filter((s) => outDegree.get(s) === 0);

    // 出次数0が1つもない場合は循環フローなので完全
    // 出次数0が1つ以上ある場合は、それが終了画面として妥当
    if (endScreens.length === 0 || endScreens.length === 1) {
      completeFlows.push(flow.id);
    } else {
      // 複数の終了画面がある場合は不完全の可能性
      incompleteFlows.push({
        screenFlowId: flow.id,
        missingTransitions: endScreens.slice(1).map((screen) => ({
          from: screen,
          to: '(終了画面候補が複数)',
          reason: `画面 ${screen} から他の画面への遷移が定義されていません`,
        })),
      });
    }
  }

  const total = completeFlows.length + incompleteFlows.length;
  const score = total > 0 ? (completeFlows.length / total) * 100 : 100;

  return {
    completeFlows,
    incompleteFlows,
    score,
  };
}

// ============================================================================
// 統合評価
// ============================================================================

/**
 * ScreenFlowとUseCaseの整合性を総合評価
 *
 * **評価内容:**
 * 1. 画面順序の整合性（30%）
 * 2. アクションの整合性（30%）
 * 3. 遷移トリガーの妥当性（25%）
 * 4. 遷移の完全性（15%）
 *
 * @param useCases - ユースケース配列
 * @param screenFlows - 画面フロー配列
 * @param screens - 画面配列
 * @returns ScreenFlowとUseCaseの整合性評価結果
 */
export function assessFlowConsistency(
  useCases: UseCase[],
  screenFlows: ScreenFlow[],
  screens: Screen[]
): FlowConsistencyAssessment {
  // 各評価を実行
  const screenOrderConsistency = assessScreenOrderConsistency(
    useCases,
    screenFlows
  );
  const actionConsistency = assessActionConsistency(
    useCases,
    screenFlows,
    screens
  );
  const transitionTriggerValidity = assessTransitionTriggerValidity(
    screenFlows,
    screens
  );
  const transitionCompleteness =
    assessTransitionCompleteness(screenFlows);

  // 総合スコア計算
  const overallScore =
    screenOrderConsistency.score * 0.3 +
    actionConsistency.score * 0.3 +
    transitionTriggerValidity.score * 0.25 +
    transitionCompleteness.score * 0.15;

  // 推奨事項生成
  const recommendations: FlowConsistencyAssessment['recommendations'] = [];

  // 画面順序の不整合
  for (const mismatch of screenOrderConsistency.mismatches) {
    const inUseCaseOnly = mismatch.difference?.inUseCaseOnly || [];
    const inFlowOnly = mismatch.difference?.inFlowOnly || [];

    if (inUseCaseOnly.length > 0) {
      recommendations.push({
        category: 'screen-order',
        priority: 'high',
        message: `画面順序の不整合: UseCaseで使用されているが、ScreenFlowに遷移定義がない画面があります`,
        affectedElements: [mismatch.useCaseId, mismatch.screenFlowId],
        suggestedAction: `ScreenFlow「${mismatch.screenFlowName}」に以下の画面への遷移を追加してください:\n${inUseCaseOnly.map((s) => `  - ${s}`).join('\n')}`,
      });
    }

    if (inFlowOnly.length > 0) {
      recommendations.push({
        category: 'screen-order',
        priority: 'medium',
        message: `画面順序の不整合: ScreenFlowで定義されているが、UseCaseで使用されていない画面があります`,
        affectedElements: [mismatch.useCaseId, mismatch.screenFlowId],
        suggestedAction: `UseCase「${mismatch.useCaseName}」で以下の画面を使用するか、ScreenFlowから削除してください:\n${inFlowOnly.map((s) => `  - ${s}`).join('\n')}`,
      });
    }
  }

  // アクションの不整合
  for (const mismatch of actionConsistency.mismatches) {
    recommendations.push({
      category: 'action',
      priority: 'high',
      message: `アクション定義の欠落: 画面「${mismatch.screenId}」のアクション「${mismatch.actionId}」が定義されていません`,
      affectedElements: [mismatch.screenFlowId, mismatch.screenId],
      suggestedAction: `Screen定義に以下のアクションを追加してください:\n  { id: '${mismatch.actionId}', name: '...', type: '...' }`,
    });
  }

  // 遷移トリガーの不正
  for (const invalid of transitionTriggerValidity.invalidTriggers) {
    if (invalid.issue === 'screen-mismatch') {
      recommendations.push({
        category: 'trigger',
        priority: 'high',
        message: `遷移トリガーの不整合: 遷移元画面とトリガーの画面が一致しません`,
        affectedElements: [invalid.screenFlowId],
        suggestedAction: `ScreenFlow「${invalid.screenFlowId}」の遷移（${invalid.from} → ${invalid.to}）のトリガーを修正してください。トリガーの画面IDは「${invalid.from}」であるべきです`,
      });
    } else if (invalid.issue === 'missing-screen') {
      recommendations.push({
        category: 'trigger',
        priority: 'high',
        message: `遷移トリガーの不正: 存在しない画面が参照されています`,
        affectedElements: [invalid.screenFlowId],
        suggestedAction: `ScreenFlow「${invalid.screenFlowId}」の遷移トリガーで参照されている画面「${invalid.trigger.screenId}」を定義してください`,
      });
    }
  }

  // 遷移の不完全性
  for (const incomplete of transitionCompleteness.incompleteFlows) {
    recommendations.push({
      category: 'completeness',
      priority: 'medium',
      message: `遷移の不完全性: 複数の終了画面候補が検出されました`,
      affectedElements: [incomplete.screenFlowId],
      suggestedAction: `ScreenFlow「${incomplete.screenFlowId}」で終了画面を明確にするか、必要な遷移を追加してください`,
    });
  }

  return {
    overallScore,
    screenOrderConsistency,
    actionConsistency,
    transitionTriggerValidity,
    transitionCompleteness,
    recommendations,
  };
}
