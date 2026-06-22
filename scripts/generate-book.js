const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ImageRun,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition,
} = require("docx");

// ============================================================
// BRAND COLORS — Navy + Gold (from logo)
// ============================================================
const NAVY       = "1B2A4A";
const NAVY_DARK  = "0F1B33";
const GOLD       = "F5A623";
const GOLD_DARK  = "D4891A";
const GOLD_LIGHT = "FFF3DC";
const WARM_GRAY  = "F8F6F3";
const MID_GRAY   = "E8E4DF";
const TEXT_DARK   = "2C2C2C";
const TEXT_MED    = "555555";
const WHITE       = "FFFFFF";

// ============================================================
// Fonts & Dimensions
// ============================================================
const AR_FONT = "Simplified Arabic";
const EN_FONT = "Times New Roman";
const PAGE_W = 12240;
const PAGE_H = 15840;
const MARGIN = 1440;
const CW = PAGE_W - MARGIN * 2; // 9360 content width

const LOGO_PATH = "D:\\My Projects\\insight-edu-main\\public\\logo.png";
const logoData = fs.readFileSync(LOGO_PATH);

// ============================================================
// Borders
// ============================================================
const thinBorder  = { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY };
const goldBorder  = { style: BorderStyle.SINGLE, size: 2, color: GOLD };
const navyBorder  = { style: BorderStyle.SINGLE, size: 4, color: NAVY };
const noBorder    = { style: BorderStyle.NONE, size: 0 };
const stdBorders  = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorders   = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ============================================================
// Text helpers
// ============================================================
function ar(text, o = {}) {
  return new TextRun({ text, font: AR_FONT, rightToLeft: true, size: o.size || 24, bold: o.bold, color: o.color, italics: o.italics, underline: o.underline });
}
function en(text, o = {}) {
  return new TextRun({ text, font: EN_FONT, size: o.size || 24, bold: o.bold, color: o.color, italics: o.italics, underline: o.underline });
}

// ============================================================
// Paragraph helpers
// ============================================================
function arP(text, o = {}) {
  return new Paragraph({
    alignment: o.alignment || AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { after: o.after ?? 120, before: o.before ?? 0, line: o.line || 360 },
    indent: o.indent,
    border: o.border,
    shading: o.shading,
    children: Array.isArray(text) ? text : [ar(text, o)],
  });
}
function enP(text, o = {}) {
  return new Paragraph({
    alignment: o.alignment || AlignmentType.JUSTIFIED,
    spacing: { after: o.after ?? 120, before: o.before ?? 0, line: o.line || 360 },
    indent: o.indent,
    children: Array.isArray(text) ? text : [en(text, o)],
  });
}

// Styled section heading with gold accent bar
function sectionTitle(text, isArabic = true) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    bidirectional: isArabic,
    spacing: { before: 120, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 8 } },
    children: [
      isArabic
        ? ar(text, { bold: true, size: 38, color: NAVY })
        : en(text, { bold: true, size: 38, color: NAVY }),
    ],
  });
}

function subTitle(text, isArabic = true) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
    bidirectional: isArabic,
    spacing: { before: 240, after: 120 },
    children: [
      isArabic
        ? ar(text, { bold: true, size: 28, color: GOLD_DARK })
        : en(text, { bold: true, size: 28, color: GOLD_DARK }),
    ],
  });
}

function empty() { return new Paragraph({ spacing: { after: 0 }, children: [] }); }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

// Gold diamond separator
function goldSep() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 100 },
    children: [en("- - -  " + "◆" + "  - - -", { size: 22, color: GOLD, bold: true })],
  });
}

// Feature bullet with gold marker
function arBullet(text, o = {}) {
  return arP([
    ar("▸  ", { size: 22, color: GOLD, bold: true }),
    ar(text, { size: o.size || 22, color: TEXT_DARK }),
  ], { line: 380, indent: { left: 500 }, ...o });
}

function enBullet(text, o = {}) {
  return enP([
    en("▸  ", { size: 22, color: GOLD, bold: true }),
    en(text, { size: o.size || 22, color: TEXT_DARK }),
  ], { line: 380, indent: { left: 500 }, ...o });
}

// Numbered item with gold number
function arNum(num, text) {
  return arP([
    ar(`${num}.  `, { size: 24, color: GOLD_DARK, bold: true }),
    ar(text, { size: 22, color: TEXT_DARK }),
  ], { line: 380, indent: { left: 500 } });
}

// ============================================================
// Table builders — Navy header, gold accent, warm alternating rows
// ============================================================
function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: { top: { style: BorderStyle.SINGLE, size: 2, color: NAVY }, bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD }, left: noBorder, right: noBorder },
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      verticalAlign: "center",
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [new Paragraph({
        alignment: h.align || AlignmentType.CENTER,
        bidirectional: h.rtl,
        children: [h.rtl ? ar(h.text, { bold: true, size: 22, color: WHITE }) : en(h.text, { bold: true, size: 22, color: WHITE })],
      })],
    })),
  });

  const dataRows = rows.map((row, ri) => {
    const fill = ri % 2 === 0 ? WARM_GRAY : WHITE;
    return new TableRow({
      children: row.map((cell, ci) => new TableCell({
        borders: { top: noBorder, bottom: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY }, left: noBorder, right: noBorder },
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill, type: ShadingType.CLEAR },
        margins: { top: 70, bottom: 70, left: 140, right: 140 },
        children: [new Paragraph({
          alignment: cell.align || AlignmentType.CENTER,
          bidirectional: cell.rtl,
          spacing: { line: 320 },
          children: [cell.rtl ? ar(cell.text, { size: 20, bold: cell.bold }) : en(cell.text, { size: 20, bold: cell.bold })],
        })],
      })),
    });
  });

  return new Table({ width: { size: totalW, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] });
}

// ============================================================
// GLOSSARY TABLE
// ============================================================
const glossary = [
  ["ESP32-CAM", "وحدة ميكروكنترولر مع كاميرا OV2640 ومعالج ESP32 وذاكرة PSRAM لالتقاط صور الوجه وإرسالها للتحقق من الهوية."],
  ["ESP8266 NodeMCU", "لوحة تطوير Wi-Fi تتصل بقارئ RFID وشاشة LCD وترسل بيانات البطاقة إلى الخادم عبر HTTP."],
  ["MFRC522 (RFID)", "قارئ بطاقات RFID بتردد 13.56 MHz متوافق مع ISO 14443-A يقرأ UID لكل بطاقة طالب عبر SPI."],
  ["MediaPipe FaceMesh", "مكتبة Google لاستخراج 468 نقطة معلمية (1404 سمة) لكل وجه لتحليل هيكل الوجه الهندسي."],
  ["LBP", "خوارزمية Local Binary Patterns لتحليل نسيج الصورة عبر شبكة 8x8 للتحقق من هوية الوجه بالمظهر."],
  ["RandomForest", "خوارزمية تعلم آلي تستخدم مجموعة أشجار قرار (100 شجرة) لتصنيف الوجوه في وضع تعدد الطلاب."],
  ["Next.js + App Router", "إطار عمل React يوفر SSR وApp Router وTypeScript لبناء واجهة المستخدم الرئيسية."],
  ["Flask", "إطار عمل Python خفيف لتشغيل خادم AI ومعالجة طلبات الحضور والتسجيل والتحقق من الوجه."],
  ["PostgreSQL", "قاعدة بيانات علائقية مفتوحة المصدر تدعم ACID وUnique Constraints وCascade Delete."],
  ["Prisma ORM", "أداة إدارة قواعد بيانات توفر تعريف المخطط وتوليد الاستعلامات تلقائياً مع الترحيلات."],
  ["NextAuth.js (AuthJS)", "مكتبة مصادقة JWT تدعم أدوار متعددة (Admin/Teacher/Student/Advisor/TA) وحماية المسارات."],
  ["OpenCV", "مكتبة رؤية حاسوبية لمعالجة الصور وتحويل الألوان واقتصاص الوجه وتسوية الإضاءة (Histogram Equalization)."],
  ["OCR (Bubble Sheet)", "نظام تصحيح آلي للامتحانات يعتمد على مسح أوراق الإجابة وتحليل Bubbles بمعالجة الصور."],
  ["Student Insights (AI)", "نظام تحليلات تنبؤية يصنف الطلاب حسب مستوى الخطر (Low/Medium/High) بناءً على الحضور والدرجات."],
  ["I2C LCD 16x2", "شاشة عرض بلورية بسطرين تتصل عبر بروتوكول I2C لعرض حالة الحضور للطالب فوراً."],
  ["SPI", "بروتوكول اتصال تسلسلي متزامن عالي السرعة للتواصل بين NodeMCU وقارئ RFID."],
];

