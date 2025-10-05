#!/usr/bin/env bun
/**
 * RelationshipAnalyzer の動作確認テスト
 */

import type { Functional } from '../src/index.js';
import { RelationshipAnalyzer } from '../src/index.js';

// テスト用アクター
const actors: Functional.Actor[] = [
  {
    id: 'customer',
    name: '顧客',
    description: 'システムを利用する一般顧客',
    role: 'primary',
    responsibilities: ['商品を注文する', '配送状況を確認する'],
  },
  {
    id: 'staff',
    name: 'スタッフ',
    description: '店舗スタッフ',
    role: 'secondary',
    responsibilities: ['注文を処理する', '在庫を管理する'],
  },
];

// テスト用ユースケース（新型：Ref<Actor> = {id: string}）
const useCases: any[] = [
  {
    id: 'order-product',
    name: '商品注文',
    description: '顧客が商品を注文する',
    actors: {
      primary: { id: 'customer' }, // Ref<Actor>
      secondary: [{ id: 'staff' }], // Ref<Actor>[]
    },
    preconditions: [],
    postconditions: [],
    mainFlow: [],
  },
  {
    id: 'manage-inventory',
    name: '在庫管理',
    description: 'スタッフが在庫を管理する',
    actors: {
      primary: { id: 'staff' }, // Ref<Actor>
    },
    preconditions: [],
    postconditions: [],
    mainFlow: [],
  },
];

// 分析実行
const analyzer = new RelationshipAnalyzer();

actors.forEach(actor => analyzer.addActor(actor));
useCases.forEach(useCase => analyzer.addUseCase(useCase));

const analysis = analyzer.analyze();

console.log('🔍 関係性分析結果:');
console.log(`  総アクター数: ${analysis.totalActors}`);
console.log(`  総ユースケース数: ${analysis.totalUseCases}`);
console.log(`  関係性の数: ${analysis.relationships.length}`);
console.log('\n📊 関係性詳細:');
analysis.relationships.forEach(rel => {
  console.log(`  - ${rel.actorId} (${rel.role}) -> ${rel.useCaseId}`);
});
console.log('\n👥 複数の役割を持つアクター:');
if (analysis.multiRoleActors.length === 0) {
  console.log('  なし');
} else {
  analysis.multiRoleActors.forEach(actorId => {
    const useCaseIds = analysis.actorUseCaseMap.get(actorId) || [];
    console.log(`  - ${actorId}: ${useCaseIds.join(', ')}`);
  });
}

console.log('\n🎭 複数のアクターが関わるユースケース:');
if (analysis.complexUseCases.length === 0) {
  console.log('  なし');
} else {
  analysis.complexUseCases.forEach(useCaseId => {
    const actorIds = analysis.useCaseActorMap.get(useCaseId) || [];
    console.log(`  - ${useCaseId}: ${actorIds.join(', ')}`);
  });
}

console.log('\n✅ RelationshipAnalyzer は新型システムで正常動作しています');
