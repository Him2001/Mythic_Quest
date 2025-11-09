"""
Flask API server for facial recognition
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import urllib.request
import cv2
import numpy as np
import base64
import sys
import os

# Add the facial_reco directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils import FaceEngine, load_face_db, find_best_match


def ensure_models():
    """Ensure required model files exist; download if missing."""
    models_dir = Path(__file__).parent / "models"
    models_dir.mkdir(exist_ok=True)
    
    # Read model URLs from environment variables
    W600K_URL = os.environ.get("W600K_URL")
    SCRFD_URL = os.environ.get("SCRFD_URL")
    
    # Download w600k_r50.onnx if URL is set
    w600k_path = models_dir / "w600k_r50.onnx"
    if not w600k_path.exists():
        if W600K_URL:
            print(f"Downloading w600k_r50.onnx from {W600K_URL}...")
            urllib.request.urlretrieve(W600K_URL, w600k_path)
        else:
            print("W600K_URL not set, skipping w600k_r50.onnx download.")
    
    # Download scrfd_10g_bnkps.onnx if URL is set
    scrfd_path = models_dir / "scrfd_10g_bnkps.onnx"
    if not scrfd_path.exists():
        if SCRFD_URL:
            print(f"Downloading scrfd_10g_bnkps.onnx from {SCRFD_URL}...")
            urllib.request.urlretrieve(SCRFD_URL, scrfd_path)
        else:
            print("SCRFD_URL not set, skipping scrfd_10g_bnkps.onnx download.")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure models are present at startup
ensure_models()

# Simple health-check route
@app.route("/ping")
def ping():
    return {"message": "Facial Recognition API is running"}

# Initialize face engine (lazy loading)
face_engine = None
face_db = None

def get_face_engine():
    """Lazy load face engine"""
    global face_engine
    if face_engine is None:
        models_dir = os.path.join(os.path.dirname(__file__), 'models')
        detector_path = os.path.join(models_dir, 'scrfd_10g_bnkps.onnx')
        recognizer_path = os.path.join(models_dir, 'w600k_r50.onnx')
        
        face_engine = FaceEngine(
            detector_path=detector_path,
            recognizer_path=recognizer_path,
            ctx_id=0,
            det_input_size=(640, 640)
        )
    return face_engine

def get_face_db():
    """Lazy load face database"""
    global face_db
    if face_db is None:
        db_path = os.path.join(os.path.dirname(__file__), 'database.json')
        face_db = load_face_db(db_path)
    return face_db

def base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        
        # Convert to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        
        # Decode image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Facial recognition API is running'})

@app.route('/recognize', methods=['POST'])
def recognize():
    """Recognize face from image"""
    try:
        data = request.json
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        image = base64_to_image(data['image'])
        if image is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        # Get face engine and database
        engine = get_face_engine()
        db = get_face_db()
        
        if not db:
            return jsonify({'error': 'Face database is empty or not found'}), 500
        
        # Get face embedding
        emb = engine.get_face_embedding(image)
        if emb is None:
            return jsonify({
                'success': False,
                'message': 'No face detected in the image'
            }), 200
        
        # Find best match
        threshold = data.get('threshold', 0.45)
        username, score = find_best_match(emb, db, threshold=threshold)
        
        if username is None:
            return jsonify({
                'success': False,
                'message': f'No match found (best similarity = {score:.3f})',
                'similarity': float(score)
            }), 200
        
        return jsonify({
            'success': True,
            'username': username,
            'similarity': float(score),
            'message': f'Recognized user: {username} (similarity = {score:.3f})'
        }), 200
        
    except Exception as e:
        print(f"Error in recognize endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    print("Starting Facial Recognition API Server...")
    print("Make sure the models are in the 'models' directory")
    print(f"API will be available at http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)

