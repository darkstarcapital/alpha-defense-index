import time
import requests
import datetime
from supabase import create_client, Client

# --- 1. CONFIGURATION (For Local Running) ---
# 🚨 PASTE YOUR ACTUAL KEYS HERE (Keep the quotation marks!)
SUPABASE_URL = "https://xkqyadgssduttoatjegy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcXlhZGdzc2R1dHRvYXRqZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NjU5NzYsImV4cCI6MjEwOTM0MTk3Nn0.ho6TkQtBNFmTBFZ_B2m2mClt-2chlo3C71r-NL07DTs"
UPSTOX_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI4SkIyNFUiLCJqdGkiOiI2YWViMjJlMjE2OWZmYjQxM2RmNTI3ZjMiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaXNFeHRlbmRlZCI6dHJ1ZSwiaWF0IjoxNzkzNzk0Nzg2LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE4MjUzNjU2MDB9.-jD11w2q8FI4TtMF8GtjvNAn9PHHT-zyQqQnXrt9woQ"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. HARDCODED STOCKS (Using correct ISIN codes) ---
STOCKS = {
    "CYIENTDLM": {"key": "NSE_EQ|INE055S01018", "weight": 0.0088, "base": 691.05},
    "DCXINDIA": {"key": "NSE_EQ|INE0KL801015", "weight": 0.0038, "base": 308.85},
    "PTCIL": {"key": "NSE_EQ|INE596F01018", "weight": 0.0168, "base": 12950.00},
    "IDEAFORGE": {"key": "NSE_EQ|INE349Y01013", "weight": 0.0066, "base": 649.35},
    "APOLLO": {"key": "NSE_EQ|INE713T01028", "weight": 0.0050, "base": 98.88},
    "ASTRAMICRO": {"key": "NSE_EQ|INE386C01029", "weight": 0.0257, "base": 802.8},
    "AXISCADES": {"key": "NSE_EQ|INE555B01013", "weight": 0.0028, "base": 520.3},
    "BDL": {"key": "NSE_EQ|INE171Z01026", "weight": 0.0363, "base": 1129.85},
    "BEL": {"key": "NSE_EQ|INE263A01024", "weight": 0.14, "base": 287.15},
    "COCHINSHIP": {"key": "NSE_EQ|INE704P01025", "weight": 0.0333, "base": 1564.05},
    "DATAPATTNS": {"key": "NSE_EQ|INE0IX101010", "weight": 0.0270, "base": 2450.75},
    "DYNAMATECH": {"key": "NSE_EQ|INE221B01012", "weight": 0.0110, "base": 7712.6},
    "GRSE": {"key": "NSE_EQ|INE382Z01011", "weight": 0.0158, "base": 1764.65},
    "HAL": {"key": "NSE_EQ|INE066F01020", "weight": 0.14, "base": 4524.7}, 
    "MAZDOCK": {"key": "NSE_EQ|INE249Z01020", "weight": 0.0432, "base": 2263.18},
    "MIDHANI": {"key": "NSE_EQ|INE099B01016", "weight": 0.0051, "base": 369.7},
    "PARAS": {"key": "NSE_EQ|INE045601023", "weight": 0.0041, "base": 525.03},
    "SOLARINDS": {"key": "NSE_EQ|INE343H01029", "weight": 0.0853, "base": 11421.8},
    "UNIMECH": {"key": "NSE_EQ|INE0U3I01011", "weight": 0.0062, "base": 1445.15},
    "ZENTEC": {"key": "NSE_EQ|INE251B01027", "weight": 0.0218, "base": 1910.45},
    "NIBE": {"key": "NSE_EQ|INE149O01018", "weight": 0.0044, "base": 1592.9},
    "PREMEXPLN": {"key": "NSE_EQ|INE863B01029", "weight": 0.0044, "base": 509.7},
    "CENTUM": {"key": "NSE_EQ|INE320B01020", "weight": 0.0028, "base": 1863.75},
    "ADANIENT": {"key": "NSE_EQ|INE423A01024", "weight": 0.0431, "base": 2910.39},
    "KUSUMGAR": {"key": "NSE_EQ|INE01SX01025", "weight": 0.0006, "base": 602.8},
    "LT": {"key": "NSE_EQ|INE018A01030", "weight": 0.14, "base": 3577.8},
    "ASHOKLEY": {"key": "NSE_EQ|INE208A01029", "weight": 0.0174, "base": 111.64},
    "HBLENGINE": {"key": "NSE_EQ|INE292B01021", "weight": 0.0028, "base": 631.7}, 
    "BHARATFORG": {"key": "NSE_EQ|INE465A01025", "weight": 0.0126, "base": 1474.75},
    "INDO-MIM": {"key": "NSE_EQ|INE0K7S01014", "weight": 0.0065, "base": 741.75},
    "AEQUS": {"key": "NSE_EQ|INE947N01017", "weight": 0.0029, "base": 139.37},
    "BEML": {"key": "NSE_EQ|INE258A01024", "weight": 0.0028, "base": 2019.53},
    "MTARTECH": {"key": "NSE_EQ|INE864I01014", "weight": 0.0013, "base": 1681.4},
    "ARVIND": {"key": "NSE_EQ|INE034A01011", "weight": 0.0035, "base": 360.25},
    "M&M": {"key": "NSE_EQ|INE101A01026", "weight": 0.1116, "base": 2964.25},
    "LMW": {"key": "NSE_EQ|INE269B01029", "weight": 0.0049, "base": 16384.2}
}

