/// app/teacher/exams/[id]/paper/client-page.tsx
"use client";

import { Button, Card, Space } from "antd";
import { PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClientPage({ exam }: any) {
  function printPage() {
    window.print();
  }
  const [isInPreview, setIsInPreview] = useState(false);
  useEffect(() => {
    setIsInPreview(window.location.href.includes("teacher"));
  }, []);
  return (
    <div dir="rtl" className="p-6 bg-slate-100 min-h-screen">
      <div className="mb-4 print:hidden">
        <Space>
          {isInPreview ? (
            <Link
              href={`/exams/${exam.id}/paper`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <DownloadOutlined /> تحميل الورقة
            </Link>
          ) : (
            <>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={printPage}
              >
                Print
              </Button>

              <Button
                type="dashed"
                icon={<DownloadOutlined />}
                onClick={() => window.print()}
              >
                Download
              </Button>
            </>
          )}
        </Space>
      </div>

      <Card className="max-w-225 mx-auto shadow-sm print:shadow-none print:border-none">
        <div dir="rtl" className="text-right text-[15px] leading-8">
          {/* Header */}
          <div className="border-b pb-5 mb-6">
            <h1 className="text-3xl font-bold text-center">{exam.title}</h1>

            <div className="text-center text-slate-500 mt-2">
              {exam.course.name}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>اسم الطالب: __________________</div>

              <div>الرقم الجامعي: __________________</div>

              <div>التاريخ: __________________</div>

              <div>الزمن: __________________</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="font-bold mb-2">التعليمات:</h3>

            <ul className="list-disc pr-6 text-slate-700">
              <li>اقرأ جميع الأسئلة جيدًا قبل البدء.</li>
              <li>أجب في المكان المخصص.</li>
              <li>اختر إجابة واحدة فقط في أسئلة الاختيار من متعدد.</li>
            </ul>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {exam.questions.map((q: any, index: number) => (
              <div key={q.id} className="border rounded-xl p-5">
                <div className="font-bold mb-4">
                  {index + 1}) {q.text}
                  <span className="text-slate-500 mr-3">({q.marks} درجة)</span>
                </div>

                {/* MCQ */}
                {q.type === "MCQ" && (
                  <div className="space-y-3 pr-4">
                    {q.options.map((op: any) => (
                      <div key={op.id} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-black inline-block" />

                        <span>
                          {op.label}) {op.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TRUE FALSE */}
                {q.type === "TRUE_FALSE" && (
                  <div className="space-y-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border border-black inline-block" />
                      <span>صح</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border border-black inline-block" />
                      <span>خطأ</span>
                    </div>
                  </div>
                )}

                {/* Essay/Text */}
                {q.type !== "MCQ" && q.type !== "TRUE_FALSE" && (
                  <div className="space-y-4 mt-4">
                    <div className="border-b h-8" />
                    <div className="border-b h-8" />
                    <div className="border-b h-8" />
                    <div className="border-b h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t text-center text-slate-500">
            مع تمنياتنا لكم بالتوفيق
          </div>
        </div>
      </Card>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }

          .ant-card {
            box-shadow: none !important;
          }

          @page {
            size: A4;
            margin: 14mm;
          }
        }
      `}</style>
    </div>
  );
}
