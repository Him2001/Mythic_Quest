# Facial Recognition API Server

This is a Flask API server that provides facial recognition capabilities for the Mythic Quest application.

## Setup Instructions

1. **Install Python dependencies:**
   ```bash
   cd facial_reco
   pip install -r requirements.txt
   ```

2. **Ensure models are in place:**
   - Make sure `models/scrfd_10g_bnkps.onnx` exists
   - Make sure `models/w600k_r50.onnx` exists
   - Make sure `database.json` exists with face embeddings

3. **Start the API server:**
   ```bash
   python api_server.py
   ```

   The server will start on `http://localhost:5000`

4. **Test the API:**
   ```bash
   curl http://localhost:5000/health
   ```

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Facial recognition API is running"
}
```

### POST /recognize
Recognize a face from an image.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "threshold": 0.45
}
```

**Response (Success):**
```json
{
  "success": true,
  "username": "akhilven",
  "similarity": 0.92,
  "message": "Recognized user: akhilven (similarity = 0.920)"
}
```

**Response (No match):**
```json
{
  "success": false,
  "message": "No match found (best similarity = 0.35)",
  "similarity": 0.35
}
```

**Response (No face detected):**
```json
{
  "success": false,
  "message": "No face detected in the image"
}
```

## Notes

- The API uses CORS to allow requests from the React frontend
- The face engine and database are lazy-loaded on first request
- Make sure the camera permissions are granted in the browser for the frontend to work

