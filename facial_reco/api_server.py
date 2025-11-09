"""
Flask API server for facial recognition - Clean Dropbox version
"""
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from pathlib import Path
import cv2
import numpy as np
import base64
import json
import sys
import os
import time
import requests

# --- Force-set Dropbox model URLs (for local debugging or fallback) ---
os.environ["W600K_URL"] = "https://www.dropbox.com/scl/fi/pocojod1lg0tv6ipv3y9g/w600k_r50.onnx?rlkey=dfrstynu59w4kzppfapnyxqwo&st=v0k5q59a&dl=1"
os.environ["SCRFD_URL"] = "https://www.dropbox.com/scl/fi/wls097vickm7v2avxk5g2/scrfd_10g_bnkps.onnx?rlkey=yy2cc9p9wxbm75zfb6947djok&st=fo6wwtyf&dl=1"

# Optional: confirm for logs
print("🔗 W600K_URL set to:", os.environ["W600K_URL"])
print("🔗 SCRFD_URL set to:", os.environ["SCRFD_URL"])


# Add the facial_reco directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils import FaceEngine, load_face_db, find_best_match

def download_from_dropbox(url, filepath, expected_min_size_mb=1):
    """Download file from Dropbox with direct download link"""
    max_retries = 3
    
    # Ensure Dropbox URL uses direct download
    if 'dropbox.com' in url:
        if '&dl=0' in url:
            url = url.replace('&dl=0', '&dl=1')
        elif '&dl=1' not in url:
            url = url + ('&' if '?' in url else '?') + 'dl=1'
    
    for attempt in range(max_retries):
        try:
            print(f"📥 Downloading {filepath.name} (attempt {attempt + 1}/{max_retries})...")
            print(f"🔗 URL: {url}")
            
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            print("💾 Saving file...")
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            file_size_mb = filepath.stat().st_size / (1024 * 1024)
            print(f"📊 Downloaded file size: {file_size_mb:.2f} MB")
            
            if file_size_mb >= expected_min_size_mb:
                # Check it's not HTML
                with open(filepath, 'rb') as f:
                    header = f.read(100)
                    if b'<html' in header.lower():
                        print("❌ Downloaded HTML instead of file!")
                        filepath.unlink()
                        continue
                
                print(f"✅ Successfully downloaded {filepath.name}")
                return True
            else:
                print(f"❌ File too small ({file_size_mb:.2f} MB < {expected_min_size_mb} MB)")
                filepath.unlink()
                
        except Exception as e:
            print(f"❌ Download failed: {e}")
            if filepath.exists():
                filepath.unlink()
            
        if attempt < max_retries - 1:
            print("🔄 Retrying in 5 seconds...")
            time.sleep(5)
    
    return False

def ensure_models():
    """Ensure required model files exist; download if missing."""
    models_dir = Path(__file__).parent / "models"
    models_dir.mkdir(exist_ok=True)
    
    W600K_URL = os.environ.get("W600K_URL")
    SCRFD_URL = os.environ.get("SCRFD_URL")
    
    print(f"🔗 W600K_URL: {'SET' if W600K_URL else 'NOT SET'}")
    print(f"🔗 SCRFD_URL: {'SET' if SCRFD_URL else 'NOT SET'}")
    
    # Download w600k_r50.onnx
    w600k_path = models_dir / "w600k_r50.onnx"
    if not w600k_path.exists():
        if W600K_URL:
            print("⬇️ Downloading w600k_r50.onnx...")
            success = download_from_dropbox(W600K_URL, w600k_path, expected_min_size_mb=50)
            if not success:
                print("❌ Failed to download w600k_r50.onnx")
        else:
            print("⚠️ W600K_URL not set")
    else:
        print("✅ w600k_r50.onnx already exists")
    
    # Download scrfd_10g_bnkps.onnx
    scrfd_path = models_dir / "scrfd_10g_bnkps.onnx"
    if not scrfd_path.exists():
        if SCRFD_URL:
            print("⬇️ Downloading scrfd_10g_bnkps.onnx...")
            success = download_from_dropbox(SCRFD_URL, scrfd_path, expected_min_size_mb=10)
            if not success:
                print("❌ Failed to download scrfd_10g_bnkps.onnx")
        else:
            print("⚠️ SCRFD_URL not set")
    else:
        print("✅ scrfd_10g_bnkps.onnx already exists")

