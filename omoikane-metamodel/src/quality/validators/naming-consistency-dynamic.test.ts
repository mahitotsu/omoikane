/**
 * @fileoverview 用語統一性評価（動的検出版）のテスト
 */

import { describe, expect, test } from 'bun:test';
import { assessTerminologyConsistency } from './naming-consistency.js';

describe('動的用語検出', () => {
  test('カスタム用語ペアで類似する用語を検出する', () => {
    const elements = [
      {
        id: 'use-case-1',
        name: 'ユーザー管理',
        description: 'ユーザーの登録と編集を行う',
      },
      {
        id: 'use-case-2',
        name: '利用者一覧',
        description: '利用者の一覧を表示する',
      },
      {
        id: 'use-case-3',
        name: 'ユーザー検索',
        description: 'ユーザーを検索する',
      },
    ];

    // カスタム用語ペアを指定（意味的に類似する用語）
    const customPairs = [{ term1: 'ユーザー', term2: '利用者' }];

    const result = assessTerminologyConsistency(elements, customPairs);

    expect(result.mixedTerms.length).toBeGreaterThan(0);
    
    // 「ユーザー」と「利用者」の混在を検出
    const mixedPair = result.mixedTerms.find(
      (m) =>
        (m.term1 === 'ユーザー' && m.term2 === '利用者') ||
        (m.term1 === '利用者' && m.term2 === 'ユーザー')
    );
    
    expect(mixedPair).toBeDefined();
    expect(mixedPair?.occurrences1.length).toBeGreaterThan(0);
    expect(mixedPair?.occurrences2.length).toBeGreaterThan(0);
  });

  test('活用形の違いは検出しない（部分文字列フィルタ）', () => {
    const elements = [
      {
        id: 'use-case-1',
        name: '予約完了画面',
        description: '予約完了のメッセージを表示',
      },
      {
        id: 'use-case-2',
        name: '予約完了メール',
        description: '完了通知をメールで送信',
      },
    ];

    const result = assessTerminologyConsistency(elements);

    // 「完了」と「完了の」のような活用形の違いは検出されない
    const mixedPair = result.mixedTerms.find(
      (m) =>
        (m.term1 === '完了' && m.term2 === '完了の') ||
        (m.term1 === '完了の' && m.term2 === '完了')
    );

    expect(mixedPair).toBeUndefined();
  });

  test('IDは評価対象外', () => {
    const elements = [
      {
        id: 'user-registration',
        name: 'ユーザー登録',
        description: 'ユーザーを登録する',
      },
      {
        id: 'customer-list',
        name: 'ユーザー一覧',
        description: 'ユーザーの一覧を表示',
      },
    ];

    const result = assessTerminologyConsistency(elements);

    // IDに'user'と'customer'が混在していても検出されない
    const mixedPair = result.mixedTerms.find(
      (m) =>
        (m.term1 === 'user' && m.term2 === 'customer') ||
        (m.term1 === 'customer' && m.term2 === 'user')
    );

    expect(mixedPair).toBeUndefined();
  });

  test('カスタム用語ペアを指定できる', () => {
    const elements = [
      {
        id: 'use-case-1',
        name: '予約管理',
        description: '予約を管理する',
      },
      {
        id: 'use-case-2',
        name: 'ブッキング一覧',
        description: 'ブッキングの一覧を表示',
      },
    ];

    // カスタム用語ペアを指定
    const customPairs = [{ term1: '予約', term2: 'ブッキング' }];

    const result = assessTerminologyConsistency(elements, customPairs);

    expect(result.mixedTerms.length).toBeGreaterThan(0);

    const mixedPair = result.mixedTerms.find(
      (m) =>
        (m.term1 === '予約' && m.term2 === 'ブッキング') ||
        (m.term1 === 'ブッキング' && m.term2 === '予約')
    );

    expect(mixedPair).toBeDefined();
  });

  test('表記ゆれを自動検出する（高類似度）', () => {
    const elements = [
      {
        id: 'use-case-1',
        name: 'サーバー管理',
        description: 'サーバーの設定を行う',
      },
      {
        id: 'use-case-2',
        name: 'サーバ一覧',
        description: 'サーバの一覧を表示',
      },
    ];

    const result = assessTerminologyConsistency(elements);

    // 「サーバー」と「サーバ」のような表記ゆれを検出
    const mixedPair = result.mixedTerms.find(
      (m) =>
        (m.term1 === 'サーバー' && m.term2 === 'サーバ') ||
        (m.term1 === 'サーバ' && m.term2 === 'サーバー')
    );

    expect(mixedPair).toBeDefined();
  });

  test('同じ用語のみの場合は混在なし', () => {
    const elements = [
      {
        id: 'use-case-1',
        name: 'ユーザー管理',
        description: 'ユーザーを管理する',
      },
      {
        id: 'use-case-2',
        name: 'ユーザー一覧',
        description: 'ユーザーの一覧を表示',
      },
    ];

    const result = assessTerminologyConsistency(elements);

    expect(result.mixedTerms.length).toBe(0);
    expect(result.score).toBe(100);
  });

  test('類似度が低い用語は検出しない', () => {
    const elements = [
      {
        id: 'use-case-1',
        name: 'ユーザー管理',
        description: 'ユーザーを管理する',
      },
      {
        id: 'use-case-2',
        name: '商品一覧',
        description: '商品の一覧を表示',
      },
    ];

    const result = assessTerminologyConsistency(elements);

    // 「ユーザー」と「商品」は類似度が低いため検出されない
    const mixedPair = result.mixedTerms.find(
      (m) =>
        (m.term1 === 'ユーザー' && m.term2 === '商品') ||
        (m.term1 === '商品' && m.term2 === 'ユーザー')
    );

    expect(mixedPair).toBeUndefined();
  });
});
