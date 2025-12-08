from sqlite3 import IntegrityError
from flask import Blueprint, jsonify, request
from .services import get_stock_data
from .extensions import db
from .models import Stock
from .services import get_stock_data

main = Blueprint('main',__name__)


@main.route('/api/status', methods = ['GET'])
def status():
    return jsonify({
        "status":"online",
        "message":"Stock Tracket Api funcionando"
    })
    
@main.route('/api/quote/<symbol>',methods = ['GET'])
def get_quote(symbol):
    data = get_stock_data(symbol)
    
    if(data) is None:
        return jsonify({"error":"stock not found"}),404
    
    return jsonify(data)

@main.route('/api/portfolio', methods = ['POST'])
def add_to_portfolio():
    data = request.get_json()
    symbol = data.get('symbol')
    
    if not symbol:
        return jsonify({"error":"Missing a symbol"}), 400
    
    
    stock_info = get_stock_data(symbol)
    if not stock_info:
        return jsonify({"error":"Invalid symbol"}), 400
    
    try:
        new_stock = Stock(
            symbol = stock_info['symbol'],
            name = f"Stock {stock_info['symbol']}"
        )
        
        db.session.add(new_stock)
        db.session.commit()
        
        return jsonify(new_stock.to_dict()),201
    
    except IntegrityError:
        db.session.rollback() 
        return jsonify({"error": "Stock already in portfolio"}), 409