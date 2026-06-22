import os
import cv2
import pickle
import requests
import mediapipe as mp
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "face_mesh_dataset2.csv")
MODEL_PATH = os.path.join(BASE_DIR, "randomForest.plk")
FACES_DIR = os.path.join(BASE_DIR, "registered_faces")

ESP32_CAM_URL = "http://10.123.127.60/capture"

# =========================
# MediaPipe
# =========================
mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=False,
    min_detection_confidence=0.5,
)

model = None


# =========================
# Camera
# =========================
def get_frame():
    try:
        r = requests.get(ESP32_CAM_URL, timeout=5)
        if r.status_code != 200:
            return None
        img_arr = np.frombuffer(r.content, np.uint8)
        frame = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
        frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
        return frame
    except:
        return None


# =========================
# Single MediaPipe pass per frame
# =========================
def process_frame(frame):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    if not results.multi_face_landmarks:
        return None, None

    face_lms = results.multi_face_landmarks[0].landmark

    # --- Landmark features ---
    raw = np.array([[face_lms[i].x, face_lms[i].y, face_lms[i].z] for i in range(468)])
    centered = raw - raw[1]
    eye_dist = np.linalg.norm(raw[33] - raw[263])
    if eye_dist == 0:
        return None, None
    features = (centered / eye_dist).flatten().tolist()

    # --- Face crop ---
    h, w = frame.shape[:2]
    xs = [int(lm.x * w) for lm in face_lms]
    ys = [int(lm.y * h) for lm in face_lms]
    x1, x2 = min(xs), max(xs)
    y1, y2 = min(ys), max(ys)
    pad_x = int(0.15 * (x2 - x1))
    pad_y = int(0.15 * (y2 - y1))
    x1, y1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
    x2, y2 = min(w, x2 + pad_x), min(h, y2 + pad_y)
    face = frame[y1:y2, x1:x2]
    if face.size == 0:
        return features, None
    gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
    face_crop = cv2.equalizeHist(cv2.resize(gray, (128, 128)))

    return features, face_crop


# =========================
# LBP (Local Binary Patterns)
# =========================
def compute_lbp_histogram(image, grid_x=8, grid_y=8):
    h, w = image.shape
    img = image.astype(np.int16)
    padded = np.pad(img, 1, mode='edge')
    center = padded[1:-1, 1:-1]

    lbp = np.zeros_like(center, dtype=np.uint8)
    lbp |= (padded[:-2, :-2] >= center).astype(np.uint8) << 7
    lbp |= (padded[:-2, 1:-1] >= center).astype(np.uint8) << 6
    lbp |= (padded[:-2, 2:] >= center).astype(np.uint8) << 5
    lbp |= (padded[1:-1, 2:] >= center).astype(np.uint8) << 4
    lbp |= (padded[2:, 2:] >= center).astype(np.uint8) << 3
    lbp |= (padded[2:, 1:-1] >= center).astype(np.uint8) << 2
    lbp |= (padded[2:, :-2] >= center).astype(np.uint8) << 1
    lbp |= (padded[1:-1, :-2] >= center).astype(np.uint8) << 0

    cell_h = h // grid_y
    cell_w = w // grid_x
    descriptor = []

    for i in range(grid_y):
        for j in range(grid_x):
            cell = lbp[i * cell_h:(i + 1) * cell_h, j * cell_w:(j + 1) * cell_w]
            hist = np.histogram(cell, bins=256, range=(0, 256))[0].astype(np.float64)
            hist /= (hist.sum() + 1e-7)
            descriptor.extend(hist)

    return np.array(descriptor)


def save_lbp_descriptors(name, descriptors):
    os.makedirs(FACES_DIR, exist_ok=True)
    slug = name.strip().lower().replace(" ", "_")
    with open(os.path.join(FACES_DIR, f"{slug}.pkl"), "wb") as f:
        pickle.dump(descriptors, f)


def load_lbp_descriptors(name):
    slug = name.strip().lower().replace(" ", "_")
    path = os.path.join(FACES_DIR, f"{slug}.pkl")
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return pickle.load(f)


LBP_THRESHOLD = 0.42

def compare_lbp(desc1, desc2):
    d1 = desc1 - np.mean(desc1)
    d2 = desc2 - np.mean(desc2)
    den = np.sqrt(np.sum(d1 ** 2) * np.sum(d2 ** 2))
    if den < 1e-10:
        return 0.0
    return np.sum(d1 * d2) / den


def verify_by_lbp(face_crop, expected_name):
    stored = load_lbp_descriptors(expected_name)
    if stored is None or len(stored) == 0:
        return False, 0.0

    live_desc = compute_lbp_histogram(face_crop)
    scores = sorted([compare_lbp(live_desc, s) for s in stored], reverse=True)
    top = scores[:min(5, len(scores))]
    avg_score = np.mean(top)

    print(f"  LBP: best={scores[0]:.4f} avg_top5={avg_score:.4f} (need >{LBP_THRESHOLD})")
    return avg_score > LBP_THRESHOLD, avg_score


# =========================
# Landmark distance verify
# =========================
DIST_MIN_THRESH = 0.40
DIST_AVG_THRESH = 0.50

