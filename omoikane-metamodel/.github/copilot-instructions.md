# Omoikane Metamodel - Copilot Instructions

## プロジェクト概要

**Omoikane
Metamodel**は、ITデリバリプロジェクトにおけるユースケース・要件定義を型安全に記述するためのTypeScriptフレームワークです。このプロジェクトは、他のプロジェクトから利用される**基盤技術（メタモデル）**です。

## アーキテクチャ

### レイヤード構成

```
┌─────────────────────────────────────────────────────┐
│              Omoikane Metamodel                     │
├─────────────────────────────────────────────────────┤
│  Quality Layer (品質評価層)                          │
│  ├─ 品質評価エンジン (quality-assessment.ts)         │
│  ├─ AI推奨システム (recommendation-engine.ts)        │
│  └─ 成熟度評価 (maturity-assessor.ts)                │
├─────────────────────────────────────────────────────┤
│  Type Layer (型定義層)                               │
│  ├─ Foundation (基礎層): Ref<T>, DocumentBase       │
│  ├─ Business (業務層): BusinessRequirementDefinition│
│  ├─ Functional (機能層): UseCase, Actor             │
│  ├─ UI (UI層): Screen, ValidationRule, ScreenFlow  │
│  └─ Cross-Cutting (横断層): TraceabilityMatrix      │
├─────────────────────────────────────────────────────┤
│  Utility Layer (ユーティリティ層)                     │
│  ├─ stepNumber自動管理 (step-number-solution.ts)    │
│  ├─ 関係性分析 (relationship-analyzer.ts)           │
│  └─ カバレッジ分析 (delivery-elements.ts)            │
└─────────────────────────────────────────────────────┘
```

## ディレクトリ構造

```
src/
├── index.ts                      # メインエントリーポイント
├── types/                        # 型定義層
│   ├── foundation/              # Foundation層（基礎）
│   │   ├── primitives.ts        # プリミティブ型
│   │   ├── ref.ts               # 参照型 Ref<T>
│   │   └── document.ts          # 文書基底型
│   ├── business/                # Business層（業務）
│   │   ├── requirements.ts      # 業務要件定義
│   │   └── references.ts        # 参照型定義
│   ├── functional/              # Functional層（機能）
│   │   ├── actor.ts             # アクター定義
│   │   └── use-case.ts          # ユースケース定義
│   ├── ui/                      # UI層（画面・バリデーション）
│   │   ├── screen.ts            # 画面定義
│   │   ├── validation-rule.ts   # バリデーションルール
│   │   └── screen-flow.ts       # 画面遷移フロー
│   ├── cross-cutting/           # 横断的関心事
│   │   └── traceability.ts
│   ├── step-number-solution.ts  # stepNumber自動管理
│   ├── relationship-analyzer.ts # 関係性分析
│   └── delivery-elements.ts     # デリバリ要素分析
├── quality/                      # 品質評価層
│   ├── quality-assessment.ts    # 品質評価エンジン
│   ├── recommendation-engine.ts # AI推奨システム
│   ├── maturity-assessor.ts     # 成熟度評価
│   └── metrics/                 # メトリクス定義
├── utils/                        # ユーティリティ
└── scripts/                      # CLIスクリプト
    ├── run-quality-assessment.ts
    └── generate-typed-references.ts
```

## 開発ガイドライン

### 1. 型定義の原則

#### レイヤー分離

各レイヤーは独立性を保ちます：

- **Foundation**: 最も基礎的な型、他レイヤーに依存しない
- **Business**: Foundationに依存、Functionalには依存しない
- **Functional**: FoundationとBusinessに依存可能
- **UI**: Foundation、Business、Functionalに依存可能
- **Cross-Cutting**: 全レイヤーに依存可能

#### 型エクスポート

```typescript
// 各レイヤーのindex.tsでバレルエクスポート
export * from './primitives.js';
export * from './ref.js';
export * from './document.js';

// メインindex.tsで名前空間エクスポート
export * as Foundation from './types/foundation/index.js';
export * as Business from './types/business/index.js';
export * as Functional from './types/functional/index.js';
```

### 2. 参照システム

#### Ref<T>の使用

```typescript
// Foundation層で定義
export type Ref<T> = {
  id: string;
};

// 使用例
import type { Ref } from './types/foundation/ref.js';
import type { Actor } from './types/functional/actor.js';

const actorRef: Ref<Actor> = { id: 'customer' };
```

#### createRef ヘルパー

```typescript
// ヘルパー関数（型推論を強化）
export function createRef<T>(id: string): Ref<T> {
  return { id };
}

// 使用例
const actorRef = createRef<Actor>('customer');
```

### 3. stepNumber自動管理システム

