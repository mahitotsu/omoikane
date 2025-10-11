# 命名規約・整合性評価機能の追加

**実装日**: 2025-10-11  
**バージョン**: v2.1

## 概要

プロジェクトの整合性、一貫性、保守性を向上させるため、以下の品質評価機能を追加しました：

1. **命名規約の一貫性評価** - ID、stepId、用語の統一性をチェック
2. **ScreenFlow整合性評価** - UseCaseとScreenFlowの整合性を検証

## 実装内容

### 1. 命名規約の一貫性評価

#### ファイル
- `src/quality/validators/naming-consistency.ts` - 評価ロジック
- `src/quality/validators/naming-consistency.test.ts` - テストコード

#### 機能

**評価項目**:
- ID命名規則（要素ID）
- stepId命名規則（ユースケースステップ）
- 用語の統一性（ドメイン用語の混在検出）

**検出パターン**:
- ケバブケース（推奨）: `reservation-booking`
- キャメルケース: `reservationBooking`
- スネークケース: `reservation_booking`
- パスカルケース: `ReservationBooking`
- 数字のみ（stepIdで非推奨）: `1`, `2`

**推奨事項生成**:
```typescript
{
  category: 'id' | 'step-id' | 'terminology',
  priority: 'high' | 'medium' | 'low',
  message: '具体的な問題の説明',
  affectedElements: ['影響を受ける要素ID'],
  suggestedAction: '推奨される修正方法'
}
```

#### API

```typescript
import { assessNamingConsistency } from 'omoikane-metamodel';

const result = assessNamingConsistency(
  actors,
  useCases,
  businessRequirements,
  screens,
  validationRules,
  screenFlows
);

console.log(`総合スコア: ${result.overallScore}/100`);
console.log(`ID命名規則スコア: ${result.idNaming.score}/100`);
console.log(`stepId命名規則スコア: ${result.stepIdNaming.score}/100`);
console.log(`用語統一性スコア: ${result.terminology.score}/100`);
console.log(`推奨事項: ${result.recommendations.length}件`);
```

---

### 2. ScreenFlow整合性評価

#### ファイル
- `src/quality/validators/flow-consistency.ts` - 評価ロジック
- `src/quality/validators/flow-consistency.test.ts` - テストコード

#### 機能

**評価項目**:
- 画面順序の整合性（循環パターンを考慮）
- アクションの整合性（Screen定義 vs ScreenFlow vs UseCase）
- 遷移トリガーの妥当性
- 遷移の完全性

**画面順序の整合性**:
- UseCaseで使用される画面とScreenFlowで定義された画面の比較
- 循環パターン（`A → B → C → A`）を正しく認識
- 不一致箇所の特定（UseCaseのみ/ScreenFlowのみに存在する画面）

**アクションの整合性**:
- Screen定義にアクションが存在するか
- ScreenFlowの遷移トリガーで参照されているアクションが定義されているか

**遷移トリガーの妥当性**:
- 遷移元画面とトリガーの画面IDが一致するか
- トリガーで参照されている画面が存在するか

**遷移の完全性**:
- 全ての画面から適切な遷移が定義されているか
- 終了画面以外に出力エッジがあるか

#### API

```typescript
import { assessFlowConsistency } from 'omoikane-metamodel';

const result = assessFlowConsistency(useCases, screenFlows, screens);

console.log(`総合スコア: ${result.overallScore}/100`);
console.log(`画面順序の整合性: ${result.screenOrderConsistency.score}/100`);
console.log(`アクションの整合性: ${result.actionConsistency.score}/100`);
console.log(`遷移トリガーの妥当性: ${result.transitionTriggerValidity.score}/100`);
console.log(`遷移の完全性: ${result.transitionCompleteness.score}/100`);
```

---

### 3. 統合コマンド

#### ファイル
- `scripts/assess-consistency.ts` - 統合評価スクリプト

#### 使用方法

```bash
# 基本実行（現在のディレクトリを評価）
bun run assess-consistency

# 特定のプロジェクトを評価
bun run assess-consistency ../omoikane-example-reservation
```

#### 出力例

```
================================================================================
命名規約・整合性評価レポート
================================================================================

プロジェクト: ../omoikane-example-reservation

データを読み込み中...
  アクター: 4個
  ユースケース: 12個
  業務要件: 1個
  画面: 25個
  画面フロー: 12個

================================================================================
1. 命名規約の一貫性評価
================================================================================

📊 総合スコア: 95.5/100

【ID命名規則】
  スコア: 100.0/100
  ケバブケース: 53個
  キャメルケース: 0個
  スネークケース: 0個
  パスカルケース: 0個

【stepId命名規則】
  スコア: 100.0/100
  総ステップ数: 89
  ケバブケース: 89個
  キャメルケース: 0個
  数字のみ: 0個
  混在ユースケース: 0個

【用語の統一性】
  スコア: 85.0/100
  混在用語: 1組

✅ 推奨事項なし - 命名規約は適切に統一されています

================================================================================
2. ScreenFlow整合性評価
================================================================================

📊 総合スコア: 100.0/100

【画面順序の整合性】
  スコア: 100.0/100
  一致: 12件
  不一致: 0件

【アクションの整合性】
  スコア: 100.0/100
  一致: 45件
  不一致: 0件

【遷移トリガーの妥当性】
  スコア: 100.0/100
  有効: 45件
  無効: 0件

【遷移の完全性】
  スコア: 100.0/100
  完全: 12件
  不完全: 0件

✅ 推奨事項なし - ScreenFlowの整合性は良好です

================================================================================
まとめ
================================================================================

✅ 優秀: 命名規約は非常に統一されています

================================================================================
```

