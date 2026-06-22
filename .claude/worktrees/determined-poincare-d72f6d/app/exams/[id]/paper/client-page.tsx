"use client";

import { Button, Space } from "antd";
import {
  PrinterOutlined,
} from "@ant-design/icons";

export default function ClientPage({
  exam,
}: any) {
  function printPage() {
    window.print();
  }

  return (
    <div className="bg-slate-100 min-h-screen p-6">
      {/* Toolbar */}
      <div className="print:hidden mb-5">
        <Space>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={printPage}
          >
            طباعة الورقة
          </Button>
        </Space>
      </div>

      {/* PRINT AREA */}
      <div className="exam-print-area">
        <div
          dir="rtl"
          className="exam-sheet"
        >
          {/* Header */}
          <div className="exam-header">
            <div className="school-name">
              المؤسسة التعليمية
            </div>

            <h1 className="exam-title">
              {exam.title}
            </h1>

            <div className="course-name">
              {exam.course.name}
            </div>

            <div className="meta-grid">
              <div>
                اسم الطالب:
                ___________
              </div>

              <div>
                الرقم:
                ___________
              </div>

              <div>
                التاريخ:
                ___________
              </div>

              <div>
                الزمن:
                ___________
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <strong>
              التعليمات:
            </strong>

            <ul>
              <li>
                اقرأ جميع
                الأسئلة جيدًا.
              </li>
              <li>
                اختر إجابة
                واحدة فقط.
              </li>
              <li>
                اكتب بخط
                واضح.
              </li>
            </ul>
          </div>

          {/* Questions */}
          <div className="questions">
            {exam.questions.map(
              (
                q: any,
                index: number
              ) => (
                <div
                  key={q.id}
                  className="question-block"
                >
                  <div className="question-title">
                    {index + 1}){" "}
                    {q.text}

                    <span className="marks">
                      (
                      {
                        q.marks
                      }{" "}
                      درجة)
                    </span>
                  </div>

                  {/* MCQ */}
                  {q.type ===
                    "MCQ" && (
                    <div className="mcq-list">
                      {q.options.map(
                        (
                          op: any
                        ) => (
                          <div
                            key={
                              op.id
                            }
                            className="mcq-item"
                          >
                            <span className="bubble" />

                            <span>
                              {
                                op.label
                              }

                              ){" "}
                              {
                                op.text
                              }
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Essay */}
                  {q.type !==
                    "MCQ" && (
                    <div className="answer-lines">
                      <div />
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="footer">
            مع تمنياتنا
            لكم بالتوفيق
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx global>{`
        body {
          font-family: Arial, sans-serif;
        }

        .exam-sheet {
          width: 210mm;
          min-height: 297mm;
          margin: auto;
          background: white;
          padding: 14mm;
          box-shadow: 0 0 10px rgba(0,0,0,.08);
          color: black;
        }

        .exam-header {
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
          margin-bottom: 16px;
          text-align: center;
        }

        .school-name {
          font-size: 14px;
        }

        .exam-title {
          font-size: 28px;
          font-weight: bold;
          margin: 8px 0;
        }

        .course-name {
          font-size: 16px;
          margin-bottom: 12px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          text-align: right;
          margin-top: 12px;
          font-size: 14px;
        }

        .instructions {
          margin-bottom: 18px;
          font-size: 14px;
        }

        .instructions ul {
          margin-top: 6px;
          padding-right: 20px;
        }

        .question-block {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 14px;

          page-break-inside: avoid;
          break-inside: avoid;
        }

        .question-title {
          font-weight: bold;
          margin-bottom: 10px;
          line-height: 1.8;
        }

        .marks {
          font-weight: normal;
          margin-right: 8px;
          font-size: 13px;
        }

        .mcq-list {
          display: grid;
          gap: 10px;
        }

        .mcq-item {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .bubble {
          width: 18px;
          height: 18px;
          border: 1.7px solid #000;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .answer-lines div {
          border-bottom: 1px solid #999;
          height: 28px;
          margin-bottom: 10px;
        }

        .footer {
          border-top: 1px solid #ccc;
          margin-top: 20px;
          padding-top: 10px;
          text-align: center;
          font-size: 13px;
        }

        /* PRINT MODE */
        @media print {
          body * {
            visibility: hidden;
          }

          .exam-print-area,
          .exam-print-area * {
            visibility: visible;
          }

          .exam-print-area {
            position: absolute;
            inset: 0;
          }

          .exam-sheet {
            width: 100%;
            min-height: auto;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }

          .print\\:hidden {
            display: none !important;
          }

          .question-block {
            page-break-inside: avoid;
          }

          .exam-header {
            position: running(header);
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
}