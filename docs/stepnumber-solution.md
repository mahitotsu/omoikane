# stepNumber自動管理 - 解決策提案書

## 📋 問題の概要

現在のITデリバリフレームワークでは、UseCaseStepの`stepNumber`が開発者の手動管理となっており、以下の問題があります：

### 🚨 現在の課題
1. **手動管理の負荷**: 開発者がstepNumberを手動で設定・更新
2. **不整合リスク**: ステップの追加・削除時にstepNumberがずれる可能性
3. **保守困難**: 大きなユースケースで番号管理が複雑
4. **参照破綻**: 代替フローの`returnToStep`で参照不整合のリスク

## 💡 提案する解決策

### ✨ **stepId + 自動番号生成アプローチ**

#### 1. **型定義の拡張**

```typescript
// 新しいEnhancedUseCaseStep
export interface EnhancedUseCaseStep extends Omit<UseCaseStep, 'stepNumber'> {
  stepId?: string;           // オプショナルなID（開発者が指定）
  readonly stepNumber?: number; // 配列位置から自動計算
  // ... 他のフィールドは同じ
}

// 新しいEnhancedUseCase
export interface EnhancedUseCase extends Omit<UseCase, 'mainFlow' | 'alternativeFlows'> {
  mainFlow: EnhancedUseCaseStep[];
  alternativeFlows?: EnhancedAlternativeFlow[];
}

// stepId対応の代替フロー（シンプル化）
export interface EnhancedAlternativeFlow extends Omit<AlternativeFlow, 'steps' | 'returnToStep'> {
  steps: EnhancedUseCaseStep[];
  returnToStepId?: string;     // stepIdで戻り先指定（統一）
}
```

#### 2. **自動変換機能**

```typescript
// EnhancedUseCaseを標準UseCaseに変換
export function enrichUseCase(enhancedUseCase: EnhancedUseCase): UseCase;

// stepNumberを自動計算
export function enrichStepsWithNumbers(steps: EnhancedUseCaseStep[]): UseCaseStep[];
```

#### 3. **改善された開発体験**

```typescript
// ❌ 従来の書き方
const oldUseCase: UseCase = {
  // ...
  mainFlow: [
    {
      stepNumber: 1,  // 手動管理が必要
      actor: 'customer',
      action: 'ログイン',
      expectedResult: 'ログイン完了'
    },
    {
      stepNumber: 2,  // 手動管理が必要
      actor: 'customer',
      action: '商品選択',
      expectedResult: '商品が選択される'
    }
  ],
  alternativeFlows: [{
    // ...
    returnToStep: 2  // 番号参照（脆弱）
  }]
};

// ✅ 改善された書き方
const newUseCase: EnhancedUseCase = {
  // ...
  mainFlow: [
    {
      stepId: 'login',  // 意味のある名前
      actor: 'customer',
      action: 'ログイン',
      expectedResult: 'ログイン完了'
      // stepNumberは自動で1
    },
    {
      stepId: 'select-product',
      actor: 'customer', 
      action: '商品選択',
      expectedResult: '商品が選択される'
      // stepNumberは自動で2
    }
  ],
  alternativeFlows: [{
    // ...
    returnToStepId: 'select-product'  // stepIdベース参照（統一・安全）
  }]
};
```

## 🎯 解決策のメリット

### ✅ **開発効率の向上**
- stepNumber手動管理が不要
- ステップ追加・削除が安全
- 意味のあるstepId名で可読性向上

### ✅ **保守性の向上** 
- 参照破綻のリスク削減
- 大規模ユースケースでの番号管理が簡単
- リファクタリングが安全

### ✅ **互換性の保持**
- 既存のUseCaseとの互換性維持
- 段階的な移行が可能
- enrichUseCase()で相互変換

## 🚀 導入手順

### 1. **新しいユースケース作成時**
```typescript
// EnhancedUseCaseを使用して作成
const newUseCase: EnhancedUseCase = {
  // ... stepIdを使用した定義
};
```

### 2. **ビルド確認**
```bash
# 型エラーがないことを確認
bun scripts/auto-build.ts
```

### 3. **stepIdの命名**
```typescript
// 意味のある名前を使用
stepId: 'login'              // ✅ 推奨
stepId: 'validate-input'     // ✅ 推奨  
stepId: 'step-1'             // ❌ 非推奨
```

## 📊 移行前後の比較

| 項目 | 従来 | 改善後 |
|------|------|--------|
| stepNumber管理 | 手動 | 自動 |
| ステップ追加 | 番号調整必要 | 配列挿入のみ |
| 戻り先参照 | 番号（脆弱） | stepIdのみ（統一・安全） |
| 可読性 | 数字のみ | 意味のある名前 |
| エラー発生リスク | 高 | 低 |
| 大規模対応 | 困難 | 容易 |

## 🔧 実装状況

### ✅ **完了済み**
- [x] 型定義の拡張（EnhancedUseCase系）
- [x] 自動変換機能（enrichUseCase）
- [x] デモンストレーション
- [x] 互換性確保
- [x] stepIdのみに統一

### 🔄 **使用方法**
- [ ] 新しいユースケース作成時にEnhancedUseCaseを使用
- [ ] stepIdの命名規則策定
- [ ] チーム内での運用開始

## 💡 使用例

```bash
# デモの実行
bun examples/step-number-solution-demo.ts

# ビルド確認
bun scripts/auto-build.ts
```

この解決策により、**「配列の変更があった際に不整合なくstepNumberを修正するのは困難」**という問題が根本的に解決されます。