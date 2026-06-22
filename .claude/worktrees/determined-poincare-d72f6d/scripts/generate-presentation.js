const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const NAVY = "1B2A4A";
const GOLD = "F5A623";
const DARK_NAVY = "0F1A2E";
const LIGHT_BG = "F8F9FC";
const WHITE = "FFFFFF";
const LIGHT_GOLD = "FFF8E8";
const MUTED = "6B7B9A";
const BODY_COLOR = "2D3748";

const logoPath = path.resolve(__dirname, "../public/logo.png");
const logoData = "image/png;base64," + fs.readFileSync(logoPath).toString("base64");

let uniLogoData = null;
const uniLogoPath = path.resolve(__dirname, "../public/uni-logo.png");
if (fs.existsSync(uniLogoPath)) {
  uniLogoData = "image/png;base64," + fs.readFileSync(uniLogoPath).toString("base64");
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "InsightEdu Team";
pres.title = "InsightEdu - مشروع التخرج";

const makeShadow = () => ({
  type: "outer",
  color: "000000",
  blur: 8,
  offset: 3,
  angle: 45,
  opacity: 0.18,
});

function addFooter(slide, slideNum, total) {
  slide.addText(`${slideNum} / ${total}`, {
    x: 4.2,
    y: 5.2,
    w: 1.6,
    h: 0.35,
    fontSize: 9,
    color: MUTED,
    align: "center",
  });
  slide.addImage({
    data: logoData,
    x: 9.2,
    y: 5.05,
    w: 0.45,
    h: 0.45,
  });
}

const TOTAL_SLIDES = 20;
let slideNum = 0;

// ============================================================
// SLIDE 1: TITLE
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: DARK_NAVY };

  slide.addImage({
    data: logoData,
    x: 3.75,
    y: 0.4,
    w: 2.5,
    h: 2.5,
  });

  slide.addText("InsightEdu", {
    x: 0.5,
    y: 3.0,
    w: 9,
    h: 0.8,
    fontSize: 44,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
    align: "center",
    charSpacing: 4,
  });

  slide.addText("رؤية تعليمية ذكية", {
    x: 0.5,
    y: 3.7,
    w: 9,
    h: 0.5,
    fontSize: 22,
    fontFace: "Calibri",
    color: GOLD,
    align: "center",
  });

  slide.addText("Smart Educational Insight Platform", {
    x: 0.5,
    y: 4.1,
    w: 9,
    h: 0.4,
    fontSize: 14,
    fontFace: "Calibri",
    color: MUTED,
    align: "center",
  });

  slide.addText("مشروع تخرج — جامعة دمياط | كلية التربية النوعية | برنامج إعداد معلم الحاسب الآلي", {
    x: 0.5,
    y: 4.7,
    w: 9,
    h: 0.35,
    fontSize: 11,
    fontFace: "Calibri",
    color: MUTED,
    align: "center",
  });

  slide.addText("2024 / 2025", {
    x: 0.5,
    y: 5.05,
    w: 9,
    h: 0.35,
    fontSize: 12,
    fontFace: "Calibri",
    color: GOLD,
    align: "center",
  });

  slide.addNotes(
    "السلام عليكم ورحمة الله وبركاته. يسعدنا أن نقدم لحضراتكم مشروع InsightEdu — منصة تعليمية ذكية تعتمد على الذكاء الاصطناعي لتحقيق رؤية تعليمية شاملة."
  );
}

// ============================================================
// SLIDE 2: TEAM
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("فريق العمل", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 36,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  const team = [
    "أحمد وجيه عبدالعاطي",
    "محمد أبوهيبة",
    "يوسف محمد",
    "عبدالرحمن علي",
  ];

  const supervisors = [
    "تحت إشراف أ.د/ ...",
    "م/ ...",
  ];

  team.forEach((name, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 1.0 + col * 4.2;
    const y = 1.4 + row * 1.5;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 3.8,
      h: 1.1,
      fill: { color: WHITE },
      rectRadius: 0.1,
      shadow: makeShadow(),
    });

    slide.addText(name, {
      x,
      y,
      w: 3.8,
      h: 0.7,
      fontSize: 18,
      fontFace: "Calibri",
      bold: true,
      color: NAVY,
      align: "center",
      valign: "bottom",
      margin: 0,
    });

    slide.addText("طالب — برنامج إعداد معلم الحاسب الآلي", {
      x,
      y: y + 0.6,
      w: 3.8,
      h: 0.4,
      fontSize: 10,
      fontFace: "Calibri",
      color: MUTED,
      align: "center",
      margin: 0,
    });
  });

  slide.addText("الإشراف الأكاديمي", {
    x: 0.5,
    y: 4.3,
    w: 9,
    h: 0.4,
    fontSize: 16,
    fontFace: "Calibri",
    bold: true,
    color: GOLD,
    align: "center",
  });

  slide.addText(supervisors.join("    |    "), {
    x: 0.5,
    y: 4.7,
    w: 9,
    h: 0.35,
    fontSize: 13,
    fontFace: "Calibri",
    color: NAVY,
    align: "center",
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "نقدم لحضراتكم فريق العمل المكون من 4 طلاب من برنامج إعداد معلم الحاسب الآلي بكلية التربية النوعية جامعة دمياط، تحت إشراف أكاديمي متميز."
  );
}

