import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  FileText, 
  Film, 
  Eye, 
  RefreshCw,
  FolderArchive
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function HistoryPage({ setActiveTab, setSelectedEvidenceId }) {
  const [incidents, setIncidents] = useState([]);
  const [evidenceEvents, setEvidenceEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [incRes, evRes] = await Promise.all([
        fetch(`${API_BASE}/incidents?limit=100`).then(r => r.json()).catch(() => ({ incidents: [] })),
        fetch(`${API_BASE}/evidence/list`).then(r => r.json()).catch(() => ({ events: [] }))
      ]);
      setIncidents(incRes.incidents || []);
      setEvidenceEvents(evRes.events || []);
    } catch (e) {
      console.warn("Failed to load history data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear the active incident history logs?")) {
      try {
        await fetch(`${API_BASE}/incidents/clear`, { method: 'POST' });
        await fetchData();
      } catch (e) {
        console.error("Failed to clear history:", e);
      }
    }
  };

  // Combine incidents and evidence events into a unified list
  const combinedRecords = React.useMemo(() => {
    const map = new Map();

    // Add evidence packages first
    evidenceEvents.forEach(ev => {
      map.set(ev.event_id, {
        id: ev.event_id,
        timestamp: ev.timestamp,
        confidence: ev.confidence || ev.violence_prob || 0.95,
        severity: ev.severity || (ev.violence_prob > 0.85 ? 'CRITICAL' : 'ELEVATED'),
        source: ev.source || 'Optical Stream',
        has_evidence: true,
        frame1_url: ev.frame1_url || `${API_BASE}/evidence/${ev.event_id}/frame1`,
        frame2_url: ev.frame2_url || `${API_BASE}/evidence/${ev.event_id}/frame2`,
        clip_url: ev.clip_url || `${API_BASE}/evidence/${ev.event_id}/clip`,
        report_url: ev.report_url || `${API_BASE}/evidence/${ev.event_id}/report`,
        zip_url: ev.zip_url || `${API_BASE}/evidence/${ev.event_id}/zip`,
      });
    });

    // Merge in-memory incidents
    incidents.forEach(inc => {
      const existing = map.get(inc.id) || {};
      map.set(inc.id, {
        ...existing,
        id: inc.id,
        timestamp: inc.timestamp || existing.timestamp,
        confidence: inc.confidence || existing.confidence,
        severity: inc.severity || existing.severity || 'CRITICAL',
        source: inc.description || existing.source || 'Live CCTV Sensor',
        snapshot: inc.snapshot || existing.frame2_url,
        has_evidence: inc.has_evidence || existing.has_evidence || false,
        frame1_url: inc.frame1_url || existing.frame1_url || `${API_BASE}/evidence/${inc.id}/frame1`,
        frame2_url: inc.frame2_url || existing.frame2_url || `${API_BASE}/evidence/${inc.id}/frame2`,
        clip_url: inc.clip_url || existing.clip_url || `${API_BASE}/evidence/${inc.id}/clip`,
        report_url: inc.report_url || existing.report_url || `${API_BASE}/evidence/${inc.id}/report`,
        zip_url: inc.zip_url || existing.zip_url || `${API_BASE}/evidence/${inc.id}/zip`,
      });
    });

    const list = Array.from(map.values());
    list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    return list;
  }, [incidents, evidenceEvents]);

  // Filtered by search and severity
  const filteredRecords = combinedRecords.filter(rec => {
    const matchesSearch = 
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.source && rec.source.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSeverity = 
      filterSeverity === 'ALL' || rec.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-mono tracking-tight">
              DETECTION HISTORY & AUDIT LOGS
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              TOTAL: {combinedRecords.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Searchable historical archive of detected physical altercations, evidence packages, and downloadable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh History"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {combinedRecords.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 font-mono text-xs font-bold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              CLEAR LOGS
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#090d18] border border-cyan-500/20 p-4 rounded-2xl font-mono text-xs">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-[#060912] border border-slate-800 rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by event ID or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-200 placeholder-slate-500 text-xs focus:outline-none w-full"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
          </span>
          {['ALL', 'CRITICAL', 'ELEVATED', 'NORMAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List Cards */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-3xl bg-[#090d18] border border-slate-800 p-12 text-center space-y-3 font-mono">
          <FolderArchive className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-sm font-bold text-white">No Detection Records Found</div>
          <p className="text-xs text-slate-400">
            {searchQuery || filterSeverity !== 'ALL'
              ? 'Try changing your search query or filter settings.'
              : 'Trigger a simulated threat or start the live video feed to generate records.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="rounded-2xl bg-[#0a0f1c] border border-cyan-500/20 hover:border-cyan-500/40 p-4 transition-all shadow-md flex flex-wrap items-center justify-between gap-4 font-mono text-xs"
            >
              {/* Left Details */}
              <div className="flex items-center gap-4">
                {/* Snapshot Thumbnail or Icon */}
                <div className="w-16 h-12 rounded-lg bg-black border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={rec.frame2_url || `${API_BASE}/evidence/${rec.id}/frame2`}
                    alt={rec.id}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-[9px] text-slate-600">NO THUMB</span>';
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-wider">{rec.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : rec.severity === 'ELEVATED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {rec.severity}
                    </span>
                    <span className="text-red-400 font-black">
                      {(rec.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>{rec.timestamp}</span>
                    <span>&bull;</span>
                    <span className="text-slate-300">{rec.source}</span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Open in Vault */}
                <button
                  onClick={() => {
                    if (setSelectedEvidenceId) setSelectedEvidenceId(rec.id);
                    setActiveTab('evidence');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>INSPECT VAULT</span>
                </button>

                {/* Direct Frame 1 */}
                <a
                  href={`${API_BASE}/evidence/${rec.id}/frame1`}
                  download
                  title="Download Evidence Frame 01 (Onset)"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition"
                >
                  <Eye className="w-4 h-4" />
                </a>

                {/* Direct Frame 2 */}
                <a
                  href={`${API_BASE}/evidence/${rec.id}/frame2`}
                  download
                  title="Download Evidence Frame 02 (Peak)"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-red-300 transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                </a>

                {/* Direct Video Clip */}
                <a
                  href={`${API_BASE}/evidence/${rec.id}/clip`}
                  download
                  title="Download 4.5s MP4 Clip"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-300 transition"
                >
                  <Film className="w-4 h-4" />
                </a>

                {/* Direct PDF Report */}
                <a
                  href={`${API_BASE}/evidence/${rec.id}/report`}
                  target="_blank"
                  rel="noreferrer"
                  title="View / Download PDF Report"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition"
                >
                  <FileText className="w-4 h-4" />
                </a>

                {/* Direct ZIP Archive */}
                <a
                  href={`${API_BASE}/evidence/${rec.id}/zip`}
                  download
                  title="Download Full Evidence ZIP Archive"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 font-bold transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ZIP</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
