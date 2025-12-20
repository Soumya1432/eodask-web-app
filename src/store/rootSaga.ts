import { all, fork } from 'redux-saga/effects';
import { authSaga } from './sagas/authSaga';
import { organizationSaga } from './sagas/organizationSaga';

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(organizationSaga),
  ]);
}