// ============================================================
// SLIDE 3: AGENDA
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("محاور العرض", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 36,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  const items = [
    "المشكلة والدافع",
    "فلسفة InsightEdu — الأربع ركائز",
    "بنية النظام (System Architecture)",
    "التعرف على الوجه بالذكاء الاصطناعي",
    "تصميم الأجهزة (Hardware)",
    "نظام الامتحانات (OCR)",
    "المنصة التعليمية (Web Platform)",
    "تحليل المخاطر (Student Insights)",
    "النتائج والتقييم",
    "العمل المستقبلي",
  ];

  items.forEach((item, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i < 5 ? i : i - 5;
    const x = 0.8 + col * 4.6;
    const y = 1.3 + row * 0.78;

    slide.addText(`${String(i + 1).padStart(2, "0")}`, {
      x,
      y,
      w: 0.55,
      h: 0.55,
      fontSize: 14,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      fill: { color: NAVY },
      align: "center",
      valign: "middle",
      shape: pres.shapes.OVAL,
    });

    slide.addText(item, {
      x: x + 0.65,
      y,
      w: 3.6,
      h: 0.55,
      fontSize: 14,
      fontFace: "Calibri",
      color: BODY_COLOR,
      valign: "middle",
      margin: 0,
    });
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "هذه هي محاور العرض التي سنتناولها اليوم. سنبدأ بالمشكلة والدافع ثم ننتقل لفلسفة المشروع وكل مكوناته التقنية."
  );
}

// ============================================================
// SLIDE 4: THE PROBLEM — 5 Points of Blindness
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: DARK_NAVY };

  slide.addText("المشكلة: 5 نقاط عمى في التعليم التقليدي", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 28,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
    align: "center",
  });

  const blindnesses = [
    { title: "عمى الهوية", desc: "مين الطالب ده أصلاً؟ — تسجيل حضور يدوي قابل للتزوير", icon: "?" },
    { title: "عمى الأداء", desc: "مش عارف الطالب ماشي صح ولا لأ — تصحيح يدوي بطيء وغير دقيق", icon: "!" },
    { title: "عمى المخاطر", desc: "مبنعرفش إن الطالب في خطر غير بعد ما يرسب", icon: "⚠" },
    { title: "عمى التواصل", desc: "مفيش قناة فعالة بين المرشد والطالب والدكتور", icon: "✕" },
    { title: "عمى البيانات", desc: "كل حاجة ورق — ضاعت أو اتلفت مفيش حل", icon: "∅" },
  ];

  blindnesses.forEach((b, i) => {
    const y = 1.15 + i * 0.85;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y,
      w: 8.4,
      h: 0.7,
      fill: { color: NAVY },
      rectRadius: 0.08,
    });

    slide.addText(b.title, {
      x: 1.0,
      y,
      w: 2.2,
      h: 0.7,
      fontSize: 16,
      fontFace: "Calibri",
      bold: true,
      color: GOLD,
      valign: "middle",
      margin: 0,
    });

    slide.addText(b.desc, {
      x: 3.2,
      y,
      w: 5.8,
      h: 0.7,
      fontSize: 13,
      fontFace: "Calibri",
      color: WHITE,
      valign: "middle",
      margin: 0,
    });
  });

  slide.addText("هل نقدر نخلي النظام التعليمي يشوف؟", {
    x: 0.5,
    y: 5.05,
    w: 9,
    h: 0.4,
    fontSize: 16,
    fontFace: "Calibri",
    italic: true,
    color: GOLD,
    align: "center",
  });

  slide.addNotes(
    "في التعليم التقليدي، المؤسسات بتعاني من 5 نقاط عمى أساسية. من تسجيل حضور قابل للتزوير، لحد عدم وجود نظام إنذار مبكر للطلاب المعرضين للخطر. السؤال هنا: هل نقدر نخلي النظام التعليمي يشوف؟"
  );
}

// ============================================================
// SLIDE 5: THE SOLUTION — InsightEdu Philosophy
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("الحل: فلسفة InsightEdu", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  slide.addText("Insight + Education = رؤية تعليمية شاملة", {
    x: 0.5,
    y: 0.85,
    w: 9,
    h: 0.4,
    fontSize: 16,
    fontFace: "Calibri",
    color: GOLD,
    align: "center",
    italic: true,
  });

  const pillars = [
    {
      title: "Identity Insight",
      ar: "بصيرة الهوية",
      desc: "التعرف على الوجه + RFID — مين الطالب ده فعلاً؟",
      color: "1E6F5C",
    },
    {
      title: "Performance Insight",
      ar: "بصيرة الأداء",
      desc: "تصحيح OCR + تقييم تلقائي — أداء الطالب إزاي؟",
      color: "2E86C1",
    },
    {
      title: "Risk Insight",
      ar: "بصيرة المخاطر",
      desc: "تحليل تنبؤي + إنذار مبكر — الطالب في خطر؟",
      color: "C0392B",
    },
    {
      title: "Connection Insight",
      ar: "بصيرة التواصل",
      desc: "5 أدوار + إرشاد أكاديمي — مين يتكلم مع مين؟",
      color: "8E44AD",
    },
  ];

  pillars.forEach((p, i) => {
    const x = 0.5 + i * 2.35;
    const y = 1.55;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.15,
      h: 3.5,
      fill: { color: WHITE },
      rectRadius: 0.12,
      shadow: makeShadow(),
    });

    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.58,
      y: y + 0.3,
      w: 1.0,
      h: 1.0,
      fill: { color: p.color },
    });

    slide.addText(String(i + 1), {
      x: x + 0.58,
      y: y + 0.3,
      w: 1.0,
      h: 1.0,
      fontSize: 28,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });

    slide.addText(p.title, {
      x,
      y: y + 1.5,
      w: 2.15,
      h: 0.45,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: NAVY,
      align: "center",
      margin: 0,
    });

    slide.addText(p.ar, {
      x,
      y: y + 1.9,
      w: 2.15,
      h: 0.35,
      fontSize: 12,
      fontFace: "Calibri",
      color: p.color,
      align: "center",
      margin: 0,
    });

    slide.addText(p.desc, {
      x: x + 0.15,
      y: y + 2.3,
      w: 1.85,
      h: 1.0,
      fontSize: 11,
      fontFace: "Calibri",
      color: BODY_COLOR,
      align: "center",
      valign: "top",
      margin: 0,
    });
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "InsightEdu قايم على 4 ركائز أساسية — كل ركيزة بتحل واحدة أو أكتر من نقاط العمى. بصيرة الهوية من خلال التعرف على الوجه، بصيرة الأداء من خلال التصحيح الآلي، بصيرة المخاطر من خلال التحليل التنبؤي، وبصيرة التواصل من خلال نظام الأدوار والإرشاد."
  );
}

