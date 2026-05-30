import http from 'http';

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3005${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const results = {};

    // 1. Water damage
    let res = await fetchUrl('/repairs/phones/apple/iphone-15-pro-max/water-damage-repair');
    results.waterDamage = {
      status: res.status,
      hasUnder1Hour: res.body.includes('Under 1 Hour'),
      has6MonthWarranty: res.body.includes('6-Month Warranty'),
      hasTimeframeDepends: res.body.includes('Timeframe Depends on Damage'),
      hasDiagnosticRequired: res.body.includes('Diagnostic Required')
    };

    // 2. Battery
    res = await fetchUrl('/repairs/phones/apple/iphone-14-pro/battery-replacement');
    results.battery = {
      status: res.status,
      hasWaterDamageFAQ: res.body.toLowerCase().includes('water damage recovery'),
      hasBatteryWarrantyFAQ: res.body.includes('warranty for Iphone 14 Pro battery replacement') || res.body.includes('warranty for Iphone 14 Pro Battery Replacement')
    };

    // 3. Back glass
    let bgRes = await fetchUrl('/repairs/phones/samsung/galaxy-s23-ultra/back-glass-replacement');
    if (bgRes.status !== 200) {
      bgRes = await fetchUrl('/repairs/phones/samsung/galaxy-s23-ultra/back-housing-replacement');
    }
    results.backGlass = {
      status: bgRes.status,
      hasUnder1HourBadge: bgRes.body.includes('>Under 1 Hour<'),
      hasUnder1HourFAQ: bgRes.body.includes('completed in under 1 hour'),
      hasConservativeWording: bgRes.body.includes('Many back glass repairs need more time') || bgRes.body.includes('Timeframe Varies')
    };

    // 4. Flex cable
    res = await fetchUrl('/repairs/phones/apple/iphone-15-pro-max/flex-cable');
    results.flexCable = {
      status: res.status,
      robots: res.body.match(/<meta name="robots" content="([^"]+)"/)?.[1] || 'Not found',
      canonical: res.body.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || 'Not found'
    };

    // 5. Sitemap
    res = await fetchUrl('/sitemap.xml');
    results.sitemap = {
      status: res.status,
      hasFlexCable: res.body.includes('flex-cable'),
      hasBackHousing: res.body.includes('back-housing'),
      hasScreen: res.body.includes('screen-replacement')
    };

    console.log(JSON.stringify(results, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
