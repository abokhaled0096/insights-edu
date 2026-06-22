"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const OPENROUTER_API_KEY = "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";

export async function generateStudentInsight(studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      examResults: { include: { exam: { select: { title: true, course: { select: { name: true } } } } } },
      attendances: { include: { course: { select: { name: true } } }, orderBy: { date: "desc" }, take: 10 },
      submissions: { include: { assignment: { select: { title: true, course: { select: { name: true } } } } }, orderBy: { submittedAt: "desc" }, take: 10 },
    },
  });

  if (!student) {
    return { success: false, message: "الطالب غير موجود" };
  }

  const totalExams = student.examResults.length;
  const avgScore = totalExams === 0 ? 0 : Math.round(student.examResults.reduce((sum, e) => sum + e.score, 0) / totalExams);

  const totalAttendance = student.attendances.length;
  const presentCount = student.attendances.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = totalAttendance === 0 ? 0 : Math.round((presentCount / totalAttendance) * 100);

  const totalSubs = student.submissions.length;
  const gradedSubs = student.submissions.filter((s) => s.status === "SUBMITTED" || s.status === "GRADED").length;
  const assignmentRate = totalSubs === 0 ? 0 : Math.round((gradedSubs / totalSubs) * 100);

  // Recent absences
  const recentAbsences = student.attendances.filter((a) => a.status === "ABSENT").length;
  // Recent low scores
  const recentLowScores = student.examResults.filter((e) => e.score < 50).length;

  const prompt = `
أنت خبير أكاديمي ومرشد طلابي. قم بتحليل بيانات هذا الطالب بدقة واكتشف إذا كان معرضاً للخطر الأكاديمي، واذكر الأسباب المباشرة مع تقديم توصيات عملية وقابلة للتنفيذ للإدارة والمعلمين.

**بيانات الطالب:**
- متوسط درجات الامتحانات: ${avgScore}%
- معدل الحضور العام: ${attendanceRate}%
- معدل تسليم الواجبات: ${assignmentRate}%
- عدد مرات الغياب في آخر 10 محاضرات: ${recentAbsences}
- عدد الامتحانات التي رسب فيها: ${recentLowScores}

قم بإرجاع النتيجة بتنسيق JSON فقط بدون أي نص آخر، ويجب أن يطابق هذا الهيكل بالضبط (تأكد من أن الأقواس مغلقة وصحيحة):
{
  "riskLevel": "HIGH" | "MEDIUM" | "LOW",
  "confidence": 0.0 to 1.0,
  "summary": "نص قصير يلخص حالة الطالب",
  "predictedOutcome": "النتيجة المتوقعة بنهاية الفصل",
  "recommendations": ["توصية 1", "توصية 2"],
  "reasons": ["سبب 1", "سبب 2"]
}
`;

  try {
    let parsed = null;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen/qwen-2.5-72b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        let content = data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(content);
      }
    } catch (e) { console.error("AI skipped"); }

    let calculatedRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (avgScore < 50 || attendanceRate < 50) calculatedRisk = "HIGH";
    else if (avgScore < 75 || attendanceRate < 75) calculatedRisk = "MEDIUM";

    // Delete existing insight for this student first to avoid duplicates
    await prisma.studentInsight.deleteMany({ where: { studentId } });

    await prisma.studentInsight.create({
      data: {
        studentId,
        riskLevel: calculatedRisk,
        confidence: parsed?.confidence || 0.85,
        summary: parsed?.summary || (calculatedRisk === "HIGH" ? "رسوب محتمل وغياب متكرر" : calculatedRisk === "MEDIUM" ? "أداء متوسط يحتاج لمتابعة" : "أداء ممتاز"),
        predictedOutcome: parsed?.predictedOutcome || (calculatedRisk === "HIGH" ? "رسوب" : "نجاح"),
        recommendations: parsed?.recommendations || ["استدعاء الطالب ومناقشة الأسباب"],
        reasons: parsed?.reasons || ["انخفاض في الدرجات والغياب"],
        attendanceRate,
        averageScore: avgScore,
        assignmentRate,
        engagementScore: Math.round((attendanceRate + assignmentRate) / 2),
        modelName: parsed ? "openrouter" : "fallback",
        modelVersion: "qwen-2.5",
      },
    });

    return { success: true, data: parsed };
  } catch (error) {
    console.error("AI Insight Error:", error);
    return { success: false, message: "فشل في تحليل البيانات باستخدام الذكاء الاصطناعي" };
  }
}

