import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootReducer } from './rootReducer';
import { rootSaga } from './rootSaga';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'files/uploadAttachmentRequest',
          'files/uploadAvatarRequest',
        ],
        ignoredActionPaths: ['payload.file'],
      },
    }).concat(sagaMiddleware),
  devTools: import.meta.env.DEV,
});

// Run saga middleware
sagaMiddleware.run(rootSaga);

// Export types
export type { RootState } from './rootReducer';
export type AppDispatch = typeof store.dispatch;
