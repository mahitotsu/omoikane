/**
 * @fileoverview 参照形式の自動変換スクリプト
 *
 * **目的:**
 * ソースコード内の参照を双方向で変換します：
 * - 文字列参照 → 型安全参照（デフォルト）
 * - 型安全参照 → 文字列参照（--to-stringオプション）
 *
 * **主要機能:**
 * 1. 文字列参照の検出と型安全参照への変換
 * 2. 型安全参照の検出と文字列への逆変換
 * 3. 単一プロパティと配列プロパティの両方に対応
 * 4. バックアップなしの直接上書き（Gitで管理されている前提）
 *
 * **変換例（文字列 → 型安全）:**
 * ```typescript
 * // Before
 * actor: 'visitor'
 * actors: { primary: 'visitor', secondary: ['store-staff'] }
 *
 * // After
 * actor: typedActorRef('visitor')
 * actors: { primary: typedActorRef('visitor'), secondary: [typedActorRef('store-staff')] }
 * ```
 *
 * **変換例（型安全 → 文字列）:**
 * ```typescript
 * // Before
 * actor: typedActorRef('visitor')
 *
 * // After
 * actor: 'visitor'
 * ```
 *
 * **実行方法:**
 * ```bash
 * # 文字列 → 型安全参照（デフォルト）
 * bun run convert-references
 *
 * # 型安全参照 → 文字列
 * bun run convert-references --to-string
 * ```
 *
 * **対応する参照型:**
 * - typedActorRef
 * - typedUseCaseRef
 * - typedScreenRef
 * - typedValidationRuleRef
 * - typedScreenFlowRef
 * - businessRequirementRef
 * - businessGoalRef
 * - stakeholderRef
 * - successMetricRef
 * - assumptionRef
 * - constraintRef
 *
 * **設計判断:**
 * - Gitで管理されているためバックアップ不要
 * - 正規表現で柔軟なパターンマッチング
 * - ネストした配列もサポート
 *
 * @module scripts/convert-references
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const SOURCE_DIR = join(process.cwd(), 'src');

// ============================================================================
// 型定義
// ============================================================================

/**
 * 参照変換設定
 *
 * 各参照関数の変換ルールを定義します。
 */
interface ReferenceConversionConfig {
  /** 参照関数名（例: 'typedActorRef'） */
  factoryName: string;
  /** 単一プロパティのリスト（例: ['primary', 'actor']） */
  singleProperties?: string[];
  /** 配列プロパティのリスト（例: ['secondary']） */
  arrayProperties?: string[];
}

/**
 * 変換結果
 */
interface ReplacementResult {
  /** 変換後のコンテンツ */
  content: string;
  /** 変換回数 */
  conversions: number;
}

// ============================================================================
// 変換設定
// ============================================================================

/**
 * 参照変換設定のリスト
 *
 * 各参照型に対して、どのプロパティ名を変換対象とするかを定義します。
 *
 * **設定項目:**
 * - factoryName: 参照関数名
 * - singleProperties: 単一値を持つプロパティ名（例: `actor: 'xxx'`）
 * - arrayProperties: 配列を持つプロパティ名（例: `actors: ['xxx', 'yyy']`）
 */
const referenceConfigs: ReferenceConversionConfig[] = [
  {
    factoryName: 'typedActorRef',
    singleProperties: ['primary', 'actor'],
    arrayProperties: ['secondary'],
  },
  {
    factoryName: 'typedUseCaseRef',
    singleProperties: ['useCase', 'relatedUseCase'],
    arrayProperties: ['relatedUseCases', 'dependentUseCases', 'includedUseCases'],
  },
  {
    factoryName: 'typedScreenRef',
    singleProperties: ['screen', 'targetScreen', 'startScreen', 'from', 'to'],
    arrayProperties: ['screens', 'endScreens'],
  },
  {
    factoryName: 'typedValidationRuleRef',
    arrayProperties: ['validationRules'],
  },
  {
    factoryName: 'typedScreenFlowRef',
    singleProperties: ['screenFlow'],
    arrayProperties: ['screenFlows'],
  },
  {
    factoryName: 'businessRequirementRef',
    singleProperties: ['requirement'],
  },
  {
    factoryName: 'businessGoalRef',
    arrayProperties: ['businessGoals'],
  },
  {
    factoryName: 'businessScopeRef',
    arrayProperties: ['scopeItems'],
  },
  {
    factoryName: 'stakeholderRef',
    arrayProperties: ['stakeholders'],
  },
  {
    factoryName: 'successMetricRef',
    arrayProperties: ['successMetrics'],
  },
  {
    factoryName: 'assumptionRef',
    arrayProperties: ['assumptions'],
  },
  {
    factoryName: 'constraintRef',
    arrayProperties: ['constraints'],
  },
];

