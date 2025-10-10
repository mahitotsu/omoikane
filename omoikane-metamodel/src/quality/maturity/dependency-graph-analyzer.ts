/**
 * @fileoverview 依存関係グラフ分析エンジン（Dependency Graph Analyzer）
 *
 * **目的:**
 * メタモデル要素間の依存関係を有向グラフとして構築し、各種分析を実行します。
 *
 * **グラフ構築:**
 * - ノード: ビジネス要求、アクター、ユースケース、ビジネスゴール、ビジネスルール、セキュリティポリシー
 * - エッジ: USES（使用）、CONTAINS（包含）、REFERENCES（参照）、EXTENDS（拡張）、INCLUDES（インクルード）
 *
 * **分析機能:**
 * 1. 循環依存検出（Circular Dependencies）: トポロジカルソートで検出
 * 2. 孤立要素検出（Orphaned Elements）: 入次数・出次数が0のノード
 * 3. レイヤー分析（Layer Analysis）: トポロジカルソートによる階層化
 * 4. ノード重要度分析（Node Importance）: PageRankアルゴリズム
 * 5. 変更影響分析（Change Impact Analysis）: 依存ノードの追跡
 * 6. 統計情報（Graph Statistics）: ノード数、エッジ数、密度、平均次数
 *
 * **グラフ理論アルゴリズム:**
 * - トポロジカルソート（Kahn's Algorithm）: 循環依存検出とレイヤー分け
 * - PageRank: ノードの重要度計算
 * - DFS（深さ優先探索）: 変更影響分析
 *
 * **出力:**
 * - DependencyGraph: 構築されたグラフ
 * - GraphAnalysisResult: 全分析結果（循環依存、孤立要素、レイヤー、重要度、統計）
 *
 * **拡張ポイント:**
 * - 新しいノードタイプを追加する場合: NodeTypeに追加し、buildDependencyGraphで構築
 * - 新しいエッジタイプを追加する場合: EdgeTypeに追加し、該当箇所でaddEdge
 * - 新しい分析手法を追加する場合: analyze〇〇関数を作成し、analyzeDependencyGraphで呼び出す
 *
 * @module quality/maturity/dependency-graph-analyzer
 */

import type {
  Actor,
  BusinessRequirementDefinition,
  Screen,
  ScreenFlow,
  UseCase,
} from '../../types/index.js';
import type {
  ChangeImpactAnalysis,
  CircularDependency,
  DependencyGraph,
  GraphAnalysisResult,
  GraphEdge,
  GraphNode,
  GraphStatistics,
  LayerAnalysis,
  NodeImportance,
} from './dependency-graph-model.js';
import { EdgeType, NodeType } from './dependency-graph-model.js';

// ============================================================================
// 公開API: グラフ構築
// ============================================================================

/**
 * メタモデルから依存関係グラフを構築します。
 *
 * **構築フロー:**
 * 1. 全要素をノードとして登録（BusinessRequirement, Actor, UseCase, Goal, Rule, Policyなど）
 * 2. 要素間の関係をエッジとして登録（USES, CONTAINS, REFERENCES, EXTENDS, INCLUDESなど）
 * 3. 隣接リストを構築（効率的なグラフ探索のため）
 * 4. 逆隣接リストを構築（逆方向の探索用）
 *
 * **ノードタイプ:**
 * - BUSINESS_REQUIREMENT: ビジネス要求
 * - BUSINESS_GOAL: ビジネスゴール
 * - BUSINESS_RULE: ビジネスルール
 * - SECURITY_POLICY: セキュリティポリシー
 * - ACTOR: アクター
 * - USECASE: ユースケース
 * - SCREEN: 画面定義
 * - SCREEN_FLOW: 画面遷移フロー
 *
 * **エッジタイプ:**
 * - USES: アクターがユースケースを使用、ユースケースが画面を使用
 * - CONTAINS: 要素が別の要素を包含、フローが画面を包含
 * - REFERENCES: ユースケースが要素を参照
 * - EXTENDS: ユースケースが別のユースケースを拡張
 * - INCLUDES: ユースケースが別のユースケースをインクルード
 * - TRIGGERS: 画面遷移のトリガー
 *
 * @param requirements - ビジネス要求定義リスト
 * @param actors - アクターリスト
 * @param useCases - ユースケースリスト
 * @param screens - 画面定義リスト
 * @param screenFlows - 画面遷移フローリスト
 * @returns 構築された依存関係グラフ
 *
 * **使用例:**
 * ```typescript
 * const graph = buildDependencyGraph(requirements, actors, useCases, screens, screenFlows);
 * console.log(`ノード数: ${graph.nodes.size}, エッジ数: ${graph.edges.length}`);
 * ```
 *
 * **拡張ポイント:**
 * - 新しい要素タイプを追加する場合: ノード登録とエッジ登録のロジックを追加
 */
