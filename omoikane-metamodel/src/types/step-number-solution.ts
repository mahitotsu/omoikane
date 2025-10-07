/**
 * @fileoverview stepNumber自動管理システム
 * 
 * **目的:**
 * ユースケースのステップ番号を自動計算し、開発者の負担を軽減します。
 * 手動でstepNumberを管理する必要がなく、保守性が向上します。
 * 戻り先指定はstepIdに統一し、ステップの挿入・削除に強い設計を実現します。
 * 
 * **主要機能:**
 * 1. enrichStepsWithNumbers(): stepNumberを自動計算してステップを補完
 * 2. findStepByIdOrNumber(): stepIdまたはstepNumberでステップを検索
 * 3. 使用例: 改善された書き方のサンプル
 * 
 * **設計原則:**
 * - 自動化: stepNumberは配列インデックスから自動計算
 * - ID重視: 戻り先指定はstepIdベース（番号ではなくID）
 * - 保守性: ステップの挿入・削除が容易
 * 
 * **従来の問題点:**
 * ```typescript
 * // 従来の書き方（手動でstepNumberを管理）
 * mainFlow: [
 *   { stepNumber: 1, ... },
 *   { stepNumber: 2, ... },
 *   { stepNumber: 3, ... }
 * ]
 * // 問題: ステップを挿入・削除すると全ての番号を振り直す必要がある
 * ```
 * 
 * **改善された書き方:**
 * ```typescript
 * // stepNumberを省略（自動計算される）
 * mainFlow: [
 *   { stepId: 'step1', ... },  // stepNumber: 1（自動）
 *   { stepId: 'step2', ... },  // stepNumber: 2（自動）
 *   { stepId: 'step3', ... }   // stepNumber: 3（自動）
 * ]
 * // 利点: ステップを挿入・削除しても番号が自動更新される
 * 
 * // 戻り先指定はstepIdベース
 * alternativeFlows: [
 *   {
 *     id: 'error-flow',
 *     returnToStepId: 'step2'  // IDで指定（番号ではない）
 *   }
 * ]
 * ```
 * 
 * **使用例:**
 * ```typescript
 * // ステップ番号を自動計算
 * const enrichedSteps = enrichStepsWithNumbers(useCase.mainFlow);
 * // enrichedSteps[0].stepNumber === 1
 * // enrichedSteps[1].stepNumber === 2
 * 
 * // ステップを検索
 * const result = findStepByIdOrNumber(useCase, 'payment');
 * if (result) {
 *   console.log(`ステップ${result.stepNumber}: ${result.step.action}`);
 * }
 * ```
 * 
 * @module types/step-number-solution
 */

import type * as Functional from './functional/index.js';

// ============================================================================
// 型エイリアス
// ============================================================================

type UseCase = Functional.UseCase;
type UseCaseStep = Functional.UseCaseStep;

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * stepNumberを自動計算してUseCaseStepを enrichする
 * 
 * **目的:**
 * ステップ配列を走査し、各ステップに自動計算されたstepNumberを付与します。
 * 配列のインデックス（0始まり）に1を加えた値をstepNumberとして設定します。
 * 
 * **処理内容:**
 * 1. ステップ配列を走査
 * 2. 各ステップのインデックスから番号を計算（index + 1）
 * 3. 元のステップオブジェクトにstepNumberを追加して返す
 * 
 * **パラメータ:**
 * @param steps - stepNumberを付与するステップ配列
 * 
 * **戻り値:**
 * @returns stepNumberが付与されたステップ配列
 * 
 * **使用例:**
 * ```typescript
 * const steps: UseCaseStep[] = [
 *   { stepId: 'login', actor: 'user', action: 'ログイン', expectedResult: '成功' },
 *   { stepId: 'search', actor: 'user', action: '検索', expectedResult: '結果表示' }
 * ];
 * 
 * const enrichedSteps = enrichStepsWithNumbers(steps);
 * // enrichedSteps[0].stepNumber === 1
 * // enrichedSteps[1].stepNumber === 2
 * 
 * // ユースケース全体に適用
 * const useCase: UseCase = {
 *   // ... その他のフィールド
 *   mainFlow: enrichStepsWithNumbers(rawSteps)
 * };
 * ```
 */
export function enrichStepsWithNumbers(steps: UseCaseStep[]): UseCaseStep[] {
  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
  }));
}

