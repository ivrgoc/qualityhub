// This file is kept for backwards compatibility
// All store exports including hooks are now in index.ts
// Import from '@/store' directly instead of '@/store/hooks'

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
