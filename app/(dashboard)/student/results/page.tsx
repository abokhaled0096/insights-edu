import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentTranscriptClient, { TranscriptCourse } from "@/components/dashboard/student/results-client";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const studentId = session.user.id;

  // Fetch all enrolled courses with their quizzes and results
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          exams: {
            select: {
              id: true,
              results: {
                where: { studentId },
                select: { score: true },
              },
            },
          },
        },
      },
    },
  });

  const getGradeInfo = (score: number) => {
    if (score >= 90) return { letter: "A+", points: 4.0 };
    if (score >= 85) return { letter: "A", points: 3.8 };
    if (score >= 80) return { letter: "B+", points: 3.3 };
    if (score >= 75) return { letter: "B", points: 3.0 };
    if (score >= 70) return { letter: "C+", points: 2.5 };
    if (score >= 65) return { letter: "C", points: 2.0 };
    if (score >= 60) return { letter: "D+", points: 1.5 };
    if (score >= 50) return { letter: "D", points: 1.0 };
    return { letter: "F", points: 0.0 };
  };

  const courses: TranscriptCourse[] = [];
  let totalScoreSum = 0;
  let totalCoursesWithGrades = 0;
  let totalGpaPoints = 0;

  for (const enrollment of enrollments) {
    const exams = enrollment.course.exams;
    const gradedExams = exams.filter(e => e.results.length > 0);
    
    let courseAvg = 0;
    if (gradedExams.length > 0) {
      const sum = gradedExams.reduce((acc, curr) => acc + (curr.results[0]?.score ?? 0), 0);
      courseAvg = Math.round((sum / gradedExams.length) * 10) / 10;
    }

    const { letter, points } = gradedExams.length > 0 ? getGradeInfo(courseAvg) : { letter: "-", points: 0 };

    courses.push({
      courseId: enrollment.course.id,
      courseName: enrollment.course.name,
      courseCode: enrollment.course.code,
      quizzesTaken: gradedExams.length,
      averageScore: courseAvg,
      letterGrade: letter,
      gpaPoints: points,
    });

    if (gradedExams.length > 0) {
      totalScoreSum += courseAvg;
      totalGpaPoints += points;
      totalCoursesWithGrades++;
    }
  }

  const overallGpa = totalCoursesWithGrades > 0 ? totalGpaPoints / totalCoursesWithGrades : 0;
  const overallAverage = totalCoursesWithGrades > 0 ? totalScoreSum / totalCoursesWithGrades : 0;

  return (
    <div className="p-6">
      <StudentTranscriptClient 
        courses={courses} 
        overallGpa={overallGpa} 
        overallAverage={overallAverage} 
      />
    </div>
  );
}
