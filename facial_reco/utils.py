# utils.py
import os
import numpy as np
import cv2

from insightface.model_zoo import get_model
from insightface.utils.face_align import norm_crop

import json  # if you put them in utils.py


class FaceEngine:
    def __init__(self,
                 detector_path: str = "models/scrfd_10g_bnkps.onnx",
                 recognizer_path: str = "models/w600k_r50.onnx",
                 ctx_id: int = 0,
                 det_input_size=(640, 640)
                 ):
        # remember the detector input size for later
        self.det_input_size = det_input_size

        # --- load detector (SCRFD / RetinaFace) ---
        if not os.path.exists(detector_path):
            raise FileNotFoundError(f"Face detector ONNX not found at {detector_path}")
        self.detector = get_model(detector_path)
        # set detection size and threshold here
        self.detector.prepare(
            ctx_id=ctx_id,
            input_size=det_input_size,
            det_thresh=0.5  # this replaces the 'threshold' you were passing to detect()
        )

        # --- load recognizer (ArcFace R50) ---
        if not os.path.exists(recognizer_path):
            raise FileNotFoundError(f"Recognizer ONNX not found at {recognizer_path}")
        self.recognizer = get_model(recognizer_path)
        self.recognizer.prepare(ctx_id=ctx_id)


    def detect_largest_face(self, bgr_frame):
        """
        Returns (bbox, kps) for the largest face.
        bbox: [x1, y1, x2, y2, score]
        kps: 5x2 landmarks (left eye, right eye, nose, left mouth, right mouth)
        """
        # SCRFD expects BGR numpy image
        dets = self.detector.detect(
        bgr_frame,
        input_size=self.det_input_size,
        max_num=0
    )   
        if dets is None or len(dets) == 0:
            return None, None
        # dets is (bboxes, kpss)
        bboxes, kpss = dets
        if bboxes is None or len(bboxes) == 0:
            return None, None

        # pick largest by area
        areas = (bboxes[:,2] - bboxes[:,0]) * (bboxes[:,3] - bboxes[:,1])
        idx = int(np.argmax(areas))
        return bboxes[idx], kpss[idx]

    def get_face_embedding(self, bgr_frame):
        """
        Detects + aligns the largest face and returns a 512-D L2-normalized embedding (np.ndarray).
        Returns None if no face.
        """
        bbox, kps = self.detect_largest_face(bgr_frame)
        if bbox is None or kps is None:
            return None

        # Align/crop to ArcFace input (112x112 by default)
        aligned = norm_crop(bgr_frame, landmark=kps)  # returns BGR 112x112

        # ArcFace expects RGB float32 normalized to [-1,1] inside insightface get_feat
        # get_feat handles preproc internally, so just pass aligned (BGR is fine)
        feat = self.recognizer.get_feat(aligned)
        # Ensure L2-normalized (most ArcFace models already return normalized; still safe)
        norm = np.linalg.norm(feat)
        if norm > 0:
            feat = feat / norm
        return feat.astype(np.float32)

def average_embeddings(emb_list):
    """
    Average a list of 512-D embeddings and L2-normalize the result.
    """
    if len(emb_list) == 0:
        return None
    mean_vec = np.mean(np.stack(emb_list, axis=0), axis=0)
    norm = np.linalg.norm(mean_vec)
    if norm > 0:
        mean_vec = mean_vec / norm
    return mean_vec.astype(np.float32)




def load_face_db(db_path: str):
    """
    Load face database JSON.

    Returns: dict[str, dict]  (username -> record)
    """
    with open(db_path, "r", encoding="utf-8") as f:
        db = json.load(f)
    return db


def _to_vec(arr):
    """Convert stored embedding (list or list-of-lists) to 1D numpy vector."""
    v = np.array(arr, dtype=np.float32)
    if v.ndim == 2:
        # e.g. multiple samples -> average
        v = v.mean(axis=0)
    return v


def find_best_match(query_emb: np.ndarray,
                    db: dict,
                    threshold: float = 0.45):
    """
    Given a query embedding and DB, return (username, similarity) or (None, None).

    Uses cosine similarity. threshold is on similarity in [0,1].
    """
    if query_emb is None:
        return None, None

    # normalize query
    q = query_emb.astype(np.float32)
    q_norm = np.linalg.norm(q)
    if q_norm == 0:
        return None, None
    q = q / q_norm

    best_user = None
    best_sim = -1.0

    for username, record in db.items():
        if "embedding" not in record:
            continue

        ref = _to_vec(record["embedding"])
        if ref.size != q.size:
            # skip mismatched dimension
            continue

        r_norm = np.linalg.norm(ref)
        if r_norm == 0:
            continue
        ref_n = ref / r_norm

        sim = float(np.dot(q, ref_n))   # cosine similarity

        if sim > best_sim:
            best_sim = sim
            best_user = username

    # apply threshold
    if best_user is None or best_sim < threshold:
        return None, best_sim

    return best_user, best_sim
