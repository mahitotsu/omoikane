# Omoikane Example Reservation

来店予約管理システムの要件をOmoikaneメタモデルで表現したコンパクトなサンプルです。

## 含まれるユースケース

- 予約登録: 顧客が希望日時で来店予約を行う
- 来店受付: 予約当日の受付とステータス更新
- 枠管理: 店舗スタッフが営業時間や枠の最適化を行う

## スクリプト

### コード生成

```bash
# 型安全な参照システムを生成
bun run generate-references

# 手動で記述された参照をtyped-referenceに変換
bun run convert-references

# リアルタイムで自動変換
bun run auto-build
```

### 品質評価

```bash
# プロジェクトの設計品質を評価
bun run quality-assessment
```

品質評価では以下の観点からプロジェクトを評価します：

- **完全性**: 必要な要素が全て定義されているか
- **一貫性**: 要素間の参照関係が正しく保たれているか
- **妥当性**: 各要素の内容が適切に記述されているか
- **追跡可能性**: 要素間の関連性が適切に管理されているか

### その他

```bash
# TypeScript型チェック
bun run type-check

# リント・フォーマット
bun run quality
```

## 依存関係

- `omoikane-metamodel`: ユースケース・アクターの型定義とユーティリティ

## ライセンス

MIT License
