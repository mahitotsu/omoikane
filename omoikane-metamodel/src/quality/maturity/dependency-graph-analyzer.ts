/**
 * 依存関係グラフ分析エンジン
 * 
 * メタモデルから依存関係グラフを構築し、各種分析を実行
 */

import type {
    Actor,
    BusinessRequirementDefinition,
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
import {
    EdgeType,
    NodeType
} from './dependency-graph-model.js';

/**
 * メタモデルから依存関係グラフを構築
 */
export function buildDependencyGraph(
  requirements: BusinessRequirementDefinition[],
  actors: Actor[],
  useCases: UseCase[]
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
      const primaryId = typeof uc.actors.primary === 'string' 
        ? uc.actors.primary 
        : uc.actors.primary.id;
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
    
    // 拡張・包含関係（UseCaseにこれらのプロパティがない場合はスキップ）
    // TODO: 必要に応じて実装
  });
  
  return {
    nodes,
    edges,
    adjacencyList,
    reverseAdjacencyList,
  };
}

/**
 * グラフの完全分析を実行
 */
export function analyzeGraph(graph: DependencyGraph): GraphAnalysisResult {
  const statistics = calculateStatistics(graph);
  const circularDependencies = detectCycles(graph);
  const nodeImportance = calculateNodeImportance(graph);
  const isolatedNodes = findIsolatedNodes(graph);
  const topologicalOrder = circularDependencies.length === 0 
    ? topologicalSort(graph)
    : undefined;
  
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

/**
 * 変更影響分析
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

/**
 * レイヤー分析
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
  type: EdgeType
): void {
  edges.push({ from, to, type });
  
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
        
        cycles.push({
          cycle,
          length: cycle.length,
          edgeTypes: [], // 簡略化のため省略
          severity: cycle.length <= 3 ? 'high' : cycle.length <= 5 ? 'medium' : 'low',
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
