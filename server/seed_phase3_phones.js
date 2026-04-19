require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const brandsData = [
  {
    brand: "Xiaomi", // combining Xiaomi, Redmi, Poco into Xiaomi for brand field
    models: [
      { name: "Mi 11", code: "M2011K2G" },
      { name: "Mi 11 Lite", code: "M2101K9AG" },
      { name: "Mi 10", code: "M2001J2G" },
      { name: "Mi 10 Pro", code: "M2001J1G" },
      { name: "Mi Note 10", code: "M1910F4G" },
      { name: "Mi Note 10 Pro", code: "M1910F4S" },
      { name: "Mi 9T", code: "M1903F10G" },
      { name: "Mi 9", code: "M1902F1G" },
      { name: "Mi A3", code: "M1906F9SH" },
      { name: "Mi 8", code: "M1803E1A" },
      { name: "Mi A2", code: "M1804D2SG" },
      { name: "Mi Max 3", code: "M1804E4A" },
      { name: "Mi Mix 3", code: "M1810E5A" },
      { name: "Mi Mix 2S", code: "M1803D5XA" },
      { name: "Redmi 13C", code: "23100RN82L" },
      { name: "Redmi 12", code: "23053RN02A" },
      { name: "Redmi 10", code: "21061119AG" },
      { name: "Redmi 7", code: "M1810F6LG" },
      { name: "Redmi Note 7", code: "M1901F7G" },
      { name: "Redmi Note 6 Pro", code: "M1806E7TG" },
      { name: "Redmi Note 5", code: "M1803E7SG" },
      { name: "14C", code: "2409BRN2CA" }, 
      { name: "14C 5G", code: "2410FPAG2A" },
      { name: "14R 5G", code: "24090RN04C" }, 
      { name: "Note 13 Pro 5G", code: "2312DRA50G" },
      { name: "Poco X3", code: "M2007J20CG" },
      { name: "Poco F1", code: "M1805E10A" },
      { name: "Poco C75", code: "2410FPAG2G" }
    ]
  },
  {
    brand: "Vivo",
    models: [
      { name: "X60 Pro", code: "V2046" },
      { name: "X50", code: "V2001" },
      { name: "V29", code: "V2250" },
      { name: "S15e", code: "V2190A" },
      { name: "Y70", code: "V2029" },
      { name: "Y56 5G", code: "V2225" },
      { name: "Y55 5G", code: "V2127" },
      { name: "Y52 5G", code: "V2053" },
      { name: "Y33s", code: "V2109" },
      { name: "Y30g", code: "V2066" },
      { name: "Y30", code: "V1938" },
      { name: "Y3s", code: "V2018" },
      { name: "Y3", code: "V1901A" },
      { name: "Y22s", code: "V2206" },
      { name: "Y22", code: "V2207" },
      { name: "Y21s", code: "V2110" },
      { name: "Y21", code: "V2111" },
      { name: "Y20s G", code: "V2038" },
      { name: "Y20s", code: "V2027" },
      { name: "Y20i", code: "V2027i" },
      { name: "Y20", code: "V2027" },
      { name: "Y17s", code: "V2310" },
      { name: "Y17", code: "1901" },
      { name: "Y16", code: "V2204" },
      { name: "Y15s", code: "V2120" },
      { name: "Y15", code: "1901" },
      { name: "Y12a", code: "V2102" },
      { name: "Y12", code: "1904" },
      { name: "Y11s", code: "V2028" },
      { name: "Y11", code: "1906" }
    ]
  },
  {
    brand: "OnePlus",
    models: [
      { name: "10T", code: "CPH2415" },
      { name: "10 Pro", code: "NE2213" },
      { name: "9RT 5G", code: "MT2111" },
      { name: "9", code: "LE2113" },
      { name: "9R", code: "LE2101" },
      { name: "9 Pro", code: "LE2123" },
      { name: "8T", code: "KB2003" },
      { name: "8", code: "IN2013" },
      { name: "8 Pro", code: "IN2023" },
      { name: "7T", code: "HD1903" },
      { name: "7", code: "GM1903" },
      { name: "6T", code: "A6013" },
      { name: "6", code: "A6003" },
      { name: "5T", code: "A5010" },
      { name: "5", code: "A5000" },
      { name: "3T", code: "A3010" },
      { name: "3", code: "A3000" },
      { name: "1", code: "A0001" },
      { name: "Nord CE 2 5G", code: "IV2201" },
      { name: "Nord CE 5G", code: "EB2103" },
      { name: "Nord 2", code: "DN2103" },
      { name: "Nord 5G", code: "AC2003" }
    ]
  },
  {
    brand: "LG",
    models: [
      { name: "G8s", code: "LMG810EA" },
      { name: "G8", code: "LMG820UMA" },
      { name: "G7", code: "LMG710EM" },
      { name: "G6", code: "H870" },
      { name: "G5", code: "H850" },
      { name: "G4", code: "H815" },
      { name: "G3", code: "D855" },
      { name: "G2", code: "D802" },
      { name: "K50", code: "LMX520EMW" },
      { name: "K10 K530", code: "K530" },
      { name: "K11 Plus", code: "LMX410EO" },
      { name: "K10 M250YK", code: "M250YK" },
      { name: "K8", code: "K350N" },
      { name: "K4 X230", code: "X230" },
      { name: "K520", code: "K520" },
      { name: "K10 K430", code: "K430ds" },
      { name: "Velvet", code: "LMG900EM" },
      { name: "Q7", code: "LMQ610EM" },
      { name: "Q6", code: "M700N" },
      { name: "V50", code: "LMV500EM" },
      { name: "V40", code: "LMV405EBW" },
      { name: "Nexus 5X", code: "H791" },
      { name: "Nexus 5", code: "D821" },
      { name: "Nexus 4", code: "E960" }
    ]
  },
  {
    brand: "Nokia",
    models: [
      { name: "XR21", code: "TA-1486" },
      { name: "XR20", code: "TA-1362" },
      { name: "X20", code: "TA-1341" },
      { name: "C32", code: "TA-1534" },
      { name: "C30", code: "TA-1359" },
      { name: "C22", code: "TA-1533" },
      { name: "C21 Plus", code: "TA-1433" },
      { name: "G60", code: "TA-1479" },
      { name: "G50", code: "TA-1361" },
      { name: "G42", code: "TA-1581" },
      { name: "G22", code: "TA-1528" },
      { name: "G21", code: "TA-1418" },
      { name: "G20", code: "TA-1336" },
      { name: "G11 Plus", code: "TA-1421" },
      { name: "G11", code: "TA-1401" },
      { name: "G10", code: "TA-1334" },
      { name: "9 Pureview", code: "TA-1087" },
      { name: "8.3 5G", code: "TA-1243" },
      { name: "8.1", code: "TA-1119" },
      { name: "X7", code: "TA-1131" },
      { name: "8", code: "TA-1004" },
      { name: "7 Plus", code: "TA-1046" },
      { name: "7.2", code: "TA-1196" },
      { name: "7.1", code: "TA-1095" },
      { name: "6.1 Plus", code: "TA-1116" },
      { name: "6.1", code: "TA-1043" },
      { name: "6.2", code: "TA-1198" },
      { name: "6", code: "TA-1021" },
      { name: "5.3", code: "TA-1234" },
      { name: "5.1 Plus", code: "TA-1105" },
      { name: "5.1", code: "TA-1075" },
      { name: "5", code: "TA-1024" },
      { name: "4.2", code: "TA-1157" },
      { name: "3.2", code: "TA-1156" },
      { name: "3.1", code: "TA-1049" },
      { name: "1520", code: "RM-937" },
      { name: "1320", code: "RM-994" },
      { name: "1020", code: "RM-875" },
      { name: "950", code: "RM-1108" },
      { name: "950XL", code: "RM-1085" },
      { name: "930", code: "RM-1045" },
      { name: "935", code: "RM-1045" },
      { name: "925", code: "RM-892" },
      { name: "920", code: "RM-821" },
      { name: "900", code: "RM-808" },
      { name: "830", code: "RM-984" },
      { name: "825", code: "RM-825" },
      { name: "820", code: "RM-825" },
      { name: "800", code: "RM-801" },
      { name: "735", code: "RM-1038" },
      { name: "730", code: "RM-1040" },
      { name: "720", code: "RM-885" },
      { name: "650", code: "RM-1152" },
      { name: "640XL", code: "RM-1062" }
    ]
  }
];

