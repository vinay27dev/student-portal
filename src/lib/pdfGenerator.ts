import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type PDFData = {
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  otherFields?: any;
  signatureUrl: string;
  version: number;
};

// Fixed function name to match your server action import
export async function generatePDF(data: PDFData): Promise<Uint8Array> {
  const { studentName, studentPhone, parentPhone, otherFields, signatureUrl, version } = data;

  // Sanitize text to prevent pdf-lib glyph rendering errors (strips emojis and non-WinAnsi chars)
  const sanitize = (text: string) => {
    if (!text) return "";
    return text.replace(/[^\x20-\x7E\s]/g, "");
  };

  const safeStudentName = sanitize(studentName);
  const safeEmail = sanitize(otherFields?.email || "N/A");
  const safeSchoolName = sanitize(otherFields?.schoolName || "N/A");
  const safeGrade = sanitize(otherFields?.grade || "N/A");
  const safeParentName = sanitize(otherFields?.parentName || "N/A");
  const safeParentAddress = sanitize(otherFields?.parentAddress || "N/A");

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();
  
  // Embed standard fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Add a page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  const margin = 50;
  let currentY = height - margin;

  // Draw Header
  page.drawText("STUDENT DECLARATION FORM", {
    x: margin,
    y: currentY,
    size: 20,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  currentY -= 30;

  // Draw Version Info
  page.drawText(`Record Version: ${version}`, {
    x: margin,
    y: currentY,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  currentY -= 40;

  // Draw Form Fields
  const fields = [
    { label: "Student Name:", value: safeStudentName },
    { label: "Email Address:", value: safeEmail },
    { label: "Student Phone:", value: studentPhone },
    { label: "Parent Phone:", value: parentPhone },
    { label: "School Name:", value: safeSchoolName },
    { label: "Grade Level:", value: safeGrade },
  ];

  for (const field of fields) {
    page.drawText(field.label, {
      x: margin,
      y: currentY,
      size: 12,
      font: timesRomanBold,
    });
    page.drawText(field.value, {
      x: margin + 120,
      y: currentY,
      size: 12,
      font: timesRomanFont,
    });
    currentY -= 25;
  }

  // Draw Signature Section
  currentY -= 40;
  page.drawText("Signature:", {
    x: margin,
    y: currentY,
    size: 12,
    font: timesRomanBold,
  });
  currentY -= 10;

  // Handle Base64 Signature Image
  if (signatureUrl && signatureUrl.startsWith("data:image/")) {
    try {
      const isPng = signatureUrl.startsWith("data:image/png");
      const isJpeg = signatureUrl.startsWith("data:image/jpeg") || signatureUrl.startsWith("data:image/jpg");
      
      const base64Data = signatureUrl.split(",")[1];
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      let image;
      if (isPng) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (isJpeg) {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      if (image) {
        const imgDims = image.scale(0.5);
        page.drawImage(image, {
          x: margin,
          y: currentY - imgDims.height,
          width: imgDims.width,
          height: imgDims.height,
        });
      }
    } catch (e) {
      console.error("Failed to embed signature image", e);
      page.drawText("[Signature Image Unreadable]", {
        x: margin,
        y: currentY - 20,
        size: 10,
        font: timesRomanFont,
        color: rgb(1, 0, 0),
      });
    }
  } else {
    page.drawText("[No Signature Provided]", {
      x: margin,
      y: currentY - 20,
      size: 10,
      font: timesRomanFont,
    });
  }

  // --- PAGE 2: Parent Declaration ---
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  const margin2 = 50;
  let currentY2 = page2.getSize().height - margin2;

  // Header
  page2.drawText("DECLARATION BY PARENT / GUARDIAN", {
    x: margin2,
    y: currentY2,
    size: 16,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  currentY2 -= 40;

  // Declaration text
  const declarationText = "I hereby confirm that my ward will adhere to all the rules and regulations of NIT Goa hostels. I shall be responsible for their conduct and behavior during their stay in the hostel.";
  
  // Quick manual wrap
  page2.drawText(declarationText, {
    x: margin2,
    y: currentY2,
    size: 12,
    font: timesRomanFont,
    maxWidth: 595.28 - (margin2 * 2),
    lineHeight: 18,
  });
  currentY2 -= 60; // Approximate spacing for wrapped text

  // Parent Details
  page2.drawText(`Name of Parent/Guardian: ${safeParentName}`, {
    x: margin2,
    y: currentY2,
    size: 12,
    font: timesRomanBold,
  });
  currentY2 -= 25;

  page2.drawText(`Mobile Number: ${parentPhone}`, {
    x: margin2,
    y: currentY2,
    size: 12,
    font: timesRomanBold,
  });
  currentY2 -= 25;

  page2.drawText(`Address:`, {
    x: margin2,
    y: currentY2,
    size: 12,
    font: timesRomanBold,
  });
  currentY2 -= 20;

  page2.drawText(safeParentAddress, {
    x: margin2,
    y: currentY2,
    size: 12,
    font: timesRomanFont,
    maxWidth: 595.28 - (margin2 * 2),
    lineHeight: 16,
  });
  currentY2 -= 60; // Space for address

  // Parent Signature
  const parentSignatureUrl = otherFields?.parentSignatureData;
  page2.drawText("Signature of the Parent / Guardian:", {
    x: margin2,
    y: currentY2,
    size: 12,
    font: timesRomanBold,
  });
  currentY2 -= 10;

  if (parentSignatureUrl && parentSignatureUrl.startsWith("data:image/")) {
    try {
      const isPng = parentSignatureUrl.startsWith("data:image/png");
      const isJpeg = parentSignatureUrl.startsWith("data:image/jpeg") || parentSignatureUrl.startsWith("data:image/jpg");
      
      const base64Data = parentSignatureUrl.split(",")[1];
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      let image;
      if (isPng) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (isJpeg) {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      if (image) {
        const imgDims = image.scale(0.5);
        page2.drawImage(image, {
          x: margin2,
          y: currentY2 - imgDims.height,
          width: imgDims.width,
          height: imgDims.height,
        });
      }
    } catch (e) {
      console.error("Failed to embed parent signature image", e);
      page2.drawText("[Signature Image Unreadable]", {
        x: margin2,
        y: currentY2 - 20,
        size: 10,
        font: timesRomanFont,
        color: rgb(1, 0, 0),
      });
    }
  } else {
    page2.drawText("[No Signature Provided]", {
      x: margin2,
      y: currentY2 - 20,
      size: 10,
      font: timesRomanFont,
    });
  }

  // Serialize the PDFDocument to bytes
  return await pdfDoc.save();
}