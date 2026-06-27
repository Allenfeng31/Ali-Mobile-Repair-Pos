import type { ExploreRepairLink } from '@/components/services/ExploreRepairNetworkSection';
import type { GooglePixelHardwareConfig } from './types';
import { preserveRouteSegment } from '@/lib/inventoryUtils';

export interface GooglePixelHubLink extends ExploreRepairLink {
  slug: string;
}

export function getGooglePixelEnhancedHubLinks(config: GooglePixelHardwareConfig): GooglePixelHubLink[] {
  // Only returning pixel-8-pro currently, so there's no sibling links to return.
  // We'll return an empty array for now. Later models will populate this.
  return [];
}
