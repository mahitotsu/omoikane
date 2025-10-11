# Omoikane Workspace - Copilot Instructions

## プロジェクト概要

Omoikaneは、ITデリバリプロジェクトにおけるユースケース・要件定義を型安全に記述・管理するためのTypeScriptフレームワークです。

### モノレポ構成

このワークスペースは2つのプロジェクトで構成されています：

1. **omoikane-metamodel** - メタモデルフレームワーク（基盤技術）
2. **omoikane-example-reservation** - 来店予約管理システムの実装例（インスタンス）

## 技術スタック

- **ランタイム**: Bun v1.0.0以上
- **言語**: TypeScript 5.0以上
- **パッケージ管理**: Bun Workspaces
- **コード品質**: ESLint, Prettier
- **バージョン管理**: Git

## プロジェクト間の依存関係

```
omoikane-example-reservation
  └── depends on → omoikane-metamodel
```

- `omoikane-metamodel`は独立したフレームワーク
- `omoikane-example-reservation`はメタモデルを使用する実装例

## 開発ワークフロー

### ワークスペース全体のコマンド

```bash
# 全プロジェクトをビルド
bun run build

# 全プロジェクトの型チェック
bun run type-check

# リント＆フォーマット
bun run code-quality
```

### 個別プロジェクトでの作業

各サブプロジェクトのディレクトリで作業してください：

```bash
cd omoikane-metamodel
bun run quality-assessment

cd omoikane-example-reservation
bun run generate-references
```

## コーディング規約

### TypeScript

- **厳格な型付け**: `any`型の使用は避ける
- **型エイリアス**: 各ファイルの先頭で定義
- **JSDoc**: 公開APIには必ずJSDocコメントを付ける
- **命名規則**:
  - 型: PascalCase (`UseCase`, `Actor`)
  - 変数・関数: camelCase (`createRef`, `useCaseId`)
  - 定数: UPPER_SNAKE_CASE (`MAX_STEPS`)

### ファイル構成

- **一ファイル一責任**: 各ファイルは単一の責任を持つ
- **バレルエクスポート**: `index.ts`でモジュールをまとめてエクスポート
- **相対パス**: プロジェクト内は相対パス、外部依存は絶対パス

### コメント方針

- **メタモデル**: API仕様、使用例、設計判断を詳細にコメント
- **インスタンスプロジェクト**: 設計書として、メタモデルやソースコードに無い重要情報のみコメント

## Git コミットメッセージ

Conventional Commits形式を使用：

```
<type>(<scope>): <subject>

<body>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: ビルド・設定変更

### Scope

- `metamodel`: omoikane-metamodelの変更
- `example-reservation`: omoikane-example-reservationの変更
- `workspace`: ワークスペース全体の変更

### 例

```
feat(metamodel): add quality assessment framework

- Implement maturity level evaluation
- Add AI-powered recommendation engine
- Generate comprehensive quality reports
```

## 品質評価システム

### 概要

メタモデルには品質評価フレームワークが組み込まれています。

### 評価軸

1. **完全性** - 必要な要素が全て定義されているか
2. **一貫性** - 要素間の参照関係が正しいか
3. **妥当性** - 各要素の内容が適切に記述されているか
4. **追跡可能性** - 要素間の関連性が管理されているか
5. **成熟度** - レベル1（初期）〜レベル5（最適化）

### 成熟度レベル

- **レベル1 (INITIAL)**: 初期状態、基本情報のみ
- **レベル2 (REPEATABLE)**: 反復可能、基本的なプロセス確立
- **レベル3 (DEFINED)**: 定義済み、標準化されたプロセス
- **レベル4 (MANAGED)**: 管理された、測定可能なプロセス
- **レベル5 (OPTIMIZED)**: 最適化された、継続的改善

**レベル2の評価方針:**

- 全ステップの質を評価（action, expectedResult が各5文字以上）
- ステップ数は評価対象外（シンプルなユースケースも正当に評価）
- 詳細: `omoikane-metamodel/docs/maturity-criteria-evolution.md`

### 使用方法

```bash
cd omoikane-example-reservation
bun run quality-assessment
```

### 推奨事項への対応

品質評価レポートには2種類の推奨事項があります：

1. **⚡ クイックウィン** - 短時間で大きな効果
2. **最優先推奨事項** - スコアへの影響が大きい

推奨事項はグループ化され、対応の優先順位がつけられています。

## 型安全な参照システム

### メタモデル側（基盤定義）

```typescript
import { Foundation } from 'omoikane-metamodel';

// 標準的な参照
const actorRef = Foundation.createRef<Actor>('customer');
// または簡潔な形式
const actorRef = { id: 'customer' };
```

### インスタンス側（自動生成）

```typescript
import {
  typedActorRef,
  typedUseCaseRef,
  typedValidationRuleRef,
} from './typed-references.js';

