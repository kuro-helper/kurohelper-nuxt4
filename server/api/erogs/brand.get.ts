import type { BrandErogsItem } from '../../../app/types/erogs-api';
import type { ApiResponse } from '../../../app/types/user-api';
import { forwardGet } from '../../utils/forwardUpstream';

export default forwardGet<ApiResponse<BrandErogsItem[]>>('/api/erogs/brand/');
