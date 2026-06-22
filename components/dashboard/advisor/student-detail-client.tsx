"use client";

import { useState } from "react";
import { Card, Table, Tag, Button, Input, Switch, Modal, Empty, message } from "antd";
import { ArrowLeft, AlertTriangle, BookOpen, CheckCircle, BarChart2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { saveRecommendationAction } from "@/app/actions/advisor/actions";

const { TextArea } = Input;

type Props = {
  student: {
    id: string; name: string | null; email: string; studentCode: string | null;
    attendanceRate: number; avgScore: number; riskLevel: string | null; summary: string | null;
    predictedOutcome: string | null; confidence: number | null; aiReasons: string[]; aiRecommendations: string[];
    courses: { name: string; code: string }[];
    attendances: { id: string; course: string; status: string; date: string }[];
    examResults: { id: string; examTitle: string; courseName: string; score: number; createdAt: string }[];
    submissions: { id: string; title: string; courseName: string; status: string; grade: number | null }[];
    recommendations: { id: string; text: string; isWarning: boolean; advisorName: string | null; createdAt: string }[];
    meetings: { id: string; advisorName: string | null; meetingDate: string; notes: string | null; status: string }[];
  };
};

export default function StudentDetailClient({ student }: Props) {
  const [msgApi, contextHolder] = message.useMessage();
  const [recModal, setRecModal] = useState(false);
  const [recText, setRecText] = useState("");
  const [isWarning, setIsWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveRec = async () => {
    if (!recText.trim()) { msgApi.warning("اكتب التوصية"); return; }
    setLoading(true);
    const res = await saveRecommendationAction({ studentId: student.id, text: recText, isWarning });
    res.success ? msgApi.success(res.message) : msgApi.error(res.message);
    setLoading(false); setRecModal(false);
  };

  const statCards = [
    { title: "الحضور", value: `${student.attendanceRate}%`, color: student.attendanceRate >= 75 ? "#10b981" : "#ef4444", icon: <CheckCircle size={20} /> },
    { title: "متوسط الدرجات", value: student.avgScore, color: student.avgScore >= 50 ? "#002060" : "#ef4444", icon: <BarChart2 size={20} /> },
    { title: "الكورسات", value: student.courses.length, color: "#F58220", icon: <BookOpen size={20} /> },
    { title: "مستوى الخطورة", value: student.riskLevel === "HIGH" ? "عالي" : student.riskLevel === "MEDIUM" ? "متوسط" : "منخفض", color: student.riskLevel === "HIGH" ? "#ef4444" : student.riskLevel === "MEDIUM" ? "#f59e0b" : "#10b981", icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/advisor/students"><Button type="default" icon={<ArrowLeft size={16} />} className="rounded-xl flex flex-row-reverse" /></Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#002060" }}>{student.name || "بدون اسم"}</h1>
            <p className="text-sm text-slate-500">{student.email} {student.studentCode && `· ${student.studentCode}`}</p>
          </div>
        </div>
        <Button type="primary" icon={<MessageSquare size={16} />} onClick={() => { setRecText(""); setIsWarning(false); setRecModal(true); }} style={{ background: "#F58220", borderColor: "#F58220", borderRadius: 12 }}>
          إضافة توصية
        </Button>
      </div>

      {(student.summary || student.aiReasons?.length > 0) && (
        <Card className="rounded-3xl shadow-lg border border-white/20 backdrop-blur-md" style={{ background: student.riskLevel === "HIGH" ? "linear-gradient(135deg, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.8))" : "linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.8))", borderRight: `6px solid ${student.riskLevel === "HIGH" ? "#ef4444" : "#8b5cf6"}` }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={24} color={student.riskLevel === "HIGH" ? "#ef4444" : "#8b5cf6"} />
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-purple-600" style={student.riskLevel === "HIGH" ? { background: "none", color: "#ef4444" } : {}}>
              التحليل الاستباقي (AI)
            </span>
            {student.confidence && <Tag color="blue" className="mr-auto">ثقة النموذج: {Math.round(student.confidence * 100)}%</Tag>}
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-sm mb-1 text-slate-700">الملخص:</div>
              <p className="text-sm text-slate-700">{student.summary}</p>
            </div>

            {student.aiReasons && student.aiReasons.length > 0 && (
              <div>
                <div className="font-semibold text-sm mb-1 text-slate-700">أسباب التصنيف:</div>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {student.aiReasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {student.aiRecommendations && student.aiRecommendations.length > 0 && (
              <div>
                <div className="font-semibold text-sm mb-1 text-slate-700">الإجراءات المقترحة:</div>
                <div className="flex flex-wrap gap-2">
                  {student.aiRecommendations.map((r, i) => (
                    <Tag color="cyan" key={i} className="text-xs px-2 py-1 rounded-lg">{r}</Tag>
                  ))}
                </div>
              </div>
            )}

            {student.predictedOutcome && (
              <div>
                <div className="font-semibold text-sm mb-1 text-slate-700">المسار المتوقع:</div>
                <p className="text-sm font-bold" style={{ color: "#002060" }}>{student.predictedOutcome}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200/60 flex gap-2">
              <Button 
                type="primary" 
                size="small" 
                icon={<span className="text-yellow-300">✨</span>} 
                style={{ background: "#8b5cf6", borderColor: "#8b5cf6" }}
                onClick={async () => {
                  setLoading(true);
                  const { generateStudyPlanAction } = await import("@/app/actions/student-insight-actions");
                  const res = await generateStudyPlanAction(student.id);
                  if (res.success) {
                    setRecText(`**${res.plan.title}**\n\n${res.plan.introduction}\n\n` + res.plan.schedule.map((d: any) => `- ${d.day}: ${d.tasks.join("، ")}`).join("\n") + `\n\nنصائح:\n` + res.plan.tips.map((t: string) => `- ${t}`).join("\n"));
                    setIsWarning(false);
                    setRecModal(true);
                  } else msgApi.error(res.message);
                  setLoading(false);
                }}
              >
                صياغة خطة علاجية بالـ AI
              </Button>
              <Button 
                type="primary" 
                size="small" 
                icon={<span className="text-yellow-300">✨</span>} 
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
                onClick={async () => {
                  setLoading(true);
                  const { generateWarningMessageAction } = await import("@/app/actions/student-insight-actions");
                  const res = await generateWarningMessageAction(student.id);
                  if (res.success) {
                    setRecText(`**${res.message.subject}**\n\n${res.message.body}`);
                    setIsWarning(true);
                    setRecModal(true);
                  } else msgApi.error(res.message);
                  setLoading(false);
                }}
              >
                صياغة تنبيه أكاديمي بالـ AI
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 2026 UI Data Calculations */}
      {(() => {
        const radarData = [
          { label: "الحضور", value: student.attendanceRate },
          { label: "الدرجات", value: student.avgScore },
          { label: "الواجبات", value: student.submissions.length > 0 ? 85 : 0 },
          { label: "ثقة الذكاء", value: (student.confidence || 0.8) * 100 },
          { label: "التفاعل", value: Math.round((student.attendanceRate + student.avgScore) / 2) },
        ];
        const radarRadius = 60;
        const radarCenter = 100;
        const getRadarPoint = (value: number, index: number, total: number) => {
          const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
          const r = (value / 100) * radarRadius;
          return `${radarCenter + r * Math.cos(angle)},${radarCenter + r * Math.sin(angle)}`;
        };

        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((card, i) => (
                <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both` }}>
                  <div className="p-5 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100" style={{ color: card.color }}>{card.icon}</div>
                      <div className="text-sm font-medium text-slate-500">{card.title}</div>
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-slate-800">
                      {card.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 mb-8">
              {/* Radar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
                <h3 className="w-full text-base font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  تحليل المهارات الشامل
                </h3>
                <div className="relative w-full aspect-square max-w-[220px] flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                    {[100, 75, 50, 25].map(radius => (
                      <polygon key={radius} points={radarData.map((_, i) => getRadarPoint(radius, i, radarData.length)).join(" ")} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    ))}
                    {radarData.map((_, i) => (
                      <line key={i} x1="100" y1="100" x2={getRadarPoint(100, i, radarData.length).split(',')[0]} y2={getRadarPoint(100, i, radarData.length).split(',')[1]} stroke="#e2e8f0" strokeWidth="1" />
                    ))}
                    <polygon points={radarData.map((d, i) => getRadarPoint(d.value, i, radarData.length)).join(" ")} fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" strokeWidth="2" className="transition-all duration-1000" style={{ transformOrigin: 'center', animation: 'scaleUp 1s ease-out' }} />
                    {radarData.map((d, i) => {
                      const pt = getRadarPoint(d.value, i, radarData.length).split(',');
                      const labelPt = getRadarPoint(135, i, radarData.length).split(',');
                      return (
                        <g key={i}>
                          <circle cx={pt[0]} cy={pt[1]} r="3" fill="#fff" stroke="#6366f1" strokeWidth="2" />
                          <text x={labelPt[0]} y={labelPt[1]} fontSize="11" fontWeight="600" fill="#475569" textAnchor="middle" dominantBaseline="middle">{d.label}</text>
                          <text x={labelPt[0]} y={Number(labelPt[1]) + 14} fontSize="10" fontWeight="500" fill="#64748b" textAnchor="middle" dominantBaseline="middle">{Math.round(d.value)}%</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Bar & Line Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col pb-8">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    المسار الأكاديمي (الامتحانات)
                  </h3>
                  <Tag color="blue" className="rounded-md px-3 py-1 border border-blue-200 bg-blue-50 text-blue-700 font-medium">متابعة دقيقة</Tag>
                </div>
                
                <div className="flex-1 w-full relative min-h-[180px]">
                  <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-between text-[11px] font-medium text-slate-400 pr-2 -ml-2 z-10">
                    <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                  </div>

                  <div className="flex items-end justify-between gap-4 h-full ml-8 pb-0 border-b border-slate-200 relative z-0">
                    {student.examResults.map((exam, i) => {
                      const isHigh = exam.score >= 80;
                      const isMedium = exam.score >= 50 && exam.score < 80;
                      const barColor = isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500';
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer" style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both` }}>
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                            <div className="bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-md text-xs flex flex-col items-center min-w-[60px]">
                              <span className="font-bold">{exam.score}%</span>
                              <span className="text-[10px] text-slate-300 truncate w-20 text-center">{exam.examTitle}</span>
                            </div>
                            <div className="w-2 h-2 bg-slate-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                          </div>
                          
                          <div 
                            className={`w-full max-w-[36px] rounded-t-md ${barColor} transition-all duration-300 ease-out opacity-90 group-hover:opacity-100`}
                            style={{ height: `${exam.score}%` }}
                          ></div>
                          
                          <div className="absolute -bottom-7 text-[11px] font-medium text-slate-500 truncate w-full text-center px-1" title={exam.courseName}>
                            {exam.courseName.split(" ").slice(0, 2).join(" ")}
                          </div>
                        </div>
                      );
                    })}
                    {student.examResults.length === 0 && <div className="m-auto text-slate-400 font-medium">لا توجد بيانات امتحانات كافية</div>}
                  </div>
                </div>
                
                <style>{`
                  @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                  @keyframes dash { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
                `}</style>
              </div>
            </div>
          </>
        );
      })()}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title="سجل الحضور" className="rounded-2xl shadow-sm">
          <Table rowKey="id" size="small" pagination={{ pageSize: 8 }} dataSource={student.attendances} columns={[
            { title: "الكورس", dataIndex: "course" },
            { title: "الحالة", dataIndex: "status", render: (v: string) => <Tag color={v === "PRESENT" ? "green" : "red"}>{v === "PRESENT" ? "حاضر" : "غائب"}</Tag> },
            { title: "التاريخ", dataIndex: "date", render: (v: string) => { try { return format(new Date(v), "yyyy-MM-dd HH:mm"); } catch { return "-"; } } },
          ]} />
        </Card>

        <Card title="الدرجات" className="rounded-2xl shadow-sm">
          <Table rowKey="id" size="small" pagination={{ pageSize: 8 }} dataSource={student.examResults} columns={[
            { title: "الامتحان", dataIndex: "examTitle" },
            { title: "الكورس", dataIndex: "courseName" },
            { title: "الدرجة", dataIndex: "score", render: (v: number) => <span className="font-bold" style={{ color: v >= 50 ? "#10b981" : "#ef4444" }}>{v}</span> },
          ]} />
        </Card>
      </div>

      <Card title="التوصيات والإنذارات" className="rounded-2xl shadow-sm">
        {student.recommendations.length === 0 ? <Empty description="لا توجد توصيات" /> : (
          <div className="space-y-3">
            {student.recommendations.map((r) => (
              <div key={r.id} className="p-3 rounded-xl" style={{ background: r.isWarning ? "#FEF2F2" : "#F0FDF4", borderRight: `3px solid ${r.isWarning ? "#ef4444" : "#10b981"}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm" style={{ color: "#002060" }}>{r.advisorName || "المرشد"}</span>
                  {r.isWarning ? <Tag color="red">تحذير</Tag> : <Tag color="green">توصية</Tag>}
                </div>
                <div className="text-sm text-slate-600">{r.text}</div>
                <div className="text-xs text-slate-400 mt-1">{(() => { try { return format(new Date(r.createdAt), "yyyy-MM-dd HH:mm"); } catch { return "-"; } })()}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal title="إضافة توصية" open={recModal} onCancel={() => setRecModal(false)} onOk={handleSaveRec} confirmLoading={loading} okText="حفظ" cancelText="إلغاء">
        <div className="space-y-4">
          <div className="flex items-center gap-3"><span>تحذير أكاديمي؟</span><Switch checked={isWarning} onChange={setIsWarning} /></div>
          <TextArea rows={4} placeholder="اكتب التوصية هنا..." value={recText} onChange={(e) => setRecText(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
