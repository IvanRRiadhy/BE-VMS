import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportVisitorExcel = (groupName: string, visitors: any[]) => {
  const data = visitors.map((v, index) => ({
    No: index + 1,
    Name: v.visitor_name,
    Email: v.visitor_email,
    Phone: v.visitor_phone,
    Organization: v.visitor_organization_name,
    Host: v.host_name,
    Site: v.site_name,
    Status: v.visitor_status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

//   XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors');

  XLSX.writeFile(workbook, `${groupName.replace(/\s+/g, '_')}_Visitors.xlsx`);
};

export const exportVisitorPdf = (groupName: string, visitors: any[]) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(groupName, 14, 15);

  autoTable(doc, {
    startY: 25,
    head: [['No', 'Visitor', 'Email', 'Phone', 'Organization', 'Host', 'Site', 'Status']],
    body: visitors.map((v, index) => [
      index + 1,
      v.visitor_name,
      v.visitor_email,
      v.visitor_phone,
      v.visitor_organization_name,
      v.host_name,
      v.site_name,
      v.visitor_status,
    ]),
    styles: {
      fontSize: 9,
    },
  });

  doc.save(`${groupName}_Visitors.pdf`);
};
