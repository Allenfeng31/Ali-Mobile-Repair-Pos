require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const brandsData = [
  {
    brand: "Huawei",
    models: [
      { name: "P30 Pro", code: "VOG-L29" },
      { name: "P40 Pro", code: "ELS-NX9" },
      { name: "Mate 20 Pro", code: "LYA-L29" },
      { name: "Mate 30 Pro", code: "LIO-L29" },
      { name: "Nova 5T", code: "YAL-L21" }
    ]
  },
  {
    brand: "Xiaomi",
    models: [
      { name: "Mi 11", code: "M2011K2G" },
      { name: "12 Pro", code: "2201122G" },
      { name: "13 Pro", code: "2210132G" },
      { name: "Redmi Note 10 Pro", code: "M2101K6G" },
      { name: "Redmi Note 11 Pro", code: "2201116TG" },
      { name: "POCO F3", code: "M2012K11AG" }
    ]
  },
  {
    brand: "HTC",
    models: [
      { name: "U11", code: "2PZC100" },
      { name: "U12+", code: "2Q55100" },
      { name: "One M8", code: "0P6B100" },
      { name: "One M9", code: "0PJA100" },
      { name: "Desire 21 Pro 5G", code: "2AQO100" }
    ]
  },
  {
    brand: "LG",
    models: [
      { name: "G6", code: "H870" },
      { name: "G7 ThinQ", code: "G710EM" },
      { name: "G8s ThinQ", code: "LMG810EA" },
      { name: "V30", code: "H930" },
      { name: "V40 ThinQ", code: "LMV405EBW" }
    ]
  },
  {
    brand: "Nokia",
    models: [
      { name: "5.4", code: "TA-1333" },
      { name: "7.2", code: "TA-1196" },
      { name: "8.3 5G", code: "TA-1243" },
      { name: "G20", code: "TA-1336" },
      { name: "X20", code: "TA-1341" }
    ]
  },
  {
    brand: "Sony",
    models: [
      { name: "Xperia 1", code: "J9110" },
      { name: "Xperia 1 II", code: "XQ-AT52" },
      { name: "Xperia 5", code: "J9210" },
      { name: "Xperia 5 II", code: "XQ-AS52" },
      { name: "Xperia 10 II", code: "XQ-AU52" }
    ]
  },
  {
    brand: "Telstra",
    models: [
      { name: "Essential Pro", code: "ZTE Blade A5 2020" },
      { name: "T-Smart", code: "T-Smart" },
      { name: "Evoke Pro 2", code: "Evoke Pro 2" },
      { name: "Essential Smart 2.1", code: "Essential Smart 2.1" },
      { name: "Tough Max 3", code: "ZTE T86" }
    ]
  },
  {
    brand: "Vivo",
    models: [
      { name: "X50 Pro", code: "V2006" },
      { name: "X60 Pro", code: "V2046" },
      { name: "X70 Pro", code: "V2105" },
      { name: "Y52 5G", code: "V2053" },
      { name: "Y76 5G", code: "V2124" }
    ]
  },
  {
    brand: "Motorola",
    models: [
      { name: "Moto G Power", code: "XT2041-3" },
      { name: "Moto G Stylus", code: "XT2043-4" },
      { name: "Edge 20", code: "XT2143-1" },
      { name: "Edge 30 Pro", code: "XT2201-1" },
      { name: "Moto G50", code: "XT2137-1" }
    ]
  },
  {
    brand: "Microsoft",
    models: [
      { name: "Surface Duo", code: "1930" },
      { name: "Surface Duo 2", code: "1995" },
      { name: "Lumia 950", code: "RM-1108" },
      { name: "Lumia 950 XL", code: "RM-1085" },
      { name: "Lumia 640", code: "RM-1072" }
    ]
  },
  {
    brand: "OnePlus",
    models: [
      { name: "8 Pro", code: "IN2023" },
      { name: "9", code: "LE2113" },
      { name: "9 Pro", code: "LE2123" },
      { name: "10 Pro", code: "NE2213" },
      { name: "11", code: "CPH2449" }
    ]
  },
  {
    brand: "Realme",
    models: [
      { name: "7 Pro", code: "RMX2170" },
      { name: "8 5G", code: "RMX3241" },
      { name: "GT Master Edition", code: "RMX3363" },
      { name: "X3 SuperZoom", code: "RMX2086" },
      { name: "C21Y", code: "RMX3261" }
    ]
  },
  {
    brand: "Asus",
    models: [
      { name: "ROG Phone 3", code: "ZS661KS" },
      { name: "ROG Phone 5", code: "ZS673KS" },
      { name: "ROG Phone 6", code: "AI2201" },
      { name: "Zenfone 8", code: "ZS590KS" },
      { name: "Zenfone 9", code: "AI2202" }
    ]
  },
  {
    brand: "TCL",
    models: [
      { name: "10 Pro", code: "T799H" },
      { name: "20 5G", code: "T781H" },
      { name: "20 Pro 5G", code: "T810H" },
      { name: "30 SE", code: "6165H" },
      { name: "30+", code: "T676K" }
    ]
  },
  {
    brand: "Nothing Phone",
    models: [
      { name: "Phone 3a Pro 5G", code: "A142P" },
      { name: "Phone 3a 5G", code: "A142" },
      { name: "CMF Phone 2 Pro 5G", code: "CMF2P" },
      { name: "Phone 1", code: "A063" },
      { name: "Phone 2", code: "A065" }
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
      items.push({
        // Concatenate Model + Service name for standard naming
        name: `${model.name} ${cat}`,
        // Strict format required by parsing engine
        model: `P ${brand}||${model.name}`,
        device_model: model.code,
        // Optional prefix generation logic (fallback)
        sku: `${brand.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        // Strict zero pricing/stock rules as requested
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
  console.log('Connecting to Supabase...');
  
  // Fetch existing items to avoid duplicates
  const { data: existing, error: fetchErr } = await supabase.from('inventory').select('name');
  if (fetchErr) {
    console.error('Failed to fetch existing items:', fetchErr);
    process.exit(1);
  }
  
  const existingNames = new Set(existing.map(i => i.name.toLowerCase().trim()));

  const toInsert = items.filter(i => !existingNames.has(i.name.toLowerCase().trim()));

  console.log(`Inserting ${toInsert.length} new items out of ${items.length} total generated...`);

  if (toInsert.length === 0) {
    console.log('Database already has these items seeded!');
    return;
  }

  // Supabase limits payload size, chunk it by 200
  const chunkSize = 200;
  let successCount = 0;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('inventory').insert(chunk);
    if (error) {
      console.error('Insert error on chunk:', error);
    } else {
      successCount += chunk.length;
    }
  }
  
  console.log(`Successfully inserted ${successCount} items.`);
})();
