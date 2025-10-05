#!/usr/bin/env bun
/**
 * 成熟度評価システムのテスト
 */

import {
    assessProjectMaturity,
    MaturityLevel,
} from '../src/quality/maturity/index.js';

// テスト用のサンプルデータ
const sampleActor = {
  id: 'actor-001',
  name: 'テストアクター',
  description: 'これは30文字以上のテストアクターの説明文です。',
  role: 'primary' as const,
  responsibilities: ['責務1', '責務2'],
};

const sampleUseCase = {
  id: 'uc-001',
  name: 'テストユースケース',
  description: 'これは50文字以上のユースケース説明文です。詳細な内容を記述しています。',
  actors: {
    primary: { id: 'actor-001', name: 'テストアクター' },
  },
  mainFlow: [
    {
      stepId: 'step-1',
      actor: { id: 'actor-001', name: 'テストアクター' },
      action: 'アクション1',
      expectedResult: '期待結果1',
    },
    {
      stepId: 'step-2',
      actor: { id: 'actor-001', name: 'テストアクター' },
      action: 'アクション2',
      expectedResult: '期待結果2',
    },
    {
      stepId: 'step-3',
      actor: { id: 'actor-001', name: 'テストアクター' },
      action: 'アクション3',
      expectedResult: '期待結果3',
    },
  ],
  preconditions: ['事前条件1'],
  postconditions: ['事後条件1'],
  priority: 'high' as const,
};

const sampleBusinessRequirement = {
  id: 'br-001',
  name: 'テスト業務要件',
  title: 'テスト業務要件のタイトル',
  summary: 'これは業務要件の要約です。',
  businessGoals: [
    { id: 'goal-1', description: 'ビジネス目標1' },
  ],
  scope: {
    inScope: [
      { id: 'scope-1', description: 'スコープ内項目1' },
      { id: 'scope-2', description: 'スコープ内項目2' },
    ],
    outOfScope: [],
  },
  stakeholders: [
    { id: 'sh-1', description: 'ステークホルダー1: 役割1' },
    { id: 'sh-2', description: 'ステークホルダー2: 役割2' },
  ],
};

console.log('🔍 成熟度評価システムのテスト\n');
console.log('=' .repeat(60));

// プロジェクト全体の成熟度評価
const assessment = assessProjectMaturity(
  [sampleBusinessRequirement],
  [sampleActor],
  [sampleUseCase]
);

console.log('\n📊 プロジェクト全体の成熟度評価結果');
console.log('=' .repeat(60));
console.log(`評価日時: ${assessment.timestamp}`);
console.log(`プロジェクトレベル: レベル${assessment.projectLevel} (${getMaturityLevelName(assessment.projectLevel)})`);
console.log(`\n成熟度分布:`);
Object.entries(assessment.distribution).forEach(([level, count]) => {
  if (count > 0) {
    console.log(`  レベル${level}: ${count}個`);
  }
});

console.log('\n📈 ディメンション別評価:');
assessment.overallDimensions.forEach(dim => {
  const percentage = (dim.completionRate * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(dim.completionRate * 20)) + 
              '░'.repeat(20 - Math.floor(dim.completionRate * 20));
  console.log(`  ${getDimensionName(dim.dimension)}: [${bar}] ${percentage}% (レベル${dim.currentLevel})`);
});

console.log('\n💪 強み:');
if (assessment.strengths.length > 0) {
  assessment.strengths.forEach(s => console.log(`  ✓ ${s}`));
} else {
  console.log('  (なし)');
}

console.log('\n⚠️  改善領域:');
if (assessment.improvementAreas.length > 0) {
  assessment.improvementAreas.forEach(a => console.log(`  • ${a}`));
} else {
  console.log('  (なし)');
}

console.log('\n🎯 推奨アクション:');
assessment.recommendedActions.forEach((action, i) => {
  const priorityIcon = action.priority === 'high' ? '🔴' : action.priority === 'medium' ? '🟡' : '🟢';
  console.log(`  ${i + 1}. ${priorityIcon} ${action.action}`);
  console.log(`     理由: ${action.rationale}`);
});

console.log('\n📝 要素別の詳細評価:');
console.log('\n--- 業務要件 ---');
if (assessment.elements.businessRequirements) {
  printElementAssessment(assessment.elements.businessRequirements);
}

console.log('\n--- アクター ---');
assessment.elements.actors.forEach((actor, i) => {
  console.log(`\nアクター ${i + 1}: ${actor.elementId}`);
  printElementAssessment(actor);
});

console.log('\n--- ユースケース ---');
assessment.elements.useCases.forEach((uc, i) => {
  console.log(`\nユースケース ${i + 1}: ${uc.elementId}`);
  printElementAssessment(uc);
});

console.log('\n' + '='.repeat(60));
console.log('✅ 成熟度評価システムのテストが完了しました\n');

// ヘルパー関数
function getMaturityLevelName(level: MaturityLevel): string {
  const names: Record<MaturityLevel, string> = {
    [MaturityLevel.INITIAL]: 'INITIAL - 初期',
    [MaturityLevel.REPEATABLE]: 'REPEATABLE - 反復可能',
    [MaturityLevel.DEFINED]: 'DEFINED - 定義済み',
    [MaturityLevel.MANAGED]: 'MANAGED - 管理済み',
    [MaturityLevel.OPTIMIZED]: 'OPTIMIZED - 最適化済み',
  };
  return names[level];
}

function getDimensionName(dimension: string): string {
  const names: Record<string, string> = {
    structure: '構造の完全性',
    detail: '詳細度',
    traceability: 'トレーサビリティ',
    testability: 'テスト容易性',
    maintainability: '保守性',
  };
  return names[dimension] || dimension;
}

function printElementAssessment(assessment: any) {
  const percentage = (assessment.overallCompletionRate * 100).toFixed(1);
  console.log(`  成熟度レベル: レベル${assessment.overallLevel} (完成度: ${percentage}%)`);
  console.log(`  満たした基準: ${assessment.satisfiedCriteria.length}/${assessment.satisfiedCriteria.length + assessment.unsatisfiedCriteria.length}`);
  console.log(`  推定工数: ${assessment.estimatedEffort}`);
  
  if (assessment.nextSteps.length > 0) {
    console.log(`  次のステップ:`);
    assessment.nextSteps.slice(0, 3).forEach((step: any, i: number) => {
      console.log(`    ${i + 1}. ${step.action}`);
    });
  }
}
