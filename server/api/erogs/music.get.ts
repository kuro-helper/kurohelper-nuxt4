import type { ErogsMusicListItem } from '../../../app/types/erogs-api';
import type { ApiResponse } from '../../../app/types/user-api';
import { forwardGet } from '../../utils/forwardUpstream';

export default forwardGet<ApiResponse<ErogsMusicListItem[]>>('/api/erogs/music/');
