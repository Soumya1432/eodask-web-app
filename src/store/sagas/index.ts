import { all, fork } from 'redux-saga/effects';
import { authSaga } from './authSaga';
import { organizationSaga } from './organizationSaga';
import { projectSaga } from './projectSaga';
import { chatSaga } from './chatSaga';
import { invitationSaga } from './invitationSaga';
import { fileSaga } from './fileSaga';

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(organizationSaga),
    fork(projectSaga),
    fork(chatSaga),
    fork(invitationSaga),
    fork(fileSaga),
  ]);
}
