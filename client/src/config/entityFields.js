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
  circles: [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'taluka_id', label: 'Select Taluka', type: 'select', optionsTable: 'talukas', tableHeader: 'Taluka' },
  ],
  'panchayat-samitis': [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'circle_id', label: 'Select Circle', type: 'select', optionsTable: 'circles', tableHeader: 'Circle' },
  ],
  villages: [
    { name: 'name', label: 'Name', type: 'text', tableHeader: 'Name' },
    { name: 'panchayat_samiti_id', label: 'Select Panchayat Samiti', type: 'select', optionsTable: 'panchayat-samitis', tableHeader: 'Panchayat Samiti' },
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
    { name: 'type_category', label: 'Type', type: 'combobox', optionsTable: 'unit-types', optionValue: 'type_category', optionLabel: 'type_category', tableHeader: 'Type', optionStatic: ['PNG', 'GLG', 'LLP', 'Pvt', 'SPV', 'LTP'] },
  ],
  'business-categories': [
    { name: 'name', label: 'Business Category Name', type: 'text', tableHeader: 'Name' },
    { name: 'vidhan_sabha_id', label: 'Select Vidhansabha', type: 'select', optionsTable: 'vidhan-sabhas', tableHeader: 'Vidhansabha' },
  ],
  'business-sub-categories': [
    { name: 'name', label: 'Business Sub Category Name', type: 'text', tableHeader: 'Name' },
    { name: 'business_category_id', label: 'Select Business Category', type: 'select', optionsTable: 'business-categories', tableHeader: 'Business Category' },
  ],
};
