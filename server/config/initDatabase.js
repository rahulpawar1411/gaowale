const mysql = require('mysql2/promise');
const { env } = require('./env');

const dbName = env.DB_NAME;

const CREATE_TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS continents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    continent_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (continent_id) REFERENCES continents(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS country_divisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    country_division_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    FOREIGN KEY (country_division_id) REFERENCES country_divisions(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS state_circles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(36) UNIQUE NULL,
    state_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS state_divisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS state_sub_divisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_division_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_division_id) REFERENCES state_divisions(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_id INT,
    state_sub_division_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
    FOREIGN KEY (state_sub_division_id) REFERENCES state_sub_divisions(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_id INT,
    state_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS vidhan_sabhas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_id INT NOT NULL,
    zone_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    vidhan_sabha_type VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS talukas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_id INT NOT NULL,
    vidhan_sabha_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
    FOREIGN KEY (vidhan_sabha_id) REFERENCES vidhan_sabhas(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taluka_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS circles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    block_id INT,
    taluka_id INT,
    state_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL,
    FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE SET NULL,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gram_panchayats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    circle_id INT,
    taluka_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE SET NULL,
    FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS villages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gram_panchayat_id INT,
    taluka_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL,
    FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS business_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    product_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20),
    village_id INT,
    status VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS types_of_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    type_category VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS business_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    vidhan_sabha_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vidhan_sabha_id) REFERENCES vidhan_sabhas(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS business_sub_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS designations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    parent_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES designations(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS business_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS business_sectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS position_allotments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level_type VARCHAR(50),
    area_id INT NULL,
    name VARCHAR(255) NULL,
    code VARCHAR(50) NULL,
    designation_id INT NULL,
    business_position_id INT NULL,
    business_sector_id INT NULL,
    business_category_id INT NULL,
    user_name VARCHAR(255) NULL,
    lakhpati_didi_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL,
    FOREIGN KEY (business_position_id) REFERENCES designations(id) ON DELETE SET NULL,
    FOREIGN KEY (business_sector_id) REFERENCES business_sectors(id) ON DELETE SET NULL,
    FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS business_unit_allotments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(36) UNIQUE NULL,
    business_category_id INT NULL,
    business_sub_category_id INT NULL,
    product_id INT NULL,
    business_type_id INT NULL,
    unit_type_id INT NULL,
    business_cluster_name VARCHAR(255) NULL,
    unit_company_name VARCHAR(255) NULL,
    beneficiary_name VARCHAR(255) NULL,
    aadhar_card_number VARCHAR(20) NULL,
    pan_card_number VARCHAR(20) NULL,
    shg_membership_certificate VARCHAR(10) NULL,
    shg_membership_certificate_file VARCHAR(255) NULL,
    small_landholder_certificate VARCHAR(10) NULL,
    small_landholder_certificate_file VARCHAR(255) NULL,
    caste_certificate_scst VARCHAR(10) NULL,
    caste_certificate_scst_file VARCHAR(255) NULL,
    special_category_certificate VARCHAR(10) NULL,
    special_category_certificate_file VARCHAR(255) NULL,
    udid_disability_certificate VARCHAR(10) NULL,
    udid_disability_certificate_file VARCHAR(255) NULL,
    training_certificate_file VARCHAR(255) NULL,
    educational_marks_sheet_file VARCHAR(255) NULL,
    school_leaving_certificate_file VARCHAR(255) NULL,
    birth_certificate_file VARCHAR(255) NULL,
    domicile_nationality_certificate_file VARCHAR(255) NULL,
    cibil_report_score VARCHAR(50) NULL,
    bank_name VARCHAR(255) NULL,
    bank_branch_city VARCHAR(255) NULL,
    bank_branch_taluka VARCHAR(255) NULL,
    bank_branch_district VARCHAR(255) NULL,
    bank_branch_state VARCHAR(255) NULL,
    bank_branch_manager_name VARCHAR(255) NULL,
    bank_branch_manager_mobile VARCHAR(20) NULL,
    bank_branch_ifsc_code VARCHAR(20) NULL,
    bank_current_account_cancelled_cheque_file VARCHAR(255) NULL,
    bank_saving_account_passbook_first_page_file VARCHAR(255) NULL,
    land_plot_finalized_30_years VARCHAR(10) NULL,
    land_plot_finalized_30_years_file VARCHAR(255) NULL,
    land_owner_name VARCHAR(255) NULL,
    land_owner_mobile VARCHAR(20) NULL,
    land_address_gis TEXT NULL,
    land_current_location VARCHAR(255) NULL,
    land_gis_map_file VARCHAR(255) NULL,
    land_7_12_8a_papers_file VARCHAR(255) NULL,
    land_other_rights_j_certificate_file VARCHAR(255) NULL,
    udyami_certificate VARCHAR(10) NULL,
    udyami_certificate_file VARCHAR(255) NULL,
    shop_act_gumasta_license_file VARCHAR(255) NULL,
    fssai_certificate_file VARCHAR(255) NULL,
    gst_certificate_file VARCHAR(255) NULL,
    pf_esic_tan_certificate_file VARCHAR(255) NULL,
    factory_license_file VARCHAR(255) NULL,
    pollution_certificate_file VARCHAR(255) NULL,
    bank_fin_undertaking_form_file VARCHAR(255) NULL,
    bank_fin_dpr_file VARCHAR(255) NULL,
    bank_fin_quotation_machinery_file VARCHAR(255) NULL,
    bank_fin_quotation_boundary_wall_file VARCHAR(255) NULL,
    bank_fin_tie_up_agreement_file VARCHAR(255) NULL,
    bank_fin_loan_sanction_letter_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (business_sub_category_id) REFERENCES business_sub_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (business_type_id) REFERENCES business_types(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_type_id) REFERENCES types_of_units(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS management_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    email VARCHAR(255),
    state_id INT,
    region_id INT,
    business_position_id INT NULL,
    target_to_fill_farm DECIMAL(15,2) NULL,
    target_completed_so_far DECIMAL(15,2) NULL,
    existing_terms_according_to_target DECIMAL(15,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    FOREIGN KEY (business_position_id) REFERENCES designations(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS farmer_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    contact VARCHAR(100),
    state_id INT,
    state_division_id INT,
    state_sub_division_id INT,
    region_id INT,
    zone_id INT,
    taluka_id INT,
    village_id INT,
    block_id INT,
    circle_id INT,
    gram_panchayat_id INT,
    business_category_id INT,
    business_sub_category_id INT,
    business_type_id INT,
    product_id INT,
    first_name VARCHAR(100),
    father_name VARCHAR(255),
    last_name VARCHAR(100),
    date_of_birth DATE,
    blood_group VARCHAR(20),
    gender VARCHAR(20),
    caste VARCHAR(100),
    photo_path VARCHAR(255),
    education VARCHAR(100),
    ration_card_path VARCHAR(255),
    election_card_path VARCHAR(255),
    address TEXT,
    mobile_number VARCHAR(20),
    whatsapp_number VARCHAR(20),
    pan_card_path VARCHAR(255),
    bank_account_number VARCHAR(50),
    aadhar_card_path VARCHAR(255),
    registration_date DATE,
    registration_type VARCHAR(100),
    farm_area VARCHAR(50),
    email VARCHAR(255),
    bank_name VARCHAR(255),
    ifsc_code VARCHAR(20),
    pincode VARCHAR(10),
    password_hash VARCHAR(255),
    ward VARCHAR(100),
    police_station VARCHAR(255),
    middle_name VARCHAR(100),
    family_member_name VARCHAR(255),
    family_relation VARCHAR(100),
    family_dob DATE,
    family_phone VARCHAR(20),
    family_aadhar_path VARCHAR(255),
    transactions_below_15_lakh VARCHAR(50),
    e_bank_account VARCHAR(50),
    additional_production VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
    FOREIGN KEY (state_division_id) REFERENCES state_divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (state_sub_division_id) REFERENCES state_sub_divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
    FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE SET NULL,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE SET NULL,
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL,
    FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE SET NULL,
    FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL,
    FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (business_sub_category_id) REFERENCES business_sub_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (business_type_id) REFERENCES business_types(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS customer_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    email VARCHAR(255),
    state_id INT,
    village_id INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    whatsapp_number VARCHAR(20),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS lakhpati_didi_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    state_id INT,
    state_division_id INT,
    region_id INT,
    zone_id INT,
    vidhan_sabha_id INT,
    taluka_id INT,
    circle_id INT,
    gram_panchayat_id INT,
    village_id INT,
    business_category_id INT,
    business_type_id INT,
    product_id INT,
    unit_id INT,
    -- user details
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    blood_group VARCHAR(20),
    caste VARCHAR(100),
    education VARCHAR(100),
    occupation VARCHAR(100),
    business VARCHAR(255),
    mobile_number VARCHAR(20),
    phone_number VARCHAR(20),
    whatsapp_number VARCHAR(20),
    pan_card VARCHAR(20),
    aadhar_card VARCHAR(20),
    pincode VARCHAR(10),
    photo_path VARCHAR(255),
    password_hash VARCHAR(255),
    -- nominee details (flattened from lakhpati_didi_nominees)
    nominee_name VARCHAR(255),
    nominee_relation VARCHAR(100),
    nominee_dob DATE,
    nominee_phone VARCHAR(20),
    nominee_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
    FOREIGN KEY (vidhan_sabha_id) REFERENCES vidhan_sabhas(id) ON DELETE SET NULL,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS lakhpati_didi_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    state_id INT,
    state_division_id INT,
    region_id INT,
    zone_id INT,
    vidhan_sabha_id INT,
    taluka_id INT,
    circle_id INT,
    gram_panchayat_id INT,
    village_id INT,
    business_category_id INT,
    business_type_id INT,
    product_id INT,
    unit_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES lakhpati_didi_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
    FOREIGN KEY (state_division_id) REFERENCES state_divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
    FOREIGN KEY (vidhan_sabha_id) REFERENCES vidhan_sabhas(id) ON DELETE SET NULL,
    FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE SET NULL,
    FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE SET NULL,
    FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE SET NULL,
    FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (business_type_id) REFERENCES business_types(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS lakhpati_didi_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    blood_group VARCHAR(20),
    caste VARCHAR(100),
    education VARCHAR(100),
    occupation VARCHAR(100),
    business VARCHAR(255),
    mobile_number VARCHAR(20),
    phone_number VARCHAR(20),
    whatsapp_number VARCHAR(20),
    pan_card VARCHAR(20),
    aadhar_card VARCHAR(20),
    pincode VARCHAR(10),
    photo_path VARCHAR(255),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES lakhpati_didi_registrations(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS lakhpati_didi_nominees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    nominee_name VARCHAR(255),
    nominee_relation VARCHAR(100),
    nominee_dob DATE,
    nominee_phone VARCHAR(20),
    nominee_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES lakhpati_didi_registrations(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sub_admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS sub_admin_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sub_admin_id INT NOT NULL,
    path VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_sub_admin_path (sub_admin_id, path),
    FOREIGN KEY (sub_admin_id) REFERENCES sub_admins(id) ON DELETE CASCADE
  )`,
];

async function initDatabase() {
  const connectionConfig = {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' ready.`);

    await connection.query(`USE \`${dbName}\``);

    for (const sql of CREATE_TABLE_STATEMENTS) {
      await connection.query(sql);
    }
    console.log('All tables created or already exist.');

    // Add columns for business pages and countries (safe for existing DBs; ignore if column exists)
    const alterStatements = [
      `ALTER TABLE countries ADD COLUMN continent_id INT NULL`,
      `ALTER TABLE countries ADD CONSTRAINT fk_countries_continent FOREIGN KEY (continent_id) REFERENCES continents(id) ON DELETE SET NULL`,
      `ALTER TABLE types_of_units ADD COLUMN type_category VARCHAR(20) NULL`,
      `ALTER TABLE units ADD COLUMN village_id INT NULL`,
      `ALTER TABLE units ADD CONSTRAINT fk_units_village FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE SET NULL`,
      `ALTER TABLE units ADD COLUMN status VARCHAR(30) NULL`,
      `ALTER TABLE units ADD COLUMN unit_type_id INT NULL`,
      `ALTER TABLE units ADD CONSTRAINT fk_units_unit_type FOREIGN KEY (unit_type_id) REFERENCES types_of_units(id) ON DELETE SET NULL`,
      `ALTER TABLE business_categories ADD COLUMN vidhan_sabha_id INT NULL`,
      `ALTER TABLE business_categories ADD CONSTRAINT fk_bc_vidhan_sabha FOREIGN KEY (vidhan_sabha_id) REFERENCES vidhan_sabhas(id) ON DELETE SET NULL`,
      `ALTER TABLE products ADD COLUMN business_sub_category_id INT NULL`,
      `ALTER TABLE products ADD CONSTRAINT fk_products_business_sub_category FOREIGN KEY (business_sub_category_id) REFERENCES business_sub_categories(id) ON DELETE SET NULL`,
      `ALTER TABLE business_types ADD COLUMN product_id INT NULL`,
      `ALTER TABLE business_types ADD CONSTRAINT fk_business_types_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`,
      `ALTER TABLE regions ADD COLUMN state_sub_division_id INT NULL`,
      `ALTER TABLE regions ADD CONSTRAINT fk_regions_state_sub_division FOREIGN KEY (state_sub_division_id) REFERENCES state_sub_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE talukas ADD COLUMN vidhan_sabha_id INT NULL`,
      `ALTER TABLE talukas ADD CONSTRAINT fk_talukas_vidhan_sabha FOREIGN KEY (vidhan_sabha_id) REFERENCES vidhan_sabhas(id) ON DELETE SET NULL`,
      `ALTER TABLE vidhan_sabhas ADD COLUMN vidhan_sabha_type VARCHAR(50) NULL`,
      `ALTER TABLE state_divisions ADD COLUMN state_circle_id INT NULL`,
      `ALTER TABLE state_divisions ADD CONSTRAINT fk_state_divisions_state_circle FOREIGN KEY (state_circle_id) REFERENCES state_circles(id) ON DELETE SET NULL`,
      `ALTER TABLE designations ADD COLUMN parent_id INT NULL`,
      `ALTER TABLE designations ADD CONSTRAINT fk_designations_parent FOREIGN KEY (parent_id) REFERENCES designations(id) ON DELETE SET NULL`,
      `ALTER TABLE circles ADD COLUMN block_id INT NULL`,
      `ALTER TABLE circles ADD CONSTRAINT fk_circles_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL`,
      `ALTER TABLE position_allotments ADD COLUMN business_category_id INT NULL`,
      `ALTER TABLE position_allotments ADD CONSTRAINT fk_pa_business_category FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE SET NULL`,
      `ALTER TABLE position_allotments MODIFY COLUMN name VARCHAR(255) NULL`,
      `ALTER TABLE position_allotments ADD COLUMN level_type VARCHAR(50) NULL`,
      `ALTER TABLE position_allotments ADD COLUMN area_id INT NULL`,
      `ALTER TABLE position_allotments ADD COLUMN business_position_id INT NULL`,
      `ALTER TABLE position_allotments ADD CONSTRAINT fk_pa_business_position FOREIGN KEY (business_position_id) REFERENCES designations(id) ON DELETE SET NULL`,
      `ALTER TABLE position_allotments ADD COLUMN business_sector_id INT NULL`,
      `ALTER TABLE position_allotments ADD CONSTRAINT fk_pa_business_sector FOREIGN KEY (business_sector_id) REFERENCES business_sectors(id) ON DELETE SET NULL`,
      `ALTER TABLE position_allotments ADD COLUMN user_name VARCHAR(255) NULL`,
      `ALTER TABLE position_allotments ADD COLUMN lakhpati_didi_user_id INT NULL`,
      `ALTER TABLE position_allotments ADD CONSTRAINT fk_pa_lakhpati_didi_user FOREIGN KEY (lakhpati_didi_user_id) REFERENCES lakhpati_didi_users(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD COLUMN incharge_user_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN business_position_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN incharge_address VARCHAR(500) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN incharge_aadhaar VARCHAR(50) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN officer_department_position_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN target_to_fill_farm DECIMAL(15,2) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN target_completed_so_far DECIMAL(15,2) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN existing_terms_according_to_target DECIMAL(15,2) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN state_circle_id INT NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_state_circle FOREIGN KEY (state_circle_id) REFERENCES state_circles(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD COLUMN country_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN country_division_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN state_division_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN state_sub_division_id INT NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_state_sub_division FOREIGN KEY (state_sub_division_id) REFERENCES state_sub_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD COLUMN zone_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN vidhan_sabha_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN taluka_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN block_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN circle_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN gram_panchayat_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN village_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN business_category_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN business_sub_category_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN product_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN business_type_id INT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN first_name VARCHAR(100) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN middle_name VARCHAR(100) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN last_name VARCHAR(100) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN date_of_birth DATE NULL`,
      `ALTER TABLE management_registrations ADD COLUMN blood_group VARCHAR(20) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN caste VARCHAR(50) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN education VARCHAR(100) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN occupation VARCHAR(100) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN business VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN mobile_number VARCHAR(20) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN phone_number VARCHAR(20) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN whatsapp_number VARCHAR(20) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN pan_card VARCHAR(20) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN aadhar_card VARCHAR(50) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN pincode VARCHAR(10) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN photo_path VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN voter_id_path VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN password_hash VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN nominee_name VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN nominee_relation VARCHAR(100) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN nominee_dob DATE NULL`,
      `ALTER TABLE management_registrations ADD COLUMN nominee_phone VARCHAR(20) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN nominee_address TEXT NULL`,
      `ALTER TABLE management_registrations ADD COLUMN management_net_worth DECIMAL(15,2) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN baseline_family_net_worth DECIMAL(15,2) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN passport_path VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN birth_certificate_path VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN bank_book_path VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN income_certificate_path VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN work_form_received VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN work_form_deposited VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN receipt_path VARCHAR(255) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN business_payment_amount DECIMAL(15,2) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN self_contribution_amount DECIMAL(15,2) NULL`,
      `ALTER TABLE management_registrations ADD COLUMN total_incentive_amount DECIMAL(15,2) NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_officer_designation FOREIGN KEY (officer_department_position_id) REFERENCES designations(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_country_division FOREIGN KEY (country_division_id) REFERENCES country_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_state_division FOREIGN KEY (state_division_id) REFERENCES state_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_zone FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_vidhan_sabha FOREIGN KEY (vidhan_sabha_id) REFERENCES vidhan_sabhas(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_taluka FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_circle FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_gram_panchayat FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_village FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_business_category FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_business_sub_category FOREIGN KEY (business_sub_category_id) REFERENCES business_sub_categories(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_business_type FOREIGN KEY (business_type_id) REFERENCES business_types(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_incharge_user FOREIGN KEY (incharge_user_id) REFERENCES lakhpati_didi_users(id) ON DELETE SET NULL`,
      `ALTER TABLE management_registrations ADD CONSTRAINT fk_mgmt_business_position FOREIGN KEY (business_position_id) REFERENCES designations(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN first_name VARCHAR(100) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN last_name VARCHAR(100) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN whatsapp_number VARCHAR(20) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN password_hash VARCHAR(255) NULL`,
      // Customer registration – same fields as Lakhpati Didi (safe ADD COLUMN)
      `ALTER TABLE customer_registrations ADD COLUMN state_circle_id INT NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_state_circle FOREIGN KEY (state_circle_id) REFERENCES state_circles(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN country_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN country_division_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN state_division_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN state_sub_division_id INT NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_state_sub_division FOREIGN KEY (state_sub_division_id) REFERENCES state_sub_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN region_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN zone_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN vidhan_sabha_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN taluka_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN block_id INT NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN circle_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN gram_panchayat_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN business_category_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN business_sub_category_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN product_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN business_type_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN unit_id INT NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN middle_name VARCHAR(100) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN date_of_birth DATE NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN blood_group VARCHAR(20) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN caste VARCHAR(100) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN education VARCHAR(100) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN occupation VARCHAR(100) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN business VARCHAR(255) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN mobile_number VARCHAR(20) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN phone_number VARCHAR(20) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN pan_card VARCHAR(20) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN aadhar_card VARCHAR(20) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN pincode VARCHAR(10) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN photo_path VARCHAR(255) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN nominee_name VARCHAR(255) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN nominee_relation VARCHAR(100) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN nominee_dob DATE NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN nominee_phone VARCHAR(20) NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN nominee_address TEXT NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_country_division FOREIGN KEY (country_division_id) REFERENCES country_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_state_division FOREIGN KEY (state_division_id) REFERENCES state_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_zone FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_vidhan_sabha FOREIGN KEY (vidhan_sabha_id) REFERENCES vidhan_sabhas(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_taluka FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_circle FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_gram_panchayat FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_business_category FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_business_sub_category FOREIGN KEY (business_sub_category_id) REFERENCES business_sub_categories(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_business_type FOREIGN KEY (business_type_id) REFERENCES business_types(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL`,
      `ALTER TABLE customer_registrations ADD COLUMN business_position_id INT NULL`,
      `ALTER TABLE customer_registrations ADD CONSTRAINT fk_customer_business_position FOREIGN KEY (business_position_id) REFERENCES designations(id) ON DELETE SET NULL`,
      // NOTE: Business Unit Allotment is stored in business_unit_allotments (not in customer_registrations).
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN first_name VARCHAR(100) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN middle_name VARCHAR(100) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN last_name VARCHAR(100) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN date_of_birth DATE NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN blood_group VARCHAR(20) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN caste VARCHAR(100) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN education VARCHAR(100) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN occupation VARCHAR(100) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN business VARCHAR(255) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN mobile_number VARCHAR(20) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN phone_number VARCHAR(20) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN whatsapp_number VARCHAR(20) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN pan_card VARCHAR(20) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN aadhar_card VARCHAR(20) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN pincode VARCHAR(10) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN photo_path VARCHAR(255) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN password_hash VARCHAR(255) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN nominee_name VARCHAR(255) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN nominee_relation VARCHAR(100) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN nominee_dob DATE NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN nominee_phone VARCHAR(20) NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN nominee_address TEXT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN state_division_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN state_sub_division_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD CONSTRAINT fk_lakhpati_state_sub_division FOREIGN KEY (state_sub_division_id) REFERENCES state_sub_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN region_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN taluka_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN block_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD CONSTRAINT fk_lakhpati_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN circle_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN gram_panchayat_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN business_category_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN business_type_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN product_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN unit_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN state_circle_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD CONSTRAINT fk_lakhpati_state_circle FOREIGN KEY (state_circle_id) REFERENCES state_circles(id) ON DELETE SET NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN country_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN country_division_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD CONSTRAINT fk_lakhpati_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD CONSTRAINT fk_lakhpati_country_division FOREIGN KEY (country_division_id) REFERENCES country_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD COLUMN business_position_id INT NULL`,
      `ALTER TABLE lakhpati_didi_registrations ADD CONSTRAINT fk_lakhpati_business_position FOREIGN KEY (business_position_id) REFERENCES designations(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations MODIFY COLUMN name VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN state_circle_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_state_circle FOREIGN KEY (state_circle_id) REFERENCES state_circles(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN country_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN country_division_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN state_division_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN state_sub_division_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN region_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN zone_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN block_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN circle_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN gram_panchayat_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN business_position_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_business_position FOREIGN KEY (business_position_id) REFERENCES designations(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN business_category_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN business_sub_category_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN business_type_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN product_id INT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN first_name VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN father_name VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN last_name VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN date_of_birth DATE NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN blood_group VARCHAR(20) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN caste VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN photo_path VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN education VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN ration_card_path VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN address TEXT NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN mobile_number VARCHAR(20) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN whatsapp_number VARCHAR(20) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN pan_card_path VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN bank_account_number VARCHAR(50) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN aadhar_card_path VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN registration_type VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN farm_area VARCHAR(50) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN email VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN bank_name VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN pincode VARCHAR(10) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN password_hash VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN family_member_name VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN family_relation VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN family_dob DATE NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN family_phone VARCHAR(20) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN family_aadhar_path VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations CHANGE COLUMN family_member_name nominee_name VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations CHANGE COLUMN family_relation nominee_relation VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations CHANGE COLUMN family_dob nominee_dob DATE NULL`,
      `ALTER TABLE farmer_registrations CHANGE COLUMN family_phone nominee_phone VARCHAR(20) NULL`,
      `ALTER TABLE farmer_registrations CHANGE COLUMN family_aadhar_path nominee_aadhar_path VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN transactions_below_15_lakh VARCHAR(50) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN e_bank_account VARCHAR(50) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN additional_production VARCHAR(50) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN gender VARCHAR(20) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN middle_name VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN election_card_path VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN registration_date DATE NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN ifsc_code VARCHAR(20) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN ward VARCHAR(100) NULL`,
      `ALTER TABLE farmer_registrations ADD COLUMN police_station VARCHAR(255) NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_state_division FOREIGN KEY (state_division_id) REFERENCES state_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_country_division FOREIGN KEY (country_division_id) REFERENCES country_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_state_sub_division FOREIGN KEY (state_sub_division_id) REFERENCES state_sub_divisions(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_zone FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_circle FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_gram_panchayat FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_business_category FOREIGN KEY (business_category_id) REFERENCES business_categories(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_business_sub_category FOREIGN KEY (business_sub_category_id) REFERENCES business_sub_categories(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_business_type FOREIGN KEY (business_type_id) REFERENCES business_types(id) ON DELETE SET NULL`,
      `ALTER TABLE farmer_registrations ADD CONSTRAINT fk_farmer_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`,
    ];
    const masterTables = [
      'continents', 'countries', 'country_divisions', 'states', 'state_circles', 'state_divisions', 'state_sub_divisions',
      'regions', 'zones', 'vidhan_sabhas', 'talukas', 'blocks', 'circles', 'gram_panchayats', 'villages',
      'products', 'business_types', 'units', 'types_of_units', 'business_categories', 'business_sub_categories',
      'designations', 'business_positions', 'business_sectors', 'position_allotments', 'business_unit_allotments',
    ];
    for (const t of masterTables) {
      alterStatements.push(`ALTER TABLE \`${t}\` ADD COLUMN client_id VARCHAR(36) UNIQUE NULL`);
    }
    for (const sql of alterStatements) {
      try {
        await connection.query(sql);
      } catch (e) {
        const ignore = [
          'ER_DUP_FIELDNAME',   // column already exists
          'ER_DUP_KEYNAME',     // index already exists
          'ER_FK_DUP_NAME',     // foreign key constraint already exists (MySQL 1826)
          'ER_DUP_COLUMNNAME',  // MariaDB duplicate column
          'ER_DUP_FIELD',       // some servers use this for duplicate column
        ].includes(e.code);
        if (!ignore) {
          console.warn('Migration warning:', e.message);
        }
      }
    }

    // Safe registration-table migrations: add columns/FKs only if missing (idempotent, no reliance on error codes)
    async function addColumnIfMissing(table, column, def) {
      const [rows] = await connection.query(
        'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [dbName, table, column]
      );
      if (rows.length === 0) {
        await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${def}`);
        console.log(`Added ${table}.${column}`);
      }
    }
    async function addFkIfMissing(table, constraintName, column, refTable, refColumn = 'id') {
      const [rows] = await connection.query(
        `SELECT 1 FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ?`,
        [dbName, table, column, dbName, refTable]
      );
      if (rows.length === 0) {
        await connection.query(
          `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${constraintName}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${refTable}\`(\`${refColumn}\`) ON DELETE SET NULL`
        );
        console.log(`Added FK ${constraintName} on ${table}.${column}`);
      }
    }
    async function dropColumnIfExists(table, column) {
      const [rows] = await connection.query(
        'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [dbName, table, column]
      );
      if (rows.length > 0) {
        await connection.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``);
        console.log(`Dropped ${table}.${column}`);
      }
    }
    try {
      await dropColumnIfExists('designations', 'designation_type');
    } catch (e) {
      console.warn('Drop designations.designation_type:', e.message);
    }
    try {
      await addColumnIfMissing('customer_registrations', 'state_sub_division_id', 'INT NULL');
      await addFkIfMissing('customer_registrations', 'fk_customer_state_sub_division', 'state_sub_division_id', 'state_sub_divisions');
      await addColumnIfMissing('customer_registrations', 'block_id', 'INT NULL');
      await addFkIfMissing('customer_registrations', 'fk_customer_block', 'block_id', 'blocks');
      await addColumnIfMissing('customer_registrations', 'photo_path', 'VARCHAR(255) NULL');
      await addColumnIfMissing('lakhpati_didi_registrations', 'state_sub_division_id', 'INT NULL');
      await addFkIfMissing('lakhpati_didi_registrations', 'fk_lakhpati_state_sub_division', 'state_sub_division_id', 'state_sub_divisions');
      await addColumnIfMissing('lakhpati_didi_registrations', 'block_id', 'INT NULL');
      await addFkIfMissing('lakhpati_didi_registrations', 'fk_lakhpati_block', 'block_id', 'blocks');
      await addColumnIfMissing('lakhpati_didi_registrations', 'photo_path', 'VARCHAR(255) NULL');
      await addColumnIfMissing('farmer_registrations', 'vidhan_sabha_id', 'INT NULL');
      await addFkIfMissing('farmer_registrations', 'fk_farmer_vidhan_sabha', 'vidhan_sabha_id', 'vidhan_sabhas');
      // Ensure all registration tables have business columns + FKs (safe idempotent add; no drop)
      const businessColumns = [
        { column: 'business_position_id', def: 'INT NULL', refTable: 'designations', fkSuffix: 'business_position' },
        { column: 'business_category_id', def: 'INT NULL', refTable: 'business_categories', fkSuffix: 'business_category' },
        { column: 'business_sub_category_id', def: 'INT NULL', refTable: 'business_sub_categories', fkSuffix: 'business_sub_category' },
        { column: 'product_id', def: 'INT NULL', refTable: 'products', fkSuffix: 'product' },
        { column: 'business_type_id', def: 'INT NULL', refTable: 'business_types', fkSuffix: 'business_type' },
      ];
      const tablePrefixes = {
        farmer_registrations: 'fk_farmer',
        customer_registrations: 'fk_customer',
        lakhpati_didi_registrations: 'fk_lakhpati',
        management_registrations: 'fk_mgmt',
      };
      for (const [table, prefix] of Object.entries(tablePrefixes)) {
        for (const { column, def, refTable, fkSuffix } of businessColumns) {
          await addColumnIfMissing(table, column, def);
          await addFkIfMissing(table, `${prefix}_${fkSuffix}`, column, refTable);
        }
      }

      // Business Unit Allotments: add required columns/FKs for admin form (idempotent)
      await addColumnIfMissing('business_unit_allotments', 'business_sub_category_id', 'INT NULL');
      await addFkIfMissing('business_unit_allotments', 'fk_bua_business_sub_category', 'business_sub_category_id', 'business_sub_categories');
      await addColumnIfMissing('business_unit_allotments', 'business_cluster_name', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'unit_company_name', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'beneficiary_name', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'aadhar_card_number', 'VARCHAR(20) NULL');
      await addColumnIfMissing('business_unit_allotments', 'pan_card_number', 'VARCHAR(20) NULL');
      await addColumnIfMissing('business_unit_allotments', 'shg_membership_certificate', 'VARCHAR(10) NULL');
      await addColumnIfMissing('business_unit_allotments', 'shg_membership_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'small_landholder_certificate', 'VARCHAR(10) NULL');
      await addColumnIfMissing('business_unit_allotments', 'small_landholder_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'caste_certificate_scst', 'VARCHAR(10) NULL');
      await addColumnIfMissing('business_unit_allotments', 'caste_certificate_scst_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'special_category_certificate', 'VARCHAR(10) NULL');
      await addColumnIfMissing('business_unit_allotments', 'special_category_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'udid_disability_certificate', 'VARCHAR(10) NULL');
      await addColumnIfMissing('business_unit_allotments', 'udid_disability_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'training_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'educational_marks_sheet_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'school_leaving_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'birth_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'domicile_nationality_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'cibil_report_score', 'VARCHAR(50) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_name', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_branch_city', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_branch_taluka', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_branch_district', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_branch_state', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_branch_manager_name', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_branch_manager_mobile', 'VARCHAR(20) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_branch_ifsc_code', 'VARCHAR(20) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_current_account_cancelled_cheque_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_saving_account_passbook_first_page_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_plot_finalized_30_years', 'VARCHAR(10) NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_plot_finalized_30_years_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_owner_name', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_owner_mobile', 'VARCHAR(20) NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_address_gis', 'TEXT NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_current_location', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_gis_map_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_7_12_8a_papers_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'land_other_rights_j_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'udyami_certificate', 'VARCHAR(10) NULL');
      await addColumnIfMissing('business_unit_allotments', 'udyami_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'shop_act_gumasta_license_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'fssai_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'gst_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'pf_esic_tan_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'factory_license_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'pollution_certificate_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_fin_undertaking_form_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_fin_dpr_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_fin_quotation_machinery_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_fin_quotation_boundary_wall_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_fin_tie_up_agreement_file', 'VARCHAR(255) NULL');
      await addColumnIfMissing('business_unit_allotments', 'bank_fin_loan_sanction_letter_file', 'VARCHAR(255) NULL');
    } catch (e) {
      console.warn('Safe registration migration:', e.message);
    }
    // Migrate panchayat_samitis -> gram_panchayats (existing DBs)
    try {
      const [tables] = await connection.query("SHOW TABLES LIKE 'panchayat_samitis'");
      if (tables.length > 0) {
        await connection.query('RENAME TABLE panchayat_samitis TO gram_panchayats');
        const [fkRows] = await connection.query(
          "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'villages' AND COLUMN_NAME = 'panchayat_samiti_id' AND REFERENCED_TABLE_NAME IS NOT NULL",
          [dbName]
        );
        if (fkRows.length > 0) {
          await connection.query(`ALTER TABLE villages DROP FOREIGN KEY \`${fkRows[0].CONSTRAINT_NAME}\``);
        }
        await connection.query('ALTER TABLE villages CHANGE COLUMN panchayat_samiti_id gram_panchayat_id INT NULL');
        await connection.query('ALTER TABLE villages ADD CONSTRAINT fk_villages_gram_panchayat FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL');
        console.log('Migrated panchayat_samitis to gram_panchayats.');
      }
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE' && e.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.warn('Migration panchayat_samitis -> gram_panchayats:', e.message);
      }
    }
    // Migrate unit_types -> types_of_units (existing DBs)
    try {
      const [tables] = await connection.query("SHOW TABLES LIKE 'unit_types'");
      if (tables.length > 0) {
        await connection.query('RENAME TABLE unit_types TO types_of_units');
        console.log('Migrated unit_types to types_of_units.');
      }
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') {
        console.warn('Migration unit_types -> types_of_units:', e.message);
      }
    }
    // Migrate management_registrations: management_net_work -> management_net_worth, total_work_baseline_family -> baseline_family_net_worth
    try {
      const [cols] = await connection.query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'management_registrations' AND COLUMN_NAME IN ('management_net_work', 'management_net_worth', 'total_work_baseline_family', 'baseline_family_net_worth')",
        [dbName]
      );
      const names = cols.map((c) => c.COLUMN_NAME);
      if (names.includes('management_net_work') && !names.includes('management_net_worth')) {
        await connection.query('ALTER TABLE management_registrations CHANGE COLUMN management_net_work management_net_worth DECIMAL(15,2) NULL');
        console.log('Migrated management_registrations.management_net_work to management_net_worth.');
      }
      if (names.includes('total_work_baseline_family') && !names.includes('baseline_family_net_worth')) {
        await connection.query('ALTER TABLE management_registrations CHANGE COLUMN total_work_baseline_family baseline_family_net_worth DECIMAL(15,2) NULL');
        console.log('Migrated management_registrations.total_work_baseline_family to baseline_family_net_worth.');
      }
    } catch (e) {
      console.warn('Migration management_registrations net worth columns:', e.message);
    }
    // Migrate management_registrations: existing_terms_according_to_target VARCHAR -> DECIMAL (align with form numeric field)
    try {
      const [cols] = await connection.query(
        "SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'management_registrations' AND COLUMN_NAME = 'existing_terms_according_to_target'",
        [dbName]
      );
      if (cols.length > 0 && cols[0].DATA_TYPE.toLowerCase() === 'varchar') {
        await connection.query('ALTER TABLE management_registrations MODIFY COLUMN existing_terms_according_to_target DECIMAL(15,2) NULL');
        console.log('Migrated management_registrations.existing_terms_according_to_target to DECIMAL(15,2).');
      }
    } catch (e) {
      console.warn('Migration management_registrations existing_terms_according_to_target:', e.message);
    }
    // Ensure villages has gram_panchayat_id (for DBs where villages still has panchayat_samiti_id)
    try {
      const [cols] = await connection.query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'villages' AND COLUMN_NAME IN ('gram_panchayat_id', 'panchayat_samiti_id')",
        [dbName]
      );
      const hasGram = cols.some((c) => c.COLUMN_NAME === 'gram_panchayat_id');
      const hasOld = cols.some((c) => c.COLUMN_NAME === 'panchayat_samiti_id');
      if (!hasGram && hasOld) {
        const [fkRows] = await connection.query(
          "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'villages' AND COLUMN_NAME = 'panchayat_samiti_id' AND REFERENCED_TABLE_NAME IS NOT NULL",
          [dbName]
        );
        if (fkRows.length > 0) {
          await connection.query(`ALTER TABLE villages DROP FOREIGN KEY \`${fkRows[0].CONSTRAINT_NAME}\``);
        }
        await connection.query('ALTER TABLE villages ADD COLUMN gram_panchayat_id INT NULL');
        await connection.query('UPDATE villages SET gram_panchayat_id = panchayat_samiti_id');
        await connection.query('ALTER TABLE villages DROP COLUMN panchayat_samiti_id');
        await connection.query('ALTER TABLE villages ADD CONSTRAINT fk_villages_gram_panchayat FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL');
        console.log('Migrated villages.panchayat_samiti_id to gram_panchayat_id.');
      } else if (!hasGram) {
        await connection.query('ALTER TABLE villages ADD COLUMN gram_panchayat_id INT NULL');
        await connection.query('ALTER TABLE villages ADD CONSTRAINT fk_villages_gram_panchayat FOREIGN KEY (gram_panchayat_id) REFERENCES gram_panchayats(id) ON DELETE SET NULL');
        console.log('Added villages.gram_panchayat_id.');
      }
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_DUP_KEYNAME' && e.code !== 'ER_FK_DUP_NAME') {
        console.warn('Migration villages gram_panchayat_id:', e.message);
      }
    }
    // Backfill client_id for existing rows (so every row has a value; new rows get short id from app)
    for (const t of masterTables) {
      try {
        await connection.query(`UPDATE \`${t}\` SET client_id = LOWER(UUID()) WHERE client_id IS NULL`);
      } catch (e) {
        console.warn('Backfill client_id warning:', t, e.message);
      }
    }

    // Seed default admin if none exists (phone: 1234567890, password: admin@123)
    try {
      const [rows] = await connection.query('SELECT id FROM admins WHERE phone = ?', ['1234567890']);
      if (rows.length === 0) {
        const bcrypt = require('bcrypt');
        const passwordHash = await bcrypt.hash('admin@123', 10);
        await connection.query('INSERT INTO admins (phone, password_hash) VALUES (?, ?)', ['1234567890', passwordHash]);
        console.log('Default admin created (phone: 1234567890).');
      }
    } catch (e) {
      console.warn('Admin seed warning:', e.message);
    }
  } catch (err) {
    console.error('Database init error:', err.message);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { initDatabase };

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database init completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database init failed:', err);
      process.exit(1);
    });
}
