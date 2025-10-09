/**
 * 予約履歴確認フロー
 */

import type { ScreenFlow } from 'omoikane-metamodel';
import { typedScreenRef, typedUseCaseRef } from '../../typed-references.js';

export const historyReviewFlow: ScreenFlow = {
  id: 'history-review-flow',
  name: '予約履歴確認フロー',
  type: 'screen-flow',
  description: '店舗スタッフが予約履歴を確認し、既読状態を更新するフロー',
  screens: [
    typedScreenRef('history-list-screen'),
    typedScreenRef('history-detail-screen'),
  ],
  transitions: [
    {
      from: typedScreenRef('history-list-screen'),
      to: typedScreenRef('history-detail-screen'),
      trigger: 'view-detail',
    },
    {
      from: typedScreenRef('history-detail-screen'),
      to: typedScreenRef('history-list-screen'),
      trigger: 'back-to-list',
    },
    {
      from: typedScreenRef('history-detail-screen'),
      to: typedScreenRef('history-list-screen'),
      trigger: 'mark-reviewed',
    },
  ],
  startScreen: typedScreenRef('history-list-screen'),
  endScreens: [typedScreenRef('history-list-screen')],
  relatedUseCase: typedUseCaseRef('reservation-history-review'),
};
