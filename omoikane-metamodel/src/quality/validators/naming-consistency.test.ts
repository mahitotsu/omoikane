/**
 * @fileoverview 命名規約一貫性評価のテスト
 *
 * **目的:**
 * 命名規約評価機能の動作確認と使用例の提示
 */

import type { Actor, BusinessRequirementDefinition, UseCase } from '../../types/index.js';
import {
    assessNamingConsistency,
    detectNamingStyle,
    toKebabCase,
} from './naming-consistency.js';

// ============================================================================
// テストデータ
// ============================================================================

const testActors: Actor[] = [
  {
    id: 'visitor', // kebab-case ✅
    name: '来店者',
    type: 'actor',
    role: 'primary',
    responsibilities: ['予約の登録'],
  },
  {
    id: 'storeStaff', // camelCase ❌
    name: '店舗スタッフ',
    type: 'actor',
    role: 'secondary',
    responsibilities: ['予約の管理'],
  },
  {
    id: 'system_admin', // snake_case ❌
    name: 'システム管理者',
    type: 'actor',
    role: 'secondary',
    responsibilities: ['システム管理'],
  },
];

const testUseCases: UseCase[] = [
  {
    id: 'reservation-booking', // kebab-case ✅
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
        stepId: 'access-site', // kebab-case ✅
        actor: { id: 'visitor' },
        action: '予約サイトにアクセス',
        expectedResult: 'フォームが表示される',
      },
      {
        stepId: 'input-info', // kebab-case ✅
        actor: { id: 'visitor' },
        action: '予約情報を入力',
        expectedResult: '入力内容が確認できる',
      },
    ],
    priority: 'high',
  },
  {
    id: 'reservationCancel', // camelCase ❌
    name: '予約取消',
    type: 'usecase',
    description: '来店者が予約を取り消す',
    actors: {
      primary: { id: 'visitor' },
    },
    preconditions: ['予約が存在する'],
    postconditions: ['予約が取り消されている'],
    mainFlow: [
      {
        stepId: '1', // 数字のみ ❌
        actor: { id: 'visitor' },
        action: '予約を検索',
        expectedResult: '予約が表示される',
      },
      {
        stepId: 'confirmCancel', // camelCase ❌（1つ目はnumeric、2つ目はcamelなので混在）
        actor: { id: 'visitor' },
        action: '取消を確認',
        expectedResult: '予約が取り消される',
      },
    ],
    priority: 'high',
  },
];

const testBusinessRequirements: BusinessRequirementDefinition = {
  id: 'reservation-business-requirements', // kebab-case ✅
  name: '来店予約管理システム',
  type: 'business-requirement',
  description: '予約システムの業務要件',
  title: '来店予約管理システム業務要件',
  summary: '小規模店舗向けの予約管理システム',
  businessGoals: [
    {
      id: 'goal-improve-efficiency',
      description: '業務効率化を実現する',
      notes: '予約管理の効率化',
    },
  ],
  scope: {
    inScope: [
      { id: 'scope-1', description: '予約管理機能' },
    ],
    outOfScope: [],
  },
  stakeholders: [
    { id: 'stakeholder-1', description: '店舗オーナー' },
  ],
};

// ============================================================================
// テスト実行
// ============================================================================

console.log('='.repeat(80));
console.log('命名規約一貫性評価テスト');
console.log('='.repeat(80));
console.log();

// 1. 命名スタイル検出テスト
console.log('【1. 命名スタイル検出テスト】');
console.log(`visitor → ${detectNamingStyle('visitor')} (expected: kebab-case)`);
console.log(`storeStaff → ${detectNamingStyle('storeStaff')} (expected: camel-case)`);
console.log(`system_admin → ${detectNamingStyle('system_admin')} (expected: snake_case)`);
console.log(`ReservationBooking → ${detectNamingStyle('ReservationBooking')} (expected: pascal-case)`);
console.log();

// 2. ケバブケース変換テスト
console.log('【2. ケバブケース変換テスト】');
console.log(`storeStaff → ${toKebabCase('storeStaff')} (expected: store-staff)`);
console.log(`system_admin → ${toKebabCase('system_admin')} (expected: system-admin)`);
console.log(`ReservationBooking → ${toKebabCase('ReservationBooking')} (expected: reservation-booking)`);
console.log();

// 3. 総合評価テスト
console.log('【3. 総合評価テスト】');
const result = assessNamingConsistency(
  testActors,
  testUseCases,
  [testBusinessRequirements]
);

console.log(`総合スコア: ${result.overallScore.toFixed(1)}/100`);
console.log();

console.log('【ID命名規則】');
console.log(`  スコア: ${result.idNaming.score.toFixed(1)}/100`);
console.log(`  ケバブケース: ${result.idNaming.kebabCase.length}個`);
console.log(`  キャメルケース: ${result.idNaming.camelCase.length}個`);
console.log(`  スネークケース: ${result.idNaming.snakeCase.length}個`);
if (result.idNaming.camelCase.length > 0) {
  console.log(`    - ${result.idNaming.camelCase.join(', ')}`);
}
if (result.idNaming.snakeCase.length > 0) {
  console.log(`    - ${result.idNaming.snakeCase.join(', ')}`);
}
console.log();

console.log('【stepId命名規則】');
console.log(`  スコア: ${result.stepIdNaming.score.toFixed(1)}/100`);
console.log(`  総ステップ数: ${result.stepIdNaming.totalSteps}`);
console.log(`  ケバブケース: ${result.stepIdNaming.kebabCase}個`);
console.log(`  キャメルケース: ${result.stepIdNaming.camelCase}個`);
console.log(`  数字のみ: ${result.stepIdNaming.numeric}個`);
console.log(`  混在ユースケース: ${result.stepIdNaming.inconsistentUseCases.length}個`);
for (const uc of result.stepIdNaming.inconsistentUseCases) {
  console.log(`    - ${uc.useCaseName}: ${uc.detectedStyles.join(', ')}`);
}
console.log();

console.log('【用語の統一性】');
console.log(`  スコア: ${result.terminology.score.toFixed(1)}/100`);
console.log(`  混在用語: ${result.terminology.mixedTerms.length}組`);
for (const mixed of result.terminology.mixedTerms) {
  console.log(
    `    - 「${mixed.term1}」(${mixed.occurrences1.length}箇所) vs 「${mixed.term2}」(${mixed.occurrences2.length}箇所)`
  );
}
console.log();

console.log('【推奨事項】');
console.log(`  総数: ${result.recommendations.length}件`);
for (const rec of result.recommendations) {
  console.log();
  console.log(`  [${rec.priority.toUpperCase()}] ${rec.message}`);
  console.log(`  対象: ${rec.affectedElements.slice(0, 3).join(', ')}${rec.affectedElements.length > 3 ? '...' : ''}`);
  console.log(`  推奨アクション:`);
  const lines = rec.suggestedAction.split('\n');
  for (const line of lines.slice(0, 3)) {
    console.log(`    ${line}`);
  }
  if (lines.length > 3) {
    console.log(`    ... (他 ${lines.length - 3} 行)`);
  }
}

console.log();
console.log('='.repeat(80));
console.log('テスト完了');
console.log('='.repeat(80));
