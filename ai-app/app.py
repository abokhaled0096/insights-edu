import os

from flask import Flask, request, jsonify, render_template
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid
import pandas as pd

from model import verify_face, register_student

app = Flask(__name__)

DATABASE_URL = "postgresql://postgres:2026@localhost:5432/insight_edu"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_PATH = os.path.join(BASE_DIR, "attendance_log.csv")

# Device IP → Session ID mapping
device_to_session = {}


def get_conn():
    return psycopg2.connect(DATABASE_URL)


# =====================================
# Start Session (per-course, not global)
# =====================================
@app.route("/start-session", methods=["POST"])
def start_session():
    conn = None
    try:
        data = request.get_json()
        course_id = data.get("courseId")
        device_ip = data.get("deviceIp", "").strip()

        if not course_id:
            return jsonify({"success": False, "message": "courseId required"}), 400

        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            UPDATE "AttendanceSession"
            SET active = false,
                "endedAt" = NOW(),
                "updatedAt" = NOW()
            WHERE active = true AND "courseId" = %s
        """, (course_id,))

        session_id = str(uuid.uuid4())

        cur.execute("""
            INSERT INTO "AttendanceSession"
            (id, "courseId", active, "startedAt", "createdAt", "updatedAt")
            VALUES (%s, %s, true, NOW(), NOW(), NOW())
        """, (session_id, course_id))

        conn.commit()

        if device_ip:
            device_to_session[device_ip] = session_id

        cur.close()

        return jsonify({
            "success": True,
            "message": "Session started",
            "sessionId": session_id
        })

    except Exception as e:
        print("Start Session Error:", e)
        return jsonify({"success": False, "message": "Internal error"}), 500

    finally:
        if conn:
            conn.close()


# =====================================
# End Session (by ID, not all)
# =====================================
@app.route("/end-session", methods=["POST"])
def end_session():
    conn = None
    try:
        data = request.get_json() or {}
        session_id = data.get("sessionId")

        conn = get_conn()
        cur = conn.cursor()

        if session_id:
            cur.execute("""
                UPDATE "AttendanceSession"
                SET active = false,
                    "endedAt" = NOW(),
                    "updatedAt" = NOW()
                WHERE id = %s AND active = true
            """, (session_id,))
        else:
            cur.execute("""
                UPDATE "AttendanceSession"
                SET active = false,
                    "endedAt" = NOW(),
                    "updatedAt" = NOW()
                WHERE active = true
            """)

        conn.commit()
        cur.close()

        # Remove device mappings for this session
        to_remove = [ip for ip, sid in device_to_session.items() if sid == session_id]
        for ip in to_remove:
            del device_to_session[ip]

        return jsonify({"success": True, "message": "Session ended"})

    except Exception as e:
        print("End Session Error:", e)
        return jsonify({"success": False, "message": "Internal error"}), 500

    finally:
        if conn:
            conn.close()


# =====================================
# Select Session (bind device to session)
# =====================================
@app.route("/select-session", methods=["POST"])
def select_session():
    data = request.get_json()
    session_id = data.get("sessionId")
    device_ip = data.get("deviceIp", "").strip()

    if not session_id or not device_ip:
        return jsonify({"success": False, "message": "sessionId and deviceIp required"}), 400

    device_to_session[device_ip] = session_id

    return jsonify({
        "success": True,
        "message": f"Device {device_ip} linked to session {session_id}"
    })


# =====================================
# Get Device Mappings (for dashboard)
# =====================================
@app.route("/device-sessions")
def get_device_sessions():
    return jsonify(device_to_session)


# =====================================
# Home
# =====================================
@app.route("/")
def home():
    return render_template("index.html")


# =====================================
# Register Page
# =====================================
@app.route("/register_page")
def register_page():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT id, name, "studentCode"
        FROM "User"
        WHERE role='STUDENT'
        ORDER BY name
    """)

    students = cur.fetchall()

    cur.close()
    conn.close()

    return render_template("register.html", students=students)