// ============================================================
// SLIDE 6: SYSTEM ARCHITECTURE
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("بنية النظام — System Architecture", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  const layers = [
    {
      label: "Hardware Layer",
      ar: "طبقة الأجهزة",
      items: "ESP32-CAM  |  ESP8266 + RFID  |  LCD 16x2  |  Buzzer",
      color: "1E6F5C",
      y: 1.15,
    },
    {
      label: "AI Layer — Flask Server",
      ar: "طبقة الذكاء الاصطناعي",
      items: "Face Recognition (LBP + MediaPipe)  |  ThreadPoolExecutor  |  Device-Session Mapping",
      color: "2E86C1",
      y: 2.2,
    },
    {
      label: "Web Platform — Next.js",
      ar: "المنصة التعليمية",
      items: "App Router  |  NextAuth.js (5 Roles)  |  Prisma ORM  |  OCR Engine  |  Student Insights",
      color: "8E44AD",
      y: 3.25,
    },
    {
      label: "Database — PostgreSQL",
      ar: "قاعدة البيانات",
      items: "20+ Tables  |  Cascade Delete  |  Unique Constraints  |  Indexed Queries",
      color: "C0392B",
      y: 4.3,
    },
  ];

  layers.forEach((l) => {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6,
      y: l.y,
      w: 8.8,
      h: 0.85,
      fill: { color: WHITE },
      rectRadius: 0.1,
      shadow: makeShadow(),
    });

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6,
      y: l.y,
      w: 2.8,
      h: 0.85,
      fill: { color: l.color },
      rectRadius: 0.1,
    });

    slide.addText([
      { text: l.label, options: { bold: true, fontSize: 13, breakLine: true } },
      { text: l.ar, options: { fontSize: 10 } },
    ], {
      x: 0.75,
      y: l.y,
      w: 2.5,
      h: 0.85,
      color: WHITE,
      fontFace: "Calibri",
      valign: "middle",
      margin: 0,
    });

    slide.addText(l.items, {
      x: 3.6,
      y: l.y,
      w: 5.6,
      h: 0.85,
      fontSize: 12,
      fontFace: "Calibri",
      color: BODY_COLOR,
      valign: "middle",
      margin: 0,
    });
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "النظام مبني على 4 طبقات: طبقة الأجهزة (ESP32-CAM و ESP8266 مع RFID)، طبقة الذكاء الاصطناعي (Flask server مع نظام التعرف على الوجه)، المنصة التعليمية (Next.js مع 5 أدوار)، وقاعدة البيانات PostgreSQL بأكتر من 20 جدول."
  );
}

// ============================================================
// SLIDE 7: FACE RECOGNITION — Identity Insight
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("بصيرة الهوية — AI Face Recognition", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  // Left column — dual verification
  slide.addText("نظام التحقق المزدوج", {
    x: 0.6,
    y: 1.1,
    w: 4.2,
    h: 0.4,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const verificationSteps = [
    { label: "LBP — Local Binary Patterns", detail: "مقارنة المظهر — 8x8 grid, 256 bins, correlation ≥ 0.42" },
    { label: "MediaPipe FaceMesh", detail: "468 landmark → 1404 features — مقارنة هندسية (min < 0.40, avg < 0.50)" },
    { label: "process_frame()", detail: "Single MediaPipe pass → features + face_crop (128x128 grayscale)" },
    { label: "ThreadPoolExecutor", detail: "3 workers — 30 صورة بالتوازي أثناء التسجيل" },
  ];

  verificationSteps.forEach((s, i) => {
    const y = 1.65 + i * 0.85;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6,
      y,
      w: 4.2,
      h: 0.72,
      fill: { color: WHITE },
      rectRadius: 0.08,
      shadow: makeShadow(),
    });

    slide.addText([
      { text: s.label, options: { bold: true, fontSize: 12, color: NAVY, breakLine: true } },
      { text: s.detail, options: { fontSize: 10, color: MUTED } },
    ], {
      x: 0.75,
      y,
      w: 3.9,
      h: 0.72,
      fontFace: "Calibri",
      valign: "middle",
      margin: 0,
    });
  });

  // Right column — flow
  slide.addText("مسار التسجيل والتحقق", {
    x: 5.2,
    y: 1.1,
    w: 4.2,
    h: 0.4,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const flowSteps = [
    "الطالب يمسح كارت RFID",
    "ESP8266 يرسل Card ID للسيرفر",
    "Flask يطلب صورة من ESP32-CAM",
    "process_frame() → LBP + Landmarks",
    "مقارنة مع البيانات المسجلة",
    "النتيجة: ✓ Present / ✕ Rejected",
  ];

  flowSteps.forEach((step, i) => {
    const y = 1.65 + i * 0.57;

    slide.addText(String(i + 1), {
      x: 5.3,
      y,
      w: 0.4,
      h: 0.4,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      fill: { color: i < 5 ? NAVY : "1E6F5C" },
      align: "center",
      valign: "middle",
      shape: pres.shapes.OVAL,
    });

    slide.addText(step, {
      x: 5.85,
      y,
      w: 3.5,
      h: 0.4,
      fontSize: 12,
      fontFace: "Calibri",
      color: BODY_COLOR,
      valign: "middle",
      margin: 0,
    });
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "نظام التعرف على الوجه بيعتمد على تقنيتين: LBP لمقارنة المظهر مع threshold 0.42، و MediaPipe FaceMesh اللي بيحلل 468 نقطة على الوجه ويحولها لـ 1404 feature. النظام بيستخدم dual verification — لازم الاتنين يوافقوا عشان يتسجل الحضور."
  );
}

// ============================================================
// SLIDE 8: HARDWARE DESIGN
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("تصميم الأجهزة — Hardware Design", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  // ESP32-CAM card
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5,
    y: 1.15,
    w: 4.3,
    h: 3.7,
    fill: { color: WHITE },
    rectRadius: 0.12,
    shadow: makeShadow(),
  });

  slide.addText("ESP32-CAM (AI-Thinker)", {
    x: 0.7,
    y: 1.3,
    w: 3.9,
    h: 0.45,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const esp32Specs = [
    "OV2640 Camera Sensor",
    "4MB PSRAM for frame buffer",
    "WiFi 802.11 b/g/n",
    "HTTP endpoint: /capture",
    "JPEG output @ 10.123.127.60",
    "Auto-retry on camera init failure",
  ];

  slide.addText(
    esp32Specs.map((s, i) => ({
      text: s,
      options: { bullet: true, breakLine: i < esp32Specs.length - 1 },
    })),
    {
      x: 0.8,
      y: 1.9,
      w: 3.8,
      h: 2.8,
      fontSize: 13,
      fontFace: "Calibri",
      color: BODY_COLOR,
      paraSpaceAfter: 6,
    }
  );

  // ESP8266 card
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2,
    y: 1.15,
    w: 4.3,
    h: 3.7,
    fill: { color: WHITE },
    rectRadius: 0.12,
    shadow: makeShadow(),
  });

  slide.addText("ESP8266 NodeMCU V3", {
    x: 5.4,
    y: 1.3,
    w: 3.9,
    h: 0.45,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const esp8266Specs = [
    "MFRC522 RFID Reader (SPI)",
    "I2C LCD 16x2 Display",
    "Active-HIGH Buzzer on GPIO2",
    "Reads card → HTTP POST to Flask",
    "LCD feedback: Success / Error",
    "Auto-reconnect WiFi",
  ];

  slide.addText(
    esp8266Specs.map((s, i) => ({
      text: s,
      options: { bullet: true, breakLine: i < esp8266Specs.length - 1 },
    })),
    {
      x: 5.3,
      y: 1.9,
      w: 3.8,
      h: 2.8,
      fontSize: 13,
      fontFace: "Calibri",
      color: BODY_COLOR,
      paraSpaceAfter: 6,
    }
  );

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "الـ Hardware مكون من جهازين: ESP32-CAM اللي بيلتقط صور الوجه عبر sensor OV2640 ويبعتها كـ JPEG، و ESP8266 NodeMCU V3 اللي متوصل بـ RFID reader و LCD screen و buzzer. لما الطالب يمسح الكارت، ESP8266 بيبعت Card ID لـ Flask، و Flask بيطلب صورة من ESP32-CAM."
  );
}

// ============================================================
// SLIDE 9: DEVICE-SESSION MAPPING
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: DARK_NAVY };

  slide.addText("ربط الجهاز بالمحاضرة — Device-Session Mapping", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 28,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
    align: "center",
  });

  slide.addText("كيف يعرف النظام أي جهاز يسجل لأي محاضرة؟", {
    x: 0.5,
    y: 0.85,
    w: 9,
    h: 0.35,
    fontSize: 14,
    fontFace: "Calibri",
    color: GOLD,
    align: "center",
    italic: true,
  });

  const mappingSteps = [
    { step: "1", title: "الدكتور يفتح Session", desc: "من الـ Dashboard يختار الكورس ويبدأ session جديدة" },
    { step: "2", title: "اختيار الجهاز", desc: "POST /select-session → Flask يربط IP الجهاز بالـ session" },
    { step: "3", title: "مسح الكارت", desc: "في /scan-card — Flask بيعرف الـ sessionId من device_to_session[IP]" },
    { step: "4", title: "عزل المحاضرات", desc: "كل course مستقل — لو 3 دكاتره شغالين مش هيأثروا على بعض" },
  ];

  mappingSteps.forEach((s, i) => {
    const y = 1.5 + i * 0.9;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y,
      w: 8.4,
      h: 0.72,
      fill: { color: NAVY },
      rectRadius: 0.08,
    });

    slide.addText(s.step, {
      x: 1.0,
      y: y + 0.08,
      w: 0.55,
      h: 0.55,
      fontSize: 20,
      fontFace: "Calibri",
      bold: true,
      color: NAVY,
      fill: { color: GOLD },
      align: "center",
      valign: "middle",
      shape: pres.shapes.OVAL,
    });

    slide.addText(s.title, {
      x: 1.75,
      y,
      w: 2.5,
      h: 0.72,
      fontSize: 15,
      fontFace: "Calibri",
      bold: true,
      color: GOLD,
      valign: "middle",
      margin: 0,
    });

    slide.addText(s.desc, {
      x: 4.2,
      y,
      w: 4.8,
      h: 0.72,
      fontSize: 12,
      fontFace: "Calibri",
      color: WHITE,
      valign: "middle",
      margin: 0,
    });
  });

  slide.addText("device_to_session = { '10.123.127.60': 'session_abc123' }", {
    x: 1.5,
    y: 5.0,
    w: 7,
    h: 0.35,
    fontSize: 11,
    fontFace: "Calibri",
    color: MUTED,
    align: "center",
    italic: true,
  });

  slide.addNotes(
    "من أهم التحديات اللي حليناها: إزاي النظام يعرف إن الجهاز ده بيسجل لمحاضرة معينة. الحل كان Device-to-Session Mapping بالـ IP — الدكتور من الـ Dashboard بيختار الجهاز والـ session، والنظام بيحفظ العلاقة. كده لو 3 دكاتره شغالين في نفس الوقت مش هيأثروا على بعض."
  );
}

