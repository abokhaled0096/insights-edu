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
# Features
# =========================
def extract_features(frame):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = face_mesh.process(rgb)

    if not results.multi_face_landmarks:
        return None

    landmarks = []

    for i in range(468):
        lm = results.multi_face_landmarks[0].landmark[i]
        landmarks.append([lm.x, lm.y, lm.z])

    f1 = np.array(landmarks)

    centered = f1 - f1[1]

    distance = np.linalg.norm(f1[33] - f1[263])

    if distance == 0:
        return None

    normalized = centered / distance

    return normalized.flatten().tolist()


# =========================
# Train
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

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=35,
        random_state=42
    )

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
# Predict
# =========================
def predict_name(frame):
    load_model()

    if model is None:
        return None

    features = extract_features(frame)

    if features is None:
        return None

    X = pd.DataFrame([features])

    probs = model.predict_proba(X)[0]

    idx = np.argmax(probs)

    confidence = probs[idx]

    if confidence < 0.75:
        return None

    return str(model.classes_[idx])


# =========================
# Verify
# =========================
def verify_face(expected_name, attempts=3):
    import time

    for i in range(attempts):
        frame = get_frame()

        if frame is None:
            time.sleep(0.5)
            continue

        predicted = predict_name(frame)

        if predicted and predicted.strip().lower() == expected_name.strip().lower():
            return True

        time.sleep(0.3)

    return False


# =========================
# Register Face
# =========================
def register_student(label_name, samples=50):
    import time

    rows = []

    for _ in range(samples):

        frame = get_frame()

        if frame is None:
            time.sleep(0.3)
            continue

        features = extract_features(frame)

        if features is None:
            continue

        rows.append(features + [label_name])

        time.sleep(0.15)

    if len(rows) == 0:
        return False

    cols = [str(i) for i in range(1404)] + ["name"]

    new_df = pd.DataFrame(rows, columns=cols)

    if os.path.exists(DATASET_PATH):
        old = pd.read_csv(DATASET_PATH)
        df = pd.concat([old, new_df], ignore_index=True)
    else:
        df = new_df

    df.to_csv(DATASET_PATH, index=False)

    retrain_model()

    return True