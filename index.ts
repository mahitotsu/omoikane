// Omoikane - TypeScript ITDelivery Document Library
// ライブラリのメインエントリーポイント

// 型定義をエクスポート
export * from './src/types/delivery-elements';
export * from './src/types/relationship-analyzer';
export * from './src/types/typed-references';

// 要件定義をエクスポート  
export * from './src/documents/requirements/order-processing';
export * from './src/documents/requirements/product-management';
export * from './src/documents/requirements/user-registration';

// このライブラリについて
export const LIBRARY_INFO = {
  name: 'Omoikane',
  version: '0.1.0',
  description: 'TypeScript-based ITDelivery Document Framework',
  startingPoint: 'UseCase Definition'
} as const;