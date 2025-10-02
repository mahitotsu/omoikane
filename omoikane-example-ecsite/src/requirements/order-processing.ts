/**
 * EC サイト - 注文処理ユースケース定義
 */

import type { Actor, UseCase } from "omoikane-metamodel";
import { typedActorRef } from "../typed-references.js";

// 注文処理関連アクター定義
export const paymentService: Actor = {
  id: 'payment-service',
  type: 'actor',
  owner: 'system-architect',
  name: '決済サービス',
  description: 'クレジットカードや電子マネーの決済を処理する外部サービス',
  role: 'external',
  responsibilities: [
    '決済処理',
    '決済結果の通知',
    '返金処理',
    '決済手数料計算',
    '不正取引検知',
    '決済履歴管理'
  ]
};

export const shippingService: Actor = {
  id: 'shipping-service',
  type: 'actor',
  owner: 'system-architect',
  name: '配送サービス',
  description: '商品の配送を担当する物流サービス',
  role: 'external',
  responsibilities: [
    '配送料金計算',
    '配送日時予約',
    '配送状況追跡',
    '配送完了通知',
    '再配達対応'
  ]
};

export const loyaltyService: Actor = {
  id: 'loyalty-service',
  type: 'actor',
  owner: 'system-architect',
  name: 'ポイントサービス',
  description: '顧客のポイント獲得・利用を管理する外部サービス',
  role: 'external',
  responsibilities: [
    'ポイント付与計算',
    'ポイント利用処理',
    'ポイント有効期限管理',
    'ポイント履歴記録',
    'キャンペーンポイント管理'
  ]
};