app = Flask(__name__)

# Enable CORS for all origins
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Accept", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False,
        "max_age": 3600
    }
})

# Add after-request handler to ensure CORS headers are always present
@app.after_request
def after_request(response):
    # Ensure CORS headers are set (redundant but safe)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Max-Age'] = '3600'
    
    # Debug logging
    origin = request.headers.get('Origin')
    print(f"📤 Response Status: {response.status}")
    print(f"📤 Origin: {origin}")
    print(f"📤 CORS Origin Header: {response.headers.get('Access-Control-Allow-Origin')}")
    return response

# Add error handler to ensure CORS even on errors
@app.errorhandler(Exception)
def handle_error(e):
    print(f"❌ ERROR CAUGHT: {str(e)}")
    import traceback
    traceback.print_exc()
    response = jsonify({'error': str(e)})
    response.status_code = 500
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

# Initialize face engine and database (lazy loading)
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
        # Try environment variable first
        db_env = os.environ.get("FACE_DB_JSON")
        if db_env:
            try:
                face_db = json.loads(db_env)
                print(f"✅ Loaded face database from environment ({len(face_db)} users)")
            except json.JSONDecodeError as e:
                print(f"⚠️ Failed to parse FACE_DB_JSON: {e}")
                face_db = {}
        else:
            # Fall back to file
            db_path = os.path.join(os.path.dirname(__file__), 'database.json')
            face_db = load_face_db(db_path)
            if face_db:
                print(f"✅ Loaded face database from file ({len(face_db)} users)")
    return face_db

def base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

@app.route('/', methods=['GET', 'HEAD', 'OPTIONS'])
def index():
    """Root endpoint - for health checks"""
    if request.method == 'OPTIONS':
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
        return resp
    
    if request.method == 'HEAD':
        return '', 200
    
    return jsonify({
        'status': 'ok',
        'message': 'Facial Recognition API',
        'version': '1.0',
        'endpoints': {
            'health': '/health',
            'debug': '/debug',
            'recognize': '/recognize (POST)'
        }
    })

@app.route('/health', methods=['GET', 'OPTIONS'])
def health():
    """Health check"""
    if request.method == 'OPTIONS':
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
        return resp
    
    print(f"🏥 Health check - Method: {request.method}, Origin: {request.headers.get('Origin', 'None')}")
    return jsonify({'status': 'ok', 'message': 'Facial recognition API is running'})

@app.route('/debug', methods=['GET', 'POST', 'OPTIONS'])
def debug():
    """Debug endpoint to test CORS"""
    if request.method == 'OPTIONS':
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
        return resp
    
    print("🐛 DEBUG ENDPOINT CALLED")
    print(f"   Method: {request.method}, Origin: {request.headers.get('Origin', 'None')}")
    
    return jsonify({
        'status': 'ok',
        'method': request.method,
        'origin': request.headers.get('Origin', 'None'),
        'message': 'Debug endpoint working - CORS should be enabled',
        'cors_header': '*'
    })

