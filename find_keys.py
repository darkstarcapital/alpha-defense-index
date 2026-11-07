import requests
import gzip
import json
import io

print("📥 Downloading Upstox Master List... (Please wait 10 seconds)")
url = "https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz"
response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})

try:
    with gzip.open(io.BytesIO(response.content), 'rt', encoding='utf-8') as f:
        data = json.load(f)

    print(f"✅ Successfully loaded {len(data)} instruments from Upstox.\n")
    
    # We will search by the actual company names to guarantee a match
    keywords = [
        'CYIENT DLM', 'BHARAT DYNAMICS', 'COCHIN SHIPYARD', 'DATA PATTERNS', 
        'MAZAGON DOCK', 'MIDHANI', 'PARAS DEFENCE', 'SOLAR INDUSTRIES', 
        'UNIMECH', 'NIBE', 'PREMIER EXPLOSIVES', 'KUSUMGAR', 'INDO MIM', 'AEQUS', 'BEML'
    ]
    
    print("🎯 Found Codes:\n")
    
    for item in data:
        name = str(item.get('name', '')).upper()
        
        # Check if the company name is in our list
        for kw in keywords:
            if kw in name:
                # Only look at NSE or BSE equity segments
                segment = item.get('segment', '')
                if 'EQ' in segment:
                    print(f'"{kw}": "{item.get("instrument_key")}",')
                    break
                    
except Exception as e:
    print(f"❌ Error: {e}")