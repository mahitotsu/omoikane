# Omoikane Metamodel

TypeScript ITDelivery Framework - ユースケース・要件定義のためのメタモデル

## 概要

Omoikane Metamodel は、ITデリバリプロジェクトにおけるユースケース・要件定義を型安全に記述するための TypeScript フレームワークです。

**レイヤードアーキテクチャ**:
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

## 使用方法

```typescript
import { Functional, Business, Foundation } from 'omoikane-metamodel';
import type { Ref } from 'omoikane-metamodel';

// アクター定義
const customer: Functional.Actor = {
  id: 'customer',
  name: '顧客',
  description: 'ECサイトで商品を購入する一般ユーザー',
  role: 'primary',
  responsibilities: ['商品の閲覧・検索', 'アカウント登録・管理'],
};

// ユースケース定義
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

### 型定義

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

### 品質評価フレームワーク v2.0

プロジェクトの設計品質を多角的に評価し、実用的な改善提案を生成します。

#### コマンドライン使用

```bash
# 基本実行（現在のディレクトリを評価）
bun run quality-assessment

# 特定のプロジェクトを評価
bun run quality-assessment ./path/to/project

# レポートをエクスポート
bun run quality-assessment --export --markdown
bun run quality-assessment --export --json
bun run quality-assessment --export --html
```

#### プログラマティック使用

```typescript
import {
  assessProjectMaturity,
  inferContext,
  applyContext,
  buildDependencyGraph,
  analyzeGraph,
  AIRecommendationEngine,
  MetricsDashboard,
} from 'omoikane-metamodel';

// 1. 成熟度評価
const maturityResult = assessProjectMaturity(
  businessRequirements,
  actors,
  useCases
);

// 2. コンテキスト分析
const context = inferContext(projectDir, businessRequirements);
const contextRules = applyContext(context);

// 3. 依存関係分析
const graph = buildDependencyGraph(businessRequirements, actors, useCases);
const graphAnalysis = analyzeGraph(graph);

// 4. AI推奨生成
const engine = new AIRecommendationEngine();
const recommendations = engine.generateRecommendations({
  maturity: maturityResult,
  context,
  graph: graphAnalysis,
});

// 5. ダッシュボード
const dashboard = new MetricsDashboard();
const snapshot = dashboard.createSnapshot({
  maturity: maturityResult,
  graph: graphAnalysis,
  recommendations,
  context,
});
const healthScore = dashboard.calculateHealthScore(snapshot);

console.log(`総合健全性スコア: ${healthScore.overall}/100`);
console.log(`成熟度レベル: ${maturityResult.projectLevel}/5`);
console.log(`推奨事項: ${recommendations.recommendations.length}件`);
```

#### 評価内容

- **成熟度評価**: 5レベル × 5次元の詳細評価
  - 構造（Structure）: 基本構造の定義
  - 詳細（Detail）: 説明の詳細度
  - トレーサビリティ（Traceability）: 要素間の追跡可能性
  - テスト可能性（Testability）: テスト関連情報
  - 保守性（Maintainability）: 変更管理情報

- **コンテキスト対応**: プロジェクトの特性に応じた評価
  - ドメイン（金融、医療、EC等）
  - 開発段階（PoC、MVP、本番等）
  - チーム規模（個人、小規模、大規模）
  - 重要度（実験的、通常、ミッションクリティカル）

- **依存関係グラフ**: 要素間の関係を可視化・分析
  - 循環依存の検出
  - 孤立ノードの特定
  - クリティカルパスの抽出

- **AI推奨**: 構造化された改善提案
  - 優先度別推奨（Critical, High, Medium, Low）
  - クイックウィン（すぐに実施可能な改善）
  - 長期戦略（アーキテクチャレベルの改善）

- **メトリクスダッシュボード**: 健全性スコアとトレンド
  - 5カテゴリ健全性スコア（0-100点）:
    - **maturity**: プロジェクトの成熟度レベル（レベル1-5を100点換算）
    - **completeness**: 全体の完成度（各要素の基準達成率の平均）
    - **consistency**: 一貫性（ディメンション間のばらつきの少なさ）
    - **traceability**: トレーサビリティ（要素間の追跡可能性）
    - **architecture**: アーキテクチャ（循環依存・孤立ノードの少なさ）
  - 時系列トレンド分析
  - アラート生成

詳細は [品質評価フレームワーク](./src/quality/README.md) を参照してください。

## 📚 ドキュメント

### 品質評価システム
- **[品質評価ガイド](./docs/quality-assessment-guide.md)** - レポートの読み方と基本概念
- **[推奨事項対処ガイド](./docs/recommendations-guide.md)** - 具体的な改善方法とコード例
- **[メトリクス算出方法](./docs/metrics-calculation.md)** - 各指標の詳細な計算方法

詳細は [docs/README.md](./docs/README.md) を参照してください。

## ライセンス

MIT

```