// 型安全な参照（IDE補完あり）
const actorRef = typedActorRef('customer');
const useCaseRef = typedUseCaseRef('user-registration');
const validationRef = typedValidationRuleRef('validation-email-format');
```

**重要**:
`typedActorRef`等はインスタンスプロジェクトで自動生成される関数です。メタモデル側のコード例では使用しないでください。

## 型検出システム（Type Detection System）

### 設計原則

全てのドキュメント型に`type`フィールドを持たせ、実行時に型を識別できるようにします。これにより、インスタンスプロジェクトで型安全な参照関数を自動生成できます。

**重要な原則:**
- **type属性のみで判定**: プロパティの有無による判定は使用しない
- **一貫性**: すべての要素が統一された方法で検出される
- **シンプル**: フォールバックロジック不要

### メタモデル側での定義

```typescript
// メタモデル側: 型フィールドを定義
export interface Actor extends DocumentBase {
  type?: 'actor'; // 型識別子
  role: ActorRole;
  // ...
}

export interface ValidationRule extends DocumentBase {
  type?: 'validation-rule'; // 型識別子
  ruleType: ValidationRuleType;
  // ...
}

export interface ScreenFlow extends DocumentBase {
  type?: 'screen-flow'; // 型識別子
  transitions: ScreenTransition[];
  relatedUseCase: Ref<UseCase>; // 必須（トレーサビリティ）
}
```

### インスタンス側での使用

```typescript
// インスタンス側: typeフィールドに値を設定
export const visitor: Actor = {
  id: 'visitor',
  name: '来店者',
  type: 'actor', // ← これで自動検出される
  role: 'primary',
  responsibilities: ['予約の登録・変更・取消'],
};

export const emailValidation: ValidationRule = {
  id: 'validation-email-format',
  name: 'メールアドレス形式検証',
  type: 'validation-rule', // ← これで自動検出される
  ruleType: 'email',
  errorMessage: '有効なメールアドレスを入力してください',
};

export const bookingFlow: ScreenFlow = {
  id: 'booking-flow',
  name: '予約登録フロー',
  type: 'screen-flow', // ← これで自動検出される
  transitions: [/* ... */],
  relatedUseCase: typedUseCaseRef('reservation-booking'), // 必須
};
```

### 自動生成される型定義

```typescript
// 自動生成されるtyped-references.ts
export type KnownActorId = 'visitor' | 'store-staff' | ...;
export type KnownValidationRuleId = 'validation-email-format' | ...;
export type KnownScreenFlowId = 'booking-flow' | ...;

export function typedActorRef<T extends KnownActorId>(id: T): Ref<Actor> & { id: T } {
  return { id };
}

export function typedValidationRuleRef<T extends KnownValidationRuleId>(id: T): Ref<ValidationRule> {
  return { id };
}
```

## UI層の統合

### 設計原則

- **凝集度**: 入力フィールドは画面定義内にインライン定義
- **再利用性**: バリデーションルールは独立した型として定義し参照で再利用
- **トレーサビリティ**: 
  - UseCaseStepから画面への参照
  - ScreenFlowからUseCaseへの必須参照（relatedUseCase）
- **循環UIパターン**: 「一覧 → 詳細 → 一覧」のような循環を正しく表現

### ScreenFlowの定義

```typescript
// 画面遷移フロー（transitionsが単一の情報源）
export const bookingFlow: ScreenFlow = {
  id: 'booking-flow',
  name: '予約登録フロー',
  type: 'screen-flow',
  description: '来店者による予約登録の画面遷移',
  transitions: [
    {
      from: typedScreenRef('form-screen'),
      to: typedScreenRef('confirm-screen'),
      trigger: typedScreenActionRef('form-screen', 'submit'),
      condition: 'すべてのバリデーションが通過している',
    },
    {
      from: typedScreenRef('confirm-screen'),
      to: typedScreenRef('complete-screen'),
      trigger: typedScreenActionRef('confirm-screen', 'confirm'),
      condition: '予約枠が確保できた',
    },
  ],
  relatedUseCase: typedUseCaseRef('reservation-booking'), // 必須
};
```

**重要な変更点:**
- `relatedUseCase`は**必須フィールド**になりました（型安全性とトレーサビリティの向上）
- `screens`, `startScreen`, `endScreens`は自動導出されるため定義不要（DRY原則）

### バリデーションルールの定義

```typescript
// 再利用可能なバリデーションルール
export const emailFormatValidation: ValidationRule = {
  id: 'validation-email-format',
  name: 'メールアドレス形式検証',
  type: 'validation-rule',
  ruleType: 'email',
  errorMessage: '有効なメールアドレスを入力してください',
  validateOn: ['blur', 'submit'],
};
```

### 画面定義

```typescript
// 画面定義（バリデーションルールを参照）
export const formScreen: Screen = {
  id: 'form-screen',
  name: 'フォーム画面',
  type: 'screen',
  screenType: 'form',
  inputFields: [
    {
      id: 'email',
      name: 'email',
      label: 'メールアドレス',
      fieldType: 'email',
      required: true,
      validationRules: [typedValidationRuleRef('validation-email-format')],
    },
  ],
};
```

### UseCaseStepとの関連付け

```typescript
// ユースケースステップから画面を参照
mainFlow: [
  {
    stepId: 'input-info',
    actor: typedActorRef('visitor'),
    action: '予約情報を入力する',
    expectedResult: '入力内容が確認画面に表示される',
    screen: typedScreenRef('form-screen'),
    inputFields: ['email', 'phone', 'date'], // 画面内のフィールドID
  },
  {
    stepId: 'confirm-booking',
    actor: typedActorRef('visitor'),
    action: '内容を確認して予約を確定する',
    expectedResult: '予約が完了し予約番号が表示される',
    screen: typedScreenRef('confirm-screen'),
  },
];
```

### 循環UIパターンのサポート

多くの実世界のUIフローは「一覧 → 詳細 → 一覧」のように最初の画面に戻ります。これは正常な設計パターンです：

```typescript
// UseCaseでの循環フロー定義（推奨）
mainFlow: [
  {
    stepId: 'view-list',
    screen: typedScreenRef('list-screen'),
    action: '一覧を表示',
    expectedResult: '予約一覧が表示される',
  },
  {
    stepId: 'view-detail',
    screen: typedScreenRef('detail-screen'),
    action: '詳細を確認',
    expectedResult: '予約詳細が表示される',
  },
  {
    stepId: 'return-to-list',
    screen: typedScreenRef('list-screen'), // 最初の画面に戻る
    action: '一覧に戻る',
    expectedResult: '一覧画面が表示される',
  },
];

