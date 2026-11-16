import {
  HIERARCHICAL_MODULES,
} from '@/data/tenantMockData';
import type { TenantFeature } from '@/types/tenant';

export type FeatureMap = Record<string, boolean>;

const FEATURE_PARENT_MAP: Record<string, string> = {};

HIERARCHICAL_MODULES.forEach((module) => {
  module.subOptions.forEach((subFeature) => {
    FEATURE_PARENT_MAP[subFeature.key] = module.key;
  });
});

/**
 * Normalize tenant feature configuration.
 * Missing or invalid values default to false.
 * A child feature cannot be enabled when its parent is disabled.
 */
export const normalizeTenantFeatures = (
  config?: Record<string, unknown> | null,
): FeatureMap => {
  const normalized: FeatureMap = {};

  HIERARCHICAL_MODULES.forEach((module) => {
    const parentEnabled = config?.[module.key] === true;

    normalized[module.key] = parentEnabled;

    module.subOptions.forEach((subFeature) => {
      normalized[subFeature.key] =
        parentEnabled && config?.[subFeature.key] !== false;
    });
  });

  return normalized;
};

/**
 * Check whether a feature is enabled after applying hierarchy rules.
 */
export const isTenantFeatureEnabled = (
  config: Record<string, unknown> | null | undefined,
  feature: string,
): boolean => {
  const normalized = normalizeTenantFeatures(config);

  if (!(feature in normalized)) {
    return false;
  }

  const parentKey = FEATURE_PARENT_MAP[feature];

  if (parentKey && normalized[parentKey] !== true) {
    return false;
  }

  return normalized[feature] === true;
};

