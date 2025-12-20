# 📈 Stock Tracker - Full Stack Finance Dashboard

A web application for investment portfolio tracking and technical analysis, built with React and Python.

## 🚀 Technologies

* **Frontend:** React, Vite, Axios, CSS Modules.
* **Backend:** Python, Flask, SQLAlchemy.
* **Data & Visualization:** Pandas, Matplotlib, yfinance.
* **Security:** Flask-JWT-Extended (Token-based Authentication).

## ✨ Key Features

* ✅ **Authentication:** Secure User Registration and Login.
* ✅ **Database:** Persistent portfolio management linked to specific users.
* ✅ **Server-Side Chart Rendering:** Python generates technical analysis charts (Matplotlib) and serves them to the client.
* ✅ **Live Data:** Integration with financial APIs for real-time market pricing.

## 🔧 Installation & Setup

### 1. Clone the repository
git clone [https://github.com/tu-usuario/stock-tracker.git](https://github.com/tu-usuario/stock-tracker.git)
cd stock-tracker

### 2. Activate Backend
cd backend
python -m venv .venv
# Activate virtual environment:
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt
flask db upgrade
python run.py

### 3. Activate Frontend
cd frontend
npm install
npm run dev

--------------------------------------------------------------------------------------------------------------------------------------------------------------------
# 📈 Stock Tracker - Full Stack Finance Dashboard

Una aplicación web para seguimiento de carteras de inversión y análisis técnico, construida con React y Python.

## 🚀 Tecnologías

* **Frontend:** React, Vite, Axios, CSS Modules.
* **Backend:** Python, Flask, SQLAlchemy.
* **Data & Gráficos:** Pandas, Matplotlib, yfinance.
* **Seguridad:** Flask-JWT-Extended (Auth basada en Tokens).

## ✨ Funcionalidades

* ✅ **Autenticación:** Registro y Login seguro.
* ✅ **Base de Datos:** Cada usuario tiene su propio portafolio persistente.
* ✅ **Server-Side Rendering de Gráficos:** Python genera las imágenes de análisis técnico.
* ✅ **Datos en vivo:** Conexión con APIs financieras para precios en tiempo real.

## 🔧 Instalación

1. Clonar el repositorio.
2. Backend: `pip install -r requirements.txt` y `python run.py`
3. Frontend: `npm install` y `npm run dev`

## Objetivos del Proyecto
Este proyecto fue concebido como una práctica para:
1. Aprender a estructurar una API REST profesional con Python y Flask.
2. Familiarizarse con la manipulación de DataFrames usando Pandas.
3. Integrar visualizaciones de datos generadas en Python (Matplotlib) dentro de una aplicación web React.
4. Implementar sistemas de autenticación seguros (JWT) desde cero.
