import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const SOURCE_DIR = join(process.cwd(), 'src');

interface ReferenceConversionConfig {
  factoryName: string;
  singleProperties?: string[];
  arrayProperties?: string[];
}

const referenceConfigs: ReferenceConversionConfig[] = [
  {
    factoryName: 'typedActorRef',
    singleProperties: ['primary', 'actor'],
    arrayProperties: ['secondary'],
  },
  {
    factoryName: 'typedUseCaseRef',
    singleProperties: ['useCase'],
    arrayProperties: ['relatedUseCases', 'dependentUseCases', 'includedUseCases'],
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

interface ReplacementResult {
  content: string;
  conversions: number;
}

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

function replaceArrayPropertyToTyped(
  content: string,
  property: string,
  factoryName: string
): ReplacementResult {
  const regex = new RegExp(`(\\s*)${property}:\\s*\\[([\\s\\S]*?)\\]`, 'g');
  let conversions = 0;
  const updated = content.replace(regex, (match, indent: string, inner: string) => {
    if (inner.includes(`${factoryName}(`) || inner.includes(':')) {
      return match;
    }

    const idMatches = inner.match(/'([^']+)'/g);
    if (!idMatches || idMatches.length === 0) {
      return match;
    }

    const compact = inner.replace(/'([^']+)'/g, '').replace(/[^\S\n,]/g, '').trim();
    if (compact.length > 0) {
      return match;
    }

    conversions += idMatches.length;
    const entryIndent = `${indent}  `;
    const convertedItems = idMatches.map((raw) => {
      const id = raw.slice(1, -1);
      return `${factoryName}('${id}')`;
    });

    return `${indent}${property}: [\n${entryIndent}${convertedItems.join(`,\n${entryIndent}`)}\n${indent}]`;
  });

  return { content: updated, conversions };
}

function replaceArrayPropertyToString(
  content: string,
  property: string,
  factoryName: string
): ReplacementResult {
  const regex = new RegExp(`(\\s*)${property}:\\s*\\[([\\s\\S]*?)\\]`, 'g');
  let conversions = 0;
  const updated = content.replace(regex, (match, indent: string, inner: string) => {
    if (!inner.includes(`${factoryName}(`)) {
      return match;
    }

    const factoryRegex = new RegExp(`${factoryName}\\('([^']+)'\\)`, 'g');
    const matches = [...inner.matchAll(factoryRegex)];
    if (matches.length === 0) {
      return match;
    }

    const compact = inner.replace(factoryRegex, '').replace(/[^\S\n,]/g, '').trim();
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

// Node.js標準機能でTypeScriptファイルを取得
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

// 逆変換（型安全参照から文字列への変換）
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

// コマンドライン引数の処理
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
