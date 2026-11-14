from flask import Flask
import threading
import engine
import os

app = Flask(__name__)

@app.route('/')
def home():
    return "Northman Engine is running 24/7!"

if __name__ == "__main__":
    print("🚀 Starting background threads...", flush=True)
    
    # Start the stock engine
    threading.Thread(target=engine.poll_live_prices, daemon=True).start()
    
    # Start the news fetcher
    threading.Thread(target=engine.fetch_market_news, daemon=True).start()
    
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)