// ============================================================
// SLIDE 10: OCR EXAM SYSTEM — Performance Insight
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("بصيرة الأداء — OCR Exam System", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  // Left — flow
  slide.addText("مسار العمل", {
    x: 0.6,
    y: 1.1,
    w: 4.5,
    h: 0.4,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const ocrFlow = [
    "الدكتور ينشئ الامتحان (MCQ / True-False)",
    "النظام يولد Bubble Sheet + QR Code لكل طالب",
    "الطالب يحل والورقة تتصور / تتسكن",
    "OCR Engine يقرأ الفقاعات (threshold configurable)",
    "التصحيح التلقائي + حساب الدرجات",
    "مراجعة يدوية للإجابات غير الواضحة (needsReview)",
  ];

  ocrFlow.forEach((step, i) => {
    const y = 1.6 + i * 0.58;
    slide.addText(String(i + 1), {
      x: 0.7,
      y,
      w: 0.35,
      h: 0.35,
      fontSize: 12,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      fill: { color: "2E86C1" },
      align: "center",
      valign: "middle",
      shape: pres.shapes.OVAL,
    });

    slide.addText(step, {
      x: 1.2,
      y,
      w: 3.8,
      h: 0.45,
      fontSize: 12,
      fontFace: "Calibri",
      color: BODY_COLOR,
      valign: "middle",
      margin: 0,
    });
  });

  // Right — config & stats
  slide.addText("إعدادات OCR", {
    x: 5.3,
    y: 1.1,
    w: 4.2,
    h: 0.4,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.3,
    y: 1.6,
    w: 4.2,
    h: 2.0,
    fill: { color: WHITE },
    rectRadius: 0.1,
    shadow: makeShadow(),
  });

  const configItems = [
    { label: "Threshold", value: "140 (configurable per exam)" },
    { label: "Blur", value: "3 (noise reduction)" },
    { label: "Invert", value: "true (dark bubbles on light bg)" },
    { label: "Confidence", value: "Score per answer for review" },
  ];

  configItems.forEach((c, i) => {
    slide.addText([
      { text: c.label + ": ", options: { bold: true, color: NAVY } },
      { text: c.value, options: { color: BODY_COLOR } },
    ], {
      x: 5.5,
      y: 1.7 + i * 0.43,
      w: 3.8,
      h: 0.4,
      fontSize: 12,
      fontFace: "Calibri",
      margin: 0,
    });
  });

  // Paper status pipeline
  slide.addText("Paper Status Pipeline", {
    x: 5.3,
    y: 3.8,
    w: 4.2,
    h: 0.4,
    fontSize: 14,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const statuses = ["Generated", "Printed", "Scanned", "Processed", "Graded"];
  statuses.forEach((s, i) => {
    const x = 5.3 + i * 0.84;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 4.25,
      w: 0.78,
      h: 0.4,
      fill: { color: i === statuses.length - 1 ? "1E6F5C" : "2E86C1" },
      rectRadius: 0.05,
    });
    slide.addText(s, {
      x,
      y: 4.25,
      w: 0.78,
      h: 0.4,
      fontSize: 7,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "نظام الامتحانات بيعتمد على OCR — الدكتور بينشئ الامتحان والنظام يولد ورقة إجابة مع QR Code فريد لكل طالب. بعد ما الطالب يحل، الورقة بتتسكن والـ OCR engine بيقرأ الفقاعات ويصحح تلقائي. الإعدادات زي الـ threshold والـ blur قابلة للتعديل لكل امتحان."
  );
}

// ============================================================
// SLIDE 11: WEB PLATFORM — 5 Roles
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("المنصة التعليمية — 5 أدوار", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  const roles = [
    {
      role: "Admin",
      ar: "المسؤول",
      features: "إدارة المستخدمين، الكورسات، التقارير، سجل العمليات",
      color: "C0392B",
    },
    {
      role: "Teacher",
      ar: "المحاضر",
      features: "الحضور، الامتحانات، الواجبات، الأنشطة، الرسائل",
      color: "2E86C1",
    },
    {
      role: "Student",
      ar: "الطالب",
      features: "عرض الحضور، النتائج، الواجبات، الأنشطة",
      color: "1E6F5C",
    },
    {
      role: "Advisor",
      ar: "المرشد الأكاديمي",
      features: "متابعة الطلاب، التوصيات، الاجتماعات، التقارير",
      color: "8E44AD",
    },
    {
      role: "TA",
      ar: "المعيد",
      features: "مساعدة المحاضر في التقييم والمتابعة",
      color: GOLD,
    },
  ];

  roles.forEach((r, i) => {
    const y = 1.1 + i * 0.82;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6,
      y,
      w: 8.8,
      h: 0.68,
      fill: { color: WHITE },
      rectRadius: 0.08,
      shadow: makeShadow(),
    });

    slide.addShape(pres.shapes.OVAL, {
      x: 0.85,
      y: y + 0.1,
      w: 0.48,
      h: 0.48,
      fill: { color: r.color },
    });

    slide.addText(r.role[0], {
      x: 0.85,
      y: y + 0.1,
      w: 0.48,
      h: 0.48,
      fontSize: 16,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });

    slide.addText(r.role, {
      x: 1.55,
      y,
      w: 1.4,
      h: 0.68,
      fontSize: 15,
      fontFace: "Calibri",
      bold: true,
      color: NAVY,
      valign: "middle",
      margin: 0,
    });

    slide.addText(r.ar, {
      x: 2.95,
      y,
      w: 1.2,
      h: 0.68,
      fontSize: 12,
      fontFace: "Calibri",
      color: r.color,
      valign: "middle",
      margin: 0,
    });

    slide.addText(r.features, {
      x: 4.2,
      y,
      w: 5.0,
      h: 0.68,
      fontSize: 12,
      fontFace: "Calibri",
      color: BODY_COLOR,
      valign: "middle",
      margin: 0,
    });
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "المنصة بتدعم 5 أدوار مختلفة: Admin للإدارة الكاملة، Teacher لإدارة الحضور والامتحانات والواجبات، Student لعرض البيانات وتقديم الواجبات، Advisor للإرشاد الأكاديمي، و TA لمساعدة المحاضر. كل دور ليه Dashboard مخصصة ليه."
  );
}

// ============================================================
// SLIDE 12: TECH STACK
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: DARK_NAVY };

  slide.addText("التقنيات المستخدمة — Tech Stack", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
    align: "center",
  });

  const techGroups = [
    {
      title: "Frontend",
      items: ["Next.js (App Router)", "TypeScript", "Tailwind CSS", "React"],
      color: "2E86C1",
    },
    {
      title: "Backend",
      items: ["NextAuth.js (JWT)", "Prisma ORM", "Server Actions", "API Routes"],
      color: "1E6F5C",
    },
    {
      title: "AI & Hardware",
      items: ["Flask (Python)", "MediaPipe", "OpenCV", "ESP32 / ESP8266"],
      color: "C0392B",
    },
    {
      title: "Database & Tools",
      items: ["PostgreSQL", "Neon (Cloud)", "Git / GitHub", "VS Code"],
      color: "8E44AD",
    },
  ];

  techGroups.forEach((g, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 4.7;
    const y = 1.1 + row * 2.05;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 4.3,
      h: 1.85,
      fill: { color: NAVY },
      rectRadius: 0.12,
    });

    slide.addText(g.title, {
      x,
      y: y + 0.1,
      w: 4.3,
      h: 0.45,
      fontSize: 18,
      fontFace: "Calibri",
      bold: true,
      color: g.color,
      align: "center",
      margin: 0,
    });

    slide.addText(
      g.items.map((item, j) => ({
        text: item,
        options: { bullet: true, breakLine: j < g.items.length - 1 },
      })),
      {
        x: x + 0.4,
        y: y + 0.55,
        w: 3.5,
        h: 1.2,
        fontSize: 13,
        fontFace: "Calibri",
        color: WHITE,
        paraSpaceAfter: 4,
      }
    );
  });

  slide.addNotes(
    "التقنيات المستخدمة تشمل: Frontend بـ Next.js و TypeScript و Tailwind، Backend بـ NextAuth.js و Prisma، الذكاء الاصطناعي بـ Flask و MediaPipe و OpenCV، وقاعدة البيانات PostgreSQL على Neon Cloud."
  );
}

