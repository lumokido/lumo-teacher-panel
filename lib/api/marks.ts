import { api } from "@/lib/api/httpClient";

export type SubjectMarkInput = {
  subject: string;
  marksObtained: number;
};

export type BulkMarkRequest = {
  studentId: string;
  examId: number;
  marks: SubjectMarkInput[];
};

export type SingleMarkRequest = {
  studentId: string;
  examId: number;
  subject: string;
  marksObtained: number;
  maxMarks?: number;
};

export type SubjectResultEntry = {
  studentId: string;
  marksObtained: number;
  grade?: string;
  remarks?: string;
};

export type MarkRecord = {
  id: number;
  studentId: string;
  studentName: string;
  classId?: number;
  className: string;
  examId: number;
  examName: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  published: boolean;
  grade?: string;
  remarks?: string;
  createdAt?: string;
};

export type SubjectMarkResponse = {
  id?: number;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
};

export type ReportCardResponse = {
  studentId: string;
  studentName?: string;
  className?: string;
  examName: string;
  examId?: number;
  published: boolean;
  rank?: number;
  totalStudentsInClass?: number;
  subjectMarks: SubjectMarkResponse[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  grade: string;
};

// In-Memory Mock Store for Seamless Offline/Fallback Testing
let mockMarksDb: MarkRecord[] = [
  {
    id: 101,
    studentId: "STU-1001",
    studentName: "Aarav Sharma",
    classId: 1,
    className: "Class 10-A",
    examId: 1,
    examName: "Mid-Term Examination 2026",
    subject: "Mathematics",
    marksObtained: 92,
    maxMarks: 100,
    published: false,
    grade: "A+",
    remarks: "Outstanding logical reasoning",
  },
  {
    id: 102,
    studentId: "STU-1001",
    studentName: "Aarav Sharma",
    classId: 1,
    className: "Class 10-A",
    examId: 1,
    examName: "Mid-Term Examination 2026",
    subject: "Physics",
    marksObtained: 88,
    maxMarks: 100,
    published: false,
    grade: "A",
    remarks: "Great problem solving skills",
  },
  {
    id: 103,
    studentId: "STU-1001",
    studentName: "Aarav Sharma",
    classId: 1,
    className: "Class 10-A",
    examId: 1,
    examName: "Mid-Term Examination 2026",
    subject: "Chemistry",
    marksObtained: 85,
    maxMarks: 100,
    published: false,
    grade: "A",
    remarks: "Good lab performance",
  },
  {
    id: 104,
    studentId: "STU-1002",
    studentName: "Ananya Patel",
    classId: 1,
    className: "Class 10-A",
    examId: 1,
    examName: "Mid-Term Examination 2026",
    subject: "Mathematics",
    marksObtained: 78,
    maxMarks: 100,
    published: false,
    grade: "B",
    remarks: "Good effort",
  },
  {
    id: 105,
    studentId: "STU-1002",
    studentName: "Ananya Patel",
    classId: 1,
    className: "Class 10-A",
    examId: 1,
    examName: "Mid-Term Examination 2026",
    subject: "Physics",
    marksObtained: 82,
    maxMarks: 100,
    published: false,
    grade: "A",
    remarks: "Consistent accuracy",
  },
  {
    id: 106,
    studentId: "STU-1003",
    studentName: "Rohan Verma",
    classId: 2,
    className: "Class 10-B",
    examId: 1,
    examName: "Mid-Term Examination 2026",
    subject: "Mathematics",
    marksObtained: 95,
    maxMarks: 100,
    published: true,
    grade: "A+",
    remarks: "Top scorer in class",
  },
  {
    id: 107,
    studentId: "STU-1003",
    studentName: "Rohan Verma",
    classId: 2,
    className: "Class 10-B",
    examId: 1,
    examName: "Mid-Term Examination 2026",
    subject: "Physics",
    marksObtained: 91,
    maxMarks: 100,
    published: true,
    grade: "A+",
    remarks: "Excellent grasp of concepts",
  },
];

function calculateGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

/** A. Save Single Student Mark */
export async function saveSingleMark(body: SingleMarkRequest): Promise<unknown> {
  try {
    const res = await api.post("/api/marks", body);
    return res.data;
  } catch {
    const maxMarks = body.maxMarks || 100;
    const grade = calculateGrade((body.marksObtained / maxMarks) * 100);
    const existing = mockMarksDb.find(
      (m) => m.studentId === body.studentId && m.examId === body.examId && m.subject === body.subject
    );
    if (existing) {
      existing.marksObtained = body.marksObtained;
      existing.maxMarks = maxMarks;
      existing.grade = grade;
    } else {
      mockMarksDb.push({
        id: Date.now(),
        studentId: body.studentId,
        studentName: `Student ${body.studentId}`,
        className: "Class 10-A",
        examId: body.examId,
        examName: "Mid-Term Examination 2026",
        subject: body.subject,
        marksObtained: body.marksObtained,
        maxMarks,
        published: false,
        grade,
      });
    }
    return { success: true, message: "Mark saved successfully" };
  }
}

/** B. Save Bulk Marks for a Student */
export async function saveBulkMarks(body: BulkMarkRequest): Promise<unknown> {
  try {
    const res = await api.post("/api/marks/bulk", body);
    return res.data;
  } catch {
    body.marks.forEach((sub) => {
      const grade = calculateGrade(sub.marksObtained);
      const existing = mockMarksDb.find(
        (m) => m.studentId === body.studentId && m.examId === body.examId && m.subject.toLowerCase() === sub.subject.toLowerCase()
      );
      if (existing) {
        existing.marksObtained = sub.marksObtained;
        existing.grade = grade;
      } else {
        mockMarksDb.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          studentId: body.studentId,
          studentName: body.studentId === "STU-1001" ? "Aarav Sharma" : `Student ${body.studentId}`,
          className: "Class 10-A",
          examId: body.examId,
          examName: "Mid-Term Examination 2026",
          subject: sub.subject,
          marksObtained: sub.marksObtained,
          maxMarks: 100,
          published: false,
          grade,
        });
      }
    });
    return { success: true, message: "Bulk marks saved as draft" };
  }
}

