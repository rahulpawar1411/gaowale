// Form field config per master table (API table key).
// optionsTable = API table key to fetch dropdown options (e.g. 'continents').

export const entityFields = {
  continents: [
    { name: 'name', label: 'Continent Name', type: 'text' },
  ],
  countries: [
    { name: 'name', label: 'Country Name', type: 'text' },
    { name: 'continent_id', label: 'Select Continent', type: 'select', optionsTable: 'continents' },
  ],
  'country-divisions': [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'country_id', label: 'Select Country', type: 'select', optionsTable: 'countries' },
  ],
  states: [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'country_division_id', label: 'Select Country Division', type: 'select', optionsTable: 'country-divisions', tableHeader: 'Country Division' },
  ],
  'state-divisions': [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'state_id', label: 'Select State', type: 'select', optionsTable: 'states' },
  ],
  'state-sub-divisions': [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'state_division_id', label: 'State Division', type: 'select', optionsTable: 'state-divisions' },
  ],
  regions: [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'state_sub_division_id', label: 'Select State Sub Division', type: 'select', optionsTable: 'state-sub-divisions', tableHeader: 'State Sub Division' },
  ],
  zones: [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'region_id', label: 'Select Region', type: 'select', optionsTable: 'regions', tableHeader: 'Region' },
  ],
  'vidhan-sabhas': [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'zone_id', label: 'Select Zone', type: 'select', optionsTable: 'zones', tableHeader: 'Zone' },
  ],
  talukas: [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'vidhan_sabha_id', label: 'Select Vidhan Sabha', type: 'select', optionsTable: 'vidhan-sabhas', tableHeader: 'Vidhan Sabha' },
  ],
  blocks: [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'taluka_id', label: 'Select Taluka', type: 'select', optionsTable: 'talukas', tableHeader: 'Taluka' },
  ],
  circles: [
    { name: 'name', label: 'Panchayat Samiti Circle Name', type: 'text', tableHeader: 'Name' },
    { name: 'block_id', label: 'Select Block', type: 'select', optionsTable: 'blocks', tableHeader: 'Block' },
  ],
  'gram-panchayats': [
    { name: 'name', label: 'Gram Panchayat Name', type: 'text', tableHeader: 'Name' },
    { name: 'circle_id', label: 'Select Panchayat Samiti Circle', type: 'select', optionsTable: 'circles', tableHeader: 'Panchayat Samiti Circle' },
  ],
  villages: [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'gram_panchayat_id', label: 'Select Gram Panchayat', type: 'select', optionsTable: 'gram-panchayats', tableHeader: 'Gram Panchayat' },
  ],
  products: [
    { name: 'name', label: 'Product Name', type: 'text', tableHeader: 'Name' },
    { name: 'business_sub_category_id', label: 'Business Sub Category', type: 'select', optionsTable: 'business-sub-categories', tableHeader: 'Business Sub Category' },
  ],
  'business-types': [
    { name: 'name', label: 'Type Name', type: 'text', tableHeader: 'Type Name' },
    { name: 'product_id', label: 'Select Product', type: 'select', optionsTable: 'products', tableHeader: 'Product' },
  ],
  units: [
    { name: 'name', label: 'Unit Name', type: 'text', tableHeader: 'Name' },
    { name: 'village_id', label: 'Select Village', type: 'select', optionsTable: 'villages', tableHeader: 'Village' },
    { name: 'unit_type_id', label: 'Select Unit Type', type: 'select', optionsTable: 'unit-types', tableHeader: 'Unit Type' },
    { name: 'status', label: 'Status', type: 'radio', options: ['Active', 'Inactive', 'In progress'], tableHeader: 'Status' },
  ],
  'unit-types': [
    { name: 'type_category', label: 'Type', type: 'selectWithOther', optionsTable: 'unit-types', optionValue: 'type_category', optionLabel: 'type_category', tableHeader: 'Type', optionStatic: ['PNG', 'GLG', 'LLP', 'Pvt', 'SPV', 'LTP'] },
  ],
  'business-categories': [
    { name: 'name', label: 'Business Category Name', type: 'text', tableHeader: 'Name' },
    { name: 'vidhan_sabha_id', label: 'Select Vidhansabha', type: 'select', optionsTable: 'vidhan-sabhas', tableHeader: 'Vidhansabha' },
  ],
  'business-sub-categories': [
    { name: 'name', label: 'Business Sub Category Name', type: 'text', tableHeader: 'Name' },
    { name: 'business_category_id', label: 'Select Business Category', type: 'select', optionsTable: 'business-categories', tableHeader: 'Business Category' },
  ],
  designations: [
    { name: 'name', label: 'Designation Name', type: 'text', tableHeader: 'Name' },
    { name: 'parent_id', label: 'No Parent (Top Level)', type: 'select', optionsTable: 'designations', tableHeader: 'Parent', required: false, optionPlaceholder: 'No Parent (Top Level)', optionValue: 'id', optionLabel: 'name' },
  ],
  'business-positions': [
    { name: 'name', label: 'Business Position Name', type: 'text', tableHeader: 'Name' },
    { name: 'code', label: 'Code', type: 'text', tableHeader: 'Code' },
  ],
  'business-sectors': [
    { name: 'name', label: 'Business Sector Name', type: 'text', tableHeader: 'Name' },
    { name: 'code', label: 'Code', type: 'text', tableHeader: 'Code' },
  ],
  'position-allotments': [
    { name: 'level_type', label: 'Select Level', type: 'select', tableHeader: 'Level', optionStatic: [{ id: 'zone', name: 'Zone' }, { id: 'village', name: 'Village' }, { id: 'taluka', name: 'Taluka' }, { id: 'vidhan_sabha', name: 'Vidhan Sabha' }, { id: 'gram_panchayat', name: 'Gram Panchayat' }], optionPlaceholder: 'Select Level' },
    { name: 'area_id', label: 'Select Value', type: 'selectFromLevel', levelField: 'level_type', optionsTableMap: { zone: 'zones', village: 'villages', taluka: 'talukas', vidhan_sabha: 'vidhan-sabhas', gram_panchayat: 'gram-panchayats' }, tableHeader: 'Area', optionPlaceholder: 'Select Value' },
    { name: 'business_position_id', label: 'Business Position', type: 'select', optionsTable: 'designations', tableHeader: 'Business Position', optionPlaceholder: 'Select Position' },
    { name: 'business_category_id', label: 'Business Sector', type: 'select', optionsTable: 'business-categories', tableHeader: 'Business Sector', optionPlaceholder: 'Select Business Sector' },
    { name: 'lakhpati_didi_user_id', label: 'User Name', type: 'select', optionsTable: 'lakhpati-didi-users', optionValue: 'id', optionLabel: 'name', tableHeader: 'User Name', optionPlaceholder: 'Select User' },
  ],
};
