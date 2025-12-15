from flask import Blueprint, jsonify, request
from .services import get_country_stock_data, get_stock_data, get_multiple_stock_data, get_webSocket, paint_sock
from .extensions import db
import pandas as pd
from .models import Stock
from sqlalchemy.exc import IntegrityError

main = Blueprint('main', __name__)


@main.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "online", "message": "API funcionando"})


@main.route('/api/quote/<symbol>', methods=['GET'])
def get_quote(symbol):
    data = get_stock_data(symbol)
    if data is None:
        return jsonify({"error": "Stock not found"}), 404
    return jsonify(data)

@main.route('/api/countryStocks/<country>', methods=['GET'])
def get_country_stock(country):
    data = get_country_stock_data(country)
    return jsonify(data)

@main.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    try:
        saved_stocks = Stock.query.all()
        portfolio_data = []
        
        for stock in saved_stocks:
            live_data = get_stock_data(stock.symbol)
            
            if live_data:
                stock_display = {
                    "id": stock.id,
                    "symbol": stock.symbol,
                    "price": live_data['price'],
                    "currency": live_data['currency']
                }
            else:
                stock_display = stock.to_dict()
                
            portfolio_data.append(stock_display)
            
        return jsonify(portfolio_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/api/portfolio', methods=['POST'])
def add_to_portfolio():
    data = request.get_json()
    symbol = data.get('symbol')
    
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400

    existing = Stock.query.filter_by(symbol=symbol.upper()).first()
    if existing:
        return jsonify({"message": "Ya existe"}), 409

    stock_info = get_stock_data(symbol)
    if not stock_info:
        return jsonify({"error": "Invalid stock symbol"}), 400

    try:
        new_stock = Stock(
            symbol=stock_info['symbol'],
            name=f"Stock {stock_info['symbol']}"
        )
        db.session.add(new_stock)
        db.session.commit()
        return jsonify(new_stock.to_dict()), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Stock already in portfolio"}), 409

@main.route('/api/portfolio/<int:id>', methods=['DELETE'])
def remove_from_portfolio(id):
    stock = Stock.query.get(id)
    if not stock:
        return jsonify({"error": "Stock not found"}), 404
        
    db.session.delete(stock)
    db.session.commit()
    return jsonify({"message": "Stock removed"})

@main.route('/api/webSocket/<symbol>', methods=['GET'])
def start_websocket(symbol):
    from threading import Thread
    thread = Thread(target=get_webSocket, args=(symbol,))
    thread.start()
    return jsonify({"message": f"WebSocket started for {symbol}"}), 200

@main.route('/api/chart/<symbol>', methods=['GET'])
def get_stock_chart(symbol):
    from datetime import datetime, timedelta
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    chart_data = paint_sock(symbol, start_date, end_date)
    if chart_data:
        return jsonify({"image": chart_data, "symbol": symbol}), 200
    else:
        return jsonify({"error": "Could not generate chart"}), 500

