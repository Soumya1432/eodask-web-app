import { all, fork } from 'redux-saga/effects';

// Module sagas
import { authSaga } from '@/modules/auth';
import { organizationSaga } from '@/modules/organization';
import { projectSaga } from '@/modules/projects';
import { fileSaga } from '@/modules/files';
import { chatSaga } from '@/modules/chat';

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(organizationSaga),
    fork(projectSaga),
    fork(fileSaga),
    fork(chatSaga),
  ]);
}
