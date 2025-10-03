# Omoikane Example Reservation

来店予約管理システムの要件をOmoikaneメタモデルで表現したコンパクトなサンプルです。

## 含まれるユースケース

- 予約登録: 顧客が希望日時で来店予約を行う
- 来店受付: 予約当日の受付とステータス更新
- 枠管理: 店舗スタッフが営業時間や枠の最適化を行う

## 利用方法

```bash
# 型安全な参照を再生成
bun run generate-references

# 要件の自動ビルド処理
bun run auto-build

# 品質チェック一式
bun run quality
```

## 依存関係

- `omoikane-metamodel`: ユースケース・アクターの型定義とユーティリティ

## ライセンス

MIT License
