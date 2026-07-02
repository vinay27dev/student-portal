"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Download, User, Calendar } from "lucide-react";

export type AdminSubmissionGroup = {
  id: string; // unique key for the group (e.g. phones combined)
  studentPhone: string;
  parentPhone: string;
  latestName: string;
  latestDate: string;
  submissions: {
    id: string;
    version: number;
    createdAt: string;
    studentName: string;
    pdfUrl?: string | null;
  }[];
};

type Props = {
  groups: AdminSubmissionGroup[];
};

export default function AdminSubmissionsTable({ groups }: Props) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getPdfUrl = (studentName: string, version: number, cloudUrl?: string | null) => {
    if (cloudUrl) return cloudUrl; // Return cloud URL directly if available

    const safeName = studentName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (version === 0) {
      return `/submissions/${safeName}_declaration.pdf`;
    }
    return `/submissions/${safeName}_declaration_update${version}.pdf`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
              <th className="py-4 px-6 w-12"></th>
              <th className="py-4 px-6">Student Name</th>
              <th className="py-4 px-6">Student Phone</th>
              <th className="py-4 px-6">Parent Phone</th>
              <th className="py-4 px-6">Latest Update</th>
              <th className="py-4 px-6 text-right">Total Versions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groups.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No submissions found.
                </td>
              </tr>
            )}
            {groups.map((group) => (
              <React.Fragment key={group.id}>
                {/* Primary Row */}
                <tr 
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedRow === group.id ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => toggleRow(group.id)}
                >
                  <td className="py-4 px-6">
                    {expandedRow === group.id ? (
                      <ChevronUp className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <User className="w-4 h-4" />
                      </div>
                      {group.latestName}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{group.studentPhone}</td>
                  <td className="py-4 px-6 text-slate-600">{group.parentPhone}</td>
                  <td className="py-4 px-6 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(group.latestDate).toISOString().split('T')[0]}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {group.submissions.length}
                    </span>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedRow === group.id && (
                  <tr>
                    <td colSpan={6} className="p-0 bg-slate-50/50 border-b-2 border-indigo-100">
                      <div className="px-16 py-6 animate-in slide-in-from-top-2 fade-in duration-200">
                        <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Version History</h4>
                        <div className="space-y-3">
                          {group.submissions.map((sub, index) => (
                            <div key={sub.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900">Version {sub.version}</span>
                                    {index === 0 && (
                                      <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                        Latest
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    Submitted on {new Date(sub.createdAt).toISOString().replace('T', ' ').split('.')[0]} by {sub.studentName}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={getPdfUrl(sub.studentName, sub.version, sub.pdfUrl)}
                                download
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                              >
                                <Download className="w-4 h-4" />
                                Download PDF
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
