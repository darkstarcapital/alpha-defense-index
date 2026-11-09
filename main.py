from flask import Flask
import threading
import engine
import os

app = Flask(__name__)

@app.route('/')
def home():
    return "Darkstar Engine is running 24/7!"

if __name__ == "__main__":
    # 1. Start the stock engine in the background
    threading.Thread(target=engine.poll_live_prices, daemon=True).start()
    
    # 2. Start the news fetcher in the background
    threading.Thread(target=engine.fetch_market_news, daemon=True).start()
    
    # 3. Start the Flask web server for Render
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)