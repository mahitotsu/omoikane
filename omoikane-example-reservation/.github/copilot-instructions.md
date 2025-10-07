# Omoikane Example Reservation - Copilot Instructions

## プロジェクト概要

**来店予約管理システムの設計書**

このプロジェクトは、Omoikaneメタモデルを使用した実装例（インスタンスプロジェクト）です。小規模店舗の来店予約システムを題材に、ユースケース駆動開発の設計書を型安全に記述しています。

### プロジェクトの性格

- **設計書**: 実装コードではなく、要件定義・ユースケース定義
- **学習用サンプル**: メタモデルの使い方を示す実例
- **品質見本**: 高品質な設計書の参考例（成熟度レベル5達成）

## システム概要

### 対象業務

小規模店舗（レストラン、美容室等）の来店予約管理

### 主要機能

1. **予約管理**
   - 予約登録（来店者による自己予約）
   - 予約変更・取消
   - チェックイン（来店受付）

2. **スタッフ操作**
   - 予約検索・変更・取消（代理操作）
   - 予約履歴確認

3. **システム管理**
   - 枠管理（営業時間、予約枠設定）
   - アカウント管理

### アクター

- **visitor**: 来店者（予約する顧客）
- **store-staff**: 店舗スタッフ（予約管理・来店受付）
- **capacity-planner**: 枠管理担当者
- **system-admin**: システム管理者

## ディレクトリ構造

```
src/
├── index.ts                              # エントリーポイント
├── actors.ts                             # 4アクター定義
├── typed-references.ts                   # 型安全な参照（自動生成）
└── requirements/
    ├── business-requirements.ts          # 業務要件定義
    ├── reservation-booking.ts            # 予約登録
    ├── reservation-cancel.ts             # 予約取消
    ├── reservation-update.ts             # 予約変更
    ├── reservation-check-in.ts           # チェックイン
    ├── capacity-management.ts            # 枠管理
    ├── reservation-staff-search.ts       # スタッフ予約検索
    ├── reservation-staff-change.ts       # スタッフ予約変更
    ├── reservation-staff-cancel.ts       # スタッフ予約取消
    ├── reservation-history-review.ts     # 予約履歴確認
    └── account-administration.ts         # アカウント管理

scripts/
├── generate-typed-references.ts          # 型安全参照の生成
├── convert-references.ts                 # 参照の変換
└── auto-build.ts                         # 自動ビルド
```

## 開発ワークフロー

### 1. アクターの定義

```typescript
// src/actors.ts
export const visitor: Actor = {
  id: 'visitor',  // ← ここで定義したIDが...
  name: '来店者',
  description: '店舗のサービスを利用するために予約を行う顧客。',
  role: 'primary',
  responsibilities: ['希望日時の入力', '予約内容の確認'],
  goals: ['希望する日時にスムーズに予約を確定したい'],
};
```

### 2. 型安全な参照の生成

```bash
# typed-references.tsを自動生成
bun run generate-references
```

これにより、`KnownActorId`型と`typedActorRef`関数が生成されます：

```typescript
// src/typed-references.ts (自動生成)
export type KnownActorId = 'visitor' | 'store-staff' | 'capacity-planner' | 'system-admin';

export function typedActorRef<T extends KnownActorId>(id: T): Ref<Actor> {
  return { id };
}
```

### 3. ユースケースの記述

```typescript
// src/requirements/reservation-booking.ts
import { typedActorRef, typedUseCaseRef } from '../typed-references.js';

export const reservationBooking: UseCase = {
  id: 'reservation-booking',
  name: '予約登録',
  actors: {
    primary: typedActorRef('visitor'),  // ← IDE補完が効く
  },
  mainFlow: [
    {
      stepId: 'access-site',
      actor: typedActorRef('visitor'),
      action: '予約サイトにアクセスする',
      expectedResult: '予約フォームが表示される',
    },
  ],
  // ...
};
```

### 4. 品質評価

```bash
# 設計品質を評価
bun run quality-assessment
```

## コーディング規約

### コメント方針（重要）

このプロジェクトは**設計書**であるため、コメントは最小限にします：

#### ✅ 書くべきコメント

- ファイル間の関係性
- プロジェクト固有の設計判断
- 設計上の特徴や注意事項
- 関連ユースケースへの参照
- セキュリティやビジネス上の考慮事項

