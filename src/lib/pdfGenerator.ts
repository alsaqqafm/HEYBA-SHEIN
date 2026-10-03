import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Order } from '../types';

export const PLATFORM_INFO = {
  name: 'HEYBA Shein | هيبة شي إن',
  email: 'mohammed.f.saqqaf@gmail.com',
  phone: '772606709',
  location: 'اليمن - إب',
};

export const printInvoice = (order: Order) => {
  const items = order.items || [];

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لفتح معاينة طباعة الفاتورة.');
    return;
  }

  const itemsHtml = items
    .map(
      (item, idx) => `
    <tr>
      <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          ${
            item.product_image
              ? `<img src="${item.product_image}" alt="" style="width: 34px; height: 34px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;" />`
              : ''
          }
          <div style="font-weight: 700; color: #0f172a;">${item.product_name}</div>
        </div>
      </td>
      <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
      <td style="text-align: left; direction: ltr; font-weight: 600;">${item.price.toLocaleString()} YER</td>
      <td style="text-align: left; direction: ltr; font-weight: 600;">0 YER</td>
      <td style="text-align: left; direction: ltr; font-weight: 800; color: #1d4ed8;">${item.total.toLocaleString()} YER</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة طلب - ${order.order_number}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Tajawal', system-ui, sans-serif;
          color: #1e293b;
          background: #f8fafc;
          padding: 16px;
          line-height: 1.5;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 2px solid #1d4ed8;
          margin-bottom: 20px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .logo-box {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 900;
          font-size: 22px;
          box-shadow: 0 4px 12px rgba(29,78,216,0.3);
        }
        .brand-details h1 {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
        }
        .brand-details p {
          font-size: 11px;
          color: #1d4ed8;
          font-weight: 700;
          margin-top: 2px;
        }
        .platform-contact {
          font-size: 11px;
          color: #334155;
          text-align: left;
          direction: ltr;
          line-height: 1.6;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 18px;
        }
        .card-title {
          font-size: 12px;
          font-weight: 800;
          color: #1d4ed8;
          margin-bottom: 8px;
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 4px;
        }
        .card p {
          font-size: 11px;
          color: #334155;
          margin-bottom: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 12px;
        }
        th {
          background: #1d4ed8;
          color: #ffffff;
          font-weight: 800;
          text-align: right;
          padding: 10px 12px;
          font-size: 11px;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .totals-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .totals-box {
          width: 300px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 18px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #475569;
          margin-bottom: 6px;
        }
        .row.grand {
          font-size: 15px;
          font-weight: 900;
          color: #1d4ed8;
          border-top: 2px solid #cbd5e1;
          padding-top: 8px;
          margin-top: 6px;
        }
        .footer-note {
          text-align: center;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #64748b;
        }
        @media print {
          body { padding: 0; background: #fff; }
          .invoice-box { border: none; padding: 0; box-shadow: none; max-width: 100%; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center; margin-bottom: 16px;">
        <button onclick="window.print()" style="padding: 10px 24px; background: #1d4ed8; color: white; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; font-family: inherit; font-size: 13px; box-shadow: 0 4px 12px rgba(29,78,216,0.3);">
          🖨️ طباعة الفاتورة الآن (Print / Save PDF)
        </button>
      </div>

      <div class="invoice-box">
        <div class="header">
          <div class="brand">
            <div class="logo-box">H</div>
            <div class="brand-details">
              <h1>HEYBA Shein | هيبة شي إن</h1>
              <p>منصة الأزياء والتسوق الإلكتروني</p>
            </div>
          </div>
          <div class="platform-contact">
            <div><strong>البريد الرسمي:</strong> ${PLATFORM_INFO.email}</div>
            <div><strong>رقم الهاتف:</strong> ${PLATFORM_INFO.phone}</div>
            <div><strong>الموقع:</strong> ${PLATFORM_INFO.location}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="card">
            <div class="card-title">تفاصيل الطلب / Order Details</div>
            <p><strong>رقم الطلب:</strong> ${order.order_number}</p>
            <p><strong>تاريخ الطلب:</strong> ${new Date(order.created_at).toLocaleDateString('ar-YE')}</p>
            <p><strong>حالة الطلب:</strong> ${order.status}</p>
            <p><strong>طريقة الدفع:</strong> ${order.payment_method === 'JEEB' ? 'محفظة جيب' : 'حساب الكريمي'}</p>
            <p><strong>الرقم المرجعي:</strong> ${order.payment_reference || 'غير مدخل'}</p>
            <p><strong>النقاط المكتسبة:</strong> +${order.points_earned || 0} نقطة</p>
          </div>

          <div class="card">
            <div class="card-title">بيانات العميل والشحن / Customer Details</div>
            <p><strong>اسم العميل:</strong> ${order.customer_name}</p>
            <p><strong>البريد الإلكتروني:</strong> ${order.customer_email || 'غير مدخل'}</p>
            <p><strong>رقم الهاتف:</strong> ${order.customer_phone}</p>
            <p><strong>عنوان التوصيل:</strong> ${order.delivery_address}</p>
            ${order.payment_sender_name ? `<p><strong>اسم المحوّل:</strong> ${order.payment_sender_name}</p>` : ''}
            ${order.notes ? `<p><strong>ملاحظات:</strong> ${order.notes}</p>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 36px; text-align: center;">#</th>
              <th>اسم المنتج / Product Name</th>
              <th style="width: 55px; text-align: center;">الكمية</th>
              <th style="width: 100px;">سعر الوحدة</th>
              <th style="width: 70px;">الخصم</th>
              <th style="width: 100px;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="totals-box">
            <div class="row">
              <span>المجموع (Subtotal):</span>
              <span>${order.subtotal.toLocaleString()} ر.ي</span>
            </div>
            <div class="row">
              <span>الخصم (Discount):</span>
              <span>${(order.discount || 0).toLocaleString()} ر.ي</span>
            </div>
            <div class="row">
              <span>التوصيل (Delivery):</span>
              <span>${(order.delivery_fee || 0).toLocaleString()} ر.ي</span>
            </div>
            <div class="row grand">
              <span>الإجمالي النهائي:</span>
              <span>${order.total.toLocaleString()} ر.ي</span>
            </div>
          </div>
        </div>

        <div class="footer-note">
          <p><strong>شكراً لتسوقك من HEYBA Shein | هيبة شي إن!</strong></p>
          <p>لأي استفسار يسعدنا تواصلكم: ${PLATFORM_INFO.phone} | ${PLATFORM_INFO.email} | ${PLATFORM_INFO.location}</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const generateInvoicePDF = (order: Order) => {
  // First trigger crisp print window with full browser PDF generator support
  printInvoice(order);

  // Download fallback jsPDF file with complete customer & order payload
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryBlue = [29, 78, 216];
    const darkNavy = [15, 23, 42];

    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HEYBA Shein', 15, 16);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${PLATFORM_INFO.email} | Phone: ${PLATFORM_INFO.phone} | Location: Yemen - Ibb`, 15, 26);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVOICE #${order.order_number}`, 195, 16, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-US')}`, 195, 24, { align: 'right' });

    const yPos = 44;

    // Customer details box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, yPos, 88, 44, 2, 2, 'FD');

    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER & SHIPPING DATA', 19, yPos + 7);

    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.setFontSize(8);
    doc.text(`Name: ${order.customer_name}`, 19, yPos + 15);
    doc.text(`Email: ${order.customer_email || 'N/A'}`, 19, yPos + 22);
    doc.text(`Phone: ${order.customer_phone}`, 19, yPos + 29);
    doc.text(`Address: ${order.delivery_address}`, 19, yPos + 36);

    // Order details box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(107, yPos, 88, 44, 2, 2, 'FD');

    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER & PAYMENT DETAILS', 111, yPos + 7);

    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.setFontSize(8);
    doc.text(`Payment: ${order.payment_method === 'JEEB' ? 'Jeeb Wallet' : 'Kuraimi Bank'}`, 111, yPos + 15);
    doc.text(`Ref No: ${order.payment_reference || 'N/A'}`, 111, yPos + 22);
    doc.text(`Sender: ${order.payment_sender_name || 'N/A'}`, 111, yPos + 29);
    doc.text(`Status: ${order.status} | Points: +${order.points_earned || 0}`, 111, yPos + 36);

    const tableBody = (order.items || []).map((item, index) => [
      (index + 1).toString(),
      item.product_name,
      `${item.quantity}`,
      `${item.price.toLocaleString()} YER`,
      '0 YER',
      `${item.total.toLocaleString()} YER`,
    ]);

    // @ts-expect-error autoTable plugin typing
    doc.autoTable({
      startY: yPos + 50,
      head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Discount', 'Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: primaryBlue,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 90 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 20 },
        5: { halign: 'right', cellWidth: 25 },
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
    });

    // @ts-expect-error autoTable final Y position
    const finalY = doc.lastAutoTable.finalY + 6;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, finalY, 75, 30, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(`Subtotal: ${order.subtotal.toLocaleString()} YER`, 125, finalY + 7);
    doc.text(`Discount: -${(order.discount || 0).toLocaleString()} YER`, 125, finalY + 13);
    doc.text(`Delivery: ${(order.delivery_fee || 0).toLocaleString()} YER`, 125, finalY + 19);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(`TOTAL: ${order.total.toLocaleString()} YER`, 125, finalY + 26);

    doc.save(`Invoice_${order.order_number}.pdf`);
  } catch (err) {
    console.error('jsPDF Generation error:', err);
  }
};
