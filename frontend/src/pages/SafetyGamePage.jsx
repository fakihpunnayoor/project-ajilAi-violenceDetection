import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Shield, 
  Award, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ExternalLink, 
  Zap, 
  Timer, 
  AlertTriangle,
  Brain,
  ChevronRight,
  Eye
} from 'lucide-react';

// ==========================================
// GAME DATA & SCENARIOS FOR 4 DISTINCT MODES
// ==========================================

// Mode 1: Situational Awareness Scenarios
const SITUATIONAL_QUESTIONS = [
  {
    id: 1,
    title: "Metro Transit Platform Agitation",
    context: "Two individuals are standing 2 feet apart on a crowded subway platform. One subject has clenched fists, an arched forward torso, and is raising voice volume while pointing aggressively.",
    question: "What is the primary kinetic indicator of impending physical altercation?",
    options: [
      { text: "Raised voice volume alone", isCorrect: false, explanation: "Vocal escalation indicates dispute, but kinetic indicators require physical posturing." },
      { text: "Clenched fists coupled with forward torso angle and invasive proximity", isCorrect: true, explanation: "Correct! Biomechanical forward leaning, clenched fists, and invasion of personal space are classic pre-contact cues." },
      { text: "Rapid backward pacing", isCorrect: false, explanation: "Backward retreat usually indicates disengagement or fear rather than imminent assault." },
      { text: "Looking at phone repeatedly", isCorrect: false, explanation: "Distraction or ambient checking is not an attack indicator." }
    ]
  },
  {
    id: 2,
    title: "Crowded Sports Arena Concourse",
    context: "Following a close game, fans from rival teams converge near an exit turnstile. A crowd begins circling two individuals whose movements suddenly quicken with rapid arm jerks.",
    question: "What optical surveillance action should be prioritized by the security console?",
    options: [
      { text: "Ignore until a physical strike is landed", isCorrect: false, explanation: "Passive waiting delays emergency response and increases civilian bystander injury risk." },
      { text: "Lock PTZ focus, bookmark timestamp in Evidence Vault, and alert field marshals", isCorrect: true, explanation: "Correct! Early verification and tagging prevents escalation while preserving forensic video audit trails." },
      { text: "Immediately trigger full building evacuation alarms", isCorrect: false, explanation: "Premature evacuation causes panic and stampede risk in a concourse." },
      { text: "Cut power to the concourse lighting", isCorrect: false, explanation: "Darkness exacerbates violence and prevents surveillance tracking." }
    ]
  },
  {
    id: 3,
    title: "Commercial Parking Structure Incursion",
    context: "At 02:30 AM, an optical sensor registers sudden rapid kinetic displacement between two parked vehicles. One subject falls to the ground while the other raises a blunt object.",
    question: "How should the VIGIL system classify this kinetic profile?",
    options: [
      { text: "Benign fast motion / jogging", isCorrect: false, explanation: "Vertical displacement (falling) followed by repeated high-energy downward trajectory is indicative of assault." },
      { text: "Critical violent assault requiring immediate automated alert and evidence capture", isCorrect: true, explanation: "Correct! Sudden ground impact and repeated overhead striking trigger maximum CNN-LSTM threat probability." },
      { text: "Low-risk ambient noise", isCorrect: false, explanation: "Blunt force striking in parking structures is high-severity." },
      { text: "Routine maintenance activity", isCorrect: false, explanation: "No maintenance schedules align with sudden ground-impact kinematics." }
    ]
  }
];

