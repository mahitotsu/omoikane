/**
 * 品質評価フレームワークのデモ
 * 予約システムの品質を評価してAI Agent向けの推奨アクションを生成
 */

import { performQualityAssessment } from '../src/quality/index.js';

// 予約システムのサンプルデータをインポート（実際には reservation example から取得）
const sampleBusinessRequirements = {
  id: 'business-req-reservation-system',
  type: 'business-requirement' as const,
  owner: 'demo-author',
  title: '予約システムの業務要件',
  summary: '効率的な予約管理システムの実現',
  businessGoals: [
    {
      id: 'goal-increase-efficiency',
      description: '予約業務の効率化を図る',
    },
    {
      id: 'goal-customer-satisfaction',
      description: '顧客満足度を向上させる',
    },
  ],
  scope: {
    inScope: [
      {
        id: 'scope-reservation-management',
        description: '予約の作成、変更、削除',
      },
      {
        id: 'scope-staff-management',
        description: 'スタッフアカウントの管理',
      },
    ],
    outOfScope: [],
  },
  stakeholders: [
    {
      id: 'stakeholder-customers',
      description: 'サービスを利用する顧客',
    },
    {
      id: 'stakeholder-staff',
      description: 'サービスを提供するスタッフ',
    },
  ],
  constraints: [
    {
      id: 'constraint-staff-change-anytime-unless-checked-in',
      description: 'スタッフは、チェックイン済みでない限り、いつでも予約の変更・取り消しができる',
    },
  ],
  assumptions: [],
  successMetrics: [],
};

const sampleActors = [
  {
    id: 'actor-customer',
    type: 'actor' as const,
    owner: 'demo-author',
    name: '顧客',
    description: 'サービスを予約・利用する人',
    role: 'primary' as const,
    responsibilities: ['予約情報を正確に提供する'],
  },
  {
    id: 'actor-staff',
    type: 'actor' as const,
    owner: 'demo-author',
    name: 'スタッフ',
    description: 'サービスを提供する従業員',
    role: 'primary' as const,
    responsibilities: ['顧客に質の高いサービスを提供する'],
  },
  {
    id: 'actor-admin',
    type: 'actor' as const,
    owner: 'demo-author',
    name: '管理者',
    description: 'システムの管理・設定を行う人',
    role: 'secondary' as const,
    responsibilities: ['ユーザーアカウントを管理する'],
  },
];

const sampleUseCases = [
  {
    id: 'usecase-create-reservation',
    type: 'usecase' as const,
    owner: 'demo-author',
    name: '予約を作成する',
    description: '顧客が新しい予約を作成する',
    priority: 'high' as const,
    actors: {
      primary: 'actor-customer',
    },
    preconditions: ['顧客が認証されている'],
    mainFlow: [
      {
        actor: 'actor-customer',
        action: 'サービス種別を選択する',
        expectedResult: 'サービス種別が選択されている',
      },
      {
        actor: 'actor-customer',
        action: '希望日時を指定する',
        expectedResult: '希望日時が入力されている',
      },
      {
        actor: 'システム',
        action: '空き状況を確認する',
        expectedResult: '空き状況が表示されている',
      },
      { actor: 'システム', action: '予約を確定する', expectedResult: '予約が確定されている' },
    ],
    postconditions: ['新しい予約が作成されている'],
    businessRequirementCoverage: {
      requirement: {
        requirementId: 'business-req-reservation-system',
        type: 'business-requirement-ref' as const,
      },
      businessGoals: [{ id: 'goal-customer-satisfaction', type: 'business-goal-ref' as const }],
      scopeItems: [{ id: 'scope-reservation-management', type: 'business-scope-ref' as const }],
      stakeholders: [{ id: 'stakeholder-customers', type: 'stakeholder-ref' as const }],
      constraints: [],
    },
  },
  {
    id: 'usecase-staff-change-reservation',
    type: 'usecase' as const,
    owner: 'demo-author',
    name: 'スタッフが予約を変更する',
    description: 'スタッフが顧客の予約内容を変更する',
    priority: 'medium' as const,
    actors: {
      primary: 'actor-staff',
    },
    preconditions: ['スタッフが認証されている', '変更対象の予約が存在する'],
    mainFlow: [
      {
        actor: 'actor-staff',
        action: '予約を検索する',
        expectedResult: '該当する予約が表示されている',
      },
      {
        actor: 'actor-staff',
        action: '予約の詳細を確認する',
        expectedResult: '予約詳細が表示されている',
      },
      {
        actor: 'actor-staff',
        action: '変更内容を入力する',
        expectedResult: '変更内容が入力されている',
      },
      { actor: 'システム', action: '変更を保存する', expectedResult: '変更が保存されている' },
    ],
    postconditions: ['予約が変更されている'],
    businessRequirementCoverage: {
      requirement: {
        requirementId: 'business-req-reservation-system',
        type: 'business-requirement-ref' as const,
      },
      businessGoals: [{ id: 'goal-increase-efficiency', type: 'business-goal-ref' as const }],
      scopeItems: [{ id: 'scope-reservation-management', type: 'business-scope-ref' as const }],
      stakeholders: [{ id: 'stakeholder-staff', type: 'stakeholder-ref' as const }],
      constraints: [
        {
          id: 'constraint-staff-change-anytime-unless-checked-in',
          type: 'constraint-ref' as const,
        },
      ],
    },
  },
];

/**
 * 品質評価デモを実行
 */
function runQualityAssessmentDemo() {
  console.log('=== 品質評価フレームワーク デモ ===\n');

  try {
    const result = performQualityAssessment(
      sampleBusinessRequirements,
      sampleActors,
      sampleUseCases
    );

    console.log('📊 品質評価結果:');
    console.log(
      `総合スコア: ${result.assessment.overallScore.value}/100 (${result.assessment.overallScore.level})`
    );
    console.log(`完全性: ${result.assessment.scores.completeness.value}/100`);
    console.log(`一貫性: ${result.assessment.scores.consistency.value}/100`);
    console.log(`妥当性: ${result.assessment.scores.validity.value}/100`);
    console.log(`追跡可能性: ${result.assessment.scores.traceability.value}/100\n`);

    console.log('🔍 発見された問題:');
    if (result.assessment.issues.length === 0) {
      console.log('  問題は発見されませんでした ✨\n');
    } else {
      result.assessment.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        console.log(`     影響: ${issue.impact}`);
        console.log(`     対応: ${issue.suggestion}\n`);
      });
    }

    console.log('📈 カバレッジレポート:');
    const { coverage } = result.assessment;
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
      `  制約条件: ${coverage.constraints.covered}/${coverage.constraints.total} (${Math.round(coverage.constraints.coverage * 100)}%)\n`
    );

    console.log('🤖 AI Agent向け推奨アクション:');
    if (result.recommendations.length === 0) {
      console.log('  追加の推奨アクションはありません ✅\n');
    } else {
      result.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
        console.log(`     理由: ${rec.rationale}`);
        console.log(`     影響要素: ${rec.affectedElements.join(', ')}\n`);
      });
    }

    console.log('=== デモ完了 ===');
  } catch (error) {
    console.error('品質評価中にエラーが発生しました:', error);
  }
}

// デモを実行
if (import.meta.url === `file://${process.argv[1]}`) {
  runQualityAssessmentDemo();
}

export { runQualityAssessmentDemo };
