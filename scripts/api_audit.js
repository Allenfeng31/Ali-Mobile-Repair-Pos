import { performance } from 'perf_hooks';
import https from 'https';

const API_URL = 'https://ali-mobile-repair-pos-tqdh.vercel.app/api';

async function measureRequest(url) {
  return new Promise((resolve, reject) => {
    const timings = {
      start: performance.now(),
      dnsLookup: 0,
      tcpConnect: 0,
      tlsHandshake: 0,
      ttfb: 0,
      total: 0
    };

    const req = https.get(url, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        timings.total = performance.now() - timings.start;
        resolve(timings);
      });
    });

    req.on('socket', (socket) => {
      socket.on('lookup', () => {
        timings.dnsLookup = performance.now() - timings.start;
      });
      socket.on('connect', () => {
        timings.tcpConnect = performance.now() - timings.start;
      });
      socket.on('secureConnect', () => {
        timings.tlsHandshake = performance.now() - timings.start;
      });
    });

    req.on('response', (res) => {
      timings.ttfb = performance.now() - timings.start;
      timings.vercelId = res.headers['x-vercel-id'];
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function runAudit() {
  console.log(`--- API Bottleneck Analysis ---`);
  console.log(`URL: ${API_URL}`);

  try {
    const results = [];
    for (let i = 0; i < 3; i++) {
        console.log(`\nRun ${i+1}...`);
        const t = await measureRequest(API_URL);
        results.push(t);
        console.log(`  DNS Lookup:    ${t.dnsLookup.toFixed(2)}ms`);
        console.log(`  TCP Connect:   ${t.tcpConnect.toFixed(2)}ms`);
        console.log(`  TLS Handshake: ${t.tlsHandshake.toFixed(2)}ms`);
        console.log(`  TTFB:          ${t.ttfb.toFixed(2)}ms`);
        console.log(`  Vercel ID:     ${t.vercelId}`);
        console.log(`  Total:         ${t.total.toFixed(2)}ms`);
    }

    const avg = {
        dns: results.reduce((s, x) => s + x.dnsLookup, 0) / results.length,
        tcp: results.reduce((s, x) => s + x.tcpConnect, 0) / results.length,
        tls: results.reduce((s, x) => s + x.tlsHandshake, 0) / results.length,
        ttfb: results.reduce((s, x) => s + x.ttfb, 0) / results.length,
        total: results.reduce((s, x) => s + x.total, 0) / results.length,
    };

    console.log(`\n--- Average Breakdown ---`);
    console.log(`DNS Lookup:    ${avg.dns.toFixed(2)}ms`);
    console.log(`TCP Connect:   ${avg.tcp.toFixed(2)}ms`);
    console.log(`TLS Handshake: ${avg.tls.toFixed(2)}ms`);
    console.log(`TTFB (Wait):   ${avg.ttfb.toFixed(2)}ms`);
    console.log(`Total Time:    ${avg.total.toFixed(2)}ms`);

  } catch (error) {
    console.error('Audit failed:', error.message);
  }
}

runAudit();
