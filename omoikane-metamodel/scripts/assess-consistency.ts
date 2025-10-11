#!/usr/bin/env bun

/**
 * @fileoverview 命名規約・整合性評価スクリプト
 *
 * **目的:**
 * プロジェクトの命名規約とScreenFlow整合性を評価し、レポートを出力します。
 */

import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
    assessFlowConsistency,
    assessNamingConsistency,
} from '../src/quality/validators/index.js';
import type {
    Actor,
    BusinessRequirementDefinition,
    Screen,
    ScreenFlow,
    UseCase,
} from '../src/types/index.js';

// ============================================================================
// ファイル検索
// ============================================================================

/**
 * プロジェクト内の全TypeScriptファイルを検索（再帰的）
 *
 * **スキップ対象:**
 * - node_modules/
 * - scripts/
 * - .git/, .vscode/
 * - index.ts
 * - *.test.ts
 */
async function findProjectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // node_modules, scripts, .git等をスキップ
        if (
          entry.name === 'node_modules' ||
          entry.name === 'scripts' ||
          entry.name.startsWith('.')
        ) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile()) {
        // index.ts と *.test.ts をスキップ
        if (
          entry.name.endsWith('.ts') &&
          entry.name !== 'index.ts' &&
          !entry.name.endsWith('.test.ts')
        ) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * TypeScriptファイルを動的インポート
 */
async function loadTsFile(filePath: string): Promise<any> {
  try {
    const absolutePath = resolve(filePath);
    const fileUrl = `file://${absolutePath}`;
    const module = await import(fileUrl);

    if (module.default) {
      return module.default;
    }

    const namedExports = Object.keys(module)
      .filter((key) => key !== 'default' && key !== '__esModule')
      .map((key) => module[key])
      .filter((val) => val !== undefined && val !== null);

    if (namedExports.length === 1) {
      return namedExports[0];
    } else if (namedExports.length > 1) {
      return namedExports;
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// データ読み込み
// ============================================================================

/**
 * プロジェクトデータを読み込んで分類（type属性ベース）
 */
async function loadProjectData(projectPath: string): Promise<{
  actors: Actor[];
  useCases: UseCase[];
  businessRequirements: BusinessRequirementDefinition[];
  screens: Screen[];
  screenFlows: ScreenFlow[];
}> {
  const files = await findProjectFiles(projectPath);

  const actors: Actor[] = [];
  const useCases: UseCase[] = [];
  const businessRequirements: BusinessRequirementDefinition[] = [];
  const screens: Screen[] = [];
  const screenFlows: ScreenFlow[] = [];

  for (const file of files) {
    const data = await loadTsFile(file);
    if (!data) continue;

    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;

      if (item.type === 'actor') {
        actors.push(item);
      } else if (item.type === 'usecase') {
        useCases.push(item);
      } else if (item.type === 'business-requirement') {
        businessRequirements.push(item);
      } else if (item.type === 'screen') {
        screens.push(item);
      } else if (item.type === 'screen-flow') {
        screenFlows.push(item);
      }
    }
  }

  return { actors, useCases, businessRequirements, screens, screenFlows };
}

// ============================================================================
// メイン処理
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const projectPath = args[0] || '../omoikane-example-reservation';

  console.log('='.repeat(80));
  console.log('命名規約・整合性評価レポート');
  console.log('='.repeat(80));
  console.log();
  console.log(`プロジェクト: ${projectPath}`);
  console.log();

  // データ読み込み
  console.log('データを読み込み中...');
  const data = await loadProjectData(projectPath);
  console.log(`  アクター: ${data.actors.length}個`);
  console.log(`  ユースケース: ${data.useCases.length}個`);
  console.log(`  業務要件: ${data.businessRequirements.length}個`);
  console.log(`  画面: ${data.screens.length}個`);
  console.log(`  画面フロー: ${data.screenFlows.length}個`);

  // ファイルパスを収集
  const srcDir = join(resolve(projectPath), 'src');
  const filePaths = await findProjectFiles(srcDir);
  console.log(`  ファイル: ${filePaths.length}個`);
  console.log();

  // ============================================================================
  // 1. 命名規約の一貫性評価
  // ============================================================================

  console.log('='.repeat(80));
  console.log('1. 命名規約の一貫性評価');
  console.log('='.repeat(80));
  console.log();

  const namingResult = assessNamingConsistency(
    data.actors,
    data.useCases,
    data.businessRequirements,
    data.screens,
    undefined,
    data.screenFlows,
    filePaths
  );

  console.log(`📊 総合スコア: ${namingResult.overallScore.toFixed(1)}/100`);
  console.log();

  console.log('【ID命名規則】');
  console.log(`  スコア: ${namingResult.idNaming.score.toFixed(1)}/100`);
  console.log(`  ケバブケース: ${namingResult.idNaming.kebabCase.length}個`);
  console.log(`  キャメルケース: ${namingResult.idNaming.camelCase.length}個`);
  console.log(`  スネークケース: ${namingResult.idNaming.snakeCase.length}個`);
  console.log(`  パスカルケース: ${namingResult.idNaming.pascalCase.length}個`);
  console.log();

  console.log('【stepId命名規則】');
  console.log(`  スコア: ${namingResult.stepIdNaming.score.toFixed(1)}/100`);
  console.log(`  総ステップ数: ${namingResult.stepIdNaming.totalSteps}`);
  console.log(`  ケバブケース: ${namingResult.stepIdNaming.kebabCase}個`);
  console.log(`  キャメルケース: ${namingResult.stepIdNaming.camelCase}個`);
  console.log(`  数字のみ: ${namingResult.stepIdNaming.numeric}個`);
  console.log(
    `  混在ユースケース: ${namingResult.stepIdNaming.inconsistentUseCases.length}個`
  );
  console.log();

  console.log('【ファイル名命名規則】');
  console.log(`  スコア: ${namingResult.fileNaming.score.toFixed(1)}/100`);
  console.log(`  評価対象: ${namingResult.fileNaming.total}個`);
  console.log(`  ケバブケース: ${namingResult.fileNaming.kebabCase.length}個`);
  console.log(`  キャメルケース: ${namingResult.fileNaming.camelCase.length}個`);
  console.log(`  パスカルケース: ${namingResult.fileNaming.pascalCase.length}個`);
  console.log(`  その他: ${namingResult.fileNaming.inconsistent.length}個`);
  console.log();

  if (namingResult.recommendations.length > 0) {
    console.log('【推奨事項】');
    console.log(`  総数: ${namingResult.recommendations.length}件`);
    console.log();

    const highPriority = namingResult.recommendations.filter(
      (r) => r.priority === 'high'
    );
    const mediumPriority = namingResult.recommendations.filter(
      (r) => r.priority === 'medium'
    );

    if (highPriority.length > 0) {
      console.log(`  高優先度: ${highPriority.length}件`);
      for (const rec of highPriority.slice(0, 3)) {
        console.log(`    - ${rec.message}`);
      }
      if (highPriority.length > 3) {
        console.log(`    ... 他 ${highPriority.length - 3} 件`);
      }
      console.log();
    }

    if (mediumPriority.length > 0) {
      console.log(`  中優先度: ${mediumPriority.length}件`);
      for (const rec of mediumPriority.slice(0, 3)) {
        console.log(`    - ${rec.message}`);
      }
      if (mediumPriority.length > 3) {
        console.log(`    ... 他 ${mediumPriority.length - 3} 件`);
      }
      console.log();
    }
  } else {
    console.log('✅ 推奨事項なし - 命名規約は適切に統一されています');
    console.log();
  }

  // ============================================================================
  // 2. ScreenFlow整合性評価
  // ============================================================================

  if (data.screens && data.screens.length > 0 && data.screenFlows && data.screenFlows.length > 0) {
    console.log('='.repeat(80));
    console.log('2. ScreenFlow整合性評価');
    console.log('='.repeat(80));
    console.log();

    const flowResult = assessFlowConsistency(
      data.useCases,
      data.screenFlows,
      data.screens
    );

    console.log(`📊 総合スコア: ${flowResult.overallScore.toFixed(1)}/100`);
    console.log();

    console.log('【画面順序の整合性】');
    console.log(
      `  スコア: ${flowResult.screenOrderConsistency.score.toFixed(1)}/100`
    );
    console.log(`  一致: ${flowResult.screenOrderConsistency.matches.length}件`);
    console.log(
      `  不一致: ${flowResult.screenOrderConsistency.mismatches.length}件`
    );
    console.log();

    console.log('【アクションの整合性】');
    console.log(`  スコア: ${flowResult.actionConsistency.score.toFixed(1)}/100`);
    console.log(`  一致: ${flowResult.actionConsistency.matches}件`);
    console.log(`  不一致: ${flowResult.actionConsistency.mismatches.length}件`);
    console.log();

    console.log('【遷移トリガーの妥当性】');
    console.log(
      `  スコア: ${flowResult.transitionTriggerValidity.score.toFixed(1)}/100`
    );
    console.log(
      `  有効: ${flowResult.transitionTriggerValidity.validTriggers}件`
    );
    console.log(
      `  無効: ${flowResult.transitionTriggerValidity.invalidTriggers.length}件`
    );
    console.log();

    console.log('【遷移の完全性】');
    console.log(
      `  スコア: ${flowResult.transitionCompleteness.score.toFixed(1)}/100`
    );
    console.log(
      `  完全: ${flowResult.transitionCompleteness.completeFlows.length}件`
    );
    console.log(
      `  不完全: ${flowResult.transitionCompleteness.incompleteFlows.length}件`
    );
    console.log();

    if (flowResult.recommendations.length > 0) {
      console.log('【推奨事項】');
      console.log(`  総数: ${flowResult.recommendations.length}件`);
      console.log();

      const highPriority = flowResult.recommendations.filter(
        (r) => r.priority === 'high'
      );

      if (highPriority.length > 0) {
        console.log(`  高優先度: ${highPriority.length}件`);
        for (const rec of highPriority.slice(0, 5)) {
          console.log(`    - [${rec.category}] ${rec.message}`);
        }
        if (highPriority.length > 5) {
          console.log(`    ... 他 ${highPriority.length - 5} 件`);
        }
        console.log();
      }
    } else {
      console.log('✅ 推奨事項なし - ScreenFlowの整合性は良好です');
      console.log();
    }
  } else {
    console.log('⏭️  ScreenFlow整合性評価をスキップ（画面・フローデータなし）');
    console.log();
  }

  // ============================================================================
  // まとめ
  // ============================================================================

  console.log('='.repeat(80));
  console.log('まとめ');
  console.log('='.repeat(80));
  console.log();

  const overallScore = namingResult.overallScore;

  if (overallScore >= 90) {
    console.log('✅ 優秀: 命名規約は非常に統一されています');
  } else if (overallScore >= 80) {
    console.log('👍 良好: 命名規約はおおむね統一されています');
  } else if (overallScore >= 70) {
    console.log('⚠️  改善の余地あり: いくつかの不統一が見られます');
  } else {
    console.log('❌ 要改善: 命名規約の統一を推奨します');
  }

  console.log();
  console.log('='.repeat(80));
}

main().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
