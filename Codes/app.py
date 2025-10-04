from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load model
try:
    model = pickle.load(open('prophet_model.pkl', 'rb'))
    print("Model loaded successfully")
except Exception as e:
    print("Failed to load model:", e)
    model = None

@app.route('/predict')  # root endpoint
def predict():
    # Number of days requested by frontend (default 30)
    try:
        days = int(request.args.get('days', 30))
    except ValueError:
        return jsonify({'error': 'Invalid days parameter'}), 400

    if model is None:
        return jsonify({'error': 'Model not loaded on server'}), 500

    # Fixed prediction range
    start_date = pd.to_datetime("2025-10-05")
    end_date = pd.to_datetime("2025-11-05")
    future_dates = pd.date_range(start=start_date, end=end_date, freq='D')

    df_future = pd.DataFrame({'ds': future_dates})
    forecast = model.predict(df_future)

    # Format output for frontend
    forecast['ds'] = forecast['ds'].dt.strftime('%Y-%m-%d')
    out = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict(orient='records')

    # Return only the requested number of days
    if days > len(out):
        days = len(out)
    return jsonify(out[:days])

if __name__ == '__main__':
    print("Flask server running at http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