#### 設計思想

- **手動管理を排除**: stepNumberは配列インデックスから自動計算
- **IDベース参照**: 戻り先は`stepId`で指定（番号ではない）
- **保守性向上**: ステップの挿入・削除が安全

#### 提供API

```typescript
/**
 * ステップにstepNumberを自動付与
 */
export function enrichStepsWithNumbers(steps: UseCaseStep[]): UseCaseStep[];

/**
 * stepIdまたはstepNumberでステップを検索
 */
export function findStepByIdOrNumber(
  useCase: UseCase,
  identifier: string | number
): { step: UseCaseStep; stepNumber: number } | undefined;
```

### 4. 型検出システム（Type Detection System）

#### 設計思想

全てのドキュメント型に`type`フィールドを持たせ、実行時に型を識別できるようにします。これにより、インスタンスプロジェクトで型安全な参照関数を自動生成できます。

**重要な原則:**
- **type属性のみで判定**: プロパティの有無による判定は使用しない
- **一貫性**: すべての要素が統一された方法で検出される
- **シンプル**: フォールバックロジック不要

#### 型フィールドの定義

各ドキュメント型に`type?: 'type-literal'`を追加：

```typescript
// メタモデル側での定義
export interface Actor extends DocumentBase {
  type?: 'actor'; // 型識別子
  role: ActorRole;
  responsibilities: string[];
  goals?: string[];
}

export interface UseCase extends TraceableDocument {
  type?: 'usecase'; // 型識別子
  actors: UseCaseActors;
  mainFlow: UseCaseStep[];
  // ...
}

export interface ValidationRule extends DocumentBase {
  type?: 'validation-rule'; // 型識別子
  ruleType: ValidationRuleType;
  errorMessage: string;
  // ...
}

export interface ScreenFlow extends DocumentBase {
  type?: 'screen-flow'; // 型識別子
  transitions: ScreenTransition[];
  relatedUseCase: Ref<UseCase>; // 必須（トレーサビリティ）
}
```

#### 自動生成スクリプト

`scripts/generate-typed-references.ts`が以下を検出：

- Actor (type: 'actor')
- UseCase (type: 'usecase')
- Screen (type: 'screen')
- ValidationRule (type: 'validation-rule')
- ScreenFlow (type: 'screen-flow')
- BusinessRequirement (type: 'business-requirement')

インスタンスプロジェクトで以下を生成：

```typescript
// 自動生成されるtyped-references.ts
export type KnownActorId = 'visitor' | 'store-staff' | ...;
export type KnownUseCaseId = 'reservation-booking' | ...;
export type KnownValidationRuleId = 'validation-email-format' | ...;

export function typedActorRef<T extends KnownActorId>(id: T): Ref<Actor> & { id: T } {
  return { id };
}

export function typedValidationRuleRef<T extends KnownValidationRuleId>(id: T): Ref<ValidationRule> {
  return { id };
}
```

### 5. UI層の統合

#### 設計原則

- **凝集度**: 入力フィールドは画面定義内にインライン定義
- **再利用性**: バリデーションルールは独立した型として定義し参照で再利用
- **トレーサビリティ**: 
  - UseCaseStepから画面への参照
  - ScreenFlowからUseCaseへの必須参照（relatedUseCase）
- **循環UIパターン**: 「一覧 → 詳細 → 一覧」のような循環を正しく表現

#### 提供型

```typescript
// 画面定義
export interface Screen extends DocumentBase {
  type?: 'screen';
  screenType: ScreenType; // 'form' | 'list' | 'detail' | 'confirmation' | ...
  inputFields?: InputField[];
  displayFields?: DisplayField[];
  actions?: ScreenAction[];
}

// バリデーションルール（再利用可能）
export interface ValidationRule extends DocumentBase {
  type?: 'validation-rule';
  ruleType: ValidationRuleType;
  errorMessage: string;
  validateOn?: ValidationTrigger[];
}

// 画面遷移フロー
export interface ScreenFlow extends DocumentBase {
  type?: 'screen-flow';
  transitions: ScreenTransition[]; // 単一の情報源
  relatedUseCase: Ref<UseCase>; // 必須（トレーサビリティ）
}
```

**重要な変更点:**
- `relatedUseCase`は**必須フィールド**になりました
- `screens`, `startScreen`, `endScreens`は自動導出されるため定義不要（DRY原則）
- 循環パターン（A → B → C → A）を正しくサポート

#### UseCaseStepとの統合

```typescript
export interface UseCaseStep {
  stepId: string;
  actor: Ref<Actor>;
  action: string;
  expectedResult: string;

  // UI関連（画面との関連付け）
  screen?: Ref<Screen>;
  inputFields?: string[]; // 画面内のフィールドID
}
```

