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
import json
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
    """Lazy load face database from environment variable or file"""
    global face_db
    if face_db is None:
        # Try loading from environment variable first (for Render deployment)
        db_env = os.environ.get("FACE_DB_JSON")
        if db_env:
            try:
                face_db = json.loads(db_env)
                print(f"✅ Loaded face database from environment variable ({len(face_db)} users)")
            except json.JSONDecodeError as e:
                print(f"⚠️ Failed to parse FACE_DB_JSON: {e}")
                face_db = {}
        else:
            # Fall back to database.json file (for local development)
            db_path = os.path.join(os.path.dirname(__file__), 'database.json')
            face_db = load_face_db(db_path)
            if face_db:
                print(f"✅ Loaded face database from file ({len(face_db)} users)")
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
        # Add debug logging
        print("=" * 50)
        print("🔍 RECOGNIZE ENDPOINT CALLED")
        print("=" * 50)
        
        data = request.json
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        print("📸 Decoding image...")
        image = base64_to_image(data['image'])
        if image is None:
            print("❌ Failed to decode image")
            return jsonify({'error': 'Failed to decode image'}), 400
        
        print(f"✅ Image decoded: {image.shape}")
        
        # Get face engine and database
        print("🔧 Loading face engine...")
        engine = get_face_engine()
        print("✅ Face engine loaded")
        
        print("📚 Loading face database...")
        db = get_face_db()
        print(f"✅ Face database loaded: {len(db) if db else 0} users")
        
        if not db:
            print("❌ Face database is empty!")
            return jsonify({'error': 'Face database is empty or not found'}), 500
        
        # Get face embedding
        print("🧠 Extracting face embedding...")
        emb = engine.get_face_embedding(image)
        if emb is None:
            print("❌ No face detected in image")
            return jsonify({
                'success': False,
                'message': 'No face detected in the image'
            }), 200
        
        print(f"✅ Face embedding extracted: shape {emb.shape}")
        
        # Find best match
        threshold = data.get('threshold', 0.45)
        print(f"🔍 Finding best match (threshold={threshold})...")
        username, score = find_best_match(emb, db, threshold=threshold)
        
        print(f"📊 Best match: {username} (score={score:.3f})")
        
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
        print("=" * 50)
        print("❌ ERROR IN RECOGNIZE ENDPOINT:")
        print(str(e))
        import traceback
        traceback.print_exc()
        print("=" * 50)
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    
    print("=" * 60)
    print("🚀 Starting Facial Recognition API Server...")
    print("=" * 60)
    
    # Pre-load and verify everything
    print("\n📦 Checking models...")
    models_dir = Path(__file__).parent / "models"
    w600k_exists = (models_dir / "w600k_r50.onnx").exists()
    scrfd_exists = (models_dir / "scrfd_10g_bnkps.onnx").exists()
    print(f"  w600k_r50.onnx: {'✅' if w600k_exists else '❌'}")
    print(f"  scrfd_10g_bnkps.onnx: {'✅' if scrfd_exists else '❌'}")
    
    print("\n📚 Checking face database...")
    db_env = os.environ.get("FACE_DB_JSON")
    db_file = Path(__file__).parent / "database.json"
    print(f"  FACE_DB_JSON env var: {'✅ SET' if db_env else '❌ NOT SET'}")
    print(f"  database.json file: {'✅ EXISTS' if db_file.exists() else '❌ NOT FOUND'}")
    
    # Try loading database
    try:
        test_db = get_face_db()
        print(f"  Database users: {len(test_db) if test_db else 0}")
        if test_db:
            print(f"  Registered users: {', '.join(test_db.keys())}")
    except Exception as e:
        print(f"  ❌ Error loading database: {e}")
    
    print(f"\n🌐 API will be available at http://0.0.0.0:{port}")
    print("=" * 60)
    print()
    
    app.run(host="0.0.0.0", port=port, debug=False)

