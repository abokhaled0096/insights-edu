/**
 * InsightsEdu - Integration Test & System Health Report
 * =====================================================
 * Validates all modified components after the B.txt refactoring.
 * Run: npx tsx scripts/integration-test.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PASS = "✅ PASS";
const FAIL = "❌ FAIL";
const WARN = "⚠️  WARN";

let passed = 0;
let failed = 0;
let warnings = 0;

function report(label: string, ok: boolean, detail?: string) {
  if (ok) {
    console.log(`  ${PASS}  ${label}${detail ? ` — ${detail}` : ""}`);
    passed++;
  } else {
    console.log(`  ${FAIL}  ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function warn(label: string, detail?: string) {
  console.log(`  ${WARN}  ${label}${detail ? ` — ${detail}` : ""}`);
  warnings++;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   InsightsEdu — Integration Test & System Health Report ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // ─── 1. Database Connection ───────────────────────────────────────────
  console.log("── 1. Database Connection ──");
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    report("PostgreSQL connection", true);
  } catch (e: any) {
    report("PostgreSQL connection", false, e.message);
    console.log("\n⛔ Cannot proceed without database. Exiting.\n");
    process.exit(1);
  }

  // ─── 2. Schema Validation — New Fields ────────────────────────────────
  console.log("\n── 2. Schema Validation (New Fields) ──");

  // Check Role enum includes TA
  try {
    const roles = await prisma.$queryRawUnsafe<any[]>(
      `SELECT unnest(enum_range(NULL::"Role"))::text AS role`
    );
    const roleNames = roles.map((r: any) => r.role);
    report("Role enum includes TA", roleNames.includes("TA"), `Roles: ${roleNames.join(", ")}`);
    report("Role enum includes ADVISOR", roleNames.includes("ADVISOR"));
    report("Role enum includes TEACHER", roleNames.includes("TEACHER"));
    report("Role enum includes STUDENT", roleNames.includes("STUDENT"));
    report("Role enum includes ADMIN", roleNames.includes("ADMIN"));
  } catch (e: any) {
    report("Role enum check", false, e.message);
  }

  // Check requirePasswordChange column exists
  try {
    const cols = await prisma.$queryRawUnsafe<any[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'requirePasswordChange'`
    );
    report("User.requirePasswordChange column exists", cols.length > 0);
  } catch (e: any) {
    report("User.requirePasswordChange column", false, e.message);
  }

  // Check AttendanceSession.expiresAt column exists
  try {
    const cols = await prisma.$queryRawUnsafe<any[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'AttendanceSession' AND column_name = 'expiresAt'`
    );
    report("AttendanceSession.expiresAt column exists", cols.length > 0);
  } catch (e: any) {
    report("AttendanceSession.expiresAt column", false, e.message);
  }

  // ─── 3. Route File Existence ──────────────────────────────────────────
  console.log("\n── 3. Route File Existence (Student 404 Fixes) ──");
  const fs = await import("fs");
  const path = await import("path");
  const root = path.resolve(__dirname, "..");

  const requiredRoutes = [
    "app/(dashboard)/student/courses/page.tsx",
    "app/(dashboard)/student/attendance/page.tsx",
    "app/(dashboard)/student/results/page.tsx",
    "app/(dashboard)/student/page.tsx",
    "app/(dashboard)/student/activities/page.tsx",
    "app/(dashboard)/student/assignments/page.tsx",
    "app/(dashboard)/student/exams/page.tsx",
    "app/(dashboard)/admin/users/new/page.tsx",
    "app/(auth)/force-password-change/page.tsx",
    "app/(auth)/register/page.tsx",
    "app/(auth)/login/page.tsx",
  ];

  for (const route of requiredRoutes) {
    const exists = fs.existsSync(path.join(root, route));
    report(`Route: ${route}`, exists);
  }

  // ─── 4. Component File Existence ──────────────────────────────────────
  console.log("\n── 4. Component File Existence ──");
  const requiredComponents = [
    "components/dashboard/student/courses-client.tsx",
    "components/dashboard/student/attendance-client.tsx",
    "components/dashboard/admin/create-user-form.tsx",
  ];

  for (const comp of requiredComponents) {
    const exists = fs.existsSync(path.join(root, comp));
    report(`Component: ${comp}`, exists);
  }

  // ─── 5. Server Action Existence ───────────────────────────────────────
  console.log("\n── 5. Server Action Existence ──");
  const requiredActions = [
    "app/actions/admin/create-user.ts",
    "app/actions/force-change-password.ts",
  ];

  for (const action of requiredActions) {
    const exists = fs.existsSync(path.join(root, action));
    report(`Action: ${action}`, exists);
  }

  // ─── 6. Security: Public Registration Blocked ─────────────────────────
  console.log("\n── 6. Security: Public Registration Blocked ──");
  const registerAction = fs.readFileSync(path.join(root, "app/actions/register.ts"), "utf-8");
  report(
    "registerUser action blocks public registration",
    registerAction.includes("التسجيل العام مغلق")
  );

  const registerPage = fs.readFileSync(path.join(root, "app/(auth)/register/page.tsx"), "utf-8");
  report(
    "Register page shows blocked message",
    registerPage.includes("التسجيل مغلق") || registerPage.includes("التسجيل العام مغلق")
  );

  // ─── 7. Auth Config Validation ────────────────────────────────────────
  console.log("\n── 7. Auth Config Validation ──");
  const authFile = fs.readFileSync(path.join(root, "auth.ts"), "utf-8");
  report("auth.ts includes requirePasswordChange in JWT callback", authFile.includes("requirePasswordChange"));
  report("auth.ts includes TA role helper (isTA)", authFile.includes("isTA"));
  report("auth.ts includes isTeacherOrTA helper", authFile.includes("isTeacherOrTA"));
  report("auth.ts session callback passes requirePasswordChange", authFile.includes("session.user.requirePasswordChange"));

  // ─── 8. Dashboard Layout Force Password Change ────────────────────────
  console.log("\n── 8. Dashboard Layout — Force Password Change ──");
  const dashLayout = fs.readFileSync(path.join(root, "app/(dashboard)/layout.tsx"), "utf-8");
  report(
    "Dashboard layout redirects on requirePasswordChange",
    dashLayout.includes("requirePasswordChange") && dashLayout.includes("force-password-change")
  );

  // ─── 9. Sidebar TA Menu ───────────────────────────────────────────────
  console.log("\n── 9. Sidebar TA Menu ──");
  const layoutClient = fs.readFileSync(path.join(root, "components/dashboard/layout-client.tsx"), "utf-8");
  report("Layout client includes TA role type", layoutClient.includes('"TA"'));
  report("Layout client has TA menu group (grp-ta)", layoutClient.includes("grp-ta"));

  // ─── 10. Attendance Session Expiration ────────────────────────────────
  console.log("\n── 10. Attendance Session Expiration ──");
  const attendanceAction = fs.readFileSync(path.join(root, "app/actions/teacher/attendance.ts"), "utf-8");
  report("Attendance action sets 15-min expiresAt", attendanceAction.includes("15 * 60 * 1000"));

  const scanRoute = fs.readFileSync(path.join(root, "app/api/attendance/scan/route.ts"), "utf-8");
  report("Scan API checks session expiration", scanRoute.includes("expiresAt") && scanRoute.includes("expired"));

  // ─── 11. Prisma Schema Integrity ──────────────────────────────────────
  console.log("\n── 11. Prisma Schema Integrity ──");
  const schema = fs.readFileSync(path.join(root, "prisma/schema.prisma"), "utf-8");
  report("Schema has TA in Role enum", schema.includes("TA"));
  report("Schema has requirePasswordChange field", schema.includes("requirePasswordChange"));
  report("Schema has expiresAt in AttendanceSession", schema.includes("expiresAt"));

  // ─── 12. Data Integrity Spot Check ────────────────────────────────────
  console.log("\n── 12. Data Integrity Spot Check ──");
  try {
    const userCount = await prisma.user.count();
    report("Users table accessible", userCount >= 0, `${userCount} users`);

    const courseCount = await prisma.course.count();
    report("Courses table accessible", courseCount >= 0, `${courseCount} courses`);

    const sessionCount = await prisma.attendanceSession.count();
    report("AttendanceSession table accessible", sessionCount >= 0, `${sessionCount} sessions`);
  } catch (e: any) {
    report("Data integrity check", false, e.message);
  }

  // ─── 13. E2E Attendance Scan & Dashboard Sync Check ────────────────────
  console.log("\n── 13. E2E Attendance Scan & Dashboard Sync Check ──");
  let flaskProc: any = null;
  try {
    // 1. Get/create a test student
    let student = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
        NOT: { studentCode: null }
      }
    });

    if (!student) {
      // Find any student and assign a student code
      const anyStudent = await prisma.user.findFirst({
        where: { role: "STUDENT" }
      });
      if (!anyStudent) {
        throw new Error("No student found in the database. Please run seed first.");
      }
      student = await prisma.user.update({
        where: { id: anyStudent.id },
        data: { studentCode: "TEST-RFID-UID" }
      });
    }

    const studentCode = student.studentCode!;

    // 2. Find or create a course and enrollment
    let course = await prisma.course.findFirst({
      where: {
        students: {
          some: {
            studentId: student.id
          }
        }
      }
    });

    if (!course) {
      const anyCourse = await prisma.course.findFirst();
      if (!anyCourse) {
        throw new Error("No course found in the database. Please run seed first.");
      }
      course = anyCourse;
      // Enroll student
      await prisma.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id
          }
        },
        update: {},
        create: {
          studentId: student.id,
          courseId: course.id
        }
      });
    }

    // 3. Close existing active sessions first to avoid conflicts, then start a new session
    await prisma.attendanceSession.updateMany({
      where: { active: true },
      data: { active: false, endedAt: new Date() }
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const session = await prisma.attendanceSession.create({
      data: {
        courseId: course.id,
        active: true,
        expiresAt
      }
    });

    // Delete any existing attendance record for this student and session to ensure a clean test
    await prisma.attendance.deleteMany({
      where: {
        studentId: student.id,
        sessionId: session.id
      }
    });

    // Get initial attendance count for student
    const initialCount = await prisma.attendance.count({
      where: { studentId: student.id, status: "PRESENT" }
    });

    // 4. Start the Flask application in the background
    console.log("  Launching Flask server in background...");
    const { spawn } = await import("child_process");
    flaskProc = spawn("python", ["ai-app/app.py"], {
      env: { ...process.env, NEXT_API_URL: "http://localhost:3000/api/attendance/scan" },
      shell: true
    });

    // Wait for Flask to start by polling
    console.log("  Waiting for Flask server to become ready...");
    let ready = false;
    for (let i = 0; i < 20; i++) {
      try {
        const checkRes = await fetch("http://127.0.0.1:5000/");
        if (checkRes.status === 200) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!ready) {
      throw new Error("Flask server failed to start or bind within 20 seconds.");
    }
    console.log("  Flask server is ready!");

    // 5. Perform the E2E HTTP scan request through the Flask IoT bridge
    console.log(`  Sending card scan request for student: ${student.name} (${studentCode})...`);
    const scanResponse = await fetch("http://127.0.0.1:5000/scan-card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Mock-Face": "true"
      },
      body: JSON.stringify({
        studentCode
      })
    });

    const scanResult: any = await scanResponse.json();
    report("Scan request HTTP status is 200", scanResponse.status === 200, `Status: ${scanResponse.status}`);
    report("Scan response verification status is true", scanResult.success === true, `Message: ${scanResult.message}`);

    // 6. Verify that the attendance record was saved in the unified PostgreSQL database
    const finalAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: student.id,
        sessionId: session.id
      }
    });

    report("Attendance record committed to PostgreSQL", !!finalAttendance, `Attendance ID: ${finalAttendance?.id || "None"}`);
    if (finalAttendance) {
      report("Attendance record status is PRESENT", finalAttendance.status === "PRESENT");
      report("Attendance record courseId matches session", finalAttendance.courseId === course.id);
      report("Attendance record cardId matches scanned UID", finalAttendance.cardId === studentCode);
    }

    // 7. Verify the Student Dashboard reflects the live attendance rate / count immediately
    const finalCount = await prisma.attendance.count({
      where: { studentId: student.id, status: "PRESENT" }
    });
    report("Live student attendance rate incremented immediately", finalCount === initialCount + 1, `Count: ${initialCount} -> ${finalCount}`);

  } catch (e: any) {
    report("E2E Scan & Sync Integration Check", false, e.message);
  } finally {
    if (flaskProc) {
      console.log("  Stopping Flask server...");
      flaskProc.kill();
      // On Windows, shell spawned processes might need a taskkill
      try {
        const { execSync } = await import("child_process");
        execSync("taskkill /F /IM python.exe /T", { stdio: "ignore" });
      } catch {}
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║                    TEST SUMMARY                         ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  ${PASS}  Passed:   ${String(passed).padStart(3)}                                  ║`);
  console.log(`║  ${FAIL}  Failed:   ${String(failed).padStart(3)}                                  ║`);
  console.log(`║  ${WARN}  Warnings: ${String(warnings).padStart(3)}                                  ║`);
  console.log("╠══════════════════════════════════════════════════════════╣");

  if (failed === 0) {
    console.log("║  🎉 ALL TESTS PASSED — System is healthy!               ║");
  } else {
    console.log("║  ⚠️  Some tests failed — review output above.           ║");
  }

  console.log("╚══════════════════════════════════════════════════════════╝\n");

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
