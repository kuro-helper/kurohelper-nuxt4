import type { ApiResponse, UserInWishDto } from '../../../app/types/user-api';
import { forwardGet } from '../../utils/forwardUpstream';

export default forwardGet<ApiResponse<UserInWishDto[]>>('/api/user/wish');
