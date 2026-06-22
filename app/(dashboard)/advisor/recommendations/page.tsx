import { getAdvisorRecommendationsAction } from "@/app/actions/advisor/get-recommendations";
import { getAdvisorStudentsAction } from "@/app/actions/advisor/get-students";
import RecommendationsClient from "@/components/dashboard/advisor/recommendations-client";

export default async function AdvisorRecommendationsPage() {
  const [recommendations, students] = await Promise.all([
    getAdvisorRecommendationsAction(),
    getAdvisorStudentsAction(),
  ]);

  const studentsList = students.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="p-6">
      <RecommendationsClient recommendations={recommendations} students={studentsList} />
    </div>
  );
}
