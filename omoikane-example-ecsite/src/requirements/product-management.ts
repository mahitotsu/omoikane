/**
 * EC サイト - 商品管理ユースケース定義
 */

import type { Actor, UseCase } from "omoikane-metamodel";
import { typedActorRef } from "../typed-references.js";

// 商品管理関連アクター定義
export const admin: Actor = {
  id: 'admin',
  type: 'actor',
  owner: 'business-analyst',
  name: '管理者',
  description: 'ECサイトの商品や注文を管理する管理者',
  role: 'primary',
  responsibilities: [
    '商品の登録・編集・削除',
    '在庫管理',
    '注文管理',
    'ユーザー管理',
    'カテゴリ管理',
    '価格設定・変更',
    '商品画像管理'
  ]
};

export const inventorySystem: Actor = {
  id: 'inventory-system',
  type: 'actor',
  owner: 'system-architect',
  name: '在庫管理システム',
  description: '商品の在庫を管理する外部システム',
  role: 'external',
  responsibilities: [
    '在庫数量管理',
    '在庫補充アラート',
    '在庫予約・引当',
    '在庫履歴記録',
    '倉庫管理連携'
  ]
};

export const imageService: Actor = {
  id: 'image-service',
  type: 'actor',
  owner: 'system-architect',
  name: '画像管理サービス',
  description: '商品画像のアップロード、リサイズ、配信を行う外部システム',
  role: 'external',
  responsibilities: [
    '画像アップロード処理',
    '複数サイズ画像生成',
    '画像最適化・圧縮',
    'CDN配信',
    '画像メタデータ管理'
  ]
};

export const searchService: Actor = {
  id: 'search-service',
  type: 'actor',
  owner: 'system-architect',
  name: '検索エンジンサービス',
  description: '商品検索インデックスの更新と検索機能を提供する外部システム',
  role: 'external',
  responsibilities: [
    '商品検索インデックス更新',
    '全文検索機能',
    'ファセット検索',
    '検索結果ランキング',
    '検索ログ分析'
  ]
};