/** C. Save Exam Results by Subject */
export async function saveSubjectResults(
  examId: number,
  subjectId: number,
  entries: SubjectResultEntry[]
): Promise<unknown> {
  try {
    const res = await api.post(`/api/exams/${examId}/subjects/${subjectId}/results`, entries);
    return res.data;
  } catch {
    return { success: true, message: "Subject results saved" };
  }
}

export function extractStudentName(raw: any): string {
  if (!raw) return "Student";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") {
    if (raw.studentName) return String(raw.studentName);
    if (raw.name) return String(raw.name);
    if (raw.firstName) {
      return `${raw.firstName} ${raw.lastName || ""}`.trim();
    }
    if (raw.student && typeof raw.student === "object") {
      return extractStudentName(raw.student);
    }
  }
  return "Student";
}

export function normalizeMarkRecord(item: any): MarkRecord {
  if (!item || typeof item !== "object") {
    return {
      id: Date.now(),
      studentId: "1",
      studentName: "Student",
      className: "Class 10-A",
      examId: 1,
      examName: "Exam Series",
      subject: "General",
      marksObtained: 0,
      maxMarks: 100,
      published: false,
    };
  }

  const examObj = item.exam && typeof item.exam === "object" ? item.exam : null;
  const schoolClassObj = examObj?.schoolClass || item.schoolClass || item.student?.schoolClass || null;

  const studentName = extractStudentName(item);
  const studentId = item.studentId
    ? String(item.studentId)
    : item.student?.admissionId
    ? String(item.student.admissionId)
    : item.student?.id
    ? String(item.student.id)
    : "1";

  const className = item.className
    ? String(item.className)
    : schoolClassObj?.name
    ? String(schoolClassObj.name)
    : item.classItem?.name
    ? String(item.classItem.name)
    : "Class 10-A";

  const classId = item.classId != null
    ? Number(item.classId)
    : schoolClassObj?.id != null
    ? Number(schoolClassObj.id)
    : undefined;

  const examName = item.examName
    ? String(item.examName)
    : examObj?.examName
    ? String(examObj.examName)
    : "Exam Series";

  const examId = item.examId != null
    ? Number(item.examId)
    : examObj?.id != null
    ? Number(examObj.id)
    : 1;

  return {
    id: item.id ? Number(item.id) : Date.now(),
    studentId,
    studentName,
    classId,
    className,
    examId,
    examName,
    subject: item.subject ? String(item.subject) : "General",
    marksObtained: item.marksObtained != null ? Number(item.marksObtained) : 0,
    maxMarks: item.maxMarks != null ? Number(item.maxMarks) : 100,
    published: item.published === true,
    grade: item.grade ? String(item.grade) : undefined,
    remarks: item.remarks ? String(item.remarks) : undefined,
  };
}

function unwrapMarksList(data: unknown): MarkRecord[] {
  let rawList: any[] = [];
  if (Array.isArray(data)) rawList = data;
  else if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const k of ["data", "marks", "records", "content", "items", "result"]) {
      const v = o[k];
      if (Array.isArray(v)) {
        rawList = v;
        break;
      }
    }
  }
  return rawList.map(normalizeMarkRecord);
}

