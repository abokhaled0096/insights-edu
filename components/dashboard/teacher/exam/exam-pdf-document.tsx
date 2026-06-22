"use client";
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, position: 'relative' },
  // علامات الزوايا لمساعدة الـ OCR على المحاذاة
  anchor: { position: 'absolute', width: 20, height: 20, backgroundColor: 'black' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: 1 },
  qrBox: { alignItems: 'center', gap: 4 },
  qrImage: { width: 60, height: 60 },
  studentInfo: { marginBottom: 20 },
  questionRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' },
  questionText: { flex: 1, marginRight: 10 },
  optionsContainer: { flexDirection: 'row', gap: 20, marginTop: 5 },
  bubble: { width: 18, height: 18, borderRadius: 9, border: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }
});

export const ExamPdfDocument = ({ exam, students, qrCodes }: any) => (
  <Document>
    {students.map((student: any) => (
      <Page key={student.id} size="A4" style={styles.page}>
        {/* Anchor Marks for OCR Alignment */}
        <View style={[styles.anchor, { top: 10, left: 10 }]} />
        <View style={[styles.anchor, { top: 10, right: 10 }]} />
        <View style={[styles.anchor, { bottom: 10, left: 10 }]} />
        <View style={[styles.anchor, { bottom: 10, right: 10 }]} />

        {/* Header with Main QRs */}
        <View style={styles.header}>
          <View style={styles.qrBox}>
            <Image src={qrCodes[`exam_${exam.id}`]} style={styles.qrImage} />
            <Text style={{ fontSize: 8 }}>Exam ID</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{exam.title}</Text>
            <Text>{student.name} - {student.studentCode}</Text>
          </View>
          <View style={styles.qrBox}>
            <Image src={qrCodes[`student_${student.id}`]} style={styles.qrImage} />
            <Text style={{ fontSize: 8 }}>Student ID</Text>
          </View>
        </View>

        {/* Questions */}
        {exam.questions.map((q: any, index: number) => (
          <View key={q.id} style={styles.questionRow}>
             {/* Question QR */}
            <View style={{ width: 40, marginRight: 10 }}>
               <Image src={qrCodes[`q_${q.id}`]} style={{ width: 40, height: 40 }} />
            </View>
            
            <View style={styles.questionText}>
              <Text>{index + 1}. {q.text}</Text>
              <View style={styles.optionsContainer}>
                {q.options.map((opt: any) => (
                  <View key={opt.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={styles.bubble}><Text style={{fontSize: 10}}>{opt.label}</Text></View>
                    <Text style={{fontSize: 10}}>{opt.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </Page>
    ))}
  </Document>
);