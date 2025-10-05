/**
 * メトリクスダッシュボード - 実装
 * 
 * 品質メトリクスの収集、分析、可視化
 */

import type { AIAgentRecommendations } from './ai-recommendation-model.js';
import type { ProjectContext } from './context-model.js';
import type { GraphAnalysisResult } from './dependency-graph-model.js';
import type {
    MaturityDimension,
    ProjectMaturityAssessment
} from './maturity-model.js';
import type {
    ChartData,
    DashboardConfig,
    DashboardDataStore,
    DashboardReport,
    ExportOptions,
    MetricsAlert,
    MetricsComparison,
    MetricsSnapshot,
    MetricsTrend,
    ProjectHealthScore
} from './metrics-dashboard-model.js';

/**
 * メトリクスダッシュボード
 */
export class MetricsDashboard {
  private dataStore: DashboardDataStore;
  private config: DashboardConfig;
  
  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = {
      autoSnapshotInterval: config.autoSnapshotInterval || 60,
      maxSnapshots: config.maxSnapshots || 100,
      trendAnalysisPeriod: config.trendAnalysisPeriod || 30,
      healthThresholds: config.healthThresholds || {
        excellent: 90,
        good: 75,
        fair: 60,
        poor: 40,
      },
      customMetrics: config.customMetrics || [],
      exportFormats: config.exportFormats || ['json', 'markdown', 'html'],
    };
    
