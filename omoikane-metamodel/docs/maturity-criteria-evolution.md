# 成熟度基準の進化（Maturity Criteria Evolution）

## 概要

このドキュメントは、Omoikane品質評価フレームワークの成熟度基準の進化と設計判断を記録します。

## 2024年: ステップ数基準の削除

### 背景

**問題の発見:**
- `staff-authentication`ユースケース（スタッフ認証）を追加した際、プロジェクト全体の成熟度がレベル5からレベル1に急落
- 原因: このユースケースは2ステップで完結する高品質な設計だが、レベル2の必須条件「`mainFlow.length >= 3`」を満たせなかった

**根本的な問題:**
```typescript
// 問題のあった基準（削除前）
{
  id: 'uc-repeatable-flow-detail',
  name: 'フローの詳細化',
  description: 'メインフローが複数ステップで構成されている',
  level: MaturityLevel.REPEATABLE,
  required: true,  // ← 必須条件として定義
  condition: 'mainFlow.length >= 3',  // ← 3ステップ以上を強制
  weight: 0.7,
}
```

### 問題分析

#### 1. ステップ数は品質指標として不適切

**ドメイン依存性:**
- 認証のようなシンプルなユースケース: 2ステップで自然かつ完結
- 複雑な業務フロー: 10ステップ以上が適切な場合もある

**人為的操作の可能性:**
- スコアを上げるために不自然にステップを細分化できる
- 本質的な品質向上にはつながらない

**真の品質指標:**
- ✅ トレーサビリティ（business requirements ↔ use cases）
- ✅ テスト可能性（明確な入力・期待結果）
- ✅ ステップの詳細度（action, expectedResult の具体性）
- ✅ 例外処理（alternative flows の網羅性）

#### 2. 応急処置の限界

**応急処置として実施したこと:**
```typescript
// staff-authenticationに不自然なステップを追加
mainFlow: [
  {
    stepId: 'access-login',  // ← 追加したステップ
    action: 'システムのログイン画面にアクセスする',
    expectedResult: 'ログインフォームが表示される',
  },
  // 本来の2ステップ...
]
```

**問題点:**
- レベル5には復帰したが、本質的な解決ではない
- 設計の自然さを損なう
- 他の2ステップユースケースでも同じ問題が再発する

### 解決策

#### Phase 1: 成熟度基準の修正

**削除した基準:**
```typescript
// ❌ 削除: uc-repeatable-flow-detail
{
  id: 'uc-repeatable-flow-detail',
  condition: 'mainFlow.length >= 3',
  weight: 0.7,
}
```

**追加した基準:**
```typescript
// ✅ 追加: uc-repeatable-steps-quality
{
  id: 'uc-repeatable-steps-quality',
  name: 'ステップの品質',
  description: '全ステップが基本情報と具体的な内容を持つ',
  level: MaturityLevel.REPEATABLE,
  dimension: MaturityDimension.STRUCTURE,
  required: true,
  condition: '全ステップにstepId, actor, action, expectedResult (各5文字以上)',
  weight: 0.7,
}
```

**評価ロジック:**
```typescript
case 'uc-repeatable-steps-quality':
  const hasQualitySteps = useCase.mainFlow?.every(step =>
    step.stepId &&
    step.actor &&
    step.action &&
    step.expectedResult &&
    (step.action?.length ?? 0) >= 5 &&
    (step.expectedResult?.length ?? 0) >= 5
  ) ?? false;
  const stepCount = useCase.mainFlow?.length ?? 0;
  satisfied = hasQualitySteps && stepCount > 0;
  evidence = satisfied 
    ? `全${stepCount}ステップが具体的な内容を持つ`
    : `一部ステップの品質不足（action/expectedResultが5文字未満）`;
  break;
```

#### Phase 2: 設計妥当性チェックの追加

**新機能: `validateFlowDesign`**
```typescript
/**
 * UseCaseのフロー設計の妥当性を検証
 * 
 * ステップ数が極端に少ない、または多い場合に情報/警告を出します。
 * この検証は成熟度スコアには影響せず、設計の参考情報として提供されます。
 */
export function validateFlowDesign(useCases: UseCase[]): {
  info: string[];
  warnings: string[];
} {
  const info: string[] = [];
  const warnings: string[] = [];
  
  for (const useCase of useCases) {
    const stepCount = useCase.mainFlow?.length ?? 0;
    
    if (stepCount === 1) {
      info.push(
        `[${useCase.id}] ${useCase.name}: 1ステップのみ。` +
        `通常のユースケースは複数ステップで構成されますが、` +
        `シンプルな通知や参照のみのユースケースでは問題ありません。`
      );
    } else if (stepCount > 15) {
      warnings.push(
        `[${useCase.id}] ${useCase.name}: ${stepCount}ステップ。` +
        `ステップ数が多すぎる可能性があります。` +
        `複数のユースケースへの分割を検討してください。`
      );
    }
  }
  
  return { info, warnings };
}
```

