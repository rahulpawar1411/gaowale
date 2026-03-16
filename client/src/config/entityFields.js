// Form field config per master table (API table key).
// optionsTable = API table key to fetch dropdown options (e.g. 'continents').

export const entityFields = {
  continents: [
    { name: 'name', label: 'Continent', type: 'text', tableHeader: 'Continent' },
  ],
  countries: [
    { name: 'name', label: 'Country', type: 'text', tableHeader: 'Country' },
    { name: 'continent_id', label: 'Select Continent', type: 'select', optionsTable: 'continents', tableHeader: 'Continent' },
  ],
  'country-divisions': [
    { name: 'name', label: 'Country Division', type: 'text', tableHeader: 'Country Division' },
    { name: 'country_id', label: 'Select Country', type: 'select', optionsTable: 'countries', tableHeader: 'Country' },
  ],
  states: [
    { name: 'name', label: 'State', type: 'text', tableHeader: 'State' },
    { name: 'country_division_id', label: 'Select Country Division', type: 'select', optionsTable: 'country-divisions', tableHeader: 'Country Division' },
  ],
  'state-circles': [
    { name: 'name', label: 'State Circle', type: 'text', tableHeader: 'State Circle' },
    { name: 'state_id', label: 'Select State', type: 'select', optionsTable: 'states', tableHeader: 'State' },
  ],
  'state-divisions': [
    { name: 'name', label: 'State Division', type: 'text', tableHeader: 'State Division' },
    { name: 'state_circle_id', label: 'Select State Circle', type: 'select', optionsTable: 'state-circles', tableHeader: 'State Circle' },
  ],
  'state-sub-divisions': [
    { name: 'name', label: 'State Sub Division', type: 'text', tableHeader: 'State Sub Division' },
    { name: 'state_division_id', label: 'State Division', type: 'select', optionsTable: 'state-divisions', tableHeader: 'State Division' },
  ],
  regions: [
    { name: 'name', label: 'Region', type: 'text', tableHeader: 'Region' },
    { name: 'state_sub_division_id', label: 'Select State Sub Division', type: 'select', optionsTable: 'state-sub-divisions', tableHeader: 'State Sub Division' },
  ],
  zones: [
    { name: 'name', label: 'Zone', type: 'text', tableHeader: 'Zone' },
    { name: 'region_id', label: 'Select Region', type: 'select', optionsTable: 'regions', tableHeader: 'Region' },
  ],
  'vidhan-sabhas': [
    { name: 'name', label: 'Vidhan Sabha', type: 'text', tableHeader: 'Vidhan Sabha' },
    { name: 'vidhan_sabha_type', label: 'Vidhan Sabha types', type: 'select', optionStatic: ['Ruler', 'Arbun'], tableHeader: 'Vidhan Sabha types', optionPlaceholder: 'Select Vidhan Sabha type' },
    { name: 'zone_id', label: 'Select Zone', type: 'select', optionsTable: 'zones', tableHeader: 'Zone' },
  ],
  talukas: [
    { name: 'name', label: 'Taluka', type: 'text', tableHeader: 'Taluka' },
    { name: 'vidhan_sabha_id', label: 'Select Vidhan Sabha', type: 'select', optionsTable: 'vidhan-sabhas', tableHeader: 'Vidhan Sabha' },
  ],
  blocks: [
    { name: 'name', label: 'Block', type: 'text', tableHeader: 'Block' },
    { name: 'taluka_id', label: 'Select Taluka', type: 'select', optionsTable: 'talukas', tableHeader: 'Taluka' },
  ],
  circles: [
    { name: 'name', label: 'Panchayat Samiti Circle', type: 'text', tableHeader: 'Panchayat Samiti Circle' },
    { name: 'block_id', label: 'Select Block', type: 'select', optionsTable: 'blocks', tableHeader: 'Block' },
  ],
  'gram-panchayats': [
    { name: 'name', label: 'Gram Panchayat', type: 'text', tableHeader: 'Gram Panchayat' },
    { name: 'circle_id', label: 'Select Panchayat Samiti Circle', type: 'select', optionsTable: 'circles', tableHeader: 'Panchayat Samiti Circle' },
  ],
  villages: [
    { name: 'name', label: 'Village', type: 'text', tableHeader: 'Village' },
    { name: 'gram_panchayat_id', label: 'Select Gram Panchayat', type: 'select', optionsTable: 'gram-panchayats', tableHeader: 'Gram Panchayat' },
  ],
  products: [
    { name: 'name', label: 'Product', type: 'text', tableHeader: 'Product' },
    {
      name: 'business_sub_category_id',
      label: 'Business Sub Category',
      type: 'select',
      optionsTable: 'business-sub-categories',
      tableHeader: 'Business Sub Category',
    },
  ],
  'business-types': [
    { name: 'name', label: 'Business Type', type: 'text', tableHeader: 'Business Type' },
    {
      name: 'product_id',
      label: 'Select Product',
      type: 'select',
      optionsTable: 'products',
      tableHeader: 'Product',
    },
  ],
  units: [
    { name: 'name', label: 'Unit', type: 'text', tableHeader: 'Unit' },
    { name: 'village_id', label: 'Select Village', type: 'select', optionsTable: 'villages', tableHeader: 'Village' },
    { name: 'unit_type_id', label: 'Select Types of Units', type: 'select', optionsTable: 'unit-types', tableHeader: 'Types of Units' },
    { name: 'status', label: 'Status', type: 'radio', options: ['Active', 'Inactive', 'In progress'], tableHeader: 'Status' },
  ],
  'unit-types': [
    { name: 'type_category', label: 'Type', type: 'selectWithOther', optionsTable: 'unit-types', optionValue: 'type_category', optionLabel: 'type_category', tableHeader: 'Types of Units', optionStatic: ['PNG', 'GLG', 'LLP', 'Pvt', 'SPV', 'LTP'] },
  ],
  'business-categories': [
    { name: 'name', label: 'Business Category', type: 'text', tableHeader: 'Business Category' },
    {
      name: 'vidhan_sabha_id',
      label: 'Select Vidhansabha',
      type: 'select',
      optionsTable: 'vidhan-sabhas',
      tableHeader: 'Vidhansabha',
    },
  ],
  'business-sub-categories': [
    { name: 'name', label: 'Business Sub Category', type: 'text', tableHeader: 'Business Sub Category' },
    {
      name: 'business_category_id',
      label: 'Select Business Category',
      type: 'select',
      optionsTable: 'business-categories',
      tableHeader: 'Business Category',
    },
  ],
  designations: [
    { name: 'name', label: 'Designation', type: 'text', tableHeader: 'Designation' },
    { name: 'parent_id', label: 'No Parent (Top Level)', type: 'select', optionsTable: 'designations', tableHeader: 'Parent', required: false, optionPlaceholder: 'No Parent (Top Level)', optionValue: 'id', optionLabel: 'name' },
  ],
  'business-positions': [
    { name: 'name', label: 'Business Position', type: 'text', tableHeader: 'Business Position' },
    { name: 'code', label: 'Code', type: 'text', tableHeader: 'Code' },
  ],
  'business-sectors': [
    { name: 'name', label: 'Business Sector', type: 'text', tableHeader: 'Business Sector' },
    { name: 'code', label: 'Code', type: 'text', tableHeader: 'Code' },
  ],
  'position-allotments': [
    // User appears last; level is still auto-calculated internally from location
    { name: 'zone_id', label: 'Zone', type: 'select', optionsTable: 'zones', tableHeader: 'Zone', optionPlaceholder: 'Select Zone' },
    { name: 'vidhan_sabha_id', label: 'Vidhan Sabha', type: 'select', optionsTable: 'vidhan-sabhas', tableHeader: 'Vidhan Sabha', optionPlaceholder: 'Select Vidhan Sabha' },
    { name: 'taluka_id', label: 'Taluka', type: 'select', optionsTable: 'talukas', tableHeader: 'Taluka', optionPlaceholder: 'Select Taluka' },
    { name: 'block_id', label: 'Block', type: 'select', optionsTable: 'blocks', tableHeader: 'Block', optionPlaceholder: 'Select Block' },
    { name: 'circle_id', label: 'Panchayat Samiti Circle', type: 'select', optionsTable: 'circles', tableHeader: 'Panchayat Samiti Circle', optionPlaceholder: 'Select Circle' },
    { name: 'gram_panchayat_id', label: 'Gram Panchayat', type: 'select', optionsTable: 'gram-panchayats', tableHeader: 'Gram Panchayat', optionPlaceholder: 'Select Gram Panchayat' },
    { name: 'village_id', label: 'Village', type: 'select', optionsTable: 'villages', tableHeader: 'Village', optionPlaceholder: 'Select Village' },
    { name: 'business_position_id', label: 'Business Position', type: 'select', optionsTable: 'designations', tableHeader: 'Business Position', optionPlaceholder: 'Select Position' },
    { name: 'business_category_id', label: 'Business Sector', type: 'select', optionsTable: 'business-categories', tableHeader: 'Business Sector', optionPlaceholder: 'Select Business Sector' },
    { name: 'user_name', label: 'User Name', type: 'select', optionsTable: 'management-registrations', optionValue: 'name', optionLabel: 'name', tableHeader: 'User Name', optionPlaceholder: 'Select User' },
  ],
};
