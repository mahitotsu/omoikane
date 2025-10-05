#!/usr/bin/env bun

/**
 * コンテキスト対応評価システムのテスト
 */

import {
    DevelopmentStage,
    ProjectContext,
    ProjectCriticality,
    ProjectDomain,
    TeamSize,
    applyContext,
    generateContextSummary,
    inferContext,
} from '../src/quality/maturity/index.ts';

console.log('🔍 コンテキスト対応評価システムのテスト\n');
console.log('='.repeat(60));
console.log('');

// テストケース1: 金融ドメイン、本格開発、大規模チーム、ミッションクリティカル
console.log('📊 テストケース1: 金融システム（厳格）');
console.log('='.repeat(60));

const context1: ProjectContext = {
  projectName: '銀行決済システム',
  domain: ProjectDomain.FINANCE,
  stage: DevelopmentStage.ACTIVE_DEVELOPMENT,
  teamSize: TeamSize.LARGE,
  criticality: ProjectCriticality.MISSION_CRITICAL,
  tags: ['payment', 'banking', 'secure'],
};

const result1 = applyContext(context1);
console.log(generateContextSummary(context1, result1));

console.log('\n\n');

// テストケース2: Eコマース、MVP、小規模チーム、中重要度
console.log('📊 テストケース2: EコマースMVP（バランス型）');
console.log('='.repeat(60));

const context2: ProjectContext = {
  projectName: 'ECサイト試作',
  domain: ProjectDomain.ECOMMERCE,
  stage: DevelopmentStage.MVP,
  teamSize: TeamSize.SMALL,
  criticality: ProjectCriticality.MEDIUM,
  tags: ['shop', 'online'],
};

const result2 = applyContext(context2);
console.log(generateContextSummary(context2, result2));

console.log('\n\n');

// テストケース3: 実験的プロトタイプ、個人開発、低重要度
console.log('📊 テストケース3: 実験的プロトタイプ（緩和型）');
console.log('='.repeat(60));

const context3: ProjectContext = {
  projectName: 'アイデア検証PoC',
  domain: ProjectDomain.GENERAL,
  stage: DevelopmentStage.POC,
  teamSize: TeamSize.SOLO,
  criticality: ProjectCriticality.EXPERIMENTAL,
  tags: ['prototype', 'experiment'],
};

const result3 = applyContext(context3);
console.log(generateContextSummary(context3, result3));

console.log('\n\n');

// テストケース4: コンテキスト推論のテスト
console.log('📊 テストケース4: コンテキスト推論');
console.log('='.repeat(60));

const inferred1 = inferContext('hospital-management-system', ['medical', 'patient']);
console.log('プロジェクト名: hospital-management-system');
console.log('タグ: medical, patient');
console.log('推論されたコンテキスト:', inferred1);

console.log('');

const inferred2 = inferContext('ec-shop-mvp', ['cart', 'payment']);
console.log('プロジェクト名: ec-shop-mvp');
console.log('タグ: cart, payment');
console.log('推論されたコンテキスト:', inferred2);

console.log('');

const inferred3 = inferContext('data-analytics-poc', ['analytics', 'ml', 'prototype']);
console.log('プロジェクト名: data-analytics-poc');
console.log('タグ: analytics, ml, prototype');
console.log('推論されたコンテキスト:', inferred3);

console.log('\n\n');
console.log('='.repeat(60));
console.log('✅ コンテキスト対応評価システムのテストが完了しました');
