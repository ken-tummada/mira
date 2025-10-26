import React from "react";
import { useNews } from "../providers/NewsProvider";

export const NewsWidget: React.FC = () => {
  const { headlines, loading, error } = useNews();

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-blue-300">
          Today's Headlines
        </h2>
      </div>

      {loading && <div className="text-gray-300">Loading news…</div>}

      {!loading && error && (
        <div>
          <div className="text-red-400 mb-3">Error: {error}</div>
        </div>
      )}

      {!loading && !error && headlines.length === 0 && (
        <div className="text-gray-300">No headlines found.</div>
      )}

      {!loading && !error && headlines.length > 0 && (
        <div className="space-y-4">
          {headlines.map((h, idx) => (
            <div key={idx} className="rounded-lg bg-white/5 p-4">
              <div className="text-base font-semibold mb-1">{h.section}</div>
              <div className="text-lg leading-snug">{h.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
