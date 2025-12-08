import yfinance as yf

def get_stock_data(ticker): 
    try:
        stock = yf.Ticker(ticker)
        history = stock.history(period="1d")
        
        if history.empty:
            return None
            
        current_price = history['Close'].iloc[-1]
        
        return {
            "symbol": ticker.upper(),
            "price": round(current_price, 2),
            "currency": "USD"
        }
        
    except Exception as e:
        print(f"Error: {e}")
        return None