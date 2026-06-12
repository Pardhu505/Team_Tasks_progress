import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './constants.js';

const ROWS = (tasks) =>
  tasks.map((t) => ({
    Employee: t.employeeName,
    Department: t.department,
    Title: t.taskTitle,
    Description: t.taskDescription,
    Status: t.taskStatus,
    'Task Date': formatDate(t.taskDate),
    'Expected Completion': formatDate(t.expectedCompletionDate),
  }));

export const exportToExcel = (tasks, filename = 'task-report') => {
  const ws = XLSX.utils.json_to_sheet(ROWS(tasks));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (tasks, filename = 'task-report') => {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('Team Task Progress Report', 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [['Employee', 'Department', 'Title', 'Status', 'Task Date', 'Expected']],
    body: tasks.map((t) => [
      t.employeeName,
      t.department,
      t.taskTitle,
      t.taskStatus,
      formatDate(t.taskDate),
      formatDate(t.expectedCompletionDate),
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [13, 148, 136] },
    alternateRowStyles: { fillColor: [244, 245, 248] },
  });

  doc.save(`${filename}.pdf`);
};

export const printReport = () => window.print();
