import type { ApiResponse, UserHasPlayedDto } from '../../../app/types/user-api';
import { forwardGet } from '../../utils/forwardUpstream';

export default forwardGet<ApiResponse<UserHasPlayedDto[]>>('/api/user/played');