// Mode 2: AI Detection Challenge (Human vs. Neural Network)
const AI_CHALLENGE_SCENARIOS = [
  {
    id: 1,
    label: "Soccer Celebration Chest-Bump",
    description: "Two athletes run toward each other at high velocity and collide violently mid-air with intense kinetic force, then land laughing and high-fiving teammates.",
    aiPrediction: "BENIGN FAST MOTION (Confidence: 99.1%)",
    isViolence: false,
    aiReasoning: "Trained on Hard-Negative sports corpus. The absence of sustained striking and immediate deceleration into celebratory postural symmetry suppresses false positives."
  },
  {
    id: 2,
    label: "Nightclub Alley Scuffle",
    description: "Two patrons grapple against a brick wall. Multiple rapid closed-fist strikes to the upper torso occur within 1.2 seconds, causing backward head snap.",
    aiPrediction: "VIOLENCE DETECTED (Confidence: 98.7%)",
    isViolence: true,
    aiReasoning: "High kinetic divergence in 64-dim optical delta, rapid localized acceleration peaks, and non-cooperative postural struggle detected by temporal LSTM."
  },
  {
    id: 3,
    label: "Breakdance Battle Fast Footwork",
    description: "A dancer executes a 1990s spin followed by an aggressive freeze gesture directly towards an opponent 3 feet away with rapid arm extensions.",
    aiPrediction: "BENIGN FAST MOTION (Confidence: 97.8%)",
    isViolence: false,
    aiReasoning: "Hard-negative training recognizes rhythmic cadence and controlled ground contact points, preventing false alarm triggers."
  },
  {
    id: 4,
    label: "Sudden Shove & Ground Takedown",
    description: "Subject A forcefully shoves Subject B backwards into a bench, follows up with repeated grappling pins and downward strikes.",
    aiPrediction: "VIOLENCE DETECTED (Confidence: 99.4%)",
    isViolence: true,
    aiReasoning: "Sudden asymmetric velocity shift, rapid target elevation collapse, and multi-frame temporal hysteresis criteria fully satisfied."
  }
];

// Mode 3: Safety Mission Crisis Simulator
const SAFETY_MISSIONS = [
  {
    id: 1,
    title: "Crisis Mission Alpha: University Library Quad",
    briefing: "Optical Sensor #04 flags an elevated kinetic disturbance between two students near the study hall breezeway. The sliding buffer confidence is rising from 52% toward 78%.",
    choices: [
      {
        text: "Wait 15 seconds to see if they calm down on their own",
        outcome: "Poor Choice. The altercation turned physical, resulting in minor injuries before campus security arrived. Safety Score: +20",
        score: 20
      },
      {
        text: "Initiate live optical tracking, verify onset frame, and dispatch nearest quad warden",
        outcome: "Optimal Tactical Protocol! The warden arrived within 45 seconds and successfully mediated the dispute before physical contact occurred. Safety Score: +100",
        score: 100
      },
      {
        text: "Sound building-wide air horns and sirens immediately",
        outcome: "Sub-optimal. The sudden loud alarm caused panic among 400 quiet study hall occupants. Safety Score: +40",
        score: 40
      }
    ]
  },
  {
    id: 2,
    title: "Crisis Mission Beta: Night Shift Hospital ER Entrance",
    briefing: "Camera #12 detects an aggressive visitor shoving security barriers and attempting to force entry past triage staff. The VIGIL confidence spikes to 91%.",
    choices: [
      {
        text: "Acknowledge alert, lock automated glass doors, and dispatch emergency response team",
        outcome: "Outstanding Protocol! Access was secured in 3 seconds, protecting medical staff while response personnel contained the subject. Safety Score: +100",
        score: 100
      },
      {
        text: "Manually lower camera resolution to reduce server load",
        outcome: "Critical Failure! Evidence quality was degraded and response time was lost. Safety Score: +0",
        score: 0
      },
      {
        text: "Broadcast loud audio chime to ask visitor politely to cease",
        outcome: "Moderate. The chime briefly startled the visitor but failed to prevent breach attempt. Safety Score: +45",
        score: 45
      }
    ]
  }
];

// Mode 4: Fast Reaction Threat Drills
const REACTION_DRILLS = [
  { id: 1, scenario: "Rapid punches thrown in alleyway", isThreat: true },
  { id: 2, scenario: "Jogger sprinting past street lamp", isThreat: false },
  { id: 3, scenario: "Baseball batter swinging for home run", isThreat: false },
  { id: 4, scenario: "Two patrons wrestling on floor with headlocks", isThreat: true },
  { id: 5, scenario: "High-fiving crowd at music festival", isThreat: false },
  { id: 6, scenario: "Concealed weapon brandished with forward lunge", isThreat: true },
];

