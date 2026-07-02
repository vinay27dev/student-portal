"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

export async function sendOtp(studentPhone: string, parentPhone: string) {
  try {
    if (!studentPhone || !parentPhone) {
      return { success: false, error: "Both phone numbers are required." };
    }

    // Generate random 6-digit OTPs
    const studentOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const parentOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Check Twilio fallback
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhone) {
      const client = twilio(accountSid, authToken);
      
      // Helper to format Indian phone numbers for Twilio
      const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\s+/g, '');
        if (cleaned.length === 10) return `+91${cleaned}`;
        if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
        return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
      };

      const formattedStudentPhone = formatPhone(studentPhone);
      const formattedParentPhone = formatPhone(parentPhone);

      // Send real SMS
      await client.messages.create({
        body: `Your Student Portal OTP is: ${studentOtp}`,
        from: twilioPhone,
        to: formattedStudentPhone,
      });
      await client.messages.create({
        body: `Your Parent Portal OTP is: ${parentOtp}`,
        from: twilioPhone,
        to: formattedParentPhone,
      });
    } else {
      console.log(`MOCK SMS (Twilio Missing) - Student: ${studentOtp} | Parent: ${parentOtp}`);
    }

    // Save expected OTPs to temporary session
    const cookieStore = await cookies();
    cookieStore.set("otp_session", JSON.stringify({ studentOtp, parentOtp }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60, // 5 minutes
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("sendOtp error:", error);
    return { success: false, error: error.message || "Failed to send OTP." };
  }
}

export async function verifyAndLogin(studentPhone: string, parentPhone: string, studentOtp: string, parentOtp: string) {
  try {
    // Basic validation
    if (!studentPhone || !parentPhone || !studentOtp || !parentOtp) {
      return { success: false, error: "All fields are required." };
    }

    const cookieStore = await cookies();
    const hasTwilioKeys = !!process.env.TWILIO_AUTH_TOKEN;
    
    // Strict Verification Mode (if Twilio is set up)
    if (hasTwilioKeys) {
      const otpSessionStr = cookieStore.get("otp_session")?.value;
      if (!otpSessionStr) {
        return { success: false, error: "OTP expired. Please request a new one." };
      }
      
      const otpSession = JSON.parse(otpSessionStr) as { studentOtp: string; parentOtp: string };
      
      if (otpSession.studentOtp !== studentOtp || otpSession.parentOtp !== parentOtp) {
        return { success: false, error: "Invalid OTP pins." };
      }
    } else {
      // Frictionless Fallback Mode (Local Dev)
      if (studentOtp.length !== 6 || parentOtp.length !== 6) {
         return { success: false, error: "Invalid OTP format." };
      }
    }

    // Clear OTP session once verified
    cookieStore.delete("otp_session");

    // Set the session cookie
    cookieStore.set(
      "session",
      JSON.stringify({ studentPhone, parentPhone }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      }
    );

    // Check if there's an existing record
    const existingRecords = await prisma.submission.findMany({
      where: {
        studentPhone,
        parentPhone,
      },
    });

    if (existingRecords.length > 0) {
      return { success: true, redirect: "/form/edit" };
    } else {
      return { success: true, redirect: "/form/new" };
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message || "Something went wrong." };
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie) as { studentPhone: string; parentPhone: string };
  } catch {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
