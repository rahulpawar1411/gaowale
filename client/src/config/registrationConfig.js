/**
 * Business Position is disabled; Business Category (and cascade) is enabled in all registration forms.
 */
export const BUSINESS_POSITION_DISABLED = true;
export const BUSINESS_CATEGORY_FIRST_SELECTABLE = true;

/** When Business Position is disabled, it is optional in validation. */
export const BUSINESS_INFO_OPTIONAL_WHEN_RESTRICTED_MANAGEMENT = [
  'business_position_id',
];

/** When Business Position is disabled, it is optional in validation (Farmer/Customer/Lakhpati). */
export const BUSINESS_INFO_OPTIONAL_WHEN_RESTRICTED_OTHER = [
  'business_position_id',
];

/** @deprecated Use BUSINESS_POSITION_DISABLED / BUSINESS_CATEGORY_FIRST_SELECTABLE */
export const ONLY_FIRST_BUSINESS_FIELD_SELECTABLE = false;
