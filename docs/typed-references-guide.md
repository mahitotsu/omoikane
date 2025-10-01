# TypedReferences 運用ガイド

## 🔄 自動生成について

### 更新タイミング

`typed-references.ts` は以下のタイミングで **自動更新** されます：

1. **開発時**: `bun run dev` コマンド実行時
2. **ビルド時**: `bun run build` コマンド実行時  
3. **手動**: `bun run generate-types` コマンド実行時

### 仕組み

```bash
# 自動生成スクリプトを実行
bun run generate-types
```

- `src/documents/requirements/*.ts` をスキャン
- アクター定義（`id: 'actor-name'`）を検出
- ユースケース定義（`type: 'usecase'`）を検出
- `KnownActorId` と `KnownUseCaseId` の型定義を生成

## 👥 チーム開発での安全な運用

### 1. Git管理戦略

```gitignore
# .gitignore への追加を検討
# src/types/typed-references.ts  # 自動生成ファイルの場合
```

**推奨アプローチ**:
- `typed-references.ts` は **Git管理に含める**
- 自動生成後に差分をレビュー
- 意図しない変更がないか確認

### 2. CI/CDでの自動化

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  type-safety:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      # 型定義を自動生成
      - run: bun run generate-types
      
      # 変更があるかチェック
      - run: |
          if ! git diff --exit-code src/types/typed-references.ts; then
            echo "⚠️ typed-references.ts has changes!"
            echo "Run 'bun run generate-types' locally"
            exit 1
          fi
      
      # TypeScript型チェック
      - run: bun run build
```

### 3. プルリクエストフロー

1. **新しいアクター/ユースケース追加**
   ```typescript
   // src/documents/requirements/new-feature.ts
   export const newActor: Actor = {
     id: 'new-actor',  // ← 自動検出される
     // ...
   };
   ```

2. **型定義更新**
   ```bash
   bun run generate-types
   ```

3. **変更確認**
   ```bash
   git diff src/types/typed-references.ts
   ```

4. **コミット & プッシュ**
   ```bash
   git add .
   git commit -m "feat: add new-actor to typed references"
   ```

### 4. 型安全性の保証

```typescript
// ✅ 有効なアクター参照（IDE補完有効）
const ref = typedActorRef('customer');

// ❌ コンパイルエラー（存在しないアクター）
const invalid = typedActorRef('nonexistent');
//                            ~~~~~~~~~~~~
// Argument of type '"nonexistent"' is not assignable 
// to parameter of type 'KnownActorId'
```

### 5. マージコンフリクトの回避

**conflictが起きやすい箇所**:
```typescript
export type KnownActorId = 
  | 'customer'      // ← ブランチAで追加
  | 'admin'
  | 'new-service';  // ← ブランチBで追加
```

**解決方法**:
1. マージ後に `bun run generate-types` を実行
2. 自動的に正しい型定義に更新される
3. コンフリクトが解消される

## 🛡️ 安全性チェックポイント

### 開発者向け

- [ ] 新アクター追加後、`bun run generate-types` を実行
- [ ] IDE補完が正常に動作することを確認
- [ ] TypeScriptエラーがないことを確認

### レビューア向け

- [ ] `typed-references.ts` の変更が意図されたものか確認
- [ ] 新しいアクター/ユースケースIDが適切な命名か確認
- [ ] 不要なアクター/ユースケースが削除されていないか確認

### CI/CD向け

- [ ] 自動生成後の差分チェック
- [ ] TypeScript型チェック通過
- [ ] 全テストが通過

## 🔧 トラブルシューティング

### Q: 新しいアクターが型定義に反映されない
A: 以下を確認してください：
```typescript
// ✅ 正しい形式
export const customerActor: Actor = {
  id: 'customer',  // ← この形式が必要
  // ...
};

// ❌ 検出されない形式
const actorId = 'customer';
export const customerActor: Actor = {
  id: actorId,  // ← 変数参照は検出されない
  // ...
};
```

### Q: TypeScriptエラーが大量に出る
A: 段階的に移行してください：
```typescript
// 1. 新しいファイルは typedActorRef を使用
// 2. 既存ファイルは段階的に移行
// 3. 最後に古い actorRef を削除
```

## 📊 メリットまとめ

- ✅ **型安全性**: コンパイル時にアクター存在チェック
- ✅ **IDE補完**: 入力ミス防止
- ✅ **自動更新**: 手動メンテナンス不要
- ✅ **チーム開発**: 競合状態を自動解決
- ✅ **CI/CD**: 型整合性を自動チェック