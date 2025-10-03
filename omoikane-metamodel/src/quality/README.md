# 品質評価フレームワーク

メタモデルの設計品質を自動評価し、AI Agent向けの改善提案を生成するフレームワークです。

## 概要

このフレームワークは、業務要件定義、アクター、ユースケースの設計品質を4つの観点から評価します：

1. **完全性 (Completeness)** - 必要な要素が全て定義されているか
2. **一貫性 (Consistency)** - 要素間の参照関係が正しく保たれているか
3. **妥当性 (Validity)** - 各要素の内容が適切に記述されているか
4. **追跡可能性 (Traceability)** - 要素間の関連性が適切に管理されているか

## 主要機能

### 1. 品質評価 (`assessor.ts`)

メタモデル要素を総合的に評価し、0-100のスコアを算出します。

```typescript
import { assessQuality } from './src/quality/assessor.js';

const result = assessQuality(businessRequirements, actors, useCases);
console.log(`総合スコア: ${result.overallScore.value}/100`);
```

### 2. カバレッジ分析 (`coverage-analyzer.ts`)

業務要件とユースケースの対応関係を分析し、未使用の要素や孤立した要素を検出します。

```typescript
import { analyzeCoverage } from './src/quality/coverage-analyzer.js';

const coverage = analyzeCoverage(businessRequirements, actors, useCases);
console.log(`ビジネスゴールカバレッジ: ${coverage.businessGoals.coverage * 100}%`);
```

### 3. 推奨アクション生成 (`recommendation-engine.ts`)

品質問題に対する具体的な改善提案を生成します。

```typescript
import { generateRecommendations } from './src/quality/recommendation-engine.js';

const recommendations = generateRecommendations(qualityResult, businessRequirements, actors, useCases);
recommendations.forEach(rec => {
  console.log(`[${rec.priority}] ${rec.action}`);
});
```

### 4. 統合API (`index.ts`)

品質評価と推奨アクション生成を一括実行します。

```typescript
import { performQualityAssessment } from './src/quality/index.js';

const { assessment, recommendations } = performQualityAssessment(
  businessRequirements,
  actors,
  useCases
);
```

## 評価項目

### 完全性チェック

- ビジネスゴールの存在
- スコープ定義の存在
- ステークホルダーの定義
- アクターの存在
- ユースケースの存在
- 各要素の必須フィールドの記述

### 一貫性チェック

- ID の重複検出
- 参照整合性の検証
- 存在しない要素への参照検出

### 妥当性チェック

- 説明の充実度
- ユースケースの適切な複雑さ
- ステップ数の妥当性

### 追跡可能性チェック

- 業務要件カバレッジの分析
- 孤立要素の検出
- 未使用要素の特定

## 使用例

### デモ実行

```bash
cd /home/akring/omoikane/omoikane-metamodel
bun run demo/quality-assessment-demo.ts
```

### 実際のプロジェクトでの使用

```typescript
import { performQualityAssessment } from './src/quality/index.js';
import { businessRequirements } from './src/requirements/business-requirements.js';
import { actors } from './src/actors/index.js';
import { useCases } from './src/use-cases/index.js';

// 品質評価実行
const { assessment, recommendations } = performQualityAssessment(
  businessRequirements,
  actors,
  useCases
);

// 結果の表示
console.log('品質スコア:', assessment.overallScore.value);
console.log('発見された問題:', assessment.issues.length);
console.log('推奨アクション:', recommendations.length);

// 問題の詳細
assessment.issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.description}`);
  console.log(`対応: ${issue.suggestion}`);
});

// 推奨アクション
recommendations.forEach(rec => {
  console.log(`${rec.priority}: ${rec.action}`);
  console.log(`理由: ${rec.rationale}`);
});
```

## 型定義

主要な型定義は `types.ts` に含まれています：

- `QualityAssessmentResult` - 品質評価の全体結果
- `QualityScore` - 個別品質スコア
- `QualityIssue` - 発見された品質問題
- `Recommendation` - AI Agent向け推奨アクション
- `CoverageReport` - カバレッジ分析結果

## AI Agent との連携

このフレームワークは AI Agent が次に実行すべきアクションを決定するための情報を提供します：

1. **優先度付きアクション**: 重要度に応じたアクションリスト
2. **具体的な提案**: テンプレートを含む実装指針
3. **影響範囲の明示**: 変更が影響する要素の特定
4. **理由の説明**: なぜそのアクションが必要かの説明

## 設計思想

- **段階的改善**: 完璧でなくても段階的に品質を向上させる
- **実用性重視**: 実際のプロジェクトで使える実用的な評価
- **拡張性**: 新しい評価項目や推奨アクションを簡単に追加可能
- **説明可能性**: すべての評価結果に理由と対応策を提供

## 今後の拡張

- 品質評価ルールのカスタマイズ機能
- 履歴分析による品質傾向の追跡
- より詳細なテンプレート生成
- 外部ツールとの連携機能