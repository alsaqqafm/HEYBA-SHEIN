import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Order } from '../types';

export const generateInvoicePDF = (order: Order) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue = [29, 78, 216];
  const darkNavy = [15, 23, 42];
  const borderGray = [226, 232, 240];

  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HEYBA Shein', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('E-Commerce Invoice / فاتورة شراء', 15, 26);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`INVOICE #${order.order_number}`, 195, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-US')}`, 195, 24, { align: 'right' });
  doc.text(`Status: ${order.status}`, 195, 30, { align: 'right' });

  let yPos = 48;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(15, yPos, 88, 38, 2, 2, 'FD');

  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER DETAILS / بيانات العميل', 19, yPos + 7);

  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Name: ${order.customer_name}`, 19, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${order.customer_email}`, 19, yPos + 22);
  doc.text(`Phone: ${order.customer_phone}`, 19, yPos + 29);
  doc.text(`Address: ${order.delivery_address.slice(0, 35)}`, 19, yPos + 34);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(107, yPos, 88, 38, 2, 2, 'FD');

  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS / تفاصيل الدفع', 111, yPos + 7);

  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Method: ${order.payment_method === 'JEEB' ? 'Jeeb Wallet (محفظة جيب)' : 'Kuraimi Bank (حساب الكريمي)'}`, 111, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref Number: ${order.payment_reference || 'N/A'}`, 111, yPos + 22);
  doc.text(`Points Earned: +${order.points_earned} PTS`, 111, yPos + 29);

  yPos += 46;

  const tableBody = (order.items || []).map((item, index) => [
    (index + 1).toString(),
    item.product_name,
    `${item.quantity}`,
    `${item.price.toLocaleString()} YER`,
    `${item.total.toLocaleString()} YER`,
  ]);

  // @ts-expect-error autoTable plugin typing
  doc.autoTable({
    startY: yPos,
    head: [['#', 'Item / المنتج', 'Qty / الكمية', 'Unit Price / السعر', 'Total / الإجمالي']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 90 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 32 },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });

  // @ts-expect-error autoTable final Y position
  const finalY = doc.lastAutoTable.finalY + 8;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(120, finalY, 75, 32, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`Subtotal: ${order.subtotal.toLocaleString()} YER`, 125, finalY + 8);
  doc.text(`Discount: -${order.discount.toLocaleString()} YER`, 125, finalY + 14);
  doc.text(`Delivery: ${order.delivery_fee.toLocaleString()} YER`, 125, finalY + 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(`TOTAL: ${order.total.toLocaleString()} YER`, 125, finalY + 28);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('Thank you for shopping with HEYBA Shein!', 105, 280, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('شكراً لتسوقك من هيبة شي إن - كل ما تحتاجه في مكان واحد', 105, 286, { align: 'center' });

  doc.save(`Invoice_${order.order_number}.pdf`);
};
