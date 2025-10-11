/**
 * @fileoverview ScreenFlow整合性評価のテスト
 *
 * **目的:**
 * ScreenFlowとUseCaseの整合性評価機能の動作確認
 */

import type { Screen, ScreenFlow, UseCase } from '../../types/index.js';
import { assessFlowConsistency } from './flow-consistency.js';

// ============================================================================
// テストデータ
// ============================================================================

const testScreens: Screen[] = [
  {
    id: 'form-screen',
    name: 'フォーム画面',
    type: 'screen',
    screenType: 'form',
    actions: [
      { id: 'submit', label: '送信', actionType: 'submit' },
      { id: 'cancel', label: 'キャンセル', actionType: 'cancel' },
    ],
  },
  {
    id: 'confirm-screen',
    name: '確認画面',
    type: 'screen',
    screenType: 'confirmation',
    actions: [
      { id: 'confirm', label: '確定', actionType: 'submit' },
      { id: 'back', label: '戻る', actionType: 'navigate' },
    ],
  },
  {
    id: 'complete-screen',
    name: '完了画面',
    type: 'screen',
    screenType: 'confirmation',
    actions: [
      { id: 'close', label: '閉じる', actionType: 'navigate' },
    ],
  },
];

const testUseCases: UseCase[] = [
  {
    id: 'reservation-booking',
    name: '予約登録',
    type: 'usecase',
    description: '来店者が予約を行う',
    actors: {
      primary: { id: 'visitor' },
    },
    preconditions: ['来店者が予約サイトにアクセスしている'],
    postconditions: ['予約が完了している'],
    mainFlow: [
      {
        stepId: 'input-form',
        actor: { id: 'visitor' },
        action: '予約情報を入力',
        expectedResult: 'フォームに情報が入力される',
        screen: { id: 'form-screen' },
      },
      {
        stepId: 'confirm',
        actor: { id: 'visitor' },
        action: '内容を確認',
        expectedResult: '確認画面が表示される',
        screen: { id: 'confirm-screen' },
      },
      {
        stepId: 'complete',
        actor: { id: 'system' },
        action: '予約を確定',
        expectedResult: '完了画面が表示される',
        screen: { id: 'complete-screen' },
      },
    ],
    priority: 'high',
  },
  {
    id: 'reservation-with-mismatch',
    name: '予約登録（不整合あり）',
    type: 'usecase',
    description: '意図的に不整合を持つテストケース',
    actors: {
      primary: { id: 'visitor' },
    },
    preconditions: [],
    postconditions: [],
    mainFlow: [
      {
        stepId: 'step-1',
        actor: { id: 'visitor' },
        action: '入力',
        expectedResult: '結果',
        screen: { id: 'form-screen' },
      },
      {
        stepId: 'step-2',
        actor: { id: 'visitor' },
        action: '確認',
        expectedResult: '結果',
        screen: { id: 'non-existent-screen' }, // 存在しない画面
      },
    ],
    priority: 'low',
  },
];

const testScreenFlows: ScreenFlow[] = [
  {
    id: 'booking-flow',
    name: '予約登録フロー',
    type: 'screen-flow',
    description: '予約登録の画面遷移',
    transitions: [
      {
        from: { id: 'form-screen' },
        to: { id: 'confirm-screen' },
        trigger: {
          screenId: 'form-screen',
          actionId: 'submit',
        },
        condition: 'バリデーション通過',
      },
      {
        from: { id: 'confirm-screen' },
        to: { id: 'complete-screen' },
        trigger: {
          screenId: 'confirm-screen',
          actionId: 'confirm',
        },
      },
    ],
    relatedUseCase: { id: 'reservation-booking' },
  },
  {
    id: 'booking-flow-with-issues',
    name: '予約登録フロー（問題あり）',
    type: 'screen-flow',
    description: '意図的に問題を持つテストケース',
    transitions: [
      {
        from: { id: 'form-screen' },
        to: { id: 'confirm-screen' },
        trigger: {
          screenId: 'form-screen',
          actionId: 'non-existent-action', // 存在しないアクション
        },
      },
      {
        from: { id: 'confirm-screen' },
        to: { id: 'complete-screen' },
        trigger: {
          screenId: 'form-screen', // 遷移元と一致しない
          actionId: 'submit',
        },
      },
    ],
    relatedUseCase: { id: 'reservation-with-mismatch' },
  },
];

