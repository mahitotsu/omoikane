/**
 * @fileoverview 画面遷移フローのユーティリティ関数
 *
 * **目的:**
 * ScreenFlowのtransitionsから画面リスト、開始画面、終了画面を導出します。
 *
 * **設計原則:**
 * - DRY原則: transitionsのみが真実の源
 * - 純粋関数: 副作用なし、決定的な出力
 * - グラフ理論: トポロジー解析（入次数・出次数）
 *
 * **主要機能:**
 * 1. deriveScreens: フロー内の全画面を抽出
 * 2. deriveStartScreens: 入次数0の画面（開始画面）を抽出
 * 3. deriveEndScreens: 出次数0の画面（終了画面）を抽出
 * 4. deriveScreenFlowMetadata: 上記3つをまとめて実行
 *
 * **使用例:**
 * ```typescript
 * import { deriveScreenFlowMetadata } from 'omoikane-metamodel';
 *
 * const flow: ScreenFlow = {
 *   id: 'account-deletion-flow',
 *   transitions: [
 *     { from: { id: 'list' }, to: { id: 'confirm' }, ... },
 *     { from: { id: 'confirm' }, to: { id: 'complete' }, ... },
 *   ],
 * };
 *
 * const metadata = deriveScreenFlowMetadata(flow);
 * // metadata.screens: ['list', 'confirm', 'complete']
 * // metadata.startScreens: ['list']
 * // metadata.endScreens: ['complete']
 * ```
 *
 * @module types/ui/screen-flow-utils
 */

import type { ScreenFlow } from './screen-flow.js';

/**
 * 画面遷移フローのメタデータ
 */
export interface ScreenFlowMetadata {
  /** フロー内の全画面ID */
  screens: string[];

  /** 開始画面ID（入次数が0の画面） */
  startScreens: string[];

  /** 終了画面ID（出次数が0の画面） */
  endScreens: string[];
}

/**
 * 画面遷移フローから全画面を導出
 *
 * **アルゴリズム:**
 * transitionsの全てのfrom/toから画面IDを収集し、重複を排除します。
 *
 * **計算量:** O(n) where n = transitions.length
 *
 * **使用例:**
 * ```typescript
 * const screens = deriveScreens(flow);
 * console.log('画面数:', screens.length);
 * ```
 *
 * @param flow - 画面遷移フロー
 * @returns 全画面IDの配列
 */
export function deriveScreens(flow: ScreenFlow): string[] {
  const screens = new Set<string>();

  for (const transition of flow.transitions) {
    screens.add(transition.from.id);
    screens.add(transition.to.id);
  }

  return Array.from(screens);
}

/**
 * 画面遷移フローから開始画面を導出
 *
 * **定義:**
 * 開始画面とは、他の画面から遷移してこない画面（入次数が0）です。
 *
 * **アルゴリズム:**
 * 1. 全画面を収集
 * 2. 各画面への遷移数（入次数）をカウント
 * 3. 入次数が0の画面を抽出
 *
 * **計算量:** O(n) where n = transitions.length
 *
 * **注意:**
 * - 循環フローの場合、空配列が返される可能性があります
 * - 複数の開始画面が存在する場合、全てが返されます
 *
 * **使用例:**
 * ```typescript
 * const starts = deriveStartScreens(flow);
 * if (starts.length === 0) {
 *   console.warn('開始画面がありません（循環フロー）');
 * } else if (starts.length > 1) {
 *   console.warn('複数の開始画面:', starts);
 * }
 * ```
 *
 * @param flow - 画面遷移フロー
 * @returns 開始画面IDの配列
 */
export function deriveStartScreens(flow: ScreenFlow): string[] {
  const inDegree = new Map<string, number>();
  const allScreens = new Set<string>();

  // 全画面を収集し、入次数を初期化
  for (const transition of flow.transitions) {
    allScreens.add(transition.from.id);
    allScreens.add(transition.to.id);

    // 遷移先の入次数をインクリメント
    inDegree.set(transition.to.id, (inDegree.get(transition.to.id) || 0) + 1);
  }

  // 入次数が0の画面を抽出
  return Array.from(allScreens).filter((id) => (inDegree.get(id) || 0) === 0);
}

/**
 * 画面遷移フローから終了画面を導出
 *
 * **定義:**
 * 終了画面とは、他の画面へ遷移しない画面（出次数が0）です。
 *
 * **アルゴリズム:**
 * 1. 全画面を収集
 * 2. 各画面からの遷移数（出次数）をカウント
 * 3. 出次数が0の画面を抽出
 *
 * **計算量:** O(n) where n = transitions.length
 *
 * **注意:**
 * - 循環フローの場合、空配列が返される可能性があります
 * - 複数の終了画面が存在する場合、全てが返されます
 *
 * **使用例:**
 * ```typescript
 * const ends = deriveEndScreens(flow);
 * if (ends.length === 0) {
 *   console.warn('終了画面がありません（循環フロー）');
 * } else {
 *   console.log('終了画面:', ends);
 * }
 * ```
 *
 * @param flow - 画面遷移フロー
 * @returns 終了画面IDの配列
 */
export function deriveEndScreens(flow: ScreenFlow): string[] {
  const outDegree = new Map<string, number>();
  const allScreens = new Set<string>();

  // 全画面を収集し、出次数を初期化
  for (const transition of flow.transitions) {
    allScreens.add(transition.from.id);
    allScreens.add(transition.to.id);

    // 遷移元の出次数をインクリメント
    outDegree.set(transition.from.id, (outDegree.get(transition.from.id) || 0) + 1);
  }

  // 出次数が0の画面を抽出
  return Array.from(allScreens).filter((id) => (outDegree.get(id) || 0) === 0);
}

/**
 * 画面遷移フローのメタデータをまとめて導出
 *
 * **目的:**
 * 画面リスト、開始画面、終了画面を一度に取得します。
 * 個別に関数を呼ぶよりも効率的です。
 *
 * **最適化:**
 * 内部で1回だけtransitionsをイテレートし、
 * 全ての情報を同時に計算します。
 *
 * **計算量:** O(n) where n = transitions.length
 *
 * **使用例:**
 * ```typescript
 * const metadata = deriveScreenFlowMetadata(flow);
 *
 * console.log('画面数:', metadata.screens.length);
 * console.log('開始画面:', metadata.startScreens);
 * console.log('終了画面:', metadata.endScreens);
 *
 * // 検証例
 * if (metadata.startScreens.length !== 1) {
 *   console.warn('開始画面が1つではありません');
 * }
 * if (metadata.endScreens.length === 0) {
 *   console.warn('終了画面がありません');
 * }
 * ```
 *
 * @param flow - 画面遷移フロー
 * @returns 画面フローのメタデータ
 */
export function deriveScreenFlowMetadata(flow: ScreenFlow): ScreenFlowMetadata {
  const allScreens = new Set<string>();
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();

  // 1回のイテレーションで全ての情報を収集
  for (const transition of flow.transitions) {
    const fromId = transition.from.id;
    const toId = transition.to.id;

    // 画面を収集
    allScreens.add(fromId);
    allScreens.add(toId);

    // 入次数・出次数をカウント
    inDegree.set(toId, (inDegree.get(toId) || 0) + 1);
    outDegree.set(fromId, (outDegree.get(fromId) || 0) + 1);
  }

  const screens = Array.from(allScreens);

  return {
    screens,
    startScreens: screens.filter((id) => (inDegree.get(id) || 0) === 0),
    endScreens: screens.filter((id) => (outDegree.get(id) || 0) === 0),
  };
}