// 注文処理ユースケース
export const orderProcessing: UseCase = {
  id: 'order-processing',
  type: 'usecase',
  owner: 'business-analyst',
  name: '注文処理',
  description: '顧客の注文を受け付け、決済から配送まで処理する',
  actors: {
    primary: typedActorRef('customer'), // user-registration.tsで定義済み
    secondary: [
      'payment-service',
      'shipping-service',
      'inventory-system', // product-management.tsで定義済み
      'email-service'     // user-registration.tsで定義済み
    ]
  },
  preconditions: [
    '顧客がログインしている',
    'カートに商品が追加されている',
    '選択した商品の在庫が十分にある'
  ],
  postconditions: [
    '注文が確定している',
    '決済が完了している',
    '在庫が減算されている',
    '配送が手配されている',
    '顧客に確認メールが送信されている'
  ],
  mainFlow: [
    {
      stepId: 'cart-review',
      actor: typedActorRef('customer'),
      action: 'カート画面で商品内容、数量、価格を確認し、「注文手続きへ」ボタンをクリック',
      expectedResult: '注文確認画面が表示され、在庫状況と最新価格が反映される',
      notes: 'カート内容の最終確認'
    },
    {
      stepId: 'shipping-info',
      actor: typedActorRef('customer'),
      action: '配送先住所を入力・選択し、配送方法（通常配送・お急ぎ便など）と希望日時を選択',
      expectedResult: '配送料が自動計算され、配送予定日が表示される',
      notes: '配送方法・日時の選択'
    },
    {      actor: typedActorRef('customer'),
      action: '利用可能ポイントを確認し、使用するポイント数を入力・選択',
      expectedResult: 'ポイント割引が適用され、最終支払金額が更新される',
      notes: 'ポイント利用の選択'
    },
    {      actor: typedActorRef('customer'),
      action: '決済方法（クレジットカード・電子マネー等）を選択し、決済情報を入力して「注文確定」をクリック',
      expectedResult: '決済が処理され、成功・失敗の結果が即座に表示される',
      notes: '決済処理の実行'
    },
    {      actor: typedActorRef('database-system'),
      action: '決済完了を受けて注文データをデータベースに記録し、一意の注文番号を生成',
      expectedResult: '注文レコードが正常に作成され、注文番号が発行される',
      notes: '注文レコードの生成'
    },
    {      actor: typedActorRef('inventory-system'),
      action: '注文確定商品の在庫を引当済みから確定減算に更新し、在庫レベルを調整',
      expectedResult: '商品在庫数が正確に減算され、必要に応じて再発注アラートが発生',
      notes: '在庫数の更新'
    },
    {      actor: typedActorRef('shipping-service'),
      action: '注文内容と配送先情報を基に最適な倉庫から配送計画を作成し、追跡番号を発行',
      expectedResult: '配送計画が確定し、追跡可能な配送番号が生成される',
      notes: '配送・フルフィルメントの手配'
    },
    {      actor: typedActorRef('email-service'),
      action: '注文詳細、決済情報、配送予定を含む確認メールを顧客のメールアドレスに送信',
      expectedResult: '顧客が注文確認メールを受信し、注文内容を確認できる',
      notes: '注文確認メールの送信'
    },
    {      actor: typedActorRef('loyalty-service'),
      action: '注文金額と会員ランクに基づいてポイントを計算し、顧客のポイント残高に加算',
      expectedResult: '獲得ポイントが正確に計算され、顧客のポイント残高が更新される',
      notes: '獲得ポイントの計算・付与'
    },
    {      actor: typedActorRef('customer'),
      action: '注文完了画面で注文詳細、追跡番号、配送予定日を確認',
      expectedResult: '顧客に注文完了が通知され、今後の進捗追跡が可能となる',
      notes: '注文処理完了'
    }
  ],
  alternativeFlows: [
    {
      id: 'payment-failure',
      name: '決済失敗',
      condition: '決済サービスから決済失敗の応答を受信',
      steps: [
        {          actor: typedActorRef('payment-service'),
          action: '決済失敗理由（カード期限切れ・残高不足・システムエラー等）を詳細分析',
          expectedResult: '失敗理由が具体的に特定される'
        },
        {          actor: typedActorRef('customer'),
          action: '失敗理由を確認し、別の決済方法を選択するか情報を修正',
          expectedResult: '代替決済手段の提示または決済情報修正フォームが表示'
        },
        {          actor: typedActorRef('email-service'),
          action: '決済失敗の通知メールを送信（セキュリティのため簡潔な内容）',
          expectedResult: '顧客に決済失敗が安全に通知される'
        }
      ],
      returnToStepId: 'fetch-product-data'
    },
    {
      id: 'out-of-stock',
      name: '在庫切れ',
      condition: '注文確定時に在庫が不足している',
      steps: [
        {          actor: typedActorRef('inventory-system'),
          action: '在庫不足商品を特定し、利用可能数量と入荷予定を確認',
          expectedResult: '在庫状況の詳細情報が取得される'
        },
        {          actor: typedActorRef('recommendation-engine'),
          action: '在庫切れ商品の代替商品を推薦',
          expectedResult: '類似商品や関連商品が代替案として提示される'
        },
        {          actor: typedActorRef('customer'),
          action: '代替商品の選択、数量変更、または商品削除を実行',
          expectedResult: 'カート内容が実在庫に基づいて更新される'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    },
    {
      id: 'shipping-unavailable',
      name: '配送不可地域',
      condition: '選択された配送先が配送対象外地域',
      steps: [
        {          actor: typedActorRef('shipping-service'),
          action: '配送不可地域を検知し、利用可能な配送オプションを確認',
          expectedResult: '配送制約の詳細と代替配送方法が特定される'
        },
        {          actor: typedActorRef('customer'),
          action: '別の配送先住所を指定するか、代替配送方法を選択',
          expectedResult: '配送可能な条件で注文が調整される'
        }
      ],
      returnToStepId: 'execute-search'
    },
    {
      id: 'system-maintenance',
      name: 'システムメンテナンス',
      condition: '外部サービス（決済・配送・ポイント）がメンテナンス中',
      steps: [
        {          actor: typedActorRef('database-system'),
          action: 'メンテナンス情報を確認し、復旧予定時刻を取得',
          expectedResult: 'サービス復旧時間が明確になる'
        },
        {          actor: typedActorRef('customer'),
          action: 'メンテナンス情報を確認し、後で注文を再試行するかカートを保存',
          expectedResult: '注文内容が保持され、復旧後に再開可能'
        },
        {          actor: typedActorRef('email-service'),
          action: 'サービス復旧時に注文再開の案内メールを送信',
          expectedResult: '顧客にサービス復旧が通知される'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    },
    {
      id: 'high-demand-delay',
      name: 'アクセス集中による遅延',
      condition: 'セール等によりシステムへのアクセスが集中し処理が遅延',
      steps: [
        {          actor: typedActorRef('database-system'),
          action: '高負荷状態を検知し、処理優先度を調整',
          expectedResult: '重要な処理が優先的に実行される'
        },
        {          actor: typedActorRef('customer'),
          action: '処理遅延の案内メッセージを確認し、待機または後で再試行',
          expectedResult: '待ち時間の目安と進捗状況が表示される'
        },
        {          actor: typedActorRef('customer'),
          action: '注文が正常に完了するまで待機',
          expectedResult: '遅延はあるが確実に注文が処理される'
        }
      ],
      returnToStepId: 'generate-recommendations'
    },
    {
      id: 'fraud-detection',
      name: '不正取引検知',
      condition: '不正取引検知システムが異常なパターンを検出',
      steps: [
        {          actor: typedActorRef('security-service'),
          action: '不正検知アラートを生成し、取引を一時停止',
          expectedResult: '疑わしい取引が安全に停止される'
        },
        {          actor: typedActorRef('customer'),
          action: '本人確認手続き（SMS認証・メール認証等）を実行',
          expectedResult: '追加認証により本人性が確認される'
        },
        {          actor: typedActorRef('security-service'),
          action: '本人確認完了後、注文処理を再開',
          expectedResult: '正当な取引として注文が継続される'
        }
      ],
      returnToStepId: 'fetch-product-data'
    },
    {
      id: 'partial-fulfillment',
      name: '部分発送',
      condition: '複数商品の注文で一部商品の発送が遅れる',
      steps: [
        {          actor: typedActorRef('shipping-service'),
          action: '発送可能商品と遅延商品を分類',
          expectedResult: '商品ごとの発送スケジュールが明確になる'
        },
        {          actor: typedActorRef('customer'),
          action: '部分発送の承諾または全商品揃うまで待機を選択',
          expectedResult: '発送方法について顧客の意向が確認される'
        },
        {          actor: typedActorRef('email-service'),
          action: '部分発送の詳細と残り商品の発送予定を通知',
          expectedResult: '発送スケジュールが詳細に案内される'
        }
      ],
      returnToStepId: 'view-product-details'
    }
  ],
  businessValue: '顧客の購買体験を向上させ、確実な売上確保と顧客満足度向上を実現',
  priority: 'high',
  
  // 詳細仕様（段階的詳細化）
  complexity: 'complex',
  estimatedEffort: '15-20人日',
  acceptanceCriteria: [
    '注文確定から完了まで5秒以内で処理される',
    '決済失敗時は明確なエラーメッセージが表示される',
    '在庫不足時は代替商品を提案する',
    '注文確認メールは30秒以内に送信される',
    'ポイント付与は注文完了と同時に反映される',
    '配送情報は即座に顧客に通知される'
  ],
  businessRules: [
    '注文金額1円未満は注文不可',
    '在庫数を超える注文は自動的に在庫数に調整',
    '決済失敗は3回まで再試行可能',
    'ポイント利用は保有ポイントの80%まで',
    '配送先は国内のみ対応',
    '同一商品の重複注文は自動統合',
    'キャンセル可能期間は注文確定から24時間以内',
    '会員ランクによってポイント付与率が変動'
  ],
  dataRequirements: [
    '顧客情報（ID、メールアドレス、配送先）',
    '商品情報（ID、価格、在庫数、重量・サイズ）',
    '注文情報（注文番号、注文日時、ステータス）',
    '決済情報（決済方法、金額、取引ID）',
    '配送情報（配送方法、配送先、追跡番号）',
    'ポイント情報（残高、利用履歴、付与履歴）',
    '在庫情報（現在数量、引当数量、安全在庫）'
  ],
  securityRequirements: [
    '決済情報はPCI DSS準拠の暗号化',
    '個人情報は SSL/TLS で保護',
    'SQLインジェクション対策の実装',
    'CSRF トークンによる不正操作防止',
    'セッション管理の適切な実装',
    '機密情報のログ出力禁止',
    'アクセス権限の適切な制御'
  ],
  performanceRequirements: [
    '注文処理レスポンス時間: 5秒以内',
    '同時接続ユーザー数: 1000人対応',
    '決済処理成功率: 99.5%以上',
     'システム稼働率: 99.9%以上',
    'データベース応答時間: 1秒以内',
    'メール送信成功率: 99%以上',
    'ポイント計算処理時間: 2秒以内'
  ],
  uiRequirements: [
    '注文進捗を視覚的に表示（プログレスバー）',
    '各ステップでの明確な操作ガイダンス',
    'エラー時の分かりやすいメッセージ表示',
    'モバイル端末での操作性確保',
    '入力項目の適切なバリデーション表示',
    '配送情報の分かりやすいレイアウト',
    '決済情報入力時のセキュリティ配慮表示',
    'ポイント利用時の残高・利用可能数表示'
  ]
};

// 注文追跡サービスアクター
export const trackingService: Actor = {
  id: 'tracking-service',
  type: 'actor',
  owner: 'system-architect',
  name: '配送追跡サービス',
  description: '配送業者の追跡情報を統合管理するサービス',
  role: 'external',
  responsibilities: [
    '複数配送業者の追跡情報統合',
    'リアルタイム配送状況更新',
    '配送異常の検知・通知',
    '配送完了の確認',
    '配送遅延アラートの発信'
  ]
};

// 注文状況確認ユースケース  
export const orderTracking: UseCase = {
  id: 'order-tracking',
  type: 'usecase',
  owner: 'business-analyst',
  name: '注文状況確認',
  description: '顧客が自分の注文状況をリアルタイムで確認する',
  actors: {
    primary: typedActorRef('customer'),
    secondary: [
      typedActorRef('database-system'),
      typedActorRef('shipping-service'),
      typedActorRef('tracking-service')
    ]
  },
  preconditions: [
    '顧客がログインしている',
    '過去に注文履歴がある',
    '注文に追跡番号が割り当てられている'
  ],
  postconditions: [
    '注文状況が顧客に表示されている',
    '配送状況が最新の情報で更新されている',
    '次回配送予定が明示されている'
  ],
  mainFlow: [
    {      actor: typedActorRef('customer'),
      action: 'マイページの「注文履歴」をクリックして注文一覧を表示',
      expectedResult: '注文履歴一覧が日付順で表示され、各注文の現在ステータスが確認できる',
      notes: '注文履歴一覧の表示'
    },
    {      actor: typedActorRef('customer'),
      action: '確認したい注文の「詳細を見る」ボタンをクリック',
      expectedResult: '注文詳細画面が表示され、商品情報・配送先・決済情報が確認できる',
      notes: '注文詳細画面の表示'
    },
    {      actor: typedActorRef('database-system'),
      action: '注文情報とステータス履歴をデータベースから取得',
      expectedResult: '注文の詳細情報と現在のステータスが正確に取得される',
      notes: '注文情報の取得'
    },
    {      actor: typedActorRef('tracking-service'),
      action: '追跡番号を使用して配送業者から最新の配送状況を取得',
      expectedResult: 'リアルタイムの配送状況（集荷済み・輸送中・配達中など）が取得される',
      notes: '配送状況の取得'
    },
    {      actor: typedActorRef('customer'),
      action: '配送状況セクションで現在の配送進捗と予定日を確認',
      expectedResult: '配送の各段階（注文確定→出荷準備→発送→配達中→完了）が視覚的に表示される',
      notes: '配送進捗の確認'
    },
    {      actor: typedActorRef('customer'),
      action: '追跡番号をクリックして配送業者のサイトで詳細追跡情報を確認（オプション）',
      expectedResult: '新しいタブで配送業者の追跡ページが開き、より詳細な配送情報が確認できる',
      notes: '外部追跡ページへのリンク'
    },
    {      actor: typedActorRef('customer'),
      action: '配送予定日変更や不在票がある場合は再配達手続きを実行',
      expectedResult: '再配達の日時指定画面に遷移し、希望日時を選択できる',
      notes: '再配達手続き'
    }
  ],
  alternativeFlows: [
    {
      id: 'tracking-unavailable',
      name: '追跡情報取得不可',
      condition: '配送業者システムがメンテナンス中または追跡番号が無効',
      steps: [
        {          actor: typedActorRef('tracking-service'),
          action: '追跡情報取得エラーを検知',
          expectedResult: 'システムエラーまたは追跡不可状態を認識'
        },
        {          actor: typedActorRef('customer'),
          action: '追跡不可メッセージを確認',
          expectedResult: '「追跡情報は一時的に取得できません。しばらく後に再度お試しください」というメッセージが表示'
        }
      ],
      returnToStepId: 'fetch-product-data'
    },
    {
      id: 'delivery-delay',
      name: '配送遅延',
      condition: '配送予定日を過ぎても配達が完了していない',
      steps: [
        {          actor: typedActorRef('tracking-service'),
          action: '配送遅延を検知してアラートを生成',
          expectedResult: '配送遅延の通知が顧客に自動送信される'
        },
        {          actor: typedActorRef('customer'),
          action: '遅延通知を確認し、新しい配送予定日を把握',
          expectedResult: '遅延理由と新しい配送予定日が明示される'
        }
      ],
      returnToStepId: 'generate-recommendations'
    }
  ],
  businessValue: '顧客の不安を解消し、配送に関する問い合わせを削減。顧客満足度向上とカスタマーサポート負荷軽減',
  priority: 'medium',
  
  // 詳細仕様（段階的詳細化）
  complexity: 'medium',
  estimatedEffort: '8-12人日',
  acceptanceCriteria: [
    '注文履歴は2秒以内に表示される',
    '配送状況は15分以内の最新情報が表示される',
    '追跡番号は外部サイトへ正確にリンクする',
    '配送遅延時は自動的に通知される',
    'モバイル端末でも見やすく表示される',
    '過去6ヶ月の注文履歴が参照可能'
  ],
  businessRules: [
    '注文履歴は本人の注文のみ表示',
    '配送完了後も30日間は追跡情報を保持',
    '追跡情報更新は15分間隔で実行',
    '配送遅延は予定日+1日で自動検知',
    'ゲストユーザーは注文番号+メールアドレスで追跡可能',
    'キャンセル済み注文も履歴として表示'
  ],
  dataRequirements: [
    '注文履歴（注文ID、注文日時、ステータス）',
    '配送情報（追跡番号、配送業者、配送先）',
    '商品情報（商品名、数量、価格）',
    '配送ステータス履歴（時刻、場所、ステータス）',
    '顧客情報（ユーザーID、メールアドレス）'
  ],
  securityRequirements: [
    '本人の注文のみアクセス可能',
    'セッション管理の適切な実装',
    '追跡情報の不正アクセス防止',
    'ゲスト追跡時の本人確認強化'
  ],
  performanceRequirements: [
    '注文履歴表示: 2秒以内',
    '追跡情報取得: 5秒以内',
    '同時アクセス: 500ユーザー対応',
    'システム稼働率: 99.5%以上',
    '追跡情報更新頻度: 15分間隔'
  ],
  uiRequirements: [
    '配送進捗の視覚的表示（プログレスバー・マップ）',
    '注文ステータスのアイコン表示',
    '追跡番号のワンクリックコピー機能',
    'モバイル最適化された画面レイアウト',
    '配送遅延時の目立つ通知表示',
    '再配達手続きへの明確な導線'
  ]
};