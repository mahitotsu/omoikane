/**
 * AI Agent推奨エンジン v2.0 - 実装
 * 
 * 成熟度・コンテキスト・依存関係を統合した推奨生成
 */

import type {
    Actor,
    BusinessRequirementDefinition,
    UseCase,
} from '../../types/index.js';
import type {
    AIAgentRecommendations,
    AIRecommendationTemplate,
    RecommendationBundle,
    RecommendationOptions,
    StructuredRecommendation
} from './ai-recommendation-model.js';
import { RecommendationCategory, RecommendationPriority } from './ai-recommendation-model.js';
import type {
    ContextApplicationResult,
    ProjectContext
} from './context-model.js';
import type {
    GraphAnalysisResult
} from './dependency-graph-model.js';
import type {
    MaturityDimension,
    MaturityLevel,
    ProjectMaturityAssessment
} from './maturity-model.js';

/**
 * AI推奨エンジン
 */
export class AIRecommendationEngine {
  private templates: AIRecommendationTemplate[] = [];
  
  constructor() {
    this.initializeBuiltInTemplates();
  }
  
  /**
 * 総合推奨を生成
   */
  generateRecommendations(data: {
    maturity?: ProjectMaturityAssessment;
    context?: ProjectContext;
    contextResult?: ContextApplicationResult;
    graph?: GraphAnalysisResult;
    requirements?: BusinessRequirementDefinition[];
    actors?: Actor[];
    useCases?: UseCase[];
  }, options: RecommendationOptions = {}): AIAgentRecommendations {
    const recommendations: StructuredRecommendation[] = [];
    
    // 1. 成熟度ベースの推奨
    if (data.maturity) {
      recommendations.push(...this.generateMaturityRecommendations(data.maturity));
    }
    
    // 2. コンテキストベースの推奨
    if (data.context && data.contextResult) {
      recommendations.push(...this.generateContextRecommendations(
        data.context,
        data.contextResult,
        data.maturity
      ));
    }
    
    // 3. 依存関係ベースの推奨
    if (data.graph) {
      recommendations.push(...this.generateDependencyRecommendations(data.graph));
    }
    
    // 4. テンプレートベースの推奨
    recommendations.push(...this.generateTemplateRecommendations(data));
    
    // フィルタリングと優先順位付け
    const filtered = this.filterRecommendations(recommendations, options);
    const prioritized = this.prioritizeRecommendations(filtered, data);
    
    // Top Nとバンドル生成
    const topPriority = prioritized.slice(0, 5);
    const quickWins = this.identifyQuickWins(prioritized);
    const longTerm = this.identifyLongTermStrategy(prioritized);
    
    const bundles = options.generateBundles
      ? this.generateBundles(prioritized, data.maturity)
      : [];
    
    return {
      timestamp: new Date().toISOString(),
      context: data.context,
      recommendations: prioritized,
      topPriority,
      bundles,
      quickWins,
      longTermStrategy: longTerm,
      summary: {
        totalRecommendations: prioritized.length,
        criticalCount: prioritized.filter(r => r.priority === 'critical').length,
        highPriorityCount: prioritized.filter(r => r.priority === 'high').length,
        estimatedTotalHours: prioritized.reduce((sum, r) => sum + r.effort.hours, 0),
        expectedMaturityIncrease: this.estimateMaturityIncrease(
          prioritized,
          data.maturity
        ),
      },
    };
  }
  
