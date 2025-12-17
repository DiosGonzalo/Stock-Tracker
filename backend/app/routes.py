from flask import Blueprint, jsonify, request
from .services import get_country_stock_data, get_stock_data, get_multiple_stock_data, get_webSocket, paint_sock
from .extensions import db
from .models import Stock, User 
import pandas as pd
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

main = Blueprint('main', __name__)


@main.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "online", "message": "API funcionando"})

@main.route('/api/quote/<symbol>', methods=['GET'])
@jwt_required()
def get_quote(symbol):
    data = get_stock_data(symbol)
    if data is None:
        return jsonify({"error": "Stock not found"}), 404
    return jsonify(data)

@main.route('/api/countryStocks/<country>', methods=['GET'])
@jwt_required()
def get_country_stock(country):
    data = get_country_stock_data(country)
    return jsonify(data)


@main.route('/api/portfolio', methods=['GET'])
@jwt_required()
def get_portfolio():
    try:
        current_user_id = get_jwt_identity()
        
        saved_stocks = Stock.query.filter_by(user_id=current_user_id).all()
        
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
        print(f"Error en portfolio: {e}")
        return jsonify({"error": str(e)}), 500

@main.route('/api/portfolio', methods=['POST'])
@jwt_required()
def add_to_portfolio():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    symbol = data.get('symbol')
    
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400

    existing = Stock.query.filter_by(symbol=symbol.upper(), user_id=current_user_id).first()
    if existing:
        return jsonify({"message": "Ya la tienes en tu lista"}), 409

    stock_info = get_stock_data(symbol)
    if not stock_info:
        return jsonify({"error": "Invalid stock symbol"}), 400

    try:
        new_stock = Stock(
            symbol=stock_info['symbol'],
            name=f"Stock {stock_info['symbol']}",
            user_id=current_user_id 
        )
        db.session.add(new_stock)
        db.session.commit()
        return jsonify(new_stock.to_dict()), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error guardando acción"}), 409

@main.route('/api/portfolio/<int:id>', methods=['DELETE'])
@jwt_required()
def remove_from_portfolio(id):
    current_user_id = get_jwt_identity()
    
    stock = Stock.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not stock:
        return jsonify({"error": "Stock not found or unauthorized"}), 404
        
    db.session.delete(stock)
    db.session.commit()
    return jsonify({"message": "Stock removed"})


@main.route('/api/webSocket/<symbol>', methods=['GET'])
@jwt_required()
def start_websocket(symbol):
    from threading import Thread
    thread = Thread(target=get_webSocket, args=(symbol,))
    thread.start()
    return jsonify({"message": f"WebSocket started for {symbol}"}), 200

@main.route('/api/chart/<symbol>', methods=['GET'])
@jwt_required()
def get_stock_chart(symbol):
    from datetime import datetime, timedelta
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    chart_data = paint_sock(symbol, start_date, end_date)
    if chart_data:
        return jsonify({"image": chart_data, "symbol": symbol}), 200
    else:
        return jsonify({"error": "Could not generate chart"}), 500


@main.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Faltan datos"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "El usuario ya existe"}), 400

    new_user = User(username=username)
    new_user.set_password(password) 

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario creado con éxito"}), 201

@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, username=username), 200
    
    return jsonify({"error": "Credenciales inválidas"}), 401