// ============================================================================
// テスト実行
// ============================================================================

console.log('='.repeat(80));
console.log('ScreenFlow整合性評価テスト');
console.log('='.repeat(80));
console.log();

const result = assessFlowConsistency(testUseCases, testScreenFlows, testScreens);

console.log(`総合スコア: ${result.overallScore.toFixed(1)}/100`);
console.log();

console.log('【画面順序の整合性】');
console.log(`  スコア: ${result.screenOrderConsistency.score.toFixed(1)}/100`);
console.log(`  一致: ${result.screenOrderConsistency.matches.length}件`);
console.log(`  不一致: ${result.screenOrderConsistency.mismatches.length}件`);
for (const match of result.screenOrderConsistency.matches) {
  console.log(
    `    ✅ ${match.useCaseName} - ${match.screenFlowName}: 整合性OK`
  );
}
for (const mismatch of result.screenOrderConsistency.mismatches) {
  console.log(
    `    ❌ ${mismatch.useCaseName} - ${mismatch.screenFlowName}: 不一致`
  );
  if (mismatch.difference) {
    if (mismatch.difference.inUseCaseOnly.length > 0) {
      console.log(
        `       UseCaseのみ: ${mismatch.difference.inUseCaseOnly.join(', ')}`
      );
    }
    if (mismatch.difference.inFlowOnly.length > 0) {
      console.log(
        `       ScreenFlowのみ: ${mismatch.difference.inFlowOnly.join(', ')}`
      );
    }
  }
}
console.log();

console.log('【アクションの整合性】');
console.log(`  スコア: ${result.actionConsistency.score.toFixed(1)}/100`);
console.log(`  一致: ${result.actionConsistency.matches}件`);
console.log(`  不一致: ${result.actionConsistency.mismatches.length}件`);
for (const mismatch of result.actionConsistency.mismatches) {
  console.log(
    `    ❌ ${mismatch.screenFlowId}: 画面「${mismatch.screenId}」のアクション「${mismatch.actionId}」が未定義`
  );
}
console.log();

console.log('【遷移トリガーの妥当性】');
console.log(`  スコア: ${result.transitionTriggerValidity.score.toFixed(1)}/100`);
console.log(`  有効: ${result.transitionTriggerValidity.validTriggers}件`);
console.log(`  無効: ${result.transitionTriggerValidity.invalidTriggers.length}件`);
for (const invalid of result.transitionTriggerValidity.invalidTriggers) {
  console.log(
    `    ❌ ${invalid.screenFlowId}: ${invalid.from} → ${invalid.to}`
  );
  console.log(`       問題: ${invalid.issue}`);
}
console.log();

console.log('【遷移の完全性】');
console.log(`  スコア: ${result.transitionCompleteness.score.toFixed(1)}/100`);
console.log(`  完全: ${result.transitionCompleteness.completeFlows.length}件`);
console.log(`  不完全: ${result.transitionCompleteness.incompleteFlows.length}件`);
console.log();

console.log('【推奨事項】');
console.log(`  総数: ${result.recommendations.length}件`);
for (const rec of result.recommendations) {
  console.log();
  console.log(`  [${rec.priority.toUpperCase()}] (${rec.category}) ${rec.message}`);
  console.log(`  対象: ${rec.affectedElements.join(', ')}`);
  const lines = rec.suggestedAction.split('\n');
  console.log(`  推奨アクション: ${lines[0]}`);
  if (lines.length > 1) {
    for (const line of lines.slice(1, 4)) {
      console.log(`    ${line}`);
    }
    if (lines.length > 4) {
      console.log(`    ... (他 ${lines.length - 4} 行)`);
    }
  }
}

console.log();
console.log('='.repeat(80));
console.log('テスト完了');
console.log('='.repeat(80));
