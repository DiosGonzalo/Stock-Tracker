from flask import Flask
from .extensions import db, migrate 
from flask_jwt_extended import JWTManager
from flask_cors import CORS
def create_app():
    app = Flask(__name__)
    
    CORS(app)
    
    
    app.config['SQLALCHEMY_DATABASE_URI']= 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    app.config['JWT_SECRET_KEY'] = 'super-secreto-cambiar-en-produccion'
    
    db.init_app(app)
    migrate.init_app(app,db)
    
    
    jwt = JWTManager(app)
    
    from .routes import main
    app.register_blueprint(main)
    
    return app