// ユースケース定義
// 商品登録ユースケース
export const productRegistration: UseCase = {
  id: 'product-registration',
  type: 'usecase',
  owner: 'business-analyst',
  name: '商品登録',
  description: '管理者が新しい商品をECサイトに登録する',
  actors: {
    primary: typedActorRef('admin'),
    secondary: [
      typedActorRef('inventory-system'),
      typedActorRef('image-service'),
      typedActorRef('search-service'),
      typedActorRef('database-system')
    ]
  },
  preconditions: [
    '管理者が管理画面にログインしている',
    '商品情報（名前、価格、説明等）が準備されている'
  ],
  postconditions: [
    '新しい商品がカタログに追加されている',
    '在庫管理システムに商品が登録されている',
    '商品が顧客に表示可能な状態になっている'
  ],
  mainFlow: [
    {      actor: typedActorRef('admin'),
      action: '商品管理画面にアクセスする',
      expectedResult: '商品一覧画面が表示される',
      performanceRequirement: '2秒以内にページ表示'
    },
    {      actor: typedActorRef('admin'),
      action: '「新規商品登録」ボタンをクリックする',
      expectedResult: '商品登録フォームが表示される',
      performanceRequirement: '1秒以内にフォーム表示'
    },
    {      actor: typedActorRef('admin'),
      action: '商品情報（名前、価格、カテゴリ、説明）を入力する',
      expectedResult: '入力内容がリアルタイムで検証される',
      inputData: ['商品名', '価格', 'カテゴリ', '商品説明', 'SKU', 'JANコード'],
      validationRules: [
        '商品名は100文字以内必須',
        '価格は正の数値必須',
        'カテゴリは既存リストから選択',
        'SKUは英数字のみ、重複不可',
        'JANコードは13桁数字（任意）'
      ],
      errorHandling: ['入力エラー時は該当フィールドに赤枠表示', 'エラーメッセージをフィールド下に表示']
    },
    {      actor: typedActorRef('admin'),
      action: '商品画像をアップロードする',
      expectedResult: '画像がプレビュー表示される',
      inputData: ['メイン画像', 'サブ画像（最大5枚）'],
      validationRules: [
        'ファイル形式：JPEG, PNG, WebP',
        'ファイルサイズ：10MB以下',
        '画像サイズ：最小800x600px',
        'メイン画像は必須'
      ],
      performanceRequirement: '5秒以内にアップロード完了',
      errorHandling: ['不正ファイル時はエラーメッセージ表示', 'アップロード失敗時はリトライ可能']
    },
    {      actor: typedActorRef('image-service'),
      action: '画像を最適化・リサイズし複数サイズ生成する',
      expectedResult: '複数サイズの最適化画像が生成される',
      performanceRequirement: '10秒以内に画像処理完了',
      errorHandling: ['画像処理失敗時は管理者に通知', '処理中はプログレス表示']
    },
    {      actor: typedActorRef('admin'),
      action: '初期在庫数を設定する',
      expectedResult: '在庫数が入力フィールドに表示される',
      inputData: ['初期在庫数', '最小在庫数', '最大在庫数'],
      validationRules: [
        '在庫数は0以上の整数',
        '最小在庫数は初期在庫数以下',
        '最大在庫数は初期在庫数以上'
      ],
      errorHandling: ['数値以外入力時はエラー表示', '論理矛盾時は警告表示']
    },
    {      actor: typedActorRef('admin'),
      action: '「登録」ボタンをクリックする',
      expectedResult: '商品登録処理が開始される',
      validationRules: ['全必須項目入力済み', '画像アップロード完了済み'],
      errorHandling: ['未入力項目がある場合は登録ボタン無効化']
    },
    {      actor: typedActorRef('database-system'),
      action: '商品データを永続化する',
      expectedResult: '商品レコードが作成される',
      performanceRequirement: '2秒以内にDB登録完了',
      errorHandling: ['DB障害時はロールバック', '一意制約違反時はエラー返却']
    },
    {      actor: typedActorRef('inventory-system'),
      action: '初期在庫を登録する',
      expectedResult: '在庫レコードが作成される',
      performanceRequirement: '1秒以内に在庫登録完了',
      errorHandling: ['在庫システム障害時は警告表示、後で同期']
    },
    {      actor: typedActorRef('search-service'),
      action: '検索インデックスを更新する',
      expectedResult: '商品が検索対象に追加される',
      performanceRequirement: '5秒以内にインデックス更新',
      errorHandling: ['インデックス更新失敗時は非同期で再試行']
    },
    {      actor: typedActorRef('admin'),
      action: '登録完了確認をする',
      expectedResult: '成功メッセージと商品詳細画面が表示される',
      performanceRequirement: '1秒以内に完了画面表示'
    }
  ],
  alternativeFlows: [
    {
      id: 'duplicate-sku',
      name: 'SKU重複エラー',
      condition: '入力されたSKUが既存商品と重複している',
      steps: [
        {          actor: typedActorRef('validation-service'),
          action: 'SKU重複をデータベースで確認し、重複商品の詳細情報を取得',
          expectedResult: '重複商品の情報と重複箇所が明確に特定される'
        },
        {          actor: typedActorRef('admin'),
          action: '重複商品情報を確認し、SKUを修正するか既存商品を更新するかを選択',
          expectedResult: '「SKU [XXX] は既に商品 [商品名] で使用されています」のメッセージと選択肢が表示される'
        },
        {          actor: typedActorRef('admin'),
          action: '新しいSKUを生成するか、バリエーション商品として登録',
          expectedResult: '適切なSKU管理により商品登録が継続される'
        }
      ],
      returnToStepId: 'perform-search'
    },
    {
      id: 'image-processing-failure',
      name: '画像処理失敗',
      condition: 'アップロードされた画像の処理・最適化が失敗',
      steps: [
        {          actor: typedActorRef('image-service'),
          action: '画像処理エラー（フォーマット不正・破損・サイズ異常）の詳細を分析',
          expectedResult: '失敗原因が具体的に特定される'
        },
        {          actor: typedActorRef('admin'),
          action: 'エラー内容を確認し、画像を修正して再アップロード',
          expectedResult: '画像要件に適合する形式で再アップロードが実行される'
        },
        {          actor: typedActorRef('image-service'),
          action: '代替画像処理フローまたは手動確認によるフォールバック処理',
          expectedResult: '画像処理が代替手段により完了される'
        }
      ],
      returnToStepId: 'fetch-product-data'
    },
    {
      id: 'category-validation-error',
      name: 'カテゴリ検証エラー',
      condition: '選択されたカテゴリが無効または廃止済み',
      steps: [
        {          actor: typedActorRef('validation-service'),
          action: 'カテゴリの有効性を確認し、廃止理由や代替カテゴリを特定',
          expectedResult: '無効カテゴリの状態と推奨代替案が明確になる'
        },
        {          actor: typedActorRef('admin'),
          action: '有効なカテゴリに変更するか、新しいカテゴリの作成を要求',
          expectedResult: '適切なカテゴリ分類により商品が正しく分類される'
        }
      ],
      returnToStepId: 'perform-search'
    },
    {
      id: 'inventory-system-error',
      name: '在庫システム連携エラー',
      condition: '在庫システムとの連携が失敗し在庫情報が設定できない',
      steps: [
        {          actor: typedActorRef('inventory-system'),
          action: 'システム障害・ネットワークエラー・データ不整合を検知',
          expectedResult: '在庫システムの状態と復旧予定が確認される'
        },
        {          actor: typedActorRef('admin'),
          action: '在庫情報を手動入力するか、システム復旧後に再設定',
          expectedResult: '商品登録は完了し、在庫は後で同期される'
        },
        {          actor: typedActorRef('inventory-system'),
          action: 'システム復旧後に手動入力データと自動同期',
          expectedResult: '在庫情報が正確に同期され、整合性が保たれる'
        }
      ],
      returnToStepId: 'main-step-8'
    },
    {
      id: 'search-index-failure',
      name: '検索インデックス更新失敗',
      condition: '検索サービスの障害により商品が検索対象に追加されない',
      steps: [
        {          actor: typedActorRef('search-service'),
          action: 'インデックス更新失敗を検知し、失敗キューに追加',
          expectedResult: '失敗した商品が再処理対象として記録される'
        },
        {          actor: typedActorRef('admin'),
          action: '検索対象外の警告を確認し、商品登録は継続',
          expectedResult: '商品は登録されるが一時的に検索不可状態'
        },
        {          actor: typedActorRef('search-service'),
          action: 'システム復旧後にバッチ処理でインデックスを再構築',
          expectedResult: '商品が検索可能になり、顧客に発見される'
        }
      ],
      returnToStepId: 'main-step-11'
    },
    {
      id: 'pricing-validation-error',
      name: '価格設定エラー',
      condition: '入力された価格が異常値または競合他社価格と大幅乖離',
      steps: [
        {          actor: typedActorRef('validation-service'),
          action: '価格妥当性チェック（市場価格・原価率・利益率）を実行',
          expectedResult: '価格の妥当性と警告レベルが判定される'
        },
        {          actor: typedActorRef('admin'),
          action: '価格警告を確認し、価格を修正するか承認者の確認を取得',
          expectedResult: '適正価格での商品登録または上級承認により継続'
        },
        {          actor: typedActorRef('admin'),
          action: '特別価格の場合は理由をコメントとして記録',
          expectedResult: '価格設定の根拠が記録され、後で参照可能'
        }
      ],
      returnToStepId: 'perform-search'
    },
    {
      id: 'batch-registration-error',
      name: '一括登録エラー',
      condition: 'CSV等による一括商品登録で部分的に失敗',
      steps: [
        {          actor: typedActorRef('validation-service'),
          action: '一括データの各行を検証し、成功・失敗を分類',
          expectedResult: '登録可能商品と要修正商品が明確に分離される'
        },
        {          actor: typedActorRef('admin'),
          action: '成功分を登録し、失敗分のエラーレポートを確認',
          expectedResult: '部分成功により利用可能商品から順次販売開始'
        },
        {          actor: typedActorRef('admin'),
          action: 'エラー修正後に失敗分を再度一括登録',
          expectedResult: '全商品の登録が最終的に完了される'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    }
  ],
  businessValue: '商品ラインナップの拡充により顧客選択肢を増やし売上向上を実現',
  priority: 'high',
  // 詳細化フィールド
  complexity: 'complex',
  estimatedEffort: '3-4スプリント（6-8週間）',
  acceptanceCriteria: [
    '管理者が商品情報を入力して新商品を登録できる',
    '商品画像のアップロードと最適化が正常に動作する',
    '在庫管理システムと連携して初期在庫が設定される',
    '検索サービスのインデックスが自動更新される',
    '重複する商品コードは登録を拒否する'
  ],
  businessRules: [
    '商品名は同一カテゴリ内で一意である必要がある',
    'SKUコードはシステム全体で一意である必要がある',
    '価格は0円以上99,999,999円以下',
    '商品画像は最低1枚、最大6枚まで',
    '在庫数は0以上999,999以下'
  ],
  dataRequirements: [
    '商品基本情報（名前、説明、価格、カテゴリ）',
    '商品コード（SKU、JANコード）',
    '商品画像（複数サイズ）',
    '在庫情報（初期在庫、最小在庫、最大在庫）',
    '商品ステータス（販売中、準備中、販売停止）'
  ],
  securityRequirements: [
    '管理者権限を持つユーザーのみアクセス可能',
    'CSRFトークンによるフォーム保護',
    'ファイルアップロード時のマルウェアスキャン',
    '商品データの変更ログ記録',
    'SQLインジェクション対策'
  ],
  performanceRequirements: [
    '商品登録処理は30秒以内に完了',
    '画像アップロードは10秒以内',
    '検索インデックス更新は5秒以内',
    '同時商品登録数10件/分まで対応',
    'フォーム表示は2秒以内'
  ],
  uiRequirements: [
    'ドラッグ&ドロップによる画像アップロード',
    'リアルタイムプレビュー機能',
    '入力内容の自動保存（下書き機能）',
    'プログレスインジケーター表示',
    'レスポンシブデザイン対応（タブレット対応）'
  ]
};