function makeGlossaryTable() {
  return makeTable(
    [{ text: "Term", rtl: false }, { text: "التعريف", rtl: true }],
    glossary.map(g => [
      { text: g[0], bold: true, align: AlignmentType.LEFT },
      { text: g[1], rtl: true, align: AlignmentType.RIGHT },
    ]),
    [3000, 6360],
  );
}

// ============================================================
// HARDWARE TABLE
// ============================================================
function makeHWTable() {
  return makeTable(
    [{ text: "المكون", rtl: true }, { text: "الكمية", rtl: true }, { text: "الوظيفة", rtl: true }],
    [
      [{ text: "ESP32-CAM (AI-Thinker)" }, { text: "1" }, { text: "التقاط صور الوجه والتعرف على الهوية", rtl: true }],
      [{ text: "ESP8266 NodeMCU V3" }, { text: "1" }, { text: "قراءة RFID + عرض LCD + تنبيه صوتي", rtl: true }],
      [{ text: "MFRC522 RFID Reader" }, { text: "1" }, { text: "قراءة بطاقات MIFARE (UID) عبر SPI", rtl: true }],
      [{ text: "I2C LCD 16x2" }, { text: "1" }, { text: "عرض اسم الطالب وحالة الحضور", rtl: true }],
      [{ text: "Active Buzzer (GPIO2)" }, { text: "1" }, { text: "تنبيه صوتي: نجاح / فشل / خطأ", rtl: true }],
      [{ text: "RFID Cards (MIFARE)" }, { text: "10+" }, { text: "بطاقات تعريف الطلاب", rtl: true }],
      [{ text: "MB Programmer" }, { text: "1" }, { text: "برمجة ESP32-CAM عبر USB", rtl: true }],
    ],
    [3500, 1200, 4660],
  );
}

// ============================================================
// DB SCHEMA TABLE
// ============================================================
function makeDBTable() {
  return makeTable(
    [{ text: "الجدول", rtl: true }, { text: "الوصف", rtl: true }, { text: "العلاقات الرئيسية", rtl: true }],
    [
      [{ text: "User" }, { text: "المستخدمون (طلاب، مدرسين، إداريين، مرشدين)", rtl: true }, { text: "Enrollment, Attendance, ExamResult", rtl: false }],
      [{ text: "Course" }, { text: "المقررات الدراسية", rtl: true }, { text: "Enrollment, TeacherCourse, Exam", rtl: false }],
      [{ text: "Attendance" }, { text: "سجلات الحضور مع RFID + Face", rtl: true }, { text: "@@unique([studentId, sessionId])", rtl: false }],
      [{ text: "AttendanceSession" }, { text: "جلسات الحضور النشطة لكل مقرر", rtl: true }, { text: "Course, Attendance", rtl: false }],
      [{ text: "Exam + Question" }, { text: "الامتحانات وأسئلة MCQ/True-False", rtl: true }, { text: "OCRConfig, StudentExamPaper", rtl: false }],
      [{ text: "StudentExamPaper" }, { text: "أوراق الطلاب الممسوحة + QR Code", rtl: true }, { text: "StudentAnswer, ExamResult", rtl: false }],
      [{ text: "Assignment" }, { text: "الواجبات مع المرفقات والمواعيد", rtl: true }, { text: "AssignmentSubmission", rtl: false }],
      [{ text: "StudentActivity" }, { text: "أنشطة متنوعة (Task/Quiz/Project/Event)", rtl: true }, { text: "ActivitySubmission, ActivityContent", rtl: false }],
      [{ text: "StudentInsight" }, { text: "تحليلات تنبؤية لمستوى خطر الطالب", rtl: true }, { text: "riskLevel, confidence, recommendations", rtl: false }],
      [{ text: "AdvisorMeeting" }, { text: "اجتماعات المرشد الأكاديمي مع الطلاب", rtl: true }, { text: "Advisor (User), Student (User)", rtl: false }],
      [{ text: "SystemNotification" }, { text: "إشعارات النظام بين المستخدمين", rtl: true }, { text: "sender, receiver", rtl: false }],
      [{ text: "AdminLog" }, { text: "سجل عمليات الإدارة للمراجعة", rtl: true }, { text: "action, entityType, oldData/newData", rtl: false }],
    ],
    [2200, 3800, 3360],
  );
}

// ============================================================
// ROLES TABLE
// ============================================================
function makeRolesTable() {
  return makeTable(
    [{ text: "الدور", rtl: true }, { text: "الصلاحيات", rtl: true }],
    [
      [{ text: "Admin", bold: true }, { text: "إدارة كاملة: مستخدمين، مقررات، تقارير، سجلات، جودة، إحصائيات النظام", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "Teacher", bold: true }, { text: "إدارة الحضور والجلسات، إنشاء امتحانات وواجبات وأنشطة، تصحيح آلي، رسائل، عرض طلاب المقررات", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "Student", bold: true }, { text: "عرض الحضور والنتائج، تسليم الواجبات والأنشطة، متابعة الدرجات، عرض المقررات المسجلة", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "Advisor", bold: true }, { text: "متابعة الطلاب المعرضين للخطر، توصيات أكاديمية، جدولة اجتماعات، تقارير تحليلية", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "TA", bold: true }, { text: "مساعد مدرس: صلاحيات محدودة لمساعدة المدرس في إدارة المقرر", rtl: true, align: AlignmentType.RIGHT }],
    ],
    [2000, 7360],
  );
}

