import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  X, 
  FileText, 
  Film, 
  ArrowRight,
  FolderArchive
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function IncidentVault({ 
  incidents = [], 
  onClearVault,
  setActiveTab,
  setSelectedEvidenceId
}) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Export incident records to downloadable JSON
  const handleExportJSON = () => {
    if (!incidents.length) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incidents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VIGIL_Incidents_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleOpenVault = (inc) => {
    if (setSelectedEvidenceId) setSelectedEvidenceId(inc.id);
    if (setActiveTab) setActiveTab('evidence');
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-[#080c16]/90 rounded-2xl border border-cyan-500/30 p-4 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-950 border border-red-800 text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-200 tracking-wider">
            RECENT DETECTION LOGS ({incidents.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {incidents.length > 0 && (
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0c1020] hover:bg-[#121830] border border-slate-800 text-cyan-400 font-bold transition cursor-pointer"
              title="Download Incident Audit Trail"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT JSON
            </button>
          )}

          {incidents.length > 0 && (
            <button
              onClick={onClearVault}
              className="p-1.5 rounded-lg bg-[#0c1020] hover:bg-red-950 border border-slate-800 text-slate-400 hover:text-red-400 transition cursor-pointer"
              title="Clear Incident Vault"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Incidents Table / List */}
      {incidents.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center text-slate-500">
          <ShieldAlert className="w-8 h-8 text-slate-700 mb-2" />
          <p className="text-xs">No violent incidents logged during this session.</p>
          <p className="text-[10px] text-slate-600 mt-1">
            System perimeter is clear and operating under nominal parameters.
          </p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="flex flex-wrap items-center justify-between p-2.5 rounded-xl bg-[#0b0f1a] border border-slate-800/80 hover:border-cyan-500/40 transition gap-2 group"
            >
              <div 
                onClick={() => setSelectedIncident(inc)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-[200px]"
              >
                {/* Snapshot Thumbnail Preview */}
                <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-800 bg-black shrink-0">
                  <img
                    src={inc.frame2_url || inc.snapshot || `${API_BASE}/evidence/${inc.id}/frame2`}
                    alt="Incident Thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[9px] text-slate-600">LOG</div>';
                    }}
                  />
                  <div className="absolute inset-0 bg-red-500/10 group-hover:bg-transparent" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">
                      INCIDENT #{inc.id}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      inc.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="text-red-400 font-bold text-[10px]">
                      {((inc.confidence || inc.violence_prob || 0.95) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{inc.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenVault(inc)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition"
                  title="Inspect in Forensic Evidence Vault"
                >
                  <Eye className="w-3 h-3" />
                  <span>VAULT</span>
                </button>

                <a
                  href={`${API_BASE}/evidence/${inc.id}/report`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 transition"
                  title="Download PDF Detection Report"
                >
                  <FileText className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`${API_BASE}/evidence/${inc.id}/zip`}
                  download
                  className="p-1 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 transition"
                  title="Download Full Evidence ZIP"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Snapshot Preview Modal Dialog */}
      {selectedIncident && (
        <div 
          onClick={() => setSelectedIncident(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b0f1a] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-5 flex flex-col gap-4 shadow-2xl relative cursor-default"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  INCIDENT EVIDENCE FILE #{selectedIncident.id}
                </span>
                <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded text-[10px] border border-red-800 font-bold">
                  {selectedIncident.severity}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Large Snapshot */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black">
              <img
                src={selectedIncident.frame2_url || selectedIncident.snapshot || `${API_BASE}/evidence/${selectedIncident.id}/frame2`}
                alt="Full Incident Snapshot"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-slate-500 font-mono">Image Not Found</div>';
                }}
              />
              <div className="scanline-overlay absolute inset-0 pointer-events-none opacity-30" />
              <div className="absolute top-2 left-2 bg-red-950/90 border border-red-500 text-red-300 font-mono text-[10px] px-2 py-0.5 rounded">
                PEAK ALTERCATION MOMENT (FRAME 02)
              </div>
            </div>

            {/* Metadata Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#070a12] p-3 rounded-xl border border-slate-800 text-slate-300 font-mono">
              <div>
                <span className="text-slate-500">TIMESTAMP: </span>
                {selectedIncident.timestamp}
              </div>
              <div>
                <span className="text-slate-500">CONFIDENCE: </span>
                <span className="text-red-400 font-bold">
                  {((selectedIncident.confidence || selectedIncident.violence_prob || 0.95) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">DESCRIPTION: </span>
                {selectedIncident.description || "Spatial-Temporal Physical Contact Anomaly"}
              </div>
            </div>

            {/* Direct Evidence Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  handleOpenVault(selectedIncident);
                  setSelectedIncident(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>INSPECT IN FORENSIC VAULT</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`${API_BASE}/evidence/${selectedIncident.id}/report`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-950 border border-amber-600 text-amber-200 font-bold text-xs"
                >
                  PDF REPORT
                </a>
                <a
                  href={`${API_BASE}/evidence/${selectedIncident.id}/zip`}
                  download
                  className="px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-600 text-indigo-200 font-bold text-xs"
                >
                  DOWNLOAD ZIP
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
