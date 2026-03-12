// Menu structure: sections with path, label, and API key (for master table or registration type)

export const MAIN_MENU = [
  { path: '/continent', label: 'Continent', table: 'continents' },
  { path: '/country', label: 'Country', table: 'countries' },
  { path: '/country-division', label: 'Country Division', table: 'country-divisions' },
  { path: '/state', label: 'State', table: 'states' },
  { path: '/state-division', label: 'State Division', table: 'state-divisions' },
  { path: '/state-sub-division', label: 'State Sub Division', table: 'state-sub-divisions' },
  { path: '/region', label: 'Region', table: 'regions' },
  { path: '/zone', label: 'Zone', table: 'zones' },
  { path: '/vidhan-sabha', label: 'Vidhan Sabha', table: 'vidhan-sabhas' },
  { path: '/taluka', label: 'Taluka', table: 'talukas' },
  { path: '/block', label: 'Block', table: 'blocks' },
  { path: '/circle', label: 'Panchayat Samiti Circle', table: 'circles' },
  { path: '/gram-panchayat', label: 'Gram Panchayat', table: 'gram-panchayats' },
  { path: '/village', label: 'Village', table: 'villages' },
  { path: '/unit-type', label: 'Types of Units', table: 'unit-types' },
  { path: '/unit', label: 'Unit', table: 'units' },
];

export const ALLOTMENT_MENU = [
  { path: '/designation', label: 'Designation', table: 'designations', addButtonLabel: 'Add Designation' },
  { path: '/position-allotment', label: 'Position Allotment', table: 'position-allotments' },
];

export const BUSINESS_MENU = [
  { path: '/business-category', label: 'Business Category', table: 'business-categories', addButtonLabel: 'Add Category' },
  { path: '/business-sub-category', label: 'Business Sub Category', table: 'business-sub-categories', addButtonLabel: 'Add Type' },
  { path: '/product', label: 'Products', table: 'products', addButtonLabel: 'Add Product' },
  { path: '/business-type', label: 'Business Type', table: 'business-types', addButtonLabel: 'Add Type' },
];

export const REGISTRATION_MENU = [
  { path: '/management-registration', label: 'Management Registration', type: 'management' },
  { path: '/farmer-registration', label: 'Farmer Registration', type: 'farmer' },
  { path: '/lakhpati-didi-registration', label: 'Lakhpati Didi Registration', type: 'lakhpatiDidi' },
  { path: '/customer-registration', label: 'Customer Registration', type: 'customer' },
  { path: '/user-details', label: 'User Details', type: 'userDetails' },
];