// ============================================================
// SLIDE 13: DATABASE SCHEMA
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("قاعدة البيانات — 20+ Tables", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  const tableGroups = [
    {
      group: "Core",
      tables: ["User (5 roles)", "Course", "Enrollment", "TeacherCourse"],
      color: "2E86C1",
    },
    {
      group: "Attendance",
      tables: ["AttendanceSession", "Attendance (unique student+session)"],
      color: "1E6F5C",
    },
    {
      group: "Exams & OCR",
      tables: ["Exam", "Question", "QuestionOption", "StudentExamPaper", "StudentAnswer", "ExamResult", "OCRConfig"],
      color: "C0392B",
    },
    {
      group: "Activities",
      tables: ["StudentActivity", "ActivityContent", "ActivityAttachment", "ActivitySubmission"],
      color: "8E44AD",
    },
    {
      group: "Advisor",
      tables: ["StudentInsight", "AdvisorRecommendation", "AdvisorMeeting"],
      color: GOLD,
    },
    {
      group: "System",
      tables: ["Assignment", "AssignmentSubmission", "SystemNotification", "AdminLog"],
      color: "6B7B9A",
    },
  ];

  tableGroups.forEach((g, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.4 + col * 3.2;
    const y = 1.1 + row * 2.1;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 3.0,
      h: 1.9,
      fill: { color: WHITE },
      rectRadius: 0.1,
      shadow: makeShadow(),
    });

    slide.addText(g.group, {
      x,
      y: y + 0.1,
      w: 3.0,
      h: 0.4,
      fontSize: 15,
      fontFace: "Calibri",
      bold: true,
      color: g.color,
      align: "center",
      margin: 0,
    });

    slide.addText(
      g.tables.map((t, j) => ({
        text: t,
        options: { bullet: true, breakLine: j < g.tables.length - 1 },
      })),
      {
        x: x + 0.2,
        y: y + 0.5,
        w: 2.6,
        h: 1.3,
        fontSize: 10,
        fontFace: "Calibri",
        color: BODY_COLOR,
        paraSpaceAfter: 2,
      }
    );
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "قاعدة البيانات PostgreSQL فيها أكتر من 20 جدول مقسمين على 6 مجموعات: Core tables للمستخدمين والكورسات، Attendance للحضور مع unique constraint، Exams & OCR للامتحانات والتصحيح، Activities للأنشطة الطلابية، Advisor للإرشاد الأكاديمي، و System للإشعارات وسجل العمليات."
  );
}

