/**
 * @fileoverview 成熟度評価モジュール v2.0（Maturity Assessment Module）
 * 
 * **目的:**
 * メタモデル要素とプロジェクト全体の成熟度を5段階で評価し、
 * AI推奨エンジン、コンテキスト対応評価、依存関係グラフ分析を統合した
 * 包括的な品質評価フレームワークを提供します。
 * 
 * **主要コンポーネント:**
 * 
 * 1. **成熟度評価（Maturity Assessment）:**
 *    - maturity-assessor.ts: CMMI準拠5段階評価エンジン
 *    - maturity-criteria.ts: 43の評価基準定義
 *    - maturity-model.ts: 型定義とデータモデル
 * 
 * 2. **AI推奨エンジン（AI Recommendation Engine）:**
 *    - ai-recommendation-engine.ts: 4つの推奨生成戦略（成熟度、コンテキスト、依存関係、テンプレート）
 *    - ai-recommendation-model.ts: 推奨アクションの型定義
 * 
 * 3. **コンテキスト対応評価（Context-Aware Evaluation）:**
 *    - context-engine.ts: プロジェクトコンテキストに基づく動的評価
 *    - context-model.ts: 5つのコンテキスト次元の型定義
 * 
 * 4. **依存関係グラフ分析（Dependency Graph Analysis）:**
 *    - dependency-graph-analyzer.ts: グラフ理論アルゴリズム（Kahn's, PageRank, DFS）
 *    - dependency-graph-model.ts: グラフ構造の型定義
 * 
 * 5. **メトリクスダッシュボード（Metrics Dashboard）:**
 *    - metrics-dashboard.ts: 時系列メトリクス管理、トレンド分析
 *    - metrics-dashboard-model.ts: ダッシュボードの型定義
 * 
 * **成熟度レベル（Maturity Levels）:**
 * - Level 1 (INITIAL): 初期状態、アドホック
 * - Level 2 (REPEATABLE): 反復可能、基本的なプロセス確立
 * - Level 3 (DEFINED): 定義済み、標準化されたプロセス
 * - Level 4 (MANAGED): 管理された、測定可能なプロセス
 * - Level 5 (OPTIMIZED): 最適化された、継続的改善
 * 
 * **5つの評価次元（Dimensions）:**
 * - STRUCTURE: 構造の完全性
 * - DETAIL: 詳細度
 * - TRACEABILITY: トレーサビリティ
 * - TESTABILITY: テスト容易性
 * - MAINTAINABILITY: 保守性
 * 
 * **使用例:**
 * ```typescript
 * import { 
 *   assessMaturity, 
 *   generateAIRecommendations,
 *   applyContext,
 *   buildDependencyGraph,
 *   MetricsDashboard 
 * } from './quality/maturity/index.js';
 * 
 * // 1. 成熟度評価
 * const maturityResult = assessMaturity(businessRequirements, actors, useCases);
 * console.log(`成熟度レベル: ${maturityResult.overallLevel}`);
 * 
 * // 2. コンテキスト適用
 * const context = {
 *   domain: ProjectDomain.FINANCE,
 *   stage: DevelopmentStage.PRODUCTION,
 *   teamSize: TeamSize.LARGE,
 *   criticality: ProjectCriticality.MISSION_CRITICAL
 * };
 * const contextResult = applyContext(context);
 * 
 * // 3. AI推奨生成
 * const recommendations = generateAIRecommendations(maturityResult, context);
 * console.log(`Quick Wins: ${recommendations.quickWins.length}件`);
 * 
 * // 4. 依存関係グラフ分析
 * const graph = buildDependencyGraph(businessRequirements, actors, useCases);
 * console.log(`循環依存: ${graph.circularDependencies.length}件`);
 * 
 * // 5. メトリクスダッシュボード
 * const dashboard = new MetricsDashboard();
 * const snapshot = dashboard.createSnapshot({ maturity: maturityResult });
 * const trends = dashboard.analyzeTrends();
 * ```
 * 
 * **拡張ポイント:**
 * - 新しい評価基準を追加: maturity-criteria.tsに追加
 * - 新しいコンテキスト次元を追加: context-model.tsに追加
 * - カスタム推奨戦略を追加: ai-recommendation-engine.tsに追加
 * - 新しいグラフアルゴリズムを追加: dependency-graph-analyzer.tsに追加
 * 
 * @module quality/maturity
 */

export * from './ai-recommendation-engine.js';
export * from './ai-recommendation-model.js';
export * from './coherence-validator.js';
export * from './context-engine.js';
export * from './context-model.js';
export * from './dependency-graph-analyzer.js';
export * from './dependency-graph-model.js';
export * from './maturity-assessor.js';
export * from './maturity-criteria.js';
export * from './maturity-model.js';
export * from './metrics-dashboard-model.js';
export * from './metrics-dashboard.js';