// ScreenFlowでの遷移定義（循環を明示）
transitions: [
  {
    from: typedScreenRef('list-screen'),
    to: typedScreenRef('detail-screen'),
    trigger: typedScreenActionRef('list-screen', 'view-detail'),
  },
  {
    from: typedScreenRef('detail-screen'),
    to: typedScreenRef('list-screen'),
    trigger: typedScreenActionRef('detail-screen', 'back'),
  },
];
```

品質評価の整合性チェックは、循環パターンを正しく認識・検証します。

## stepNumber 自動管理

### 設計原則

- **手動管理不要**: stepNumberは配列インデックスから自動計算
- **ID重視**: 戻り先指定は`stepId`ベース（番号ではなくID）
- **保守性**: ステップの挿入・削除が容易

### 推奨される書き方

```typescript
const useCase: UseCase = {
  // ...
  mainFlow: [
    {
      stepId: 'login',
      actor: { id: 'user' },
      action: '...',
      expectedResult: '...',
    },
    {
      stepId: 'search',
      actor: { id: 'user' },
      action: '...',
      expectedResult: '...',
    },
  ],
  alternativeFlows: [
    {
      id: 'error-flow',
      returnToStepId: 'login', // IDで指定（番号ではない）
    },
  ],
};

// stepNumberを自動計算
const enrichedFlow = enrichStepsWithNumbers(useCase.mainFlow);
```

## トラブルシューティング

### TypeScriptエラー: "Cannot find name 'typedActorRef'"

- **原因**: メタモデル側のコードで`typedActorRef`を使用している
- **解決**: `{ id: 'actor-id' }`形式に変更する
- **理由**: `typedActorRef`はインスタンスプロジェクトで自動生成される

### 品質スコアが低い

1. 品質評価レポートの「クイックウィン」から対応
2. 「最優先推奨事項」を確認し、影響の大きいものから対応
3. `docs/quality-assessment-guide.md`を参照

### ビルドエラー

```bash
# クリーンビルド
rm -rf node_modules
bun install
bun run build
```

## 追加リソース

- [メタモデルREADME](../omoikane-metamodel/README.md)
- [品質評価ガイド](../omoikane-metamodel/docs/quality-assessment-guide.md)
- [予約システム実例README](../omoikane-example-reservation/README.md)

## AI Assistantへの指示

### コード生成時の注意点

1. **型安全性を最優先** - `any`型を避け、適切な型を使用
2. **既存パターンに従う** - プロジェクト内の既存コードのスタイルを踏襲
3. **JSDocを付ける** - 公開APIには使用例を含む詳細なJSDocを記述
4. **段階的詳細化** - 最初はシンプルに、必要に応じて詳細化
5. **品質を確認** - 変更後は品質評価を実行し、スコアの変化を確認

### メタモデル vs インスタンス

- **メタモデル側**: フレームワークの基盤、他プロジェクトからも使用される
  - 詳細なコメント、使用例、設計判断を記述
  - 破壊的変更に注意
- **インスタンス側**: 具体的な実装例、設計書として機能
  - 最小限のコメント（メタモデルやコードに無い情報のみ）
  - 型定義はメタモデルを活用

### 因果関係の理解

- `actors.ts` → (自動生成) → `typed-references.ts`
- アクターIDを定義すると、`KnownActorId`型が生成される
- コメント記述時は因果関係を正しく表現する
