// Mock data source for the Northman Bank Index.
// Used by the Next.js API route at /api/index-data?index=bank

export const BANK_STOCKS = [
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1742.35, change: 1.42, weightage: 18.92 },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1268.9, change: 0.96, weightage: 15.4 },
  { ticker: 'SBIN', name: 'State Bank of India', price: 812.45, change: 2.18, weightage: 10.85 },
  { ticker: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1156.7, change: -0.54, weightage: 8.62 },
  { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', price: 1934.15, change: 0.37, weightage: 7.9 },
  { ticker: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', price: 1012.8, change: -1.26, weightage: 4.6 },
  { ticker: 'BANKBARODA', name: 'Bank of Baroda', price: 248.6, change: 1.85, weightage: 4.35 },
  { ticker: 'PNB', name: 'Punjab National Bank', price: 104.25, change: 2.64, weightage: 3.9 },
  { ticker: 'CANBK', name: 'Canara Bank', price: 101.4, change: 1.12, weightage: 3.75 },
  { ticker: 'UNIONBANK', name: 'Union Bank of India', price: 118.35, change: 0.88, weightage: 2.95 },
  { ticker: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd.', price: 68.9, change: -0.72, weightage: 2.8 },
  { ticker: 'FEDERALBNK', name: 'The Federal Bank Ltd.', price: 198.55, change: 0.64, weightage: 2.75 },
  { ticker: 'AUBANK', name: 'AU Small Finance Bank Ltd.', price: 612.3, change: -1.48, weightage: 2.6 },
  { ticker: 'BANDHANBNK', name: 'Bandhan Bank Ltd.', price: 172.4, change: -0.95, weightage: 2.45 },
  { ticker: 'INDIANB', name: 'Indian Bank', price: 556.75, change: 1.53, weightage: 2.4 },
  { ticker: 'YESBANK', name: 'Yes Bank Ltd.', price: 21.35, change: 0.47, weightage: 2.3 },
  { ticker: 'IOB', name: 'Indian Overseas Bank', price: 49.8, change: -0.36, weightage: 1.85 },
  { ticker: 'RBLBANK', name: 'RBL Bank Ltd.', price: 214.6, change: 0.29, weightage: 1.61 },
];

// Deterministic pseudo-random so the series is stable between requests
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const OPEN = 12080.0;
const HIGH = 12150.2;
const LOW = 12050.1;
const CLOSE = 12106.9;

// Intraday series from 09:15 to 15:30 (1-minute points)
function buildIntraday() {
  const rand = seeded(42);
  const start = new Date();
  start.setHours(9, 15, 0, 0);
  const points = 376;
  const out = [];
  let v = OPEN;
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    // A smooth path: dip to the low early, rally to the high mid-session, settle at close
    const target =
      t < 0.18
        ? OPEN + (LOW - OPEN) * Math.sin((t / 0.18) * (Math.PI / 2))
        : t < 0.62
        ? LOW + (HIGH - LOW) * Math.sin(((t - 0.18) / 0.44) * (Math.PI / 2))
        : HIGH + (CLOSE - HIGH) * ((t - 0.62) / 0.38);
    v = v + (target - v) * 0.35 + (rand() - 0.5) * 6;
    v = Math.min(HIGH, Math.max(LOW, v));
    if (i === 0) v = OPEN;
    if (i === points - 1) v = CLOSE;
    out.push({
      created_at: new Date(start.getTime() + i * 60000).toISOString(),
      index_value: Math.round(v * 100) / 100,
    });
  }
  return out;
}

// Longer-range series ending at the current close
function buildRange(days, stepDays, startValue) {
  const rand = seeded(days * 7 + 3);
  const now = new Date();
  now.setHours(15, 30, 0, 0);
  const n = Math.max(2, Math.floor(days / stepDays));
  const out = [];
  let v = startValue;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const trend = startValue + (CLOSE - startValue) * t;
    v = trend + (rand() - 0.5) * (CLOSE - startValue + 200) * 0.08;
    if (i === n - 1) v = CLOSE;
    out.push({
      created_at: new Date(now.getTime() - (n - 1 - i) * stepDays * 86400000).toISOString(),
      index_value: Math.round(v * 100) / 100,
    });
  }
  return out;
}

export function getIndexData(index = 'bank', range = '1D') {
  if (index !== 'bank') return null;
  let chartData;
  switch (range) {
    case '1W': chartData = buildRange(7, 0.25, 11920); break;
    case '1M': chartData = buildRange(30, 1, 11640); break;
    case '3M': chartData = buildRange(90, 1, 11280); break;
    case '1Y': chartData = buildRange(365, 3, 10420); break;
    case 'ALL': chartData = buildRange(560, 4, 10000); break;
    default: chartData = buildIntraday();
  }
  return {
    index: 'bank',
    name: 'Northman Bank Index',
    status: 'CLOSED',
    value: CLOSE,
    changePercent: 21.06,
    changePoints: 2106.9,
    high: HIGH,
    low: LOW,
    open: OPEN,
    constituents: BANK_STOCKS.length,
    chartData,
    stocks: BANK_STOCKS.map((s, i) => ({ rank: i + 1, ...s })),
  };
}
