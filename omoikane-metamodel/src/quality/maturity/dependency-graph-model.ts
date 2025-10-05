/**
 * 依存関係グラフ分析モデル
 * 
 * 要素間の依存関係を分析し、変更の影響範囲や循環依存を検出
 */

import type { Ref } from '../../types/foundation/index.js';

/**
 * ノードタイプ
 */
export enum NodeType {
  BUSINESS_REQUIREMENT = 'business-requirement',
  BUSINESS_GOAL = 'business-goal',
  BUSINESS_RULE = 'business-rule',
  SECURITY_POLICY = 'security-policy',
  ACTOR = 'actor',
  USECASE = 'usecase',
  USECASE_STEP = 'usecase-step',
  DATA_REQUIREMENT = 'data-requirement',
}

/**
 * エッジタイプ（依存関係の種類）
 */
export enum EdgeType {
  /** 参照 */
  REFERENCES = 'references',
  
  /** 実装 */
  IMPLEMENTS = 'implements',
  
  /** 使用 */
  USES = 'uses',
  
  /** 包含 */
  CONTAINS = 'contains',
  
  /** 依存 */
  DEPENDS_ON = 'depends_on',
  
  /** 影響を与える */
  AFFECTS = 'affects',
  
  /** トリガー */
  TRIGGERS = 'triggers',
}

/**
 * グラフノード
 */
export interface GraphNode {
  /** ノードID */
  id: string;
  
  /** ノード名 */
  name: string;
  
  /** ノードタイプ */
  type: NodeType;
  
  /** メタデータ */
  metadata?: {
    priority?: string;
    complexity?: string;
    maturityLevel?: number;
    [key: string]: unknown;
  };
}

/**
 * グラフエッジ（有向辺）
 */
export interface GraphEdge {
  /** ソースノードID */
  from: string;
  
  /** ターゲットノードID */
  to: string;
  
  /** エッジタイプ */
  type: EdgeType;
  
  /** エッジの重み（影響度） */
  weight?: number;
  
  /** 説明 */
  label?: string;
}

/**
 * 依存関係グラフ
 */
export interface DependencyGraph {
  /** ノード一覧 */
  nodes: Map<string, GraphNode>;
  
  /** エッジ一覧 */
  edges: GraphEdge[];
  
  /** 隣接リスト（from -> to[]） */
  adjacencyList: Map<string, string[]>;
  
  /** 逆隣接リスト（to -> from[]） */
  reverseAdjacencyList: Map<string, string[]>;
}

/**
 * パス（経路）
 */
export interface Path {
  /** 経路上のノードID */
  nodes: string[];
  
  /** 経路の長さ */
  length: number;
  
  /** 経路のタイプ */
  types: EdgeType[];
}

/**
 * 循環依存
 */
export interface CircularDependency {
  /** 循環を構成するノードID */
  cycle: string[];
  
  /** 循環の長さ */
  length: number;
  
  /** 循環に含まれるエッジタイプ */
  edgeTypes: EdgeType[];
  
  /** 重大度（長い循環ほど問題が少ない可能性） */
  severity: 'high' | 'medium' | 'low';
}

/**
 * 変更影響分析結果
 */
export interface ChangeImpactAnalysis {
  /** 変更対象ノードID */
  targetNode: string;
  
  /** 直接影響を受けるノード */
  directImpact: string[];
  
  /** 間接影響を受けるノード */
  indirectImpact: string[];
  
  /** 影響を受けるノードの総数 */
  totalImpactCount: number;
  
  /** 影響範囲のレベル別集計 */
  impactByLevel: Map<number, string[]>;
  
  /** 影響を受ける重要ノード */
  criticalNodes: string[];
  
  /** 推定変更工数 */
  estimatedEffort: 'small' | 'medium' | 'large' | 'xlarge';
}

/**
 * ノード重要度分析
 */
export interface NodeImportance {
  /** ノードID */
  nodeId: string;
  
  /** 入次数（依存されている数） */
  inDegree: number;
  
  /** 出次数（依存している数） */
  outDegree: number;
  
  /** ページランクスコア */
  pageRank: number;
  
  /** 中心性スコア（媒介中心性） */
  betweenness: number;
  
  /** 重要度ランク */
  importance: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * グラフ統計情報
 */
export interface GraphStatistics {
  /** ノード数 */
  nodeCount: number;
  
  /** エッジ数 */
  edgeCount: number;
  
  /** ノードタイプ別の数 */
  nodesByType: Map<NodeType, number>;
  
  /** エッジタイプ別の数 */
  edgesByType: Map<EdgeType, number>;
  
  /** 平均入次数 */
  averageInDegree: number;
  
  /** 平均出次数 */
  averageOutDegree: number;
  
  /** 最大依存深度 */
  maxDepth: number;
  
  /** 連結成分数 */
  connectedComponents: number;
  
  /** 循環依存の数 */
  cycleCount: number;
  
  /** 孤立ノード数（依存関係がないノード） */
  isolatedNodes: number;
}

/**
 * グラフ分析結果
 */
export interface GraphAnalysisResult {
  /** グラフ */
  graph: DependencyGraph;
  
  /** 統計情報 */
  statistics: GraphStatistics;
  
  /** 循環依存リスト */
  circularDependencies: CircularDependency[];
  
  /** ノード重要度リスト */
  nodeImportance: NodeImportance[];
  
  /** 孤立ノードリスト */
  isolatedNodes: string[];
  
  /** トポロジカルソート結果（可能な場合） */
  topologicalOrder?: string[];
  
  /** 警告メッセージ */
  warnings: string[];
  
  /** 推奨アクション */
  recommendations: string[];
}

/**
 * グラフ可視化用データ
 */
export interface GraphVisualization {
  /** ノード配置情報 */
  nodes: Array<{
    id: string;
    label: string;
    type: NodeType;
    x?: number;
    y?: number;
    size: number;
    color: string;
  }>;
  
  /** エッジ描画情報 */
  edges: Array<{
    from: string;
    to: string;
    type: EdgeType;
    label?: string;
    color: string;
    width: number;
  }>;
  
  /** グラフのメタデータ */
  metadata: {
    title: string;
    nodeCount: number;
    edgeCount: number;
    hasCycles: boolean;
  };
}

/**
 * 依存関係の強度
 */
export enum DependencyStrength {
  /** 弱い依存（参照のみ） */
  WEAK = 1,
  
  /** 中程度の依存（使用） */
  MODERATE = 2,
  
  /** 強い依存（実装・包含） */
  STRONG = 3,
  
  /** 非常に強い依存（必須） */
  CRITICAL = 4,
}

/**
 * 依存関係パターン
 */
export interface DependencyPattern {
  /** パターン名 */
  name: string;
  
  /** パターンの説明 */
  description: string;
  
  /** パターンに一致するノードのセット */
  matchingNodes: Set<string>;
  
  /** パターンの品質評価 */
  quality: 'good' | 'acceptable' | 'poor';
  
  /** 改善提案 */
  suggestions: string[];
}

/**
 * レイヤー分析結果
 */
export interface LayerAnalysis {
  /** レイヤー一覧（深さ順） */
  layers: Array<{
    level: number;
    nodes: string[];
    description: string;
  }>;
  
  /** レイヤー違反（下位レイヤーが上位レイヤーに依存） */
  violations: Array<{
    from: string;
    to: string;
    fromLevel: number;
    toLevel: number;
    severity: 'high' | 'medium' | 'low';
  }>;
  
  /** アーキテクチャの健全性スコア */
  healthScore: number;
}
