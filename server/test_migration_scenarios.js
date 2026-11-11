const fs = require('fs');
const path = require('path');
const { setupDb, SEED_DATA } = require('./test_db_harness');

const MIGRATION_SQL = fs.readFileSync(path.join(__dirname, 'migration_macbook_pro_split_models.sql'), 'utf-8');

async function runTests() {
  console.log('================================================================');
  console.log('   POSTGRESQL MIGRATION TEST SUITE (Authentic PGlite Engine)    ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed++;
      throw new Error(message);
    } else {
      console.log(`✅ PASS: ${message}`);
      passed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: First Execution on Valid Pre-migration State
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 1: First Execution on Valid Pre-Migration State ---');
  {
    const db = await setupDb();

    // Check initial count
    const preCount = await db.query('SELECT COUNT(*) FROM public.inventory WHERE id BETWEEN 4223 AND 4242;');
    assert(Number(preCount.rows[0].count) === 20, 'Initial count of IDs 4223-4242 is 20');

    // Execute migration
    await db.exec(MIGRATION_SQL);

    // Assertions post-migration
    const postTotal = await db.query(`
      SELECT COUNT(*) as cnt, COUNT(DISTINCT model) as models
      FROM public.inventory
      WHERE model ILIKE 'C MacBook||MacBook Pro%' AND (model ILIKE '%M4%' OR model ILIKE '%M5%');
    `);
    assert(Number(postTotal.rows[0].cnt) === 50, 'Total records after migration is exactly 50');
    assert(Number(postTotal.rows[0].models) === 10, 'Total distinct models is exactly 10');

    // Check each of the 10 models has exactly 5 distinct services and verified A-numbers
    const modelsCheck = await db.query(`
      SELECT model, device_model, COUNT(*) as cnt, COUNT(DISTINCT category) as cats,
             SUM(price) as sum_price, SUM("costPrice") as sum_cost, SUM(stock) as sum_stock
      FROM public.inventory
      WHERE model ILIKE 'C MacBook||MacBook Pro%' AND (model ILIKE '%M4%' OR model ILIKE '%M5%')
      GROUP BY model, device_model
      ORDER BY model;
    `);
    assert(modelsCheck.rows.length === 10, 'Exactly 10 models grouped by model and device_model');
    for (const row of modelsCheck.rows) {
      assert(Number(row.cnt) === 5, `${row.model} has 5 records`);
      assert(Number(row.cats) === 5, `${row.model} has 5 distinct categories`);
      assert(Number(row.sum_price) === 0, `${row.model} total price is 0`);
      assert(Number(row.sum_cost) === 0, `${row.model} total costPrice is 0`);
      assert(Number(row.sum_stock) === 0, `${row.model} total stock is 0`);
    }

    // Check older priced models untouched
    const olderCheck = await db.query(`SELECT id, price FROM public.inventory WHERE id IN (1263, 1264, 3902);`);
    assert(olderCheck.rows.find(r => r.id === 1263).price === '780', 'ID 1263 preserved at $780');
    assert(olderCheck.rows.find(r => r.id === 1264).price === '240', 'ID 1264 preserved at $240');
    assert(olderCheck.rows.find(r => r.id === 3902).price === '750', 'ID 3902 preserved at $750');

    // --------------------------------------------------------------------------
    // TEST 2: Second Execution (True Idempotency)
    // --------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Second Execution (True Idempotency) ---');
    const rowsBeforeSecond = await db.query('SELECT COUNT(*) FROM public.inventory;');

    // Re-run migration SQL on already migrated DB
    await db.exec(MIGRATION_SQL);

    const rowsAfterSecond = await db.query('SELECT COUNT(*) FROM public.inventory;');
    assert(rowsBeforeSecond.rows[0].count === rowsAfterSecond.rows[0].count, 'Zero rows inserted on second execution');

    const postSecondTotal = await db.query(`
      SELECT COUNT(*) as cnt, COUNT(DISTINCT model) as models
      FROM public.inventory
      WHERE model ILIKE 'C MacBook||MacBook Pro%' AND (model ILIKE '%M4%' OR model ILIKE '%M5%');
    `);
    assert(Number(postSecondTotal.rows[0].cnt) === 50, 'Total records remains exactly 50 on second execution');
    assert(Number(postSecondTotal.rows[0].models) === 10, 'Total models remains exactly 10 on second execution');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Missing Source Record (19 rows instead of 20)
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 3: Missing Source Record (19 rows) ---');
  {
    const missingData = SEED_DATA.filter(r => r.id !== 4230); // delete charging port of M4 Pro/Max
    const db = await setupDb(missingData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted on missing source record');
    assert(/Precondition failed.*20.*found 19/i.test(errorCaught.message), `Error message correctly reports missing record: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Incorrect Source Model
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 4: Incorrect Source Model ---');
  {
    const corruptData = SEED_DATA.map(r => r.id === 4228 ? { ...r, model: 'C MacBook||Corrupted Model Name' } : r);
    const db = await setupDb(corruptData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted on unexpected source model name');
    assert(/Precondition failed.*do not match/i.test(errorCaught.message), `Error message correctly identifies mismatched model: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Partial Target Model (e.g. 2 rows for 14" M4 Max)
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 5: Partial Target Model (2 rows instead of 5) ---');
  {
    const partialData = [
      ...SEED_DATA,
      { id: 4901, name: 'MacBook Pro 14" M4 Max (2024) Screen Replacement', model: 'C MacBook||MacBook Pro 14" M4 Max (2024)', sku: null, stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Smartphone', status: 'In Stock', category: 'Screen Replacement', device_model: 'A3185' },
      { id: 4902, name: 'MacBook Pro 14" M4 Max (2024) Battery Replacement', model: 'C MacBook||MacBook Pro 14" M4 Max (2024)', sku: null, stock: 0, minStock: 0, costPrice: 0, price: 0, margin: 0, iconName: 'Battery', status: 'In Stock', category: 'Battery Replacement', device_model: 'A3185' },
    ];
    const db = await setupDb(partialData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted on partial target model');
    assert(/Safety check failed.*partially populated target model/i.test(errorCaught.message), `Error message correctly reports partial model: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Unexpected Positive Source Price
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 6: Unexpected Positive Source Price ($150 on ID 4229) ---');
  {
    const positivePriceData = SEED_DATA.map(r => r.id === 4229 ? { ...r, price: 150 } : r);
    const db = await setupDb(positivePriceData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted on unexpected positive source price');
    assert(/Precondition failed.*unexpected non-zero price/i.test(errorCaught.message), `Error message correctly reports price risk: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Duplicate Service Category in Source
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 7: Duplicate Service Category in Source ---');
  {
    const duplicateServiceData = SEED_DATA.map(r => r.id === 4230 ? {
      ...r,
      category: 'Screen Replacement',
      name: 'MacBook Pro 14"/16" M4 Pro/Max (2024) Screen Replacement'
    } : r);
    const db = await setupDb(duplicateServiceData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted on duplicate source service category');
    assert(/Precondition failed.*duplicate service categories/i.test(errorCaught.message), `Error message reports duplicate category: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Failed Transaction Rollback Verification
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 8: Failed Transaction Rollback ---');
  {
    const corruptData = SEED_DATA.map(r => r.id === 4238 ? { ...r, model: 'Wrong M5 Name' } : r);
    const db = await setupDb(corruptData);

    const snapshotBefore = await db.query('SELECT id, name, model, device_model, price FROM public.inventory ORDER BY id;');

    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      // Expected to fail, rollback the aborted transaction
      await db.exec('ROLLBACK;');
    }

    const snapshotAfter = await db.query('SELECT id, name, model, device_model, price FROM public.inventory ORDER BY id;');

    assert(snapshotBefore.rows.length === snapshotAfter.rows.length, 'Row count unchanged after rollback');
    assert(JSON.stringify(snapshotBefore.rows) === JSON.stringify(snapshotAfter.rows), 'Database state identical to pre-migration snapshot after rollback');
  }

  // --------------------------------------------------------------------------
  // TEST 9: Exact Authorized Repair Services Validation (Unauthorized Category)
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 9: Unauthorized Category in Source (5 categories, but 1 is unauthorized) ---');
  {
    const corruptCatData = SEED_DATA.map(r => r.id === 4224 ? { ...r, category: 'Front Camera Replacement', name: 'MacBook Pro 14" M4 (2024) Front Camera Replacement' } : r);
    const db = await setupDb(corruptCatData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted on unauthorised category');
    assert(/unauthorised service categories/i.test(errorCaught.message), `Error message detects unauthorised category: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Service Item Name & Model Identity Mismatch
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 10: Service Item Name & Model Identity Mismatch ---');
  {
    const mismatchedNameData = SEED_DATA.map(r => r.id === 4223 ? { ...r, name: 'iPhone 15 Pro Screen Replacement' } : r);
    const db = await setupDb(mismatchedNameData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted on service item name mismatch');
    assert(/mismatched service item names/i.test(errorCaught.message), `Error message detects name mismatch: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Missing Legacy Record (ID 1263 completely missing)
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 11: Missing Legacy Record ID 1263 ---');
  {
    const missingLegacyData = SEED_DATA.filter(r => r.id !== 1263);
    const db = await setupDb(missingLegacyData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted when legacy ID 1263 is missing');
    assert(/Legacy MacBook Pro records.*missing/i.test(errorCaught.message), `Error message reports missing legacy record: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 12: Missing Legacy Record (ID 3902 completely missing)
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 12: Missing Legacy Record ID 3902 ---');
  {
    const missingLegacyData = SEED_DATA.filter(r => r.id !== 3902);
    const db = await setupDb(missingLegacyData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted when legacy ID 3902 is missing');
    assert(/Legacy MacBook Pro records.*missing/i.test(errorCaught.message), `Error message reports missing legacy record: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 13: Legacy Price Drift on ID 1264 ($240 -> $299)
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 13: Legacy Price Drift on ID 1264 ($240 -> $299) ---');
  {
    const driftedPriceData = SEED_DATA.map(r => r.id === 1264 ? { ...r, price: 299 } : r);
    const db = await setupDb(driftedPriceData);
    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Migration aborted when legacy ID 1264 price drifted');
    assert(/Legacy MacBook Pro records.*drifted/i.test(errorCaught.message), `Error message reports drifted legacy price: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 14: Early-Return Check Fails on Non-Zero Price in Migrated DB
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 14: Early-Return Check Fails on Non-Zero Price ---');
  {
    const db = await setupDb();
    await db.exec(MIGRATION_SQL); // Valid first migration

    // Corrupt one record with a positive price
    await db.query(`UPDATE public.inventory SET price = 99 WHERE model = 'C MacBook||MacBook Pro 14" M4 Pro (2024)' AND category = 'Battery Replacement';`);

    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Early-return check aborted on positive price');
    assert(/Idempotency check failed.*non-zero price/i.test(errorCaught.message), `Error message reports non-zero price: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 15: Early-Return Check Fails on Corrupted Item Name in Migrated DB
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 15: Early-Return Check Fails on Corrupted Item Name ---');
  {
    const db = await setupDb();
    await db.exec(MIGRATION_SQL); // Valid first migration

    // Corrupt one record with a custom name
    await db.query(`UPDATE public.inventory SET name = 'MacBook Pro 14" M4 Pro Screen Fix' WHERE model = 'C MacBook||MacBook Pro 14" M4 Pro (2024)' AND category = 'Screen Replacement';`);

    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Early-return check aborted on corrupted item name');
    assert(/Idempotency check failed.*service item names/i.test(errorCaught.message), `Error message reports name mismatch: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 16: Early-Return Check Fails on Missing Legacy Record in Migrated DB
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 16: Early-Return Check Fails on Missing Legacy Record ---');
  {
    const db = await setupDb();
    await db.exec(MIGRATION_SQL); // Valid first migration

    // Delete legacy record ID 1263
    await db.query(`DELETE FROM public.inventory WHERE id = 1263;`);

    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Early-return check aborted on missing legacy record');
    assert(/Idempotency check failed.*Legacy MacBook Pro records.*missing/i.test(errorCaught.message), `Error message reports missing legacy record: "${errorCaught.message}"`);
  }

  // --------------------------------------------------------------------------
  // TEST 17: Early-Return Check Fails on Duplicate / Missing Services in Migrated DB
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 17: Early-Return Check Fails on Duplicate / Missing Category ---');
  {
    const db = await setupDb();
    await db.exec(MIGRATION_SQL); // Valid first migration

    // Change battery replacement to screen replacement (creating 2 screens, 0 batteries)
    await db.query(`UPDATE public.inventory SET category = 'Screen Replacement' WHERE model = 'C MacBook||MacBook Pro 14" M4 Pro (2024)' AND category = 'Battery Replacement';`);

    let errorCaught = null;
    try {
      await db.exec(MIGRATION_SQL);
    } catch (err) {
      errorCaught = err;
    }
    assert(Boolean(errorCaught), 'Early-return check aborted on duplicate/missing service');
    assert(/Idempotency check failed.*missing required services or contains duplicates/i.test(errorCaught.message), `Error message reports service category issue: "${errorCaught.message}"`);
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
