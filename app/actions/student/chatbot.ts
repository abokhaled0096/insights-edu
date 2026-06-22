"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const OPENROUTER_API_KEY = "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";

export async function studentChatAction(message: string, history: { role: string, content: string }[]) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return { success: false, message: "غير مصرح" };
    }

    const studentId = session.user.id;
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        examResults: { include: { exam: { select: { title: true, course: { select: { name: true } } } } } },
        attendances: true,
      },
    });

    if (!student) return { success: false, message: "طالب غير موجود" };

    const weakCourses = student.examResults.filter(e => e.score < 60).map(e => e.exam.course.name);
    const uniqueWeakCourses = [...new Set(weakCourses)].join(" و ");

    const systemPrompt = `
أنت مرشد أكاديمي افتراضي تفاعلي لطلاب منصة Insight EDU.
أنت تتحدث الآن مع الطالب: ${student.name}.
نقاط ضعف الطالب الحالية (أقل من 60%): ${uniqueWeakCourses || "لا يوجد نقاط ضعف حرجة حالياً"}.
معدل غياب الطالب: ${student.attendances.filter(a => a.status === "ABSENT").length} محاضرات.

أجب على استفسارات الطالب بإيجاز وتشجيع، ووجهه للتركيز على مواده الضعيفة إن وجدت. لا تكن آلة بل كن مرشداً بشرياً لطيفاً.
`;

    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct:free",
        messages: openRouterMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API Error:", response.status, errText);
      return { success: false, message: `خطأ من الخادم (${response.status}): ${errText}` };
    }

    const data = await response.json();
    return { success: true, reply: data.choices[0].message.content };
  } catch (error) {
    console.error("Chatbot Error:", error);
    return { success: false, message: `تعذر الاتصال: ${error instanceof Error ? error.message : String(error)}` };
  }
}
