#!/usr/bin/env bun
/**
 * stepNumber問題の解決策デモンストレーション
 */

import type { EnhancedUseCase } from '../src/types/delivery-elements';
import { enrichUseCase } from '../src/types/step-number-solution';

// ===== 問題の実演 =====
console.log('🚨 従来の問題点:');
console.log('  1. stepNumberを手動管理');
console.log('  2. ステップ追加時に番号ずれのリスク');
console.log('  3. returnToStepの参照不整合');
console.log('');

// ===== 解決策の実演 =====
console.log('✨ 改善された書き方:');

const improvedUseCase: EnhancedUseCase = {
  id: 'demo-usecase',
  type: 'usecase',
  owner: 'developer',
  name: 'stepNumber自動管理デモ',
  description: 'stepNumberを手動管理する必要がない',
  actors: {
    primary: 'customer',
    secondary: ['payment-service']
  },
  preconditions: ['顧客がログイン済み'],
  postconditions: ['処理が完了'],
  businessValue: '開発効率向上',
  priority: 'high',
  mainFlow: [
    {
      stepId: 'login',
      actor: 'customer',
      action: 'システムにログイン',
      expectedResult: 'ログインが完了する'
      // stepNumberは自動で1になる
    },
    {
      stepId: 'select-item',
      actor: 'customer',
      action: '商品を選択',
      expectedResult: '商品が選択される'
      // stepNumberは自動で2になる
    },
    {
      stepId: 'payment',
      actor: 'payment-service',
      action: '決済処理',
      expectedResult: '決済が完了する'
      // stepNumberは自動で3になる
    },
    {
      stepId: 'confirmation',
      actor: 'customer',
      action: '完了画面を確認',
      expectedResult: '処理完了が確認される'
      // stepNumberは自動で4になる
    }
  ],
  alternativeFlows: [
    {
      id: 'payment-failed',
      name: '決済失敗',
      condition: '決済処理でエラーが発生',
      steps: [
        {
          actor: 'payment-service',
          action: 'エラー内容を分析',
          expectedResult: '失敗理由が特定される'
        },
        {
          actor: 'customer',
          action: '別の決済方法を選択',
          expectedResult: '代替手段が選択される'
        }
      ],
      returnToStepId: 'payment'  // ✨ stepIdで指定！
    }
  ]
};

console.log('📝 EnhancedUseCaseの定義:');
console.log('  - stepNumberは自動計算');
console.log('  - stepIdで意味のある名前を付与');
console.log('  - returnToStepIdで安全な参照');
console.log('');

// 実用形式に変換
const standardUseCase = enrichUseCase(improvedUseCase);

console.log('🔧 enrichUseCase()で変換後:');
console.log('mainFlow:');
standardUseCase.mainFlow.forEach((step, index) => {
  const enhancedStep = improvedUseCase.mainFlow[index];
  if (enhancedStep) {
    console.log(`  ${step.stepNumber}. [${enhancedStep.stepId}] ${step.action}`);
  }
});

console.log('');
console.log('alternativeFlows:');
standardUseCase.alternativeFlows?.forEach(flow => {
  console.log(`  ${flow.id}: returnToStep=${flow.returnToStep} (was returnToStepId='${improvedUseCase.alternativeFlows?.find(f => f.id === flow.id)?.returnToStepId}')`);
});

// ===== 開発ワークフローの比較 =====
console.log('');
console.log('📊 開発ワークフロー比較:');
console.log('');

console.log('❌ 従来のアプローチ:');
console.log('  1. stepNumber: 1, 2, 3, 4 を手動設定');
console.log('  2. ステップ2と3の間に新ステップ追加');
console.log('  3. → stepNumber: 1, 2, 新2.5, 3, 4 に手動変更');
console.log('  4. → returnToStep: 3 も 4 に手動変更');
console.log('  5. → ヒューマンエラーのリスク');

console.log('');
console.log('✅ 改善されたアプローチ:');
console.log('  1. stepId: "login", "select", "payment", "confirm"');
console.log('  2. "select"と"payment"の間に"validation"を追加');
console.log('  3. → 配列に挿入するだけ');
console.log('  4. → stepNumberは自動で再計算');
console.log('  5. → returnToStepId: "payment" は変更不要');

console.log('');
console.log('🎯 メリット:');
console.log('  ✅ stepNumber管理の自動化');
console.log('  ✅ ステップ追加・削除が安全');
console.log('  ✅ 意味のあるstepId名');
console.log('  ✅ 参照の破綻防止');
console.log('  ✅ 既存コードとの互換性');

console.log('');
console.log('🚀 使用開始方法:');
console.log('  1. 新しいユースケース作成時にEnhancedUseCaseを使用');
console.log('  2. ビルド確認: bun scripts/auto-build.ts');
console.log('  3. stepIdに意味のある名前を設定');

export { improvedUseCase, standardUseCase };
