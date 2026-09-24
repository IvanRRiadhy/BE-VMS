import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { getConfig } from 'src/config';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

export const exportVisitorExcel = (groupName: string, visitors: any[]) => {
  const data = visitors.map((v, index) => ({
    No: index + 1,
    Name: v.visitor_name,
    Email: v.visitor_email,
    Phone: v.visitor_phone,
    Organization: v.visitor_organization_name,
    Host: v.host_name,
    'Vehicle Type': v.vehicle_type,
    'License Plate Number': v.vehicle_plate_number,
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

const config = getConfig();
const logoUrl = config.LOGO_URL;

export const exportVisitorPdf = (groupName: string, visitors: any[]) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const generatedAt = dayjs().format('DD MMMM YYYY HH:mm:ss');

  // =========================================================
  // HEADER
  // =========================================================

  doc.addImage(logoUrl as any, 'PNG', 14, 10, 18, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('BANK INDONESIA', 36, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text('Visitor Management System', 36, 22);

  doc.setFontSize(8);

  doc.text(`Generated : ${generatedAt}`, pageWidth - 14, 17, {
    align: 'right',
  });

  // =========================================================
  // TITLE
  // =========================================================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(35, 35, 35);

  doc.text('VISITOR REPORT', 14, 37);

  // Group name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);

  doc.text(groupName, 14, 43);

  // Separator
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);

  doc.line(14, 48, pageWidth - 14, 48);

  // =========================================================
  // TABLE
  // =========================================================

  autoTable(doc, {
    startY: 52,

    margin: {
      left: 14,
      right: 14,
      bottom: 16,
    },
    tableWidth: 269,

    head: [
      [
        'No',
        'Name',
        'Email',
        'Phone',
        'Organization',
        'Start Period',
        'End Period',
        'Host',
        'Vehicle Type',
        'License Plate Number',
        'Status',
      ],
    ],

    body: visitors.map((v, index) => [
      index + 1,
      v.visitor_name ?? '-',
      v.visitor_email ?? '-',
      v.visitor_phone ?? '-',
      v.visitor_organization_name ?? '-',
      formatDateTime(v.visitor_period_start),
      formatDateTime(v.visitor_period_end),
      v.host_name ?? '-',
      v.vehicle_type ?? '-',
      v.vehicle_plate_number ?? '-',
      v.visitor_status ?? '-',
    ]),

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.5,
      valign: 'middle',

      textColor: [45, 45, 45],

      lineColor: [220, 220, 220],
      lineWidth: 0.2,

      overflow: 'linebreak',
    },

    headStyles: {
      fillColor: [33, 119, 181],
      textColor: 255,

      fontStyle: 'bold',
      fontSize: 7.5,

      halign: 'left',
      valign: 'middle',
    },

    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },

    columnStyles: {
      0: {
        cellWidth: 10, // No
        halign: 'center',
      },
      1: {
        cellWidth: 27, // Name
      },
      2: {
        cellWidth: 35, // Email
      },
      3: {
        cellWidth: 23, // Phone
      },
      4: {
        cellWidth: 33, // Organization
      },
      5: {
        cellWidth: 27, // Start Period
      },
      6: {
        cellWidth: 27, // End Period
      },
      7: {
        cellWidth: 29, // Host
      },
      8: {
        cellWidth: 22, // Vehicle Type
      },
      9: {
        cellWidth: 23, // License Plate
      },
      10: {
        cellWidth: 18, // Status
      },
    },

    didDrawPage: (data) => {
      const currentPage = data.pageNumber;

      // Footer separator
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);

      doc.line(14, pageHeight - 13, pageWidth - 14, pageHeight - 13);

      // Footer left
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(110, 110, 110);

      doc.text('Bank Indonesia • Visitor Management System', 14, pageHeight - 7);

      // Footer right
      doc.text(`Page ${currentPage}`, pageWidth - 14, pageHeight - 7, {
        align: 'right',
      });
    },
  });
  const safeGroupName = groupName.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '_');
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const dateStr = `${day}-${month}-${year}`;
  doc.save(`${safeGroupName}_${dateStr}.pdf`);
};