---

## エクスポート構成

### `src/quality/validators/index.ts`

```typescript
// 命名規約の一貫性
export {
  assessNamingConsistency,
  detectNamingStyle,
  toKebabCase,
} from './naming-consistency.js';

export type {
  NamingConsistencyAssessment,
  IdNamingAssessment,
  StepIdNamingAssessment,
  TerminologyConsistency,
} from './naming-consistency.js';

// ScreenFlow整合性
export {
  assessFlowConsistency,
  assessScreenOrderConsistency,
  assessActionConsistency,
  assessTransitionTriggerValidity,
  assessTransitionCompleteness,
} from './flow-consistency.js';

export type {
  FlowConsistencyAssessment,
  ScreenOrderComparison,
  ActionConsistency,
  TransitionTriggerValidity,
  TransitionCompleteness,
} from './flow-consistency.js';
```

### `src/quality/index.ts`

validatorsモジュールを統合エクスポート：

```typescript
// バリデーターエクスポート
export * from './validators/index.js';
```

### `src/types/index.ts`

`ScreenActionRef`を追加エクスポート：

```typescript
export type {
  // ... 既存のエクスポート
  ScreenActionRef,
  // ...
} from './ui/index.js';
```

---

## テスト

### 命名規約評価のテスト

```bash
bun run src/quality/validators/naming-consistency.test.ts
```

**テストケース**:
- ケバブケース、キャメルケース、スネークケースの混在
- stepIdの数字のみパターン
- ユースケース内でのstepIdスタイル混在
- 用語の混在（「予約」vs「booking」）

### ScreenFlow整合性評価のテスト

```bash
bun run src/quality/validators/flow-consistency.test.ts
```

**テストケース**:
- 正常なフロー（一致）
- 画面順序の不一致
- 存在しないアクション参照
- 遷移トリガーの画面不一致
- 存在しない画面の参照

---

## 設計判断

### 1. なぜ命名規約評価が必要か

**問題**:
- 手動でIDを記述する際、ケバブケース（推奨）とキャメルケースが混在しやすい
- stepIdで数字のみ（`'1'`, `'2'`）を使用すると保守性が低下
- 用語の混在（「予約」vs「booking」）により可読性が低下

**解決**:
- 自動検出により命名規約の不統一を早期発見
- 具体的な修正案を提示（`storeStaff` → `store-staff`）
- プロジェクト全体の一貫性を維持

### 2. なぜScreenFlow整合性評価が必要か

**問題**:
- UseCaseで定義した画面フローとScreenFlowで定義した遷移が不一致になる可能性
- アクション定義漏れ（ScreenFlowで参照しているがScreen定義に存在しない）
- 遷移トリガーの画面IDミス（遷移元画面と異なる画面のアクションを参照）

**解決**:
- UseCaseとScreenFlowの整合性を自動検証
- 循環パターン（`A → B → A`）を正しく認識
- アクション定義漏れや参照ミスを検出

### 3. 型システムとの関係

**型システムで保証できること**:
- `ScreenActionRef`の構造（`screenId`と`actionId`を持つ）
- `ScreenFlow.relatedUseCase`が必須であること

**型システムで保証できないこと**:
- 命名規約の統一性（ケバブケース vs キャメルケース）
- 画面フローの整合性（UseCaseとScreenFlowの画面リストの一致）
- アクション定義の存在（参照先が実際に定義されているか）

本機能は、**型システムで保証できない品質観点を補完**します。

---

## 今後の拡張可能性

### 短期
- [ ] ファイル名命名規則の評価（ファイルパス情報の追加が必要）
- [ ] より高度な用語統一性評価（NLP技術の活用）
- [ ] 推奨事項の優先度付けの改善

### 中期
- [ ] IDEプラグインによるリアルタイム検証
- [ ] 自動修正機能（リファクタリング）
- [ ] CI/CDパイプラインとの統合

### 長期
- [ ] 機械学習による命名パターンの学習
- [ ] プロジェクト間の命名規約比較
- [ ] 業界標準命名規約との比較

---

## 関連ドキュメント

- [品質評価ガイド](./quality-assessment-guide.md)
- [推奨事項対処ガイド](./recommendations-guide.md)
- [メタモデルREADME](../README.md)
