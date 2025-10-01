/**
 * stepNumber自動管理システム
 * 開発者の負担を軽減し、保守性を向上
 * 戻り先指定はstepIdに統一
 */

import type { AlternativeFlow as BaseAlternativeFlow, UseCase as BaseUseCase, UseCaseStep as BaseUseCaseStep } from './delivery-elements';

// ===== 推奨解決策: stepId拡張 + 自動番号生成 =====

/**
 * stepIdを追加したUseCaseStep
 * stepNumberは配列位置から自動計算
 */
export interface EnhancedUseCaseStep extends Omit<BaseUseCaseStep, 'stepNumber'> {
  // オプショナルなstepId（開発者が指定、戻り先参照に使用）
  stepId?: string;
  
  // 実行時に配列インデックスから自動計算される
  readonly stepNumber?: number;
}

/**
 * stepId対応の代替フロー
 */
export interface EnhancedAlternativeFlow extends Omit<BaseAlternativeFlow, 'steps' | 'returnToStep'> {
  steps: EnhancedUseCaseStep[];
  
  // stepIdベースの戻り先指定（統一）
  returnToStepId?: string;
}

/**
 * 拡張されたUseCase
 */
export interface EnhancedUseCase extends Omit<BaseUseCase, 'mainFlow' | 'alternativeFlows'> {
  mainFlow: EnhancedUseCaseStep[];
  alternativeFlows?: EnhancedAlternativeFlow[];
}

// ===== ユーティリティ関数 =====

/**
 * stepNumberを自動計算してUseCaseStepを enrichする
 */
export function enrichStepsWithNumbers(steps: EnhancedUseCaseStep[]): BaseUseCaseStep[] {
  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1
  }));
}

/**
 * UseCaseを enrichして実行可能な形式に変換
 */
export function enrichUseCase(enhancedUseCase: EnhancedUseCase): BaseUseCase {
  const enrichedMainFlow = enrichStepsWithNumbers(enhancedUseCase.mainFlow);
  
  const enrichedAlternativeFlows = enhancedUseCase.alternativeFlows?.map(flow => {
    const enrichedSteps = enrichStepsWithNumbers(flow.steps);
    
    // returnToStepIdからstepNumberに変換
    let returnToStep: number | undefined;
    if (flow.returnToStepId) {
      const targetStepIndex = enhancedUseCase.mainFlow.findIndex(
        step => step.stepId === flow.returnToStepId
      );
      if (targetStepIndex >= 0) {
        returnToStep = targetStepIndex + 1;
      }
    }
    
    return {
      ...flow,
      steps: enrichedSteps,
      returnToStep
    };
  });
  
  return {
    ...enhancedUseCase,
    mainFlow: enrichedMainFlow,
    alternativeFlows: enrichedAlternativeFlows
  };
}

/**
 * stepIdまたはstepNumberでステップを検索
 */
export function findStepByIdOrNumber(
  useCase: EnhancedUseCase, 
  identifier: string | number
): { step: EnhancedUseCaseStep; stepNumber: number } | undefined {
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
export const improvedOrderProcessing: EnhancedUseCase = {
  id: 'order-processing',
  type: 'usecase', 
  owner: 'business-analyst',
  name: '注文処理',
  description: '顧客の注文を受け付け、決済から配送まで処理する',
  actors: {
    primary: 'customer',
    secondary: ['payment-service', 'shipping-service']
  },
  preconditions: ['顧客がログインしている'],
  postconditions: ['注文が完了している'],
  mainFlow: [
    {
      stepId: 'select-products',  // ✨ IDベースの管理
      actor: 'customer',
      action: '商品を選択してカートに追加',
      expectedResult: '商品がカートに追加される'
      // stepNumberは自動で1になる
    },
    {
      stepId: 'checkout',
      actor: 'customer', 
      action: 'チェックアウト画面で注文内容を確認',
      expectedResult: '注文詳細が表示される'
      // stepNumberは自動で2になる
    },
    {
      stepId: 'payment',
      actor: 'payment-service',
      action: '決済処理を実行',
      expectedResult: '決済が完了する'
      // stepNumberは自動で3になる
    },
    {
      stepId: 'shipping',
      actor: 'shipping-service',
      action: '配送手配を行う',
      expectedResult: '配送が開始される'
      // stepNumberは自動で4になる
    }
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
          expectedResult: '失敗理由が特定される'
        },
        {
          actor: 'customer',
          action: '別の決済方法を選択',
          expectedResult: '代替決済手段が選択される'
        }
      ],
      returnToStepId: 'payment'  // ✨ IDベースで戻り先指定
    },
    {
      id: 'out-of-stock',
      name: '在庫切れ',
      condition: '注文商品の在庫が不足',
      steps: [
        {
          actor: 'inventory-system',
          action: '在庫状況を確認',
          expectedResult: '在庫不足が確認される'
        }
      ],
      returnToStepId: 'select-products'  // ✨ 商品選択に戻る
    }
  ],
  businessValue: '顧客の購買体験向上',
  priority: 'high'
};

// 実際に使用する際は enrichして標準のUseCaseに変換
export const standardOrderProcessing: BaseUseCase = enrichUseCase(improvedOrderProcessing);