@app.route('/recognize', methods=['POST', 'OPTIONS'])
def recognize():
    """Recognize face from image"""
    
    # --- Explicitly handle preflight OPTIONS request ---
    if request.method == 'OPTIONS':
        print("✅ Handling OPTIONS preflight for /recognize")
        print(f"   Origin: {request.headers.get('Origin', 'None')}")
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = '*'  # Allow all origins
        resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
        resp.headers['Access-Control-Max-Age'] = '3600'
        print(f"   Returning 204 with CORS headers")
        return resp
    # ----------------------------------------------------
    
    print("=" * 80)
    print(f"📨 INCOMING POST REQUEST to /recognize")
    print(f"   Method: {request.method}")
    print(f"   Origin: {request.headers.get('Origin', 'None')}")
    print(f"   Content-Type: {request.headers.get('Content-Type', 'None')}")
    print(f"   User-Agent: {request.headers.get('User-Agent', 'None')[:50]}...")
    print("=" * 80)
    
    try:
        print("🔍 Processing POST recognition request")
        
        data = request.json
        if not data:
            print("❌ No JSON data received")
            return jsonify({'error': 'No JSON data provided'}), 400
            
        if 'image' not in data:
            print("❌ No image in JSON data")
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode image
        image = base64_to_image(data['image'])
        if image is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        print(f"✅ Image decoded: {image.shape}")
        
        # Get face engine and database with error handling
        print("🔧 Loading face engine...")
        try:
            engine = get_face_engine()
            print("✅ Face engine loaded")
        except Exception as e:
            print(f"❌ Failed to load face engine: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to load face engine: {str(e)}'}), 500
        
        print("📚 Loading face database...")
        try:
            db = get_face_db()
            print(f"✅ Face database loaded ({len(db) if db else 0} users)")
        except Exception as e:
            print(f"❌ Failed to load database: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to load database: {str(e)}'}), 500
        
        if not db:
            print("❌ Database is empty")
            return jsonify({'error': 'Face database is empty'}), 500
        
        # Extract face embedding
        print("🔍 Extracting face embedding...")
        try:
            emb = engine.get_face_embedding(image)
            if emb is None:
                print("⚠️ No face detected in image")
                return jsonify({
                    'success': False,
                    'message': 'No face detected in the image'
                }), 200
            print(f"✅ Face embedding extracted: shape {emb.shape}")
        except Exception as e:
            print(f"❌ Failed to extract embedding: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to extract face embedding: {str(e)}'}), 500
        
        # Find best match
        print("🔎 Finding best match...")
        try:
            threshold = data.get('threshold', 0.45)
            username, score = find_best_match(emb, db, threshold=threshold)
            print(f"🎯 Match result: username={username}, score={score}")
        except Exception as e:
            print(f"❌ Failed to find match: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to find match: {str(e)}'}), 500
        
        if username is None:
            print(f"⚠️ No match found (best score: {score})")
            return jsonify({
                'success': False,
                'message': f'No match found (best similarity = {score:.3f})',
                'similarity': float(score)
            }), 200
        
        print(f"✅ Match found: {username} (similarity: {score})")
        return jsonify({
            'success': True,
            'username': username,
            'similarity': float(score),
            'message': f'Recognized user: {username} (similarity = {score:.3f})'
        }), 200
        
    except Exception as e:
        print(f"❌ Recognition error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    
    print("=" * 60)
    print("🚀 Starting Facial Recognition API Server...")
    print("=" * 60)
    
    # Ensure models are downloaded
    print("\n📦 Ensuring models are available...")
    ensure_models()
    
    # Verify models exist
    print("\n📦 Checking models...")
    models_dir = Path(__file__).parent / "models"
    w600k_path = models_dir / "w600k_r50.onnx"
    scrfd_path = models_dir / "scrfd_10g_bnkps.onnx"
    
    w600k_exists = w600k_path.exists()
    scrfd_exists = scrfd_path.exists()
    
    print(f"  w600k_r50.onnx: {'✅' if w600k_exists else '❌'}")
    if w600k_exists:
        size_mb = w600k_path.stat().st_size / (1024 * 1024)
        print(f"    Size: {size_mb:.2f} MB")
    
    print(f"  scrfd_10g_bnkps.onnx: {'✅' if scrfd_exists else '❌'}")
    if scrfd_exists:
        size_mb = scrfd_path.stat().st_size / (1024 * 1024)
        print(f"    Size: {size_mb:.2f} MB")
    
    # Check database
    print("\n📚 Checking face database...")
    try:
        test_db = get_face_db()
        print(f"  Database users: {len(test_db) if test_db else 0}")
        if test_db:
            print(f"  Registered users: {', '.join(test_db.keys())}")
    except Exception as e:
        print(f"  ❌ Database error: {e}")
    
    # Exit if models missing
    if not w600k_exists or not scrfd_exists:
        print("\n❌ CRITICAL: Missing model files!")
        print("Cannot start server without both ONNX models.")
        exit(1)
    
    print(f"\n🌐 API will be available at http://0.0.0.0:{port}")
    print("=" * 60)
    print()
    
    app.run(host="0.0.0.0", port=port, debug=False)