# =====================================
# Register User
# =====================================
@app.route("/register_user", methods=["POST"])
def register_user():
    student_id = request.form["student_id"]
    rfid_code = request.form["rfid_code"]

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT id, name
        FROM "User"
        WHERE id=%s
    """, (student_id,))

    student = cur.fetchone()

    if not student:
        return "Student not found"

    ok = register_student(student["name"])

    if not ok:
        return "No face detected"

    cur.execute("""
        UPDATE "User"
        SET "studentCode"=%s
        WHERE id=%s
    """, (rfid_code, student_id))

    conn.commit()

    cur.close()
    conn.close()

    return f'{student["name"]} Registered'


# =====================================
# Scan Card
# =====================================
@app.route("/scan-card", methods=["POST"])
def scan_card():
    conn = None
    try:
        data = request.get_json()
        student_code = data.get("studentCode")
        sender_ip = request.remote_addr

        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Find student by RFID code
        cur.execute("""
            SELECT id, name, "studentCode"
            FROM "User"
            WHERE "studentCode"=%s
        """, (student_code,))

        student = cur.fetchone()

        if not student:
            return jsonify({"success": False, "message": "Student not found"})

        # Verify face (skip if test header present)
        mock_header = request.headers.get("X-Mock-Face", "").lower()
        if mock_header == "true":
            matched = True
        else:
            matched = verify_face(student["name"])

        if not matched:
            return jsonify({"success": False, "message": "Face denied"})

        # Get session: device mapping first, fallback to any active
        session_id = device_to_session.get(sender_ip)

        if session_id:
            cur.execute("""
                SELECT id, "courseId"
                FROM "AttendanceSession"
                WHERE id = %s AND active = true
            """, (session_id,))
        else:
            cur.execute("""
                SELECT id, "courseId"
                FROM "AttendanceSession"
                WHERE active = true
                ORDER BY "startedAt" DESC
                LIMIT 1
            """)

        active_session = cur.fetchone()

        if not active_session:
            return jsonify({"success": False, "message": "No active session"})

        # Check duplicate: same student + same session
        cur.execute("""
            SELECT id FROM "Attendance"
            WHERE "studentId" = %s AND "sessionId" = %s
        """, (student["id"], active_session["id"]))

        if cur.fetchone():
            return jsonify({
                "success": False,
                "message": "Already recorded"
            })

        # Record attendance
        attendance_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO "Attendance"
            (id, "studentId", "courseId", "sessionId", "cardId", "faceMatched", "status", "date")
            VALUES (%s, %s, %s, %s, %s, true, 'PRESENT', NOW())
        """, (attendance_id, student["id"], active_session["courseId"], active_session["id"], student_code))
        conn.commit()

        # Append to CSV log
        from datetime import datetime
        log_entry = pd.DataFrame([{
            "Name": student["name"],
            "Login": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Duration": ""
        }])
        if os.path.exists(LOG_PATH):
            log_entry.to_csv(LOG_PATH, mode="a", header=False, index=False)
        else:
            log_entry.to_csv(LOG_PATH, index=False)

        return jsonify({
            "success": True,
            "message": "Attendance success",
            "name": student["name"]
        })

    except Exception as e:
        print("Scan Card Error:", e)
        return jsonify({"success": False, "message": "Internal error"}), 500

    finally:
        if conn:
            conn.close()


# =====================================
# Dashboard
# =====================================
@app.route("/dashboard")
def dashboard():
    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if not os.path.exists(LOG_PATH):
            df = pd.DataFrame(columns=["Name", "Login", "Duration"])
            df.to_csv(LOG_PATH, index=False)

        df = pd.read_csv(LOG_PATH)
        df.fillna("-", inplace=True)

        table = df.to_html(
            classes="table table-striped table-bordered table-hover",
            index=False
        )

        cur.execute("""
            SELECT id, name, code
            FROM "Course"
            ORDER BY name ASC
        """)
        courses = cur.fetchall()

        # Get ALL active sessions (not just one)
        cur.execute("""
            SELECT
                s.id,
                s."startedAt",
                c.name AS course_name,
                c.code AS course_code
            FROM "AttendanceSession" s
            JOIN "Course" c ON c.id = s."courseId"
            WHERE s.active = true
            ORDER BY s."startedAt" DESC
        """)
        active_sessions = cur.fetchall()

        cur.close()
        conn.close()

        return render_template(
            "dashboard.html",
            table=table,
            courses=courses,
            active_sessions=active_sessions,
            device_map=device_to_session
        )

    except Exception as e:
        print("Dashboard Error:", e)

        return render_template(
            "dashboard.html",
            table="<p>Error loading dashboard</p>",
            courses=[],
            active_sessions=[],
            device_map={}
        )


# =====================================
# Delete Student Face Data
# =====================================
@app.route("/delete-student-face", methods=["POST"])
def delete_student_face():
    conn = None
    try:
        data = request.get_json()
        student_name = data.get("name", "").strip()

        # If caller sent student_id instead of name, look up the name
        if not student_name:
            student_id = data.get("student_id", "").strip()
            if student_id:
                conn = get_conn()
                cur = conn.cursor(cursor_factory=RealDictCursor)
                cur.execute('SELECT name FROM "User" WHERE id=%s', (student_id,))
                row = cur.fetchone()
                cur.close()
                if row and row["name"]:
                    student_name = row["name"]

        if not student_name:
            return jsonify({"success": False, "message": "name required"}), 400

        from model import delete_face_data
        deleted = delete_face_data(student_name)

        return jsonify({
            "success": True,
            "message": f"Face data deleted for {student_name}",
            "details": deleted
        })

    except Exception as e:
        print("Delete Face Data Error:", e)
        return jsonify({"success": False, "message": "Internal error"}), 500

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
