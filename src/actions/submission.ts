"use server"; // 👈 THIS LINE IS EXTREMELY IMPORTANT FOR NEXT.JS

import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { generatePDF } from '@/lib/pdfGenerator';

export async function submitStudentForm(formData: any) {
  try {
    // 1. Generate the PDF bytes from the form data
    const pdfBytes = await generatePDF(formData);
    
    const fileName = `declaration_${formData.studentName || 'student'}_${Date.now()}.pdf`;
    let fileUrl = '';

    // Check if deploying to Vercel with Blob Storage configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(fileName, Buffer.from(pdfBytes), {
        access: 'public',
        contentType: 'application/pdf',
      });
      fileUrl = blob.url;
    } else {
      fileUrl = `/submissions/${fileName}`;
    }

    // 2. Save the submission details into the database
    const submission = await prisma.user.create({
      data: {
        email: formData.email,
        name: formData.studentName,
      },
    });

    return { success: true, url: fileUrl, submission };
  } catch (error: any) {
    console.error('Submission failed:', error);
    return { success: false, error: error.message || 'Something went wrong' };
  }
}