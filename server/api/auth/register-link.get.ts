import type { ApiResponse, RegisterLookupData } from '../../../app/types/user-api';
import { forwardGet } from '../../utils/forwardUpstream';

export default forwardGet<ApiResponse<RegisterLookupData>>('/api/auth/register-link');
