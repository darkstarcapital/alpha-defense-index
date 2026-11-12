import os
import sys
import time
import requests
import datetime
import feedparser
import re
import json
from bs4 import BeautifulSoup
from zoneinfo import ZoneInfo
from supabase import create_client, Client

# --- FORCE LOGS TO SHOW INSTANTLY ON RENDER ---
sys.stdout.reconfigure(line_buffering=True)

# --- 1. CONFIGURATION (Read from Render Environment Variables) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
UPSTOX_ACCESS_TOKEN = os.getenv("UPSTOX_ACCESS_TOKEN")

if not all([SUPABASE_URL, SUPABASE_KEY, UPSTOX_ACCESS_TOKEN]):
    print("❌ ERROR: Missing environment variables. Check Render settings.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. NORTHMAN DEFENSE INDEX STOCKS ---
DEFENSE_STOCKS = {
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

# --- 3. NORTHMAN BANK INDEX STOCKS ---
BANK_STOCKS = {
    "AUBANK": {"key": "NSE_EQ|INE949L01017", "weight": 0.0204, "base": 787.4},
    "AXISBANK": {"key": "NSE_EQ|INE238A01034", "weight": 0.1384, "base": 1102.3},
    "BANKBARODA": {"key": "NSE_EQ|INE028A01039", "weight": 0.0183, "base": 231.1},
    "CANBK": {"key": "NSE_EQ|INE476A01022", "weight": 0.0161, "base": 87.5},
    "CUB": {"key": "NSE_EQ|INE491A01021", "weight": 0.0081, "base": 111.75},
    "FEDERALBNK": {"key": "NSE_EQ|INE171A01029", "weight": 0.0320, "base": 156.15},
    "HDFCBANK": {"key": "NSE_EQ|INE040A01034", "weight": 0.1800, "base": 854.63},
    "ICICIBANK": {"key": "NSE_EQ|INE090A01021", "weight": 0.1800, "base": 996.6},
    "IDFCFIRSTB": {"key": "NSE_EQ|INE092T01019", "weight": 0.0192, "base": 88.9},
    "INDIANB": {"key": "NSE_EQ|INE562A01011", "weight": 0.0120, "base": 420.9},
    "INDUSINDBK": {"key": "NSE_EQ|INE095A01012", "weight": 0.0218, "base": 1598.95},
    "KARURVYSYA": {"key": "NSE_EQ|INE036D01028", "weight": 0.0129, "base": 140.75},
    "KOTAKBANK": {"key": "NSE_EQ|INE237A01036", "weight": 0.1289, "base": 381.62},
    "PNB": {"key": "NSE_EQ|INE160A01022", "weight": 0.0176, "base": 95.75},
    "RBLBANK": {"key": "NSE_EQ|INE976G01028", "weight": 0.0086, "base": 279.3},
    "SBIN": {"key": "NSE_EQ|INE062A01020", "weight": 0.1607, "base": 642.05},
    "UNIONBANK": {"key": "NSE_EQ|INE692A01016", "weight": 0.0140, "base": 119.1},
    "YESBANK": {"key": "NSE_EQ|INE528G01035", "weight": 0.0110, "base": 21.45}
}

live_prices = {}

# --- 4. CALCULATE INDEX ---
def calculate_index(stock_dict, live_price_data):
    total_value = 0
    for ticker, data in stock_dict.items():
        if ticker in live_price_data:
            current_price = live_price_data[ticker]
            total_value += (current_price / data['base']) * data['weight']
        else:
            total_value += 1 * data['weight']
    return round(total_value * 10000, 2)

# --- 5. POLL LIVE PRICES ---
def poll_live_prices():
    print("🚀 Northman Engine Started on Cloud (Render).")
    while True:
        try:
            # We moved this INSIDE the try block so if the timezone fails, it logs it!
            now = datetime.datetime.now(ZoneInfo("Asia/Kolkata"))
            current_time = now.time()
            current_day = now.weekday()

            if current_day >= 5:
                print("💤 It's the weekend. Market is closed. Sleeping for 1 hour...")
                time.sleep(3600)
                continue

            if current_time < datetime.time(9, 15) or current_time > datetime.time(15, 35):
                print("💤 Outside market hours. Sleeping for 5 minutes...")
                time.sleep(300) 
                continue

            live_prices.clear() 
            
            defense_keys = [data['key'] for data in DEFENSE_STOCKS.values()]
            bank_keys = [data['key'] for data in BANK_STOCKS.values()]
            all_keys = defense_keys + bank_keys
            
            keys_string = ",".join(all_keys)
            url = "https://api.upstox.com/v2/market-quote/ltp"
            
            headers = {
                "Accept": "application/json",
                "Authorization": f"Bearer {UPSTOX_ACCESS_TOKEN}"
            }
            params = {"instrument_key": keys_string}
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json().get('data', {})
                for key, details in data.items():
                    clean_ticker = key.replace(':', '|').split('|')[-1]
                    live_prices[clean_ticker] = details['last_price']
            else:
                print(f"⚠️ API Error: {response.status_code} - {response.text}")
            
            defense_index = calculate_index(DEFENSE_STOCKS, live_prices)
            bank_index = calculate_index(BANK_STOCKS, live_prices)
            
            print(f"📈 Northman Defense Index: {defense_index}")
            print(f"🏦 Northman Bank Index: {bank_index}")
            
            supabase.table('live_ticks').insert([
                {"index_name": "Northman Defense Index", "index_value": defense_index},
                {"index_name": "Northman Bank Index", "index_value": bank_index}
            ]).execute()

            stock_data_to_insert = []
            for ticker, price in live_prices.items():
                stock_data_to_insert.append({"ticker": ticker, "price": price})
            
            if stock_data_to_insert:
                supabase.table('stock_prices').insert(stock_data_to_insert).execute()
            
        except Exception as e:
            print(f"❌ Engine Loop Error: {e}")
            time.sleep(10) # Wait 10 seconds before trying again if it crashes
            
        time.sleep(5) 

# --- Helper function to get HD images ---
def get_article_image(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'image' in data:
                    img = data['image']
                    if isinstance(img, str): return img
                    if isinstance(img, dict) and 'url' in img: return img['url']
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and 'image' in item:
                            img = item['image']
                            if isinstance(img, str): return img
                            if isinstance(img, dict) and 'url' in img: return img['url']
            except: pass
                
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content'] 
    except Exception as e:
        pass
    return ""

# --- 6. FETCH MARKET NEWS (Multi-Source, Every 12 Hours) ---
def fetch_market_news():
    print("📰 News Fetcher Started...")
    
    feeds = [
        ("Moneycontrol", "https://www.moneycontrol.com/rss/MCtopnews.xml"),
        ("Economic Times", "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"),
        ("LiveMint", "https://www.livemint.com/rss/markets"),
        ("Business Standard", "https://www.business-standard.com/rss/latest.rss")
    ]
    
    while True:
        try:
            all_news = []
            seen_titles = set()
            
            for source_name, rss_url in feeds:
                try:
                    print(f"🌐 Fetching news from {source_name}...")
                    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                    response = requests.get(rss_url, headers=headers, timeout=15)
                    feed = feedparser.parse(response.content)
                    
                    for entry in feed.entries[:10]:
                        if entry.title in seen_titles:
                            continue
                        seen_titles.add(entry.title)
                        
                        description = entry.get('summary', 'No description available.')
                        description = re.sub('<[^<]+?>', '', description).strip()
                        
                        print(f"🔍 Extracting image for: {entry.title[:30]}...")
                        image_url = get_article_image(entry.link)
                        
                        all_news.append({
                            "title": entry.title,
                            "link": entry.link,
                            "source": source_name,
                            "description": description,
                            "image_url": image_url
                        })
                except Exception as e:
                    print(f"❌ News Error for {source_name}: {e}")
            
            if len(all_news) > 0:
                final_news = all_news[:30]
                print(f"📥 Attempting to insert {len(final_news)} articles into Supabase...")
                supabase.table('market_news').delete().neq('id', 0).execute()
                supabase.table('market_news').insert(final_news).execute()
                print(f"✅ Successfully saved {len(final_news)} news articles.")
            else:
                print("❌ No news fetched from any source.")
                
        except Exception as e:
             print(f"❌ News Loop Error: {e}")
             
        print("💤 News updated. Sleeping for 12 hours...")
        time.sleep(43200) 