import type { ErogsOfficialGame } from '../../../../app/types/erogs-api';
import type { ApiResponse } from '../../../../app/types/user-api';
import { forwardGetByRouterParam } from '../../../utils/forwardUpstream';

export default forwardGetByRouterParam<ApiResponse<ErogsOfficialGame>>(
  (id) => `/api/erogs/game/${encodeURIComponent(id)}`,
);
