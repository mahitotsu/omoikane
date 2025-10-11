/**
 * @fileoverview 命名規約の一貫性評価
 *
 * **目的:**
 * プロジェクト全体の命名規約を評価し、一貫性のない命名を検出します。
 *
 * **評価対象:**
 * 1. ID命名規則（要素ID）
 * 2. stepId命名規則
 * 3. ファイル名命名規則
 *
 * **使用例:**
 * ```typescript
 * import { assessNamingConsistency } from './naming-consistency.js';
 *
 * const result = assessNamingConsistency(actors, useCases, businessRequirements);
 * console.log(`命名規約スコア: ${result.overallScore}/100`);
 * ```
 *
 * @module quality/validators/naming-consistency
 */

import type {
    Actor,
    BusinessRequirementDefinition,
    Screen,
    ScreenFlow,
    UseCase,
    ValidationRule,
} from '../../types/index.js';

// ============================================================================
// 型定義
// ============================================================================

/**
 * 命名スタイル
 */
export type NamingStyle =
  | 'kebab-case' // 推奨: 'reservation-booking'
  | 'camel-case' // 'reservationBooking'
  | 'snake-case' // 'reservation_booking'
  | 'pascal-case' // 'ReservationBooking'
  | 'inconsistent'; // 混在

/**
 * 命名スタイル検出結果
 */
export interface NamingStyleAnalysis {
  style: NamingStyle;
  examples: string[];
}

/**
 * ID命名規則の評価結果
 */
export interface IdNamingAssessment {
  total: number;
  kebabCase: string[];
  camelCase: string[];
  snakeCase: string[];
  pascalCase: string[];
  inconsistent: string[];
  score: number; // 0-100
}

/**
 * stepId命名規則の評価結果
 */
export interface StepIdNamingAssessment {
  totalUseCases: number;
  totalSteps: number;
  kebabCase: number;
  camelCase: number;
  numeric: number; // '1', '2' などの数字のみ
  inconsistent: number;
  inconsistentUseCases: Array<{
    useCaseId: string;
    useCaseName: string;
    stepIds: string[];
    detectedStyles: NamingStyle[];
  }>;
  score: number; // 0-100
}

/**
 * ファイル名命名規則の評価結果
 */
export interface FileNamingAssessment {
  total: number;
  kebabCase: string[];
  camelCase: string[];
  pascalCase: string[];
  inconsistent: string[];
  score: number; // 0-100
}

/**
 * 命名規約の一貫性評価結果
 */
export interface NamingConsistencyAssessment {
  overallScore: number; // 0-100
  idNaming: IdNamingAssessment;
  stepIdNaming: StepIdNamingAssessment;
  fileNaming: FileNamingAssessment;
  recommendations: Array<{
    category: 'id' | 'step-id' | 'file';
    priority: 'high' | 'medium' | 'low';
    message: string;
    affectedElements: string[];
    suggestedAction: string;
  }>;
}

// ============================================================================
// 命名スタイル検出
// ============================================================================

/**
 * 文字列の命名スタイルを検出
 *
 * **アルゴリズム:**
 * 1. ハイフン区切り → kebab-case
 * 2. アンダースコア区切り → snake-case
 * 3. 大文字始まり+キャメル → PascalCase
 * 4. 小文字始まり+キャメル → camelCase
 * 5. 上記以外 → inconsistent
 *
 * @param name - 検証する文字列
 * @returns 命名スタイル
 */