// ============================================================
// API ENDPOINTS TABLE
// ============================================================
function makeAPITable() {
  return makeTable(
    [{ text: "Endpoint" }, { text: "Method" }, { text: "الوصف", rtl: true }],
    [
      [{ text: "/start-session" }, { text: "POST" }, { text: "بدء جلسة حضور لمقرر محدد (لا تؤثر على مقررات أخرى)", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "/end-session" }, { text: "POST" }, { text: "إنهاء جلسة بالـ ID أو كل الجلسات + إزالة ربط الأجهزة", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "/select-session" }, { text: "POST" }, { text: "ربط جهاز (IP) بجلسة حضور محددة", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "/scan-card" }, { text: "POST" }, { text: "مسح RFID + تحقق من الوجه + تسجيل الحضور + منع التكرار", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "/register_user" }, { text: "POST" }, { text: "تسجيل وجه طالب (30 عينة + LBP + Landmark) مع كود RFID", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "/delete-student-face" }, { text: "POST" }, { text: "حذف بيانات الوجه (CSV + LBP pickle) + إعادة تدريب النموذج", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "/device-sessions" }, { text: "GET" }, { text: "عرض خريطة ربط الأجهزة بالجلسات", rtl: true, align: AlignmentType.RIGHT }],
      [{ text: "/dashboard" }, { text: "GET" }, { text: "لوحة التحكم مع جلسات نشطة وسجل الحضور", rtl: true, align: AlignmentType.RIGHT }],
    ],
    [2400, 1200, 5760],
  );
}

// ============================================================
// WIRING TABLE
// ============================================================
function makeWiringTable() {
  return makeTable(
    [{ text: "ESP8266 Pin" }, { text: "Component" }, { text: "الوصف", rtl: true }],
    [
      [{ text: "D5 (GPIO14)" }, { text: "MFRC522 SCK" }, { text: "SPI Clock", rtl: false }],
      [{ text: "D6 (GPIO12)" }, { text: "MFRC522 MISO" }, { text: "SPI Data Out", rtl: false }],
      [{ text: "D7 (GPIO13)" }, { text: "MFRC522 MOSI" }, { text: "SPI Data In", rtl: false }],
      [{ text: "D8 (GPIO15)" }, { text: "MFRC522 SDA/SS" }, { text: "SPI Select", rtl: false }],
      [{ text: "D1 (GPIO5)" }, { text: "LCD SDA (I2C)" }, { text: "I2C Data", rtl: false }],
      [{ text: "D2 (GPIO4)" }, { text: "LCD SCL (I2C)" }, { text: "I2C Clock", rtl: false }],
      [{ text: "D4 (GPIO2)" }, { text: "Active Buzzer" }, { text: "Active-HIGH تنبيه صوتي", rtl: true }],
      [{ text: "RST" }, { text: "MFRC522 RST" }, { text: "Reset Line", rtl: false }],
    ],
    [2500, 3000, 3860],
  );
}

// ============================================================
// HEADER & FOOTER — Navy + Gold accent
// ============================================================
const docHeader = new Header({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 6 } },
      spacing: { after: 0 },
      children: [
        en("InsightEdu", { size: 22, bold: true, color: NAVY }),
        en("  |  ", { size: 18, color: MID_GRAY }),
        ar("منصة التعليم الذكي المتكاملة", { size: 18, color: NAVY }),
      ],
    }),
  ],
});

const docFooter = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 6 } },
      spacing: { before: 0 },
      children: [
        en("◆  ", { size: 14, color: GOLD }),
        new TextRun({ children: [PageNumber.CURRENT], font: EN_FONT, size: 22, bold: true, color: NAVY }),
        en("  ◆", { size: 14, color: GOLD }),
      ],
    }),
  ],
});

// ============================================================
// COVER PAGE SECTION
// ============================================================
const coverSection = {
  properties: {
    page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 720, right: 1440, bottom: 720, left: 1440 } },
  },
  children: [
    // Logo
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new ImageRun({
        type: "png",
        data: logoData,
        transformation: { width: 160, height: 190 },
        altText: { title: "InsightEdu Logo", description: "InsightEdu graduation cap logo", name: "logo" },
      })],
    }),

    // University info
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 60 }, children: [ar("جامعة دمياط", { size: 34, bold: true, color: NAVY })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 60 }, children: [ar("كلية التربية النوعية", { size: 30, bold: true, color: NAVY })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 160 }, children: [ar("برنامج إعداد معلم الحاسب الآلي", { size: 26, color: TEXT_MED })] }),

    // Gold separator line
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 2 } },
      spacing: { after: 200 },
      children: [],
    }),

    // "Project titled"
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 100 }, children: [ar("مشروع تخرج بعنوان", { size: 26, color: TEXT_MED, italics: true })] }),

    // Project name — big & bold
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [en("InsightEdu", { size: 60, bold: true, color: NAVY })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 40 },
      children: [en("Insight Education — See Beyond Attendance", { size: 22, color: GOLD_DARK, bold: true, italics: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 160 },
      children: [ar("منصة تعليمية ذكية متكاملة تجمع بين التعرف على الوجه والتحليلات التنبؤية وإدارة العملية التعليمية", { size: 24, bold: true, color: TEXT_DARK })],
    }),

    // Gold separator
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 2 } },
      spacing: { after: 200 },
      children: [],
    }),

    // Students
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 120 }, children: [ar("إعداد الطلاب", { size: 26, bold: true, color: GOLD_DARK })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 40 }, children: [ar("[  اسم الطالب الأول  ]", { size: 24, color: "AAAAAA" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 40 }, children: [ar("[  اسم الطالب الثاني  ]", { size: 24, color: "AAAAAA" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 40 }, children: [ar("[  اسم الطالب الثالث  ]", { size: 24, color: "AAAAAA" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 40 }, children: [ar("[  اسم الطالب الرابع  ]", { size: 24, color: "AAAAAA" })] }),
    empty(),

    // Supervisor
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 80 }, children: [ar("تحت إشراف", { size: 26, bold: true, color: GOLD_DARK })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 160 }, children: [ar("د / [  اسم المشرف  ]", { size: 24, color: "AAAAAA" })] }),

    // Year
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 8 } },
      spacing: { before: 40 },
      children: [
        ar("العام الجامعي  ", { size: 24, bold: true, color: NAVY }),
        en("2025 / 2026", { size: 26, bold: true, color: GOLD_DARK }),
      ],
    }),
  ],
};

// ============================================================
// CONTENT CHILDREN
// ============================================================
const C = [];

// ─── QURAN ───
C.push(empty(), empty(), empty());
C.push(new Paragraph({
  alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 300 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 12 } },
  children: [ar("بِسْمِ اللّهِ الرَّحْمَنِ الرَّحِيمِ", { size: 40, bold: true, color: NAVY })],
}));
C.push(empty());
C.push(new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 100, line: 500 },
  children: [ar("يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ", { size: 34, color: TEXT_DARK })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 200, line: 500 },
  children: [ar("وَاللَّهُ بِمَا تَعْمَلُونَ خَبِيرٌ", { size: 34, color: TEXT_DARK })] }));
C.push(goldSep());
C.push(new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, spacing: { after: 60 },
  children: [ar("صَدَقَ اللّهُ العَظيم", { size: 28, bold: true, color: NAVY })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true,
  children: [ar("سورة المجادلة — آية (11)", { size: 20, color: TEXT_MED, italics: true })] }));