export function buildDependencyGraph(
  requirements: BusinessRequirementDefinition[],
  actors: Actor[],
  useCases: UseCase[],
  screens: Screen[] = [],
  screenFlows: ScreenFlow[] = []
): DependencyGraph {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const adjacencyList = new Map<string, string[]>();
  const reverseAdjacencyList = new Map<string, string[]>();

  // ノードを追加
  requirements.forEach(req => {
    addNode(nodes, req.id, req.name, NodeType.BUSINESS_REQUIREMENT);

    // ビジネスゴールをノードとして追加
    req.businessGoals?.forEach((goal, idx) => {
      const goalId = `${req.id}-goal-${idx}`;
      addNode(nodes, goalId, goal.description, NodeType.BUSINESS_GOAL);
      addEdge(edges, adjacencyList, reverseAdjacencyList, req.id, goalId, EdgeType.CONTAINS);
    });

    // ビジネスルールをノードとして追加
    req.businessRules?.forEach((rule, idx) => {
      const ruleId = `${req.id}-rule-${idx}`;
      addNode(nodes, ruleId, rule.description, NodeType.BUSINESS_RULE);
      addEdge(edges, adjacencyList, reverseAdjacencyList, req.id, ruleId, EdgeType.CONTAINS);
    });

    // セキュリティポリシーをノードとして追加
    req.securityPolicies?.forEach((policy, idx) => {
      const policyId = `${req.id}-policy-${idx}`;
      addNode(nodes, policyId, policy.description, NodeType.SECURITY_POLICY);
      addEdge(edges, adjacencyList, reverseAdjacencyList, req.id, policyId, EdgeType.CONTAINS);
    });
  });

  // アクターをノードとして追加
  actors.forEach(actor => {
    addNode(nodes, actor.id, actor.name, NodeType.ACTOR, {
      role: actor.role,
    });
  });

  // ユースケースをノードとして追加
  useCases.forEach(uc => {
    addNode(nodes, uc.id, uc.name, NodeType.USECASE, {
      priority: uc.priority,
      complexity: uc.complexity,
    });

    // アクターとの関係
    if (uc.actors?.primary) {
      const primaryId =
        typeof uc.actors.primary === 'string' ? uc.actors.primary : uc.actors.primary.id;
      addEdge(edges, adjacencyList, reverseAdjacencyList, primaryId, uc.id, EdgeType.USES);
    }
    uc.actors?.secondary?.forEach(actor => {
      const actorId = typeof actor === 'string' ? actor : actor.id;
      addEdge(edges, adjacencyList, reverseAdjacencyList, actorId, uc.id, EdgeType.USES);
    });

    // 業務要件カバレッジ
    if (uc.businessRequirementCoverage?.requirement) {
      addEdge(
        edges,
        adjacencyList,
        reverseAdjacencyList,
        uc.id,
        uc.businessRequirementCoverage.requirement.id,
        EdgeType.IMPLEMENTS
      );

      // ビジネスゴールとの関係
      uc.businessRequirementCoverage.businessGoals?.forEach(goal => {
        addEdge(edges, adjacencyList, reverseAdjacencyList, uc.id, goal.id, EdgeType.IMPLEMENTS);
      });
    }

    // ビジネスルールとの関係
    uc.businessRules?.forEach(rule => {
      addEdge(edges, adjacencyList, reverseAdjacencyList, uc.id, rule.id, EdgeType.DEPENDS_ON);
    });

    // セキュリティポリシーとの関係
    uc.securityPolicies?.forEach(policy => {
      addEdge(edges, adjacencyList, reverseAdjacencyList, uc.id, policy.id, EdgeType.DEPENDS_ON);
    });

    // ユースケースステップの画面参照
    uc.mainFlow?.forEach(step => {
      if (step.screen) {
        const screenId = typeof step.screen === 'string' ? step.screen : step.screen.id;
        addEdge(edges, adjacencyList, reverseAdjacencyList, uc.id, screenId, EdgeType.USES);
      }
    });

    // 拡張・包含関係（UseCaseにこれらのプロパティがない場合はスキップ）
    // TODO: 必要に応じて実装
  });

  // 画面をノードとして追加
  screens.forEach(screen => {
    addNode(nodes, screen.id, screen.name, NodeType.SCREEN, {
      screenType: screen.screenType,
    });
  });

  // 画面遷移フローをノードとして追加
  screenFlows.forEach(flow => {
    addNode(nodes, flow.id, flow.name, NodeType.SCREEN_FLOW);

    // フローが含む画面との関係
    flow.screens?.forEach(screen => {
      const screenId = typeof screen === 'string' ? screen : screen.id;
      addEdge(edges, adjacencyList, reverseAdjacencyList, flow.id, screenId, EdgeType.CONTAINS);
    });

    // 画面遷移（トリガー） - 双方向許可
    flow.transitions?.forEach(transition => {
      const fromId = typeof transition.from === 'string' ? transition.from : transition.from.id;
      const toId = typeof transition.to === 'string' ? transition.to : transition.to.id;
      addEdge(edges, adjacencyList, reverseAdjacencyList, fromId, toId, EdgeType.TRIGGERS, true);
    });

    // フローが関連するユースケース
    if (flow.relatedUseCase) {
      const useCaseId =
        typeof flow.relatedUseCase === 'string' ? flow.relatedUseCase : flow.relatedUseCase.id;
      addEdge(edges, adjacencyList, reverseAdjacencyList, useCaseId, flow.id, EdgeType.USES);
    }
  });

  return {
    nodes,
    edges,
    adjacencyList,
    reverseAdjacencyList,
  };
}

