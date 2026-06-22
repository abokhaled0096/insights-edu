import os

from flask import Flask, request, jsonify, render_template
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid
import pandas as pd

from model import verify_face, register_student

app = Flask(__name__)

DATABASE_URL = "postgresql://postgres:2026@localhost:5432/insight_edu"


def get_conn():
    return psycopg2.connect(DATABASE_URL)


# =====================================
# Start Session
# =====================================
@app.route("/start-session", methods=["POST"])
def start_session():
    try:
        data = request.get_json()

        course_id = data.get("courseId")

        if not course_id:
            return jsonify({
                "success": False,
                "message": "courseId required"
            }), 400

        conn = get_conn()
        cur = conn.cursor()

        # close old active session
        cur.execute("""
            UPDATE "AttendanceSession"
            SET active = false,
                "endedAt" = NOW(),
                "updatedAt" = NOW()
            WHERE active = true
        """)

        session_id = str(uuid.uuid4())

        cur.execute("""
            INSERT INTO "AttendanceSession"
            (
                id,
                "courseId",
                active,
                "startedAt",
                "createdAt",
                "updatedAt"
            )
            VALUES
            (
                %s,
                %s,
                true,
                NOW(),
                NOW(),
                NOW()
            )
        """, (
            session_id,
            course_id
        ))

        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Session started"
        })

    except Exception as e:
        print("Start Session Error:", e)

        return jsonify({
            "success": False,
            "message": "Internal error"
        }), 500
# =====================================
# End Session
# =====================================
@app.route("/end-session", methods=["POST"])
def end_session():
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("""
            UPDATE "AttendanceSession"
            SET active = false,
                "endedAt" = NOW(),
                "updatedAt" = NOW()
            WHERE active = true
        """)

        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Session ended"
        })

    except Exception as e:
        print("End Session Error:", e)

        return jsonify({
            "success": False
        }), 500
    

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
        SELECT id,name
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

        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT id, name, "studentCode"
            FROM "User"
            WHERE "studentCode"=%s
        """, (student_code,))

        student = cur.fetchone()

        if not student:
            return jsonify({
                "success": False,
                "message": "Student not found"
            })

        matched = verify_face(student["name"])

        if not matched:
            return jsonify({
                "success": False,
                "message": "Face denied"
            })

        # Record attendance in the active session
        cur.execute("""
            SELECT id
            FROM "AttendanceSession"
            WHERE active = true
            ORDER BY "startedAt" DESC
            LIMIT 1
        """)
        active_session = cur.fetchone()

        if active_session:
            attendance_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO "Attendance"
                (id, "userId", "sessionId", "status", "verifiedAt", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, 'PRESENT', NOW(), NOW(), NOW())
                ON CONFLICT DO NOTHING
            """, (attendance_id, student["id"], active_session["id"]))
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
        return jsonify({
            "success": False,
            "message": "Internal error"
        }), 500

    finally:
        if conn:
            conn.close()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

LOG_PATH = os.path.join(BASE_DIR, "attendance_log.csv")


@app.route("/dashboard")
def dashboard():
    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ==========================
        # Logs CSV
        # ==========================
        if not os.path.exists(LOG_PATH):
            df = pd.DataFrame(
                columns=["Name", "Login", "Duration"]
            )
            df.to_csv(LOG_PATH, index=False)

        df = pd.read_csv(LOG_PATH)

        table = df.to_html(
            classes="table table-striped table-bordered table-hover",
            index=False
        )

        # ==========================
        # Courses
        # ==========================
        cur.execute("""
            SELECT id, name, code
            FROM "Course"
            ORDER BY name ASC
        """)

        courses = cur.fetchall()

        # ==========================
        # Active Session
        # ==========================
        cur.execute("""
            SELECT
                s.id,
                s."startedAt",
                c.name AS course_name,
                c.code AS course_code
            FROM "AttendanceSession" s
            JOIN "Course" c
                ON c.id = s."courseId"
            WHERE s.active = true
            ORDER BY s."startedAt" DESC
            LIMIT 1
        """)

        active_session = cur.fetchone()

        cur.close()
        conn.close()

        return render_template(
            "dashboard.html",
            table=table,
            courses=courses,
            active_session=active_session
        )

    except Exception as e:
        print("Dashboard Error:", e)

        return render_template(
            "dashboard.html",
            table="<p>Error loading dashboard</p>",
            courses=[],
            active_session=None
        )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)