export default function SafetyGamePage() {
  const [activeMode, setActiveMode] = useState('situational'); // 'situational', 'challenge', 'mission', 'reaction'

  // Mode 1 State
  const [sitIndex, setSitIndex] = useState(0);
  const [sitSelected, setSitSelected] = useState(null);
  const [sitScore, setSitScore] = useState(0);

  // Mode 2 State
  const [chalIndex, setChalIndex] = useState(0);
  const [chalChoice, setChalChoice] = useState(null);
  const [chalScore, setChalScore] = useState(0);

  // Mode 3 State
  const [missIndex, setMissIndex] = useState(0);
  const [missChoice, setMissChoice] = useState(null);
  const [missionScore, setMissionScore] = useState(0);

  // Mode 4 State
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillChoice, setDrillChoice] = useState(null);
  const [drillScore, setDrillScore] = useState(0);
  const [drillStreak, setDrillStreak] = useState(0);

  const resetMode = () => {
    setSitIndex(0);
    setSitSelected(null);
    setChalIndex(0);
    setChalChoice(null);
    setMissIndex(0);
    setMissChoice(null);
    setDrillIndex(0);
    setDrillChoice(null);
  };

  return (
    <div className="w-full space-y-8 pb-12 font-mono text-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-indigo-400" />
              <span>VIGIL: THREAT AWARENESS</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              EDUCATIONAL SIMULATOR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive cognitive training platform for security operators and computer vision researchers.
          </p>
        </div>

        {/* Bonus 2D Arcade Launcher Button */}
        <a
          href="/standalone-game/index.html"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>LAUNCH 2D PHASER ARCADE</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'situational', label: '1. Situational Awareness', icon: Eye, color: 'text-cyan-400' },
          { id: 'challenge', label: '2. AI Detection Challenge', icon: Brain, color: 'text-indigo-400' },
          { id: 'mission', label: '3. Safety Mission', icon: Shield, color: 'text-amber-400' },
          { id: 'reaction', label: '4. Fast Reaction Drills', icon: Zap, color: 'text-rose-400' },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveMode(m.id);
                resetMode();
              }}
              className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition text-left cursor-pointer ${
                isActive
                  ? 'bg-[#0f1424] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-white'
                  : 'bg-[#070a12] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${m.color} shrink-0`} />
              <div>
                <div className="font-bold text-xs">{m.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODE 1: SITUATIONAL AWARENESS                             */}
      {/* ========================================================= */}
      {activeMode === 'situational' && (
        <div className="rounded-3xl bg-[#090d18] border border-cyan-500/30 p-6 md:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-xs">
              QUESTION {sitIndex + 1} OF {SITUATIONAL_QUESTIONS.length}
            </span>
            <span className="text-slate-400">SCORE: <strong className="text-white">{sitScore} PTS</strong></span>
          </div>

          {sitIndex < SITUATIONAL_QUESTIONS.length ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  {SITUATIONAL_QUESTIONS[sitIndex].title}
                </h3>
                <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 text-slate-300 leading-relaxed text-xs">
                  {SITUATIONAL_QUESTIONS[sitIndex].context}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-bold text-cyan-300">
                  {SITUATIONAL_QUESTIONS[sitIndex].question}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {SITUATIONAL_QUESTIONS[sitIndex].options.map((opt, idx) => {
                    const isPicked = sitSelected === idx;
                    let btnStyle = "bg-[#0c101c] border-slate-800 text-slate-300 hover:border-cyan-500/40";
                    if (sitSelected !== null) {
                      if (opt.isCorrect) btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200";
                      else if (isPicked) btnStyle = "bg-red-950/80 border-red-500 text-red-200";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={sitSelected !== null}
                        onClick={() => {
                          setSitSelected(idx);
                          if (opt.isCorrect) setSitScore(s => s + 50);
                        }}
                        className={`p-4 rounded-xl border text-left transition flex flex-col gap-1.5 ${btnStyle} cursor-pointer`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{opt.text}</span>
                          {sitSelected !== null && opt.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {sitSelected !== null && isPicked && !opt.isCorrect && (
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                        </div>
                        {sitSelected !== null && (
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                            {opt.explanation}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {sitSelected !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setSitIndex(i => i + 1);
                      setSitSelected(null);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
                  >
                    <span>NEXT SCENARIO</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Award className="w-16 h-16 text-cyan-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Situational Awareness Drill Complete!</h3>
              <p className="text-slate-400">
                You scored <strong className="text-cyan-300">{sitScore}</strong> out of {SITUATIONAL_QUESTIONS.length * 50} points.
              </p>
              <button
                onClick={resetMode}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              >
                REPLAY DRILL
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: AI DETECTION CHALLENGE                            */}
      {/* ========================================================= */}
      {activeMode === 'challenge' && (
        <div className="rounded-3xl bg-[#090d18] border border-indigo-500/30 p-6 md:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              CHALLENGE {chalIndex + 1} OF {AI_CHALLENGE_SCENARIOS.length}
            </span>
            <span className="text-slate-400">ACCURACY: <strong className="text-white">{chalScore} / {chalIndex}</strong></span>
          </div>

          {chalIndex < AI_CHALLENGE_SCENARIOS.length ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">
                  SURVEILLANCE EVENT CLUSTER
                </div>
                <h3 className="text-lg font-bold text-white">
                  {AI_CHALLENGE_SCENARIOS[chalIndex].label}
                </h3>
                <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 text-slate-300 leading-relaxed text-xs">
                  {AI_CHALLENGE_SCENARIOS[chalIndex].description}
                </div>
              </div>

              {/* User Choice Buttons */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  YOUR VERDICT: IS THIS GENUINE VIOLENCE OR HARD-NEGATIVE BENIGN FAST MOTION?
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled={chalChoice !== null}
                    onClick={() => {
                      setChalChoice(true);
                      if (AI_CHALLENGE_SCENARIOS[chalIndex].isViolence === true) setChalScore(s => s + 1);
                    }}
                    className={`p-4 rounded-xl border font-bold text-center transition cursor-pointer ${
                      chalChoice !== null
                        ? AI_CHALLENGE_SCENARIOS[chalIndex].isViolence === true
                          ? 'bg-red-950 border-red-500 text-red-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500 opacity-50'
                        : 'bg-red-950/40 hover:bg-red-900/60 border-red-500/40 text-red-300'
                    }`}
                  >
                    CONFIRMED VIOLENCE
                  </button>

                  <button
                    disabled={chalChoice !== null}
                    onClick={() => {
                      setChalChoice(false);
                      if (AI_CHALLENGE_SCENARIOS[chalIndex].isViolence === false) setChalScore(s => s + 1);
                    }}
                    className={`p-4 rounded-xl border font-bold text-center transition cursor-pointer ${
                      chalChoice !== null
                        ? AI_CHALLENGE_SCENARIOS[chalIndex].isViolence === false
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500 opacity-50'
                        : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    BENIGN FAST MOTION (NO VIOLENCE)
                  </button>
                </div>
              </div>

              {/* AI Comparison Feedback */}
              {chalChoice !== null && (
                <div className="p-4 rounded-2xl bg-[#0c1222] border border-indigo-500/40 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-400" />
                      VIGIL NEURAL NETWORK PREDICTION:
                    </span>
                    <span className="text-indigo-300 font-bold">
                      {AI_CHALLENGE_SCENARIOS[chalIndex].aiPrediction}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Model Rationale:</strong> {AI_CHALLENGE_SCENARIOS[chalIndex].aiReasoning}
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setChalIndex(i => i + 1);
                        setChalChoice(null);
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
                    >
                      <span>NEXT CHALLENGE</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Award className="w-16 h-16 text-indigo-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">AI Detection Challenge Complete!</h3>
              <p className="text-slate-400">
                You correctly categorized <strong className="text-indigo-300">{chalScore}</strong> of {AI_CHALLENGE_SCENARIOS.length} scenarios.
              </p>
              <button
                onClick={resetMode}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: SAFETY MISSION                                    */}
      {/* ========================================================= */}
      {activeMode === 'mission' && (
        <div className="rounded-3xl bg-[#090d18] border border-amber-500/30 p-6 md:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              MISSION {missIndex + 1} OF {SAFETY_MISSIONS.length}
            </span>
            <span className="text-slate-400">SAFETY RATING: <strong className="text-white">{missionScore} PTS</strong></span>
          </div>

          {missIndex < SAFETY_MISSIONS.length ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  {SAFETY_MISSIONS[missIndex].title}
                </h3>
                <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 text-slate-300 leading-relaxed text-xs">
                  {SAFETY_MISSIONS[missIndex].briefing}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-amber-300">
                  SELECT YOUR OPERATIONAL TACTICAL RESPONSE:
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {SAFETY_MISSIONS[missIndex].choices.map((c, idx) => {
                    const isSelected = missChoice === idx;
                    return (
                      <button
                        key={idx}
                        disabled={missChoice !== null}
                        onClick={() => {
                          setMissChoice(idx);
                          setMissionScore(s => s + c.score);
                        }}
                        className={`p-4 rounded-xl border text-left transition flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                            : 'bg-[#0c101c] border-slate-800 text-slate-300 hover:border-amber-500/40'
                        } cursor-pointer`}
                      >
                        <span className="font-bold text-xs">{c.text}</span>
                        {isSelected && (
                          <div className="text-[11px] text-slate-300 pt-2 border-t border-white/10">
                            {c.outcome}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {missChoice !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setMissIndex(i => i + 1);
                      setMissChoice(null);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
                  >
                    <span>NEXT MISSION</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Award className="w-16 h-16 text-amber-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">All Safety Missions Completed!</h3>
              <p className="text-slate-400">
                Total Safety Rating Achieved: <strong className="text-amber-300">{missionScore} PTS</strong>
              </p>
              <button
                onClick={resetMode}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                RESTART CAMPAIGN
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 4: FAST REACTION DRILLS                              */}
      {/* ========================================================= */}
      {activeMode === 'reaction' && (
        <div className="rounded-3xl bg-[#090d18] border border-rose-500/30 p-6 md:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-rose-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              FAST REACTION DRILL {drillIndex + 1} OF {REACTION_DRILLS.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">STREAK: <strong className="text-rose-400">{drillStreak} 🔥</strong></span>
              <span className="text-slate-400">SCORE: <strong className="text-white">{drillScore} PTS</strong></span>
            </div>
          </div>

          {drillIndex < REACTION_DRILLS.length ? (
            <div className="space-y-6 text-center max-w-lg mx-auto py-4">
              <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">FLASH SITUATION CARD</span>
                <div className="text-base font-black text-white">
                  "{REACTION_DRILLS[drillIndex].scenario}"
                </div>
              </div>

              {/* Reaction Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  disabled={drillChoice !== null}
                  onClick={() => {
                    const isThreat = true;
                    const correct = isThreat === REACTION_DRILLS[drillIndex].isThreat;
                    setDrillChoice(correct ? 'CORRECT' : 'WRONG');
                    if (correct) {
                      setDrillScore(s => s + 25);
                      setDrillStreak(st => st + 1);
                    } else {
                      setDrillStreak(0);
                    }
                  }}
                  className="py-4 px-6 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 font-black text-sm tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  ⚠️ THREAT DETECTED
                </button>

                <button
                  disabled={drillChoice !== null}
                  onClick={() => {
                    const isThreat = false;
                    const correct = isThreat === REACTION_DRILLS[drillIndex].isThreat;
                    setDrillChoice(correct ? 'CORRECT' : 'WRONG');
                    if (correct) {
                      setDrillScore(s => s + 25);
                      setDrillStreak(st => st + 1);
                    } else {
                      setDrillStreak(0);
                    }
                  }}
                  className="py-4 px-6 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-200 font-black text-sm tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  ✅ SAFE / BENIGN
                </button>
              </div>

              {drillChoice !== null && (
                <div className={`p-3 rounded-xl font-bold ${
                  drillChoice === 'CORRECT' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                }`}>
                  {drillChoice === 'CORRECT' ? 'EXCELLENT REACTION! +25 PTS' : 'INCORRECT EVALUATION! STREAK RESET.'}
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setDrillIndex(i => i + 1);
                        setDrillChoice(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                    >
                      NEXT DRILL &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Award className="w-16 h-16 text-rose-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Reaction Drills Finished!</h3>
              <p className="text-slate-400">
                Final Score: <strong className="text-rose-300">{drillScore} PTS</strong> &bull; Best Streak: {drillStreak}
              </p>
              <button
                onClick={resetMode}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
