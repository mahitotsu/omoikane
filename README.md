# Omoikane

TypeScript ITDelivery Document
Framework - ユースケース・要件定義のための統合フレームワーク

## 概要

Omoikaneは、ITデリバリプロジェクトにおけるユースケース・要件定義を型安全に記述・管理するためのTypeScriptフレームワークです。メタモデルによる基盤技術と、来店予約管理システムを題材にした実装例を提供します。

## プロジェクト構成

このリポジトリは、以下の2つのプロジェクトからなるモノレポ構成になっています：

### 🏗️ [Omoikane Metamodel](./omoikane-metamodel/)

**TypeScript ITDelivery メタモデル**

- ユースケース・要件定義のための型定義とフレームワーク
- 型安全な参照システム
- stepId自動管理機能
- 段階的詳細化対応

### 🏪 [Omoikane Example Reservation](./omoikane-example-reservation/)

**来店予約管理システムのコンパクト実例**

- 小規模店舗の予約登録・来店受付・枠管理を題材にした軽量ユースケース
- メタモデル導入の最小セットとして学習しやすい構成
- 予約枠とスタッフ調整のシナリオを通じた段階的詳細化


## クイックスタート

### 前提条件

- [Bun](https://bun.com) v1.0.0以上

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/mahitotsu/omoikane.git
cd omoikane

# 依存関係をインストール
bun install

# 全プロジェクトをビルド
bun run build

# 型チェック
bun run type-check
```

### 個別プロジェクトでの作業

```bash
# Metamodelプロジェクト
cd omoikane-metamodel
bun run dev

# Example Reservationプロジェクト
cd omoikane-example-reservation
bun run dev
```

## 特徴

- **型安全性**: TypeScriptによる厳密な型定義
- **自動化**: stepId管理、参照変換の自動化
- **段階的詳細化**: シンプルから複雑まで段階的に記述可能
- **実用例**: 予約管理ユースケースによる具体的な使用例
- **モノレポ**: 効率的な依存関係管理

## ライセンス

MIT License

## 貢献

Issue報告やPull Requestを歓迎します。