**設計判断:**
- 成熟度スコアには影響しない（情報提供のみ）
- 1ステップ: 情報レベル（問題とは限らない）
- 15ステップ超: 警告レベル（分割を推奨）

#### Phase 3: 品質評価レポートの強化

**新セクション:**
```
【フロー設計情報】
※ ステップ数に関する情報（成熟度スコアには影響しません）

  ℹ️  情報:
    [usecase-id] ユースケース名: 1ステップのみ。
    通常のユースケースは複数ステップで構成されますが、
    シンプルな通知や参照のみのユースケースでは問題ありません。

  ⚠️  警告:
    [usecase-id] ユースケース名: 20ステップ。
    ステップ数が多すぎる可能性があります。
    複数のユースケースへの分割を検討してください。
```

### 検証結果

#### テストケース: staff-authentication（2ステップ）

**変更前（応急処置後）:**
- ステップ数: 3（不自然に追加したaccess-loginを含む）
- 成熟度: レベル5
- スコア: 90/100

**変更後（基準修正後）:**
- ステップ数: 2（本来の設計に復帰）
- 成熟度: レベル5 ✅
- スコア: 90/100 ✅

#### プロジェクト全体の評価

```
【総合健全性スコア】
  スコア:   90/100
  レベル:   EXCELLENT
  成熟度:   レベル5/5

【5次元成熟度評価】
  テスト可能性     █████░░░░░░░░░░░░░░░  26.0% (12/36)
  保守性           ███████░░░░░░░░░░░░░  35.3% (13/24)
  詳細度           █████████████░░░░░░░  69.7% (67/103)
  トレーサビリティ ████████████████░░░░  81.5% (53/65)
  構造の完全性     ████████████████████ 100.0% (95/95)
```

**結論:**
- ✅ レベル5を維持
- ✅ 2ステップのユースケースが正当に評価される
- ✅ トレーサビリティ81.5%を維持
- ✅ 全ユースケースが適切に評価される

## 設計原則の学び

### 1. 真の品質指標を見極める

**避けるべき指標:**
- 単純な数値基準（行数、ステップ数、関数数）
- ドメインに依存する基準
- 人為的に操作可能な基準

**優れた品質指標:**
- トレーサビリティ（要求から実装までの追跡可能性）
- テスト可能性（明確な入力・期待結果）
- 詳細度（具体的な記述）
- 例外処理（alternative flows の網羅性）

### 2. 情報価値と強制の分離

**ステップ数の扱い:**
- ❌ 成熟度の必須条件として強制 → ドメイン特性を無視
- ✅ 設計の参考情報として提供 → 柔軟性を保つ

**アプローチ:**
```typescript
// 強制（成熟度影響） vs 情報提供（成熟度非影響）
validateFlowDesign(useCases);  // ← 情報提供のみ、スコアに影響なし
```

### 3. 段階的詳細化の原則

**レベル2（REPEATABLE）の評価:**
- 旧: ステップ数 ≥ 3（量的評価）
- 新: 全ステップの品質（質的評価）

**レベル3（DEFINED）の評価:**
- 継続: 全ステップが完全な構造を持つ（`uc-defined-step-detail`）
- ステップの詳細度をより厳密に評価

## まとめ

### 変更内容

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| レベル2必須条件 | `mainFlow.length >= 3` | 全ステップの品質評価 |
| 2ステップのUC評価 | レベル1（不合格） | レベル2以上（適切に評価） |
| ステップ数の扱い | 成熟度に影響 | 情報提供のみ（成熟度非影響） |
| 設計妥当性チェック | なし | `validateFlowDesign`追加 |

### 効果

1. **柔軟性**: ドメイン特性に応じた適切な評価
2. **自然さ**: 設計の本来の姿を損なわない
3. **本質的品質**: ステップの質を重視
4. **情報価値**: ステップ数の情報は残す（参考として）

### 将来の拡張

**考慮すべき点:**
- 複雑度メトリクス（循環的複雑度のような指標）
- ドメイン別の推奨ステップ数範囲
- AIによる設計パターン認識

**原則:**
- 本質的な品質を測定する
- ドメイン特性を尊重する
- 柔軟性と情報提供のバランス
