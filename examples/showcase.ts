/**
 * Omoikane TypeScript ITDelivery Framework - デモンストレーション
 * ユースケース定義の実際の使用例を示すサンプル
 */

import { customer, emailService, userRegistration, LIBRARY_INFO } from '../index';

console.log(`🎯 ${LIBRARY_INFO.name} - ${LIBRARY_INFO.description}`);
console.log('='.repeat(50));
console.log(`📍 出発点: ${LIBRARY_INFO.startingPoint}\n`);

// ユースケース情報の表示
console.log('📋 ユースケース:', userRegistration.name);
console.log('📝 説明:', userRegistration.description);
console.log('⭐ 優先度:', userRegistration.priority);
console.log('💼 ビジネス価値:', userRegistration.businessValue);
console.log();

// アクター情報の表示
console.log('👥 関係者:');
console.log(`  主要: ${customer.name} (${customer.description})`);
console.log(`  外部: ${emailService.name} (${emailService.description})`);
console.log();

// メインフローの表示
console.log('🔄 メインフロー:');
userRegistration.mainFlow.forEach(step => {
  const actorName = step.actor.actorId === 'customer' ? customer.name : emailService.name;
  console.log(`  ${step.stepNumber}. [${actorName}] ${step.action}`);
  console.log(`     → ${step.expectedResult}`);
});
console.log();

// 代替フローの表示
console.log('🔀 代替フロー:');
userRegistration.alternativeFlows?.forEach(flow => {
  console.log(`  ${flow.name}: ${flow.condition}`);
  flow.steps.forEach(step => {
    const actorName = step.actor.actorId === 'customer' ? customer.name : emailService.name;
    console.log(`    ${step.stepNumber}. [${actorName}] ${step.action}`);
  });
});

console.log('\n✅ TypeScript型チェック完了 - すべての要素が型安全に定義されています');
console.log('💡 次のステップ: 画面設計、API設計などの下流工程へ展開可能');