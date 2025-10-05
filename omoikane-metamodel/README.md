# Omoikane Metamodel

TypeScript ITDelivery Framework - ユースケース・要件定義のためのメタモデル

## 概要

Omoikane Metamodel は、ITデリバリプロジェクトにおけるユースケース・要件定義を型安全に記述するための TypeScript フレームワークです。

**新しいレイヤードアーキテクチャ** (v2.0+):
- **Foundation**: 基礎層（Ref<T>, DocumentBase, primitives）
- **Business**: 業務層（BusinessRequirementDefinition, BusinessRule）
- **Functional**: 機能層（Actor, UseCase）
- **Cross-Cutting**: 横断層（TraceabilityMatrix）

## 主な機能

- **型安全なドキュメント定義**: レイヤード型システムによる明確な構造
- **統一参照システム**: `Ref<T>` ジェネリック型による型安全な参照
- **Git ベース管理**: type/owner フィールド不要、Git による変更履歴管理
- **段階的詳細化対応**: シンプルから複雑まで段階的に詳細化可能
- **品質評価フレームワーク**: 設計品質の自動評価とAI Agent向け改善提案

## インストール

```bash
bun install
```

## 使用方法（新型システム）

```typescript
import { Functional, Business, Foundation } from 'omoikane-metamodel';
import type { Ref } from 'omoikane-metamodel';

// アクター定義（新型）
const customer: Functional.Actor = {
  id: 'customer',
  name: '顧客',
  description: 'ECサイトで商品を購入する一般ユーザー',
  role: 'primary',
  responsibilities: ['商品の閲覧・検索', 'アカウント登録・管理'],
};

// ユースケース定義（新型）
const userRegistration: Functional.UseCase = {
  id: 'user-registration',
  name: 'ユーザー登録',
  description: '新規ユーザーがアカウントを作成する',
  actors: {
    primary: Foundation.createRef<Functional.Actor>('customer'),
  },
  preconditions: ['顧客がECサイトにアクセスしている'],
  postconditions: ['新しいユーザーアカウントが作成されている'],
  mainFlow: [
    {
      stepId: 'access-registration',
      actor: Foundation.createRef<Functional.Actor>('customer'),
      action: '新規登録ページにアクセスする',
      expectedResult: '登録フォームが表示される',
    },
  ],
  priority: 'high',
};
```

## API

### 型定義（新型システム）

**Foundation 層**:
- `Ref<T>`: 統一参照型 `{id: string}`
- `DocumentBase`: 基本ドキュメント型（id, name, description）
- `TraceableDocument`: トレース可能ドキュメント（extends DocumentBase）

**Business 層**:
- `BusinessRequirementDefinition`: 業務要件定義
- `BusinessRule`: ビジネスルール
- `SecurityPolicy`: セキュリティポリシー

**Functional 層**:
- `Actor`: システムの利用者・関係者
- `UseCase`: ユースケース
- `UseCaseStep`: ユースケースのステップ
- `AlternativeFlow`: 代替フロー

### ユーティリティ

- `Foundation.createRef<T>(id)`: 型安全な参照作成
- `enrichStepsWithNumbers()`: stepIdから自動でstepNumberを生成
- `findStepByIdOrNumber()`: stepIdまたはstepNumberでステップを検索

### 品質評価フレームワーク

設計品質を自動評価し、AI Agent向けの改善提案を生成します。

```typescript
import { performQualityAssessment } from './src/quality/index.js';

const { assessment, recommendations } = performQualityAssessment(
  businessRequirements,
  actors,
  useCases
);

console.log(`品質スコア: ${assessment.overallScore.value}/100`);
console.log(`推奨アクション: ${recommendations.length}件`);
```

詳細は [品質評価フレームワーク](./src/quality/README.md) を参照してください。

## ライセンス

MIT