#### UseCaseStepとの統合

```typescript
export interface UseCaseStep {
  stepId: string;
  actor: Ref<Actor>;
  action: string;
  expectedResult: string;

  // UI関連（画面との関連付け）
  screen?: Ref<Screen>;
  inputFields?: string[]; // 画面内のフィールドID
}
```

### 6. 品質評価フレームワーク

#### 評価指標

1. **完全性 (Completeness)**: 必須フィールドの充足度
2. **一貫性 (Consistency)**: 参照関係の整合性
3. **妥当性 (Validity)**: 内容の適切性
4. **追跡可能性 (Traceability)**: 要素間の関連性
5. **成熟度 (Maturity)**: レベル1〜5の段階評価

#### 成熟度レベル

- **レベル1 (INITIAL)**: 初期状態、基本情報のみ
- **レベル2 (REPEATABLE)**: 反復可能、基本的なプロセス確立
- **レベル3 (DEFINED)**: 定義済み、標準化されたプロセス
- **レベル4 (MANAGED)**: 管理された、測定可能なプロセス
- **レベル5 (OPTIMIZED)**: 最適化された、継続的改善

#### レベル2（REPEATABLE）の評価方針

**ステップの質を重視:**

- 全ステップが具体的な内容を持つ（action, expectedResult が各5文字以上）
- ステップ数は評価対象外（ドメイン特性を尊重）
- フロー設計情報は参考として提供（成熟度スコアには非影響）

**設計思想:**

- 認証のようなシンプルなユースケース（2ステップ）も正当に評価
- 複雑な業務フロー（10ステップ以上）も柔軟に評価
- 本質的な品質指標（トレーサビリティ、テスト可能性）に注目

詳細な基準と設計判断は `docs/maturity-criteria-evolution.md`
を参照してください。

#### 整合性検証（Coherence Validation）

**循環UIパターンのサポート:**

品質評価の整合性チェックは、「一覧 → 詳細 → 一覧」のような循環パターンを正しく認識します。

```typescript
// UseCaseの画面順序: [list, form, confirm, list]
// ScreenFlowの画面集合: [list, form, confirm]
// → 循環部分を除去して比較、整合性OK
```

**検証内容:**
- 画面順序の一致性（循環を考慮）
- 遷移の完全性（すべての遷移が定義されているか）
- 開始・終了画面の一致性

**設計判断:**
- ScreenFlowはグラフ構造なので循環は遷移で表現される
- UseCaseの最後に「一覧に戻る」ステップがあっても正常

#### コンテキスト推論

成熟度レベルに基づいたステージ推論：

```typescript
// レベル4-5: production ステージ（適切な推奨事項）
// レベル1-3: poc/mvp ステージ（初期段階向け推奨）
```

これにより、高成熟度プロジェクトに不適切な「簡略化推奨」を防ぎます。

#### 推奨事項の種類

```typescript
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationCategory =
  | 'completeness'
  | 'consistency'
  | 'validity'
  | 'traceability'
  | 'maturity';
```

### 7. 型安全性の原則

**「型システムで保証できることは、ランタイムで検証しない」**

TypeScriptの型システムを最大限活用し、冗長なランタイム検証を排除します。

#### 適用例

**❌ 冗長なランタイム検証（削除済み）:**
```typescript
// relatedUseCaseは必須フィールドなので存在チェック不要
if (!screenFlow.relatedUseCase) {
  // エラー
}

// prerequisiteUseCasesは配列型なので存在チェック不要
if (useCase.prerequisiteUseCases) {
  // 処理
}
```

**✅ 型システムによる保証:**
```typescript
// relatedUseCaseは必須、非null表明で明示
const relatedUseCase = useCaseMap.get(screenFlow.relatedUseCase.id)!;

// prerequisiteUseCasesは配列（undefinedの可能性あり）、オプショナルチェーン使用
useCase.prerequisiteUseCases?.forEach(...);
```

#### メリット

1. **コードの簡潔性**: 不要なチェックを排除
2. **意図の明確化**: 非null表明で型システムへの信頼を表明
3. **保守性向上**: 型定義と実装の一致

### 8. コメント規約

#### JSDocの必須項目

公開APIには以下を含むJSDocを記述：

````typescript
/**
 * 関数の簡潔な説明（1行）
 *
 * **目的:**
 * この関数の目的を詳細に説明
 *
 * **処理内容:**
 * 1. ステップ1
 * 2. ステップ2
 *
 * **パラメータ:**
 * @param paramName - パラメータの説明
 *
 * **戻り値:**
 * @returns 戻り値の説明
 *
 * **使用例:**
 * ```typescript
 * const result = functionName(param);
 * ```
 *
 * @example
 * ```typescript
 * // さらに詳細な例
 * const complexExample = ...;
 * ```
 */