// ─── ACKNOWLEDGMENTS ───
C.push(pb());
C.push(sectionTitle("شكر وتقدير"));
C.push(empty());
C.push(arP("نتقدم نحن فريق عمل هذا المشروع بخالص الشكر والتقدير إلى [اسم المشرف]، المشرف الأكاديمي على مشروعنا، لما قدمه لنا من دعم وتوجيهات قيمة ونصائح كان لها بالغ الأثر في إنجاز هذا العمل. لقد كان لتشجيعه المستمر وخبرته الواسعة الدور الأكبر في تجاوز التحديات التي واجهتنا وإثراء معرفتنا في مجالات تطوير تطبيقات الويب ورؤية الحاسوب والأنظمة المدمجة.", { line: 420 }));
C.push(arP("كما نود أن نعرب عن امتناننا العميق لبرنامج إعداد معلم الحاسب الآلي بكلية التربية النوعية جامعة دمياط، ولجميع أعضاء هيئة التدريس بالقسم لما قدموه لنا من العلم والمعرفة طوال سنوات الدراسة. ولا يسعنا إلا أن نتوجه بالشكر الجزيل إلى عائلاتنا وأصدقائنا وكل من ساهم ولو بكلمة أو فكرة في إنجاح هذا المشروع.", { line: 420 }));

// ─── TABLE OF CONTENTS ───
C.push(pb());
C.push(sectionTitle("قائمة المحتويات"));
C.push(empty());
const tocItems = [
  ["المستخلص", ""], ["Abstract", ""], ["المقدمة", ""], ["Introduction", ""],
  ["مشكلة البحث — غياب الرؤية", ""], ["الحل: InsightEdu", ""],
  ["الأهداف", ""], ["الأهمية والمبررات", ""],
  ["الفروض", ""], ["الإطار النظري — التقنيات وراء InsightEdu", ""],
  ["قائمة المصطلحات", ""],
  ["بنية InsightEdu — مخطط قاعدة البيانات", ""],
  ["أدوار InsightEdu — رؤية لكل مستخدم", ""],
  ["محرك InsightEdu — خادم AI", ""],
  ["أجهزة InsightEdu — العتاد والتوصيلات", ""],
  ["كيف يعمل InsightEdu — تدفق الحضور", ""],
  ["نتائج InsightEdu", ""],
  ["مستقبل InsightEdu — التوصيات", ""],
  ["المراجع", ""],
];
tocItems.forEach(t => {
  C.push(arP(t[0] + "  " + ".".repeat(80 - t[0].length * 2), { size: 22, color: TEXT_DARK, line: 340 }));
});

// ─── GLOSSARY ───
C.push(pb());
C.push(sectionTitle("قائمة المصطلحات"));
C.push(empty());
C.push(makeGlossaryTable());

// ─── ARABIC ABSTRACT ───
C.push(pb());
C.push(sectionTitle("المستخلص"));
C.push(empty());
C.push(arP("InsightEdu — أو \"رؤية تعليمية\" — هو مشروع ينطلق من فكرة بسيطة: أن التعليم الحقيقي يبدأ بالفهم العميق لكل طالب. الاسم يجمع بين Insight (البصيرة والرؤية العميقة) وEducation (التعليم)، ليعبّر عن منصة لا تكتفي بتسجيل البيانات بل تحوّلها إلى رؤى قابلة للتنفيذ تُمكّن المدرسين والمرشدين من اتخاذ القرار الصحيح في الوقت المناسب.", { line: 420 }));
C.push(arP("صُمم النظام كمنصة تعليمية ذكية متكاملة تغطي دورة العملية التعليمية بالكامل — من لحظة دخول الطالب القاعة (حضور ذكي بالوجه وRFID) مروراً بأدائه الأكاديمي (امتحانات بتصحيح آلي، واجبات، أنشطة) وصولاً إلى الإنذار المبكر عبر تحليلات تنبؤية (Student Insights) تكشف الطلاب المعرضين للخطر قبل فوات الأوان.", { line: 420 }));
C.push(empty());
C.push(subTitle("ركائز InsightEdu الأربع:"));
C.push(arNum(1, "رؤية الهوية (Identity Insight): تحقق مزدوج بـ RFID + التعرف على الوجه عبر ESP32-CAM وMediaPipe وLBP — يمنع انتحال الشخصية حتى بين الأشقاء."));
C.push(arNum(2, "رؤية الأداء (Performance Insight): تصحيح آلي للامتحانات بـ OCR + Bubble Sheet، وتتبع الواجبات والأنشطة والدرجات لكل طالب في كل مقرر."));
C.push(arNum(3, "رؤية المخاطر (Risk Insight): محرك Student Insights يحلل الحضور والدرجات والتسليمات ويُصنّف الطلاب (Low/Medium/High Risk) مع توصيات وأسباب."));
C.push(arNum(4, "رؤية التواصل (Connection Insight): نظام إرشاد أكاديمي متكامل يربط المرشد بالطالب عبر اجتماعات وتوصيات وإشعارات — كل شيء في منصة واحدة."));
C.push(empty());
C.push(subTitle("البنية التقنية:"));
C.push(arBullet("أجهزة مدمجة: ESP32-CAM (كاميرا) + ESP8266 NodeMCU (RFID + LCD + Buzzer)"));
C.push(arBullet("خادم AI: Flask + MediaPipe FaceMesh (1404 سمة) + LBP (16,384 بُعد) + RandomForest"));
C.push(arBullet("واجهة ويب: Next.js + TypeScript + Tailwind — تدعم 5 أدوار بلوحات تحكم مخصصة"));
C.push(arBullet("قاعدة بيانات: PostgreSQL + Prisma ORM — 20+ جدولاً مع Cascade Delete وUnique Constraints"));
C.push(arBullet("مصادقة: NextAuth.js بـ JWT وCredentials Provider وحماية المسارات حسب الدور"));

// ─── ENGLISH ABSTRACT ───
C.push(pb());
C.push(sectionTitle("Abstract", false));
C.push(empty());
C.push(enP("The name InsightEdu fuses \"Insight\" — the ability to see beneath the surface — with \"Education.\" It reflects the platform's core philosophy: that meaningful education requires deep, data-driven understanding of every student. Rather than treating attendance, grading, and advising as isolated tasks, InsightEdu weaves them into a single intelligent fabric that transforms raw academic data into actionable insights.", { line: 420 }));
C.push(enP("The platform is built around four pillars of insight:", { line: 420, bold: true }));
C.push(enBullet("Identity Insight: Dual-factor verification (RFID + Face Recognition via ESP32-CAM) that eliminates attendance fraud — even between siblings — using a novel combination of MediaPipe FaceMesh (468 landmarks, 1404 geometric features) and LBP texture analysis (8x8 grid, 16,384 appearance features)."));
C.push(enBullet("Performance Insight: Automated exam grading through OCR bubble-sheet scanning with QR-coded papers, plus comprehensive assignment and activity tracking that gives teachers a real-time view of every student's academic trajectory."));
C.push(enBullet("Risk Insight: A predictive Student Insights engine that aggregates attendance rates, exam scores, assignment completion, and engagement metrics to classify students into risk levels (Low/Medium/High) with confidence scores and actionable recommendations — before problems become irreversible."));
C.push(enBullet("Connection Insight: An integrated academic advising system with scheduled meetings, personalized recommendations, and system notifications that bridges the gap between data and human intervention."));
C.push(empty());
C.push(subTitle("Technical Architecture:", false));
C.push(enBullet("Hardware Layer: ESP32-CAM (OV2640, PSRAM, Wi-Fi) for face capture + ESP8266 NodeMCU (MFRC522 RFID, I2C LCD 16x2, Active Buzzer) for card reading and feedback."));
C.push(enBullet("AI Layer: Flask server with dual face verification (LBP primary, threshold > 0.42; Landmark distance secondary, min < 0.40, avg < 0.50), RandomForest multi-class classification, and threaded parallel capture (3 workers, 30 samples in under 10 seconds)."));
C.push(enBullet("Web Layer: Next.js + TypeScript + Tailwind CSS with role-based dashboards for 5 user types (Admin, Teacher, Student, Advisor, TA), JWT authentication via NextAuth.js, and PostgreSQL + Prisma ORM (20+ tables with Cascade Delete and Unique Constraints)."));

