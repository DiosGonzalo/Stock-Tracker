import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
# Símbolos por mercado de Yahoo Finance
COUNTRY_SYMBOLS = {
    'US': ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOG', 'NVDA', 'META', 'NFLX'],
    'GB': ['HSBA.L', 'SHEL.L', 'AZN.L', 'GSK.L', 'ULVR.L', 'DGE.L', 'EXPN.L', 'BP.L'],
    'EUROPE': ['SAP', 'ASML', 'BBVA', 'SAN', 'VOW3.DE', 'MC.PA', 'ADYEN.AS', 'STLA'],
    'ASIA': ['6998.T', '9984.T', '8035.T', '8766.T', '8604.T', '8309.T', '9433.T', '6501.T'],
    'COMMODITIES': ['GC=F', 'CL=F', 'NG=F', 'ZC=F', 'ZS=F', 'ZW=F', 'SI=F', 'PL=F'],
    'CURRENCIES': ['EURUSD=X', 'GBPUSD=X', 'JPYUSD=X', 'CADUSD=X', 'AUDUSD=X', 'CHFUSD=X', 'CNYUSD=X', 'INRUSD=X'],
    'CRYPTOCURRENCIES': ['BTC-USD', 'ETH-USD', 'ADA-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD', 'MATIC-USD', 'LTC-USD'],
    'RATES': ['^TNX', '^TYX', '^VVIX', '^VIX', '^GSPC', '^IXIC', '^FTSE', '^N225'],
}

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


def get_multiple_stock_data(tickers):
    results = []
    if not tickers:
        return results

    for t in tickers:
        data = get_stock_data(t)
        if data:
            results.append(data)
    return results


def get_country_stock_data(country_code):
    result = []
    try:
        country_key = country_code.upper() if country_code.upper() in COUNTRY_SYMBOLS else 'EUROPE'
        symbols = COUNTRY_SYMBOLS.get(country_key, [])
        
        for stock_symbol in symbols:
            stock_data = get_stock_data(stock_symbol)
            if stock_data:
                result.append(stock_data)

        return result
    except Exception as e:
        print(f"Error: {e}")
        return []
   
def message_handler(message):
    print("Received message:", message)
 
    
def get_webSocket(stock_symbol):
    try:
        with yf.WebSocket() as ws:
            ws.subscribe([stock_symbol, "BTC-USD"])
            ws.listen(message_handler)
    except Exception as e:
        print(f"WebSocket error: {e}")
        
        
def paint_sock(stock_symbol, start_date, end_date):
    try:
        import os
        from io import BytesIO
        import base64
        
        ticker = yf.Ticker(stock_symbol)
        stock_data = ticker.history(start=start_date, end=end_date)
        
        if stock_data.empty:
            return None
        
        adj_close_prices = stock_data['Close']
        
        plt.figure(figsize=(10, 6))
        plt.plot(adj_close_prices.index, adj_close_prices.values, label=f'{stock_symbol} Close', color='#8b5cf6', linewidth=2)
        plt.xlabel('Date', fontsize=12, color='#e5e7eb')
        plt.ylabel('Closing Price (USD)', fontsize=12, color='#e5e7eb')
        plt.title(f'{stock_symbol} Historical Price', fontsize=14, color='#e5e7eb')
        plt.legend(facecolor='#0e1429', edgecolor='#8b5cf6', labelcolor='#e5e7eb')
        plt.xticks(rotation=45, color='#94a3b8')
        plt.yticks(color='#94a3b8')
        plt.grid(True, alpha=0.2, color='#94a3b8')
        plt.tight_layout()
        
        fig = plt.gcf()
        fig.patch.set_facecolor('#0a0f1f')
        ax = plt.gca()
        ax.set_facecolor('#0e1429')
        
        buffer = BytesIO()
        plt.savefig(buffer, format='png', facecolor='#0a0f1f', edgecolor='none', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close()
        
        return image_base64
    except Exception as e:
        print(f"Error plotting stock data: {e}")
        return None