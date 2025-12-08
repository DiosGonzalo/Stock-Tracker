from .extensions import db

class Stock(db.Model):
    __tableName__ = 'stocks'
    
    id = db.Column(db.Integer, primary_key = True)
    symbol = db.Column(db.String(10), unique = True, nullable = False)
    name = db.Column(db.String(100), nullable= False)
    def __repr__(self):
        return f'<Stock {self.symbol}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'symbol':self.symbol,
            'name':self.name
        }