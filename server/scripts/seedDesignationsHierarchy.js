const { pool } = require('../config/database');
const MasterModel = require('../models/masterData.model');

const HIERARCHY = [
  { name: 'CMD / CHAIRMAN (INTERNATIONAL BUSINESSES)', parent: null },
  { name: 'SVP (Sr. VICE PRESIDENT) - COUNTRY DIVISION', parent: 'CMD / CHAIRMAN (INTERNATIONAL BUSINESSES)' },
  { name: 'VP (VICE PRESIDENT) - STATE (288 MLAs)', parent: 'SVP (Sr. VICE PRESIDENT) - COUNTRY DIVISION' },
  { name: 'AVP (Asst. VICE PRESIDENT)- STATE DIVISION (72 MLAs)', parent: 'VP (VICE PRESIDENT) - STATE (288 MLAs)' },
  { name: 'SGM/GM/DGM/AGM (GEN MGR) STATE SUB DIVISION- 36 MLAs', parent: 'AVP (Asst. VICE PRESIDENT)- STATE DIVISION (72 MLAs)' },
  { name: 'RM / ARM (REGIONAL MANAGER)- 1 LOKSABHA / 1 REGION/ 6 MLAs', parent: 'SGM/GM/DGM/AGM (GEN MGR) STATE SUB DIVISION- 36 MLAs' },
  { name: 'ZM / DC (ZONAL MANAGER)- 3 MLAs / 1 ZONE', parent: 'RM / ARM (REGIONAL MANAGER)- 1 LOKSABHA / 1 REGION/ 6 MLAs' },
  { name: 'VC (VIDHANSABHA COORDINATOR) - 1 MLA / 6000 LAKHAPATI DIDI', parent: 'ZM / DC (ZONAL MANAGER)- 3 MLAs / 1 ZONE' },
  { name: 'TC (TALUKA COORDINATOR) - 3000 LAKHAPATI DIDI', parent: 'VC (VIDHANSABHA COORDINATOR) - 1 MLA / 6000 LAKHAPATI DIDI' },
  { name: 'CC (CIRCLE COORDINATOR) - 600 LAKHAPATI DIDI', parent: 'TC (TALUKA COORDINATOR) - 3000 LAKHAPATI DIDI' },
  { name: 'FD / PD (FIELD DIRECTOR) - 150 LAKHAPATI DIDI', parent: 'CC (CIRCLE COORDINATOR) - 600 LAKHAPATI DIDI' },
  { name: 'UGL (UDYOG GROUP LEADER) -30 LAKHAPATI DIDI', parent: 'FD / PD (FIELD DIRECTOR) - 150 LAKHAPATI DIDI' },
  { name: 'UNIT ADHYAKSH (A/B/C)', parent: 'UGL (UDYOG GROUP LEADER) -30 LAKHAPATI DIDI' },
  { name: 'LAKHAPATI DIDI (01+02+07 = 10 UDYOG SAKHI)', parent: 'UNIT ADHYAKSH (A/B/C)' },
  { name: 'FARMER PARTNER / AGRI ENREPRENOUR- 09 Nos', parent: 'LAKHAPATI DIDI (01+02+07 = 10 UDYOG SAKHI)' },
  { name: 'CUSTOMER PARTNER (CP)- 03 Nos', parent: 'LAKHAPATI DIDI (01+02+07 = 10 UDYOG SAKHI)' },
];

async function seed() {
  try {
    console.log('Seeding designation hierarchy...');
    const existing = (await MasterModel.findAll('designations')) || [];
    const nameToRow = new Map(existing.map((r) => [r.name, r]));
    const nameToId = new Map(existing.map((r) => [r.name, r.id]));

    for (const item of HIERARCHY) {
      const parentId = item.parent ? nameToId.get(item.parent) || null : null;
      if (nameToRow.has(item.name)) {
        // Optionally update parent if it changed
        const current = nameToRow.get(item.name);
        if (parentId != null && current.parent_id !== parentId) {
          await MasterModel.update('designations', current.client_id || current.id, { parent_id: parentId });
          console.log('Updated parent for existing designation:', item.name);
        } else {
          console.log('Designation already exists, skipping:', item.name);
        }
        continue;
      }
      const created = await MasterModel.create('designations', {
        name: item.name,
        parent_id: parentId,
        code: null,
      });
      if (created) {
        nameToRow.set(item.name, created);
        nameToId.set(item.name, created.id);
        console.log('Inserted designation:', item.name);
      }
    }
    console.log('Done seeding designation hierarchy.');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

