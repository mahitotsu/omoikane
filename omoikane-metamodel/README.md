# Omoikane Metamodel

TypeScript ITDelivery Framework - ユースケース・要件定義のためのメタモデル

## 概要

Omoikane
Metamodelは、ITデリバリプロジェクトにおけるユースケース・要件定義を型安全に記述するためのTypeScriptフレームワークです。

## 主な機能

- **型安全なユースケース定義**: UseCase, Actor, UseCaseStepの型定義
- **stepId自動管理**: stepNumberの手動管理を廃止し、配列インデックスから自動生成
- **型安全な参照システム**: ActorRefとUseCaseRefによる安全な参照
- **段階的詳細化対応**: シンプルから複雑まで段階的に詳細化可能

## インストール

```bash
bun install
```

## 使用方法

```typescript
import { UseCase, Actor, UseCaseStep } from 'omoikane-metamodel';

// アクター定義
const customer: Actor = {
  id: 'customer',
  type: 'actor',
  owner: 'business-analyst',
  name: '顧客',
  description: 'ECサイトで商品を購入する一般ユーザー',
  role: 'primary',
  responsibilities: ['商品の閲覧・検索', 'アカウント登録・管理'],
};

// ユースケース定義（stepId自動管理）
const userRegistration: UseCase = {
  id: 'user-registration',
  type: 'usecase',
  owner: 'business-analyst',
  name: 'ユーザー登録',
  description: '新規ユーザーがアカウントを作成する',
  actors: {
    primary: 'customer',
  },
  preconditions: ['顧客がECサイトにアクセスしている'],
  postconditions: ['新しいユーザーアカウントが作成されている'],
  mainFlow: [
    {
      stepId: 'access-registration',
      actor: 'customer',
      action: '新規登録ページにアクセスする',
      expectedResult: '登録フォームが表示される',
    },
  ],
  businessValue: '新規顧客の獲得',
  priority: 'high',
};
```

## API

### 型定義

- `Actor`: システムの利用者・関係者
- `UseCase`: ユースケース（stepId自動管理対応）
- `UseCaseStep`: ユースケースのステップ
- `AlternativeFlow`: 代替フロー（returnToStepId対応）

### ユーティリティ

- `enrichStepsWithNumbers()`: stepIdから自動でstepNumberを生成
- `findStepByIdOrNumber()`: stepIdまたはstepNumberでステップを検索

## ライセンス

MIT