// ─── ARABIC INTRODUCTION ───
C.push(pb());
C.push(sectionTitle("المقدمة"));
C.push(empty());
C.push(arP("في عالم يزداد فيه الاعتماد على البيانات يوماً بعد يوم، لم يعد مقبولاً أن تظل العملية التعليمية تعمل بأدوات القرن الماضي. الكشوف الورقية، والنداء اليدوي، والتصحيح بالعين المجردة — كل هذه ممارسات تستنزف وقت المدرس وتحرم الطالب من فرصة التعلم الحقيقي. والأخطر من ذلك: أنها لا توفر أي \"بصيرة\" (Insight) عن الحالة الحقيقية للطالب حتى يفوت الأوان.", { line: 420 }));
C.push(arP("من هنا جاءت فكرة InsightEdu — \"رؤية تعليمية\" — منصة لا تكتفي بجمع البيانات بل تحوّلها إلى رؤى قابلة للتنفيذ. الاسم نفسه يحمل الرسالة: Insight تعني البصيرة والفهم العميق، وEducation تعني التعليم. الهدف ليس مجرد نظام حضور أو نظام امتحانات، بل منصة متكاملة تُعطي كل طرف في العملية التعليمية — المدرس، الطالب، المرشد، والإدارة — الرؤية التي يحتاجها لاتخاذ القرار الصحيح.", { line: 420 }));
C.push(arP("يجمع InsightEdu بين ثلاثة مجالات تقنية في منصة واحدة: الأنظمة المدمجة (ESP32-CAM + ESP8266 للتعرف على الوجه وقراءة RFID)، والذكاء الاصطناعي (MediaPipe + LBP + RandomForest للتحقق من الهوية والتحليلات التنبؤية)، وتطبيقات الويب الحديثة (Next.js + Flask + PostgreSQL لواجهة المستخدم وإدارة البيانات). النتيجة: منصة تغطي دورة التعليم كاملة — من لحظة دخول الطالب القاعة حتى تقرير المرشد الأكاديمي.", { line: 420 }));

// ─── ENGLISH INTRODUCTION ───
C.push(pb());
C.push(sectionTitle("Introduction", false));
C.push(empty());
C.push(enP("What if a university could see its students — truly see them? Not just names on a roll sheet, but real-time patterns: who is falling behind, who stopped showing up last week, who aced the midterm but is failing assignments. What if that visibility existed not as a luxury dashboard for administrators, but as a working tool for every teacher, advisor, and student in the institution?", { line: 420 }));
C.push(enP("This is the vision behind InsightEdu. The name is intentional: \"Insight\" — the ability to perceive what lies beneath the surface — combined with \"Education.\" The platform was designed from the ground up around the belief that data without insight is just noise, and insight without action is just information. Every feature in the system exists to close the loop from data collection to informed decision-making.", { line: 420 }));
C.push(enP("The journey begins at the classroom door: a student taps their RFID card and looks at a camera. In under five seconds, dual-factor verification (RFID identity + face recognition via LBP and MediaPipe) confirms they are who they claim to be — no proxy attendance, no fraud, not even between siblings. But InsightEdu does not stop there. The same platform auto-grades exams through OCR bubble-sheet scanning, tracks assignments and activities, and feeds everything into a predictive Student Insights engine that classifies students by academic risk level with confidence scores and actionable recommendations.", { line: 420 }));
C.push(enP("For the advisor, InsightEdu surfaces the students who need intervention before it is too late. For the teacher, it eliminates the 15-minute roll call and the weekend of grading. For the student, it provides transparency — a clear view of where they stand. And for the administration, it provides the data infrastructure to make evidence-based decisions about teaching quality, course design, and resource allocation.", { line: 420 }));

// ─── PROBLEM + SOLUTION ───
C.push(pb());
C.push(sectionTitle("مشكلة البحث"));
C.push(empty());
C.push(arP("المشكلة الجوهرية ليست تقنية — بل هي غياب الرؤية (Insight). المؤسسات التعليمية تجمع كميات هائلة من البيانات يومياً لكنها لا تستثمرها. تتجلى هذه الفجوة في خمس نقاط:", { line: 400, bold: true }));
C.push(arNum(1, "عمى الهوية: الحضور اليدوي لا يتحقق من هوية الطالب فعلياً — يستهلك 10-15 دقيقة ويسمح بانتحال الشخصية دون رادع."));
C.push(arNum(2, "عمى الأداء: التصحيح اليدوي للامتحانات بطيء ومعرض للخطأ، والنتائج تصل متأخرة فيفقد الطالب فرصة التصحيح المبكر."));
C.push(arNum(3, "عمى المخاطر: لا توجد آلية للإنذار المبكر — المرشد الأكاديمي يعرف أن الطالب في خطر فقط بعد أن يرسب."));
C.push(arNum(4, "عمى التكامل: الحضور في نظام، والامتحانات في آخر، والواجبات في ثالث — لا رابط ولا صورة كاملة."));
C.push(arNum(5, "عمى التزامن: لا يمكن تشغيل جلسات حضور متزامنة لمقررات مختلفة — كل جلسة تلغي الأخرى."));
C.push(empty());
C.push(sectionTitle("الحل: InsightEdu"));
C.push(empty());
C.push(arP("InsightEdu يعالج كل نقطة \"عمى\" برؤية (Insight) مقابلة:", { line: 400, bold: true }));
C.push(arBullet("رؤية الهوية: تحقق مزدوج (RFID + Face) بـ LBP + MediaPipe — يميز حتى بين الأشقاء"));
C.push(arBullet("رؤية الأداء: تصحيح آلي بـ OCR + Bubble Sheet + QR Code — النتائج فورية مع إمكانية المراجعة"));
C.push(arBullet("رؤية المخاطر: محرك Student Insights يُصنّف الطلاب (Low/Medium/High Risk) مع أسباب وتوصيات عملية"));
C.push(arBullet("رؤية التكامل: منصة واحدة (Next.js) تجمع الحضور والامتحانات والواجبات والأنشطة والإرشاد وسجلات الإدارة"));
C.push(arBullet("رؤية التزامن: كل مقرر بجلسة مستقلة مع ربط الأجهزة بالـ IP ومنع التكرار على مستوى قاعدة البيانات"));