def verify_by_distance(features, expected_name):
    if not os.path.exists(DATASET_PATH):
        return False, 0.0

    df = pd.read_csv(DATASET_PATH)
    rows = df[df["name"].str.strip().str.lower() == expected_name.strip().lower()]
    if rows.empty:
        return False, 0.0

    stored = rows.drop("name", axis=1).values
    dists = np.linalg.norm(stored - np.array(features), axis=1)
    min_d, avg_d = np.min(dists), np.mean(dists)

    print(f"  Landmark: min={min_d:.4f} avg={avg_d:.4f} (need min<{DIST_MIN_THRESH} avg<{DIST_AVG_THRESH})")
    return min_d < DIST_MIN_THRESH and avg_d < DIST_AVG_THRESH, min_d


# =========================
# Train / Load
# =========================
def retrain_model():
    global model
    if not os.path.exists(DATASET_PATH):
        return False
    df = pd.read_csv(DATASET_PATH)
    if df.empty:
        return False
    X = df.drop("name", axis=1)
    y = df["name"]
    model = RandomForestClassifier(n_estimators=100, max_depth=35, random_state=42)
    model.fit(X, y)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    return True


def load_model():
    global model
    if model is not None:
        return
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
    else:
        retrain_model()


# =========================
# Predict (multi-class)
# =========================
def predict_name(frame):
    load_model()
    if model is None:
        return None
    features, _ = process_frame(frame)
    if features is None:
        return None
    if len(model.classes_) < 2:
        return None
    X = pd.DataFrame([features])
    probs = model.predict_proba(X)[0]
    idx = np.argmax(probs)
    confidence = probs[idx]
    print(f"  Predict: {model.classes_[idx]} ({confidence:.0%})")
    if confidence < 0.75:
        return None
    return str(model.classes_[idx])


# =========================
# Verify Face
# =========================
def verify_face(expected_name, attempts=3):
    import time

    load_model()
    has_lbp = load_lbp_descriptors(expected_name) is not None

    for i in range(attempts):
        print(f"--- Verify attempt {i+1}/{attempts} for {expected_name} ---")

        frame = get_frame()
        if frame is None:
            print("  No frame")
            time.sleep(0.3)
            continue

        features, face_crop = process_frame(frame)
        if features is None:
            print("  No face detected")
            time.sleep(0.2)
            continue

        if has_lbp and face_crop is not None:
            lbp_ok, lbp_score = verify_by_lbp(face_crop, expected_name)
            land_ok, land_dist = verify_by_distance(features, expected_name)
            print(f"  Result: LBP={'PASS' if lbp_ok else 'FAIL'} Landmark={'PASS' if land_ok else 'FAIL'}")

            # LBP is primary (appearance), landmark is secondary (geometry)
            if lbp_ok:
                return True
        else:
            single_class = model is not None and len(model.classes_) < 2
            if single_class:
                land_ok, _ = verify_by_distance(features, expected_name)
                if land_ok:
                    return True
            else:
                predicted = predict_name(frame)
                if predicted and predicted.strip().lower() == expected_name.strip().lower():
                    return True

        time.sleep(0.2)

    return False


# =========================
# Delete Face Data
# =========================
def delete_face_data(student_name):
    result = {"csv_rows_removed": 0, "lbp_deleted": False, "model_retrained": False}

    if os.path.exists(DATASET_PATH):
        df = pd.read_csv(DATASET_PATH)
        before = len(df)
        df = df[df["name"].str.strip().str.lower() != student_name.strip().lower()]
        removed = before - len(df)
        result["csv_rows_removed"] = removed
        if removed > 0:
            df.to_csv(DATASET_PATH, index=False)
            retrain_model()
            result["model_retrained"] = True

    slug = student_name.strip().lower().replace(" ", "_")
    lbp_path = os.path.join(FACES_DIR, f"{slug}.pkl")
    if os.path.exists(lbp_path):
        os.remove(lbp_path)
        result["lbp_deleted"] = True

    print(f"Deleted face data for {student_name}: {result}")
    return result


# =========================
# Register Face
# =========================
def register_student(label_name, samples=30):
    import time
    from concurrent.futures import ThreadPoolExecutor

    print(f"=== Registering {label_name} ({samples} samples) ===")

    # Capture frames fast using thread pool
    frames = []

    def capture():
        return get_frame()

    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = []
        for _ in range(samples):
            futures.append(pool.submit(capture))
            time.sleep(0.05)
        for f in futures:
            frame = f.result()
            if frame is not None:
                frames.append(frame)

    print(f"  Captured {len(frames)} frames")

    # Process all frames (single MediaPipe pass each)
    rows = []
    lbp_descriptors = []

    for frame in frames:
        features, face_crop = process_frame(frame)
        if features is None:
            continue
        rows.append(features + [label_name])
        if face_crop is not None:
            lbp_descriptors.append(compute_lbp_histogram(face_crop))

    if len(rows) == 0:
        print("  No faces detected!")
        return False

    print(f"  Processed {len(rows)} faces, {len(lbp_descriptors)} LBP descriptors")

    # Save landmark data
    cols = [str(i) for i in range(1404)] + ["name"]
    new_df = pd.DataFrame(rows, columns=cols)
    if os.path.exists(DATASET_PATH):
        old = pd.read_csv(DATASET_PATH)
        df = pd.concat([old, new_df], ignore_index=True)
    else:
        df = new_df
    df.to_csv(DATASET_PATH, index=False)

    # Save LBP descriptors
    if lbp_descriptors:
        save_lbp_descriptors(label_name, lbp_descriptors)

    retrain_model()
    print(f"=== Registration complete for {label_name} ===")
    return True