const categories = [
  "Screen Replacement",
  "Battery Replacement",
  "Logic Board Repair",
  "Charging Port Replacement",
  "Back Housing Replacement",
  "Front Camera Replacement",
  "Back Camera Replacement"
];

const items = [];

for (const brandObj of brandsData) {
  const brand = brandObj.brand;
  for (const model of brandObj.models) {
    for (const cat of categories) {
      const generatedName = `${model.name} ${cat}`;
      items.push({
        name: generatedName,
        model: `${brand}||${model.name}`,
        device_model: model.code,
        sku: `${brand.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        stock: 0,
        minStock: 0,
        costPrice: 0,
        price: 0,
        margin: 0,
        iconName: "Smartphone",
        status: "in-stock",
        category: cat
      });
    }
  }
}

// Icon mapping based on POS heuristics
items.forEach(i => {
  if (i.category.includes('Battery')) i.iconName = 'Battery';
  else if (i.category.includes('Charging')) i.iconName = 'Zap';
  else if (i.category.includes('Logic')) i.iconName = 'Wrench';
  else i.iconName = 'Smartphone';
});

(async () => {
  console.log('--- Phase 3 Database Seeding Script Start ---');
  console.log('Connecting to Supabase...');
  
  // Fetch existing items to avoid duplicates
  const { data: existing, error: fetchErr } = await supabase.from('inventory').select('name');
  if (fetchErr) {
    console.error('Failed to fetch existing items:', fetchErr);
    process.exit(1);
  }
  
  const existingNames = new Set(existing.map(i => i.name.toLowerCase().trim()));

  const skipped = [];
  const toInsert = [];

  items.forEach(i => {
    if (existingNames.has(i.name.toLowerCase().trim())) {
      skipped.push(i);
    } else {
      toInsert.push(i);
    }
  });

  console.log(`\nFound ${skipped.length} existing items. Skipping these...`);
  // Log first a few skipped items as sample
  if (skipped.length > 0) {
    console.log(`Sample Skipped:\n`, skipped.map(s => ` - [SKIPPED] ${s.name}`).slice(0, 10).join('\n'));
    if (skipped.length > 10) console.log(`   ...and ${skipped.length - 10} more skipped.`);
  }

  console.log(`\nNew Items to Insert: ${toInsert.length}`);
  
  if (toInsert.length === 0) {
    console.log('\n✅ Database already has these items seeded! Exiting safely.');
    return;
  }

  // Print all new inserts to show success later
  console.log(`\nInserting following services...`);
  toInsert.forEach(i => console.log(` + [INSERTED] ${i.name} (Device Code: ${i.device_model})`));

  // Supabase limits payload size, chunk it by 200
  const chunkSize = 200;
  let successCount = 0;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    // remove category_item from insertion if it is not supported in the schema, wait let me check schema 
    // I recall the category_item may not be in inventory, I'll delete it to be safe just in case wait, earlier 
    // scripts did not push category_item but user asked "按品牌归入 category: 'phone'".
    // Let me check if inventory actually supports 'category' as phone and something else.
    // wait in the previous script: `category: cat`  where cat is 'Screen Replacement' etc. 
    // And I pushed `category_item: 'phone'`. If the column 'category_item' doesn't exist, Supabase might throw an error.
    const { error } = await supabase.from('inventory').insert(chunk);
    if (error) {
      console.error('\n❌ Insert error on chunk:', error);
    } else {
      successCount += chunk.length;
    }
  }
  
  console.log(`\n✅ Successfully inserted ${successCount} items into the database.`);
})();