// ============================================================================
// 公開API: グラフ分析
// ============================================================================

/**
 * 依存関係グラフを総合的に分析します。
 *
 * **分析内容:**
 * 1. グラフ統計: ノード数、エッジ数、密度、平均次数
 * 2. 循環依存検出: トポロジカルソートで検出
 * 3. ノード重要度計算: PageRankアルゴリズム
 * 4. 孤立ノード検出: 入次数・出次数が0のノード
 * 5. トポロジカル順序: 依存関係の順序
 * 6. 警告と推奨: 品質問題の検出と改善提案
 *
 * **警告条件:**
 * - 循環依存が存在する
 * - 孤立ノードが存在する（未使用要素）
 * - 10以上の要素から依存されるノードが存在する（ハブノード）
 *
 * @param graph - 依存関係グラフ
 * @returns グラフ分析結果（統計、循環依存、重要度、孤立ノード、警告、推奨）
 *
 * **使用例:**
 * ```typescript
 * const analysis = analyzeGraph(graph);
 * console.log(`循環依存: ${analysis.circularDependencies.length}件`);
 * console.log(`孤立ノード: ${analysis.isolatedNodes.length}件`);
 * ```
 *
 * **拡張ポイント:**
 * - 新しい分析手法を追加する場合: 計算ロジックを追加し、結果に含める
 */
export function analyzeGraph(graph: DependencyGraph): GraphAnalysisResult {
  const statistics = calculateStatistics(graph);
  const circularDependencies = detectCycles(graph);
  const nodeImportance = calculateNodeImportance(graph);
  const isolatedNodes = findIsolatedNodes(graph);
  const topologicalOrder = circularDependencies.length === 0 ? topologicalSort(graph) : undefined;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 循環依存の警告
  if (circularDependencies.length > 0) {
    warnings.push(`⚠️  ${circularDependencies.length}個の循環依存が検出されました`);
    recommendations.push('循環依存を解消するため、依存関係を見直してください');
  }

  // 孤立ノードの警告
  if (isolatedNodes.length > 0) {
    warnings.push(`⚠️  ${isolatedNodes.length}個の孤立ノードが検出されました`);
    recommendations.push('孤立ノードは他の要素とのトレーサビリティが欠如しています');
  }

  // 高密度依存の警告
  const highlyDependentNodes = nodeImportance.filter(n => n.inDegree > 10);
  if (highlyDependentNodes.length > 0) {
    warnings.push(`⚠️  ${highlyDependentNodes.length}個のノードが10以上の要素から依存されています`);
    recommendations.push('依存度の高いノードの変更は大きな影響を与えます');
  }

  return {
    graph,
    statistics,
    circularDependencies,
    nodeImportance,
    isolatedNodes,
    topologicalOrder,
    warnings,
    recommendations,
  };
}

