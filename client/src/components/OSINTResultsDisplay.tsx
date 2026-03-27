import React from "react";
import { ExternalLink, CheckCircle, AlertCircle, Zap } from "lucide-react";

/* ================= TYPES ================= */

type Props = {
  results: {
    visualMatches?: any[];
    webResults?: any[];
    socialProfiles?: any[];
    workplaces?: any[];
    summary?: string;
    confidenceScore?: number;
  };
};

/* ================= COMPONENT ================= */

export default function OSINTResultsDisplay({ results }: Props) {
  if (!results) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
        <p className="text-gray-600">لا يوجد بيانات</p>
      </div>
    );
  }

  const {
    visualMatches = [],
    webResults = [],
    socialProfiles = [],
    workplaces = [],
    summary = "",
    confidenceScore = 0
  } = results;

  if (
    visualMatches.length === 0 &&
    webResults.length === 0 &&
    socialProfiles.length === 0 &&
    workplaces.length === 0
  ) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
        <p className="text-gray-600">لم يتم العثور على نتائج OSINT</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* CONFIDENCE */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">درجة الثقة</p>
            <p className="text-2xl font-bold text-indigo-600">
              {Math.round(confidenceScore * 100)}%
            </p>
          </div>
          <Zap className="h-8 w-8 text-yellow-500" />
        </div>

        <div className="w-full bg-gray-200 h-2 rounded mt-3">
          <div
            className="bg-indigo-600 h-2 rounded"
            style={{ width: `${confidenceScore * 100}%` }}
          />
        </div>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="rounded-xl border bg-indigo-50 p-5">
          <h3 className="mb-2 font-semibold">الملخص الذكي</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {/* SOCIAL */}
      {socialProfiles.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold">السوشيال ميديا</h3>

          <div className="space-y-2">
            {socialProfiles.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium capitalize">{s.platform}</div>
                  {s.username && (
                    <div className="text-xs text-gray-500">@{s.username}</div>
                  )}
                </div>

                <ExternalLink size={16} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* WORK */}
      {workplaces.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold">أماكن العمل</h3>

          {workplaces.map((w, i) => (
            <div key={i} className="p-3 border rounded mb-2">
              <div className="font-medium">{w.company}</div>
              {w.position && (
                <div className="text-sm text-gray-600">{w.position}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* IMAGES */}
      {visualMatches.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold">الصور</h3>

          <div className="grid grid-cols-3 gap-2">
            {visualMatches.map((img, i) => (
              <a key={i} href={img.pageUrl} target="_blank" rel="noreferrer">
                <img
                  src={img.thumbnail}
                  className="w-full h-24 object-cover rounded"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* WEB */}
      {webResults.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold">نتائج البحث</h3>

          {webResults.slice(0, 10).map((r, i) => (
            <a
              key={i}
              href={r.link}
              target="_blank"
              rel="noreferrer"
              className="block p-2 border-b text-sm text-blue-600"
            >
              {r.title}
            </a>
          ))}
        </div>
      )}

    </div>
  );
          }