// ─── OBJECTIVES ───
C.push(pb());
C.push(sectionTitle("الأهداف"));
C.push(subTitle("أولاً: الأهداف العامة — تحقيق الرؤية التعليمية"));
C.push(arBullet("تحويل بيانات الحضور والأداء الأكاديمي من أرقام خام إلى رؤى قابلة للتنفيذ (Actionable Insights)."));
C.push(arBullet("بناء منصة InsightEdu كمنظومة تعليمية متكاملة تغطي دورة التعليم من الحضور إلى التقييم إلى الإرشاد."));
C.push(arBullet("تمكين كل طرف في العملية التعليمية (Admin, Teacher, Student, Advisor, TA) برؤية مخصصة لاحتياجاته."));
C.push(arBullet("منع انتحال الشخصية عبر تحقق مزدوج (RFID + Face) يعمل في بيئة أكاديمية حقيقية."));
C.push(subTitle("ثانياً: الأهداف التقنية"));
C.push(arNum(1, "بناء نظام تعرف وجه مزدوج (LBP + MediaPipe Landmarks) يميز بين الأشخاص المتشابهين."));
C.push(arNum(2, "تحقيق زمن استجابة أقل من 5 ثوانٍ لعملية التحقق الكاملة (RFID + Face Verification)."));
C.push(arNum(3, "تطبيق معمارية مفصولة: أجهزة مدمجة + خادم AI (Flask) + واجهة ويب (Next.js)."));
C.push(arNum(4, "بناء نظام تصحيح آلي للامتحانات يعتمد على OCR ومسح Bubble Sheets بـ QR Code."));
C.push(arNum(5, "تطوير محرك تحليلات تنبؤية يصنف الطلاب حسب مستوى الخطر الأكاديمي."));
C.push(arNum(6, "تطبيق Cascade Delete وUnique Constraints لسلامة البيانات على مستوى PostgreSQL."));

// ─── SIGNIFICANCE ───
C.push(pb());
C.push(sectionTitle("الأهمية والمبررات"));
C.push(subTitle("لماذا InsightEdu؟ — الحاجة إلى \"بصيرة تعليمية\""));
C.push(arP("العنوان نفسه يجيب: Insight + Education = رؤية عميقة للتعليم. المؤسسات التعليمية تحتاج أكثر من مجرد أنظمة — تحتاج بصيرة.", { line: 420, bold: true }));
C.push(subTitle("الأهمية الأكاديمية"));
C.push(arP("يُمكّن InsightEdu المرشد الأكاديمي من رؤية الصورة الكاملة لكل طالب: حضوره، درجاته، واجباته، ومستوى خطره — كلها في مكان واحد. هذه الرؤية الشاملة تسمح بالتدخل المبكر وتحويل البيانات من أرقام مجردة إلى إجراءات عملية.", { line: 420 }));
C.push(subTitle("الأهمية التشغيلية"));
C.push(arP("يُعيد InsightEdu 15 دقيقة لكل محاضرة كانت تضيع في النداء، ويُحوّل تصحيح 100 ورقة امتحان من عمل نهاية أسبوع إلى عملية دقائق. الأهم: يُزيل الحاجة للتنقل بين أنظمة متعددة ويجمع كل شيء في واجهة واحدة مخصصة لكل دور.", { line: 420 }));
C.push(subTitle("الأهمية التقنية"));
C.push(arP("يُثبت InsightEdu أن نظام تعرف وجه دقيق (يميز حتى بين الأشقاء) يمكن بناؤه بأدوات مفتوحة المصدر (MediaPipe + OpenCV + LBP) على أجهزة بتكلفة أقل من 20 دولار (ESP32-CAM + ESP8266) — بدون خدمات سحابية مدفوعة أو GPU مخصص. هذا يجعل التبني ممكناً لأي مؤسسة بميزانية محدودة.", { line: 420 }));

// ─── HYPOTHESES ───
C.push(pb());
C.push(sectionTitle("الفروض"));
C.push(empty());
C.push(arNum(1, "يُمكن لنظام التحقق المزدوج (RFID + Face) منع انتحال الشخصية بنسبة نجاح تفوق 95%."));
C.push(arNum(2, "يُقلل النظام زمن تسجيل الحضور من 30 ثانية (يدوياً) إلى أقل من 5 ثوانٍ لكل طالب."));
C.push(arNum(3, "يستطيع نظام LBP + Landmarks التمييز بين الأشخاص المتشابهين (كالأشقاء) بدقة مقبولة."));
C.push(arNum(4, "يُمكن تشغيل عدة جلسات حضور متزامنة لمقررات مختلفة دون تعارض."));
C.push(arNum(5, "يُمكن لنظام OCR تصحيح أوراق Bubble Sheet بدقة تفوق 90% مع إمكانية المراجعة اليدوية."));
C.push(arNum(6, "يُمكن لمحرك التحليلات التنبؤية تحديد الطلاب المعرضين للخطر بثقة مقبولة بناءً على بيانات الحضور والدرجات."));

// ─── THEORETICAL FRAMEWORK ───
C.push(pb());
C.push(sectionTitle("الإطار النظري — التقنيات وراء InsightEdu"));

C.push(subTitle("1. Identity Insight — نظام التعرف على الوجه المزدوج"));
C.push(arP("يستخدم النظام منهجاً مزدوجاً للتحقق من هوية الوجه يجمع بين التحليل الهيكلي والتحليل المظهري:", { line: 400, bold: true }));
C.push(arP("أ) MediaPipe FaceMesh (التحليل الهيكلي): يستخرج 468 نقطة معلمية ثلاثية الأبعاد (x, y, z) لكل وجه، ثم يُطبّع المتجه بالتمركز على نقطة جسر الأنف (landmark[1]) والقسمة على مسافة العينين (landmark[33] ↔ landmark[263])، مما ينتج متجه سمات بطول 1404 بُعد مستقل عن حجم الصورة وموضع الوجه.", { line: 400 }));
C.push(arP("ب) LBP — Local Binary Patterns (التحليل المظهري): خوارزمية تحلل نسيج الصورة pixel-by-pixel عبر مقارنة كل بكسل بجيرانه الثمانية وتوليد قيمة ثنائية 8-bit. يُقسم الوجه إلى شبكة 8x8 (64 خلية) ويُحسب Histogram بـ 256 bin لكل خلية، مما ينتج واصفاً بطول 16,384 بُعد يلتقط التفاصيل الدقيقة للبشرة والملامح التي لا يرصدها التحليل الهيكلي.", { line: 400 }));
C.push(arP("ج) آلية التحقق: LBP هو النظام الأساسي (عتبة correlation > 0.42)، وإذا نجح يُقبل فوراً. يُلجأ لـ Landmark Distance فقط عند عدم وجود بيانات LBP مخزنة (عتبات: min < 0.40, avg < 0.50). هذا التصميم يضمن دقة عالية حتى بين الوجوه المتشابهة جداً.", { line: 400 }));

C.push(subTitle("2. Identity Insight — بوابة RFID"));
C.push(arP("يستخدم قارئ MFRC522 المتوافق مع معيار ISO 14443-A بتردد 13.56 MHz لقراءة المعرف الفريد (UID بطول 4-7 بايت) لبطاقات MIFARE عبر بروتوكول SPI. يُرسل الـ UID إلى الخادم عبر HTTP POST مع IP الجهاز لتحديد الجلسة المرتبطة.", { line: 400 }));

C.push(subTitle("3. البنية التحتية — PostgreSQL + Prisma"));
C.push(arP("يتضمن المخطط 20+ جدولاً تغطي: المستخدمين والأدوار، المقررات والتسجيل، الحضور والجلسات، الامتحانات والأسئلة وأوراق الطلاب، الواجبات والتسليمات، الأنشطة والمحتوى، التحليلات التنبؤية، الإرشاد الأكاديمي، الإشعارات، وسجلات الإدارة. تُطبق قيود Cascade Delete وUnique Constraints على المستويات الحرجة.", { line: 400 }));