#### ❌ 書かないコメント

- 型定義の説明（メタモデルに既にある）
- フィールドの意味（ソースコードで自明）
- メタモデルの使い方（メタモデルのドキュメントを参照）

#### コメント例

```typescript
/**
 * 来店予約管理システム - 予約登録ユースケース
 * 
 * 来店者が自ら予約を行うセルフサービス型の予約機能を定義します。
 * 
 * 設計上の特徴:
 * - 予約番号の自動生成（システムが一意に採番）
 * - 連絡先の必須入力（予約内容通知のため）
 * 
 * 関連ユースケース:
 * - reservation-cancel: 予約の取消
 * - reservation-update: 予約内容の変更
 */
```

### 型安全な参照の使用

#### ✅ 正しい使い方

```typescript
// typedActorRefを使用（IDE補完が効く）
actors: {
  primary: typedActorRef('visitor'),
  secondary: [typedActorRef('store-staff')],
}

// businessRequirementCoverageでtypedBusinessGoalRefを使用
businessRequirementCoverage: {
  requirement: typedBusinessRequirementRef('reservation-business-requirements'),
  businessGoals: [
    typedBusinessGoalRef('goal-minimize-no-shows'),
  ],
}
```

#### ❌ 避けるべき書き方

```typescript
// 生の文字列（タイポのリスク、補完が効かない）
actors: {
  primary: { id: 'visiter' },  // タイポに気づきにくい
}
```

### ユースケースの記述パターン

#### mainFlowの推奨形式

```typescript
mainFlow: [
  {
    stepId: 'step-1',  // IDベース（番号ではない）
    actor: typedActorRef('visitor'),
    action: '具体的な行動を記述',
    expectedResult: '期待される結果を記述',
  },
  {
    stepId: 'step-2',
    actor: typedActorRef('system'),
    action: 'システムの処理を記述',
    expectedResult: '処理結果を記述',
    businessRules: [  // ビジネスルールの参照
      typedBusinessRuleRef('rule-no-duplicate-reservation'),
    ],
  },
]
```

#### alternativeFlowの推奨形式

```typescript
alternativeFlows: [
  {
    id: 'no-available-slots',
    name: '予約枠なし',
    condition: '希望日時に空き枠がない',
    steps: [
      {
        actor: typedActorRef('system'),
        action: '空き枠がない旨を表示',
        expectedResult: 'エラーメッセージが表示される',
      },
    ],
    returnToStepId: 'select-datetime',  // IDで戻り先指定
  },
]
```

## 自動生成ファイルの管理

### typed-references.ts

このファイルは**自動生成**されます。直接編集しないでください。

#### 生成元

- `src/actors.ts` → `KnownActorId`型
- `src/requirements/*.ts` → `KnownUseCaseId`型
- `src/requirements/business-requirements.ts` → `KnownBusinessGoalId`型等

#### 再生成が必要なタイミング

- アクターを追加・削除・リネームした時
- ユースケースを追加・削除・リネームした時
- ビジネスゴール等を変更した時

```bash
# 再生成コマンド
bun run generate-references
```

### 因果関係の理解

```
actors.ts (アクターID定義)
  ↓ 自動生成
typed-references.ts (KnownActorId型生成)
  ↓ import
requirements/*.ts (ユースケース定義でtypedActorRef使用)
```

コメント記述時はこの因果関係を正しく表現します。

## 品質管理

### 品質評価の実行

```bash
bun run quality-assessment
```

### 成熟度レベル

このプロジェクトは**レベル5（OPTIMIZED）**を達成しています。

維持すべきポイント：

1. **全アクターにgoals定義**
2. **全ユースケースに受け入れ基準**
3. **業務要件とのトレーサビリティ**
4. **セキュリティポリシーの参照**
5. **詳細な代替フロー定義**

### クイックウィン対応

品質評価レポートの「⚡ クイックウィン」は優先的に対応します。

例：
- 欠落している受け入れ基準の追加
- 空のdescriptionフィールドの充実
- businessRequirementCoverageの追加

## よくあるパターン

### パターン1: 本人確認が必要なユースケース

