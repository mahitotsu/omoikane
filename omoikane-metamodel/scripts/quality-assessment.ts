#!/usr/bin/env bun
/**
 * @fileoverview 品質評価CLIスクリプト
 * 
 * **目的:**
 * プロジェクトの設計品質を総合的に評価し、改善推奨事項を提示します。
 * Quality Assessment Framework v2.0を使用して、成熟度レベル1〜5の評価を行います。
 * 
 * **評価項目:**
 * 1. プロジェクト成熟度評価（5レベル × 5次元）
 * 2. コンテキスト対応評価（プロジェクトの特性に応じた評価）
 * 3. 依存関係グラフ分析（要素間の関連性）
 * 4. AI推奨生成（構造化された推奨事項）
 * 5. メトリクスダッシュボード（健全性スコア、トレンド分析）
 * 
 * **出力形式:**
 * - コンソール出力（デフォルト）
 * - Markdownファイル（--export --markdown）
 * - JSONファイル（--export --json）
 * - HTMLファイル（--export --html）
 * 
 * **実行方法:**
 * ```bash
 * # 基本実行（コンソール出力）
 * bun run quality-assessment
 * 
 * # カレントディレクトリ以外のプロジェクト評価
 * bun run quality-assessment /path/to/project
 * 
 * # Markdownレポートをエクスポート
 * bun run quality-assessment --export --markdown
 * 
 * # JSON形式でエクスポート
 * bun run quality-assessment --export --json
 * 
 * # HTML形式でエクスポート
 * bun run quality-assessment --export --html
 * 
 * # ヘルプ表示
 * bun run quality-assessment --help
 * ```
 * 
 * **使用シーン:**
 * - 設計レビュー前の品質確認
 * - 継続的品質改善（CI/CD統合）
 * - プロジェクト健全性モニタリング
 * - リファクタリング優先度の判断
 * 
 * **設計原則:**
 * - ファイルの自動検出（src/ディレクトリを再帰的に走査）
 * - 型検出システムによる要素分類
 * - エラー耐性（一部のファイルが読めなくても続行）
 * 
 * @module scripts/quality-assessment
 */

import { readdir } from 'fs/promises';
import { extname, join, resolve } from 'path';
import {
    AIRecommendationEngine,
    analyzeGraph,
    applyContext,
    assessProjectMaturity,
    buildDependencyGraph,
    inferContext,
    MetricsDashboard,
} from '../src/quality/maturity/index.js';

// ============================================================================
// プロジェクトファイル検索
// ============================================================================

/**
 * プロジェクト内のTypeScriptファイルを再帰的に検索
 * 
 * **処理内容:**
 * 1. ディレクトリを再帰的に走査
 * 2. .ts拡張子のファイルを収集
 * 3. node_modulesや隠しディレクトリをスキップ
 * 4. index.tsは集約ファイルなのでスキップ（重複防止）
 * 
 * **スキップ対象:**
 * - node_modules/
 * - .git/, .vscode/ 等の隠しディレクトリ
 * - index.ts（他ファイルの集約なので）
 * 
 * @param dir - 検索開始ディレクトリ
 * @returns TypeScriptファイルパスの配列
 */
