import { useState, useEffect } from "react";

const CLAUDE_API = "https://api.anthropic.com/v1/messages";

const MAKES = ["Acura","Audi","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge","Ferrari","Fiat","Ford","Genesis","GMC","Honda","Hyundai","Infiniti","Jaguar","Jeep","Kia","Land Rover","Lexus","Lincoln","Mazda","Mercedes-Benz","MINI","Mitsubishi","Nissan","Porsche","Ram","Subaru","Tesla","Toyota","Volkswagen","Volvo"];

const YEARS = Array.from({length: 30}, (_, i) => 2025 - i);

function Spinner() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"10px",color:"#f97316"}}>
      <div style={{
        width:"22px",height:"22px",border:"3px solid #1e293b",
        borderTop:"3px solid #f97316",borderRadius:"50%",
        animation:"spin 0.8s linear infinite"
      }}/>
      <span style={{fontSize:"13px",letterSpacing:"0.05em",fontFamily:"'IBM Plex Mono',monospace"}}>QUERYING DATABASE...</span>
    </div>
  );
}

function TireDiagram({ highlighted }) {
  const tires = [
    { id:"FL", label:"FL", x:80, y:80 },
    { id:"FR", label:"FR", x:220, y:80 },
    { id:"RL", label:"RL", x:80, y:220 },
    { id:"RR", label:"RR", x:220, y:220 },
  ];
  return (
    <svg viewBox="0 0 300 300" width="180" height="180" style={{display:"block",margin:"0 auto"}}>
      {/* Car body */}
      <rect x="100" y="110" width="100" height="80" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
      <rect x="115" y="95" width="70" height="35" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5"/>
      {/* Axles */}
      <line x1="80" y1="100" x2="220" y2="100" stroke="#334155" strokeWidth="2"/>
      <line x1="80" y1="200" x2="220" y2="200" stroke="#334155" strokeWidth="2"/>
      {tires.map(t => {
        const isActive = highlighted && highlighted.includes(t.id);
        return (
          <g key={t.id}>
            <rect
              x={t.x - 20} y={t.y - 28} width="40" height="56" rx="8"
              fill={isActive ? "#f97316" : "#0f172a"}
              stroke={isActive ? "#f97316" : "#475569"}
              strokeWidth={isActive ? 2.5 : 1.5}
              style={{filter: isActive ? "drop-shadow(0 0 6px #f97316)" : "none", transition:"all 0.3s"}}
            />
            <text x={t.x} y={t.y + 5} textAnchor="middle" fill={isActive ? "#fff" : "#64748b"}
              fontFamily="'IBM Plex Mono',monospace" fontSize="12" fontWeight="700">
              {t.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ResultCard({ result }) {
  const lines = result.split("\n").filter(l => l.trim());
  const sections = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith("##")) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^##\s*/, ""), items: [] };
    } else if (current) {
      current.items.push(line.replace(/^[-*]\s*/, "").replace(/\*\*/g, ""));
    } else {
      sections.push({ heading: null, items: [line.replace(/\*\*/g, "")] });
    }
  }
  if (current) sections.push(current);

  const tpmsType = result.match(/\b(direct|indirect)\s+tpms/i)?.[1]?.toUpperCase();
  const highlightTires = result.toLowerCase().includes("relearn") ? ["FL","FR","RL","RR"] : null;

  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 200px", gap:"24px", alignItems:"start"}}>
      <div>
        {tpmsType && (
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background: tpmsType === "DIRECT" ? "rgba(249,115,22,0.12)" : "rgba(99,102,241,0.12)",
            border: `1px solid ${tpmsType === "DIRECT" ? "#f97316" : "#6366f1"}`,
            borderRadius:"6px", padding:"6px 14px", marginBottom:"20px"
          }}>
            <div style={{
              width:"8px", height:"8px", borderRadius:"50%",
              background: tpmsType === "DIRECT" ? "#f97316" : "#6366f1",
              boxShadow: `0 0 8px ${tpmsType === "DIRECT" ? "#f97316" : "#6366f1"}`
            }}/>
            <span style={{fontFamily:"'IBM Plex Mono',monospace", fontSize:"13px", fontWeight:"700",
              color: tpmsType === "DIRECT" ? "#f97316" : "#6366f1", letterSpacing:"0.1em"}}>
              {tpmsType} TPMS
            </span>
          </div>
        )}

        {sections.map((s, i) => (
          <div key={i} style={{marginBottom:"18px"}}>
            {s.heading && (
              <div style={{
                fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", fontWeight:"700",
                color:"#f97316", letterSpacing:"0.15em", textTransform:"uppercase",
                marginBottom:"10px", paddingBottom:"6px",
                borderBottom:"1px solid rgba(249,115,22,0.2)"
              }}>{s.heading}</div>
            )}
            {s.items.map((item, j) => (
              <div key={j} style={{
                display:"flex", alignItems:"flex-start", gap:"10px",
                color:"#cbd5e1", fontFamily:"'IBM Plex Sans',sans-serif",
                fontSize:"14px", lineHeight:"1.7", marginBottom:"6px"
              }}>
                <span style={{color:"#f97316", marginTop:"3px", fontSize:"10px", flexShrink:0}}>▶</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{
        background:"#0f172a", border:"1px solid #1e293b", borderRadius:"12px",
        padding:"16px", textAlign:"center"
      }}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#475569",
          letterSpacing:"0.15em", marginBottom:"12px"}}>SENSOR POSITIONS</div>
        <TireDiagram highlighted={highlightTires} />
        <div style={{marginTop:"10px", fontSize:"11px", color:"#475569", fontFamily:"'IBM Plex Mono',monospace"}}>
          {highlightTires ? "ALL SENSORS ACTIVE" : "STANDARD LAYOUT"}
        </div>
      </div>
    </div>
  );
}

export default function TPMSLookup() {
  const [mode, setMode] = useState("vin"); // vin | ymm
  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [vinValid, setVinValid] = useState(null);

  useEffect(() => {
    if (vin.length === 17) setVinValid(true);
    else if (vin.length > 0) setVinValid(false);
    else setVinValid(null);
  }, [vin]);

  async function lookup() {
    setLoading(true);
    setResult(null);
    setError(null);

    const vehicleDesc = mode === "vin"
      ? `VIN: ${vin.toUpperCase()}`
      : `${year} ${make} ${model}`;

    const prompt = `You are a professional automotive TPMS (Tire Pressure Monitoring System) technician database.

For the vehicle: ${vehicleDesc}

Provide a detailed technical TPMS report using this EXACT format with ## section headers:

## Vehicle Identification
- Decode the VIN or confirm the year/make/model, state the trim/engine if determinable

## TPMS System Type
- State clearly: DIRECT TPMS or INDIRECT TPMS (and why)
- Direct: uses physical sensors in each wheel with unique IDs
- Indirect: uses ABS wheel speed sensors, no physical TPMS sensors

## Sensor Specifications (if Direct)
- OEM sensor part number(s)
- Sensor frequency (typically 315MHz or 433MHz)
- Sensor battery life expectancy
- Aftermarket compatible sensor options (e.g., Autel, Schrader, VDO)

## TPMS Relearn / Reset Procedure
- Step-by-step learn mode procedure specific to this vehicle
- Required tools (TPMS tool, OBD scanner, or stationary/drive relearn)
- Approximate time required
- Any special conditions (specific tire pressure required first, key cycles, etc.)

## Warning Light Reset
- How to clear the TPMS warning light after sensor service
- Any OBD-II codes associated with TPMS on this vehicle (C-codes)

## Technician Notes
- Common TPMS issues or TSBs for this vehicle
- Tips for successful relearn

Be precise and technical. If you cannot determine exact specs from a VIN alone, provide the most accurate information for the likely vehicle configuration.`;

    try {
      const res = await fetch(CLAUDE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("\n") || "";
      if (!text) throw new Error("Empty response from API");
      setResult(text);
    } catch (e) {
      setError(`Lookup failed: ${e.message || "Please try again."}`);
    }
    setLoading(false);
  }

  const canSubmit = mode === "vin"
    ? vin.length === 17
    : year && make && model.trim().length > 1;

  return (
    <div style={{
      minHeight:"100vh",
      background:"#020817",
      fontFamily:"'IBM Plex Sans',sans-serif",
      padding:"32px 16px",
      position:"relative",
      overflow:"hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(16px); } to { opacity:1;transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing:border-box; }
        input, select { outline:none; }
        input:focus, select:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15) !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0f172a; }
        ::-webkit-scrollbar-thumb { background:#334155; border-radius:2px; }
        .tab-btn { cursor:pointer; transition:all 0.2s; }
        .tab-btn:hover { background: rgba(249,115,22,0.08) !important; }
        .lookup-btn { cursor:pointer; transition:all 0.2s; }
        .lookup-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(249,115,22,0.4) !important; }
        .lookup-btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>

      {/* Grid background */}
      <div style={{
        position:"fixed",inset:0,
        backgroundImage:"linear-gradient(rgba(249,115,22,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.03) 1px,transparent 1px)",
        backgroundSize:"40px 40px",
        pointerEvents:"none"
      }}/>

      <div style={{maxWidth:"820px",margin:"0 auto",position:"relative"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"40px",animation:"fadeUp 0.6s ease"}}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:"10px",
            background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",
            borderRadius:"8px",padding:"6px 16px",marginBottom:"20px"
          }}>
            <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#f97316",
              animation:"pulse 2s infinite"}}/>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",
              color:"#f97316",letterSpacing:"0.2em",fontWeight:"600"}}>TPMS DIAGNOSTIC SYSTEM</span>
          </div>
          <h1 style={{
            fontFamily:"'IBM Plex Mono',monospace",fontSize:"clamp(28px,5vw,46px)",
            fontWeight:"700",color:"#f1f5f9",margin:"0 0 10px",letterSpacing:"-0.02em",lineHeight:1.1
          }}>
            TIRE PRESSURE<br/>
            <span style={{color:"#f97316"}}>MONITOR LOOKUP</span>
          </h1>
          <p style={{color:"#475569",fontSize:"14px",fontFamily:"'IBM Plex Sans',sans-serif",
            fontWeight:"300",letterSpacing:"0.03em",margin:0}}>
            Direct · Indirect · Sensor Specs · Relearn Procedures
          </p>
        </div>

        {/* Main card */}
        <div style={{
          background:"#0b1120",border:"1px solid #1e293b",borderRadius:"16px",
          overflow:"hidden",animation:"fadeUp 0.6s ease 0.1s both"
        }}>
          {/* Tab switcher */}
          <div style={{
            display:"flex",borderBottom:"1px solid #1e293b",
            background:"#060d1a"
          }}>
            {[["vin","🔎 VIN DECODE"],["ymm","📋 YEAR / MAKE / MODEL"]].map(([id,label]) => (
              <button key={id} className="tab-btn" onClick={() => { setMode(id); setResult(null); setError(null); }}
                style={{
                  flex:1,padding:"16px",border:"none",cursor:"pointer",
                  fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px",fontWeight:"700",
                  letterSpacing:"0.1em",transition:"all 0.2s",
                  background: mode === id ? "#0b1120" : "transparent",
                  color: mode === id ? "#f97316" : "#475569",
                  borderBottom: mode === id ? "2px solid #f97316" : "2px solid transparent",
                }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{padding:"28px"}}>
            {mode === "vin" ? (
              <div>
                <label style={{display:"block",fontFamily:"'IBM Plex Mono',monospace",
                  fontSize:"11px",color:"#64748b",letterSpacing:"0.15em",marginBottom:"10px"}}>
                  VEHICLE IDENTIFICATION NUMBER
                </label>
                <div style={{position:"relative"}}>
                  <input
                    value={vin} onChange={e => setVin(e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,""))}
                    maxLength={17}
                    placeholder="1HGCM82633A123456"
                    style={{
                      width:"100%",padding:"14px 50px 14px 16px",
                      background:"#060d1a",border:`1px solid ${vinValid === false ? "#ef4444" : vinValid ? "#22c55e" : "#1e293b"}`,
                      borderRadius:"10px",color:"#f1f5f9",
                      fontFamily:"'IBM Plex Mono',monospace",fontSize:"18px",
                      letterSpacing:"0.12em",transition:"all 0.2s"
                    }}
                  />
                  <div style={{
                    position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",
                    fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",
                    color: vin.length === 17 ? "#22c55e" : "#334155"
                  }}>
                    {vin.length}/17
                  </div>
                </div>
                {vinValid === false && (
                  <div style={{marginTop:"8px",color:"#ef4444",fontSize:"12px",
                    fontFamily:"'IBM Plex Mono',monospace"}}>
                    ⚠ VIN must be exactly 17 characters
                  </div>
                )}
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"140px 1fr 1fr",gap:"14px"}}>
                {[
                  ["YEAR", <select key="y" value={year} onChange={e=>setYear(e.target.value)} style={selStyle}>
                    <option value="">Year</option>
                    {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                  </select>],
                  ["MAKE", <select key="m" value={make} onChange={e=>setMake(e.target.value)} style={selStyle}>
                    <option value="">Select Make</option>
                    {MAKES.map(m=><option key={m} value={m}>{m}</option>)}
                  </select>],
                  ["MODEL", <input key="mo" value={model} onChange={e=>setModel(e.target.value)}
                    placeholder="Camry, F-150, etc." style={{...inputStyle}}/>],
                ].map(([lbl, el]) => (
                  <div key={lbl}>
                    <label style={{display:"block",fontFamily:"'IBM Plex Mono',monospace",
                      fontSize:"11px",color:"#64748b",letterSpacing:"0.15em",marginBottom:"8px"}}>
                      {lbl}
                    </label>
                    {el}
                  </div>
                ))}
              </div>
            )}

            <button
              className="lookup-btn"
              disabled={!canSubmit || loading}
              onClick={lookup}
              style={{
                width:"100%",marginTop:"20px",padding:"16px",
                background: canSubmit && !loading ? "linear-gradient(135deg,#f97316,#ea580c)" : "#1e293b",
                border:"none",borderRadius:"10px",
                color: canSubmit && !loading ? "#fff" : "#475569",
                fontFamily:"'IBM Plex Mono',monospace",fontSize:"13px",fontWeight:"700",
                letterSpacing:"0.15em",cursor: canSubmit && !loading ? "pointer" : "not-allowed",
                boxShadow: canSubmit && !loading ? "0 4px 16px rgba(249,115,22,0.3)" : "none",
                transition:"all 0.25s"
              }}>
              {loading ? "ANALYZING..." : "▶  RUN TPMS LOOKUP"}
            </button>
          </div>

          {/* Results */}
          {(loading || result || error) && (
            <div style={{
              borderTop:"1px solid #1e293b",padding:"28px",
              animation:"fadeUp 0.4s ease"
            }}>
              {loading && <Spinner/>}
              {error && (
                <div style={{color:"#ef4444",fontFamily:"'IBM Plex Mono',monospace",fontSize:"13px",
                  display:"flex",alignItems:"center",gap:"10px"}}>
                  <span>⚠</span>{error}
                </div>
              )}
              {result && <ResultCard result={result}/>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop:"28px",textAlign:"center",
          fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",
          color:"#1e293b",letterSpacing:"0.1em"
        }}>
          TPMS DIAGNOSTIC SYSTEM · POWERED BY CLAUDE AI · FOR PROFESSIONAL USE
        </div>
      </div>
    </div>
  );
}

const baseFieldStyle = {
  width:"100%",padding:"12px 14px",
  background:"#060d1a",border:"1px solid #1e293b",
  borderRadius:"8px",color:"#f1f5f9",
  fontFamily:"'IBM Plex Sans',sans-serif",fontSize:"14px",
  transition:"all 0.2s"
};
const inputStyle = { ...baseFieldStyle };
const selStyle = { ...baseFieldStyle, cursor:"pointer", appearance:"none",
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:"32px"
};
