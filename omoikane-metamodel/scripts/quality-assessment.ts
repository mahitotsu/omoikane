#!/usr/bin/env bun
/**
 * 品質評価スクリプト
 * 指定されたプロジェクトの品質を評価してレポートを生成
 */

import { readdir } from 'fs/promises';
import { extname, join } from 'path';
import type {
  BusinessRuleStats,
  BusinessRuleSummary,
  SecurityPolicyStats,
  SecurityPolicySummary,
} from '../src/quality/index.js';
import { performQualityAssessment } from '../src/quality/index.js';

/**
 * TypeScriptファイルを動的にインポート
 */
async function importTsFile(filePath: string): Promise<any> {
  try {
    // 絶対パスに変換
    const absolutePath = filePath.startsWith('/') ? filePath : join(process.cwd(), filePath);
    const module = await import(`file://${absolutePath}`);
    return module.default || module;
  } catch (error) {
    console.warn(
      `Warning: Could not import ${filePath}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

/**
 * ディレクトリを再帰的に検索してTypeScriptファイルを収集
 */
async function findAllTsFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // ディレクトリの場合は再帰的に検索
        const subFiles = await findAllTsFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && extname(entry.name) === '.ts') {
        // TypeScriptファイルの場合は追加
        files.push(fullPath);
      }
    }
  } catch {
    // ディレクトリが存在しない場合は静かに処理を続行
  }

  return files;
}

/**
 * プロジェクトディレクトリから要件定義ファイルを検索
 */
async function findProjectFiles(projectDir: string): Promise<{
  businessRequirements: any;
  actors: any[];
  useCases: any[];
}> {
  const srcDir = join(projectDir, 'src');

  let businessRequirements: any = null;
  const actors: any[] = [];
  const useCases: any[] = [];
  // ユースケースID毎の最初の構造署名を保存し、完全一致重複は抑止
  const useCaseIdMap = new Map<string, { signature: string }>();
  let suppressedDuplicateCount = 0;

  try {
    // srcディレクトリ以下のすべてのTypeScriptファイルを検索
    const allTsFiles = await findAllTsFiles(srcDir);
    // console.log(`🔍 src/ 以下の検索対象ファイル: ${allTsFiles.length}件`);

    for (const filePath of allTsFiles) {
      const fileName = filePath.split('/').pop() || '';

      try {
        const module = await importTsFile(filePath);
        if (!module) continue;

        // business-requirements.ts の検出
        for (const exportedName of Object.keys(module)) {
          const value: any = (module as any)[exportedName];
          if (value && typeof value === 'object' && value.type === 'business-requirement') {
            // 最初に見つかった業務要件定義を採用
            businessRequirements = value;
          }

          // アクターの収集
          if (value && typeof value === 'object' && value.type === 'actor') {
            actors.push(value);
          }

          // ユースケースの収集（重複排除）
          if (value && typeof value === 'object' && value.type === 'usecase') {
            const signature = JSON.stringify({ id: value.id, name: value.name, owner: value.owner });
            const existing = useCaseIdMap.get(value.id);
            if (!existing) {
              useCaseIdMap.set(value.id, { signature });
              useCases.push(value);
            } else if (existing.signature !== signature) {
              // IDが同じで構造が異なる場合は別物として追加（念のため）
              useCases.push(value);
            } else {
              suppressedDuplicateCount++;
            }
          }
        }
      } catch {
        // 個別ファイルの読み込み失敗はスキップ
      }
    }

    if (suppressedDuplicateCount > 0) {
      console.log(
        `ℹ️  同一構造のユースケース重複 ${suppressedDuplicateCount} 件を除外しました（再エクスポート等）。`
      );
    }
  } catch (error) {
    console.error('Error loading project files:', error);
  }

  return { businessRequirements, actors, useCases };
}

/**
 * 品質評価レポートを表示
 */
function displayQualityReport(
  assessment: any,
  recommendations: any[],
  projectName: string,
  businessRuleSummary: BusinessRuleSummary,
  businessRuleStats: BusinessRuleStats,
  securityPolicySummary: SecurityPolicySummary,
  securityPolicyStats: SecurityPolicyStats
) {
  console.log(`\n=== 品質評価レポート: ${projectName} ===\n`);

  // 総合スコア
  console.log('📊 品質評価結果:');
  console.log(
    `総合スコア: ${assessment.overallScore.value}/100 (${assessment.overallScore.level})`
  );
  console.log(
    `完全性: ${assessment.scores.completeness.value}/100 (${assessment.scores.completeness.level})`
  );
  console.log(
    `一貫性: ${assessment.scores.consistency.value}/100 (${assessment.scores.consistency.level})`
  );
  console.log(
    `妥当性: ${assessment.scores.validity.value}/100 (${assessment.scores.validity.level})`
  );
  console.log(
    `追跡可能性: ${assessment.scores.traceability.value}/100 (${assessment.scores.traceability.level})\n`
  );

  // 発見された問題
  console.log('🔍 発見された問題:');
  if (assessment.issues.length === 0) {
    console.log('  問題は発見されませんでした ✨\n');
  } else {
    assessment.issues.forEach((issue: any, index: number) => {
      const severityIcon =
        issue.severity === 'critical' ? '🚨' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(
        `  ${index + 1}. ${severityIcon} [${issue.severity.toUpperCase()}] ${issue.description}`
      );
      console.log(`     影響: ${issue.impact}`);
      console.log(`     対応: ${issue.suggestion}\n`);
    });
  }

  // カバレッジレポート（統合）
  console.log('📈 カバレッジレポート:');
  const { coverage } = assessment;
  console.log(
    `  ビジネスゴール: ${coverage.businessGoals.covered}/${coverage.businessGoals.total} (${Math.round(coverage.businessGoals.coverage * 100)}%)`
  );
  console.log(
    `  スコープ項目: ${coverage.scopeItems.covered}/${coverage.scopeItems.total} (${Math.round(coverage.scopeItems.coverage * 100)}%)`
  );
  console.log(
    `  ステークホルダー: ${coverage.stakeholders.covered}/${coverage.stakeholders.total} (${Math.round(coverage.stakeholders.coverage * 100)}%)`
  );
  console.log(
    `  成功指標: ${coverage.successMetrics.covered}/${coverage.successMetrics.total} (${Math.round(coverage.successMetrics.coverage * 100)}%)`
  );
  console.log(
    `  前提条件: ${coverage.assumptions.covered}/${coverage.assumptions.total} (${Math.round(coverage.assumptions.coverage * 100)}%)`
  );
  console.log(
    `  制約条件: ${coverage.constraints.covered}/${coverage.constraints.total} (${Math.round(coverage.constraints.coverage * 100)}%)`
  );
  // 追加: ビジネスルールとセキュリティポリシーもここで表示
  if (businessRuleSummary.rules.length === 0) {
    console.log('  ビジネスルール: 0/0 (—)');
  } else {
    const brPercent = Math.round(businessRuleStats.coverageRatio * 100);
    console.log(
      `  ビジネスルール: ${businessRuleStats.totalCoveredRules}/${businessRuleStats.totalRules} (${brPercent}%)`
    );
  }
  if (securityPolicySummary.policies.length === 0) {
    console.log('  セキュリティポリシー: 0/0 (—)\n');
  } else {
    const spPercent = Math.round(securityPolicyStats.coverageRatio * 100);
    console.log(
      `  セキュリティポリシー: ${securityPolicyStats.totalCoveredPolicies}/${securityPolicyStats.totalPolicies} (${spPercent}%)\n`
    );
  }

  // 詳細（未カバーのみ）
  console.log('🧩 ビジネスルール詳細（未カバー一覧）:');
  if (businessRuleSummary.rules.length === 0) {
    console.log('  定義なし\n');
  } else if (businessRuleSummary.uncoveredRules.length === 0) {
    console.log('  未カバーはありません ✅\n');
  } else {
    businessRuleSummary.uncoveredRules.forEach((entry: any, index: number) => {
      const description = entry.rule.description || entry.rule.id;
      console.log(`  ${index + 1}. ${entry.rule.id} — ${description}`);
      const coveringUseCases = entry.coveredByUseCases.map((useCase: any) => useCase.id).join(', ');
      console.log(`     カバーするユースケース: ${coveringUseCases || 'なし'}`);
    });
    console.log('');
  }

  console.log('️ セキュリティポリシー詳細（未カバー一覧）:');
  if (securityPolicySummary.policies.length === 0) {
    console.log('  定義なし\n');
  } else if (securityPolicySummary.uncoveredPolicies.length === 0) {
    console.log('  未カバーはありません ✅\n');
  } else {
    securityPolicySummary.uncoveredPolicies.forEach((entry: any, index: number) => {
      const description = entry.policy.description || entry.policy.id;
      console.log(`  ${index + 1}. ${entry.policy.id} — ${description}`);
      const coveringUseCases = entry.coveredByUseCases.map((useCase: any) => useCase.id).join(', ');
      console.log(`     カバーするユースケース: ${coveringUseCases || 'なし'}`);
    });
    console.log('');
  }

  // 孤立要素
  if (coverage.orphanedElements.length > 0) {
    console.log('🔗 孤立要素:');
    coverage.orphanedElements.forEach((orphaned: any, index: number) => {
      console.log(`  ${index + 1}. ${orphaned.element.type}: ${orphaned.element.id}`);
      console.log(`     理由: ${orphaned.reason}`);
      console.log(
        `     推奨: ${orphaned.suggestedUsage[0] || '要素を削除するか使用方法を検討してください'}\n`
      );
    });
  }

  // AI Agent向け推奨アクション
  console.log('🤖 AI Agent向け推奨アクション:');
  if (recommendations.length === 0) {
    console.log('  追加の推奨アクションはありません ✅\n');
  } else {
    recommendations.forEach((rec: any, index: number) => {
      const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`  ${index + 1}. ${priorityIcon} [${rec.priority.toUpperCase()}] ${rec.action}`);
      console.log(`     理由: ${rec.rationale}`);
      console.log(`     影響要素: ${rec.affectedElements.join(', ')}`);
      if (rec.template) {
        console.log(`     テンプレート: ${rec.template.type}`);
      }
      console.log('');
    });
  }

  console.log('=== レポート終了 ===\n');
}

/**
 * メイン実行関数
 */
async function main() {
  const args = process.argv.slice(2);
  const projectDir = args[0] || process.cwd();

  console.log(`🔍 プロジェクト品質評価を開始: ${projectDir}`);

  try {
    // プロジェクトファイルを読み込み
    const { businessRequirements, actors, useCases } = await findProjectFiles(projectDir);

    if (!businessRequirements) {
      console.error('❌ Error: business-requirements.ts が見つかりません');
      process.exit(1);
    }

    if (actors.length === 0) {
      console.warn('⚠️ Warning: アクターが見つかりません');
    }

    if (useCases.length === 0) {
      console.warn('⚠️ Warning: ユースケースが見つかりません');
    }

    console.log(`📋 読み込み完了:`);
    console.log(`  - 業務要件: ${businessRequirements ? '✓' : '✗'}`);
    console.log(`  - アクター: ${actors.length}件`);
    console.log(`  - ユースケース: ${useCases.length}件`);

    // 品質評価実行
    const {
      assessment,
      recommendations,
      businessRuleSummary,
      businessRuleStats,
      securityPolicySummary,
      securityPolicyStats,
    } = performQualityAssessment(businessRequirements, actors, useCases);

    // レポート表示
    const projectName = projectDir.split('/').pop() || 'Unknown Project';
    displayQualityReport(
      assessment,
      recommendations,
      projectName,
      businessRuleSummary,
      businessRuleStats,
      securityPolicySummary,
      securityPolicyStats
    );

    // 終了コード決定
    const criticalIssues = assessment.issues.filter((issue: any) => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.log(`❌ 品質評価完了: ${criticalIssues.length}件の重大な問題が発見されました`);
      process.exit(1);
    } else if (assessment.overallScore.value < 80) {
      console.log(`⚠️ 品質評価完了: 品質スコアが低いです (${assessment.overallScore.value}/100)`);
      process.exit(1);
    } else {
      console.log(`✅ 品質評価完了: 良好な品質です (${assessment.overallScore.value}/100)`);
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during quality assessment:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみ main() を呼び出し
if (import.meta.main) {
  main();
}
