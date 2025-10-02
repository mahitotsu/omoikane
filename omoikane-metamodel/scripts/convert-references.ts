import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const REQUIREMENTS_DIR = join(process.cwd(), 'src/requirements');

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
  const files = getAllTsFiles(REQUIREMENTS_DIR);
  let totalConversions = 0;
  
  for (const file of files) {
    console.log(`📝 ${file.split('/').pop()} を処理中...`);
    
    const content = readFileSync(file, 'utf-8');
    let updatedContent = content;
    let fileConversions = 0;
    
    // primary: 'string' → primary: typedActorRef('string') への変換
    updatedContent = updatedContent.replace(
      /primary:\s*'([^']+)'/g,
      (match, actorId) => {
        fileConversions++;
        return `primary: typedActorRef('${actorId}')`;
      }
    );
    
    // secondary: ['string1', 'string2'] → secondary: [typedActorRef('string1'), typedActorRef('string2')] への変換
    updatedContent = updatedContent.replace(
      /secondary:\s*\[((?:\s*'[^']+',?\s*)*)\]/g,
      (match, actorList) => {
        const actors = actorList.match(/'([^']+)'/g);
        if (actors) {
          const convertedActors = actors.map((actor: string) => {
            const actorId = actor.slice(1, -1); // Remove quotes
            fileConversions++;
            return `typedActorRef('${actorId}')`;
          });
          return `secondary: [\n      ${convertedActors.join(',\n      ')}\n    ]`;
        }
        return match;
      }
    );
    
    // actor: 'string' → actor: typedActorRef('string') への変換（UseCaseStep内）
    updatedContent = updatedContent.replace(
      /actor:\s*'([^']+)'/g,
      (match, actorId) => {
        fileConversions++;
        return `actor: typedActorRef('${actorId}')`;
      }
    );
    
    if (fileConversions > 0) {
      writeFileSync(file, updatedContent);
      console.log(`  ✅ ${fileConversions}個の参照を変換しました`);
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
  
  const files = getAllTsFiles(REQUIREMENTS_DIR);
  let totalConversions = 0;
  
  for (const file of files) {
    console.log(`📝 ${file.split('/').pop()} を処理中...`);
    
    const content = readFileSync(file, 'utf-8');
    let updatedContent = content;
    let fileConversions = 0;
    
    // typedActorRef('string') → 'string' への変換
    updatedContent = updatedContent.replace(
      /typedActorRef\('([^']+)'\)/g,
      (match, actorId) => {
        fileConversions++;
        return `'${actorId}'`;
      }
    );
    
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