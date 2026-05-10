import os
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

app = Flask(__name__, static_url_path='', static_folder='.')
app.secret_key = 'your_secret_key_here'
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'cars'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/register.html')
def register_page():
    return send_from_directory('.', 'register.html')

@app.route('/login.html')
def login_page():
    return send_from_directory('.', 'login.html')

@app.route('/add-car.html')
def add_car_page():
    if 'seller_id' not in session:
        return "<script>alert('Please login first'); window.location.href='/login.html';</script>"
    return send_from_directory('.', 'add-car.html')

@app.route('/search.html')
def search_page():
    return send_from_directory('.', 'search.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    address = data.get('address')
    phone = data.get('phone')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not all([name, address, phone, email, username, password]):
        return jsonify({'error': 'All fields are required'}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "INSERT INTO sellers (name, address, phone, email, username, password) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(query, (name, address, phone, email, username, hashed_password))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Registration successful'}), 201
    except mysql.connector.Error as err:
        if err.errno == 1062:
            return jsonify({'error': 'Username already exists'}), 400
        return jsonify({'error': str(err)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id, username, password FROM sellers WHERE username = %s"
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['seller_id'] = user['id']
            session['username'] = user['username']
            return jsonify({'message': 'Login successful', 'redirect': '/add-car.html'}), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/api/add-car', methods=['POST'])
def add_car():
    if 'seller_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    color = request.form.get('color')
    car_type = request.form.get('car_type')
    year = request.form.get('year')
    location = request.form.get('location')
    price = request.form.get('price')
    
    # Handle image upload if needed, for now we'll just store a placeholder or actual path if provided
    image_path = 'https://picsum.photos/id/1071/400/300' # Default placeholder
    
    if not all([color, car_type, year, location, price]):
        return jsonify({'error': 'All fields are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "INSERT INTO carstables (seller_id, color, car_type, year, location, price, image_path) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(query, (session['seller_id'], color, car_type, year, location, price, image_path))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Car added successfully'}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/api/search', methods=['GET'])
def search_cars():
    car_type = request.args.get('car_type', '')
    year = request.args.get('year', '')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM carstables WHERE 1=1"
        params = []
        
        if car_type:
            query += " AND car_type LIKE %s"
            params.append(f"%{car_type}%")
        if year:
            query += " AND year = %s"
            params.append(year)
            
        cursor.execute(query, tuple(params))
        cars = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(cars), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

if __name__ == '__main__':
    # Initialize database if needed (one-time setup)
    try:
        # Connect without database to create it
        conn = mysql.connector.connect(host='localhost', user='root', password='123456')
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS cars")
        cursor.execute("USE cars")
        
        # Create tables
        with open('setup.sql', 'r') as f:
            sql_commands = f.read().split(';')
            for command in sql_commands:
                if command.strip():
                    cursor.execute(command)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Database initialization error: {e}")

    app.run(debug=True, port=5000)