/**
 * stepIdまたはstepNumberでステップを検索
 * 
 * **目的:**
 * ユースケースのメインフローから、stepIdまたはstepNumberでステップを検索します。
 * 検索に成功した場合、ステップオブジェクトと計算されたstepNumberを返します。
 * 
 * **検索方法:**
 * - string型の識別子: stepIdで検索
 * - number型の識別子: stepNumberで検索（1始まり）
 * 
 * **パラメータ:**
 * @param useCase - 検索対象のユースケース
 * @param identifier - ステップID（string）またはステップ番号（number）
 * 
 * **戻り値:**
 * @returns 検索結果（step: ステップオブジェクト、stepNumber: ステップ番号）
 *          見つからない場合はundefined
 * 
 * **使用例:**
 * ```typescript
 * const useCase: UseCase = {
 *   // ...
 *   mainFlow: [
 *     { stepId: 'login', actor: 'user', action: 'ログイン', expectedResult: '成功' },
 *     { stepId: 'search', actor: 'user', action: '検索', expectedResult: '結果表示' },
 *     { stepId: 'purchase', actor: 'user', action: '購入', expectedResult: '完了' }
 *   ]
 * };
 * 
 * // stepIdで検索
 * const result1 = findStepByIdOrNumber(useCase, 'search');
 * if (result1) {
 *   console.log(`ステップ${result1.stepNumber}: ${result1.step.action}`);
 *   // 出力: ステップ2: 検索
 * }
 * 
 * // stepNumberで検索
 * const result2 = findStepByIdOrNumber(useCase, 3);
 * if (result2) {
 *   console.log(`ステップID: ${result2.step.stepId}`);
 *   // 出力: ステップID: purchase
 * }
 * 
 * // 見つからない場合
 * const result3 = findStepByIdOrNumber(useCase, 'unknown');
 * if (!result3) {
 *   console.log('ステップが見つかりません');
 * }
 * 
 * // 代替フローの戻り先を解決
 * const altFlow = useCase.alternativeFlows?.[0];
 * if (altFlow?.returnToStepId) {
 *   const returnStep = findStepByIdOrNumber(useCase, altFlow.returnToStepId);
 *   if (returnStep) {
 *     console.log(`ステップ${returnStep.stepNumber}に戻る`);
 *   }
 * }
 * ```
 */
export function findStepByIdOrNumber(
  useCase: UseCase,
  identifier: string | number
): { step: UseCaseStep; stepNumber: number } | undefined {
  for (let i = 0; i < useCase.mainFlow.length; i++) {
    const step = useCase.mainFlow[i];
    if (!step) continue;

    const stepNumber = i + 1;

    if (typeof identifier === 'string' && step.stepId === identifier) {
      return { step, stepNumber };
    }
    if (typeof identifier === 'number' && stepNumber === identifier) {
      return { step, stepNumber };
    }
  }
  return undefined;
}

// ============================================================================
// 使用例
// ============================================================================

/**
 * 改善された書き方の例
 * 
 * **改善ポイント:**
 * 1. stepNumberを手動管理する必要がない（自動計算される）
 * 2. 戻り先指定はstepIdベース（番号振り直しの影響を受けない）
 * 3. ステップの挿入・削除が容易（番号を振り直さなくて良い）
 * 
 * **従来の問題:**
 * - ステップを追加・削除すると全てのstepNumberを手動で振り直し
 * - returnToStepNumberも手動で調整が必要
 * - 保守性が低く、エラーが発生しやすい
 * 
 * **改善後の利点:**
 * - stepNumberは自動計算（enrichStepsWithNumbers使用）
 * - returnToStepIdはID参照（ステップの位置が変わっても影響なし）
 * - 保守性が高く、エラーが発生しにくい
 */
export const improvedOrderProcessing: UseCase = {
  id: 'order-processing',
  name: '注文処理',
  description: '顧客の注文を受け付け、決済から配送まで処理する',
  actors: {
    primary: { id: 'customer' },
    secondary: [{ id: 'payment-service' }, { id: 'shipping-service' }],
  },
  businessRequirementCoverage: {
    requirement: { id: 'order-management-business-requirements' },
    businessGoals: [{ id: 'goal-streamline-order-processing' }],
  },
  preconditions: ['顧客がログインしている'],
  postconditions: ['注文が完了している'],
  priority: 'high',
  mainFlow: [
    {
      stepId: 'select-products', // ✨ IDベースの管理（番号ではなくIDで識別）
      actor: { id: 'customer' },
      action: '商品を選択してカートに追加',
      expectedResult: '商品がカートに追加される',
      // stepNumberは自動で1になる（enrichStepsWithNumbers使用時）
    },
    {
      stepId: 'checkout',
      actor: 'customer',
      action: 'チェックアウト画面で注文内容を確認',
      expectedResult: '注文詳細が表示される',
      // stepNumberは自動で2になる
    },
    {
      stepId: 'payment',
      actor: 'payment-service',
      action: '決済処理を実行',
      expectedResult: '決済が完了する',
      // stepNumberは自動で3になる
    },
    {
      stepId: 'shipping',
      actor: 'shipping-service',
      action: '配送手配を行う',
      expectedResult: '配送が開始される',
      // stepNumberは自動で4になる
    },
  ],
  alternativeFlows: [
    {
      id: 'payment-failure',
      name: '決済失敗',
      condition: '決済サービスから決済失敗の応答を受信',
      steps: [
        {
          actor: 'payment-service',
          action: '決済失敗理由を分析',
          expectedResult: '失敗理由が特定される',
        },
        {
          actor: 'customer',
          action: '別の決済方法を選択',
          expectedResult: '代替決済手段が選択される',
        },
      ],
      returnToStepId: 'payment', // ✨ IDベースで戻り先指定（'payment'ステップに戻る）
      // 利点: ステップの順序が変わってもIDは変わらないため、安全
    },
    {
      id: 'out-of-stock',
      name: '在庫切れ',
      condition: '注文商品の在庫が不足',
      steps: [
        {
          actor: { id: 'inventory-system' },
          action: '在庫状況を確認',
          expectedResult: '在庫不足が確認される',
        },
      ],
      returnToStepId: 'select-products', // ✨ 商品選択ステップに戻る
    },
  ],
};