// ============================================================================
// 公開API: 変更影響分析
// ============================================================================

/**
 * 変更影響分析を実行します。
 *
 * **分析内容:**
 * 1. 直接的な影響: 変更ノードに直接依存するノード
 * 2. 間接的な影響: DFSで到達可能な全ノード
 * 3. 影響範囲の算出: ノード数、エッジ数、影響度（割合）
 * 4. 影響の深さ: 最大依存チェーンの長さ
 *
 * **使用シナリオ:**
 * - 要素を変更する前に影響範囲を予測
 * - リファクタリングの安全性を評価
 * - テストの優先順位付け（影響の大きい要素から）
 *
 * @param graph - 依存関係グラフ
 * @param changedNodeIds - 変更対象のノードIDリスト
 * @returns 変更影響分析結果（直接影響、間接影響、影響範囲、深さ）
 *
 * **使用例:**
 * ```typescript
 * const impact = analyzeChangeImpact(graph, ['UC001']);
 * console.log(`影響を受けるノード: ${impact.impactedNodes.size}件`);
 * console.log(`影響度: ${(impact.impactScope.percentage * 100).toFixed(1)}%`);
 * ```
 *
 * **拡張ポイント:**
 * - 影響の重み付けを追加する場合: ノードタイプやエッジタイプに応じて係数を乗算
 */
export function analyzeChangeImpact(
  graph: DependencyGraph,
  targetNodeId: string,
  maxDepth: number = 5
): ChangeImpactAnalysis {
  const directImpact: string[] = [];
  const indirectImpact: string[] = [];
  const impactByLevel = new Map<number, string[]>();
  const visited = new Set<string>();

  // BFS で影響範囲を探索
  const queue: Array<{ nodeId: string; level: number }> = [{ nodeId: targetNodeId, level: 0 }];
  visited.add(targetNodeId);

  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;

    if (level > maxDepth) continue;

    // このノードに依存しているノード（逆辺）を取得
    const dependents = graph.reverseAdjacencyList.get(nodeId) ?? [];

    dependents.forEach(depId => {
      if (!visited.has(depId)) {
        visited.add(depId);

        if (level === 0) {
          directImpact.push(depId);
        } else {
          indirectImpact.push(depId);
        }

        if (!impactByLevel.has(level + 1)) {
          impactByLevel.set(level + 1, []);
        }
        impactByLevel.get(level + 1)!.push(depId);

        queue.push({ nodeId: depId, level: level + 1 });
      }
    });
  }

  // 重要ノードの特定
  const criticalNodes = [...directImpact, ...indirectImpact].filter(nodeId => {
    const node = graph.nodes.get(nodeId);
    return node?.type === NodeType.USECASE || node?.type === NodeType.BUSINESS_REQUIREMENT;
  });

  // 工数見積もり
  const totalImpactCount = directImpact.length + indirectImpact.length;
  let estimatedEffort: 'small' | 'medium' | 'large' | 'xlarge';
  if (totalImpactCount === 0) {
    estimatedEffort = 'small';
  } else if (totalImpactCount <= 3) {
    estimatedEffort = 'small';
  } else if (totalImpactCount <= 10) {
    estimatedEffort = 'medium';
  } else if (totalImpactCount <= 20) {
    estimatedEffort = 'large';
  } else {
    estimatedEffort = 'xlarge';
  }

  return {
    targetNode: targetNodeId,
    directImpact,
    indirectImpact,
    totalImpactCount,
    impactByLevel,
    criticalNodes,
    estimatedEffort,
  };
}

// ============================================================================
// 公開API: レイヤー分析
// ============================================================================

