import type { ApiResponse, FinishedUserGame } from '../../../../app/types/user-api';
import { forwardGet } from '../../../utils/forwardUpstream';

export default forwardGet<ApiResponse<FinishedUserGame[]>>('/api/statistics/user-game/finished');