export function functionName(paramName: ParamType): ReturnType {
  // 実装
}
````

#### ファイルヘッダー

各ファイルには`@fileoverview`を記述：

````typescript
/**
 * @fileoverview モジュールの説明
 *
 * **目的:**
 * このモジュールの目的
 *
 * **主要機能:**
 * 1. 機能1
 * 2. 機能2
 *
 * **使用例:**
 * ```typescript
 * import { API } from './module.js';
 * ```
 *
 * @module path/to/module
 */
````

### 6. テストとバリデーション

#### 型チェック

```bash
# TypeScript型チェック
bun run type-check
```

#### 品質評価の自己適用

メタモデル自体も品質評価の対象です：

```bash
# メタモデルのサンプルデータで品質評価
bun run quality-assessment
```

## インスタンスプロジェクトとの違い

### メタモデル側（このプロジェクト）

- **役割**: 型定義とフレームワークの提供
- **コメント**: 詳細なAPI仕様、使用例、設計判断
- **コード例**: `{ id: 'actor-id' }`形式を使用（typedActorRefは使用不可）
- **破壊的変更**: 慎重に検討（依存プロジェクトに影響）

### インスタンス側（example-reservation等）

- **役割**: メタモデルを使った具体的な設計書
- **コメント**: 設計書固有の重要情報のみ
- **コード例**: `typedActorRef('actor-id')`が使用可能（自動生成）
- **柔軟性**: 自由に変更可能

## よくある間違い

### ❌ 間違い: メタモデルでtypedActorRef使用

```typescript
// ❌ メタモデルのコード例でこれを書かない
const actor = typedActorRef('customer');
```

**理由**:
`typedActorRef`はインスタンスプロジェクトで自動生成される関数で、メタモデルには存在しません。

### ✅ 正しい: 標準的な参照形式

```typescript
// ✅ メタモデルではこちらを使用
const actor = { id: 'customer' };
// または
const actor = Foundation.createRef<Actor>('customer');
```

## 品質保証チェックリスト

コード変更時に確認：

- [ ] TypeScript型チェックが通る
- [ ] 既存の公開APIに破壊的変更がない
- [ ] 新しい公開APIにJSDocがある
- [ ] 使用例が含まれている
- [ ] レイヤー分離が守られている
- [ ] テストケースが追加されている（該当する場合）
- [ ] READMEが更新されている（該当する場合）

## デバッグとトラブルシューティング

### 型エラーの調査

```bash
# 詳細な型情報を表示
bun run type-check --verbose
```

### 品質評価のデバッグ

```typescript
// 評価ロジックのデバッグ出力
console.log('評価中:', JSON.stringify(element, null, 2));
```

## 貢献ガイドライン

### プルリクエスト

1. 機能ブランチを作成
2. 変更を実装し、型チェックを実行
3. コミットメッセージは`feat(metamodel):`等のプレフィックスを付ける
4. PRには変更の目的と影響範囲を記載

### コミットメッセージ例

```
feat(metamodel): add actor goals field for level 5 maturity

- Add optional goals field to Actor type
- Implement actor-optimized-goals evaluation
- Update maturity assessor to check for actor goals
- Achieve level 5 (OPTIMIZED) in quality assessment

BREAKING CHANGE: None (backward compatible, goals is optional)
```

## 参考リソース

- [メインREADME](../README.md)
- [品質評価ガイド](./docs/quality-assessment-guide.md)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Bun公式ドキュメント](https://bun.sh/docs)

## AI Assistantへの追加指示

### コード生成時

1. **既存パターンを踏襲** - `src/types/`内の既存ファイルのスタイルを参考に
2. **レイヤーを意識** - 依存関係の方向を守る（Foundation → Business →
   Functional）
3. **ジェネリクスを活用** - `Ref<T>`等の型パラメータで型安全性を確保
4. **exampleは具体的に** - JSDocの例は実際に動作するコードを記述

### リファクタリング時

1. **破壊的変更に注意** - 公開APIの変更は依存プロジェクトに影響
2. **段階的に実施** - 大きな変更は複数のコミットに分割
3. **テストを先に** - リファクタリング前に既存動作をテストで固定
4. **ドキュメントも更新** - コードとドキュメントの同期を保つ

### 品質評価の改善時

1. **評価軸を明確に** - 何を評価しているのか明確に
2. **誤検知を防ぐ** - エッジケースを考慮したロジック
3. **メッセージは具体的に** - ユーザーが次のアクションを取れる推奨事項
4. **グループ化** - 類似の推奨事項はまとめて表示
