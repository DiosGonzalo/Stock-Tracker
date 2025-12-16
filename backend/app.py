import yfinance as yf
from flask import request, render_template, jsonify, Flask



app = Flask(__name__,template_folder='templates')