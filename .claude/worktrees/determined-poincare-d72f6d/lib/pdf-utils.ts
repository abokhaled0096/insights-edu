import QRCode from 'qrcode';

export async function generateQrMap(exam: any, students: any) {
  const qrs: Record<string, string> = {};

  // 1. QR الامتحان
  qrs[`exam_${exam.id}`] = await QRCode.toDataURL(exam.id);

  // 2. QR الطلاب
  for (const student of students) {
    qrs[`student_${student.id}`] = await QRCode.toDataURL(student.id);
  }

  // 3. QR الأسئلة
  for (const q of exam.questions) {
    qrs[`q_${q.id}`] = await QRCode.toDataURL(q.id);
  }

  return qrs;
}