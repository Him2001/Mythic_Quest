# register.py
import json
import os
from datetime import datetime

import cv2
import numpy as np

from utils import FaceEngine, average_embeddings

DB_PATH = "database.json"
NUM_SAMPLES = 30   # you asked for 30

def load_db(path=DB_PATH):
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_db(db, path=DB_PATH):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)

def main():
    username = input("Enter new username to register: ").strip()
    if not username:
        print("Empty username. Abort.")
        return

    # init engine (loads your local ONNX models)
    engine = FaceEngine(detector_path="models/scrfd_10g_bnkps.onnx",
                    recognizer_path="models/w600k_r50.onnx",
                    ctx_id=0,
                    det_input_size=(640,640))

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Could not open webcam (index 0).")
        return

    print(f"[{username}] Starting capture. Please look at the camera.")
    print("Tips: vary angles slightly (left/right/up/down) and blink a few times.")

    collected = []
    frame_skip = 0  # simple throttle to avoid near-duplicate frames
    try:
        while len(collected) < NUM_SAMPLES:
            ret, frame = cap.read()
            if not ret:
                print("WARN: Failed to read frame from camera.")
                continue

            # simple frame skipping to diversify samples
            frame_skip = (frame_skip + 1) % 2
            if frame_skip != 0:
                # draw progress without computing every single frame
                cv2.putText(frame, f"Collected: {len(collected)}/{NUM_SAMPLES}",
                            (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
                cv2.imshow("Registration - press Q to cancel", frame)
                if cv2.waitKey(1) & 0xFF in (ord('q'), ord('Q')):
                    print("Cancelled by user.")
                    break
                continue

            emb = engine.get_face_embedding(frame)
            if emb is not None:
                collected.append(emb)
                # visual feedback
                cv2.putText(frame, f"Collected: {len(collected)}/{NUM_SAMPLES}",
                            (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
            else:
                cv2.putText(frame, "No face detected", (20, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

            cv2.imshow("Registration - press Q to cancel", frame)
            if cv2.waitKey(1) & 0xFF in (ord('q'), ord('Q')):
                print("Cancelled by user.")
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()

    if len(collected) < NUM_SAMPLES:
        print(f"Not enough samples collected ({len(collected)}/{NUM_SAMPLES}). No enrollment saved.")
        return

    # average + store
    avg_emb = average_embeddings(collected)
    if avg_emb is None:
        print("Failed to compute average embedding. Abort.")
        return

    db = load_db()
    db[username] = {
        "embedding": avg_emb.tolist(),
        "model": "w600k_r50",
        "detector": "scrfd_10g_bnkps",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "samples": len(collected)
    }
    save_db(db)

    print(f"✅ Registered '{username}' with {len(collected)} samples. Saved to {DB_PATH}.")

if __name__ == "__main__":
    main()
