import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { pythonFaceRecognitionService } from '../../utils/pythonFaceRecognitionService';

interface FaceRecognitionCameraProps {
  isOpen: boolean;
  onClose: () => void;
  onRecognized: (username: string) => void;
}

const FaceRecognitionCamera: React.FC<FaceRecognitionCameraProps> = ({
  isOpen,
  onClose,
  onRecognized
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  // Check API availability when component opens
  useEffect(() => {
    if (isOpen) {
      pythonFaceRecognitionService.checkHealth().then(available => {
        setApiAvailable(available);
        if (!available) {
          setError('Facial recognition API is not available. Please make sure the Python server is running on http://localhost:5000');
        } else {
          setStatus('API connected. Starting camera...');
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && apiAvailable) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, apiAvailable]);

  const startCamera = async () => {
    try {
      setError('');
      setStatus('Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStatus('Camera ready. Looking for face...');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please allow camera permissions.');
      setStatus('');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current || isRecognizing || !apiAvailable) {
      return;
    }

    setIsRecognizing(true);
    setError('');
    setStatus('Detecting face...');

    try {
      const video = videoRef.current;
      
      // Use Python API for recognition with threshold 0.45 (same as Python code)
      const result = await pythonFaceRecognitionService.recognizeFace(video, 0.45);

      if (result.success && result.username) {
        // Face recognized successfully
        setStatus(`Recognized: ${result.username} (${((result.similarity || 0) * 100).toFixed(1)}% match)`);
        setTimeout(() => {
          onRecognized(result.username!);
          stopCamera();
        }, 1000);
      } else {
        // Face not recognized
        if (result.message?.includes('No face detected')) {
          setError('No face detected. Please ensure your face is clearly visible in the frame.');
        } else if (result.message?.includes('not available')) {
          setError(result.message);
        } else {
          // No match found
          const similarity = result.similarity || 0;
          if (similarity > 0) {
            setError(`Face not recognized. Similarity: ${(similarity * 100).toFixed(1)}% is too low. This person is NOT in the database.`);
          } else {
            setError('Face not recognized. This person is NOT in the database.');
          }
        }
        setStatus('');
      }
    } catch (err) {
      console.error('Recognition error:', err);
      setError('Face recognition failed. Please try again.');
      setStatus('');
    } finally {
      setIsRecognizing(false);
    }
  };

  // Auto-capture every 2 seconds when camera is ready
  useEffect(() => {
    if (!isOpen || isRecognizing || !streamRef.current || !apiAvailable) return;

    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        captureAndRecognize();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, isRecognizing, apiAvailable]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border-4 border-amber-300">
        {/* Close button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors z-10"
          disabled={isRecognizing}
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-cinzel font-bold text-gray-800 mb-4 text-center">
          Face Recognition
        </h2>

        {apiAvailable === false && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm font-merriweather text-center">
              ⚠️ Facial recognition API is not available. Please start the Python server:
              <br />
              <code className="text-xs mt-1 block">cd facial_reco && python api_server.py</code>
            </p>
          </div>
        )}

        {/* Video container */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay when recognizing */}
          {isRecognizing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin text-amber-400 mx-auto mb-2" size={32} />
                <p className="text-white font-merriweather">{status}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status messages */}
        {status && !isRecognizing && (
          <p className="text-center text-gray-700 font-merriweather mb-2">{status}</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm font-merriweather">{error}</p>
          </div>
        )}

        {/* Manual capture button */}
        <button
          onClick={captureAndRecognize}
          disabled={isRecognizing || !apiAvailable}
          className="w-full fantasy-button text-white py-3 px-4 rounded-lg font-cinzel font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRecognizing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Recognizing...</span>
            </>
          ) : (
            <>
              <Camera size={20} />
              <span>Capture & Recognize</span>
            </>
          )}
        </button>

        {/* Instructions */}
        <p className="text-xs text-gray-600 text-center mt-4 font-merriweather">
          Position your face in the frame. Recognition will happen automatically.
        </p>
      </div>
    </div>
  );
};

export default FaceRecognitionCamera;