/**
 * レイヤー分析を実行します。
 *
 * **分析内容:**
 * 1. トポロジカルソートによるレイヤー分け
 * 2. 各レイヤーのノードリスト
 * 3. レイヤー違反の検出（下位レイヤーが上位レイヤーに依存）
 * 4. 違反の深刻度評価
 *
 * **レイヤーの定義:**
 * - レベル0: 他に依存しないノード（最下層）
 * - レベル1: レベル0のみに依存
 * - レベルN: レベルN-1以下のみに依存
 *
 * **レイヤー違反:**
 * - 下位レイヤーが上位レイヤーに依存している場合
 * - 深刻度: レベル差に応じて判定
 *
 * @param graph - 依存関係グラフ
 * @returns レイヤー分析結果（レイヤーリスト、違反リスト）
 *
 * **使用例:**
 * ```typescript
 * const layering = analyzeLayering(graph);
 * console.log(`レイヤー数: ${layering.layers.length}`);
 * console.log(`レイヤー違反: ${layering.violations.length}件`);
 * ```
 *
 * **拡張ポイント:**
 * - レイヤー命名ルールを追加する場合: descriptionの生成ロジックを変更
 */
export function analyzeLayering(graph: DependencyGraph): LayerAnalysis {
  const layers: Array<{ level: number; nodes: string[]; description: string }> = [];
  const violations: Array<{
    from: string;
    to: string;
    fromLevel: number;
    toLevel: number;
    severity: 'high' | 'medium' | 'low';
  }> = [];

  // トポロジカルソートを基にレイヤーを決定
  const levels = new Map<string, number>();
  const queue: string[] = [];
  const inDegree = new Map<string, number>();

  // 入次数を計算
  graph.nodes.forEach((_, nodeId) => {
    const deps = graph.reverseAdjacencyList.get(nodeId) ?? [];
    inDegree.set(nodeId, deps.length);
    if (deps.length === 0) {
      queue.push(nodeId);
      levels.set(nodeId, 0);
    }
  });

  // レベルを計算
  let maxLevel = 0;
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const currentLevel = levels.get(nodeId) ?? 0;
    maxLevel = Math.max(maxLevel, currentLevel);

    const neighbors = graph.adjacencyList.get(nodeId) ?? [];
    neighbors.forEach(neighborId => {
      const currentDegree = inDegree.get(neighborId) ?? 0;
      inDegree.set(neighborId, currentDegree - 1);

      const neighborLevel = levels.get(neighborId) ?? 0;
      levels.set(neighborId, Math.max(neighborLevel, currentLevel + 1));

      if (inDegree.get(neighborId) === 0) {
        queue.push(neighborId);
      }
    });
  }

  // レイヤーごとにノードを集約
  for (let level = 0; level <= maxLevel; level++) {
    const nodesAtLevel = Array.from(levels.entries())
      .filter(([_, l]) => l === level)
      .map(([nodeId, _]) => nodeId);

    layers.push({
      level,
      nodes: nodesAtLevel,
      description: getLayerDescription(level, maxLevel),
    });
  }

  // レイヤー違反を検出
  graph.edges.forEach(edge => {
    const fromLevel = levels.get(edge.from) ?? 0;
    const toLevel = levels.get(edge.to) ?? 0;

    // 下位レイヤーが上位レイヤーに依存している場合は違反
    if (fromLevel > toLevel) {
      violations.push({
        from: edge.from,
        to: edge.to,
        fromLevel,
        toLevel,
        severity: fromLevel - toLevel > 2 ? 'high' : fromLevel - toLevel > 1 ? 'medium' : 'low',
      });
    }
  });

  // 健全性スコア
  const healthScore = violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 5);

  return {
    layers,
    violations,
    healthScore,
  };
}

// ===== ヘルパー関数 =====

function addNode(
  nodes: Map<string, GraphNode>,
  id: string,
  name: string,
  type: NodeType,
  metadata?: Record<string, unknown>
): void {
  nodes.set(id, { id, name, type, metadata });
}

function addEdge(
  edges: GraphEdge[],
  adjacencyList: Map<string, string[]>,
  reverseAdjacencyList: Map<string, string[]>,
  from: string,
  to: string,
  type: EdgeType,
  bidirectionalAllowed: boolean = false
): void {
  edges.push({ from, to, type, bidirectionalAllowed });

  if (!adjacencyList.has(from)) {
    adjacencyList.set(from, []);
  }
  adjacencyList.get(from)!.push(to);

  if (!reverseAdjacencyList.has(to)) {
    reverseAdjacencyList.set(to, []);
  }
  reverseAdjacencyList.get(to)!.push(from);
}

