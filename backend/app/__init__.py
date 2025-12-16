from flask import Flask
from .extensions import db, migrate 
from flask_cors import CORS
from .models import Stock

def create_app():
    app = Flask(__name__)
    
    CORS(app)
    
    
    app.config['SQLALCHEMY_DATABASE_URI']= 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    migrate.init_app(app,db)
    
    
    
    from .routes import main
    app.register_blueprint(main)
    
    return app