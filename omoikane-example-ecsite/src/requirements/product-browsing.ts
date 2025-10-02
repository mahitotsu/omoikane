import type { Actor, UseCase } from "omoikane-metamodel";
import { typedActorRef } from "../typed-references.js";

/**
 * 商品検索・閲覧関連ユースケース
 * 商品検索、商品詳細表示、カート機能などの顧客向け機能
 */

// レコメンデーションエンジンアクター
export const recommendationEngine: Actor = {
  id: 'recommendation-engine',
  type: 'actor',
  owner: 'data-scientist',
  name: 'レコメンデーションエンジン',
  description: '顧客の行動履歴と嗜好に基づいて商品推薦を行うAIシステム',
  role: 'external',
  responsibilities: [
    '個人化された商品推薦',
    '協調フィルタリング分析',
    '購買履歴分析',
    'A/Bテスト結果の学習',
    'リアルタイム推薦更新',
    '推薦精度の継続改善'
  ]
};

// カートサービスアクター
export const cartService: Actor = {
  id: 'cart-service',
  type: 'actor',
  owner: 'system-architect',
  name: 'ショッピングカートサービス',
  description: '顧客のカート情報を管理するサービス',
  role: 'external',
  responsibilities: [
    'カート内商品の管理',
    'セッションカートの永続化',
    'カート内商品の在庫チェック',
    'カート総額の計算',
    'カート内容の同期',
    'カート履歴の保持'
  ]
};

