from flask import Blueprint, jsonify, request
from .services import get_stock_data
from .extensions import db
from .models import Stock
from sqlalchemy.exc import IntegrityError

main = Blueprint('main', __name__)

# --- RUTA 1: Estado del servidor ---
@main.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "online", "message": "API funcionando"})

# --- RUTA 2: Buscar precio (Para el formulario) ---
@main.route('/api/quote/<symbol>', methods=['GET'])
def get_quote(symbol):
    data = get_stock_data(symbol)
    if data is None:
        return jsonify({"error": "Stock not found"}), 404
    return jsonify(data)

# --- RUTA 3: LEER Portafolio (ESTA ES LA QUE TE FALTA) ---
@main.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    try:
        saved_stocks = Stock.query.all()
        portfolio_data = []
        
        for stock in saved_stocks:
            # Buscamos precio en vivo
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

# --- RUTA 4: GUARDAR en Portafolio ---
@main.route('/api/portfolio', methods=['POST'])
def add_to_portfolio():
    data = request.get_json()
    symbol = data.get('symbol')
    
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400

    # Verificar si ya existe para evitar el error de Integridad
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

# --- RUTA 5: BORRAR ---
@main.route('/api/portfolio/<int:id>', methods=['DELETE'])
def remove_from_portfolio(id):
    stock = Stock.query.get(id)
    if not stock:
        return jsonify({"error": "Stock not found"}), 404
        
    db.session.delete(stock)
    db.session.commit()
    return jsonify({"message": "Stock removed"})