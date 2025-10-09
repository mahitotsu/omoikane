/**
 * @fileoverview 依存関係グラフ分析モデル（Dependency Graph Analysis Model）
 * 
 * **目的:**
 * メタモデル要素間の依存関係をグラフ構造でモデル化し、
 * 変更影響分析、循環依存検出、重要度計算を支援します。
 * 
 * **主要な型定義:**
 * 1. NodeType: ノードタイプ（8種類の要素タイプ）
 * 2. EdgeType: エッジタイプ（7種類の依存関係）
 * 3. GraphNode: グラフノード（要素を表現）
 * 4. GraphEdge: グラフエッジ（依存関係を表現）
 * 5. DependencyGraph: 依存関係グラフ（ノード・エッジの集合）
 * 6. CircularDependency: 循環依存情報
 * 7. ImpactAnalysisResult: 変更影響分析結果
 * 8. GraphAnalysisResult: グラフ分析総合結果
 * 
 * **グラフ理論の応用:**
 * - Kahn's Algorithm: 循環依存検出（トポロジカルソート）
 * - DFS (Depth-First Search): 変更影響分析（到達可能性）
 * - PageRank: ノード重要度計算
 * - Strongly Connected Components: 強連結成分検出
 * 
 * **用途:**
 * - 変更時の影響範囲を特定
 * - 循環依存を検出して警告
 * - 重要な要素を特定して優先順位付け
 * - アーキテクチャの健全性を評価
 * 
 * **拡張ポイント:**
 * - 新しいノードタイプを追加: NodeTypeに列挙値を追加
 * - 新しいエッジタイプを追加: EdgeTypeに列挙値を追加
 * - カスタムグラフアルゴリズムを実装
 * 
 * @module quality/maturity/dependency-graph-model
 */

// ============================================================================
// ノードタイプとエッジタイプ（Node Type and Edge Type）
// ============================================================================

/**
 * ノードタイプ
 * 
 * **用途:**
 * 依存関係グラフのノード（要素）のタイプを10種類で定義します。
 * 
 * **ノードタイプの定義:**
 * - BUSINESS_REQUIREMENT: ビジネス要件定義
 * - BUSINESS_GOAL: ビジネスゴール
 * - BUSINESS_RULE: ビジネスルール
 * - SECURITY_POLICY: セキュリティポリシー
 * - ACTOR: アクター
 * - USECASE: ユースケース
 * - USECASE_STEP: ユースケースステップ
 * - DATA_REQUIREMENT: データ要件
 * - SCREEN: 画面定義
 * - SCREEN_FLOW: 画面遷移フロー
 * 
 * **使用例:**
 * グラフ分析時に要素タイプ別の統計を取得したり、
 * タイプ別にフィルタリングしたりします。
 * 
 * **拡張方法:**
 * 新しい要素タイプを追加する場合は、ここに列挙値を追加し、
 * dependency-graph-analyzer.tsのbuildGraph関数を更新します。
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
  SCREEN = 'screen',
  SCREEN_FLOW = 'screen-flow',
}

/**
 * エッジタイプ（依存関係の種類）
 * 
 * **用途:**
 * ノード間の依存関係（エッジ）のタイプを7種類で定義します。
 * 
 * **エッジタイプの定義:**
 * - REFERENCES: 参照（弱い依存、読み取り専用）
 * - IMPLEMENTS: 実装（強い依存、実現関係）
 * - USES: 使用（中程度の依存、機能利用）
 * - CONTAINS: 包含（親子関係、構成要素）
 * - DEPENDS_ON: 依存（一般的な依存関係）
 * - AFFECTS: 影響を与える（副作用、変更伝播）
 * - TRIGGERS: トリガー（イベント発火、制御フロー）
 * 
 * **使用例:**
 * エッジタイプごとに重み付けを変えて影響度を計算したり、
 * 特定タイプのエッジだけをフィルタリングしたりします。
 * 
 * **拡張方法:**
 * 新しい依存関係タイプを追加する場合は、ここに列挙値を追加し、
 * dependency-graph-analyzer.tsのbuildGraph関数を更新します。
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

// ============================================================================
// グラフノードとエッジ（Graph Node and Edge）
// ============================================================================

/**
 * グラフノード
 * 
 * **用途:**
 * 依存関係グラフのノード（要素）を表現します。
 * 
 * **構成:**
 * - id: ノード一意識別子
 * - name: ノード名
 * - type: ノードタイプ
 * - metadata: メタデータ（priority, complexity, maturityLevelなど）
 * 
 * **使用例:**
 * ```typescript
 * const node: GraphNode = {
 *   id: 'uc-user-login',
 *   name: 'ユーザーログイン',
 *   type: NodeType.USECASE,
 *   metadata: {
 *     priority: 'high',
 *     complexity: 'medium',
 *     maturityLevel: 3
 *   }
 * };
 * ```
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
 * 
 * **用途:**
 * ノード間の依存関係（エッジ）を表現します。
 * 
 * **構成:**
 * - from: ソースノードID
 * - to: ターゲットノードID
 * - type: エッジタイプ
 * - weight: エッジの重み（影響度、オプション）
 * - label: 説明（オプション）
 * 
 * **使用例:**
 * ```typescript
 * const edge: GraphEdge = {
 *   from: 'uc-user-login',
 *   to: 'actor-user',
 *   type: EdgeType.REFERENCES,
 *   weight: 1.0,
 *   label: 'ユーザーアクターを参照'
 * };
 * ```
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

// ============================================================================
// 依存関係グラフ（Dependency Graph）
// ============================================================================

/**
 * 依存関係グラフ
 * 
 * **用途:**
 * ノードとエッジの集合で構成される依存関係グラフを表現します。
 * 
 * **構成:**
 * - nodes: ノード一覧（Map<id, GraphNode>）
 * - edges: エッジ一覧（GraphEdge[]）
 * - adjacencyList: 隣接リスト（from -> to[]、効率的な走査用）
 * - reverseAdjacencyList: 逆隣接リスト（to -> from[]、逆方向走査用）
 * 
 * **データ構造:**
 * - Map: O(1)のノード検索
 * - adjacencyList: O(1)の後続ノード取得
 * - reverseAdjacencyList: O(1)の先行ノード取得
 * 
 * **使用例:**
 * グラフアルゴリズム（DFS, BFS, トポロジカルソート）で使用されます。
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
