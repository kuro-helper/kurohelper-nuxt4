import type { AnnouncementListResponse } from '../../app/types/announcement-api';
import { forwardGet } from '../utils/forwardUpstream';

export default forwardGet<AnnouncementListResponse>('/api/announcement');