// ============================================================================
// 変換関数（単一プロパティ）
// ============================================================================

/**
 * 単一プロパティの文字列参照を型安全参照に変換
 *
 * **変換パターン:**
 * ```typescript
 * // Before
 * actor: 'visitor'
 *
 * // After
 * actor: typedActorRef('visitor')
 * ```
 *
 * **正規表現パターン:**
 * `(\\s*${property}:\\s*)'([^']+)'`
 * - キャプチャ1: プロパティ名と前後の空白
 * - キャプチャ2: ID文字列
 *
 * @param content - 変換対象のコンテンツ
 * @param property - プロパティ名
 * @param factoryName - 参照関数名
 * @returns 変換結果
 */
function replaceSinglePropertyToTyped(
  content: string,
  property: string,
  factoryName: string
): ReplacementResult {
  const regex = new RegExp(`(\\s*${property}:\\s*)'([^']+)'`, 'g');
  let conversions = 0;
  const updated = content.replace(regex, (_match, prefix: string, id: string) => {
    conversions++;
    return `${prefix}${factoryName}('${id}')`;
  });
  return { content: updated, conversions };
}

/**
 * 単一プロパティの型安全参照を文字列に変換
 *
 * **変換パターン:**
 * ```typescript
 * // Before
 * actor: typedActorRef('visitor')
 *
 * // After
 * actor: 'visitor'
 * ```
 *
 * **正規表現パターン:**
 * `(\\s*${property}:\\s*)${factoryName}\\('([^']+)'\\)`
 * - キャプチャ1: プロパティ名と前後の空白
 * - キャプチャ2: ID文字列
 *
 * @param content - 変換対象のコンテンツ
 * @param property - プロパティ名
 * @param factoryName - 参照関数名
 * @returns 変換結果
 */
function replaceSinglePropertyToString(
  content: string,
  property: string,
  factoryName: string
): ReplacementResult {
  const regex = new RegExp(`(\\s*${property}:\\s*)${factoryName}\\('([^']+)'\\)`, 'g');
  let conversions = 0;
  const updated = content.replace(regex, (_match, prefix: string, id: string) => {
    conversions++;
    return `${prefix}'${id}'`;
  });
  return { content: updated, conversions };
}

// ============================================================================
// 変換関数（配列プロパティ）
// ============================================================================

/**
 * 配列プロパティの文字列参照を型安全参照に変換
 *
 * **変換パターン:**
 * ```typescript
 * // Before
 * actors: ['visitor', 'store-staff']
 *
 * // After
 * actors: [
 *   typedActorRef('visitor'),
 *   typedActorRef('store-staff')
 * ]
 * ```
 *
 * **処理内容:**
 * 1. 配列プロパティを正規表現で検出
 * 2. 既に型安全参照が含まれている場合はスキップ
 * 3. 純粋な文字列配列のみを変換
 * 4. インデントを保持したフォーマット出力
 *
 * **スキップ条件:**
 * - 既に参照関数が使われている
 * - 配列内にオブジェクトが含まれる
 * - 文字列以外の要素が含まれる
 *
 * @param content - 変換対象のコンテンツ
 * @param property - プロパティ名
 * @param factoryName - 参照関数名
 * @returns 変換結果
 */
function replaceArrayPropertyToTyped(
  content: string,
  property: string,
  factoryName: string
): ReplacementResult {
  const regex = new RegExp(`(\\s*)${property}:\\s*\\[([\\s\\S]*?)\\]`, 'g');
  let conversions = 0;
  const updated = content.replace(regex, (match, indent: string, inner: string) => {
    // 既に型安全参照が使われている、またはオブジェクトが含まれる場合はスキップ
    if (inner.includes(`${factoryName}(`) || inner.includes(':')) {
      return match;
    }

    // 文字列IDを抽出
    const idMatches = inner.match(/'([^']+)'/g);
    if (!idMatches || idMatches.length === 0) {
      return match;
    }

    // 純粋な文字列配列かチェック（文字列とカンマ以外があればスキップ）
    const compact = inner
      .replace(/'([^']+)'/g, '')
      .replace(/[^\S\n,]/g, '')
      .trim();
    if (compact.length > 0) {
      return match;
    }

    conversions += idMatches.length;
    const entryIndent = `${indent}  `;
    const convertedItems = idMatches.map(raw => {
      const id = raw.slice(1, -1);
      return `${factoryName}('${id}')`;
    });

    return `${indent}${property}: [\n${entryIndent}${convertedItems.join(`,\n${entryIndent}`)}\n${indent}]`;
  });

  return { content: updated, conversions };
}