// ============================================================
// SLIDE 14: STUDENT INSIGHTS — Risk Insight
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("بصيرة المخاطر — Student Insights", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  // Input metrics
  slide.addText("مدخلات التحليل", {
    x: 0.6,
    y: 1.05,
    w: 4.5,
    h: 0.4,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const metrics = [
    { name: "Attendance Rate", desc: "نسبة الحضور", icon: "A" },
    { name: "Average Score", desc: "متوسط الدرجات", icon: "S" },
    { name: "Assignment Rate", desc: "معدل تسليم الواجبات", icon: "H" },
    { name: "Engagement Score", desc: "مستوى التفاعل", icon: "E" },
  ];

  metrics.forEach((m, i) => {
    const y = 1.55 + i * 0.7;
    slide.addShape(pres.shapes.OVAL, {
      x: 0.7,
      y: y + 0.05,
      w: 0.45,
      h: 0.45,
      fill: { color: "2E86C1" },
    });
    slide.addText(m.icon, {
      x: 0.7,
      y: y + 0.05,
      w: 0.45,
      h: 0.45,
      fontSize: 14,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });
    slide.addText([
      { text: m.name, options: { bold: true, fontSize: 13, color: NAVY, breakLine: true } },
      { text: m.desc, options: { fontSize: 11, color: MUTED } },
    ], {
      x: 1.3,
      y,
      w: 3.5,
      h: 0.55,
      fontFace: "Calibri",
      valign: "middle",
      margin: 0,
    });
  });

  // Output — Risk classification
  slide.addText("مخرجات التحليل", {
    x: 5.3,
    y: 1.05,
    w: 4.2,
    h: 0.4,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const riskLevels = [
    { level: "LOW", ar: "منخفض", color: "1E6F5C", desc: "الطالب يسير بشكل طبيعي" },
    { level: "MEDIUM", ar: "متوسط", color: "F5A623", desc: "يحتاج متابعة إضافية" },
    { level: "HIGH", ar: "مرتفع", color: "C0392B", desc: "تدخل فوري مطلوب" },
  ];

  riskLevels.forEach((r, i) => {
    const y = 1.6 + i * 0.85;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.3,
      y,
      w: 4.2,
      h: 0.7,
      fill: { color: WHITE },
      rectRadius: 0.08,
      shadow: makeShadow(),
    });

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.45,
      y: y + 0.15,
      w: 0.7,
      h: 0.4,
      fill: { color: r.color },
      rectRadius: 0.05,
    });

    slide.addText(r.level, {
      x: 5.45,
      y: y + 0.15,
      w: 0.7,
      h: 0.4,
      fontSize: 9,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });

    slide.addText([
      { text: r.ar, options: { bold: true, fontSize: 14, color: NAVY, breakLine: true } },
      { text: r.desc, options: { fontSize: 11, color: MUTED } },
    ], {
      x: 6.3,
      y,
      w: 3.0,
      h: 0.7,
      fontFace: "Calibri",
      valign: "middle",
      margin: 0,
    });
  });

  // Additional outputs
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.3,
    y: 4.2,
    w: 4.2,
    h: 0.6,
    fill: { color: "F0F4FF" },
    rectRadius: 0.08,
  });

  slide.addText("+ Confidence Score | Predicted Outcome | Recommendations | Reasons", {
    x: 5.4,
    y: 4.2,
    w: 4.0,
    h: 0.6,
    fontSize: 10,
    fontFace: "Calibri",
    color: NAVY,
    valign: "middle",
    align: "center",
    margin: 0,
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "نظام Student Insights بياخد 4 مقاييس: نسبة الحضور، متوسط الدرجات، معدل تسليم الواجبات، ومستوى التفاعل. بناءً عليهم بيصنف الطالب لـ 3 مستويات خطر: منخفض (كل حاجة تمام)، متوسط (محتاج متابعة)، أو مرتفع (لازم تدخل فوري). كمان بيقدم توصيات وأسباب التصنيف."
  );
}

// ============================================================
// SLIDE 15: ADVISOR SYSTEM — Connection Insight
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: DARK_NAVY };

  slide.addText("بصيرة التواصل — Advisor System", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
    align: "center",
  });

  const features = [
    {
      title: "التوصيات الأكاديمية",
      desc: "المرشد يكتب توصيات للطالب — عادية أو تحذيرية (isWarning)",
      color: "2E86C1",
    },
    {
      title: "الاجتماعات",
      desc: "جدولة اجتماعات مع الطلاب — Scheduled → Completed / Cancelled",
      color: "1E6F5C",
    },
    {
      title: "الإشعارات",
      desc: "نظام إشعارات داخلي بين جميع الأدوار — sender → receiver",
      color: "8E44AD",
    },
    {
      title: "التقارير الشاملة",
      desc: "تقارير أداء الطلاب + سجل العمليات + تحليلات الحضور",
      color: GOLD,
    },
  ];

  features.forEach((f, i) => {
    const y = 1.2 + i * 1.0;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y,
      w: 8.0,
      h: 0.8,
      fill: { color: NAVY },
      rectRadius: 0.1,
    });

    slide.addShape(pres.shapes.OVAL, {
      x: 1.2,
      y: y + 0.15,
      w: 0.5,
      h: 0.5,
      fill: { color: f.color },
    });

    slide.addText(String(i + 1), {
      x: 1.2,
      y: y + 0.15,
      w: 0.5,
      h: 0.5,
      fontSize: 16,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });

    slide.addText(f.title, {
      x: 1.9,
      y,
      w: 2.5,
      h: 0.8,
      fontSize: 16,
      fontFace: "Calibri",
      bold: true,
      color: GOLD,
      valign: "middle",
      margin: 0,
    });

    slide.addText(f.desc, {
      x: 4.4,
      y,
      w: 4.4,
      h: 0.8,
      fontSize: 12,
      fontFace: "Calibri",
      color: WHITE,
      valign: "middle",
      margin: 0,
    });
  });

  slide.addNotes(
    "نظام الإرشاد الأكاديمي بيربط المرشد بالطالب عبر 4 قنوات: توصيات أكاديمية عادية وتحذيرية، جدولة اجتماعات، نظام إشعارات داخلي، وتقارير شاملة. ده بيحقق بصيرة التواصل اللي بتضمن إن مفيش طالب يتوه في النظام."
  );
}

