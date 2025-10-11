#!/usr/bin/env bun
/**
 * 画面フローのトリガーを新しい参照型に更新するスクリプト
 * 
 * 変更内容:
 * - trigger: 'action-id' → trigger: typedScreenActionRef('screen-id', 'action-id')
 * - import文にtypedScreenActionRefを追加
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const SCREEN_FLOWS_DIR = path.join(process.cwd(), 'src/ui/screen-flows');

interface Transition {
  from: string;
  trigger: string;
}

function extractScreenId(fromLine: string): string | null {
  const match = fromLine.match(/typedScreenRef\('([^']+)'\)/);
  return match ? match[1] : null;
}

function updateFile(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // import文を更新
  if (content.includes('typedScreenRef') && !content.includes('typedScreenActionRef')) {
    content = content.replace(
      /from '\.\.\/\.\.\/typed-references\.js';/,
      `from '../../typed-references.js';\n// typedScreenActionRef を追加しました`
    );
    content = content.replace(
      /import \{ (typed[^}]+) \} from/,
      'import { $1, typedScreenActionRef } from'
    );
    modified = true;
  }

  // trigger を更新
  const lines = content.split('\n');
  const newLines: string[] = [];
  let currentFromScreenId: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // from を検出
    if (line.includes('from: typedScreenRef(')) {
      currentFromScreenId = extractScreenId(line);
      newLines.push(line);
      continue;
    }

    // trigger を更新
    if (line.includes('trigger:') && line.includes("'") && !line.includes('typedScreenActionRef')) {
      const match = line.match(/trigger:\s*'([^']+)'/);
      if (match && currentFromScreenId) {
        const actionId = match[1];
        const indent = line.match(/^\s*/)?.[0] || '';
        newLines.push(`${indent}trigger: typedScreenActionRef('${currentFromScreenId}', '${actionId}'),`);
        modified = true;
        continue;
      }
    }

    newLines.push(line);
  }

  if (modified) {
    writeFileSync(filePath, newLines.join('\n'));
    return true;
  }

  return false;
}

function main() {
  console.log('🔄 画面フローのトリガーを更新中...\n');

  const files = readdirSync(SCREEN_FLOWS_DIR)
    .filter(f => f.endsWith('.ts'))
    .map(f => path.join(SCREEN_FLOWS_DIR, f));

  let updatedCount = 0;

  for (const file of files) {
    const fileName = path.basename(file);
    try {
      if (updateFile(file)) {
        console.log(`✅ ${fileName}`);
        updatedCount++;
      } else {
        console.log(`⏭️  ${fileName} (変更なし)`);
      }
    } catch (error) {
      console.error(`❌ ${fileName}:`, error);
    }
  }

  console.log(`\n📊 ${updatedCount}個のファイルを更新しました`);
}

main();