    this.dataStore = {
      snapshots: [],
      milestones: [],
      config: this.config,
      lastUpdated: new Date().toISOString(),
    };
  }
  
  /**
   * スナップショットを作成
   */
  createSnapshot(data: {
    maturity: ProjectMaturityAssessment;
    graph?: GraphAnalysisResult;
    recommendations?: AIAgentRecommendations;
    context?: ProjectContext;
  }): MetricsSnapshot {
    const dimensionScores = new Map<MaturityDimension, number>();
    for (const dim of data.maturity.overallDimensions) {
      dimensionScores.set(dim.dimension, dim.completionRate);
    }
    
    // 要素数をカウント
    const elementCounts = {
      businessRequirements: data.maturity.elements.businessRequirements ? 1 : 0,
      actors: Array.isArray(data.maturity.elements.actors) 
        ? data.maturity.elements.actors.length 
        : (data.maturity.elements.actors ? 1 : 0),
      useCases: Array.isArray(data.maturity.elements.useCases)
        ? data.maturity.elements.useCases.length
        : (data.maturity.elements.useCases ? 1 : 0),
    };
    
    // 未達成基準数をカウント
    let unsatisfiedCriteriaCount = 0;
    for (const [_, elementOrArray] of Object.entries(data.maturity.elements)) {
      const elements = Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
      for (const element of elements) {
        if (element && element.unsatisfiedCriteria) {
          unsatisfiedCriteriaCount += element.unsatisfiedCriteria.length;
        }
      }
    }
    
    const snapshot: MetricsSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: new Date().toISOString(),
      maturityLevel: data.maturity.projectLevel,
      dimensionScores,
      elementCounts,
      overallCompletionRate: this.calculateOverallCompletionRate(data.maturity),
      unsatisfiedCriteriaCount,
      recommendationCount: {
        total: data.recommendations?.summary.totalRecommendations || 0,
        critical: data.recommendations?.summary.criticalCount || 0,
        high: data.recommendations?.summary.highPriorityCount || 0,
      },
      graphStats: data.graph ? {
        nodeCount: data.graph.statistics.nodeCount,
        edgeCount: data.graph.statistics.edgeCount,
        circularDependencies: data.graph.circularDependencies?.length || 0,
        isolatedNodes: data.graph.isolatedNodes?.length || 0,
      } : undefined,
      context: data.context,
    };
    
    // スナップショットを保存
    this.dataStore.snapshots.push(snapshot);
    
    // 最大数を超えたら古いものを削除
    if (this.dataStore.snapshots.length > this.config.maxSnapshots!) {
      this.dataStore.snapshots.shift();
    }
    
    this.dataStore.lastUpdated = new Date().toISOString();
    
    // マイルストーンをチェック
    this.checkMilestones(snapshot);
    
    return snapshot;
  }
  
  /**
   * プロジェクト健全性スコアを計算
   */
  calculateHealthScore(snapshot: MetricsSnapshot): ProjectHealthScore {
    // カテゴリー別スコア計算
    const maturityScore = (snapshot.maturityLevel / 5) * 100;
    const completenessScore = snapshot.overallCompletionRate * 100;
    
    // 一貫性スコア（ディメンション間のばらつきが少ないほど高い）
    const dimensionValues = Array.from(snapshot.dimensionScores.values());
    const avgDimension = dimensionValues.reduce((a, b) => a + b, 0) / dimensionValues.length;
    const variance = dimensionValues.reduce((sum, val) => sum + Math.pow(val - avgDimension, 2), 0) / dimensionValues.length;
    const consistencyScore = Math.max(0, 100 - (variance * 200));
    
    // トレーサビリティスコア
    const traceabilityScore = (snapshot.dimensionScores.get('traceability' as MaturityDimension) || 0) * 100;
    
    // アーキテクチャスコア（循環依存・孤立ノードがないほど高い）
    let architectureScore = 100;
    if (snapshot.graphStats) {
      architectureScore -= snapshot.graphStats.circularDependencies * 10;
      architectureScore -= snapshot.graphStats.isolatedNodes * 5;
      architectureScore = Math.max(0, architectureScore);
    }
    
    const categories = {
      maturity: Math.round(maturityScore),
      completeness: Math.round(completenessScore),
      consistency: Math.round(consistencyScore),
      traceability: Math.round(traceabilityScore),
      architecture: Math.round(architectureScore),
    };
    
    // 総合スコア（加重平均）
    const overall = Math.round(
      maturityScore * 0.3 +
      completenessScore * 0.25 +
      consistencyScore * 0.15 +
      traceabilityScore * 0.15 +
      architectureScore * 0.15
    );
    
    // レベル判定
    let level: ProjectHealthScore['level'];
    if (overall >= this.config.healthThresholds!.excellent) {
      level = 'excellent';
    } else if (overall >= this.config.healthThresholds!.good) {
      level = 'good';
    } else if (overall >= this.config.healthThresholds!.fair) {
      level = 'fair';
    } else if (overall >= this.config.healthThresholds!.poor) {
      level = 'poor';
    } else {
      level = 'critical';
    }
    
    // 強みと弱点を特定
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    for (const [key, value] of Object.entries(categories)) {
      if (value >= 80) {
        strengths.push(`${key}: ${value}点`);
      } else if (value < 60) {
        weaknesses.push(`${key}: ${value}点`);
      }
    }
    
    // 総合評価コメント
    const assessment = this.generateHealthAssessment(overall, level, categories);
    
    return {
      overall,
      level,
      categories,
      strengths,
      weaknesses,
      assessment,
    };
  }
  
  /**
   * トレンド分析
   */
  analyzeTrend(metricName: string, period?: { start: string; end: string }): MetricsTrend | null {
    if (this.dataStore.snapshots.length < 2) {
      return null;
    }
    
    // 期間フィルタリング
    let snapshots = this.dataStore.snapshots;
    if (period) {
      const startTime = new Date(period.start).getTime();
      const endTime = new Date(period.end).getTime();
      snapshots = snapshots.filter(s => {
        const time = new Date(s.timestamp).getTime();
        return time >= startTime && time <= endTime;
      });
    }
    
    if (snapshots.length < 2) {
      return null;
    }
    
    // データポイント抽出
    const dataPoints = snapshots.map(s => ({
      timestamp: s.timestamp,
      value: this.extractMetricValue(s, metricName),
    })).filter(p => p.value !== null) as Array<{ timestamp: string; value: number }>;
    
    if (dataPoints.length === 0) {
      return null;
    }
    
    // 統計計算
    const values = dataPoints.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    // トレンド判定
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changeRate = ((lastValue - firstValue) / firstValue) * 100;
    
    let trend: 'improving' | 'stable' | 'declining';
    if (Math.abs(changeRate) < 5) {
      trend = 'stable';
    } else if (changeRate > 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }
    
    return {
      metric: metricName,
      period: {
        start: snapshots[0].timestamp,
        end: snapshots[snapshots.length - 1].timestamp,
      },
      dataPoints,
      statistics: {
        min,
        max,
        average,
        median,
        trend,
        changeRate,
      },
    };
  }
  
  /**
   * スナップショット比較
   */
  compareSnapshots(beforeId: string, afterId: string): MetricsComparison | null {
    const before = this.dataStore.snapshots.find(s => s.id === beforeId);
    const after = this.dataStore.snapshots.find(s => s.id === afterId);
    
    if (!before || !after) {
      return null;
    }
    
    // ディメンションスコア変化
    const dimensionScores = new Map();
    for (const [dim, afterScore] of after.dimensionScores.entries()) {
      const beforeScore = before.dimensionScores.get(dim) || 0;
      const change = afterScore - beforeScore;
      dimensionScores.set(dim, {
        before: beforeScore,
        after: afterScore,
        change,
        improved: change > 0,
      });
    }
    
    // 期間計算
    const beforeTime = new Date(before.timestamp).getTime();
    const afterTime = new Date(after.timestamp).getTime();
    const diffMs = afterTime - beforeTime;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    const maturityImproved = after.maturityLevel > before.maturityLevel;
    const completionImproved = after.overallCompletionRate > before.overallCompletionRate;
    
    const summary = this.generateComparisonSummary({
      maturityImproved,
      completionImproved,
      maturityChange: after.maturityLevel - before.maturityLevel,
      completionChange: after.overallCompletionRate - before.overallCompletionRate,
      days,
    });
    
    return {
      snapshots: { before, after },
      changes: {
        maturityLevel: {
          before: before.maturityLevel,
          after: after.maturityLevel,
          improved: maturityImproved,
        },
        dimensionScores,
        completionRate: {
          before: before.overallCompletionRate,
          after: after.overallCompletionRate,
          change: after.overallCompletionRate - before.overallCompletionRate,
          improved: completionImproved,
        },
      },
      duration: { days, hours },
      summary,
    };
  }
  
  /**
   * ダッシュボードレポート生成
   */
  generateReport(type: DashboardReport['type'] = 'summary'): DashboardReport {
    if (this.dataStore.snapshots.length === 0) {
      throw new Error('スナップショットがありません');
    }
    
    const latestSnapshot = this.dataStore.snapshots[this.dataStore.snapshots.length - 1];
    const currentHealth = this.calculateHealthScore(latestSnapshot);
    
    // トレンド分析
    const trends: MetricsTrend[] = [];
    const metricNames = ['maturityLevel', 'completionRate', 'recommendationCount'];
    for (const metricName of metricNames) {
      const trend = this.analyzeTrend(metricName);
      if (trend) {
        trends.push(trend);
      }
    }
    
    // 主要指標
    const keyMetrics = this.calculateKeyMetrics(latestSnapshot);
    
    // インサイト生成
    const insights = this.generateInsights(currentHealth, trends);
    
    // 次のアクション
    const nextActions = this.generateNextActions(currentHealth, latestSnapshot);
    
    return {
      id: `report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      type,
      title: `品質ダッシュボードレポート (${type})`,
      currentHealth,
      latestSnapshot,
      trends,
      milestones: this.dataStore.milestones,
      keyMetrics,
      recommendationSummary: {
        total: latestSnapshot.recommendationCount.total,
        addressed: 0, // TODO: 実装
        pending: latestSnapshot.recommendationCount.total,
        topPriority: [], // TODO: 実装
      },
      insights,
      nextActions,
    };
  }
  
  /**
   * チャートデータ生成
   */
  generateChartData(type: ChartData['type'], metricName: string): ChartData | null {
    const trend = this.analyzeTrend(metricName);
    if (!trend) {
      return null;
    }
    
    return {
      type,
      title: `${metricName} トレンド`,
      labels: trend.dataPoints.map(p => new Date(p.timestamp).toLocaleDateString('ja-JP')),
      datasets: [{
        label: metricName,
        data: trend.dataPoints.map(p => p.value),
        color: '#3b82f6',
      }],
      options: {
        xAxisLabel: '日付',
        yAxisLabel: metricName,
        showLegend: true,
      },
    };
  }
  
  /**
   * アラート生成
   */
  generateAlerts(snapshot: MetricsSnapshot): MetricsAlert[] {
    const alerts: MetricsAlert[] = [];
    
    // 成熟度レベルが低い
    if (snapshot.maturityLevel <= 2) {
      alerts.push({
        id: `alert-maturity-${Date.now()}`,
        severity: 'warning',
        message: `プロジェクト成熟度がレベル${snapshot.maturityLevel}と低い状態です`,
        triggeredAt: new Date().toISOString(),
        metric: 'maturityLevel',
        actualValue: snapshot.maturityLevel,
        recommendedAction: '成熟度向上のための推奨事項を確認してください',
      });
    }
    
    // 完成率が低い
    if (snapshot.overallCompletionRate < 0.5) {
      alerts.push({
        id: `alert-completion-${Date.now()}`,
        severity: 'error',
        message: `完成率が${(snapshot.overallCompletionRate * 100).toFixed(0)}%と低い状態です`,
        triggeredAt: new Date().toISOString(),
        metric: 'completionRate',
        threshold: 0.5,
        actualValue: snapshot.overallCompletionRate,
        recommendedAction: '未達成基準の充足を優先してください',
      });
    }
    
    // 循環依存がある
    if (snapshot.graphStats && snapshot.graphStats.circularDependencies > 0) {
      alerts.push({
        id: `alert-circular-${Date.now()}`,
        severity: 'error',
        message: `${snapshot.graphStats.circularDependencies}個の循環依存が検出されました`,
        triggeredAt: new Date().toISOString(),
        metric: 'circularDependencies',
        actualValue: snapshot.graphStats.circularDependencies,
        recommendedAction: '循環依存の解消を優先してください',
      });
    }
    
    return alerts;
  }
  
  /**
   * データエクスポート
   */
  export(options: ExportOptions): string {
    const { format, include = {} } = options;
    
    // デフォルトで全て含める
    const includeAll = {
      snapshots: include.snapshots !== false,
      trends: include.trends !== false,
      milestones: include.milestones !== false,
      recommendations: include.recommendations !== false,
      charts: include.charts !== false,
    };
    
    const data: any = {
      exportedAt: new Date().toISOString(),
      config: this.config,
    };
    
    if (includeAll.snapshots) {
      data.snapshots = this.dataStore.snapshots;
    }
    
    if (includeAll.milestones) {
      data.milestones = this.dataStore.milestones;
    }
    
    if (includeAll.trends) {
      data.trends = ['maturityLevel', 'completionRate'].map(m => this.analyzeTrend(m)).filter(Boolean);
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      
      case 'markdown':
        return this.exportAsMarkdown(data);
      
      case 'html':
        return this.exportAsHTML(data);
      
      case 'csv':
        return this.exportAsCSV(data);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  // ===== プライベートメソッド =====
  
  private calculateOverallCompletionRate(maturity: ProjectMaturityAssessment): number {
    const rates: number[] = [];
    for (const [_, elementOrArray] of Object.entries(maturity.elements)) {
      const elements = Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
      for (const element of elements) {
        if (element && element.overallCompletionRate !== undefined) {
          rates.push(element.overallCompletionRate);
        }
      }
    }
    return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  }
  
  private checkMilestones(snapshot: MetricsSnapshot): void {
    // 成熟度レベル達成
    const existingLevelMilestone = this.dataStore.milestones.find(
      m => m.type === 'maturity-level' && m.details.includes(`レベル${snapshot.maturityLevel}`)
    );
    
    if (!existingLevelMilestone && snapshot.maturityLevel >= 2) {
      this.dataStore.milestones.push({
        id: `milestone-level-${snapshot.maturityLevel}-${Date.now()}`,
        name: `成熟度レベル${snapshot.maturityLevel}達成`,
        achievedAt: snapshot.timestamp,
        type: 'maturity-level',
        details: `プロジェクトが成熟度レベル${snapshot.maturityLevel}に到達しました`,
        snapshotId: snapshot.id,
      });
    }
    
    // 完成率マイルストーン
    if (snapshot.overallCompletionRate >= 0.8) {
      const existing = this.dataStore.milestones.find(
        m => m.type === 'completion-rate' && m.details.includes('80%')
      );
      if (!existing) {
        this.dataStore.milestones.push({
          id: `milestone-completion-80-${Date.now()}`,
          name: '完成率80%達成',
          achievedAt: snapshot.timestamp,
          type: 'completion-rate',
          details: 'プロジェクト完成率が80%を超えました',
          snapshotId: snapshot.id,
        });
      }
    }
  }
  
  private extractMetricValue(snapshot: MetricsSnapshot, metricName: string): number | null {
    switch (metricName) {
      case 'maturityLevel':
        return snapshot.maturityLevel;
      case 'completionRate':
        return snapshot.overallCompletionRate;
      case 'recommendationCount':
        return snapshot.recommendationCount.total;
      case 'criticalRecommendations':
        return snapshot.recommendationCount.critical;
      case 'nodeCount':
        return snapshot.graphStats?.nodeCount || 0;
      case 'circularDependencies':
        return snapshot.graphStats?.circularDependencies || 0;
      default:
        return null;
    }
  }
  
  private generateHealthAssessment(
    overall: number,
    level: ProjectHealthScore['level'],
    categories: ProjectHealthScore['categories']
  ): string {
    const levelDescriptions = {
      excellent: '優れた品質状態です。現在のレベルを維持しつつ、さらなる改善を目指しましょう。',
      good: '良好な品質状態です。いくつかの改善余地がありますが、全体的に健全です。',
      fair: '普通の品質状態です。重点的な改善が必要な領域があります。',
      poor: '品質に課題があります。早急な改善が必要です。',
      critical: '深刻な品質問題があります。即座の対応が必要です。',
    };
    
    let assessment = levelDescriptions[level];
    
    // 最も低いカテゴリーを特定
    const lowest = Object.entries(categories).sort((a, b) => a[1] - b[1])[0];
    if (lowest[1] < 60) {
      assessment += ` 特に${lowest[0]}の改善が重要です。`;
    }
    
    return assessment;
  }
  
  private generateComparisonSummary(data: {
    maturityImproved: boolean;
    completionImproved: boolean;
    maturityChange: number;
    completionChange: number;
    days: number;
  }): string {
    const parts: string[] = [];
    
    if (data.maturityImproved) {
      parts.push(`成熟度が${data.maturityChange}レベル向上`);
    } else if (data.maturityChange < 0) {
      parts.push(`成熟度が${Math.abs(data.maturityChange)}レベル低下`);
    }
    
    if (data.completionImproved) {
      parts.push(`完成率が${(data.completionChange * 100).toFixed(1)}%向上`);
    } else if (data.completionChange < 0) {
      parts.push(`完成率が${Math.abs(data.completionChange * 100).toFixed(1)}%低下`);
    }
    
    const period = data.days > 0 ? `${data.days}日間で` : '';
    return `${period}${parts.join('、')}しました。`;
  }
  
  private calculateKeyMetrics(snapshot: MetricsSnapshot): Array<{
    name: string;
    current: number;
    previous?: number;
    change?: number;
    unit: string;
  }> {
    const metrics: Array<{
      name: string;
      current: number;
      previous?: number;
      change?: number;
      unit: string;
    }> = [
      {
        name: '成熟度レベル',
        current: snapshot.maturityLevel,
        unit: 'level',
      },
      {
        name: '完成率',
        current: Math.round(snapshot.overallCompletionRate * 100),
        unit: '%',
      },
      {
        name: '推奨事項',
        current: snapshot.recommendationCount.total,
        unit: '件',
      },
    ];
    
    // 前回の値と比較
    if (this.dataStore.snapshots.length >= 2) {
      const previous = this.dataStore.snapshots[this.dataStore.snapshots.length - 2];
      metrics[0].previous = previous.maturityLevel;
      metrics[0].change = snapshot.maturityLevel - previous.maturityLevel;
      
      metrics[1].previous = Math.round(previous.overallCompletionRate * 100);
      metrics[1].change = metrics[1].current - metrics[1].previous;
      
      metrics[2].previous = previous.recommendationCount.total;
      metrics[2].change = snapshot.recommendationCount.total - previous.recommendationCount.total;
    }
    
    return metrics;
  }
  
  private generateInsights(health: ProjectHealthScore, trends: MetricsTrend[]): string[] {
    const insights: string[] = [];
    
    // 健全性に基づくインサイト
    if (health.level === 'excellent') {
      insights.push('プロジェクトは優れた品質状態を維持しています');
    } else if (health.level === 'poor' || health.level === 'critical') {
      insights.push('プロジェクトの品質改善が急務です');
    }
    
    // トレンドに基づくインサイト
    for (const trend of trends) {
      if (trend.statistics.trend === 'improving') {
        insights.push(`${trend.metric}が改善傾向にあります（+${trend.statistics.changeRate.toFixed(1)}%）`);
      } else if (trend.statistics.trend === 'declining') {
        insights.push(`${trend.metric}が低下傾向にあります（${trend.statistics.changeRate.toFixed(1)}%）`);
      }
    }
    
    // 強みに基づくインサイト
    if (health.strengths.length > 0) {
      insights.push(`強み: ${health.strengths.join('、')}`);
    }
    
    return insights;
  }
  
  private generateNextActions(health: ProjectHealthScore, snapshot: MetricsSnapshot): string[] {
    const actions: string[] = [];
    
    // 弱点に基づくアクション
    for (const weakness of health.weaknesses) {
      actions.push(`${weakness}の改善に注力する`);
    }
    
    // 未達成基準に基づくアクション
    if (snapshot.unsatisfiedCriteriaCount > 0) {
      actions.push(`${snapshot.unsatisfiedCriteriaCount}個の未達成基準を充足する`);
    }
    
    // 推奨事項に基づくアクション
    if (snapshot.recommendationCount.critical > 0) {
      actions.push(`${snapshot.recommendationCount.critical}件のクリティカル推奨を実行する`);
    }
    
    // グラフ問題に基づくアクション
    if (snapshot.graphStats) {
      if (snapshot.graphStats.circularDependencies > 0) {
        actions.push(`${snapshot.graphStats.circularDependencies}個の循環依存を解消する`);
      }
      if (snapshot.graphStats.isolatedNodes > 0) {
        actions.push(`${snapshot.graphStats.isolatedNodes}個の孤立要素を統合する`);
      }
    }
    
    return actions.slice(0, 5); // Top 5のみ
  }
  
  private exportAsMarkdown(data: any): string {
    let md = '# 品質メトリクスダッシュボード\n\n';
    md += `エクスポート日時: ${data.exportedAt}\n\n`;
    
    if (data.snapshots && data.snapshots.length > 0) {
      md += '## スナップショット\n\n';
      const latest = data.snapshots[data.snapshots.length - 1];
      md += `- 成熟度レベル: ${latest.maturityLevel}\n`;
      md += `- 完成率: ${(latest.overallCompletionRate * 100).toFixed(1)}%\n`;
      md += `- 推奨事項: ${latest.recommendationCount.total}件\n\n`;
    }
    
    if (data.trends && data.trends.length > 0) {
      md += '## トレンド\n\n';
      for (const trend of data.trends) {
        md += `### ${trend.metric}\n`;
        md += `- トレンド: ${trend.statistics.trend}\n`;
        md += `- 変化率: ${trend.statistics.changeRate.toFixed(1)}%\n\n`;
      }
    }
    
    return md;
  }
  
  private exportAsHTML(data: any): string {
    let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Dashboard</title></head><body>';
    html += '<h1>品質メトリクスダッシュボード</h1>';
    html += `<p>エクスポート日時: ${data.exportedAt}</p>`;
    
    if (data.snapshots && data.snapshots.length > 0) {
      const latest = data.snapshots[data.snapshots.length - 1];
      html += '<h2>最新スナップショット</h2>';
      html += '<ul>';
      html += `<li>成熟度レベル: ${latest.maturityLevel}</li>`;
      html += `<li>完成率: ${(latest.overallCompletionRate * 100).toFixed(1)}%</li>`;
      html += '</ul>';
    }
    
    html += '</body></html>';
    return html;
  }
  
  private exportAsCSV(data: any): string {
    if (!data.snapshots || data.snapshots.length === 0) {
      return '';
    }
    
    let csv = 'timestamp,maturityLevel,completionRate,recommendationCount\n';
    for (const snapshot of data.snapshots) {
      csv += `${snapshot.timestamp},${snapshot.maturityLevel},${snapshot.overallCompletionRate},${snapshot.recommendationCount.total}\n`;
    }
    
    return csv;
  }
  
  /**
   * データストアを取得
   */
  getDataStore(): DashboardDataStore {
    return this.dataStore;
  }
  
  /**
   * データストアをロード
   */
  loadDataStore(store: DashboardDataStore): void {
    this.dataStore = store;
    this.config = store.config;
  }
}

/**
 * デフォルトダッシュボードのエクスポート
 */
export const defaultDashboard = new MetricsDashboard();
