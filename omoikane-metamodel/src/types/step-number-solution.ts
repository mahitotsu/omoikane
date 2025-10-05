/**
 * stepNumber自動管理システム
 * 開発者の負担を軽減し、保守性を向上
 * 戻り先指定はstepIdに統一
 */

import type * as Functional from './functional/index.js';

// 型エイリアス
type UseCase = Functional.UseCase;
type UseCaseStep = Functional.UseCaseStep;

// ===== ユーティリティ関数 =====

/**
 * stepNumberを自動計算してUseCaseStepを enrichする
 */
export function enrichStepsWithNumbers(steps: UseCaseStep[]): UseCaseStep[] {
  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
  }));
}

/**
 * stepIdまたはstepNumberでステップを検索
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

// ===== 使用例 =====

/**
 * 改善された書き方の例
 * stepNumberを手動管理する必要がない
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
      stepId: 'select-products', // ✨ IDベースの管理
      actor: { id: 'customer' },
      action: '商品を選択してカートに追加',
      expectedResult: '商品がカートに追加される',
      // stepNumberは自動で1になる
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
      returnToStepId: 'payment', // ✨ IDベースで戻り先指定
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
      returnToStepId: 'select-products', // ✨ 商品選択に戻る
    },
  ],
};