// ============================================================
// SLIDE 16: ACTIVITIES SYSTEM
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("نظام الأنشطة الطلابية", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  const actTypes = [
    { type: "TASK", ar: "مهمة", color: "2E86C1" },
    { type: "QUIZ", ar: "اختبار قصير", color: "1E6F5C" },
    { type: "PROJECT", ar: "مشروع", color: "8E44AD" },
    { type: "EXAM", ar: "امتحان", color: "C0392B" },
    { type: "EVENT", ar: "حدث", color: GOLD },
  ];

  actTypes.forEach((a, i) => {
    const x = 0.5 + i * 1.9;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.1,
      w: 1.7,
      h: 0.7,
      fill: { color: a.color },
      rectRadius: 0.08,
    });
    slide.addText([
      { text: a.type, options: { bold: true, fontSize: 12, breakLine: true } },
      { text: a.ar, options: { fontSize: 10 } },
    ], {
      x,
      y: 1.1,
      w: 1.7,
      h: 0.7,
      fontFace: "Calibri",
      color: WHITE,
      align: "center",
      valign: "middle",
    });
  });

  // Content types
  slide.addText("أنواع المحتوى (7 أنواع)", {
    x: 0.6,
    y: 2.1,
    w: 4.5,
    h: 0.4,
    fontSize: 16,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const contentTypes = ["TEXT", "FILE", "LINK", "VIDEO", "IMAGE", "CODE", "QUESTION"];
  slide.addText(contentTypes.join("  |  "), {
    x: 0.6,
    y: 2.55,
    w: 8.8,
    h: 0.4,
    fontSize: 13,
    fontFace: "Calibri",
    color: BODY_COLOR,
    margin: 0,
  });

  // Submission flow
  slide.addText("مسار التقديم", {
    x: 0.6,
    y: 3.2,
    w: 4.5,
    h: 0.4,
    fontSize: 16,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const subStatuses = ["PENDING", "SUBMITTED", "LATE", "GRADED"];
  subStatuses.forEach((s, i) => {
    const x = 0.6 + i * 2.3;
    const colors = { PENDING: MUTED, SUBMITTED: "2E86C1", LATE: "C0392B", GRADED: "1E6F5C" };
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 3.7,
      w: 2.0,
      h: 0.5,
      fill: { color: colors[s] },
      rectRadius: 0.06,
    });
    slide.addText(s, {
      x,
      y: 3.7,
      w: 2.0,
      h: 0.5,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
    });
  });

  // Features
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6,
    y: 4.45,
    w: 8.8,
    h: 0.65,
    fill: { color: WHITE },
    rectRadius: 0.08,
    shadow: makeShadow(),
  });

  slide.addText("المرفقات  |  التقييم والملاحظات  |  تاريخ الاستحقاق  |  النقاط  |  الـ Unique Constraint للطالب", {
    x: 0.8,
    y: 4.45,
    w: 8.4,
    h: 0.65,
    fontSize: 12,
    fontFace: "Calibri",
    color: BODY_COLOR,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "نظام الأنشطة بيدعم 5 أنواع: مهمة، اختبار قصير، مشروع، امتحان، وحدث. كل نشاط ممكن يحتوي على 7 أنواع محتوى مختلفة. الطالب يقدم النشاط ويمر بـ 4 مراحل من Pending لـ Graded."
  );
}

// ============================================================
// SLIDE 17: SECURITY & AUTH
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: DARK_NAVY };

  slide.addText("الأمان والمصادقة", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
    align: "center",
  });

  const secFeatures = [
    {
      title: "NextAuth.js + JWT",
      desc: "مصادقة آمنة بـ JSON Web Tokens — كل طلب بيتحقق من التوكن",
    },
    {
      title: "Role-Based Access Control",
      desc: "5 أدوار — كل دور ليه صلاحيات محددة ومسارات مخصصة",
    },
    {
      title: "Cascade Delete",
      desc: "حذف المستخدم بيحذف كل بياناته تلقائياً — مفيش بيانات يتيمة",
    },
    {
      title: "Unique Constraints",
      desc: "منع التكرار على مستوى قاعدة البيانات — طالب واحد / session واحدة",
    },
    {
      title: "Admin Audit Log",
      desc: "كل عملية إدارية بتتسجل — مين عمل إيه وإمتى ومن أي IP",
    },
    {
      title: "Password Change Enforcement",
      desc: "أول تسجيل دخول → إجبار تغيير كلمة المرور",
    },
  ];

  secFeatures.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.7;
    const y = 1.1 + row * 1.35;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 4.3,
      h: 1.15,
      fill: { color: NAVY },
      rectRadius: 0.1,
    });

    slide.addText(f.title, {
      x: x + 0.2,
      y: y + 0.1,
      w: 3.9,
      h: 0.4,
      fontSize: 15,
      fontFace: "Calibri",
      bold: true,
      color: GOLD,
      margin: 0,
    });

    slide.addText(f.desc, {
      x: x + 0.2,
      y: y + 0.5,
      w: 3.9,
      h: 0.55,
      fontSize: 11,
      fontFace: "Calibri",
      color: WHITE,
      margin: 0,
    });
  });

  slide.addNotes(
    "الأمان في النظام بيعتمد على عدة طبقات: NextAuth.js مع JWT tokens، Role-Based Access Control لـ 5 أدوار، Cascade Delete لحماية البيانات، Unique Constraints لمنع التكرار، Admin Audit Log لتسجيل كل العمليات، وإجبار تغيير كلمة المرور عند أول تسجيل دخول."
  );
}

