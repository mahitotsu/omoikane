# Omoikane Example EC Site

Omoikane Metamodelを使用したECサイト要件定義の実例

## 概要

このプロジェクトは、Omoikane Metamodelを使用してECサイトの要件定義を行う実例です。以下のユースケースが含まれています：

- ユーザー登録・認証
- 商品検索・閲覧
- 商品管理
- 注文処理

## 含まれるユースケース

### ユーザー管理
- **ユーザー登録** (`user-registration.ts`): 新規ユーザーのアカウント作成
- **ユーザー認証** (`user-authentication.ts`): ログイン・パスワードリセット

### 商品管理
- **商品検索・閲覧** (`product-browsing.ts`): 商品検索とカート機能
- **商品管理** (`product-management.ts`): 管理者による商品登録・更新

### 注文管理
- **注文処理** (`order-processing.ts`): 注文から配送までの処理

## インストール

```bash
bun install
```

## 使用方法

```bash
# 型安全参照の生成
bun run generate-references

# 自動ビルド（型チェック + 参照生成）
bun run auto-build

# 開発モード
bun run dev
```

## 特徴

- **型安全**: Omoikane Metamodelによる完全な型安全性
- **stepId自動管理**: stepNumberの手動管理が不要
- **参照の型安全性**: ActorRefによる安全な参照システム
- **保守性**: 配列の変更に強い設計

## ファイル構成

```
src/
├── requirements/
│   ├── user-registration.ts     # ユーザー登録
│   ├── user-authentication.ts   # ユーザー認証
│   ├── product-browsing.ts      # 商品検索・閲覧
│   ├── product-management.ts    # 商品管理
│   └── order-processing.ts      # 注文処理
└── index.ts                     # エントリーポイント

scripts/
├── auto-build.ts               # 自動ビルドスクリプト
├── generate-typed-references.ts # 型安全参照生成
└── convert-references.ts       # 参照変換
```

## ライセンス

MIT