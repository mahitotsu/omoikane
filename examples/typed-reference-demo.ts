/**
 * 型安全なアクター参照のデモンストレーション
 * IDE補完機能付きの実装例
 */

import {
    defineActor,
    typedActorRef,
    type KnownActorId,
    type TypedActorRef,
    type TypedUseCase
} from '../src/types/typed-references';

console.log('🎯 型安全なアクター参照 - IDE補完デモ');
console.log('='.repeat(50));

// 1. defineActor を使った型安全なアクター定義
console.log('\n📝 型安全なアクター定義:');

const customerDef = defineActor('customer', {
  type: 'actor',
  owner: 'business-analyst',
  name: '顧客',
  description: 'ECサイトで商品を購入する一般ユーザー',
  role: 'primary',
  responsibilities: [
    '商品の閲覧・検索',
    'アカウント登録・管理'
  ]
});

console.log(`✅ ${customerDef.actor.name} アクターを定義`);
console.log(`   参照: ${customerDef.ref.actorId} (型安全)`);

// 2. typedActorRef を使った型安全な参照作成
console.log('\n🔗 型安全な参照作成 (IDE補完有効):');

// ✅ 以下は正しいアクターIDで、IDE補完が効く
const customerRef = typedActorRef('customer');
const adminRef = typedActorRef('admin');
const emailServiceRef = typedActorRef('email-service');

console.log(`✅ 顧客参照: ${customerRef.actorId}`);
console.log(`✅ 管理者参照: ${adminRef.actorId}`);
console.log(`✅ メール参照: ${emailServiceRef.actorId}`);

// ❌ 以下は存在しないアクターIDでコンパイルエラーになる
// const invalidRef = typedActorRef('non-existent-actor'); // TypeScriptエラー

// 3. 型安全なユースケース定義での使用
console.log('\n📋 型安全なユースケース定義:');

const typedUserRegistration: TypedUseCase = {
  id: 'user-registration',
  type: 'usecase',
  owner: 'business-analyst',
  name: 'ユーザー登録',
  description: '新規顧客がECサイトにアカウントを作成する',
  actors: {
    primary: typedActorRef('customer'),        // ← IDE補完が効く
    secondary: [typedActorRef('email-service')] // ← IDE補完が効く
  },
  preconditions: ['顧客がサイトにアクセス済み'],
  postconditions: ['アカウントが作成済み'],
  mainFlow: [
    {
      stepNumber: 1,
      actor: typedActorRef('customer'),  // ← IDE補完が効く
      action: '登録画面にアクセス',
      expectedResult: 'フォームが表示される'
    },
    {
      stepNumber: 2,
      actor: typedActorRef('email-service'), // ← IDE補完が効く
      action: '確認メールを送信',
      expectedResult: 'メールが配信される'
    }
  ],
  businessValue: '新規顧客獲得',
  priority: 'high'
};

console.log(`✅ ${typedUserRegistration.name} ユースケースを定義`);
console.log(`   主要アクター: ${typedUserRegistration.actors.primary.actorId}`);
console.log(`   関連アクター: ${typedUserRegistration.actors.secondary?.map(a => a.actorId).join(', ')}`);

// 4. 関数での型安全な利用
console.log('\n🔧 関数での型安全な利用:');

function createStep<T extends KnownActorId>(
  stepNumber: number,
  actorId: T,  // ← IDE補完が効く型パラメータ
  action: string,
  expectedResult: string
) {
  return {
    stepNumber,
    actor: typedActorRef(actorId), // ← 型安全
    action,
    expectedResult
  };
}

// 使用例 - IDE補完が効く
const step1 = createStep(1, 'customer', 'ログインする', 'ダッシュボード表示');
const step2 = createStep(2, 'admin', '商品を登録', '商品がリストに追加');

console.log(`✅ ステップ1: ${step1.actor.actorId} - ${step1.action}`);
console.log(`✅ ステップ2: ${step2.actor.actorId} - ${step2.action}`);

// 5. バリデーション関数
console.log('\n✅ 型安全性の確認:');

function validateActorRef(ref: TypedActorRef): boolean {
  const validActors: KnownActorId[] = [
    'customer', 'admin', 'email-service', 
    'inventory-system', 'payment-service', 'shipping-service'
  ];
  
  return validActors.includes(ref.actorId as KnownActorId);
}

console.log(`   顧客参照の妥当性: ${validateActorRef(customerRef)}`);
console.log(`   管理者参照の妥当性: ${validateActorRef(adminRef)}`);

console.log('\n🎉 型安全な参照システムのデモが完了しました！');
console.log('💡 IDE補完により、アクターIDの入力ミスを防止できます');
console.log('🔒 TypeScriptコンパイル時に存在しないアクターを検出できます');