import cv2
import sys
from utils import FaceEngine
from utils import load_face_db, find_best_match 
import json  # if you put them in utils.py
# from recognize_utils import load_face_db, find_best_match  # if separate file

DB_PATH = "database.json"   # adjust if your file is named differently


def recognize_from_image(image_path: str):
    # 1) load DB
    db = load_face_db(DB_PATH)
    if not db:
        print("Face DB is empty or not found.")
        return

    # 2) init engine (same model/detector as you used for registration)
    engine = FaceEngine(
        detector_path="models/scrfd_10g_bnkps.onnx",
        recognizer_path="models/w600k_r50.onnx",
        ctx_id=0,                # or -1 if you want CPU only
        det_input_size=(640, 640)
    )

    # 3) read image
    frame = cv2.imread(image_path)
    if frame is None:
        print(f"Could not read image: {image_path}")
        return

    # 4) get embedding
    emb = engine.get_face_embedding(frame)
    if emb is None:
        print("No face detected in the image.")
        return

    # 5) match against DB
    username, score = find_best_match(emb, db, threshold=0.45)

    if username is None:
        print(f"No match found (best similarity = {score:.3f})")
    else:
        print(f"Recognized user: {username} (similarity = {score:.3f})")





def recognize_from_webcam():
    db = load_face_db(DB_PATH)
    engine = FaceEngine(
        detector_path="models/scrfd_10g_bnkps.onnx",
        recognizer_path="models/w600k_r50.onnx",
        ctx_id=0,
        det_input_size=(640, 640)
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Cannot open camera")
        return

    print("Press SPACE to capture a frame, ESC to exit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to read frame from camera.")
            break

        cv2.imshow("Recognition", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == 27:  # ESC
            break

        if key == 32:  # SPACE
            emb = engine.get_face_embedding(frame)
            if emb is None:
                print("No face detected, try again.")
                continue

            username, score = find_best_match(emb, db, threshold=0.45)
            if username is None:
                print(f"No match found (best similarity = {score:.3f})")
            else:
                print(f"Recognized user: {username} (similarity = {score:.3f})")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    # if len(sys.argv) < 2:
    #     print("Usage: python recognize_image.py path/to/image.jpg")
    #     sys.exit(1)

    # img_path = sys.argv[1]
    recognize_from_webcam()