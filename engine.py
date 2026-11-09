import os
import time
import requests
import datetime
import feedparser
import re
from bs4 import BeautifulSoup
from zoneinfo import ZoneInfo
from supabase import create_client, Client

# --- 1. CONFIGURATION (Read from Render Environment Variables) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
UPSTOX_ACCESS_TOKEN = os.getenv("UPSTOX_ACCESS_TOKEN")

if not all([SUPABASE_URL, SUPABASE_KEY, UPSTOX_ACCESS_TOKEN]):
    print("❌ ERROR: Missing environment variables. Check Render settings.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. HARDCODED STOCKS ---
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
    print("🚀 Darkstar Engine Started on Cloud (Render).")
    while True:
        # FORCE INDIAN STANDARD TIME (IST)
        now = datetime.datetime.now(ZoneInfo("Asia/Kolkata"))
        current_time = now.time()
        current_day = now.weekday() # 0 is Monday, 5 is Saturday, 6 is Sunday

        # 1. Check for Weekend
        if current_day >= 5:
            print("💤 It's the weekend. Market is closed. Sleeping for 1 hour...")
            time.sleep(3600)
            continue

        # 2. Check for Market Hours (9:15 AM to 3:35 PM IST)
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
            
            current_index = calculate_index()
            print(f"📈 Live Index: {current_index} (Fetched {len(live_prices)} stocks)")
            
            # Push Index Value to Supabase
            supabase.table('live_ticks').insert({
                "index_name": "Darkstar Index",
                "index_value": current_index
            }).execute()

            # Push Individual Stock Prices to Supabase
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
            
        time.sleep(5) # Wait 5 seconds before next tick

# --- Helper function to get the real image from the article ---
def get_article_image(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for the social media preview image
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content']
            
        # If not found, look for the Twitter image
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        if twitter_image and twitter_image.get('content'):
            return twitter_image['content']
            
    except Exception as e:
        print(f"⚠️ Could not extract image for {url}: {e}")
        
    return "" # Return empty if no image found

# --- 5. FETCH MARKET NEWS ---
def fetch_market_news():
    print("📰 News Fetcher Started...")
    rss_url = "https://www.moneycontrol.com/rss/MCtopnews.xml"
    
    while True:
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(rss_url, headers=headers, timeout=15)
            feed = feedparser.parse(response.content)
            
            news_data = []
            for entry in feed.entries[:10]:
                description = entry.get('summary', 'No description available.')
                description = re.sub('<[^<]+?>', '', description).strip()
                
                # Fetch the real image from the article link
                print(f"🔍 Extracting image for: {entry.title[:30]}...")
                image_url = get_article_image(entry.link)
                
                news_data.append({
                    "title": entry.title,
                    "link": entry.link,
                    "source": "Moneycontrol",
                    "description": description,
                    "image_url": image_url
                })
            
            if len(news_data) > 0:
                print(f"📥 Attempting to insert {len(news_data)} articles into Supabase...")
                supabase.table('market_news').delete().neq('id', 0).execute()
                supabase.table('market_news').insert(news_data).execute()
                print(f"✅ Successfully saved {len(news_data)} news articles with unique images.")
                
        except Exception as e:
            print(f"❌ NEWS FETCHER ERROR: {e}")
            
        time.sleep(900)