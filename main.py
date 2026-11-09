from flask import Flask
import threading
import engine
import os

app = Flask(__name__)

@app.route('/')
def home():
    return "Darkstar Engine is running 24/7!"

if __name__ == "__main__":
    # 1. Start your data engine in the background
    threading.Thread(target=engine.poll_live_prices, daemon=True).start()
    
    # 2. Start the web server on the port Render gives us
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)