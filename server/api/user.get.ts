import type { ApiResponse, UserItem } from '../../app/types/user-api';
import { forwardGet } from '../utils/forwardUpstream';

export default forwardGet<ApiResponse<UserItem[]>>('/api/user');
