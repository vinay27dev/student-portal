"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitStudentForm } from "@/actions/submission";
import { User, Phone, Image as ImageIcon, Send, AlertCircle, CheckCircle2, Eye, X } from "lucide-react";

type StudentFormProps = {
  isNewJoinee: boolean;
  initialStudentPhone: string;
  initialParentPhone: string;
  initialStudentName?: string;
  initialOtherFields?: any;
};

export default function StudentForm({
  isNewJoinee,
  initialStudentPhone,
  initialParentPhone,
  initialStudentName = "",
  initialOtherFields = {},
}: StudentFormProps) {
  const router = useRouter();
  
  // Responsive State Variables for input values
  const [studentPhone, setStudentPhone] = useState(initialStudentPhone);
  const [parentPhone, setParentPhone] = useState(initialParentPhone);
  const [studentName, setStudentName] = useState(initialStudentName);
  const [email, setEmail] = useState(initialOtherFields.email || "");
  const [schoolName, setSchoolName] = useState(initialOtherFields.schoolName || "");
  const [grade, setGrade] = useState(initialOtherFields.grade || "");
  const [signatureData, setSignatureData] = useState<string>("");

  const [parentName, setParentName] = useState(initialOtherFields.parentName || "");
  const [parentAddress, setParentAddress] = useState(initialOtherFields.parentAddress || "");
  const [parentSignatureData, setParentSignatureData] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleOpenPreview = () => {
    if (!studentName.trim() || !email.trim() || !signatureData || !parentName.trim() || !parentAddress.trim() || !parentSignatureData) {
      setError("Please fill out all required fields and upload both signatures before previewing.");
      return;
    }
    setError("");
    setShowPreview(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Student signature file exceeds the 5MB limit.");
      return;
    }
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleParentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Parent signature file exceeds the 5MB limit.");
      return;
    }
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setParentSignatureData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !email.trim() || !signatureData || !parentName.trim() || !parentAddress.trim() || !parentSignatureData) {
      setError("Please fill out all required fields and upload both signatures.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await submitStudentForm({
      studentPhone: studentPhone,
      parentPhone: parentPhone,
      studentName,
      otherFields: { email, schoolName, grade, parentName, parentAddress, parentSignatureData },
      signatureUrl: signatureData,
      isNewJoinee,
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setError(res.error || "An error occurred during submission.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-12 text-center shadow-sm max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Submission Successful!</h2>
        <p className="text-slate-500 mt-2">Redirecting you to the dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">
          {isNewJoinee ? "New Student Enrollment" : "Update Student Details"}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {isNewJoinee ? "Please fill out the form below to enroll." : "Provide the updated information for this student."}
        </p>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Now Editable Phone Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="Enter student phone number"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Parent Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Enter parent phone number"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full my-6"></div>

          {/* Form Fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Student Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Lincoln High School"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Grade Level</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="10th Grade"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Signature Upload <span className="text-red-500">*</span></label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors group cursor-pointer relative bg-slate-50 hover:bg-indigo-50/50">
              <div className="space-y-2 text-center z-10">
                {signatureData ? (
                  <div className="flex flex-col items-center">
                    <img src={signatureData} alt="Signature Preview" className="h-20 object-contain mix-blend-multiply" />
                    <p className="text-xs text-indigo-600 font-medium mt-2">Click to change signature</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-10 w-10 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <span className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload a file</span>
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
              />
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full my-10"></div>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wider">Declaration by Parent / Guardian</h3>
            <p className="text-sm text-slate-600 mb-6 italic leading-relaxed bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              I hereby confirm that my ward will adhere to all the rules and regulations of NIT Goa hostels. I shall be responsible for their conduct and behavior during their stay in the hostel.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Parent / Guardian Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Address <span className="text-red-500">*</span></label>
                <textarea
                  value={parentAddress}
                  onChange={(e) => setParentAddress(e.target.value)}
                  placeholder="Full Residential Address"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800 resize-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-slate-700">Signature of the Parent / Guardian <span className="text-red-500">*</span></label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors group cursor-pointer relative bg-white hover:bg-indigo-50/50">
                  <div className="space-y-2 text-center z-10">
                    {parentSignatureData ? (
                      <div className="flex flex-col items-center">
                        <img src={parentSignatureData} alt="Parent Signature Preview" className="h-20 object-contain mix-blend-multiply" />
                        <p className="text-xs text-indigo-600 font-medium mt-2">Click to change signature</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-10 w-10 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <div className="flex text-sm text-slate-600 justify-center">
                          <span className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload a file</span>
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    onChange={handleParentFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
  type="button"
  onClick={handleOpenPreview}
  className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
>
  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
  Preview PDF
</button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  Submit Form
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Modal Overlay */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 overflow-y-auto p-4 sm:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto w-full sticky top-0 bg-slate-900/90 py-4 z-10 backdrop-blur-sm">
            <h2 className="text-white font-bold text-xl flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Live PDF Preview
            </h2>
            <button 
              onClick={() => setShowPreview(false)} 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
              Close Preview
            </button>
          </div>
          
          <div className="max-w-3xl mx-auto w-full space-y-8 pb-12">
            {/* Page 1 Mock Canvas */}
            <div className="bg-white p-8 sm:p-16 aspect-[1/1.414] shadow-2xl relative border border-slate-200 rounded-sm">
              <h1 className="text-2xl font-bold font-serif mb-8 text-black">STUDENT DECLARATION FORM</h1>
              <div className="space-y-6 font-serif text-black text-sm sm:text-base">
                <div className="flex"><span className="font-bold w-32 sm:w-40">Student Name:</span> <span>{studentName || 'N/A'}</span></div>
                <div className="flex"><span className="font-bold w-32 sm:w-40">Email Address:</span> <span>{email || 'N/A'}</span></div>
                <div className="flex"><span className="font-bold w-32 sm:w-40">Student Phone:</span> <span>{studentPhone}</span></div>
                <div className="flex"><span className="font-bold w-32 sm:w-40">Parent Phone:</span> <span>{parentPhone}</span></div>
                <div className="flex"><span className="font-bold w-32 sm:w-40">School Name:</span> <span>{schoolName || 'N/A'}</span></div>
                <div className="flex"><span className="font-bold w-32 sm:w-40">Grade Level:</span> <span>{grade || 'N/A'}</span></div>
              </div>
              
              <div className="absolute bottom-12 left-8 sm:bottom-16 sm:left-16">
                <div className="font-bold font-serif mb-4 text-black">Signature:</div>
                {signatureData ? (
                  <img src={signatureData} className="h-12 sm:h-16 mix-blend-multiply" alt="Student Signature" />
                ) : (
                  <div className="text-red-500 text-sm font-serif">[No Signature Provided]</div>
                )}
              </div>
            </div>
            
            {/* Page 2 Mock Canvas */}
            <div className="bg-white p-8 sm:p-16 aspect-[1/1.414] shadow-2xl relative border border-slate-200 rounded-sm">
              <h1 className="text-xl sm:text-2xl font-bold font-serif mb-8 text-black uppercase">Declaration by Parent / Guardian</h1>
              <p className="font-serif mb-12 leading-relaxed text-black text-sm sm:text-base text-justify">
                I hereby confirm that my ward will adhere to all the rules and regulations of NIT Goa hostels. I shall be responsible for their conduct and behavior during their stay in the hostel.
              </p>
              
              <div className="space-y-6 font-serif text-black text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row"><span className="font-bold w-full sm:w-56">Name of Parent/Guardian:</span> <span className="mt-1 sm:mt-0">{parentName || 'N/A'}</span></div>
                <div className="flex flex-col sm:flex-row"><span className="font-bold w-full sm:w-56">Mobile Number:</span> <span className="mt-1 sm:mt-0">{parentPhone}</span></div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-bold w-full sm:w-56">Address:</span>
                  <span className="mt-1 sm:mt-0 whitespace-pre-wrap flex-1">{parentAddress || 'N/A'}</span>
                </div>
              </div>
              
              <div className="absolute bottom-12 left-8 sm:bottom-16 sm:left-16">
                <div className="font-bold font-serif mb-4 text-black">Signature of the Parent / Guardian:</div>
                {parentSignatureData ? (
                  <img src={parentSignatureData} className="h-12 sm:h-16 mix-blend-multiply" alt="Parent Signature" />
                ) : (
                  <div className="text-red-500 text-sm font-serif">[No Signature Provided]</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}