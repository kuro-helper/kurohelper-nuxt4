import type { ErogsMusic } from '../../../../app/types/erogs-api';
import type { ApiResponse } from '../../../../app/types/user-api';
import { forwardGetByRouterParam } from '../../../utils/forwardUpstream';

export default forwardGetByRouterParam<ApiResponse<ErogsMusic>>(
  (id) => `/api/erogs/music/${encodeURIComponent(id)}`,
);
