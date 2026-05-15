type ReportCardData = {
  student: {
    firstName: string
    lastName: string
    studentId: string
    className: string
  }
  school: {
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
  }
  session: string
  term: string
  results: {
    subjectName: string
    caScore: number | null
    midterm: number | null
    examScore: number | null
    total: number | null
    grade: string | null
    remark: string | null
  }[]
  teacherRemark?: string | null
  teacherSignatureUrl?: string | null
  teacherName?: string | null
  principalSignatureUrl?: string | null
  principalName?: string | null
}

function gradeColor(grade: string | null): string {
  if (!grade) return '#6b7280'
  if (grade.startsWith('A')) return '#16a34a'
  if (grade.startsWith('B')) return '#2563eb'
  if (grade.startsWith('C')) return '#d97706'
  if (grade.startsWith('D') || grade.startsWith('E')) return '#ea580c'
  return '#dc2626'
}

export function generateReportCardHTML(data: ReportCardData): string {
  const {
    student,
    school,
    session,
    term,
    results,
    teacherRemark,
    teacherSignatureUrl,
    teacherName,
    principalSignatureUrl,
    principalName,
  } = data

  const validResults = results.filter((r) => r.total !== null)
  const average =
    validResults.length > 0
      ? (
          validResults.reduce((sum, r) => sum + (r.total ?? 0), 0) /
          validResults.length
        ).toFixed(1)
      : '—'

  const subjectRows = results
    .map(
      (r) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">${r.subjectName}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;color:#374151;">${r.caScore ?? '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;color:#374151;">${r.midterm ?? '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;color:#374151;">${r.examScore ?? '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:14px;font-weight:700;color:#111827;">${r.total ?? '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">
        <span style="background:${gradeColor(r.grade)}22;color:${gradeColor(r.grade)};font-weight:700;font-size:13px;padding:3px 10px;border-radius:20px;border:1px solid ${gradeColor(r.grade)}44;">${r.grade ?? '—'}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#6b7280;">${r.remark ?? '—'}</td>
    </tr>
  `,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Report Card — ${student.firstName} ${student.lastName}</title>
  <style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:Arial,sans-serif; background:#fff; color:#111827; padding:40px; max-width:900px; margin:0 auto; }</style>
</head>
<body>

  <!-- Header -->
  <div style="text-align:center;border-bottom:3px solid #1d4ed8;padding-bottom:20px;margin-bottom:24px;">
    <h1 style="font-size:24px;font-weight:800;color:#1d4ed8;">${school.name.toUpperCase()}</h1>
    ${school.address ? `<p style="font-size:12px;color:#6b7280;margin-top:4px;">${school.address}</p>` : ''}
    ${school.phone || school.email ? `<p style="font-size:12px;color:#6b7280;margin-top:2px;">${school.phone ? `Tel: ${school.phone}` : ''}${school.phone && school.email ? ' | ' : ''}${school.email ? `Email: ${school.email}` : ''}</p>` : ''}
    <div style="margin-top:12px;display:inline-block;background:#1d4ed8;color:white;padding:6px 24px;border-radius:20px;font-size:14px;font-weight:600;letter-spacing:1px;">
      STUDENT REPORT CARD
    </div>
  </div>

  <!-- Student Info -->
  <div style="display:flex;gap:0;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
    <div style="flex:1;padding:16px;border-right:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Student Name</p>
      <p style="font-size:16px;font-weight:700;color:#111827;">${student.firstName} ${student.lastName}</p>
    </div>
    <div style="flex:0.5;padding:16px;border-right:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Student ID</p>
      <p style="font-size:14px;font-weight:600;color:#374151;font-family:monospace;">${student.studentId}</p>
    </div>
    <div style="flex:0.5;padding:16px;border-right:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Class</p>
      <p style="font-size:14px;font-weight:600;color:#374151;">${student.className}</p>
    </div>
    <div style="flex:0.5;padding:16px;border-right:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Session</p>
      <p style="font-size:14px;font-weight:600;color:#374151;">${session}</p>
    </div>
    <div style="flex:0.5;padding:16px;">
      <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Term</p>
      <p style="font-size:14px;font-weight:600;color:#374151;">${term}</p>
    </div>
  </div>

  <!-- Results Table -->
  <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
    <thead>
      <tr style="background:#1d4ed8;">
        <th style="padding:12px;text-align:left;font-size:12px;color:white;font-weight:600;">SUBJECT</th>
        <th style="padding:12px;text-align:center;font-size:12px;color:white;font-weight:600;">CA /20</th>
        <th style="padding:12px;text-align:center;font-size:12px;color:white;font-weight:600;">MID /20</th>
        <th style="padding:12px;text-align:center;font-size:12px;color:white;font-weight:600;">EXAM /60</th>
        <th style="padding:12px;text-align:center;font-size:12px;color:white;font-weight:600;">TOTAL</th>
        <th style="padding:12px;text-align:center;font-size:12px;color:white;font-weight:600;">GRADE</th>
        <th style="padding:12px;text-align:left;font-size:12px;color:white;font-weight:600;">REMARK</th>
      </tr>
    </thead>
    <tbody>${subjectRows}</tbody>
    <tfoot>
      <tr style="background:#f9fafb;">
        <td colspan="4" style="padding:12px;font-size:13px;font-weight:700;color:#374151;">Average</td>
        <td style="padding:12px;text-align:center;font-size:16px;font-weight:800;color:#1d4ed8;">${average}</td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>

  <!-- Teacher's Remark -->
  ${
    teacherRemark
      ? `
  <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:24px;background:#f9fafb;">
    <p style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
      Class Teacher's Remark
    </p>
    <p style="font-size:14px;color:#111827;font-style:italic;">"${teacherRemark}"</p>
  </div>
  `
      : ''
  }

  <!-- Grading Key -->
  <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:24px;">
    <p style="font-size:12px;font-weight:700;color:#374151;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Grading Key</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      ${[
        { grade: 'A1', range: '75–100', remark: 'Excellent', color: '#16a34a' },
        { grade: 'B2', range: '70–74', remark: 'Very Good', color: '#2563eb' },
        { grade: 'B3', range: '65–69', remark: 'Good', color: '#2563eb' },
        { grade: 'C4', range: '60–64', remark: 'Credit', color: '#d97706' },
        { grade: 'C5', range: '55–59', remark: 'Credit', color: '#d97706' },
        { grade: 'C6', range: '50–54', remark: 'Credit', color: '#d97706' },
        { grade: 'D7', range: '45–49', remark: 'Pass', color: '#ea580c' },
        { grade: 'E8', range: '40–44', remark: 'Pass', color: '#ea580c' },
        { grade: 'F9', range: '0–39', remark: 'Fail', color: '#dc2626' },
      ]
        .map(
          (g) => `
        <div style="background:${g.color}11;border:1px solid ${g.color}33;border-radius:6px;padding:6px 10px;font-size:11px;">
          <span style="font-weight:700;color:${g.color};">${g.grade}</span>
          <span style="color:#6b7280;margin-left:4px;">${g.range}</span>
          <span style="color:#9ca3af;margin-left:4px;">${g.remark}</span>
        </div>
      `,
        )
        .join('')}
    </div>
  </div>

  <!-- Signatures Footer -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:2px solid #e5e7eb;padding-top:20px;">

    <!-- Class Teacher -->
    <div style="text-align:center;min-width:180px;">
      ${
        teacherSignatureUrl
          ? `<img src="${teacherSignatureUrl}" alt="Teacher signature" style="height:48px;object-fit:contain;margin-bottom:4px;display:block;margin-left:auto;margin-right:auto;" />`
          : `<div style="width:160px;border-bottom:1px solid #374151;margin-bottom:6px;"></div>`
      }
      <p style="font-size:11px;color:#374151;font-weight:600;">${teacherName ?? 'Class Teacher'}</p>
      <p style="font-size:10px;color:#9ca3af;">Class Teacher's Signature</p>
    </div>

    <!-- Generated date -->
    <div style="text-align:center;">
      <p style="font-size:11px;color:#9ca3af;">
        Generated on ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <p style="font-size:10px;color:#d1d5db;margin-top:2px;">SchoolPortal — Digital Report Card</p>
    </div>

    <!-- Principal -->
    <div style="text-align:center;min-width:180px;">
      ${
        principalSignatureUrl
          ? `<img src="${principalSignatureUrl}" alt="Principal signature" style="height:48px;object-fit:contain;margin-bottom:4px;display:block;margin-left:auto;margin-right:auto;" />`
          : `<div style="width:160px;border-bottom:1px solid #374151;margin-bottom:6px;margin-left:auto;"></div>`
      }
      <p style="font-size:11px;color:#374151;font-weight:600;">${principalName ?? 'Principal'}</p>
      <p style="font-size:10px;color:#9ca3af;">Principal's Signature</p>
    </div>

  </div>

</body>
</html>`
}