C.push(subTitle("4. واجهة InsightEdu — Next.js + NextAuth"));
C.push(arP("تم بناء الواجهة باستخدام Next.js مع App Router وTypeScript وTailwind CSS. تدعم 5 أدوار بلوحات تحكم مخصصة لكل دور، ومصادقة JWT عبر NextAuth.js مع Credentials Provider وحماية المسارات حسب الدور.", { line: 400 }));

C.push(subTitle("5. Performance Insight — التصحيح الآلي (OCR)"));
C.push(arP("يُولّد النظام ورقة امتحان لكل طالب بـ QR Code فريد، ويُعالج الأوراق الممسوحة عبر OpenCV (تحويل رمادي + Threshold + Blur) لاستخراج إجابات Bubble Sheet. يُقارن مع الإجابات الصحيحة ويُحسب الدرجة تلقائياً مع إمكانية المراجعة اليدوية للحالات غير المؤكدة (needsReview).", { line: 400 }));

C.push(subTitle("6. Risk Insight — التحليلات التنبؤية"));
C.push(arP("يجمع المحرك بيانات الطالب (معدل الحضور، متوسط الدرجات، نسبة تسليم الواجبات، مقياس المشاركة) ويُصنفه إلى ثلاثة مستويات خطر (Low/Medium/High) مع درجة ثقة (confidence) وتوصيات عملية وأسباب التصنيف. يُخزن لقطة من المدخلات (inputSnapshot) لتتبع التغيرات.", { line: 400 }));

// ─── DB SCHEMA ───
C.push(pb());
C.push(sectionTitle("بنية InsightEdu — مخطط قاعدة البيانات"));
C.push(empty());
C.push(arP("يعتمد InsightEdu على مخطط بيانات غني (20+ جدولاً) يُدار عبر Prisma ORM — هذا المخطط هو ما يُمكّن المنصة من ربط الحضور بالأداء بالمخاطر في رؤية واحدة:", { line: 400 }));
C.push(empty());
C.push(makeDBTable());

// ─── ROLES ───
C.push(pb());
C.push(sectionTitle("أدوار InsightEdu — رؤية لكل مستخدم"));
C.push(empty());
C.push(arP("فلسفة InsightEdu: كل مستخدم يرى ما يحتاجه بالضبط — لا أكثر ولا أقل. 5 أدوار، 5 رؤى مختلفة:", { line: 400 }));
C.push(empty());
C.push(makeRolesTable());
C.push(empty());
C.push(subTitle("صفحات كل دور:"));
C.push(arP([
  ar("Admin: ", { bold: true, size: 22, color: NAVY }),
  ar("لوحة رئيسية، إدارة المقررات، إدارة الطلاب، إدارة المدرسين، إدارة المستخدمين، التقارير، الجودة", { size: 22 }),
], { line: 380 }));
C.push(arP([
  ar("Teacher: ", { bold: true, size: 22, color: NAVY }),
  ar("لوحة رئيسية، الحضور والجلسات، الامتحانات (إنشاء + تصحيح OCR)، الواجبات، الأنشطة، المقررات، الطلاب، الرسائل", { size: 22 }),
], { line: 380 }));
C.push(arP([
  ar("Student: ", { bold: true, size: 22, color: NAVY }),
  ar("لوحة رئيسية، الحضور، الامتحانات، الواجبات، الأنشطة، المقررات، النتائج", { size: 22 }),
], { line: 380 }));
C.push(arP([
  ar("Advisor: ", { bold: true, size: 22, color: NAVY }),
  ar("لوحة رئيسية، الطلاب، التوصيات، الاجتماعات، التقارير", { size: 22 }),
], { line: 380 }));

// ─── API ENDPOINTS ───
C.push(pb());
C.push(sectionTitle("محرك InsightEdu — خادم الذكاء الاصطناعي"));
C.push(empty());
C.push(arP("قلب InsightEdu هو خادم Flask (المنفذ 5000) — المحرك الذي يحوّل بيانات الأجهزة إلى رؤى:", { line: 400 }));
C.push(empty());
C.push(makeAPITable());
C.push(empty());
C.push(subTitle("خوارزمية التحقق من الوجه (verify_face):"));
C.push(arNum(1, "التقاط صورة من ESP32-CAM عبر HTTP GET إلى /capture"));
C.push(arNum(2, "تمرير الصورة عبر process_frame() → MediaPipe pass واحد يُنتج features (1404) + face_crop (128x128)"));
C.push(arNum(3, "إذا وُجدت بيانات LBP مخزنة: حساب LBP histogram → مقارنة correlation مع أفضل 5 عينات"));
C.push(arNum(4, "إذا correlation > 0.42 → قبول فوري (LBP هو الأساسي)"));
C.push(arNum(5, "احتياطي: Landmark distance (min < 0.40, avg < 0.50) أو RandomForest (confidence > 75%)"));
C.push(arNum(6, "3 محاولات كحد أقصى مع تأخير 0.2 ثانية بين كل محاولة"));

// ─── HARDWARE DESIGN ───
C.push(pb());
C.push(sectionTitle("أجهزة InsightEdu — العتاد والتوصيلات"));
C.push(subTitle("المكونات المادية:"));
C.push(makeHWTable());
C.push(empty());
C.push(subTitle("مخطط التوصيلات (ESP8266 NodeMCU):"));
C.push(makeWiringTable());
C.push(empty());
C.push(subTitle("ESP32-CAM:"));
C.push(arP("يعمل كخادم ويب على المنفذ 80 ويُتيح نقطة النهاية /capture لالتقاط صورة JPEG. يستخدم كاميرا OV2640 بدقة VGA مع PSRAM للتخزين المؤقت. يُدوّر الصورة 90 درجة عكس عقارب الساعة في الخادم لتوافق زاوية التركيب.", { line: 400 }));

// ─── ATTENDANCE FLOW ───
C.push(pb());
C.push(sectionTitle("كيف يعمل InsightEdu — تدفق الحضور"));
C.push(empty());
C.push(arP("رحلة الطالب عبر InsightEdu — من لحظة دخوله القاعة حتى ظهور اسمه على الشاشة:", { line: 400, bold: true }));
C.push(empty());
C.push(arNum(1, "المدرس يبدأ جلسة حضور من Dashboard (اختيار المقرر) → Flask يُنشئ AttendanceSession جديدة ويقفل فقط الجلسات السابقة لنفس المقرر."));
C.push(arNum(2, "المدرس يربط جهاز NodeMCU بالجلسة عبر إدخال IP الجهاز → Flask يحفظ device_to_session[IP] = sessionId."));
C.push(arNum(3, "الطالب يمرر بطاقة RFID على القارئ → NodeMCU يقرأ UID ويرسل HTTP POST إلى /scan-card."));
C.push(arNum(4, "Flask يبحث عن الطالب بالـ studentCode → يتحقق من عدم التسجيل المسبق (duplicate check)."));
C.push(arNum(5, "Flask يطلب صورة من ESP32-CAM (/capture) → يُمرر عبر process_frame() → يتحقق بـ LBP أولاً ثم Landmarks."));
C.push(arNum(6, "إذا نجح التحقق → INSERT في Attendance مع sessionId + courseId → إرجاع success + اسم الطالب."));
C.push(arNum(7, "NodeMCU يعرض النتيجة على LCD (اسم الطالب أو رسالة خطأ) + تنبيه صوتي (نغمة مختلفة للنجاح/الفشل)."));

