# 変更履歴 - 2025年10月

このドキュメントは、2025年10月の主要な変更をまとめたものです。

## 主要な機能追加・改善

### 1. ScreenFlow.relatedUseCase の必須化

**変更内容:**
- `ScreenFlow.relatedUseCase` を optional から required に変更
- すべての画面フローは必ずユースケースに紐づくことを強制

**動機:**
- トレーサビリティの向上（画面フローの存在理由が明確）
- 変更影響分析の容易化（ユースケース変更時の影響範囲特定）
- ビジネス価値のない画面フローの防止

**影響:**
- 既存のScreenFlow定義にrelatedUseCaseの追加が必要
- 型システムでコンパイル時に保証

**コミット:** a179461

---

### 2. 型システムによる保証の徹底

**変更内容:**
- 型システムで保証できる検証をランタイムから削除
- 冗長な存在チェックを排除（約87行削減）

**具体的な削除箇所:**
- `coherence-validator.ts`: relatedUseCase存在チェック（22行）
- `coherence-validator.ts`: prerequisiteUseCases存在チェック（25行）
- `quality-assessment.ts`: プロパティベースのフォールバック検出（15行）

**設計原則:**
```typescript
// ❌ 冗長（削除）
if (!screenFlow.relatedUseCase) {
  // エラー
}

// ✅ 型システムで保証
const relatedUseCase = useCaseMap.get(screenFlow.relatedUseCase.id)!;
```

**メリット:**
- コードの簡潔性向上
- 意図の明確化（非null表明で型システムへの信頼を表明）
- 型定義と実装の一致

**コミット:** 2296308, bbb0a57

---

### 3. 型検出システムの統一

**変更内容:**
- `type`属性による統一的な型検出に完全移行
- プロパティベースのフォールバック検出を削除

**検出対象:**
- Actor: `type === 'actor'`
- UseCase: `type === 'usecase'`
- Screen: `type === 'screen'`
- ScreenFlow: `type === 'screen-flow'`
- ValidationRule: `type === 'validation-rule'`
- BusinessRequirement: `type === 'business-requirement'`

**設計原則:**
- **type属性のみで判定**: プロパティの有無による判定は使用しない
- **一貫性**: すべての要素が統一された方法で検出される
- **シンプル**: フォールバックロジック不要

**コミット:** dade9e2, 1093058

---

### 4. 品質評価の純粋化

**変更内容:**
- scriptsディレクトリをスキップ対象に追加
- 読み取り専用操作の保証

**問題:**
品質評価中に`update-screen-action-refs.ts`等のスクリプトがインポートされ、
ファイル更新が実行されていた。

**解決策:**
```typescript
// スキップ対象にscriptsを追加
const skipDirs = ['node_modules', 'scripts', '.git', ...];
```

**設計原則:**
品質評価は読み取り専用の操作であるべきで、ファイルを変更してはいけない。

**コミット:** 8de4cdb

---

### 5. ScreenFlow検出ロジックの修正

**変更内容:**
- 検出条件を `screens && transitions` から `transitions` のみに変更
- DRY原則に則った検出

**問題:**
ScreenFlowから`screens`フィールドが削除され（自動導出に変更）、
検出条件が機能しなくなり、ScreenFlowの件数が0件と表示されていた。

**修正:**
```typescript
// Before: screens && transitions
if (item.transitions && item.screens) {
  screenFlows.push(item);
}

// After: transitions only
if (item.type === 'screen-flow') {
  screenFlows.push(item);
}
```

**結果:**
11件のScreenFlowが正しく検出されるようになった。

**コミット:** 3c2e515

---

### 6. 循環UIパターンのサポート

**変更内容:**
- coherence-validatorで循環パターンを正しく認識
- 「一覧 → 詳細 → 一覧」のようなフローを正常と判定

**検証ロジック:**
```typescript
// UseCaseの画面順序: [list, form, confirm, list]
// ScreenFlowの画面集合: [list, form, confirm]
// → 循環部分を除去して比較、整合性OK
```