  /**
   * 成熟度評価から推奨を生成
   */
  private generateMaturityRecommendations(
    maturity: ProjectMaturityAssessment
  ): StructuredRecommendation[] {
    const recommendations: StructuredRecommendation[] = [];
    let recId = 1;
    
    // 各要素の次ステップを構造化推奨に変換
    for (const [type, elementOrArray] of Object.entries(maturity.elements)) {
      // 単一要素か配列かを判定
      const elements = Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
      
      for (const element of elements) {
        if (!element || !element.nextSteps) continue;
        
        for (const nextStep of element.nextSteps) {
          const targetLevel = (element.overallLevel + 1) as MaturityLevel;
          recommendations.push({
            id: `mat-${recId++}`,
            title: nextStep.action,
            priority: nextStep.priority as RecommendationPriority,
            category: 'quality' as RecommendationCategory,
            problem: `要素 ${element.elementId} は レベル ${targetLevel} に達していません`,
            impact: {
              scope: 'element',
              affectedElements: [element.elementId],
              severity: element.overallLevel <= 2 ? 'high' : 'medium',
            },
            solution: {
              description: nextStep.action,
              steps: this.generateStepsForNextStep(nextStep),
            },
            benefits: [
              nextStep.rationale,
              `成熟度レベル${targetLevel}に到達`,
            ],
            effort: {
              hours: this.mapPriorityToHours(nextStep.priority),
              complexity: this.mapPriorityToComplexity(nextStep.priority),
            },
            rationale: {
              maturityGap: `現在レベル${element.overallLevel}、目標レベル${targetLevel}`,
            },
          });
        }
      }
    }
    
    // プロジェクト全体の改善推奨
    if (maturity.projectLevel < 5) {
      recommendations.push(
        this.generateProjectLevelRecommendation(maturity)
      );
    }
    
    return recommendations;
  }
  
  /**
   * コンテキストから推奨を生成
   */
  private generateContextRecommendations(
    context: ProjectContext,
    contextResult: ContextApplicationResult,
    maturity?: ProjectMaturityAssessment
  ): StructuredRecommendation[] {
    const recommendations: StructuredRecommendation[] = [];
    
    // ステージ別推奨
    if (context.stage === 'poc' || context.stage === 'mvp') {
      recommendations.push({
        id: 'ctx-stage-1',
        title: 'MVP/PoCステージに適したドキュメンテーション戦略',
        priority: RecommendationPriority.MEDIUM,
        category: RecommendationCategory.MAINTAINABILITY,
        problem: '初期ステージでは過度な詳細化が開発速度を低下させる可能性',
        impact: {
          scope: 'project',
          affectedElements: [],
          severity: 'medium',
        },
        solution: {
          description: '必要最小限の文書化に集中',
          steps: [
            'コア機能のユースケースを優先',
            '前提条件と事後条件は簡潔に',
            '詳細な例外フローは実装後に追加',
          ],
        },
        benefits: [
          '開発速度の維持',
          '検証サイクルの高速化',
        ],
        effort: {
          hours: 4,
          complexity: 'simple',
        },
        rationale: {
          contextReason: `${context.stage}ステージでは実験的検証が優先`,
        },
      });
    }
    
    // クリティカリティ別推奨
    if (context.criticality === 'mission_critical' || 
        context.criticality === 'high') {
      recommendations.push({
        id: 'ctx-crit-1',
        title: 'ミッションクリティカルプロジェクトのためのトレーサビリティ強化',
        priority: RecommendationPriority.CRITICAL,
        category: RecommendationCategory.TRACEABILITY,
        problem: '高クリティカリティプロジェクトでは完全なトレーサビリティが必須',
        impact: {
          scope: 'project',
          affectedElements: [],
          severity: 'high',
        },
        solution: {
          description: '全要素間の参照関係を明示化',
          steps: [
            '各ユースケースからビジネス要件への参照を追加',
            'セキュリティポリシーの適用を明記',
            '変更履歴の記録を開始',
          ],
        },
        benefits: [
          '監査対応の向上',
          '変更影響分析の精度向上',
          'コンプライアンス要件の充足',
        ],
        effort: {
          hours: 16,
          complexity: 'moderate',
        },
        rationale: {
          contextReason: `${context.criticality}レベルでは完全な追跡性が必要`,
        },
      });
    }
    
    // 適用ルールに基づく推奨
    for (const rule of contextResult.appliedRules) {
      if (rule.id === 'finance-traceability' && maturity) {
        const traceabilityScore = maturity.overallDimensions
          .find(d => d.dimension === 'TRACEABILITY' as MaturityDimension)?.completionRate || 0;
        
        if (traceabilityScore < 0.8) {
          recommendations.push({
            id: 'ctx-rule-finance',
            title: '金融ドメイン向けトレーサビリティ改善',
            priority: 'high' as RecommendationPriority,
            category: 'traceability' as RecommendationCategory,
            problem: `トレーサビリティスコアが${(traceabilityScore * 100).toFixed(0)}%で金融基準（80%以上）未達`,
            impact: {
              scope: 'project',
              affectedElements: [],
              severity: 'high',
            },
            solution: {
              description: '金融規制要件を満たすトレーサビリティの確立',
              steps: [
                '全トランザクションフローの文書化',
                '監査ログ要件の明記',
                'コンプライアンス参照の追加',
              ],
            },
            benefits: [
              '規制監査への対応',
              'リスク管理の向上',
            ],
            effort: {
              hours: 20,
              complexity: 'complex',
            },
            rationale: {
              contextReason: '金融ドメインの規制要件',
              bestPractice: 'SOX, PCI-DSS等の監査基準',
            },
          });
        }
      }
    }
    
    return recommendations;
  }
  