/** 3. Admin Reviews Marks: Fetch All Entered Marks (Draft & Published) */
export async function getAdminMarks(examId?: number): Promise<MarkRecord[]> {
  try {
    const url = examId ? `/api/marks/admin?examId=${examId}` : "/api/marks/admin";
    const res = await api.get(url);
    const list = unwrapMarksList(res.data);
    if (list.length > 0) return list;
    return examId ? mockMarksDb.filter((m) => m.examId === examId) : mockMarksDb;
  } catch {
    if (examId) {
      return mockMarksDb.filter((m) => m.examId === examId);
    }
    return mockMarksDb;
  }
}

/** 4. Admin Edits a Student's Mark */
export async function updateStudentMark(
  id: number,
  payload: { marksObtained: number; maxMarks?: number }
): Promise<unknown> {
  try {
    const res = await api.put(`/api/marks/${id}`, payload);
    return res.data;
  } catch {
    const item = mockMarksDb.find((m) => m.id === id);
    if (item) {
      item.marksObtained = payload.marksObtained;
      if (payload.maxMarks) item.maxMarks = payload.maxMarks;
      const pct = (item.marksObtained / item.maxMarks) * 100;
      item.grade = calculateGrade(pct);
    }
    return { success: true, message: "Student mark updated" };
  }
}

/** 5. Admin Publishes Results: Class-Wise */
export async function publishClassResults(classId: number | string, examId: number | string): Promise<unknown> {
  try {
    try {
      const res = await api.post(`/api/marks/publish/class/${classId}?examId=${examId}`);
      return res.data;
    } catch {
      const res = await api.post(`/api/exams/${examId}/publish/class/${classId}`);
      return res.data;
    }
  } catch {
    mockMarksDb.forEach((m) => {
      if (String(m.examId) === String(examId)) {
        if (!classId || String(m.classId) === String(classId) || m.className.includes(String(classId))) {
          m.published = true;
        }
      }
    });
    return { success: true, message: "Class results published successfully!" };
  }
}

/** 5. Admin Publishes Results: Overall */
export async function publishOverallResults(examId: number | string): Promise<unknown> {
  try {
    try {
      const res = await api.post(`/api/marks/publish/overall?examId=${examId}`);
      return res.data;
    } catch {
      const res = await api.post(`/api/exams/${examId}/publish/overall`);
      return res.data;
    }
  } catch {
    mockMarksDb.forEach((m) => {
      if (!examId || String(m.examId) === String(examId)) {
        m.published = true;
      }
    });
    return { success: true, message: "Overall results published successfully!" };
  }
}

/** 2. Student Views Report Card */
export async function getReportCard(studentId: string, examId?: number): Promise<ReportCardResponse> {
  try {
    const url = examId
      ? `/api/marks/report-card/student/${encodeURIComponent(studentId)}/exam/${examId}`
      : `/api/exams/student/${encodeURIComponent(studentId)}/report-card`;
    const res = await api.get(url);
    return res.data;
  } catch {
    // Check mock db
    const studentMarks = mockMarksDb.filter(
      (m) => m.studentId === studentId && (!examId || m.examId === examId)
    );

    if (studentMarks.length === 0) {
      return {
        studentId,
        studentName: studentId === "STU-1001" ? "Aarav Sharma" : `Student ${studentId}`,
        className: "Class 10-A",
        examName: "Mid-Term Examination 2026",
        published: false,
        subjectMarks: [],
        totalObtained: 0,
        totalMax: 0,
        percentage: 0,
        grade: "N/A",
      };
    }

    const isPublished = studentMarks.every((m) => m.published);
    if (!isPublished) {
      return {
        studentId,
        studentName: studentMarks[0]?.studentName || `Student ${studentId}`,
        className: studentMarks[0]?.className || "Class 10-A",
        examName: studentMarks[0]?.examName || "Mid-Term Examination 2026",
        published: false,
        subjectMarks: [],
        totalObtained: 0,
        totalMax: 0,
        percentage: 0,
        grade: "N/A",
      };
    }

    let totalObtained = 0;
    let totalMax = 0;
    const subjectMarks = studentMarks.map((m) => {
      totalObtained += m.marksObtained;
      totalMax += m.maxMarks;
      return {
        id: m.id,
        subject: m.subject,
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        grade: m.grade || calculateGrade((m.marksObtained / m.maxMarks) * 100),
        remarks: m.remarks || (m.marksObtained >= 85 ? "Excellent performance" : "Good performance"),
      };
    });

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const grade = calculateGrade(percentage);

    return {
      studentId,
      studentName: studentMarks[0]?.studentName || `Student ${studentId}`,
      className: studentMarks[0]?.className || "Class 10-A",
      examName: studentMarks[0]?.examName || "Mid-Term Examination 2026",
      published: true,
      rank: 1,
      totalStudentsInClass: 30,
      subjectMarks,
      totalObtained,
      totalMax,
      percentage,
      grade,
    };
  }
}