/**
 * 配列プロパティの型安全参照を文字列に変換
 *
 * **変換パターン:**
 * ```typescript
 * // Before
 * actors: [
 *   typedActorRef('visitor'),
 *   typedActorRef('store-staff')
 * ]
 *
 * // After
 * actors: ['visitor', 'store-staff']
 * ```
 *
 * **処理内容:**
 * 1. 配列プロパティを正規表現で検出
 * 2. 参照関数を抽出してIDのみを取得
 * 3. 純粋な参照関数配列のみを変換
 * 4. インデントを保持したフォーマット出力
 *
 * **スキップ条件:**
 * - 参照関数が含まれていない
 * - 参照関数以外の要素が含まれる
 *
 * @param content - 変換対象のコンテンツ
 * @param property - プロパティ名
 * @param factoryName - 参照関数名
 * @returns 変換結果
 */
function replaceArrayPropertyToString(
  content: string,
  property: string,
  factoryName: string
): ReplacementResult {
  const regex = new RegExp(`(\\s*)${property}:\\s*\\[([\\s\\S]*?)\\]`, 'g');
  let conversions = 0;
  const updated = content.replace(regex, (match, indent: string, inner: string) => {
    // 参照関数が含まれていない場合はスキップ
    if (!inner.includes(`${factoryName}(`)) {
      return match;
    }

    // 参照関数を抽出
    const factoryRegex = new RegExp(`${factoryName}\\('([^']+)'\\)`, 'g');
    const matches = [...inner.matchAll(factoryRegex)];
    if (matches.length === 0) {
      return match;
    }

    // 純粋な参照関数配列かチェック（参照関数以外があればスキップ）
    const compact = inner
      .replace(factoryRegex, '')
      .replace(/[^\S\n,]/g, '')
      .trim();
    if (compact.length > 0) {
      return match;
    }

    conversions += matches.length;
    const entryIndent = `${indent}  `;
    const convertedItems = matches.map(([, id]) => `'${id}'`);

    return `${indent}${property}: [\n${entryIndent}${convertedItems.join(`,\n${entryIndent}`)}\n${indent}]`;
  });

  return { content: updated, conversions };
}

// ============================================================================
// 変換適用
// ============================================================================

/**
 * 全ての参照変換を適用
 *
 * **処理フロー:**
 * 1. 設定リストをループ
 * 2. 単一プロパティを変換
 * 3. 配列プロパティを変換
 * 4. 変換回数を集計
 *
 * **設計判断:**
 * - 全ての変換を1パスで実行（効率性）
 * - 変換順序は設定リストの順序に従う
 *
 * @param content - 変換対象のコンテンツ
 * @param direction - 変換方向（'to-typed' | 'to-string'）
 * @returns 変換結果
 */
function applyReferenceConversions(
  content: string,
  direction: 'to-typed' | 'to-string'
): ReplacementResult {
  let updated = content;
  let conversions = 0;

  for (const config of referenceConfigs) {
    if (config.singleProperties) {
      for (const property of config.singleProperties) {
        const result =
          direction === 'to-typed'
            ? replaceSinglePropertyToTyped(updated, property, config.factoryName)
            : replaceSinglePropertyToString(updated, property, config.factoryName);
        updated = result.content;
        conversions += result.conversions;
      }
    }

    if (config.arrayProperties) {
      for (const property of config.arrayProperties) {
        const result =
          direction === 'to-typed'
            ? replaceArrayPropertyToTyped(updated, property, config.factoryName)
            : replaceArrayPropertyToString(updated, property, config.factoryName);
        updated = result.content;
        conversions += result.conversions;
      }
    }
  }

  return { content: updated, conversions };
}

// ============================================================================
// ファイル検索
// ============================================================================