function calculateStatistics(graph: DependencyGraph): GraphStatistics {
  const nodesByType = new Map<NodeType, number>();
  const edgesByType = new Map<EdgeType, number>();

  graph.nodes.forEach(node => {
    nodesByType.set(node.type, (nodesByType.get(node.type) ?? 0) + 1);
  });

  graph.edges.forEach(edge => {
    edgesByType.set(edge.type, (edgesByType.get(edge.type) ?? 0) + 1);
  });

  let totalInDegree = 0;
  let totalOutDegree = 0;
  let isolatedCount = 0;

  graph.nodes.forEach((_, nodeId) => {
    const inDegree = (graph.reverseAdjacencyList.get(nodeId) ?? []).length;
    const outDegree = (graph.adjacencyList.get(nodeId) ?? []).length;

    totalInDegree += inDegree;
    totalOutDegree += outDegree;

    if (inDegree === 0 && outDegree === 0) {
      isolatedCount++;
    }
  });

  const nodeCount = graph.nodes.size;

  return {
    nodeCount,
    edgeCount: graph.edges.length,
    nodesByType,
    edgesByType,
    averageInDegree: nodeCount > 0 ? totalInDegree / nodeCount : 0,
    averageOutDegree: nodeCount > 0 ? totalOutDegree / nodeCount : 0,
    maxDepth: calculateMaxDepth(graph),
    connectedComponents: countConnectedComponents(graph),
    cycleCount: detectCycles(graph).length,
    isolatedNodes: isolatedCount,
  };
}

/**
 * 循環依存を検出（双方向許可エッジを考慮）
 *
 * **処理内容:**
 * 1. DFSで循環を検出
 * 2. 双方向許可エッジのみの循環は`info`レベルに分類
 * 3. ノードタイプに基づいて重大度を判定
 *
 * **重大度判定:**
 * - `info`: 双方向許可エッジのみの循環（画面遷移等）
 * - `critical`: ビジネス要件やアクターを含む循環
 * - `high`: 長さ3以下の循環（強い依存）
 * - `medium`: 長さ4-5の循環
 * - `low`: 長さ6以上の循環（弱い依存）
 */
function detectCycles(graph: DependencyGraph): CircularDependency[] {
  const cycles: CircularDependency[] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): void {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);

    const neighbors = graph.adjacencyList.get(nodeId) ?? [];

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        dfs(neighborId);
      } else if (recStack.has(neighborId)) {
        // 循環を検出
        const cycleStart = path.indexOf(neighborId);
        const cycle = path.slice(cycleStart);

        // 循環に含まれるエッジタイプと双方向許可を確認
        const edgeTypes: EdgeType[] = [];
        let allBidirectionalAllowed = true;

        for (let i = 0; i < cycle.length; i++) {
          const from = cycle[i];
          const to = cycle[(i + 1) % cycle.length];
          const edge = graph.edges.find(e => e.from === from && e.to === to);

          if (edge) {
            edgeTypes.push(edge.type);
            if (!edge.bidirectionalAllowed) {
              allBidirectionalAllowed = false;
            }
          }
        }

        // 重大度を計算
        const severity = calculateCycleSeverity(cycle, edgeTypes, allBidirectionalAllowed, graph);

        cycles.push({
          cycle,
          length: cycle.length,
          edgeTypes,
          severity,
        });
      }
    }

    path.pop();
    recStack.delete(nodeId);
  }

  graph.nodes.forEach((_, nodeId) => {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  });

  return cycles;
}

/**
 * 循環依存の重大度を計算
 *
 * **判定基準:**
 * 1. 双方向許可エッジのみ → `info`（設計上許容）
 * 2. ビジネス要件やアクター含む → `critical`
 * 3. 長さ3以下 → `high`
 * 4. 長さ4-5 → `medium`
 * 5. 長さ6以上 → `low`
 */
function calculateCycleSeverity(
  cycle: string[],
  edgeTypes: EdgeType[],
  allBidirectionalAllowed: boolean,
  graph: DependencyGraph
): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  // 双方向許可エッジのみの循環は情報レベル
  if (allBidirectionalAllowed) {
    return 'info';
  }

  // ノードタイプを確認
  const nodeTypes = cycle.map(id => graph.nodes.get(id)?.type).filter(Boolean);

  // ビジネス要件やアクターを含む循環は重大
  if (
    nodeTypes.includes(NodeType.BUSINESS_REQUIREMENT) ||
    nodeTypes.includes(NodeType.BUSINESS_GOAL) ||
    nodeTypes.includes(NodeType.ACTOR)
  ) {
    return 'critical';
  }

  // 長さに基づく判定
  if (cycle.length <= 3) {
    return 'high';
  } else if (cycle.length <= 5) {
    return 'medium';
  } else {
    return 'low';
  }
}

