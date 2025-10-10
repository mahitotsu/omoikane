# 品質メトリクス算出方法

## 概要

このドキュメントでは、Omoikane品質評価システムで使用される各種メトリクスの詳細な算出方法を説明します。

## 目次

1. [総合健全性スコア](#総合健全性スコア)
2. [5次元成熟度評価](#5次元成熟度評価)
3. [追加評価指標](#追加評価指標)
4. [依存関係分析](#依存関係分析)
5. [AI推奨事項生成](#ai推奨事項生成)

---

## 総合健全性スコア

### 計算式

```typescript
健全性スコア =
  成熟度スコア × 30% +
  完全性スコア × 25% +
  一貫性スコア × 15% +
  トレーサビリティスコア × 15% +
  アーキテクチャスコア × 15%
```

### 各構成要素

#### 1. 成熟度スコア（30%）

```typescript
成熟度スコア = (プロジェクトレベル / 5) × 100

プロジェクトレベル = min(
  全アクターの成熟度レベル,
  全ユースケースの成熟度レベル,
  業務要件の成熟度レベル
)
```

**例:**

```
アクター:
- visitor: レベル4
- storeStaff: レベル4
- capacityPlanner: レベル3  ← 最小
- systemAdmin: レベル4

ユースケース: 全てレベル3以上
業務要件: レベル3

プロジェクトレベル = min(3, 3, 3) = 3
成熟度スコア = (3 / 5) × 100 = 60点
```

#### 2. 完全性スコア（25%）

```typescript
完全性スコア = (
  満たした基準の合計重み /
  全基準の合計重み
) × 100
```

**詳細計算:**

```typescript
// 各要素の評価
for each 要素 in [アクター, ユースケース, 業務要件]:
  基準リスト = get基準(要素タイプ)

  for each 基準 in 基準リスト:
    if 基準を満たしている:
      満たした重み += 基準.weight
    全体重み += 基準.weight

完全性スコア = (満たした重み / 全体重み) × 100
```

**例:**

```
アクター基準（8個）:
- actor-initial-basic-info (weight: 1.0) ✅
- actor-repeatable-description (weight: 0.9) ✅
- actor-repeatable-role (weight: 0.8) ✅
- actor-defined-responsibilities (weight: 0.8) ✅
- actor-defined-description-detail (weight: 0.6) ✅
- actor-managed-usecase-coverage (weight: 0.9) ❌
- actor-managed-description-quality (weight: 0.7) ✅
- actor-optimized-goals (weight: 0.5) ❌

満たした重み = 1.0 + 0.9 + 0.8 + 0.8 + 0.6 + 0.7 = 4.8
全体重み = 1.0 + 0.9 + 0.8 + 0.8 + 0.6 + 0.9 + 0.7 + 0.5 = 6.2
完全性 = (4.8 / 6.2) × 100 = 77.4点
```

#### 3. 一貫性スコア（15%）

```typescript
一貫性スコア = 100 - (最大次元達成率 - 最小次元達成率) × 係数

係数 = {
  POC: 0.5,        // 初期段階は緩め
  MVP: 0.7,
  開発中: 1.0,      // 標準
  保守運用: 1.2,    // 厳しめ
}
```

**例:**

```
5次元の達成率:
- 構造: 100%  ← 最大
- 詳細: 71.7%
- トレーサビリティ: 49.5%  ← 最小
- テスト可能性: 0%
- 保守性: 0%

バラつき = 100% - 49.5% = 50.5%
一貫性スコア = 100 - (50.5 × 1.0) = 49.5点

※ バラつきが大きいと一貫性が低下
```

#### 4. トレーサビリティスコア（15%）

```typescript
トレーサビリティスコア = トレーサビリティ次元の達成率;
```

**詳細計算:**

```typescript
トレーサビリティ基準 = [
  'uc-defined-business-coverage',
  'uc-managed-security',
  'uc-managed-business-rules',
  'actor-managed-usecase-coverage',
  'br-optimized-coverage',
  // ...その他トレーサビリティ関連基準
]

満たした基準の重み合計 / 全基準の重み合計 × 100
```

#### 5. アーキテクチャスコア（15%）

```typescript
アーキテクチャスコア = (
  循環依存ペナルティ +
  孤立ノードペナルティ +
  レイヤー違反ペナルティ
)

初期値: 100点
各問題につき減点
```

**ペナルティ:**

```typescript
循環依存ペナルティ = -10点 × 循環依存数
孤立ノードペナルティ = -5点 × 孤立ノード数
レイヤー違反ペナルティ = -8点 × レイヤー違反数

最終スコア = max(0, 100 + ペナルティ合計)
```

---

## 5次元成熟度評価

### 各次元の計算方法

#### 共通計算式

```typescript
次元達成率 = (
  その次元の満たした基準の重み合計 /
  その次元の全基準の重み合計
) × 100
```

### 1. 構造の完全性 (Structure)

**対象基準:**

```typescript
// アクター
'actor-initial-basic-info'; // weight: 1.0
'actor-repeatable-role'; // weight: 0.8

// ユースケース
'uc-initial-basic-info'; // weight: 1.0
'uc-initial-actors'; // weight: 0.9
'uc-initial-flow'; // weight: 0.9

// 業務要件
'br-initial-basic-info'; // weight: 1.0
```

**計算例:**

```
アクター (4個):
- visitor: 2/2基準達成 (1.0 + 0.8 = 1.8 / 1.8)
- storeStaff: 2/2基準達成
- capacityPlanner: 2/2基準達成
- systemAdmin: 2/2基準達成

ユースケース (11個):
- 全て 3/3基準達成

業務要件 (1個):
- 1/1基準達成

構造の完全性 = 100.0%
```

### 2. 詳細度 (Detail)

**対象基準:**

```typescript
// アクター
'actor-repeatable-description'; // weight: 0.9
'actor-defined-description-detail'; // weight: 0.6
'actor-managed-description-quality'; // weight: 0.7
'actor-optimized-comprehensive-description'; // weight: 0.6

// ユースケース
'uc-repeatable-description'; // weight: 0.9
'uc-repeatable-preconditions'; // weight: 0.7
'uc-repeatable-postconditions'; // weight: 0.7
'uc-defined-step-detail'; // weight: 0.8
'uc-defined-acceptance-criteria'; // weight: 0.7
// ... 他多数
```

**計算例:**

```
アクター基準 (4個 × 4基準):
visitor:
- repeatable-description (0.9) ✅
- defined-description-detail (0.6) ✅
- managed-description-quality (0.7) ✅
- optimized-comprehensive (0.6) ✅
合計: 2.8 / 2.8

capacityPlanner:
- repeatable-description (0.9) ✅
- defined-description-detail (0.6) ✅
- managed-description-quality (0.7) ✅
- optimized-comprehensive (0.6) ✅
合計: 2.8 / 2.8

全体詳細度 = 71.7%
```

### 3. トレーサビリティ (Traceability)

**対象基準:**

```typescript
// ユースケース
'uc-defined-business-coverage'; // weight: 0.9
'uc-managed-security'; // weight: 0.7
'uc-managed-business-rules'; // weight: 0.6

// アクター
'actor-managed-usecase-coverage'; // weight: 0.9

// 業務要件
'br-optimized-coverage'; // weight: 0.8
```

**計算の鍵:**

- ユースケースが業務要件を参照しているか
- セキュリティポリシーが関連付けられているか
- ビジネスルールが紐付けられているか
- アクターがユースケースで使用されているか

### 4. テスト可能性 (Testability)

**対象基準:**

```typescript
// ユースケース
'uc-defined-acceptance-criteria'; // weight: 0.7
'uc-managed-data-requirements'; // weight: 0.6
'uc-optimized-error-handling'; // weight: 0.8
'uc-optimized-validation'; // weight: 0.7
```

**達成のポイント:**

- 受け入れ基準が明確
- データ要件が定義されている
- エラーハンドリングが記述されている
- バリデーションルールが具体的

### 5. 保守性 (Maintainability)

**対象基準:**

```typescript
// ユースケース
'uc-defined-complexity'; // weight: 0.5
'uc-managed-effort'; // weight: 0.6
'uc-optimized-ui-requirements'; // weight: 0.6
'uc-optimized-business-value'; // weight: 0.7
```

**達成のポイント:**

- 複雑度が評価されている
- 見積工数が記録されている
- UI要件が定義されている
- ビジネス価値が明記されている

---

## 追加評価指標

### 1. 成熟度スコア (Maturity)

```typescript
成熟度スコア = (プロジェクトレベル / 5) × 100
```

**レベル決定ロジック:**

```typescript
function calculateProjectLevel(
  actors: Actor[],
  useCases: UseCase[],
  requirements: BusinessRequirement[]
): MaturityLevel {
  const actorLevels = actors.map(a => assessActorLevel(a));
  const useCaseLevels = useCases.map(uc => assessUseCaseLevel(uc));
  const requirementLevel = assessRequirementLevel(requirements[0]);

  return Math.min(...actorLevels, ...useCaseLevels, requirementLevel);
}

function assessActorLevel(actor: Actor): MaturityLevel {
  let level = MaturityLevel.INITIAL;

  // レベル1から順に必須基準をチェック
  for (let l = 1; l <= 5; l++) {
    const requiredCriteria = getRequiredCriteriaForLevel('actor', l);
    const allSatisfied = requiredCriteria.every(
      c => evaluateCriterion(actor, c).satisfied
    );

    if (allSatisfied) {
      level = l;
    } else {
      break; // 満たせないレベルに到達したら終了
    }
  }

  return level;
}
```

### 2. 完全性スコア (Completeness)

```typescript
完全性スコア = (
  満たした基準の合計重み /
  全基準の合計重み
) × 100

満たした基準の合計重み = Σ(満たした基準[i].weight)
全基準の合計重み = Σ(全基準[i].weight)
```

### 3. 一貫性スコア (Consistency)

```typescript
一貫性スコア = 100 - 次元間のバラつき × 係数

次元間のバラつき = max(次元達成率) - min(次元達成率)

係数 = contextAdjustment(
  プロジェクトコンテキスト,
  開発ステージ,
  重要度
)
```

**コンテキスト調整:**

```typescript
const stageCoefficients = {
  POC: 0.5, // 初期探索段階は緩い
  MVP: 0.7, // MVPは中程度
  EARLY_DEV: 0.9, // 初期開発は標準的
  ACTIVE_DEV: 1.0, // 本格開発は標準
  MAINTENANCE: 1.2, // 保守は厳しい
};

const criticalityCoefficients = {
  LOW: 0.8,
  MEDIUM: 1.0,
  HIGH: 1.3,
  MISSION_CRITICAL: 1.5,
};
```

### 4. アーキテクチャスコア (Architecture)

```typescript
初期スコア = 100

// 循環依存ペナルティ
for each 循環依存 in dependencyGraph.cycles:
  スコア -= 10

// 孤立ノードペナルティ
for each 孤立ノード in dependencyGraph.isolatedNodes:
  スコア -= 5

// レイヤー違反ペナルティ
for each レイヤー違反 in dependencyGraph.layerViolations:
  スコア -= 8

アーキテクチャスコア = max(0, スコア)
```

---

## 依存関係分析

### グラフ構築

```typescript
// ノード: アクター、ユースケース、業務要件、ビジネスゴールなど
// エッジ: 参照関係

interface DependencyNode {
  id: string;
  type: 'actor' | 'usecase' | 'requirement' | 'goal' | ...;
  inDegree: number;   // 入次数（参照される回数）
  outDegree: number;  // 出次数（参照する回数）
}

interface DependencyEdge {
  from: string;
  to: string;
  type: 'uses' | 'covers' | 'references';
}
```

### 循環依存検出

```typescript
function detectCycles(graph: DependencyGraph): Cycle[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: Cycle[] = [];

  function dfs(nodeId: string, path: string[]): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    for (const edge of graph.getOutgoingEdges(nodeId)) {
      const neighbor = edge.to;

      if (!visited.has(neighbor)) {
        dfs(neighbor, path);
      } else if (recursionStack.has(neighbor)) {
        // 循環依存を検出
        const cycleStart = path.indexOf(neighbor);
        cycles.push({
          nodes: path.slice(cycleStart),
          severity: 'high',
        });
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  }

  return cycles;
}
```

### 孤立ノード検出

```typescript
function detectIsolatedNodes(graph: DependencyGraph): Node[] {
  return graph.nodes.filter(
    node => node.inDegree === 0 && node.outDegree === 0
  );
}
```

### レイヤー分析

```typescript
function calculateLayers(graph: DependencyGraph): LayerInfo[] {
  // トポロジカルソートでレイヤーを決定
  const layers = new Map<string, number>();
  const queue: string[] = [];

  // 入次数0のノードをレイヤー0に
  for (const node of graph.nodes) {
    if (node.inDegree === 0) {
      layers.set(node.id, 0);
      queue.push(node.id);
    }
  }

  // BFSでレイヤーを伝播
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const currentLayer = layers.get(nodeId)!;

    for (const edge of graph.getOutgoingEdges(nodeId)) {
      const neighborLayer = layers.get(edge.to) ?? -1;
      const newLayer = currentLayer + 1;

      if (newLayer > neighborLayer) {
        layers.set(edge.to, newLayer);
        queue.push(edge.to);
      }
    }
  }

  return Array.from(layers.entries()).map(([id, layer]) => ({
    nodeId: id,
    layer,
  }));
}
```

---

## AI推奨事項生成

### 推奨事項の優先順位付け

```typescript
function generateRecommendations(
  assessment: ProjectMaturityAssessment,
  context: ProjectContext
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. 次のレベルに必要な必須基準
  for (const element of assessment.elements) {
    const nextLevel = element.overallLevel + 1;
    const requiredCriteria = getRequiredCriteriaForLevel(
      element.elementType,
      nextLevel
    );

    for (const criterion of requiredCriteria) {
      if (!element.satisfiedCriteria.includes(criterion)) {
        recommendations.push({
          title: criterion.name,
          priority: 'high',
          estimatedEffort: estimateEffort(criterion),
          issue: `要素 ${element.elementId} は レベル ${nextLevel} に達していません`,
          action: criterion.description,
        });
      }
    }
  }

  // 2. 影響度の高い要素の品質問題
  const highImpactNodes = findHighImpactNodes(assessment.dependencyGraph);
  for (const node of highImpactNodes) {
    const element = findElement(node.id);
    if (element.overallLevel < 3) {
      recommendations.push({
        title: `重要要素の品質強化: ${node.id}`,
        priority: 'high',
        estimatedEffort: '8時間',
        issue: `影響度が高い要素(入次数${node.inDegree}, 出次数${node.outDegree})の品質が重要`,
      });
    }
  }

  // 3. クイックウィン（4時間以内）
  const quickWins = recommendations.filter(
    r => parseEffort(r.estimatedEffort) <= 4
  );

  return {
    all: recommendations,
    highPriority: recommendations
      .filter(r => r.priority === 'high')
      .slice(0, 5),
    quickWins: quickWins.slice(0, 5),
  };
}
```

### 工数見積もり

```typescript
function estimateEffort(criterion: MaturityCriterion): string {
  const effortMap: Record<string, string> = {
    // 説明の拡充
    'actor-repeatable-description': '1時間',
    'actor-defined-description-detail': '2時間',
    'actor-managed-description-quality': '2時間',

    // 構造の追加
    'uc-repeatable-preconditions': '1時間',
    'uc-repeatable-postconditions': '1時間',
    'uc-defined-alternative-flows': '4時間',

    // トレーサビリティ
    'uc-defined-business-coverage': '2時間',
    'actor-managed-usecase-coverage': '2時間',

    // テスト可能性
    'uc-defined-acceptance-criteria': '3時間',
    'uc-optimized-error-handling': '6時間',
    'uc-optimized-validation': '4時間',

    // 保守性
    'uc-managed-effort': '1時間',
    'uc-optimized-ui-requirements': '4時間',
    'uc-optimized-business-value': '2時間',
  };

  return effortMap[criterion.id] ?? '2時間';
}
```

---

## まとめ

### 計算の透明性

全ての指標は以下の原則に基づいて計算されます：

1. **重み付け加算**: 各基準に重要度に応じた重みを設定
2. **最小値方式**: プロジェクトレベルは最も弱い要素で決定
3. **ペナルティ方式**: アーキテクチャスコアは問題数に応じて減点
4. **コンテキスト調整**: プロジェクトの段階や重要度で係数を調整

### 再現性の確保

同じ入力に対して常に同じ結果を返します：

```bash
# 同じプロジェクトで何度実行しても同じ結果
bun run quality-assessment
# スコア: 68/100, レベル: FAIR, 成熟度: 3/5

bun run quality-assessment
# スコア: 68/100, レベル: FAIR, 成熟度: 3/5
```

### カスタマイズ

プロジェクトの特性に応じて、以下をカスタマイズ可能：

- 各基準の重み（`maturity-criteria.ts`）
- 健全性スコアの構成比率（`metrics-dashboard.ts`）
- コンテキスト別の係数（`context-model.ts`）
- 工数見積もり（`maturity-assessor.ts`）

詳細は各ソースコードのコメントを参照してください。