/**
 * 再帰的にTypeScriptファイルを取得
 *
 * **処理内容:**
 * 1. ディレクトリを再帰的に走査
 * 2. .ts拡張子のファイルのみを収集
 * 3. ファイルパスのリストを返す
 *
 * **設計判断:**
 * - Node.js標準機能のみを使用（依存なし）
 * - 再帰的な走査でネストディレクトリに対応
 *
 * @param dir - 検索開始ディレクトリ
 * @returns TypeScriptファイルパスのリスト
 */
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];

  function walkDir(currentDir: string) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (stat.isFile() && extname(entry) === '.ts') {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

// ============================================================================
// メイン変換処理
// ============================================================================

/**
 * 文字列参照から型安全参照への変換（デフォルト動作）
 *
 * **処理フロー:**
 * 1. src/ディレクトリ内の全.tsファイルを取得
 * 2. 各ファイルを読み込み
 * 3. applyReferenceConversions('to-typed')で変換
 * 4. 変換があればファイルを上書き
 * 5. 統計情報を表示
 *
 * **使用例:**
 * ```bash
 * bun run convert-references
 * ```
 *
 * **出力例:**
 * ```
 * 🔄 文字列参照から型安全参照への変換を開始...
 * 📝 actors.ts を処理中...
 *   ✅ 4個の参照を型安全に変換しました
 * 🎉 変換完了！合計 4個の参照を型安全に変換しました
 * ```
 */
async function convertStringReferences() {
  console.log('🔄 文字列参照から型安全参照への変換を開始...');

  // 要件ファイルを取得
  if (!existsSync(SOURCE_DIR)) {
    console.warn(`⚠️  src ディレクトリが見つかりません: ${SOURCE_DIR}`);
    return;
  }
  const files = getAllTsFiles(SOURCE_DIR);
  let totalConversions = 0;

  for (const file of files) {
    console.log(`📝 ${file.split('/').pop()} を処理中...`);

    const content = readFileSync(file, 'utf-8');
    let updatedContent = content;
    let fileConversions = 0;

    const result = applyReferenceConversions(updatedContent, 'to-typed');
    updatedContent = result.content;
    fileConversions += result.conversions;

    if (fileConversions > 0) {
      writeFileSync(file, updatedContent);
      console.log(`  ✅ ${fileConversions}個の参照を型安全に変換しました`);
      totalConversions += fileConversions;
    } else {
      console.log(`  ⏭️  変換対象なし`);
    }
  }

  console.log(`\n🎉 変換完了！合計 ${totalConversions}個の参照を型安全に変換しました`);

  // 変換統計
  if (totalConversions > 0) {
    console.log('\n📊 変換統計:');
    console.log(`  - 処理ファイル数: ${files.length}`);
    console.log(`  - 変換参照数: ${totalConversions}`);
    console.log(`  - 型安全性: 向上`);
    console.log(`  - 開発体験: 改善`);
  }
}

/**
 * 型安全参照から文字列参照への逆変換
 *
 * **処理フロー:**
 * 1. src/ディレクトリ内の全.tsファイルを取得
 * 2. 各ファイルを読み込み
 * 3. applyReferenceConversions('to-string')で変換
 * 4. 変換があればファイルを上書き
 * 5. 統計情報を表示
 *
 * **使用例:**
 * ```bash
 * bun run convert-references --to-string
 * ```
 *
 * **用途:**
 * - デバッグ用途（型安全参照が不要な場合）
 * - シンプルな形式への戻し変換
 * - 互換性維持（旧形式への対応）
 *
 * **注意:**
 * 通常は型安全参照を推奨します。この逆変換は特殊な用途のみ。
 */
async function convertToStringReferences() {
  console.log('🔄 型安全参照から文字列参照への変換を開始...');

  if (!existsSync(SOURCE_DIR)) {
    console.warn(`⚠️  src ディレクトリが見つかりません: ${SOURCE_DIR}`);
    return;
  }
  const files = getAllTsFiles(SOURCE_DIR);
  let totalConversions = 0;

  for (const file of files) {
    console.log(`📝 ${file.split('/').pop()} を処理中...`);

    const content = readFileSync(file, 'utf-8');
    let updatedContent = content;
    let fileConversions = 0;

    const result = applyReferenceConversions(updatedContent, 'to-string');
    updatedContent = result.content;
    fileConversions += result.conversions;

    if (fileConversions > 0) {
      writeFileSync(file, updatedContent);
      console.log(`  ✅ ${fileConversions}個の参照を変換しました`);
      totalConversions += fileConversions;
    } else {
      console.log(`  ⏭️  変換対象なし`);
    }
  }

  console.log(`\n🎉 変換完了！合計 ${totalConversions}個の参照を文字列に変換しました`);
}

// ============================================================================
// コマンドライン実行
// ============================================================================

/**
 * コマンドライン引数を処理して適切な変換を実行
 *
 * **コマンドオプション:**
 * - なし または --to-typed: 文字列 → 型安全参照（デフォルト）
 * - --to-string: 型安全参照 → 文字列（逆変換）
 *
 * **実行例:**
 * ```bash
 * bun scripts/convert-references.ts
 * bun scripts/convert-references.ts --to-typed
 * bun scripts/convert-references.ts --to-string
 * ```
 */
const command = process.argv[2];

if (command === '--to-string') {
  convertToStringReferences();
} else if (command === '--to-typed' || !command) {
  convertStringReferences();
} else {
  console.log('使用方法:');
  console.log('  bun scripts/convert-references.ts           # 文字列 → 型安全参照');
  console.log('  bun scripts/convert-references.ts --to-typed # 文字列 → 型安全参照');
  console.log('  bun scripts/convert-references.ts --to-string # 型安全参照 → 文字列');
}