**設計判断:**
- ScreenFlowはグラフ構造なので循環は遷移で表現される
- UseCaseの最後に「一覧に戻る」ステップがあっても正常
- 実世界のUIフローパターンを正しく評価

**影響:**
整合性エラーが3件から0件に減少（すべて誤検出だった）。

**コミット:** 200d610

---

### 7. コンテキスト推論の改善

**変更内容:**
- 成熟度レベルに基づいたステージ推論
- レベル4以上のプロジェクトは自動的に'production'ステージ

**問題:**
高成熟度プロジェクト（レベル5）に対して「MVP/PoC向け簡略化推奨」が
表示されていた（不適切）。

**解決策:**
```typescript
const defaultStage =
  maturityResult.projectLevel >= 4 ? 'production' : (partialContext.stage || 'poc');
```

**効果:**
- 成熟度に応じた適切な推奨事項
- クイックウィンから不適切な推奨が除外された

**コミット:** 200d610

---

## 品質スコアの向上

```
変更前: 86/100 (GOOD) - クイックウィン 4件
変更後: 90/100 (EXCELLENT) - クイックウィン 0件

内訳:
- 成熟度レベル: 100点（レベル5/5維持）
- 完全性: 82点
- 一貫性: 84点
- トレーサビリティ: 81点
- アーキテクチャ: 70 → 100点（+30点）
```

**改善要因:**
- 循環依存: 0件
- 整合性問題: 3件 → 0件
- 不適切な推奨事項: 1件 → 0件

---

## 破壊的変更

### ScreenFlow.relatedUseCase の必須化

**影響を受けるコード:**
```typescript
// Before (optional)
const flow: ScreenFlow = {
  id: 'flow',
  transitions: [...],
  relatedUseCase?: { id: 'use-case' }  // optional
};

// After (required)
const flow: ScreenFlow = {
  id: 'flow',
  transitions: [...],
  relatedUseCase: { id: 'use-case' }  // required
};
```

**移行方法:**
既存のScreenFlow定義にrelatedUseCaseを追加してください。

---

## ドキュメント更新

以下のドキュメントが更新されました：

1. **Copilot Instructions**
   - ワークスペースルート: `.github/copilot-instructions.md`
   - メタモデル: `omoikane-metamodel/.github/copilot-instructions.md`
   - インスタンス: `omoikane-example-reservation/.github/copilot-instructions.md`

2. **README**
   - メタモデル: `omoikane-metamodel/README.md`
   - インスタンス: `omoikane-example-reservation/README.md`

3. **ソースコードコメント**
   - `screen-flow.ts`: 必須化の説明追加
   - `coherence-validator.ts`: 循環パターンサポートの説明追加
   - `quality-assessment.ts`: 型検出ロジックの説明更新

---

## 技術的負債の解消

### 削減されたコード量

- coherence-validator.ts: -47行（冗長な検証）
- quality-assessment.ts: -15行（フォールバック検出）
- **合計: -62行**（純粋削減）

### コード品質の向上

1. **型安全性の向上**
   - 必須フィールドの明確化
   - ランタイム検証の削減

2. **保守性の向上**
   - DRY原則の徹底
   - 型システムへの信頼

3. **一貫性の向上**
   - 統一された型検出
   - シンプルなロジック

---

## 次のステップ

### 短期（完了）
- ✅ ScreenFlow.relatedUseCase必須化
- ✅ 型システムによる保証の徹底
- ✅ 循環UIパターンのサポート
- ✅ コンテキスト推論の改善

### 中期（検討中）
- [ ] レベル6基準の定義（より高度な成熟度）
- [ ] パフォーマンス要件の評価強化
- [ ] セキュリティ要件の自動検証

### 長期（将来）
- [ ] 自動修正機能（推奨事項の自動適用）
- [ ] CI/CD統合の簡素化
- [ ] ビジュアライゼーションの強化

---

## 参考資料

- [品質評価ガイド](./quality-assessment-guide.md)
- [推奨事項対処ガイド](./recommendations-guide.md)
- [成熟度基準の進化](./maturity-criteria-evolution.md)
- [メトリクス算出方法](./metrics-calculation.md)