export function detectNamingStyle(name: string): NamingStyle {
  if (!name || name.length === 0) {
    return 'inconsistent';
  }

  // kebab-case: 小文字とハイフンのみ
  if (/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    return 'kebab-case';
  }

  // snake_case: 小文字とアンダースコアのみ
  if (/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(name)) {
    return 'snake-case';
  }

  // PascalCase: 大文字始まり、キャメルケース
  if (/^[A-Z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(name)) {
    return 'pascal-case';
  }

  // camelCase: 小文字始まり、キャメルケース
  if (/^[a-z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(name)) {
    return 'camel-case';
  }

  return 'inconsistent';
}

/**
 * 文字列をケバブケースに変換
 *
 * @param name - 変換する文字列
 * @returns ケバブケース文字列
 */
export function toKebabCase(name: string): string {
  return (
    name
      // PascalCase/camelCase → kebab-case
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // snake_case → kebab-case
      .replace(/_/g, '-')
      .toLowerCase()
  );
}

// ============================================================================
// ID命名規則の評価
// ============================================================================

/**
 * ID命名規則を評価
 *
 * **評価内容:**
 * - ケバブケースの使用率を計算
 * - スコア = ケバブケース率 × 100
 *
 * @param elements - 評価対象の要素
 * @returns ID命名規則の評価結果
 */
export function assessIdNaming(
  elements: Array<{ id: string; name?: string }>
): IdNamingAssessment {
  const kebabCase: string[] = [];
  const camelCase: string[] = [];
  const snakeCase: string[] = [];
  const pascalCase: string[] = [];
  const inconsistent: string[] = [];

  for (const element of elements) {
    const style = detectNamingStyle(element.id);
    switch (style) {
      case 'kebab-case':
        kebabCase.push(element.id);
        break;
      case 'camel-case':
        camelCase.push(element.id);
        break;
      case 'snake-case':
        snakeCase.push(element.id);
        break;
      case 'pascal-case':
        pascalCase.push(element.id);
        break;
      default:
        inconsistent.push(element.id);
    }
  }

  const total = elements.length;
  const score = total > 0 ? (kebabCase.length / total) * 100 : 100;

  return {
    total,
    kebabCase,
    camelCase,
    snakeCase,
    pascalCase,
    inconsistent,
    score,
  };
}

// ============================================================================
// stepId命名規則の評価
// ============================================================================

/**
 * stepId命名規則を評価
 *
 * **評価内容:**
 * - 各ユースケース内でstepIdの一貫性をチェック
 * - ユースケース内で複数のスタイルが混在する場合は警告
 *
 * @param useCases - ユースケース配列
 * @returns stepId命名規則の評価結果
 */
export function assessStepIdNaming(
  useCases: UseCase[]
): StepIdNamingAssessment {
  let totalSteps = 0;
  let kebabCase = 0;
  let camelCase = 0;
  let numeric = 0;
  let inconsistent = 0;

  const inconsistentUseCases: Array<{
    useCaseId: string;
    useCaseName: string;
    stepIds: string[];
    detectedStyles: NamingStyle[];
  }> = [];

  for (const useCase of useCases) {
    const allSteps = [
      ...useCase.mainFlow,
      ...(useCase.alternativeFlows?.flatMap((f) => f.steps || []) || []),
    ];

    const stepIds = allSteps.map((s) => s.stepId).filter((id): id is string => id !== undefined);
    const styles = new Set<NamingStyle>();

    for (const stepId of stepIds) {
      totalSteps++;

      // 数字のみの場合
      if (/^\d+$/.test(stepId)) {
        numeric++;
        styles.add('inconsistent'); // 数字のみは非推奨
        continue;
      }

      const style = detectNamingStyle(stepId);
      styles.add(style);

      switch (style) {
        case 'kebab-case':
          kebabCase++;
          break;
        case 'camel-case':
          camelCase++;
          break;
        default:
          inconsistent++;
      }
    }

    // ユースケース内でスタイルが混在している場合
    if (styles.size > 1) {
      inconsistentUseCases.push({
        useCaseId: useCase.id,
        useCaseName: useCase.name,
        stepIds,
        detectedStyles: Array.from(styles),
      });
    }
  }

  const score =
    totalSteps > 0
      ? ((kebabCase / totalSteps) * 100 - inconsistentUseCases.length * 5) // 混在ペナルティ
      : 100;

  return {
    totalUseCases: useCases.length,
    totalSteps,
    kebabCase,
    camelCase,
    numeric,
    inconsistent,
    inconsistentUseCases,
    score: Math.max(0, score),
  };
}

// ============================================================================
// ファイル名命名規則の評価
// ============================================================================

/**
 * ファイル名からベース名を抽出（拡張子を除く）
 *
 * @param filePath - ファイルパス
 * @returns ベース名
 */
function extractBasename(filePath: string): string {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.(ts|js|tsx|jsx)$/, '');
}

/**
 * ファイル名命名規則を評価
 *
 * **評価内容:**
 * 1. ファイル名のスタイル（kebab-case推奨）
 * 2. 特殊ファイル名は除外（index, typed-references, actors等）
 *
 * @param filePaths - ファイルパス配列
 * @returns ファイル名命名規則の評価結果
 */
export function assessFileNaming(filePaths: string[]): FileNamingAssessment {
  // 評価対象外のファイル名パターン
  const excludePatterns = [
    'index',
    'typed-references',
    'actors',
    'business-requirements',
    'validation-rules',
  ];

  // ベース名を抽出し、除外パターンをフィルタ
  const basenames = filePaths
    .map(extractBasename)
    .filter((name) => !excludePatterns.includes(name));

  if (basenames.length === 0) {
    // 評価対象がない場合は100点
    return {
      total: 0,
      kebabCase: [],
      camelCase: [],
      pascalCase: [],
      inconsistent: [],
      score: 100,
    };
  }

  const kebabCase: string[] = [];
  const camelCase: string[] = [];
  const pascalCase: string[] = [];
  const inconsistent: string[] = [];

  for (const name of basenames) {
    const style = detectNamingStyle(name);
    switch (style) {
      case 'kebab-case':
        kebabCase.push(name);
        break;
      case 'camel-case':
        camelCase.push(name);
        break;
      case 'pascal-case':
        pascalCase.push(name);
        break;
      default:
        inconsistent.push(name);
    }
  }

  // スコア計算（kebab-caseの割合）
  const score = (kebabCase.length / basenames.length) * 100;

  return {
    total: basenames.length,
    kebabCase,
    camelCase,
    pascalCase,
    inconsistent,
    score,
  };
}

// ============================================================================
// 統合評価
// ============================================================================

/**
 * 命名規約の一貫性を総合評価
 *
 * **評価内容:**
 * 1. ID命名規則（50%）
 * 2. stepId命名規則（40%）
 * 3. ファイル名命名規則（10%）
 *
 * **推奨事項生成:**
 * - スコアが80点未満の項目について具体的な推奨事項を生成
 *
 * @param actors - アクター配列
 * @param useCases - ユースケース配列
 * @param businessRequirements - 業務要件定義配列
 * @param screens - 画面配列（オプション）
 * @param validationRules - バリデーションルール配列（オプション）
 * @param screenFlows - 画面フロー配列（オプション）
 * @param filePaths - 評価対象のファイルパス配列（オプション）
 * @returns 命名規約の一貫性評価結果
 */
export function assessNamingConsistency(
  actors: Actor[],
  useCases: UseCase[],
  businessRequirements: BusinessRequirementDefinition[],
  screens?: Screen[],
  validationRules?: ValidationRule[],
  screenFlows?: ScreenFlow[],
  filePaths?: string[]
): NamingConsistencyAssessment {
  // 全要素を統合
  const allElements = [
    ...actors,
    ...useCases,
    ...businessRequirements,
    ...(screens || []),
    ...(validationRules || []),
    ...(screenFlows || []),
  ];

  // 各評価を実行
  const idNaming = assessIdNaming(allElements);
  const stepIdNaming = assessStepIdNaming(useCases);
  const fileNaming = assessFileNaming(filePaths || []);

  // 総合スコア計算（重み付け平均）
  const overallScore =
    idNaming.score * 0.5 + stepIdNaming.score * 0.4 + fileNaming.score * 0.1;

  // 推奨事項生成
  const recommendations: NamingConsistencyAssessment['recommendations'] = [];

  // ID命名規則の推奨
  if (idNaming.score < 80) {
    if (idNaming.camelCase.length > 0) {
      recommendations.push({
        category: 'id',
        priority: 'high',
        message: `ID命名規則: ${idNaming.camelCase.length}個の要素でキャメルケースが使用されています。ケバブケースに統一してください`,
        affectedElements: idNaming.camelCase,
        suggestedAction: `以下のIDをケバブケースに変更してください:\n${idNaming.camelCase.map((id) => `  - ${id} → ${toKebabCase(id)}`).join('\n')}`,
      });
    }

    if (idNaming.snakeCase.length > 0) {
      recommendations.push({
        category: 'id',
        priority: 'medium',
        message: `ID命名規則: ${idNaming.snakeCase.length}個の要素でスネークケースが使用されています。ケバブケースに統一してください`,
        affectedElements: idNaming.snakeCase,
        suggestedAction: `以下のIDをケバブケースに変更してください:\n${idNaming.snakeCase.map((id) => `  - ${id} → ${toKebabCase(id)}`).join('\n')}`,
      });
    }

    if (idNaming.pascalCase.length > 0) {
      recommendations.push({
        category: 'id',
        priority: 'high',
        message: `ID命名規則: ${idNaming.pascalCase.length}個の要素でパスカルケースが使用されています。ケバブケースに統一してください`,
        affectedElements: idNaming.pascalCase,
        suggestedAction: `以下のIDをケバブケースに変更してください:\n${idNaming.pascalCase.map((id) => `  - ${id} → ${toKebabCase(id)}`).join('\n')}`,
      });
    }
  }

  // stepId命名規則の推奨
  if (stepIdNaming.score < 80) {
    if (stepIdNaming.numeric > 0) {
      recommendations.push({
        category: 'step-id',
        priority: 'medium',
        message: `stepId命名規則: ${stepIdNaming.numeric}個のステップで数字のみが使用されています。意味のあるIDに変更してください`,
        affectedElements: [],
        suggestedAction:
          'stepIdは意味のあるケバブケース（例: select-datetime, confirm-booking）を使用してください',
      });
    }

    if (stepIdNaming.inconsistentUseCases.length > 0) {
      for (const uc of stepIdNaming.inconsistentUseCases) {
        recommendations.push({
          category: 'step-id',
          priority: 'high',
          message: `stepId命名規則: ユースケース「${uc.useCaseName}」内でstepIdのスタイルが混在しています`,
          affectedElements: [uc.useCaseId],
          suggestedAction: `ユースケース内でケバブケースに統一してください:\n${uc.stepIds.map((id) => `  - ${id}${detectNamingStyle(id) !== 'kebab-case' ? ` → ${toKebabCase(id)}` : ''}`).join('\n')}`,
        });
      }
    }
  }

  // ファイル名命名規則の推奨
  if (fileNaming.score < 80 && fileNaming.total > 0) {
    if (fileNaming.camelCase.length > 0) {
      recommendations.push({
        category: 'file',
        priority: 'medium',
        message: `ファイル名命名規則: ${fileNaming.camelCase.length}個のファイルでキャメルケースが使用されています。ケバブケースに統一してください`,
        affectedElements: fileNaming.camelCase,
        suggestedAction: `以下のファイル名をケバブケースに変更してください:\n${fileNaming.camelCase.map((name) => `  - ${name}.ts → ${toKebabCase(name)}.ts`).join('\n')}`,
      });
    }

    if (fileNaming.pascalCase.length > 0) {
      recommendations.push({
        category: 'file',
        priority: 'medium',
        message: `ファイル名命名規則: ${fileNaming.pascalCase.length}個のファイルでパスカルケースが使用されています。ケバブケースに統一してください`,
        affectedElements: fileNaming.pascalCase,
        suggestedAction: `以下のファイル名をケバブケースに変更してください:\n${fileNaming.pascalCase.map((name) => `  - ${name}.ts → ${toKebabCase(name)}.ts`).join('\n')}`,
      });
    }

    if (fileNaming.inconsistent.length > 0) {
      recommendations.push({
        category: 'file',
        priority: 'low',
        message: `ファイル名命名規則: ${fileNaming.inconsistent.length}個のファイルで一貫性のない命名が使用されています`,
        affectedElements: fileNaming.inconsistent,
        suggestedAction: `ファイル名をケバブケースに統一してください`,
      });
    }
  }

  return {
    overallScore,
    idNaming,
    stepIdNaming,
    fileNaming,
    recommendations,
  };
}
