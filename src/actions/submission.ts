"use server";

import { prisma } from "@/lib/prisma";
import { generateSubmissionPDF, PDFData } from "@/lib/pdfGenerator";
import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export type SubmissionInput = {
  studentPhone: string;
  parentPhone: string;
  studentName: string;
  otherFields?: any;
  signatureUrl: string;
  isNewJoinee: boolean;
};

export async function submitStudentForm(data: SubmissionInput) {
  try {
    const {
      studentPhone,
      parentPhone,
      studentName,
      otherFields,
      signatureUrl,
      isNewJoinee,
    } = data;

    if (!studentPhone || !parentPhone || !studentName.trim() || !signatureUrl) {
      return { success: false, error: "Missing required fields" };
    }

    if (signatureUrl.length > 7000000) {
      return { success: false, error: "Student signature payload exceeds limit." };
    }
    if (otherFields?.parentSignatureData && otherFields.parentSignatureData.length > 7000000) {
      return { success: false, error: "Parent signature payload exceeds limit." };
    }

    // Sanitize text inputs by trimming
    const sanitizedStudentName = studentName.trim();
    const sanitizedOtherFields = {
      ...otherFields,
      email: otherFields?.email?.trim(),
      schoolName: otherFields?.schoolName?.trim(),
      grade: otherFields?.grade?.trim(),
      parentName: otherFields?.parentName?.trim(),
      parentAddress: otherFields?.parentAddress?.trim(),
    };

    // 1. Query the database using both studentPhone and parentPhone
    const existingRecords = await prisma.submission.findMany({
      where: {
        studentPhone,
        parentPhone,
      },
      orderBy: {
        version: "desc",
      },
    });

    let newSubmission;
    let version = 0;

    if (existingRecords.length === 0) {
      // 2. If no record exists, save a new entry with version: 0.
      newSubmission = await prisma.submission.create({
        data: {
          studentPhone,
          parentPhone,
          studentName: sanitizedStudentName,
          signatureUrl,
          otherFields: JSON.stringify(sanitizedOtherFields || {}),
          version: 0,
        },
      });
      version = 0;
    } else {
      // Records exist
      if (isNewJoinee) {
        // 3. If a record already exists and the submission is flagged as a "New Joinee", block it
        return { success: false, error: "Record already exists" };
      }

      // 4. If a record exists and it's flagged as an "Update/Correction", find the highest version number
      const highestVersionRecord = existingRecords[0];
      version = highestVersionRecord.version + 1;

      // insert a completely new row with the incremented version number
      newSubmission = await prisma.submission.create({
        data: {
          studentPhone,
          parentPhone,
          studentName: sanitizedStudentName,
          signatureUrl,
          otherFields: JSON.stringify(sanitizedOtherFields || {}),
          version: version,
        },
      });
    }

    // --- PDF GENERATION & STORAGE ---
    const pdfData: PDFData = {
      studentName: sanitizedStudentName,
      studentPhone,
      parentPhone,
      otherFields: sanitizedOtherFields || {},
      signatureUrl,
      version
    };

    const pdfBytes = await generateSubmissionPDF(pdfData);

    // Determine filename
    const safeName = studentName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    let fileName = "";
    if (version === 0) {
      fileName = `${safeName}_declaration.pdf`;
    } else {
      fileName = `${safeName}_declaration_update${version}.pdf`;
    }

    let pdfUrl = `/submissions/${fileName}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // 1. Upload directly to Vercel Blob Storage
      const blob = await put(fileName, pdfBytes, {
        access: 'public',
        contentType: 'application/pdf',
      });
      pdfUrl = blob.url;
    } else {
      // 2. Fallback to Local Disk
      const publicDir = path.join(process.cwd(), "public", "submissions");
      await fs.mkdir(publicDir, { recursive: true });
      const filePath = path.join(publicDir, fileName);
      await fs.writeFile(filePath, pdfBytes);
    }

    // Update the Submission record with the pdfUrl
    const mergedFields = { ...(sanitizedOtherFields || {}), pdfUrl };
    await prisma.submission.update({
      where: { id: newSubmission.id },
      data: { otherFields: JSON.stringify(mergedFields) }
    });

    return { success: true, data: newSubmission, pdfPath: pdfUrl };
  } catch (error: any) {
    console.error("Form submission error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