// ============================================================
// SLIDE 18: RESULTS & ACHIEVEMENTS
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("النتائج والإنجازات", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  const stats = [
    { num: "20+", label: "جدول في قاعدة البيانات", color: "2E86C1" },
    { num: "5", label: "أدوار مستخدمين", color: "1E6F5C" },
    { num: "2", label: "خوارزميات AI للتعرف على الوجه", color: "C0392B" },
    { num: "7", label: "أنواع محتوى للأنشطة", color: "8E44AD" },
  ];

  stats.forEach((s, i) => {
    const x = 0.5 + i * 2.35;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.1,
      w: 2.15,
      h: 1.6,
      fill: { color: WHITE },
      rectRadius: 0.12,
      shadow: makeShadow(),
    });

    slide.addText(s.num, {
      x,
      y: 1.2,
      w: 2.15,
      h: 0.8,
      fontSize: 44,
      fontFace: "Calibri",
      bold: true,
      color: s.color,
      align: "center",
      valign: "middle",
    });

    slide.addText(s.label, {
      x,
      y: 2.0,
      w: 2.15,
      h: 0.55,
      fontSize: 12,
      fontFace: "Calibri",
      color: BODY_COLOR,
      align: "center",
      valign: "top",
      margin: 0,
    });
  });

  // Key achievements
  slide.addText("إنجازات رئيسية", {
    x: 0.6,
    y: 3.0,
    w: 9,
    h: 0.4,
    fontSize: 18,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    margin: 0,
  });

  const achievements = [
    "نظام حضور ذكي بالتعرف على الوجه — يمنع التزوير تماماً",
    "تصحيح امتحانات آلي بـ OCR — يوفر ساعات من العمل اليدوي",
    "نظام إنذار مبكر — يكتشف الطلاب المعرضين للخطر قبل الرسوب",
    "منصة شاملة — من التسجيل للتخرج في مكان واحد",
    "Device-Session Mapping — عدة محاضرات في نفس الوقت بدون تداخل",
  ];

  slide.addText(
    achievements.map((a, i) => ({
      text: a,
      options: { bullet: true, breakLine: i < achievements.length - 1 },
    })),
    {
      x: 0.8,
      y: 3.45,
      w: 8.4,
      h: 1.8,
      fontSize: 13,
      fontFace: "Calibri",
      color: BODY_COLOR,
      paraSpaceAfter: 6,
    }
  );

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "من أبرز النتائج: قاعدة بيانات بأكتر من 20 جدول، 5 أدوار مستخدمين، خوارزميتين AI للتعرف على الوجه، و 7 أنواع محتوى. النظام بيمنع تزوير الحضور، بيوفر ساعات تصحيح، وبيكتشف الطلاب المعرضين للخطر مبكراً."
  );
}

// ============================================================
// SLIDE 19: FUTURE WORK
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addText("العمل المستقبلي", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: NAVY,
    align: "center",
  });

  const futureItems = [
    {
      title: "تطبيق موبايل",
      desc: "React Native app للطلاب والدكاتره — إشعارات فورية",
      color: "2E86C1",
    },
    {
      title: "Deep Learning للوجه",
      desc: "استبدال LBP بـ CNN/DLIB لدقة أعلى في ظروف إضاءة مختلفة",
      color: "1E6F5C",
    },
    {
      title: "AI Chatbot",
      desc: "مساعد ذكي للطلاب — يجاوب على الأسئلة ويقدم نصائح أكاديمية",
      color: "8E44AD",
    },
    {
      title: "تكامل مع LMS",
      desc: "ربط مع Moodle / Google Classroom لاستيراد وتصدير البيانات",
      color: "C0392B",
    },
    {
      title: "لوحة تحكم متقدمة",
      desc: "تحليلات real-time مع رسوم بيانية تفاعلية ولوحات KPI",
      color: GOLD,
    },
  ];

  futureItems.forEach((f, i) => {
    const y = 1.1 + i * 0.82;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6,
      y,
      w: 8.8,
      h: 0.68,
      fill: { color: WHITE },
      rectRadius: 0.08,
      shadow: makeShadow(),
    });

    slide.addText(f.title, {
      x: 0.85,
      y,
      w: 2.3,
      h: 0.68,
      fontSize: 15,
      fontFace: "Calibri",
      bold: true,
      color: f.color,
      valign: "middle",
      margin: 0,
    });

    slide.addText(f.desc, {
      x: 3.2,
      y,
      w: 6.0,
      h: 0.68,
      fontSize: 12,
      fontFace: "Calibri",
      color: BODY_COLOR,
      valign: "middle",
      margin: 0,
    });
  });

  addFooter(slide, slideNum, TOTAL_SLIDES);

  slide.addNotes(
    "في المستقبل نخطط لتطوير تطبيق موبايل، ترقية نظام التعرف على الوجه لـ Deep Learning، إضافة AI Chatbot للمساعدة الأكاديمية، التكامل مع أنظمة LMS، وتطوير لوحات تحكم متقدمة بتحليلات real-time."
  );
}

// ============================================================
// SLIDE 20: THANK YOU
// ============================================================
slideNum++;
{
  const slide = pres.addSlide();
  slide.background = { color: DARK_NAVY };

  slide.addImage({
    data: logoData,
    x: 3.75,
    y: 0.5,
    w: 2.5,
    h: 2.5,
  });

  slide.addText("شكراً لحسن استماعكم", {
    x: 0.5,
    y: 3.15,
    w: 9,
    h: 0.7,
    fontSize: 36,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
    align: "center",
  });

  slide.addText("Thank You", {
    x: 0.5,
    y: 3.8,
    w: 9,
    h: 0.5,
    fontSize: 20,
    fontFace: "Calibri",
    color: GOLD,
    align: "center",
  });

  slide.addText("InsightEdu — رؤية تعليمية ذكية", {
    x: 0.5,
    y: 4.4,
    w: 9,
    h: 0.4,
    fontSize: 16,
    fontFace: "Calibri",
    color: MUTED,
    align: "center",
  });

  slide.addText("جامعة دمياط | كلية التربية النوعية | 2024/2025", {
    x: 0.5,
    y: 4.9,
    w: 9,
    h: 0.35,
    fontSize: 12,
    fontFace: "Calibri",
    color: MUTED,
    align: "center",
  });

  slide.addNotes(
    "شكراً لحسن استماعكم. نتمنى أن يكون المشروع قد نال إعجابكم. مستعدون لأي أسئلة أو استفسارات."
  );
}

// ============================================================
// GENERATE FILE
// ============================================================
const outputPath = path.resolve(__dirname, "../InsightEdu-Presentation.pptx");
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log("Presentation generated: " + outputPath);
  console.log(`Total slides: ${slideNum}`);
});