  /**
   * 依存関係グラフから推奨を生成
   */
  private generateDependencyRecommendations(
    graph: GraphAnalysisResult
  ): StructuredRecommendation[] {
    const recommendations: StructuredRecommendation[] = [];
    
    // 循環依存の解消
    if (graph.circularDependencies && graph.circularDependencies.length > 0) {
      for (const cycle of graph.circularDependencies) {
        recommendations.push({
          id: `dep-cycle-${cycle.cycle[0]}`,
          title: `循環依存の解消: ${cycle.cycle.join(' → ')}`,
          priority: cycle.severity === 'high' ? RecommendationPriority.CRITICAL : RecommendationPriority.HIGH,
          category: RecommendationCategory.ARCHITECTURE,
          problem: `${cycle.length}個の要素間で循環依存が検出されました`,
          impact: {
            scope: 'module',
            affectedElements: cycle.cycle,
            severity: cycle.severity,
          },
          solution: {
            description: '依存方向を整理し、階層構造を明確化',
            steps: [
              '依存関係の方向性を分析',
              '抽象インターフェースの導入を検討',
              '循環を断ち切るリファクタリング',
            ],
          },
          benefits: [
            'アーキテクチャの明確化',
            '保守性の向上',
            'テスト容易性の改善',
          ],
          effort: {
            hours: cycle.length * 3,
            complexity: 'complex',
          },
          risks: [
            '既存の参照関係の変更が必要',
            '影響範囲の慎重な分析が必要',
          ],
          rationale: {
            dependencyIssue: '循環依存はアーキテクチャの脆弱性',
            bestPractice: '階層化アーキテクチャ原則',
          },
        });
      }
    }
    
    // 孤立ノードの統合
    if (graph.isolatedNodes && graph.isolatedNodes.length > 0) {
      recommendations.push({
        id: 'dep-isolated',
        title: `孤立要素の統合: ${graph.isolatedNodes.length}個`,
        priority: RecommendationPriority.MEDIUM,
        category: RecommendationCategory.TRACEABILITY,
        problem: '他の要素と接続されていない孤立要素が存在',
        impact: {
          scope: 'project',
          affectedElements: graph.isolatedNodes,
          severity: 'medium',
        },
        solution: {
          description: '孤立要素を既存の要素体系に統合',
          steps: [
            '各孤立要素の目的を確認',
            '関連するユースケース・要件との関連付け',
            '不要な場合は削除を検討',
          ],
        },
        benefits: [
          'トレーサビリティの向上',
          'プロジェクト全体の一貫性',
        ],
        effort: {
          hours: graph.isolatedNodes.length * 0.5,
          complexity: 'simple',
        },
        rationale: {
          dependencyIssue: '孤立要素はトレーサビリティのギャップ',
        },
      });
    }
    
    // 重要ノードの品質強化
    if (graph.nodeImportance) {
      const topNodes = graph.nodeImportance
        .filter(n => n.importance === 'high' || n.importance === 'critical')
        .slice(0, 3);
      
      for (const node of topNodes) {
        recommendations.push({
          id: `dep-critical-${node.nodeId}`,
          title: `重要要素の品質強化: ${node.nodeId}`,
          priority: RecommendationPriority.HIGH,
          category: RecommendationCategory.QUALITY,
          problem: `影響度が高い要素(入次数${node.inDegree}, 出次数${node.outDegree})の品質が重要`,
          impact: {
            scope: 'project',
            affectedElements: [node.nodeId],
            severity: 'high',
          },
          solution: {
            description: '重要要素の詳細化とテストカバレッジ向上',
            steps: [
              '詳細な仕様記述の追加',
              'エッジケースのシナリオ追加',
              'テストケースの拡充',
            ],
          },
          benefits: [
            'システム全体の安定性向上',
            '変更リスクの低減',
          ],
          effort: {
            hours: 8,
            complexity: 'moderate',
          },
          rationale: {
            dependencyIssue: `${node.inDegree}個の要素に影響を与える重要要素`,
            bestPractice: '重要要素への投資優先',
          },
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * テンプレートベースの推奨生成
   */
  private generateTemplateRecommendations(data: {
    maturity?: ProjectMaturityAssessment;
    context?: ProjectContext;
    graph?: GraphAnalysisResult;
    requirements?: BusinessRequirementDefinition[];
    actors?: Actor[];
    useCases?: UseCase[];
  }): StructuredRecommendation[] {
    const recommendations: StructuredRecommendation[] = [];
    
    for (const template of this.templates) {
      if (template.condition(data)) {
        recommendations.push(...template.generate(data));
      }
    }
    
    return recommendations;
  }
  
  /**
   * 推奨のフィルタリング
   */
  private filterRecommendations(
    recommendations: StructuredRecommendation[],
    options: RecommendationOptions
  ): StructuredRecommendation[] {
    let filtered = recommendations;
    
    if (options.minPriority) {
      const priorityOrder = [
        RecommendationPriority.CRITICAL,
        RecommendationPriority.HIGH,
        RecommendationPriority.MEDIUM,
        RecommendationPriority.LOW
      ];
      const minIndex = priorityOrder.indexOf(options.minPriority);
      filtered = filtered.filter(r => 
        priorityOrder.indexOf(r.priority) <= minIndex
      );
    }
    
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(r => 
        options.categories!.includes(r.category)
      );
    }
    
    if (options.executableOnly) {
      filtered = filtered.filter(r => 
        r.solution.executables && r.solution.executables.length > 0
      );
    }
    
    if (options.maxEffortHours) {
      filtered = filtered.filter(r => 
        r.effort.hours <= options.maxEffortHours!
      );
    }
    
    if (options.maxRecommendations) {
      filtered = filtered.slice(0, options.maxRecommendations);
    }
    
    return filtered;
  }
  
  /**
   * 推奨の優先順位付け
   */
  private prioritizeRecommendations(
    recommendations: StructuredRecommendation[],
    data: {
      maturity?: ProjectMaturityAssessment;
      context?: ProjectContext;
      graph?: GraphAnalysisResult;
    }
  ): StructuredRecommendation[] {
    return recommendations.sort((a, b) => {
      // 1. 優先度
      const priorityOrder = [
        RecommendationPriority.CRITICAL,
        RecommendationPriority.HIGH,
        RecommendationPriority.MEDIUM,
        RecommendationPriority.LOW
      ];
      const priorityDiff = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      
      // 2. 影響範囲の重大度
      const severityOrder = ['high', 'medium', 'low'];
      const severityDiff = severityOrder.indexOf(a.impact.severity) - 
                          severityOrder.indexOf(b.impact.severity);
      if (severityDiff !== 0) return severityDiff;
      
      // 3. ROI（効果/工数）
      const roiA = this.calculateROI(a);
      const roiB = this.calculateROI(b);
      if (roiA !== roiB) return roiB - roiA;
      
      // 4. 影響要素数
      const impactDiff = b.impact.affectedElements.length - a.impact.affectedElements.length;
      return impactDiff;
    });
  }
  
  /**
   * クイックウィンの特定
   */
  private identifyQuickWins(
    recommendations: StructuredRecommendation[]
  ): StructuredRecommendation[] {
    return recommendations
      .filter(r => 
        r.effort.hours <= 4 && 
        r.effort.complexity === 'simple' &&
        (r.priority === 'high' || r.priority === 'medium')
      )
      .slice(0, 5);
  }
  
  /**
   * 長期戦略推奨の特定
   */
  private identifyLongTermStrategy(
    recommendations: StructuredRecommendation[]
  ): StructuredRecommendation[] {
    return recommendations
      .filter(r => 
        r.effort.hours >= 16 &&
        r.category === 'architecture' ||
        r.impact.scope === 'project'
      )
      .slice(0, 3);
  }
  
  /**
   * 推奨バンドルの生成
   */
  private generateBundles(
    recommendations: StructuredRecommendation[],
    maturity?: ProjectMaturityAssessment
  ): RecommendationBundle[] {
    const bundles: RecommendationBundle[] = [];
    
    // カテゴリー別バンドル
    const byCategory = this.groupByCategory(recommendations);
    for (const [category, recs] of byCategory.entries()) {
      if (recs.length >= 3) {
        bundles.push({
          id: `bundle-${category}`,
          name: `${category}改善パッケージ`,
          description: `${category}に関連する推奨のまとまり`,
          recommendations: recs,
          executionOrder: recs.map(r => r.id),
          totalEffort: recs.reduce((sum, r) => sum + r.effort.hours, 0),
          expectedMaturityImprovement: {
            currentLevel: (maturity?.projectLevel || 1) as MaturityLevel,
            targetLevel: Math.min((maturity?.projectLevel || 1) + 1, 5) as MaturityLevel,
          },
        });
      }
    }
    
    return bundles;
  }
  
  /**
   * 成熟度向上の見積もり
   */
  private estimateMaturityIncrease(
    recommendations: StructuredRecommendation[],
    maturity?: ProjectMaturityAssessment
  ): number {
    if (!maturity) return 0;
    
    const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
    const highCount = recommendations.filter(r => r.priority === 'high').length;
    
    // 簡易的な見積もり: critical 1個で0.1レベル、high 1個で0.05レベル
    return Math.min(criticalCount * 0.1 + highCount * 0.05, 1.0);
  }
  
  /**
   * ROI計算
   */
  private calculateROI(rec: StructuredRecommendation): number {
    const benefitScore = rec.benefits.length * 2 + 
                        (rec.priority === 'critical' ? 10 : 
                         rec.priority === 'high' ? 5 : 2);
    const effortScore = rec.effort.hours;
    return benefitScore / Math.max(effortScore, 1);
  }
  
  /**
   * カテゴリー別グルーピング
   */
  private groupByCategory(
    recommendations: StructuredRecommendation[]
  ): Map<RecommendationCategory, StructuredRecommendation[]> {
    const map = new Map<RecommendationCategory, StructuredRecommendation[]>();
    for (const rec of recommendations) {
      if (!map.has(rec.category)) {
        map.set(rec.category, []);
      }
      map.get(rec.category)!.push(rec);
    }
    return map;
  }
  
  /**
   * ヘルパー: 優先度を時間にマップ
   */
  private mapPriorityToHours(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 2;
      case 'medium': return 8;
      case 'low': return 24;
      default: return 8;
    }
  }
  
  /**
   * ヘルパー: 優先度を複雑度にマップ
   */
  private mapPriorityToComplexity(priority: 'high' | 'medium' | 'low'): 'simple' | 'moderate' | 'complex' {
    switch (priority) {
      case 'high': return 'simple';
      case 'medium': return 'moderate';
      case 'low': return 'complex';
      default: return 'moderate';
    }
  }
  
  /**
   * ヘルパー: 工数を優先度にマップ
   */
  private mapEffortToPriority(effort: string): RecommendationPriority {
    switch (effort) {
      case 'small': return 'high' as RecommendationPriority;
      case 'medium': return 'medium' as RecommendationPriority;
      case 'large': return 'low' as RecommendationPriority;
      default: return 'medium' as RecommendationPriority;
    }
  }
  
  /**
   * ヘルパー: 次元をカテゴリーにマップ
   */
  private mapDimensionToCategory(dimension: string): RecommendationCategory {
    const mapping: Record<string, RecommendationCategory> = {
      'STRUCTURE': 'structure' as RecommendationCategory,
      'DETAIL': 'detail' as RecommendationCategory,
      'TRACEABILITY': 'traceability' as RecommendationCategory,
      'TESTABILITY': 'testability' as RecommendationCategory,
      'MAINTAINABILITY': 'maintainability' as RecommendationCategory,
    };
    return mapping[dimension] || ('quality' as RecommendationCategory);
  }
  
  /**
   * ヘルパー: 工数を時間にマップ
   */
  private mapEffortToHours(effort: string): number {
    switch (effort) {
      case 'small': return 2;
      case 'medium': return 8;
      case 'large': return 24;
      default: return 8;
    }
  }
  
  /**
   * ヘルパー: 次ステップから実行ステップを生成
   */
  private generateStepsForNextStep(nextStep: any): string[] {
    // 簡易的な実装 - 実際にはより詳細なロジックが必要
    return [
      nextStep.action,
      '実装を確認',
      'テストを実施',
    ];
  }
  
  /**
   * プロジェクトレベル改善推奨
   */
  private generateProjectLevelRecommendation(
    maturity: ProjectMaturityAssessment
  ): StructuredRecommendation {
    const currentLevel = maturity.projectLevel;
    const targetLevel = (currentLevel + 1) as MaturityLevel;
    
    return {
      id: 'mat-project-level',
      title: `プロジェクト成熟度レベル${targetLevel}への到達`,
      priority: RecommendationPriority.HIGH,
      category: RecommendationCategory.QUALITY,
      problem: `現在レベル${currentLevel}、次レベル到達には組織的改善が必要`,
      impact: {
        scope: 'project',
        affectedElements: [],
        severity: 'high',
      },
      solution: {
        description: `レベル${targetLevel}基準を満たすための包括的改善`,
        steps: [
          '最も低い次元を特定',
          'その次元の改善に集中',
          'プロセスの標準化を推進',
        ],
      },
      benefits: [
        `成熟度レベル${targetLevel}達成`,
        'プロジェクト全体の品質向上',
        'チーム能力の向上',
      ],
      effort: {
        hours: 40,
        complexity: 'complex',
      },
      rationale: {
        maturityGap: `レベル${currentLevel}→${targetLevel}には体系的アプローチが必要`,
        bestPractice: 'CMMI成熟度モデルのベストプラクティス',
      },
    };
  }
  
  /**
   * 組み込みテンプレートの初期化
   */
  private initializeBuiltInTemplates(): void {
    // テンプレート1: テストカバレッジ不足
    this.templates.push({
      id: 'test-coverage',
      condition: (data) => {
        if (!data.maturity) return false;
        const testability = data.maturity.overallDimensions
          .find(d => d.dimension === 'TESTABILITY' as MaturityDimension);
        return testability ? testability.completionRate < 0.6 : false;
      },
      generate: (data) => [{
        id: 'tmpl-test-1',
        title: 'テストシナリオの体系的追加',
        priority: RecommendationPriority.HIGH,
        category: RecommendationCategory.TESTABILITY,
        problem: 'テストカバレッジが不足しています（60%未満）',
        impact: {
          scope: 'project',
          affectedElements: [],
          severity: 'high',
        },
        solution: {
          description: 'すべてのユースケースにテストシナリオを追加',
          steps: [
            '正常系シナリオの追加',
            '主要な異常系シナリオの追加',
            'エッジケースの特定と追加',
          ],
        },
        benefits: [
          'バグ検出率の向上',
          '品質保証の強化',
        ],
        effort: {
          hours: 12,
          complexity: 'moderate',
        },
        rationale: {
          bestPractice: 'テストカバレッジ目標80%以上',
        },
      }],
    });
    
    // テンプレート2: 一貫性のない命名
    this.templates.push({
      id: 'naming-consistency',
      condition: (data) => {
        if (!data.useCases) return false;
        // 簡易チェック: ID形式の一貫性
        const ids = data.useCases.map((uc: UseCase) => uc.id);
        const patterns = new Set(ids.map((id: string) => id.replace(/[0-9]/g, '')));
        return patterns.size > 1;
      },
      generate: (data) => [{
        id: 'tmpl-naming-1',
        title: 'ID命名規則の統一',
        priority: RecommendationPriority.MEDIUM,
        category: RecommendationCategory.MAINTAINABILITY,
        problem: 'ユースケースIDの命名規則が一貫していません',
        impact: {
          scope: 'project',
          affectedElements: data.useCases?.map(uc => uc.id) || [],
          severity: 'medium',
        },
        solution: {
          description: '統一された命名規則の適用',
          steps: [
            'プロジェクト命名規則の策定',
            '既存IDのリネーム',
            '参照の更新',
          ],
        },
        benefits: [
          '可読性の向上',
          '保守性の向上',
        ],
        effort: {
          hours: 6,
          complexity: 'simple',
        },
        rationale: {
          bestPractice: '一貫した命名規則はコード品質の基本',
        },
      }],
    });
  }
}

/**
 * デフォルトエンジンのエクスポート
 */
export const defaultRecommendationEngine = new AIRecommendationEngine();
