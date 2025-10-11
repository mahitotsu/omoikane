#!/usr/bin/env bun

/**
 * 画面フローから冗長なフィールド（screens, startScreen, endScreens）を削除するスクリプト
 * 
 * これらのフィールドは transitions から自動導出できるため不要です。
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const flowDir = 'src/ui/screen-flows';
const flowFiles = readdirSync(flowDir)
  .filter(f => f.endsWith('-flow.ts'))
  .map(f => join(flowDir, f));

console.log(`🔍 ${flowFiles.length}個の画面フローファイルを処理します...\n`);

let totalModified = 0;

for (const file of flowFiles) {
  const content = readFileSync(file, 'utf-8');
  
  // screens配列を削除
  let modified = content.replace(/\s+screens:\s*\[[\s\S]*?\],\n/g, '');
  
  // startScreen行を削除
  modified = modified.replace(/\s+startScreen:\s*typedScreenRef\([^)]+\),\n/g, '');
  
  // endScreens配列を削除
  modified = modified.replace(/\s+endScreens:\s*\[[\s\S]*?\],\n/g, '');
  
  if (modified !== content) {
    writeFileSync(file, modified, 'utf-8');
    console.log(`✅ ${file}`);
    totalModified++;
  } else {
    console.log(`⏭️  ${file} (変更なし)`);
  }
}

console.log(`\n✨ 完了: ${totalModified}/${flowFiles.length}ファイルを更新しました`);