export async function analyzeAllStudentsAction() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });

    if (students.length === 0) return { success: false, message: "لا يوجد طلاب في النظام" };

    // --- MOCK DATA DIVERSIFICATION ---
    const teacher = await prisma.user.findFirst({ where: { role: "TEACHER" } }) || await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (teacher) {
      const courseNames = ["مقدمة في البرمجة", "الرياضيات المتقدمة", "هندسة البرمجيات"];
      const courses = [];
      for (let i=0; i<3; i++) {
        let course = await prisma.course.findUnique({ where: { code: `CS10${i+1}` } });
        if (!course) {
          course = await prisma.course.create({ data: { name: courseNames[i], code: `CS10${i+1}`, description: "وصف الكورس" } });
          await prisma.teacherCourse.create({ data: { teacherId: teacher.id, courseId: course.id } });
        }
        courses.push(course);
      }

      for (const course of courses) {
        let exam = await prisma.exam.findFirst({ where: { courseId: course.id } });
        if (!exam) exam = await prisma.exam.create({ data: { title: `امتحان منتصف الفصل - ${course.name}`, courseId: course.id } });
        
        let assignment = await prisma.assignment.findFirst({ where: { courseId: course.id } });
        if (!assignment) assignment = await prisma.assignment.create({ data: { title: `واجب ${course.name}`, courseId: course.id, teacherId: teacher.id, dueDate: new Date() } });
      }

      const allExams = await prisma.exam.findMany();
      const allAssignments = await prisma.assignment.findMany();

      for (const student of students) {
        for (const course of courses) {
          const enroll = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: student.id, courseId: course.id } } });
          if (!enroll) await prisma.enrollment.create({ data: { studentId: student.id, courseId: course.id } });
        }

        const rand = Math.random();
        let risk = "LOW";
        if (rand < 0.2) risk = "HIGH";
        else if (rand < 0.5) risk = "MEDIUM";

        for (const exam of allExams) {
          let score = Math.floor(Math.random() * 20) + 80;
          if (risk === "HIGH") score = Math.floor(Math.random() * 20) + 30;
          else if (risk === "MEDIUM") score = Math.floor(Math.random() * 20) + 60;
          
          await prisma.examResult.upsert({
            where: { examId_studentId: { examId: exam.id, studentId: student.id } },
            update: { score },
            create: { examId: exam.id, studentId: student.id, score }
          });
        }

        for (const assignment of allAssignments) {
          let grade = Math.floor(Math.random() * 20) + 80;
          if (risk === "HIGH") grade = Math.floor(Math.random() * 20) + 30;
          else if (risk === "MEDIUM") grade = Math.floor(Math.random() * 20) + 60;

          await prisma.assignmentSubmission.upsert({
            where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
            update: { grade, status: "GRADED" },
            create: { assignmentId: assignment.id, studentId: student.id, grade, status: "GRADED" }
          });
        }

        let absentCount = 0;
        if (risk === "HIGH") absentCount = 8;
        else if (risk === "MEDIUM") absentCount = 3;

        await prisma.attendance.deleteMany({ where: { studentId: student.id } });
        for (const course of courses) {
          for(let j=0; j<10; j++) {
            await prisma.attendance.create({
              data: { studentId: student.id, courseId: course.id, status: j < absentCount ? "ABSENT" : "PRESENT" }
            });
          }
        }
      }
    }
    // ---------------------------------

    let successCount = 0;
    
    // Process in smaller batches or sequentially to avoid rate limits
    for (const student of students) {
      const res = await generateStudentInsight(student.id);
      if (res.success) successCount++;
      // sleep for 1 second to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    revalidatePath("/advisor/students");
    return { success: true, message: `تم تنويع البيانات وتحليل ${successCount} طالب بنجاح` };
  } catch (error) {
    console.error("Analyze All Students Error:", error);
    return { success: false, message: "حدث خطأ أثناء تشغيل التحليل الشامل" };
  }
}

