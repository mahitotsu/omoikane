# Migration Guide: Legacy → New Type System

## 概要

Omoikane Metamodel v2.0 では、レイヤードアーキテクチャと統一参照型 `Ref<T>` を導入しました。
このドキュメントでは、旧型システムから新型システムへの移行方法を説明します。

## 主な変更点

### 1. レイヤー構造の導入

**旧型（v1.x）**: フラットな型定義
```typescript
import { Actor, UseCase, BusinessRequirementDefinition } from 'omoikane-metamodel';
```

**新型（v2.0+）**: レイヤード名前空間
```typescript
import { Functional, Business, Foundation } from 'omoikane-metamodel';

const actor: Functional.Actor = { ... };
const useCase: Functional.UseCase = { ... };
const requirement: Business.BusinessRequirementDefinition = { ... };
```

### 2. type/owner フィールドの削除

**旧型**: ドキュメント識別に `type` と `owner` を使用
```typescript
const actor: Actor = {
  id: 'customer',
  type: 'actor',           // ❌ 削除
  owner: 'business-team',  // ❌ 削除
  name: '顧客',
  // ...
};
```

**新型**: TypeScript の型システムと Git で管理
```typescript
const actor: Functional.Actor = {
  id: 'customer',
  name: '顧客',
  description: '...',
  role: 'primary',
  responsibilities: ['...'],
  // type, owner フィールドは不要
};
```

### 3. 統一参照型 Ref<T>

**旧型**: 個別の参照型（ActorRef, UseCaseRef など 15+ 種類）
```typescript
interface ActorRef {
  actorId: string;
  type: 'actor-ref';
}

const ref: ActorRef = { actorId: 'customer', type: 'actor-ref' };
```

**新型**: ジェネリック型 `Ref<T>`
```typescript
import { Foundation } from 'omoikane-metamodel';
import type { Ref } from 'omoikane-metamodel';

const ref: Ref<Functional.Actor> = Foundation.createRef('customer');
// または
const ref = Foundation.createRef<Functional.Actor>('customer');
```

### 4. ユースケースのアクター参照

**旧型**: 文字列または ActorRef
```typescript
const useCase: UseCase = {
  // ...
  actors: {
    primary: 'customer',  // または { actorId: 'customer', type: 'actor-ref' }
    secondary: ['staff'],
  },
};
```

**新型**: Ref<Actor>
```typescript
const useCase: Functional.UseCase = {
  // ...
  actors: {
    primary: Foundation.createRef<Functional.Actor>('customer'),
    secondary: [Foundation.createRef<Functional.Actor>('staff')],
  },
};
```

## ステップバイステップ移行

### Step 1: インポートの更新

```typescript
// Before
import { Actor, UseCase, BusinessRequirementDefinition } from 'omoikane-metamodel';

// After
import { Functional, Business, Foundation } from 'omoikane-metamodel';
import type { Ref } from 'omoikane-metamodel';
```

### Step 2: 型注釈の更新

```typescript
// Before
const actor: Actor = { ... };
const useCase: UseCase = { ... };

// After
const actor: Functional.Actor = { ... };
const useCase: Functional.UseCase = { ... };
```

### Step 3: type/owner フィールドの削除

```typescript
// Before
const actor: Actor = {
  id: 'customer',
  type: 'actor',
  owner: 'business-team',
  name: '顧客',
  // ...
};

// After
const actor: Functional.Actor = {
  id: 'customer',
  name: '顧客',
  // type, owner を削除
  // ...
};
```

### Step 4: 参照の更新

```typescript
// Before
const primaryActor = 'customer';  // 文字列
// または
const primaryActor = { actorId: 'customer', type: 'actor-ref' };

// After
const primaryActor = Foundation.createRef<Functional.Actor>('customer');
```

### Step 5: BusinessRequirementDefinition の更新

```typescript
// Before
const requirement: BusinessRequirementDefinition = {
  id: 'req-001',
  type: 'business-requirement',
  owner: 'product-team',
  title: '...',
  // ...
};

// After
const requirement: Business.BusinessRequirementDefinition = {
  id: 'req-001',
  name: '...',  // title → name
  // type, owner を削除
  // summary, businessGoals, scope など他のフィールドは同じ
};
```

## 型安全な参照ヘルパーの作成

プロジェクト固有の型安全参照ヘルパーを作成すると便利です：

```typescript
// typed-references.ts
import { Foundation, Functional } from 'omoikane-metamodel';
import type { Ref } from 'omoikane-metamodel';

// アクターID の Union 型
export type KnownActorId = 'customer' | 'staff' | 'admin';

// 型安全なアクター参照関数
export function actorRef(id: KnownActorId): Ref<Functional.Actor> {
  return Foundation.createRef<Functional.Actor>(id);
}

// 使用例
const primary = actorRef('customer');  // ✅ 型安全
const invalid = actorRef('unknown');   // ❌ 型エラー
```

## 後方互換性

v2.0 では、旧型システムも `@deprecated` マークとともに維持されています：

```typescript
// これらは引き続き動作しますが、非推奨です
import { Actor, UseCase } from 'omoikane-metamodel';  // ⚠️ @deprecated

// 新しいコードでは名前空間を使用してください
import { Functional } from 'omoikane-metamodel';  // ✅ 推奨
```

## 品質評価ツールの互換性

品質評価スクリプトは新旧両方の型に対応しています：

```bash
# 旧型・新型どちらでも動作します
bun ../omoikane-metamodel/scripts/quality-assessment.ts .
```

構造ベースの検出により、`type` フィールドなしでもドキュメントを識別できます。

## トラブルシューティング

### 問題: 型エラー "Property 'type' is missing"

**原因**: 旧型の型注釈を使用している

**解決策**: 型注釈を新型に更新
```typescript
// Before
const actor: Actor = { id: 'customer', name: '...' };  // ❌ type が必要

// After
const actor: Functional.Actor = { id: 'customer', name: '...' };  // ✅
```

### 問題: 参照が正しく解決されない

**原因**: 文字列参照と Ref<T> の混在

**解決策**: すべての参照を Ref<T> に統一
```typescript
// Before
actors: { primary: 'customer' }  // ❌

// After
actors: { primary: Foundation.createRef<Functional.Actor>('customer') }  // ✅
```

## さらなる情報

- [API リファレンス](./README.md#api)
- [サンプルプロジェクト](../omoikane-example-reservation/)
- [型定義ソース](./src/types/)

## サポート

移行に関する質問は Issue を作成してください。