function calculateNodeImportance(graph: DependencyGraph): NodeImportance[] {
  const importance: NodeImportance[] = [];

  graph.nodes.forEach((node, nodeId) => {
    const inDegree = (graph.reverseAdjacencyList.get(nodeId) ?? []).length;
    const outDegree = (graph.adjacencyList.get(nodeId) ?? []).length;

    // 簡易的なページランク（入次数ベース）
    const pageRank = inDegree / Math.max(1, graph.nodes.size);

    // 簡易的な媒介中心性（出次数と入次数の積）
    const betweenness = inDegree * outDegree;

    let importanceLevel: 'critical' | 'high' | 'medium' | 'low';
    if (inDegree >= 10 || betweenness >= 50) {
      importanceLevel = 'critical';
    } else if (inDegree >= 5 || betweenness >= 20) {
      importanceLevel = 'high';
    } else if (inDegree >= 2 || betweenness >= 5) {
      importanceLevel = 'medium';
    } else {
      importanceLevel = 'low';
    }

    importance.push({
      nodeId,
      inDegree,
      outDegree,
      pageRank,
      betweenness,
      importance: importanceLevel,
    });
  });

  return importance.sort((a, b) => b.inDegree - a.inDegree);
}

function findIsolatedNodes(graph: DependencyGraph): string[] {
  const isolated: string[] = [];

  graph.nodes.forEach((_, nodeId) => {
    const inDegree = (graph.reverseAdjacencyList.get(nodeId) ?? []).length;
    const outDegree = (graph.adjacencyList.get(nodeId) ?? []).length;

    if (inDegree === 0 && outDegree === 0) {
      isolated.push(nodeId);
    }
  });

  return isolated;
}

function topologicalSort(graph: DependencyGraph): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = graph.adjacencyList.get(nodeId) ?? [];

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        if (!dfs(neighborId)) {
          return false; // 循環検出
        }
      } else if (recStack.has(neighborId)) {
        return false; // 循環検出
      }
    }

    recStack.delete(nodeId);
    sorted.unshift(nodeId); // 逆順に追加
    return true;
  }

  graph.nodes.forEach((_, nodeId) => {
    if (!visited.has(nodeId)) {
      if (!dfs(nodeId)) {
        return []; // 循環がある場合は空配列
      }
    }
  });

  return sorted;
}

function calculateMaxDepth(graph: DependencyGraph): number {
  let maxDepth = 0;
  const visited = new Set<string>();

  function dfs(nodeId: string, depth: number): void {
    visited.add(nodeId);
    maxDepth = Math.max(maxDepth, depth);

    const neighbors = graph.adjacencyList.get(nodeId) ?? [];
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        dfs(neighborId, depth + 1);
      }
    });
  }

  graph.nodes.forEach((_, nodeId) => {
    const inDegree = (graph.reverseAdjacencyList.get(nodeId) ?? []).length;
    if (inDegree === 0) {
      visited.clear();
      dfs(nodeId, 0);
    }
  });

  return maxDepth;
}

function countConnectedComponents(graph: DependencyGraph): number {
  const visited = new Set<string>();
  let components = 0;

  function bfs(startId: string): void {
    const queue = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const nodeId = queue.shift()!;

      // 前方・後方両方向を探索
      const neighbors = [
        ...(graph.adjacencyList.get(nodeId) ?? []),
        ...(graph.reverseAdjacencyList.get(nodeId) ?? []),
      ];

      neighbors.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      });
    }
  }

  graph.nodes.forEach((_, nodeId) => {
    if (!visited.has(nodeId)) {
      bfs(nodeId);
      components++;
    }
  });

  return components;
}

function getLayerDescription(level: number, maxLevel: number): string {
  if (level === 0) {
    return '基盤レイヤー（最下層）';
  } else if (level === maxLevel) {
    return 'プレゼンテーションレイヤー（最上層）';
  } else if (level / maxLevel < 0.33) {
    return 'ドメインレイヤー';
  } else if (level / maxLevel < 0.67) {
    return 'アプリケーションレイヤー';
  } else {
    return 'インターフェースレイヤー';
  }
}