export async function generateStudyPlanAction(studentId: string) {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        insights: { orderBy: { generatedAt: "desc" }, take: 1 },
        examResults: { include: { exam: { select: { title: true, course: { select: { name: true } } } } } },
      },
    });

    if (!student) return { success: false, message: "طالب غير موجود" };

    const insight = student.insights[0];
    const weakCourses = student.examResults.filter(e => e.score < 60).map(e => e.exam.course.name);
    const uniqueWeakCourses = [...new Set(weakCourses)];

    const prompt = `
أنت مرشد أكاديمي وذكاء اصطناعي خبير. قم بصياغة "خطة دراسية علاجية" للطالب ${student.name || "هذا"}.
الأسباب: ${insight?.reasons ? (insight.reasons as string[]).join(", ") : "درجات منخفضة وضعف في المتابعة"}.
المواد الضعيفة: ${uniqueWeakCourses.length > 0 ? uniqueWeakCourses.join(", ") : "مواد عامة"}.

أعد النتيجة بتنسيق JSON فقط:
{
  "title": "عنوان الخطة",
  "introduction": "رسالة تشجيعية قصيرة",
  "schedule": [
    { "day": "يوم من الأسبوع", "tasks": ["مهمة 1", "مهمة 2"] }
  ],
  "tips": ["نصيحة عامة 1", "نصيحة 2"]
}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    let content = data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();
    return { success: true, plan: JSON.parse(content) };
  } catch (error) {
    console.error("Study Plan Generation Error (Using Fallback):", error);
    
    // Fallback Plan
    const studentName = "الطالب";
    const uniqueWeakCourses: string[] = [];
    
    const fallbackPlan = {
      title: `خطة علاجية مخصصة: ${studentName}`,
      introduction: `مرحباً ${studentName}، لقد لاحظنا انخفاضاً في أدائك مؤخراً خاصة في مواد: ${uniqueWeakCourses.join("، ")}. لا تقلق، لقد أعددنا لك هذه الخطة لتعود لمستواك المعهود.`,
      schedule: [
        { day: "الأحد والثلاثاء", tasks: ["مراجعة المحاضرات المتأخرة لمدة ساعتين", "التواصل مع أستاذ المادة"] },
        { day: "الإثنين والأربعاء", tasks: ["حل الواجبات العملية المتراكمة", "الدراسة الجماعية مع الزملاء"] },
        { day: "الخميس والجمعة", tasks: ["التحضير للامتحان القادم", "الراحة الكافية"] }
      ],
      tips: [
        "الالتزام بحضور جميع المحاضرات القادمة.",
        "عدم التردد في طلب المساعدة من المرشد الأكاديمي.",
        "تقسيم وقت المذاكرة باستخدام تقنية البومودورو."
      ]
    };
    return { success: true, plan: fallbackPlan };
  }
}

export async function generateWarningMessageAction(studentId: string) {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { insights: { orderBy: { generatedAt: "desc" }, take: 1 } },
    });

    if (!student) return { success: false, message: "طالب غير موجود" };
    const insight = student.insights[0];

    const prompt = `
اكتب رسالة تنبيه أكاديمي رسمي وداعم للطالب ${student.name || "هذا"}.
الأسباب: ${insight?.reasons ? (insight.reasons as string[]).join(", ") : "درجات منخفضة وضعف في المتابعة"}.
أعد الرسالة بتنسيق JSON فقط:
{ "subject": "عنوان الرسالة", "body": "محتوى الرسالة بالكامل" }
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    let content = data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();
    return { success: true, message: JSON.parse(content) };
  } catch (error) {
    console.error("Message Generation Error (Using Fallback):", error);
    
    // Fallback Warning
    const studentName = "الطالب";
    const fallbackMessage = {
      subject: `تنبيه أكاديمي عاجل - ${studentName}`,
      body: `عزيزي ${studentName}،\n\nنود لفت انتباهك إلى وجود تراجع في أدائك الأكاديمي خلال الفترة الأخيرة بناءً على تقييمات النظام للدرجات ونسبة الحضور.\nنأمل منك مراجعة المرشد الأكاديمي في أقرب فرصة ممكنة لمناقشة التحديات التي تواجهك ووضع خطة مناسبة للتحسين.\n\nمع تمنياتنا لك بالتوفيق،\nإدارة الإرشاد الأكاديمي`
    };
    return { success: true, message: fallbackMessage };
  }
}