import type { ApiResponse, RegisterLookupData } from '../../../app/types/user-api';
import { forwardRegisterLookup } from '../../utils/forwardUpstream';

export default forwardRegisterLookup<ApiResponse<RegisterLookupData>>('/api/user/register-link');