```typescript
preconditions: [
  '来店者が予約番号と連絡先を持っている',
  '予約が存在している',
],
mainFlow: [
  {
    stepId: 'identify',
    actor: typedActorRef('visitor'),
    action: '予約番号と連絡先を入力',
    expectedResult: '予約情報が表示される',
    securityPolicies: [
      typedSecurityPolicyRef('policy-verify-identity'),
    ],
  },
  // ...
]
```

### パターン2: スタッフによる代理操作

```typescript
mainFlow: [
  {
    stepId: 'search',
    actor: typedActorRef('store-staff'),
    action: '予約を検索する',
    expectedResult: '予約情報が表示される',
    notes: '予約番号がない場合は連絡先や名前で検索',
  },
  {
    stepId: 'perform-action',
    actor: typedActorRef('store-staff'),
    action: '予約を変更する',
    expectedResult: '変更内容が反映される',
    notes: '変更理由と担当者IDを記録',
  },
]
```

### パターン3: 業務ルールによる制約

```typescript
mainFlow: [
  {
    stepId: 'validate',
    actor: typedActorRef('system'),
    action: '予約内容を検証',
    expectedResult: '検証結果を返す',
    businessRules: [
      typedBusinessRuleRef('rule-no-duplicate-reservation'),
      typedBusinessRuleRef('rule-advance-booking-limit'),
    ],
  },
]
```

## トラブルシューティング

### エラー: Cannot find name 'typedActorRef'

**原因**: `typed-references.ts`が生成されていない

**解決**:
```bash
bun run generate-references
```

### エラー: Argument of type '"unknown-actor"' is not assignable to parameter of type 'KnownActorId'

**原因**: 存在しないアクターIDを参照している

**解決**:
1. `src/actors.ts`でアクターが定義されているか確認
2. `bun run generate-references`で再生成
3. タイポがないか確認

### 品質スコアが下がった

**確認ポイント**:
1. 必須フィールド（description等）が空になっていないか
2. businessRequirementCoverageが全ユースケースにあるか
3. acceptanceCriteriaが定義されているか
4. アクターのgoalsが定義されているか

```bash
# 詳細な評価レポートを確認
bun run quality-assessment
```

## スクリプト一覧

```bash
# 型安全な参照の生成
bun run generate-references

# 手動参照の自動変換
bun run convert-references

# リアルタイム自動ビルド
bun run auto-build

# 品質評価
bun run quality-assessment

# 型チェック
bun run type-check

# ビルド
bun run build

# リント＆フォーマット
bun run quality
```

## Git コミットメッセージ

### スコープ

このプロジェクトでは`example-reservation`を使用：

```
feat(example-reservation): add new use case for reservation cancellation
fix(example-reservation): correct actor reference in check-in flow
docs(example-reservation): update README with quality score
```

### 例

```
feat(example-reservation): add account administration use cases

- Add staff account registration use case
- Add staff account deletion use case
- Include security policies for account management
- Achieve 91 points in quality assessment (Level 5)
```

## AI Assistantへの追加指示

### ユースケース作成時

1. **typedActorRefを使用** - 生の`{ id: '...' }`ではなく型安全な参照を使う
2. **stepIdはケバブケース** - 'select-datetime'、'confirm-booking'等
3. **mainFlowは3-7ステップ** - 多すぎる場合は分割を検討
4. **alternativeFlowも忘れずに** - 例外ケースの定義が重要
5. **businessRequirementCoverageは必須** - トレーサビリティの維持

### コメント追加時

1. **最小限に抑える** - 設計書なので冗長なコメントは不要
2. **設計判断を記録** - なぜこの設計にしたのかを記述
3. **関連性を示す** - 他のユースケースとの関係を明示
4. **メタモデルと重複しない** - 型の説明等はメタモデルに任せる

### 品質改善時

1. **クイックウィンを優先** - 短時間で効果が大きいものから
2. **スコアを確認** - 変更前後でスコアの変化を確認
3. **バランスを保つ** - 過度に詳細化せず、適切な粒度を維持
4. **レベル5を維持** - 既に達成している高品質を保つ

## 参考リソース

- [メタモデルREADME](../omoikane-metamodel/README.md)
- [品質評価ガイド](../omoikane-metamodel/docs/quality-assessment-guide.md)
- [ワークスペースREADME](../README.md)