// 商品検索ユースケース
export const productSearch: UseCase = {
  id: 'product-search',
  type: 'usecase',
  owner: 'business-analyst',
  name: '商品検索',
  description: '顧客がキーワードやカテゴリから商品を検索する',
  actors: {
    primary: typedActorRef('customer'),
    secondary: [
      typedActorRef('search-service'),
      typedActorRef('database-system'),
      typedActorRef('recommendation-engine')
    ]
  },
  preconditions: [
    'ECサイトにアクセスしている',
    '商品データベースが利用可能',
    '検索サービスが正常動作'
  ],
  postconditions: [
    '検索結果が表示される',
    '検索履歴が記録される',
    '関連商品が推薦される',
    'ユーザーの行動データが蓄積される'
  ],
  mainFlow: [
    {
      stepId: 'enter-search-keyword',
      actor: typedActorRef('customer'),
      action: 'トップページまたは任意のページで検索ボックスにキーワードを入力',
      expectedResult: '入力補完機能により候補キーワードが表示される',
      notes: '検索キーワード入力'
    },
    {
      stepId: 'execute-search',
      actor: typedActorRef('customer'),
      action: '検索ボタンをクリックするか、Enterキーを押して検索を実行',
      expectedResult: '検索処理が開始され、検索結果ページに遷移する',
      notes: '検索実行'
    },
    {
      stepId: 'perform-search',
      actor: typedActorRef('search-service'),
      action: '入力されたキーワードに対して全文検索とフィルタリングを実行',
      expectedResult: '関連性の高い商品がスコア順で抽出される',
      notes: '商品検索処理'
    },
    {
      stepId: 'fetch-product-data',
      actor: typedActorRef('database-system'),
      action: '商品情報、在庫状況、価格情報を取得',
      expectedResult: '最新の商品データが正確に取得される',
      notes: '商品データ取得'
    },
    {
      stepId: 'generate-recommendations',
      actor: typedActorRef('recommendation-engine'),
      action: '顧客の検索履歴と嗜好に基づいて関連商品とおすすめ商品を生成',
      expectedResult: 'パーソナライズされた推薦商品リストが作成される',
      notes: '商品推薦生成'
    },
    {
      stepId: 'filter-results',
      actor: typedActorRef('customer'),
      action: '検索結果を確認し、フィルタ（価格帯・ブランド・評価等）で絞り込み',
      expectedResult: '検索結果が適切にフィルタリングされて表示される',
      notes: '検索結果の確認・絞り込み'
    },
    {
      stepId: 'view-product-details',
      actor: typedActorRef('customer'),
      action: '商品画像をクリックして商品詳細ページに遷移',
      expectedResult: '選択した商品の詳細情報が表示される',
      notes: '商品詳細への遷移'
    }
  ],
  alternativeFlows: [
    {
      id: 'no-search-results',
      name: '検索結果なし',
      condition: '入力されたキーワードに該当する商品が存在しない',
      steps: [
        {
          stepId: 'detect-no-results',
          actor: typedActorRef('search-service'),
          action: '検索結果0件を検知し、類似キーワード・同義語・カテゴリ提案を生成',
          expectedResult: '代替検索戦略が自動的に準備される'
        },
        {
          stepId: 'generate-alternatives',
          actor: typedActorRef('recommendation-engine'),
          action: '顧客の検索履歴と嗜好に基づいて関連商品を推薦',
          expectedResult: 'パーソナライズされた代替商品が提示される'
        },
        {
          stepId: 'explore-alternatives',
          actor: typedActorRef('customer'),
          action: '「検索結果がありません」メッセージと共に、類似キーワード・人気商品・カテゴリ一覧を確認',
          expectedResult: '多様な代替手段により商品発見が継続される'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    },
    {
      id: 'search-service-error',
      name: '検索サービス障害',
      condition: '検索サービスがエラーまたはタイムアウトした',
      steps: [
        {          actor: typedActorRef('search-service'),
          action: 'サービス障害を検知し、フォールバック検索（単純LIKE検索・カテゴリ検索）に自動切り替え',
          expectedResult: '限定的だが基本的な検索機能が維持される'
        },
        {          actor: typedActorRef('database-system'),
          action: 'データベース直接検索により最低限の商品情報を取得',
          expectedResult: '検索精度は低いが商品発見は可能な状態'
        },
        {          actor: typedActorRef('customer'),
          action: '簡易検索結果を確認し、詳細検索は後ほど再試行',
          expectedResult: '基本的な商品閲覧により購買機会が保持される'
        }
      ],
      returnToStepId: 'perform-search'
    },
    {
      id: 'high-traffic-slowdown',
      name: 'アクセス集中による検索遅延',
      condition: 'セール・キャンペーン時のアクセス集中により検索が遅延',
      steps: [
        {          actor: typedActorRef('search-service'),
          action: '高負荷状態を検知し、検索処理の優先度制御と結果キャッシュを活用',
          expectedResult: '処理速度は低下するが安定した検索サービスを維持'
        },
        {          actor: typedActorRef('customer'),
          action: '検索遅延の案内を確認し、処理完了まで待機',
          expectedResult: '遅延状況と予想待ち時間が明示される'
        },
        {          actor: typedActorRef('recommendation-engine'),
          action: 'キャッシュされた人気商品・トレンド商品を即座に表示',
          expectedResult: '検索結果待ちの間に商品閲覧が可能'
        }
      ],
      returnToStepId: 'perform-search'
    },
    {
      id: 'inappropriate-search-query',
      name: '不適切な検索クエリ',
      condition: '禁止ワード・不正な文字列・過度に長いクエリが入力された',
      steps: [
        {          actor: typedActorRef('search-service'),
          action: '不適切クエリを検知し、フィルタリングルールに基づいて処理',
          expectedResult: '不適切コンテンツから安全に保護される'
        },
        {          actor: typedActorRef('customer'),
          action: '適切な検索ワードの入力を案内するメッセージを確認',
          expectedResult: '安全で効果的な検索方法が案内される'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    },
    {
      id: 'personalization-failure',
      name: '個人化推薦エラー',
      condition: '推薦エンジンが正常に動作せず個人化されたおすすめが表示されない',
      steps: [
        {          actor: typedActorRef('recommendation-engine'),
          action: '推薦アルゴリズムの障害を検知し、汎用的な人気商品にフォールバック',
          expectedResult: '個人化はないが一般的なおすすめが提供される'
        },
        {          actor: typedActorRef('customer'),
          action: '一般的な人気商品・新着商品・セール商品を閲覧',
          expectedResult: 'パーソナライズなしでも商品発見が継続される'
        }
      ],
      returnToStepId: 'generate-recommendations'
    }
  ],
  businessValue: '商品発見の向上による売上増加と顧客体験の改善',
  priority: 'high',
  
  // 詳細仕様
  complexity: 'complex',
  estimatedEffort: '12-15人日',
  acceptanceCriteria: [
    '検索応答時間は2秒以内',
    '入力補完は200ms以内で表示',
    '検索結果は関連性順で表示',
    '全文検索と部分一致の両方をサポート',
    'スペルミスの自動補正機能',
    'フィルタ機能は即座に反映される'
  ],
  businessRules: [
    '在庫切れ商品は検索結果の最後に表示',
    '販売停止商品は検索対象外',
    '検索履歴は30日間保持',
    '類似商品推薦は最大20件',
    '検索キーワードは50文字まで',
    'ゲストユーザーも検索利用可能'
  ],
  dataRequirements: [
    '商品マスタ（商品名、説明、カテゴリ、価格）',
    '在庫情報（現在数量、予約数量）',
    '検索インデックス（全文検索用）',
    '顧客検索履歴（キーワード、検索日時）',
    '商品評価データ（平均評価、レビュー数）',
    '商品画像データ（メイン画像、サブ画像）'
  ],
  securityRequirements: [
    'SQLインジェクション対策',
    '不正なキーワードのフィルタリング',
    '検索APIのレート制限',
    '個人情報を含む検索ログの適切な管理'
  ],
  performanceRequirements: [
    '検索応答時間: 2秒以内',
    '同時検索処理: 1000リクエスト/秒',
    '検索インデックス更新: 15分以内',
    '推薦生成時間: 500ms以内',
    'システム稼働率: 99.9%以上'
  ],
  uiRequirements: [
    'インクリメンタル検索（入力補完）',
    '検索結果のページネーション',
    '直感的なフィルタUI',
    '検索結果の並び替えオプション',
    'モバイル端末での操作性確保',
    '商品画像の遅延読み込み',
    '無限スクロール対応（オプション）'
  ]
};

// ショッピングカート管理ユースケース
export const cartManagement: UseCase = {
  id: 'cart-management',
  type: 'usecase',
  owner: 'business-analyst',
  name: 'ショッピングカート管理',
  description: '顧客が商品をカートに追加・削除・数量変更を行う',
  actors: {
    primary: typedActorRef('customer'),
    secondary: [
      typedActorRef('cart-service'),
      typedActorRef('inventory-system'),
      typedActorRef('database-system')
    ]
  },
  preconditions: [
    '商品詳細ページまたは商品一覧ページにアクセス',
    '対象商品が販売可能状態',
    'カートサービスが正常動作'
  ],
  postconditions: [
    'カート内容が更新される',
    'カート総額が再計算される',
    '在庫数が適切に引当される',
    'カート内容がセッションまたはDBに保存される'
  ],
  mainFlow: [
    {      actor: typedActorRef('customer'),
      action: '商品詳細ページで数量を選択し「カートに追加」ボタンをクリック',
      expectedResult: '商品がカートに追加され、成功メッセージが表示される',
      notes: '商品のカート追加'
    },
    {      actor: typedActorRef('inventory-system'),
      action: '商品の在庫数を確認し、指定数量が利用可能かチェック',
      expectedResult: '在庫が十分な場合は仮引当、不足の場合はエラーが返される',
      notes: '在庫確認・仮引当'
    },
    {      actor: typedActorRef('cart-service'),
      action: 'カート内容を更新し、重複商品は数量を加算',
      expectedResult: 'カート内の商品リストが正確に更新される',
      notes: 'カート内容更新'
    },
    {      actor: typedActorRef('cart-service'),
      action: 'カート内全商品の総額を再計算（税込・配送料含む）',
      expectedResult: '最新の価格で正確な総額が算出される',
      notes: '総額再計算'
    },
    {      actor: typedActorRef('customer'),
      action: 'カートアイコンの商品数更新と合計金額を確認',
      expectedResult: 'ヘッダーのカートアイコンに正しい商品数と金額が表示される',
      notes: 'カート状態の反映'
    },
    {      actor: typedActorRef('customer'),
      action: 'カートページで商品の数量変更・削除・追加を実行',
      expectedResult: 'カート内容がリアルタイムで更新される',
      notes: 'カート内容の編集'
    },
    {      actor: typedActorRef('customer'),
      action: '注文手続きに進むか、買い物を継続するかを選択',
      expectedResult: '注文確認画面への遷移または商品閲覧の継続',
      notes: '次アクションの選択'
    }
  ],
  alternativeFlows: [
    {
      id: 'insufficient-stock',
      name: '在庫不足',
      condition: 'カートに追加しようとした数量が在庫を超えている',
      steps: [
        {          actor: typedActorRef('inventory-system'),
          action: '在庫不足を検知し、利用可能な最大数量と次回入荷予定を確認',
          expectedResult: '現在の在庫数と入荷スケジュールが明確に表示される'
        },
        {          actor: typedActorRef('recommendation-engine'),
          action: '在庫切れ商品の代替品や類似商品を推薦',
          expectedResult: '代替商品の提案により購買機会が維持される'
        },
        {          actor: typedActorRef('customer'),
          action: '在庫数の範囲内でカート追加、代替商品選択、または入荷通知登録を選択',
          expectedResult: '最適な選択肢により顧客満足度が保たれる'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    },
    {
      id: 'cart-limit-exceeded',
      name: 'カート上限超過',
      condition: 'カート内商品数が上限（例：50個）を超えようとしている',
      steps: [
        {          actor: typedActorRef('cart-service'),
          action: 'カート上限超過を検知し、現在のカート状況を分析',
          expectedResult: 'カート使用状況と制限理由が明確になる'
        },
        {          actor: typedActorRef('customer'),
          action: '既存商品の削除、数量調整、または複数注文への分割を選択',
          expectedResult: '柔軟な対応により購買継続が可能'
        },
        {          actor: typedActorRef('cart-service'),
          action: '選択された調整方法に基づいてカート内容を最適化',
          expectedResult: '制限内で最大限の商品がカートに保持される'
        }
      ],
      returnToStepId: 'filter-results'
    },
    {
      id: 'price-change-detected',
      name: '価格変動検知',
      condition: 'カート内商品の価格が商品追加後に変動している',
      steps: [
        {          actor: typedActorRef('cart-service'),
          action: '価格変動を検知し、変動理由（セール終了・値上げ・システム更新）を特定',
          expectedResult: '価格変動の詳細と影響額が明確になる'
        },
        {          actor: typedActorRef('customer'),
          action: '価格変動通知を確認し、新価格での購入継続または商品削除を選択',
          expectedResult: '透明性のある価格情報により信頼関係が維持される'
        },
        {          actor: typedActorRef('cart-service'),
          action: '顧客の選択に基づいてカート内容と総額を更新',
          expectedResult: '最新価格での正確な注文準備が完了'
        }
      ],
      returnToStepId: 'fetch-product-data'
    },
    {
      id: 'session-timeout',
      name: 'セッションタイムアウト',
      condition: 'ログインセッションが切れてカート操作ができない',
      steps: [
        {          actor: typedActorRef('cart-service'),
          action: 'セッション切れを検知し、ゲストカートとして一時保存',
          expectedResult: 'カート内容が失われることなく保護される'
        },
        {          actor: typedActorRef('customer'),
          action: '再ログインまたはゲストとして継続を選択',
          expectedResult: 'ログイン状態に関係なく購買フローが継続可能'
        },
        {          actor: typedActorRef('cart-service'),
          action: 'ログイン時に保存されたカートを復元・マージ',
          expectedResult: 'シームレスなショッピング体験が提供される'
        }
      ],
      returnToStepId: 'perform-search'
    },
    {
      id: 'product-discontinued',
      name: '商品販売停止',
      condition: 'カート内の商品が販売停止・廃番になった',
      steps: [
        {          actor: typedActorRef('database-system'),
          action: '販売停止商品を検知し、停止理由と代替商品情報を取得',
          expectedResult: '販売停止の詳細と対応策が明確になる'
        },
        {          actor: typedActorRef('recommendation-engine'),
          action: '停止商品の後継品・類似商品・代替品を推薦',
          expectedResult: '購買意欲を維持する代替選択肢が提供される'
        },
        {          actor: typedActorRef('customer'),
          action: '代替商品の選択、カートからの削除、または入荷待ち登録を実行',
          expectedResult: '販売停止による影響が最小限に抑えられる'
        }
      ],
      returnToStepId: 'perform-search'
    },
    {
      id: 'cart-synchronization-conflict',
      name: 'カート同期競合',
      condition: '複数デバイスで同時にカート操作を行い競合が発生',
      steps: [
        {          actor: typedActorRef('cart-service'),
          action: '複数デバイス間のカート状態競合を検知し、最新タイムスタンプを基準に統合',
          expectedResult: 'デバイス間でのカート不整合が解消される'
        },
        {          actor: typedActorRef('customer'),
          action: '同期結果を確認し、必要に応じてカート内容を調整',
          expectedResult: '統合されたカート状態で購買フローが継続される'
        }
      ],
      returnToStepId: 'perform-search'
    }
  ],
  businessValue: '購買意欲の維持と確実な売上機会の確保',
  priority: 'high',
  
  // 詳細仕様
  complexity: 'medium',
  estimatedEffort: '8-10人日',
  acceptanceCriteria: [
    'カート操作は1秒以内に反映',
    'ページ遷移してもカート内容が保持',
    '在庫不足時は適切なメッセージ表示',
    'ゲストユーザーのカートも30日間保持',
    'カート総額は税込み・配送料込みで表示',
    'モバイル端末でも操作しやすいUI'
  ],
  businessRules: [
    'カート保持期間は30日間',
    '商品1つあたりの最大数量は99個',
    'カート全体の商品種類上限は50種類',
    '在庫仮引当は30分間有効',
    '価格変動時は最新価格を適用',
    'ログイン時にゲストカートをマージ'
  ],
  dataRequirements: [
    'カート情報（ユーザーID、商品ID、数量、追加日時）',
    '商品情報（価格、在庫数、販売状態）',
    'セッション情報（ゲストユーザー識別）',
    '在庫引当情報（仮引当数量、期限）'
  ],
  securityRequirements: [
    '他ユーザーのカート情報へのアクセス禁止',
    'セッションハイジャック対策',
    'カート操作のCSRF対策',
    '価格情報の改ざん防止'
  ],
  performanceRequirements: [
    'カート操作応答: 1秒以内',
    '総額計算: 500ms以内',
    '同時カート操作: 2000ユーザー対応',
    'カートデータ同期: リアルタイム'
  ],
  uiRequirements: [
    'カート商品数のリアルタイム表示',
    '数量変更時の即座な総額更新',
    '商品削除時の確認ダイアログ',
    'カート内商品の画像表示',
    '関連商品・おすすめ商品の表示',
    'カート保存期間の明示'
  ]
};