async function findProjectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...(await findProjectFiles(fullPath)));
      }
    } else if (entry.isFile() && extname(entry.name) === '.ts') {
      // index.ts は他のファイルの集約なのでスキップ
      if (entry.name !== 'index.ts') {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// ============================================================================
// TypeScriptファイルの読み込み
// ============================================================================

/**
 * TypeScriptファイルを動的インポートで読み込み
 * 
 * **処理フロー:**
 * 1. 絶対パスに変換
 * 2. file://プロトコルでURLに変換
 * 3. 動的インポート実行
 * 4. default/名前付きエクスポートを判別
 * 5. エラー時はnullを返す（エラー耐性）
 * 
 * **エクスポート判別:**
 * - defaultエクスポートがあればそれを返す
 * - 名前付きエクスポートが1つならそれを返す
 * - 名前付きエクスポートが複数なら配列で返す
 * 
 * **設計判断:**
 * - Bunのトランスパイラを利用（高速）
 * - インポートエラーは静かに無視（部分的な評価を可能に）
 * 
 * @param filePath - 読み込むTypeScriptファイルのパス
 * @returns モジュールのエクスポート、またはnull
 */
async function loadTsFile(filePath: string): Promise<any> {
  try {
    // 1. Bunのトランスパイラーでファイルを読み込み準備
    const absolutePath = resolve(filePath);
    
    // 2. 動的インポートを試行
    try {
      // file:// プロトコルを使用して絶対パスをURLに変換
      const fileUrl = `file://${absolutePath}`;
      const module = await import(fileUrl);
      
      // defaultエクスポートがあれば返す
      if (module.default) {
        return module.default;
      }
      
      // 名前付きエクスポートを配列で返す
      const namedExports = Object.keys(module)
        .filter(key => key !== 'default' && key !== '__esModule')
        .map(key => module[key])
        .filter(val => val !== undefined && val !== null);
      
      if (namedExports.length === 1) {
        return namedExports[0];
      } else if (namedExports.length > 1) {
        return namedExports;
      }
    } catch (importError) {
      // インポートに失敗した場合は静かにスキップ
      return null;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// プロジェクトデータのロード
// ============================================================================

/**
 * プロジェクトデータを読み込んで分類
 * 
 * **処理フロー:**
 * 1. プロジェクト内の全.tsファイルを検索
 * 2. 各ファイルを動的インポート
 * 3. エクスポートされたオブジェクトを型検出
 * 4. BusinessRequirement/Actor/UseCaseに分類
 * 
 * **型検出ロジック:**
 * - BusinessRequirement: businessGoalsプロパティが配列
 * - Actor: roleプロパティが存在
 * - UseCase: actorsとmainFlowプロパティが存在
 * 
 * **設計判断:**
 * - プロパティベースの型判定（typeフィールドに依存しない）
 * - 配列と単一オブジェクトの両方に対応
 * - 判定不能なオブジェクトはスキップ
 * 
 * @param projectDir - プロジェクトディレクトリ
 * @returns 分類されたプロジェクトデータ
 */
async function loadProjectData(projectDir: string) {
  const files = await findProjectFiles(projectDir);
  
  const businessRequirements: any[] = [];
  const actors: any[] = [];
  const useCases: any[] = [];

  for (const file of files) {
    const data = await loadTsFile(file);
    if (!data) continue;

    // データが配列の場合は各要素を処理、単一オブジェクトならそのまま処理
    const items = Array.isArray(data) ? data : [data];
    
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      
      // ビジネス要件の判定（businessGoalsプロパティが配列として存在）
      if (item.businessGoals && Array.isArray(item.businessGoals)) {
        businessRequirements.push(item);
      }
      // アクターの判定（roleプロパティが存在）
      else if (item.role !== undefined) {
        actors.push(item);
      }
      // ユースケースの判定（actorsプロパティとmainFlowが存在）
      else if (item.actors && item.mainFlow) {
        useCases.push(item);
      }
    }
  }
  
  return { businessRequirements, actors, useCases };
}

// ============================================================================
// 表示ユーティリティ
// ============================================================================

/**
 * 文字列の表示幅を計算（全角対応）
 * 
 * **処理内容:**
 * - 全角文字（CJK統合漢字、ひらがな、カタカナ等）: 幅2
 * - 半角文字（ASCII、ラテン文字等）: 幅1
 * 
 * **用途:**
 * 日本語を含むテキストの整形表示（表形式レポート等）
 * 
 * @param str - 測定する文字列
 * @returns 表示幅
 */
function getDisplayWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    // 全角文字の判定（簡易版）
    const code = char.charCodeAt(0);
    if (
      (code >= 0x3000 && code <= 0x9FFF) ||  // CJK統合漢字、ひらがな、カタカナ
      (code >= 0xFF00 && code <= 0xFFEF) ||  // 全角英数字
      (code >= 0xAC00 && code <= 0xD7AF)     // ハングル
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

/**
 * 表示幅を考慮したパディング
 * 
 * **処理内容:**
 * 1. 現在の表示幅を計算
 * 2. 目標幅との差分を算出
 * 3. 差分分のスペースを右側に追加
 * 
 * **用途:**
 * 表形式レポートのカラム揃え
 * 
 * @param str - パディング対象の文字列
 * @param targetWidth - 目標表示幅
 * @returns パディング済み文字列
 */
function padEndByWidth(str: string, targetWidth: number): string {
  const currentWidth = getDisplayWidth(str);
  const padding = Math.max(0, targetWidth - currentWidth);
  return str + ' '.repeat(padding);
}

// ============================================================================
// レポート表示
// ============================================================================

/**
 * 品質評価レポートv2.0をコンソールに表示
 * 
 * **表示セクション:**
 * 1. 総合健全性スコア
 * 2. 5次元成熟度評価
 * 3. グラフ分析結果
 * 4. AI推奨事項
 * 
 * **表示形式:**
 * - 絵文字を活用した視覚的表示
 * - 表形式での成熟度表示
 * - グループ化された推奨事項
 * - クイックウィンの強調表示
 * 
 * @param healthScore - 健全性スコア
 * @param maturityResult - 成熟度評価結果
 * @param graphAnalysis - グラフ分析結果
 * @param recommendations - AI推奨事項
 */
function displayV2Report(
  healthScore: any,
  maturityResult: any,
  graphAnalysis: any,
  recommendations: any
) {
  console.log('\n=== 📊 品質評価レポート v2.0 ===\n');
  
  console.log('【総合健全性スコア】');
  console.log(`  スコア:   ${healthScore.overall}/100`);
  console.log(`  レベル:   ${healthScore.level.toUpperCase()}`);
  console.log(`  成熟度:   レベル${maturityResult.projectLevel}/5\n`);
  
  console.log('【5次元成熟度評価】');
  const dimensionNames: Record<string, string> = {
    'structure': '構造の完全性',
    'detail': '詳細度',
    'traceability': 'トレーサビリティ',
    'testability': 'テスト可能性',
    'maintainability': '保守性',
  };
  
  if (maturityResult.overallDimensions && maturityResult.overallDimensions.length > 0) {
    // 次元名の最大表示幅を計算（全角文字を考慮）
    const maxNameWidth = Math.max(
      ...maturityResult.overallDimensions.map((dim: any) => 
        getDisplayWidth(dimensionNames[dim.dimension] || dim.dimension)
      )
    );
    
    for (const dim of maturityResult.overallDimensions) {
      const name = dimensionNames[dim.dimension] || dim.dimension;
      const percentage = (dim.completionRate * 100).toFixed(1);
      const satisfied = dim.evaluations.filter((e: any) => e.satisfied).length;
      const total = dim.evaluations.length;
      const bar = '█'.repeat(Math.floor(dim.completionRate * 20)) + '░'.repeat(20 - Math.floor(dim.completionRate * 20));
      const paddedName = padEndByWidth(name, maxNameWidth);
      console.log(`  ${paddedName} ${bar} ${percentage.padStart(5)}% (${satisfied}/${total})`);
    }
  } else {
    console.log('  評価なし');
  }
  console.log();
  
  console.log('【追加評価指標】');
  console.log(`  成熟度（Maturity）:         ${String(healthScore.categories.maturity).padStart(3)}点 - プロジェクトの成熟度レベル（${maturityResult.projectLevel}/5を100点換算）`);
  console.log(`  完全性（Completeness）:     ${String(healthScore.categories.completeness).padStart(3)}点 - 全要素の基準達成率`);
  console.log(`  一貫性（Consistency）:      ${String(healthScore.categories.consistency).padStart(3)}点 - 次元間のバランス`);
  console.log(`  アーキテクチャ（Architecture）: ${String(healthScore.categories.architecture).padStart(3)}点 - 依存関係の健全性\n`);
  
  console.log('【依存関係グラフ】');
  console.log(`  ノード数: ${graphAnalysis.statistics.nodeCount}`);
  console.log(`  エッジ数: ${graphAnalysis.statistics.edgeCount}`);
  console.log(`  循環依存: ${graphAnalysis.circularDependencies.length}件`);
  if (graphAnalysis.circularDependencies.length > 0) {
    console.log('  循環依存の詳細:');
    for (const cycle of graphAnalysis.circularDependencies.slice(0, 3)) {
      console.log(`    • ${cycle.join(' → ')}`);
    }
    if (graphAnalysis.circularDependencies.length > 3) {
      console.log(`    ... 他${graphAnalysis.circularDependencies.length - 3}件`);
    }
  }
  console.log(`  孤立ノード: ${graphAnalysis.isolatedNodes.length}件`);
  if (graphAnalysis.isolatedNodes.length > 0) {
    console.log('  孤立ノードの詳細:');
    for (const node of graphAnalysis.isolatedNodes.slice(0, 5)) {
      console.log(`    • ${node}`);
    }
    if (graphAnalysis.isolatedNodes.length > 5) {
      console.log(`    ... 他${graphAnalysis.isolatedNodes.length - 5}件`);
    }
  }
  console.log();
  
  console.log('【AI推奨事項】');
  console.log(`  総数: ${recommendations.recommendations.length}件`);
  console.log(`  最優先: ${recommendations.topPriority.length}件`);
  console.log(`  クイックウィン: ${recommendations.quickWins.length}件\n`);
  
  if (recommendations.topPriority.length > 0) {
    console.log('【最優先推奨事項（優先度順）】');
    console.log('※ 優先度が高く、プロジェクトへの影響が大きい改善項目\n');
    
    type TopPriority = (typeof recommendations.topPriority)[number];
    type QuickWin = (typeof recommendations.quickWins)[number];
    
    for (let i = 0; i < Math.min(5, recommendations.topPriority.length); i++) {
      const rec: TopPriority = recommendations.topPriority[i];
      const isQuickWin = recommendations.quickWins.some((qw: QuickWin) => qw.id === rec.id);
      const quickWinMark = isQuickWin ? ' ⚡' : '';
      console.log(`  ${i + 1}. ${rec.title}${quickWinMark}`);
      console.log(`     優先度: ${rec.priority} | 工数: ${rec.effort.hours}時間 | 複雑度: ${rec.effort.complexity}`);
      console.log(`     問題: ${rec.problem}`);
    }
    console.log();
  } else {
    console.log('【最優先推奨事項】');
    console.log('  なし\n');
  }
  
  if (recommendations.quickWins.length > 0) {
    console.log('【クイックウィン（工数順・すぐ着手可能）】');
    console.log('※ 工数が少なく（≤4h）、複雑度が低く、すぐに実行できる改善項目\n');
    
    // グループ化: 同じtitleの推奨をまとめる
    type QuickWin = (typeof recommendations.quickWins)[number];
    const groupedQuickWins = new Map<string, QuickWin[]>();
    for (const rec of recommendations.quickWins) {
      if (!groupedQuickWins.has(rec.title)) {
        groupedQuickWins.set(rec.title, []);
      }
      groupedQuickWins.get(rec.title)!.push(rec);
    }
    
    // グループ化された推奨を表示（最大5グループ）
    let groupCount = 0;
    for (const [title, recs] of groupedQuickWins) {
      if (groupCount >= 5) break;
      
      if (recs.length === 1) {
        // 単一の推奨
        console.log(`  • ${title} (${recs[0].effort.hours}h)`);
      } else {
        // 複数の推奨をグループ化
        const totalHours = recs.reduce((sum: number, r: QuickWin) => sum + r.effort.hours, 0);
        console.log(`  • ${title} (${recs[0].effort.hours}h × ${recs.length}件 = ${totalHours}h)`);
        
        // 対象要素を抽出
        const targets: string[] = [];
        for (const rec of recs) {
          if (rec.impact.affectedElements && rec.impact.affectedElements.length > 0) {
            targets.push(...rec.impact.affectedElements);
          }
        }
        
        if (targets.length > 0) {
          console.log(`    対象: ${targets.join(', ')}`);
        }
      }
      
      groupCount++;
    }
    console.log();
  } else {
    console.log('【クイックウィン（すぐに実行可能）】');
    console.log('  なし\n');
  }
  
  
  console.log('【強み】');
  if (healthScore.strengths && healthScore.strengths.length > 0) {
    for (const strength of healthScore.strengths) {
      console.log(`  ✓ ${strength}`);
    }
  } else {
    console.log('  特定の強みなし（全カテゴリが80点未満）');
  }
  console.log();
  
  console.log('【弱み】');
  if (healthScore.weaknesses && healthScore.weaknesses.length > 0) {
    for (const weakness of healthScore.weaknesses) {
      console.log(`  ✗ ${weakness}`);
    }
  } else {
    console.log('  特定の弱みなし（全カテゴリが60点以上）');
  }
  console.log();
}

// ============================================================================
// メイン実行処理
// ============================================================================

/**
 * 品質評価のメイン処理
 * 
 * **実行フロー:**
 * 1. プロジェクトデータの読み込み（BusinessRequirement/Actor/UseCase）
 * 2. 成熟度評価（レベル1〜5）
 * 3. コンテキスト分析（プロジェクト特性の推測）
 * 4. 依存関係グラフ分析
 * 5. AI推奨事項の生成
 * 6. メトリクススナップショットの作成
 * 7. 健全性スコアの計算
 * 8. レポート表示
 * 9. オプションでレポートエクスポート
 * 10. 警告の表示
 * 11. 終了コードの決定（品質閾値に基づく）
 * 
 * **終了コード:**
 * - 0: 品質基準を満たす（スコア75以上）
 * - 0: 改善余地あり（スコア40〜74）
 * - 1: 品質不足（スコア40未満）
 * - 1: エラー発生
 * 
 * **コマンドライン引数:**
 * - argv[2]: プロジェクトディレクトリ（省略時はカレントディレクトリ）
 * - --export: レポートをファイルにエクスポート
 * - --json/--html/--markdown: エクスポート形式
 * 
 * **設計判断:**
 * - 段階的な処理で進捗を表示
 * - エラー時は詳細を出力して終了コード1
 * - スコアに応じた適切な終了コード
 */
async function main() {
  const projectDir = process.argv[2] || process.cwd();
  console.log(`\n品質評価を実行中: ${projectDir}\n`);

  try {
    console.log('📁 プロジェクトデータを読み込んでいます...');
    const { businessRequirements, actors, useCases } = await loadProjectData(projectDir);
    console.log(`  要件定義: ${businessRequirements.length}件`);
    console.log(`  アクター: ${actors.length}件`);
    console.log(`  ユースケース: ${useCases.length}件\n`);

    console.log('📊 成熟度を評価しています...');
    const maturityResult = assessProjectMaturity(businessRequirements, actors, useCases);
    console.log(`  完了: レベル ${maturityResult.projectLevel}/5\n`);

    console.log('🎯 コンテキストを分析しています...');
    const partialContext = inferContext(projectDir, businessRequirements);
    // デフォルト値で完全なコンテキストを構築
    const context = {
      projectName: partialContext.projectName || 'Unknown Project',
      domain: partialContext.domain || 'general',
      stage: partialContext.stage || 'poc',
      teamSize: partialContext.teamSize || 'solo',
      criticality: partialContext.criticality || 'experimental',
      tags: partialContext.tags || [],
    };
    const contextResult = applyContext(context as any);
    console.log(`  完了: ${context.domain} / ${context.stage}\n`);

    console.log('🔗 依存関係を分析しています...');
    const graph = buildDependencyGraph(businessRequirements, actors, useCases);
    const graphAnalysis = analyzeGraph(graph);
    console.log(`  完了: ${graphAnalysis.statistics.nodeCount}ノード\n`);

    console.log('🤖 AI推奨事項を生成しています...');
    const recommendationEngine = new AIRecommendationEngine();
    const recommendations = recommendationEngine.generateRecommendations({
      maturity: maturityResult,
      context: context as any,
      contextResult,
      graph: graphAnalysis,
    });
    console.log(`  完了: ${recommendations.recommendations.length}件\n`);

    console.log('📈 メトリクスを記録しています...');
    const dashboard = new MetricsDashboard();
    const snapshot = dashboard.createSnapshot({
      maturity: maturityResult,
      graph: graphAnalysis,
      recommendations,
      context: context as any,
    });
    const healthScore = dashboard.calculateHealthScore(snapshot);
    console.log(`  完了\n`);

    displayV2Report(healthScore, maturityResult, graphAnalysis, recommendations);

    if (process.argv.includes('--export')) {
      const format = process.argv.includes('--html') ? 'html' :
                     process.argv.includes('--json') ? 'json' : 'markdown';
      const exported = dashboard.export({ format });
      const fs = await import('fs/promises');
      const filename = `quality-report-${Date.now()}.${format}`;
      await fs.writeFile(filename, exported);
      console.log(`✅ レポートをエクスポート: ${filename}\n`);
    }

    const alerts = dashboard.generateAlerts(snapshot);
    if (alerts.length > 0) {
      console.log('⚠️  警告:');
      for (const alert of alerts) {
        console.log(`  ${alert.message}`);
      }
      console.log();
    }

    if (healthScore.overall < 40) {
      console.log('❌ 品質が基準を満たしていません\n');
      process.exit(1);
    } else if (healthScore.overall < 75) {
      console.log('⚠️  品質改善の余地があります\n');
      process.exit(0);
    } else {
      console.log('✅ 品質基準を満たしています\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
