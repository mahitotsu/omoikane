# 推奨事項対処ガイド

## 概要

このガイドでは、品質評価レポートで提示される推奨事項の具体的な対処方法を説明します。各推奨事項に対して、問題の背景、対処手順、コード例を提供します。

## 目次

1. [アクター関連の推奨事項](#アクター関連の推奨事項)
2. [ユースケース関連の推奨事項](#ユースケース関連の推奨事項)
3. [業務要件関連の推奨事項](#業務要件関連の推奨事項)
4. [トレーサビリティ関連](#トレーサビリティ関連)
5. [成熟度レベル向上](#成熟度レベル向上)

---

## アクター関連の推奨事項

### 1. 説明の充実化

#### 推奨事項の例
```
十分な説明: 説明が50文字以上で具体的に記述されている
優先度: high
工数: 2時間
問題: 要素 capacity-planner は レベル 4 に達していません
```

#### 問題の背景
- レベル2: 説明が1文字以上（基本）
- レベル3: 説明が30文字以上（詳細）
- レベル4: 説明が50文字以上（高品質）
- レベル5: 説明が80文字以上（包括的）

説明が短いと、アクターの役割、責任範囲、ビジネス文脈が不明確になり、実装時の誤解を招きます。

#### 対処手順

1. **現状確認**
```typescript
export const capacityPlanner: Actor = {
  id: 'capacity-planner',
  name: 'キャパシティプランナー',
  description: '予約枠を管理する担当者', // 15文字 → 不足
  role: 'primary',
  responsibilities: ['予約枠の登録', '枠の削除'],
};
```

2. **改善実施**
```typescript
export const capacityPlanner: Actor = {
  id: 'capacity-planner',
  name: 'キャパシティプランナー',
  description: '予約可能な枠を作成・整理する店舗運営担当者。営業日程と提供サービスに基づいて予約枠を新規登録し、不要になった枠を削除する。枠の稼働状況を把握し、適切な予約受付キャパシティを維持することで、過剰予約や空予約を防ぐ責任を持つ。', // 96文字
  role: 'primary',
  responsibilities: [
    '予約枠の新規登録',
    '不要になった枠の削除',
    '枠情報のメンテナンス',
  ],
};
```

#### 改善のポイント
- **役割の明確化**: 何を担当するのか
- **ビジネス文脈**: なぜその役割が必要か
- **責任範囲**: どこまでの権限があるか
- **業務目標**: 何を実現するための役割か
- **リスク管理**: どんなリスクを防ぐのか

### 2. ユースケースカバレッジ

#### 推奨事項の例
```
ユースケースカバレッジ: 少なくとも1つのユースケースで使用されている
優先度: high
工数: 2時間
問題: 要素 capacity-planner は レベル 4 に達していません
```

#### 問題の背景
定義されているが、どのユースケースからも参照されていないアクターは：
- 設計漏れの可能性
- 不要な定義（削除すべき）
- 参照の記述漏れ

#### 対処手順

1. **使用状況の確認**
```bash
# アクターIDで検索
grep -r "typedActorRef('capacity-planner')" src/requirements/
```

2. **参照されていない場合の対応**

**パターンA: ユースケースに追加**
```typescript
export const capacityManagement: ReservationUseCase = {
  id: 'capacity-management',
  name: '枠管理',
  description: 'キャパシティプランナーが予約枠を登録・削除する',
  actors: {
    primary: typedActorRef('capacity-planner'), // 追加
  },
  // ...
};
```

**パターンB: 不要なアクターを削除**
```typescript
// actors.ts から該当アクターを削除
// export const unusedActor: Actor = { ... }; // 削除
```

### 3. 責務の明確化

#### 推奨事項の例
```
責務の明確化: 責務が具体的にリストアップされている
優先度: medium
工数: 1時間
問題: 要素 visitor は レベル 3 に達していません
```

#### 対処手順

改善前（1つのみ）:
```typescript
export const visitor: Actor = {
  id: 'visitor',
  name: '来店者',
  description: '店舗を利用する顧客',
  role: 'primary',
  responsibilities: ['予約を行う'], // 不足
};
```

改善後（2つ以上、具体的に）:
```typescript
export const visitor: Actor = {
  id: 'visitor',
  name: '来店者',
  description: '店舗のサービスを利用するために予約を行う顧客',
  role: 'primary',
  responsibilities: [
    '希望日時の入力',
    '希望サービス内容の指定',
    '連絡手段の確認',
    '自身の予約情報の確認・変更・取消',
  ],
};
```

---

## ユースケース関連の推奨事項

### 1. 説明の充実化（50文字以上）

#### 推奨事項の例
```
十分な説明: 説明が50文字以上で具体的に記述されている
優先度: high
工数: 2時間
問題: 要素 reservation-booking は レベル 2 に達していません
```

#### 対処手順

改善前（23文字）:
```typescript
export const reservationBooking: ReservationUseCase = {
  id: 'reservation-booking',
  name: '予約登録',
  description: '来店者が希望日時に合わせて予約を登録する',
  // ...
};
```

改善後（96文字）:
```typescript
export const reservationBooking: ReservationUseCase = {
  id: 'reservation-booking',
  name: '予約登録',
  description: '来店者が希望日時と利用サービスを選択して予約を新規登録する。営業時間外でもセルフサービスで予約を確定でき、予約番号と予約内容が画面に表示される。予約確定操作は履歴に記録され、店舗スタッフの業務リストに即座に反映される。',
  // ...
};
```

#### 改善のポイント
- **誰が**: アクター（主語）を明確に
- **何を**: 具体的なアクション
- **どのように**: 手段や条件
- **なぜ**: ビジネス価値や目的
- **結果**: 期待される成果

### 2. 事前条件・事後条件の追加

#### 推奨事項の例
```
事前条件: 事前条件が明確に定義されている
優先度: medium
工数: 1時間
```

#### 対処手順

改善前（なし）:
```typescript
export const reservationBooking: ReservationUseCase = {
  id: 'reservation-booking',
  name: '予約登録',
  // preconditions なし
  // postconditions なし
  mainFlow: [/* ... */],
};
```

改善後:
```typescript
export const reservationBooking: ReservationUseCase = {
  id: 'reservation-booking',
  name: '予約登録',
  preconditions: [
    '店舗の営業時間と提供サービスが公開されている',
    '来店者がユーザー登録やログインなしで予約ページにアクセスできる',
  ],
  postconditions: [
    '予約が確定し画面上に予約番号と内容が表示されている',
    '店舗スタッフの業務リストに予約が追加されている',
    '来店者が予約番号と連絡先で照会・変更できるページへのアクセス方法を理解している',
  ],
  mainFlow: [/* ... */],
};
```

#### 書き方のコツ

**事前条件（Preconditions）**:
- システムの状態
- ユーザーの権限
- 必要なデータの存在
- 外部システムの稼働状態

**事後条件（Postconditions）**:
- システム状態の変化
- データの作成・更新
- 通知の送信
- ユーザーの理解・認識

### 3. 代替フローの追加

#### 推奨事項の例
```
代替フロー: 代替フローが定義されている
優先度: high
工数: 4時間
```

#### 対処手順

```typescript
export const reservationBooking: ReservationUseCase = {
  // ...
  mainFlow: [
    {
      stepId: 'select-slot',
      actor: typedActorRef('visitor'),
      action: '空き枠を選択する',
      expectedResult: '選択した枠が仮押さえされる',
    },
    // ...
  ],
  alternativeFlows: [
    {
      id: 'slot-unavailable',
      name: '空き枠が確保できない',
      condition: '選択中に同じ枠が別の予約で確保された場合',
      steps: [
        {
          actor: typedActorRef('visitor'),
          action: '画面上の枠確保失敗メッセージを確認し代替候補を検討する',
          expectedResult: '選択可能な別枠が提示され再選択のガイダンスが表示される',
        },
        {
          actor: typedActorRef('visitor'),
          action: '候補から別の枠を選んで再度入力内容を確認する',
          expectedResult: '新しい枠で予約が続行される',
        },
      ],
      returnToStepId: 'select-slot',
    },
  ],
};
```

#### 代替フローの考え方
- **エラーケース**: 入力エラー、バリデーション失敗
- **例外ケース**: データ不整合、タイムアウト
- **並行処理**: 同時実行による競合
- **権限不足**: アクセス拒否
- **業務例外**: キャンセル期限超過、在庫不足

### 4. 業務要件カバレッジの追加

#### 推奨事項の例
```
業務要件カバレッジ: 業務要件との関連が明確
優先度: high
工数: 2時間
```

#### 対処手順

```typescript
export const reservationBooking: ReservationUseCase = {
  id: 'reservation-booking',
  name: '予約登録',
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [
      businessGoalRef('goal-self-service-booking'),
      businessGoalRef('goal-accurate-capacity'),
    ],
    scopeItems: [
      businessScopeRef('scope-online-booking'),
    ],
    stakeholders: [
      stakeholderRef('stakeholder-visitor'),
      stakeholderRef('stakeholder-store-staff'),
    ],
    successMetrics: [
      successMetricRef('metric-booking-completion-rate'),
    ],
    assumptions: [
      assumptionRef('assumption-manual-communications'),
    ],
    constraints: [
      constraintRef('constraint-operation-hours-visitor'),
    ],
    businessRules: [
      businessRuleRef('business-rule-visitor-single-reservation'),
    ],
    securityPolicies: [
      securityPolicyRef('security-policy-self-service-contact-verification'),
    ],
  }),
  // ...
};
```

---

## 業務要件関連の推奨事項

### 1. ステークホルダーの追加

#### 推奨事項の例
```
ステークホルダー: ステークホルダーが2人以上定義されている
優先度: medium
工数: 2時間
```

#### 対処手順

```typescript
export const reservationBusinessRequirements: BusinessRequirementDefinition = {
  id: 'reservation-business-requirements',
  name: '来店予約管理要件',
  stakeholders: [
    {
      id: 'stakeholder-visitor',
      name: '来店者',
      role: 'primary-user',
      interests: ['便利な予約', '柔軟な変更・取消'],
      influence: 'high',
    },
    {
      id: 'stakeholder-store-staff',
      name: '店舗スタッフ',
      role: 'operator',
      interests: ['効率的な予約管理', '顧客情報の把握'],
      influence: 'high',
    },
    {
      id: 'stakeholder-store-ops-manager',
      name: '店舗運営責任者',
      role: 'decision-maker',
      interests: ['売上最大化', '運営効率化', '顧客満足度向上'],
      influence: 'high',
    },
  ],
  // ...
};
```

### 2. 成功指標の定義

#### 推奨事項の例
```
成功指標: 成功指標が定義されている
優先度: high
工数: 4時間
```

#### 対処手順

```typescript
export const reservationBusinessRequirements: BusinessRequirementDefinition = {
  // ...
  successMetrics: [
    {
      id: 'metric-booking-completion-rate',
      name: '予約完了率',
      description: '予約プロセスを開始したユーザーのうち、実際に予約を完了した割合',
      target: '80%以上',
      measurement: 'Webアナリティクス（予約完了数 / 予約開始数）',
      baseline: '現状未計測',
    },
    {
      id: 'metric-slot-utilization',
      name: '枠稼働率',
      description: '提供した予約枠のうち、実際に予約が入った割合',
      target: '70%以上',
      measurement: '予約管理システムのレポート機能',
      baseline: '手動集計では約55%',
    },
  ],
  // ...
};
```

---

## トレーサビリティ関連

### ビジネスゴールとユースケースの紐付け

#### 問題の背景
トレーサビリティが低い（50%未満）場合：
- 変更影響分析が困難
- なぜその機能が必要か不明
- ROI測定ができない

#### 対処手順

1. **ビジネスゴールを確認**
```typescript
// business-requirements.ts
businessGoals: [
  {
    id: 'goal-self-service-booking',
    description: '来店者が24時間いつでも自分で予約できる',
    priority: 'high',
    successCriteria: ['予約完了率80%以上'],
  },
]
```

2. **各ユースケースに紐付け**
```typescript
// reservation-booking.ts
businessRequirementCoverage: reservationBusinessRequirementCoverage({
  requirement: businessRequirementRef('reservation-business-requirements'),
  businessGoals: [
    businessGoalRef('goal-self-service-booking'), // 紐付け
  ],
  // ...
}),
```

3. **カバレッジを確認**
```bash
bun run quality-assessment
# トレーサビリティの%を確認
```

---

## 成熟度レベル向上

### レベル2 → レベル3への到達

#### 必要な改善
- [ ] 全ユースケースの説明を50文字以上に
- [ ] 全ステップに完全な構造（stepId, actor, action, expectedResult）
- [ ] 各ユースケースに代替フローを1つ以上追加
- [ ] 業務要件カバレッジを定義
- [ ] 受け入れ基準を追加
- [ ] 複雑度を評価

#### 推奨順序
1. **クイックウィン**: 説明の拡充（各2時間）
2. **構造整備**: ステップの完全化（各1時間）
3. **関連付け**: 業務要件カバレッジ（各2時間）
4. **品質向上**: 代替フロー追加（各4時間）

### レベル3 → レベル4への到達

#### 必要な改善
- [ ] 全アクターがユースケースで使用されている
- [ ] アクターの説明を50文字以上に
- [ ] 見積工数を記録
- [ ] データ要件を定義
- [ ] 性能要件を追加
- [ ] セキュリティポリシーを関連付け
- [ ] ビジネスルールを関連付け

#### 推奨順序
1. **トレーサビリティ**: 未使用アクターの解消（各2時間）
2. **測定可能性**: 工数見積もり（各1時間）
3. **非機能要件**: データ・性能・セキュリティ（各3時間）

### レベル4 → レベル5への到達

#### 必要な改善（高難度）
- [ ] Actor型にgoalsフィールドを追加（型定義の拡張が必要）
- [ ] 全アクターの説明を80文字以上に
- [ ] UI要件を定義
- [ ] 全ステップにエラーハンドリング
- [ ] 全ステップにバリデーションルール
- [ ] ビジネス価値を20文字以上で記述

#### 推奨順序
1. **型拡張**: Actor型のgoalsフィールド追加（8時間）
2. **包括的な説明**: 80文字以上へ拡充（各2時間）
3. **詳細仕様**: エラーハンドリング・バリデーション（各要素6時間）

---

## まとめ

### 効率的な改善の進め方

1. **現状把握**
   ```bash
   bun run quality-assessment
   ```

2. **クイックウィンに着手**（4時間以内で完了）
   - 説明の拡充
   - 未使用アクターの解消
   - 事前条件・事後条件の追加

3. **最優先事項に取り組む**（重要度×影響度）
   - 影響度の高い要素（入出次数が多い）
   - 次の成熟度レベルの必須項目

4. **定期的に評価**（週次・スプリント毎）
   ```bash
   bun run quality-assessment
   # 改善の進捗を確認
   ```

5. **チームで共有**
   - レポートをレビュー会議で共有
   - 改善事例を横展開
   - ベストプラクティスを蓄積

### 質問・サポート

品質評価や改善方法について質問がある場合は、プロジェクトのIssueまたはDiscussionsで相談してください。