live_prices = {}

# --- 3. CALCULATE INDEX ---
def calculate_index():
    total_value = 0
    for ticker, data in STOCKS.items():
        if ticker in live_prices:
            current_price = live_prices[ticker]
            total_value += (current_price / data['base']) * data['weight']
        else:
            total_value += 1 * data['weight']
    return round(total_value * 10000, 2)

# --- 4. POLL LIVE PRICES ---
def poll_live_prices():
    print("🚀 Darkstar Engine Started (Local Mode).")
    while True:
        now = datetime.datetime.now()
        current_time = now.time()
        current_day = now.weekday() # 0 is Monday, 5 is Saturday, 6 is Sunday

        # 1. Check for Weekend
        if current_day >= 5:
            print("💤 It's the weekend. Market is closed. Sleeping for 1 hour...")
            time.sleep(3600)
            continue

        # 2. Check for Market Hours (9:15 AM to 3:35 PM)
        if current_time < datetime.time(9, 15) or current_time > datetime.time(15, 35):
            print("💤 Outside market hours. Sleeping for 5 minutes...")
            time.sleep(300) 
            continue

        # 3. Market is OPEN - Fetch Data
        live_prices.clear() 
        try:
            all_keys = [data['key'] for data in STOCKS.values()]
            keys_string = ",".join(all_keys)
            url = "https://api.upstox.com/v2/market-quote/ltp"
            
            headers = {
                "Accept": "application/json",
                "Authorization": f"Bearer {UPSTOX_ACCESS_TOKEN}"
            }
            params = {"instrument_key": keys_string}
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json().get('data', {})
                for key, details in data.items():
                    clean_ticker = key.replace(':', '|').split('|')[-1]
                    live_prices[clean_ticker] = details['last_price']
            else:
                print(f"⚠️ API Error: {response.status_code} - {response.text}")
            
            missing_tickers = []
            for ticker, data in STOCKS.items():
                if ticker not in live_prices:
                    missing_tickers.append(ticker)
            
            if missing_tickers:
                print(f"⚠️ Missing Tickers ({len(missing_tickers)}): {missing_tickers}")
            
            current_index = calculate_index()
            print(f"📈 Live Index: {current_index} (Fetched {len(live_prices)} stocks)")
            
            # 1. Push Index Value to Supabase
            supabase.table('live_ticks').insert({
                "index_name": "Darkstar Index",
                "index_value": current_index
            }).execute()

            # 2. Push Individual Stock Prices to Supabase
            stock_data_to_insert = []
            for ticker, price in live_prices.items():
                stock_data_to_insert.append({
                    "ticker": ticker,
                    "price": price
                })
            
            if stock_data_to_insert:
                supabase.table('stock_prices').insert(stock_data_to_insert).execute()
            
        except Exception as e:
            print(f"❌ Engine Error: {e}")
            
        # Wait 1 second before the next tick
        time.sleep(1)