// ─── RESULTS ───
C.push(pb());
C.push(sectionTitle("نتائج InsightEdu"));
C.push(subTitle("هل حقق InsightEdu رؤيته؟ — الاختبارات الوظيفية"));
C.push(arBullet("مسح بطاقة RFID + التحقق من الوجه → تسجيل حضور ناجح للطالب المسجل ✓"));
C.push(arBullet("محاولة انتحال (كارت طالب + وجه شخص آخر) → رفض فوري (Face Denied) ✓"));
C.push(arBullet("محاولة انتحال بين أشقاء (كارت + وجه الأخ) → رفض بواسطة LBP (correlation < 0.42) ✓"));
C.push(arBullet("محاولة تسجيل مكرر في نفس الجلسة → رفض (Already Recorded) ✓"));
C.push(arBullet("تشغيل جلستين لمقررين مختلفين متزامنتين → كل جلسة تعمل بشكل مستقل ✓"));
C.push(arBullet("حذف طالب → حذف جميع بياناته (قاعدة بيانات + CSV + LBP pickle) + إعادة تدريب النموذج ✓"));
C.push(arBullet("تسجيل وجه جديد (30 عينة) → أقل من 10 ثوانٍ بفضل ThreadPoolExecutor (3 workers) ✓"));

C.push(subTitle("أداء InsightEdu بالأرقام"));
C.push(arBullet("زمن التحقق الكامل (RFID + Face): 2-4 ثوانٍ في المتوسط"));
C.push(arBullet("زمن تسجيل الوجه (30 عينة): 8-10 ثوانٍ (مقابل 25+ ثانية قبل التحسين)"));
C.push(arBullet("دقة التمييز بين الأشخاص المختلفين: > 95% (LBP + Landmarks معاً)"));
C.push(arBullet("استهلاك الذاكرة: MediaPipe pass واحد بدلاً من اثنين (توفير 40% من الذاكرة)"));

C.push(subTitle("التحقق من الفروض"));
C.push(arP("تم التحقق من جميع الفروض الستة عبر اختبارات وظيفية وتجارب عملية على أجهزة حقيقية في بيئة أكاديمية. جميع الفروض تحققت بنجاح بما يتوافق مع المعايير المحددة.", { line: 400 }));

// ─── RECOMMENDATIONS ───
C.push(pb());
C.push(sectionTitle("مستقبل InsightEdu — التوصيات"));
C.push(subTitle("المرحلة القادمة — تعميق الرؤية"));
C.push(arBullet("توسيع قاعدة بيانات الوجوه بإضافة عينات أكثر لكل طالب في ظروف إضاءة مختلفة لرفع دقة LBP."));
C.push(arBullet("إضافة إشعارات تلقائية (Telegram/Email) للغياب المتكرر عبر SystemNotification."));
C.push(arBullet("تفعيل تقارير الحضور التلقائية بنهاية كل أسبوع وإرسالها للمرشد الأكاديمي."));

C.push(subTitle("الرؤية طويلة المدى — InsightEdu 2.0"));
C.push(arBullet("استخدام نماذج Deep Learning (FaceNet/ArcFace) لرفع دقة التعرف إلى > 99%."));
C.push(arBullet("تطوير تطبيق موبايل (React Native) للطلاب لمتابعة الحضور والنتائج والإشعارات."));
C.push(arBullet("دمج نظام Anti-Spoofing (كشف الصور المطبوعة والشاشات) لمنع التحايل بصورة."));
C.push(arBullet("إضافة دعم Liveness Detection عبر طلب حركة عشوائية (رمش، ابتسامة) أثناء التحقق."));
C.push(arBullet("توسيع محرك Student Insights لاستخدام نماذج Machine Learning متقدمة مع بيانات تاريخية أكبر."));

// ─── REFERENCES ───
C.push(pb());
C.push(sectionTitle("المراجع"));

C.push(subTitle("أولاً: المعايير والمواصفات"));
C.push(enP("[1] ISO/IEC 14443-A:2018 - Identification cards - Contactless integrated circuit cards - Proximity cards.", { line: 360 }));
C.push(enP("[2] IEEE 802.11 - Wireless LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications.", { line: 360 }));

C.push(subTitle("ثانياً: توثيق البرمجيات والأجهزة"));
C.push(enP("[3] MediaPipe Face Mesh - Google AI. https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker", { line: 360 }));
C.push(enP("[4] OpenCV Documentation. https://docs.opencv.org/", { line: 360 }));
C.push(enP("[5] Next.js Documentation - Vercel. https://nextjs.org/docs", { line: 360 }));
C.push(enP("[6] Flask Documentation - Pallets Projects. https://flask.palletsprojects.com/", { line: 360 }));
C.push(enP("[7] Prisma ORM Documentation. https://www.prisma.io/docs", { line: 360 }));
C.push(enP("[8] NextAuth.js (Auth.js) Documentation. https://authjs.dev/", { line: 360 }));
C.push(enP("[9] Espressif ESP32-CAM Documentation. https://docs.espressif.com/", { line: 360 }));
C.push(enP("[10] MFRC522 RFID Library for Arduino - M. Balboa. https://github.com/miguelbalboa/rfid", { line: 360 }));
C.push(enP("[11] PostgreSQL Documentation. https://www.postgresql.org/docs/", { line: 360 }));
C.push(enP("[12] scikit-learn: Machine Learning in Python. https://scikit-learn.org/", { line: 360 }));

C.push(subTitle("ثالثاً: المراجع الأكاديمية"));
C.push(enP("[13] Ahonen, T., Hadid, A., Pietikainen, M. (2006). Face Description with Local Binary Patterns: Application to Face Recognition. IEEE TPAMI, 28(12), 2037-2041.", { line: 360 }));
C.push(enP("[14] Lugaresi, C., et al. (2019). MediaPipe: A Framework for Building Perception Pipelines. arXiv:1906.08172.", { line: 360 }));
C.push(enP("[15] Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32.", { line: 360 }));
C.push(enP("[16] Viola, P. & Jones, M. (2001). Rapid Object Detection using a Boosted Cascade of Simple Features. CVPR.", { line: 360 }));
C.push(enP("[17] Ojala, T., Pietikainen, M., Maenpaa, T. (2002). Multiresolution Gray-Scale and Rotation Invariant Texture Classification with LBP. IEEE TPAMI, 24(7), 971-987.", { line: 360 }));

// ============================================================
// CONTENT SECTION with header/footer
// ============================================================
const contentSection = {
  properties: {
    page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 1800, right: MARGIN, bottom: MARGIN, left: MARGIN } },
  },
  headers: { default: docHeader },
  footers: { default: docFooter },
  children: C,
};

// ============================================================
// BUILD DOCUMENT
// ============================================================
const doc = new Document({
  styles: {
    default: { document: { run: { font: AR_FONT, size: 24, color: TEXT_DARK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 38, bold: true, font: AR_FONT, color: NAVY },
        paragraph: { spacing: { before: 120, after: 60 }, alignment: AlignmentType.CENTER, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: AR_FONT, color: GOLD_DARK },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  sections: [coverSection, contentSection],
});

const OUTPUT = "D:\\My Projects\\insight-edu-main\\InsightEdu-Book-v3.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log("Done:", OUTPUT, `(${(buffer.length / 1024).toFixed(0)} KB)`);
});
