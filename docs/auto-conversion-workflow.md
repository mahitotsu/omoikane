# 自動型安全変換ワークフロー

## 🔄 完全自動化による開発体験

### 概要

Omoikaneでは、新しいアクターやユースケースを追加した際の**型安全性確保**を完全自動化しています：

1. **型定義自動生成**: 新しいアクター/ユースケースIDを検出し`KnownActorId`型を更新
2. **型安全参照への変換**: 基盤`actorRef` → 型安全`typedActorRef` への一括置換
3. **import文自動更新**: `delivery-elements` → `typed-references` への切り替え
4. **TypeScript型チェック**: コンパイル時エラーの早期発見

## 🚀 コマンド一覧

### 開発時の基本コマンド

```bash
# 完全自動ビルド（推奨）
bun run build

# 開発モード（ビルド + showcase実行）
bun run dev
```

### 個別実行コマンド

```bash
# 型定義のみ生成
bun run generate-types

# 基盤参照から型安全参照への変換
bun run convert-refs

# 上記2つをまとめて実行
bun run migrate
```

## 📝 開発ワークフロー

### 1. 新しいアクターを追加

```typescript
// src/documents/requirements/new-feature.ts
export const newActor: Actor = {
  id: 'notification-service',  // ← 自動検出対象
  type: 'actor',
  name: '通知サービス',
  // ...
};
```

### 2. 自動変換の実行

```bash
bun run build
```

**実行内容**:
- ✅ `KnownActorId`に`'notification-service'`を自動追加
- ✅ 基盤`actorRef('notification-service')`を型安全`typedActorRef('notification-service')`に変換
- ✅ import文を`typed-references`に更新
- ✅ TypeScript型チェック実行

### 3. IDE補完の利用

```typescript
// 即座にIDE補完が利用可能
const ref = typedActorRef('notification-service'); // ← IDE補完で表示される
```

## 🛡️ 型安全性の保証

### Before（基盤実装）

```typescript
// ⚠️ 汎用的だが型チェックなし
const ref = actorRef('typo-actor');  // 実行時まで気づかない

// 📄 基盤ライブラリからimport
import { actorRef } from '../../types/delivery-elements';
```

### After（型安全実装）

```typescript
// ✅ コンパイル時型チェック + IDE補完
const ref = typedActorRef('notification-service'); // ← 型安全

// ❌ 存在しないアクター（コンパイル時検出）
const invalid = typedActorRef('typo-actor');
//                            ~~~~~~~~~~~~
// Argument of type '"typo-actor"' is not assignable
// to parameter of type 'KnownActorId'

// ✅ 自動でimport文を管理
import { typedActorRef } from '../../types/typed-references';
```

## 🎯 変換結果の例

### 変換前

```typescript
import { actorRef } from '../../types/delivery-elements';

export const userRegistration: UseCase = {
  actors: {
    primary: actorRef('customer'),
    secondary: [actorRef('email-service')]
  }
};
```

### 変換後

```typescript
import { typedActorRef } from '../../types/typed-references';

export const userRegistration: UseCase = {
  actors: {
    primary: typedActorRef('customer'),
    secondary: [typedActorRef('email-service')]
  }
};
```

## 📊 統計情報

最新の変換実行結果：

- ✅ **変換ファイル数**: 3ファイル
- ✅ **actorRef置換数**: 44個
- ✅ **import更新数**: 3ファイル
- ✅ **検出アクター数**: 6個
- ✅ **検出ユースケース数**: 4個

## 🔧 CI/CDでの活用

```yaml
# .github/workflows/ci.yml
name: Type Safety Check
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      # 自動変換実行
      - run: bun run build
      
      # 変更確認
      - run: |
          if ! git diff --exit-code; then
            echo "⚠️  Auto-conversion made changes!"
            echo "Please run 'bun run build' locally"
            exit 1
          fi
```

## 💡 メリット

- 🚀 **開発効率**: 手動管理の負担ゼロ
- 🛡️ **型安全性**: コンパイル時エラー検出
- 💻 **IDE体験**: 完全な補完機能
- 👥 **チーム開発**: 自動的な競合解決
- 🔄 **継続性**: 新しいアクター追加時も自動対応

## 🚨 注意事項

1. **新アクター追加後は必ず`bun run build`を実行**
2. **`typed-references.ts`は自動生成ファイルのため直接編集しない**
3. **アクターID命名はケバブケース推奨**（例: `'email-service'`）

---

**🎉 これで型安全なアクター参照システムの完全自動化が実現されました！**