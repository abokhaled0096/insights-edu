/**
 * InsightsEdu - Graduation Defense Presentation E2E Verification Suite
 * ====================================================================
 * Safe, isolated, non-destructive validation of all critical subsystems.
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { spawnSync } from "child_process";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PASS = "\x1b[32m✅ PASS\x1b[0m";
const FAIL = "\x1b[31m❌ FAIL\x1b[0m";

let passed = 0;
let failed = 0;

function report(label: string, ok: boolean, detail?: string) {
  if (ok) {
    console.log(`  ${PASS}  ${label}${detail ? ` - ${detail}` : ""}`);
    passed++;
  } else {
    console.log(`  ${FAIL}  ${label}${detail ? ` - ${detail}` : ""}`);
    failed++;
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("\n=======================================================");
  console.log("   InsightsEdu - E2E Presentation Verification Suite   ");
  console.log("=======================================================\n");

  let tempUserId: string | null = null;
  let tempSessionId: string | null = null;
  let tempCourseId: string | null = null;
  let deviceIp = "10.123.127.185";

  try {
    // =====================================================================
    // 1. Database & Prisma Health Check
    // =====================================================================
    console.log("1️⃣ Database Health & Setup");
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      report("PostgreSQL connection", true);
    } catch (e: any) {
      report("PostgreSQL connection", false, e.message);
      throw e;
    }

    // Create a safe mock user and course for testing
    const testCode = `TEST-RFID-${Date.now()}`;
    const user = await prisma.user.create({
      data: {
        name: "E2E Dummy Student",
        email: `dummy_${Date.now()}@insight.edu`,
        password: "hashed_pass_dummy",
        role: "STUDENT",
        studentCode: testCode,
      }
    });
    tempUserId = user.id;

    const course = await prisma.course.findFirst();
    if (!course) throw new Error("No course found to link dummy session.");
    tempCourseId = course.id;

    // Enroll mock user in mock course
    await prisma.enrollment.create({
      data: {
        studentId: tempUserId,
        courseId: tempCourseId
      }
    });

    const session = await prisma.attendanceSession.create({
      data: {
        courseId: tempCourseId,
        active: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    tempSessionId = session.id;

    report("Isolated mock data created", true, `Student: ${tempUserId}, Session: ${tempSessionId}`);

    // =====================================================================
    // 2. Multi-Doctor Session & Mapping (Flask Check)
    // =====================================================================
    console.log("\n2️⃣ Multi-Doctor Session & Device Mapping");
    let flaskOk = false;
    try {
      // Test select-session
      const selectRes = await fetch("http://127.0.0.1:5000/select-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: tempSessionId, deviceIp })
      });
      const selectJson: any = await selectRes.json();
      
      // Test get-device-sessions
      const devRes = await fetch("http://127.0.0.1:5000/device-sessions");
      const devJson: any = await devRes.json();

      if (selectJson.success && devJson[deviceIp] === tempSessionId) {
        report("Device dynamically mapped to Active Session", true, `IP ${deviceIp} -> Session ${tempSessionId.substring(0, 8)}...`);
        flaskOk = true;
      } else {
        report("Device dynamically mapped to Active Session", false, "Mapping mismatched or failed.");
      }
    } catch (e: any) {
      report("Flask Mapping Endpoints Reachable", false, e.message);
    }

    // =====================================================================
    // 3. Anti-Duplicate RFID Logic (Prisma @@unique catch)
    // =====================================================================
    console.log("\n3️⃣ RFID Anti-Duplicate Constraints");
    if (flaskOk) {
      try {
        // First Scan (Should Pass)
        const scan1 = await fetch("http://127.0.0.1:5000/scan-card", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Mock-Face": "true" },
          body: JSON.stringify({ studentCode: testCode, source_ip: deviceIp }) // Mocking source_ip via body for testing
        });
        const res1: any = await scan1.json();
        report("First Scan (Access Granted)", res1.success === true, res1.message);

        // Second Scan (Immediate duplicate, should be caught by constraint)
        const scan2 = await fetch("http://127.0.0.1:5000/scan-card", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Mock-Face": "true" },
          body: JSON.stringify({ studentCode: testCode, source_ip: deviceIp })
        });
        const res2: any = await scan2.json();
        
        // It should gracefully return success: false (Already recorded)
        report("Second Scan (Duplicate Caught Gracefully)", res2.success === false, res2.message);

      } catch (e: any) {
        report("RFID Scan Testing", false, e.message);
      }
    } else {
      console.log("  Skipping scan test because Flask is unreachable.");
    }

    // =====================================================================
    // 4. Dual-Layer AI Face Verification Service
    // =====================================================================
    console.log("\n4️⃣ Dual-Layer AI Model Logic (Landmark + LBP)");
    try {
      const pythonRes = spawnSync("python", ["tests/ai_mock_test.py"], { encoding: 'utf-8' });
      if (pythonRes.status === 0 && pythonRes.stdout.includes("DUAL_LAYER_OK")) {
        report("AI Mock Evaluation Passed", true, "Both LBP and Landmark functions are executing correctly.");
      } else {
        report("AI Mock Evaluation Passed", false, pythonRes.stderr || pythonRes.stdout || "Script failed.");
      }
    } catch (e: any) {
      report("AI Dual-Layer Mock execution", false, e.message);
    }

    // =====================================================================
    // 5. Cascade Delete Service
    // =====================================================================
    console.log("\n5️⃣ Cascade Deletion & Cleanup");
    try {
      // Instead of hitting Next.js DELETE endpoint (which requires AuthJS Session Cookies),
      // we will perform the Prisma cascade directly, then hit Flask delete-student-face to ensure it's ready.
      
      const flaskDel = await fetch("http://127.0.0.1:5000/delete-student-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: tempUserId })
      });
      const delJson: any = await flaskDel.json();
      report("Flask Face Data Cleanup (Dry Run)", flaskDel.status === 200, delJson.message || "OK");

      // Now cascade delete in Prisma
      await prisma.user.delete({
        where: { id: tempUserId }
      });
      
      // Also cleanup the temporary session
      await prisma.attendanceSession.delete({
        where: { id: tempSessionId }
      });

      // Verify records are gone
      const checkUser = await prisma.user.findUnique({ where: { id: tempUserId } });
      const checkAtt = await prisma.attendance.findFirst({ where: { studentId: tempUserId } });
      
      report("PostgreSQL Cascade Wipe", !checkUser && !checkAtt, "Dummy user and attendance completely removed.");
      
      tempUserId = null;
      tempSessionId = null;
    } catch (e: any) {
      report("Cascade Deletion", false, e.message);
    }

  } catch (e: any) {
    console.error("Critical Test Failure:", e.message);
  } finally {
    // Safety Fallback Cleanup
    if (tempSessionId) {
      try { await prisma.attendanceSession.delete({ where: { id: tempSessionId } }); } catch {}
    }
    if (tempUserId) {
      try { await prisma.user.delete({ where: { id: tempUserId } }); } catch {}
    }
  }

  console.log("\n=======================================================");
  if (failed === 0) {
    console.log("             🟢 ALL SERVICES GREEN 🟢");
  } else {
    console.log(`             🔴 ${failed} SERVICES FAILED 🔴`);
  }
  console.log("=======================================================\n");

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
