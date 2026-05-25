/* global React, ReactDOM, NocIcon */
/* global NocReveal, NocCount, Sparkline, LiveClock, Kpi, SiteMap, AlertItem, AreaChart, SiteRow */
/* global TweaksPanel, TweakSection, TweakRadio, useTweaks */
const { useState, useEffect } = React;

const NOC_TWEAKS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "cyan"
}/*EDITMODE-END*/;

// ---------- Brand mark ----------
function NocBrandMark() {
  return (
    <div className="brand-mark" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 18 12 4l8 14" stroke="#FFCB05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 18h8" stroke="#FFCB05" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="11" r="1.5" fill="#22d3ee"/>
      </svg>
    </div>
  );
}

// ---------- Sidebar ----------
function NocSidebar({ active, setActive }) {
  const main = [
    { id: "dashboard", label: "Supervision", icon: <NocIcon.Dashboard className="nav-icon"/> },
    { id: "sites", label: "Sites", icon: <NocIcon.Tower className="nav-icon"/>, badge: "1 247" },
    { id: "map", label: "Carte réseau", icon: <NocIcon.Map className="nav-icon"/> },
    { id: "alerts", label: "Alertes", icon: <NocIcon.Alert className="nav-icon"/>, badge: "12" },
    { id: "maint", label: "Maintenance", icon: <NocIcon.Wrench className="nav-icon"/> },
    { id: "energy", label: "Énergie", icon: <NocIcon.Bolt className="nav-icon"/> },
    { id: "reports", label: "Rapports", icon: <NocIcon.Report className="nav-icon"/> },
    { id: "teams", label: "Équipes terrain", icon: <NocIcon.Team className="nav-icon"/> },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <NocBrandMark/>
        <div>
          <div className="brand-name">Aether <span className="dot"/></div>
          <div className="brand-sub">Sentinel · NOC v3.1</div>
        </div>
      </div>

      <div className="nav-group">
        <div className="nav-label">Supervision</div>
        {main.map(i => (
          <button key={i.id} className={`nav-item ${active === i.id ? "active" : ""}`} onClick={() => setActive(i.id)}>
            {i.icon}<span>{i.label}</span>
            {i.badge && <span className="nav-badge">{i.badge}</span>}
          </button>
        ))}
      </div>

      <div className="nav-group">
        <div className="nav-label">Système</div>
        <button className="nav-item"><NocIcon.Settings className="nav-icon"/><span>Paramètres</span></button>
      </div>

      <div className="sidebar-foot shift-card">
        <div className="row">
          <div className="avatar">KA</div>
          <div>
            <div className="shift-name">Kouamé A.</div>
            <div className="shift-role">NOC Lead · Shift A</div>
          </div>
        </div>
        <div className="shift-status">
          <span className="live-dot"/>
          On Duty · 04:32:18
        </div>
      </div>
    </aside>
  );
}

// ---------- Topbar ----------
function NocTopbar({ theme, onToggle }) {
  return (
    <header className="topbar">
      <div className="crumb">
        <span>Supervision</span>
        <span className="sep">/</span>
        <strong>Vue d'ensemble</strong>
      </div>
      <span className="live-pill"><span className="live-dot"/>Live · Auto-refresh 30s</span>

      <div style={{ flex: 1 }}/>

      <div className="search">
        <NocIcon.Search/>
        <input placeholder="Site ID, ville, technicien…"/>
        <span className="kbd">⌘K</span>
      </div>

      <LiveClock/>
      <button className="icon-btn" onClick={onToggle} aria-label="Thème">
        {theme === "dark" ? <NocIcon.Sun/> : <NocIcon.Moon/>}
      </button>
      <button className="icon-btn" aria-label="Refresh"><NocIcon.Refresh/></button>
      <button className="icon-btn" aria-label="Alertes">
        <NocIcon.Bell/><span className="badge-dot"/>
      </button>
    </header>
  );
}

// ---------- Synthetic data ----------
const sparkUp = [2,3,3,4,5,5,7,8,7,9,10,11];
const sparkDown = [9,8,8,7,8,7,6,6,5,5,4,3];
const sparkFlat = [5,6,5,6,6,5,6,7,6,6,7,6];
const sparkAlert = [1,2,2,3,5,7,9,8,10,11,10,12];
const availability = [99.92,99.94,99.91,99.88,99.85,99.89,99.92,99.94,99.95,99.93,99.91,99.93,99.95,99.97,99.96,99.94,99.92,99.91,99.93,99.95,99.97,99.96,99.94,99.96,99.94];
const energy = [44,48,52,58,62,68,71,72,69,64,58,52,48,44,42,40,42,46,52,60,68,72,70,66,60];

const ALERTS = [
  { severity: "critical", title: "Coupure secteur ENERGIE — bascule batterie", site: "BTS-BK012", region: "Bouaké Centre", type: "Énergie · CRIT", time: "il y a 2 min", icon: <NocIcon.Bolt/> },
  { severity: "critical", title: "Surchauffe shelter > 42°C", site: "BTS-AB022", region: "Yopougon · Abidjan", type: "Thermique · CRIT", time: "il y a 6 min", icon: <NocIcon.Thermo/> },
  { severity: "warn", title: "Batterie autonomie < 4h00", site: "BTS-KR017", region: "Korhogo Nord", type: "Énergie · WARN", time: "il y a 14 min", icon: <NocIcon.Battery/> },
  { severity: "warn", title: "Porte shelter ouverte > 15 min", site: "BTS-AB022", region: "Yopougon · Abidjan", type: "Intrusion · WARN", time: "il y a 22 min", icon: <NocIcon.Door/> },
  { severity: "info", title: "Maintenance préventive démarrée", site: "BTS-AB044", region: "Marcory · Abidjan", type: "Programmé · INFO", time: "il y a 38 min", icon: <NocIcon.Wrench/> },
  { severity: "ok", title: "Climatisation rétablie (24°C)", site: "BTS-AB088", region: "Abobo · Abidjan", type: "Thermique · OK", time: "il y a 1h 12", icon: <NocIcon.Thermo/> },
  { severity: "warn", title: "Signal RSSI dégradé sur 2 cellules", site: "BTS-BK008", region: "Bouaké Nord", type: "RF · WARN", time: "il y a 1h 48", icon: <NocIcon.Signal/> },
  { severity: "info", title: "Génératrice testée — auto OK 12 min", site: "BTS-SP004", region: "San-Pédro", type: "Énergie · INFO", time: "il y a 2h 20", icon: <NocIcon.Bolt/> },
];

const SITES_TABLE = [
  { id: "BTS-AB022", location: "Yopougon, Abidjan",     status: "critical", uptime: 96.4, power: 4.8, temp: 42, lastCheck: "11 juin · 06:18", spark: [3,4,5,4,6,8,9,8,11,10,12], sparkColor: "var(--red)" },
  { id: "BTS-BK012", location: "Bouaké Centre",         status: "critical", uptime: 95.1, power: 0.0, temp: 38, lastCheck: "11 juin · 06:09", spark: [9,8,7,6,4,2,1,0,1,1,1], sparkColor: "var(--red)" },
  { id: "BTS-KR017", location: "Korhogo Nord",          status: "warn",     uptime: 98.2, power: 3.6, temp: 33, lastCheck: "11 juin · 05:54", spark: [4,5,5,4,6,5,7,6,8,7,9], sparkColor: "var(--amber)" },
  { id: "BTS-BK008", location: "Bouaké Nord",           status: "warn",     uptime: 98.9, power: 4.1, temp: 29, lastCheck: "11 juin · 05:32", spark: [6,6,7,5,7,6,8,7,9,8,10], sparkColor: "var(--amber)" },
  { id: "BTS-AB044", location: "Marcory, Abidjan",      status: "maintenance", uptime: 99.7, power: 4.4, temp: 26, lastCheck: "Maintenance en cours", spark: [7,7,7,7,7,7,7,7,7,7,7], sparkColor: "var(--cyan)" },
  { id: "BTS-AB001", location: "Plateau, Abidjan",      status: "ok",       uptime: 99.98, power: 5.2, temp: 24, lastCheck: "11 juin · 04:12", spark: [8,9,8,9,9,9,9,10,9,10,10], sparkColor: "var(--green)" },
  { id: "BTS-YA002", location: "Yamoussoukro",          status: "ok",       uptime: 99.94, power: 4.9, temp: 27, lastCheck: "11 juin · 03:48", spark: [8,8,9,8,9,9,9,9,10,9,10], sparkColor: "var(--green)" },
  { id: "BTS-MN009", location: "Man",                   status: "ok",       uptime: 99.91, power: 4.6, temp: 25, lastCheck: "11 juin · 03:21", spark: [7,8,8,8,8,9,9,8,9,9,10], sparkColor: "var(--green)" },
];

const SCHEDULE = [
  { time: "08:00", title: "Inspection mensuelle générateur diesel", site: "BTS-AB001 · Plateau", crew: "Équipe Lambda · 2 techs", tone: "" },
  { time: "10:30", title: "Remplacement batteries 48V (banc 2)",     site: "BTS-AB044 · Marcory", crew: "Équipe Alpha · 3 techs", tone: "amber" },
  { time: "13:00", title: "Contrôle climatisation & filtres",       site: "BTS-YA002 · Yamoussoukro", crew: "Équipe Bravo · 2 techs", tone: "green" },
  { time: "15:30", title: "Intervention curative — coupure énergie", site: "BTS-BK012 · Bouaké", crew: "Équipe d'urgence · ETA 45 min", tone: "critical" },
  { time: "17:00", title: "Test génératrice & vérif. carburant",     site: "BTS-SP004 · San-Pédro", crew: "Équipe Gamma · 1 tech", tone: "" },
];

const TEAMS = [
  { name: "Équipe Alpha", task: "BTS-AB044 · Batteries", status: "busy", init: "AL" },
  { name: "Équipe Bravo", task: "Yamoussoukro · Climatisation", status: "ok", init: "BR" },
  { name: "Équipe Gamma", task: "San-Pédro · Génératrice", status: "ok", init: "GA" },
  { name: "Équipe Delta", task: "Disponible · Bouaké", status: "ok", init: "DE" },
  { name: "Équipe Urgence",task: "Déploiement BTS-BK012", status: "busy", init: "EU" },
  { name: "Équipe Echo", task: "Off-shift · 22h reprise", status: "off", init: "EC" },
];

// ---------- App ----------
function NocApp() {
  const [t, setTweak] = useTweaks(NOC_TWEAKS);
  const [active, setActive] = useState("dashboard");
  const [chartTab, setChartTab] = useState("dispo");
  const [selectedSite, setSelectedSite] = useState("BTS-BK012");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme || "dark");
  }, [t.theme]);

  const toggle = () => setTweak("theme", t.theme === "dark" ? "light" : "dark");

  return (
    <div className="shell">
      <NocSidebar active={active} setActive={setActive}/>
      <div>
        <NocTopbar theme={t.theme} onToggle={toggle}/>

        <main className="main">
          {/* Page header */}
          <NocReveal>
            <div className="page-head">
              <div>
                <div className="page-eyebrow">Centre des opérations · Côte d'Ivoire</div>
                <h1 className="page-title">Réseau <span className="accent">stable</span>. <span style={{color:'var(--ink-mute)'}}>1&thinsp;247 sites supervisés en temps réel.</span></h1>
                <p className="page-sub">12 incidents critiques en cours · 47 interventions de maintenance préventive planifiées cette semaine · MTBF en hausse de 4,1%.</p>
              </div>
              <div className="row-h">
                <button className="btn btn-ghost"><NocIcon.Filter/>Filtres</button>
                <button className="btn btn-ghost"><NocIcon.Download/>Exporter</button>
                <button className="btn btn-primary"><NocIcon.Plus/>Créer ticket</button>
              </div>
            </div>
          </NocReveal>

          {/* KPI strip */}
          <NocReveal delay={60}>
            <div className="kpi-row">
              <Kpi
                label="Sites supervisés"
                value={<NocCount to={1247}/>}
                foot="Actifs · 14 régions"
                delta="+12 ce mois"
                deltaTone="up"
                spark={sparkUp}
              />
              <Kpi
                label="Disponibilité réseau"
                value={<NocCount to={99.84} decimals={2}/>}
                unit="%"
                tone="ok"
                foot="SLA cible 99,80%"
                delta="+0,03 pt"
                deltaTone="up"
                spark={sparkFlat}
                sparkColor="var(--green)"
              />
              <Kpi
                label="Alertes critiques"
                value={<NocCount to={12}/>}
                tone="critical"
                foot="dont 3 en escalade"
                delta="+4 vs hier"
                deltaTone="down"
                spark={sparkAlert}
                sparkColor="var(--red)"
              />
              <Kpi
                label="MTTR moyen"
                value={<NocCount to={38}/>}
                unit="min"
                foot="objectif < 45 min"
                delta="-6 min"
                deltaTone="up"
                spark={sparkDown}
                sparkColor="var(--green)"
              />
              <Kpi
                label="Maintenance préventive"
                value={<NocCount to={47}/>}
                unit="planifiées"
                foot="cette semaine · 86% conformité"
                delta="+5"
                deltaTone="up"
                spark={sparkUp}
                sparkColor="var(--cyan)"
              />
            </div>
          </NocReveal>

          {/* Map + Alerts row */}
          <div className="dash-grid">
            <NocReveal className="span-8" delay={80}>
              <div className="card map-card">
                <div className="map-head">
                  <div>
                    <div className="card-eyebrow">01 · Topologie réseau</div>
                    <h3 className="card-title">Carte des sites — Côte d'Ivoire</h3>
                  </div>
                  <div className="card-actions">
                    <button className="chip-btn active">Tous (1247)</button>
                    <button className="chip-btn">BTS</button>
                    <button className="chip-btn">Hub</button>
                    <button className="chip-btn">Datacenter</button>
                  </div>
                </div>
                <SiteMap selectedId={selectedSite} onSelect={setSelectedSite}/>
              </div>
            </NocReveal>

            <NocReveal className="span-4" delay={140}>
              <div className="card alerts-card">
                <div className="card-head">
                  <div>
                    <div className="card-eyebrow">02 · Flux live</div>
                    <h3 className="card-title">Alertes en temps réel</h3>
                  </div>
                  <span className="live-pill"><span className="live-dot"/>Live</span>
                </div>
                <div className="alert-list">
                  {ALERTS.map((a, i) => <AlertItem key={i} {...a}/>)}
                </div>
              </div>
            </NocReveal>
          </div>

          {/* Performance + Energy gauges */}
          <div className="section-head">
            <div>
              <h3 className="section-title"><span className="num">03</span>Performance temps réel</h3>
              <p className="section-sub">Indicateurs réseau sur 24h glissantes · données rafraîchies toutes les 30s.</p>
            </div>
          </div>

          <div className="dash-grid">
            <NocReveal className="span-8" delay={40}>
              <div className="card chart-card">
                <div className="card-head">
                  <div>
                    <div className="card-eyebrow">Métrique principale</div>
                    <h3 className="card-title">
                      {chartTab === "dispo" && <>Disponibilité réseau <span style={{color:'var(--green)'}}>99,84%</span></>}
                      {chartTab === "energy" && <>Consommation énergétique <span style={{color:'var(--cyan)'}}>62 kW</span></>}
                      {chartTab === "temp" && <>Température moyenne shelters <span style={{color:'var(--amber)'}}>28,4°C</span></>}
                    </h3>
                  </div>
                  <div className="metric-tabs">
                    <button className={`metric-tab ${chartTab==='dispo'?'active':''}`} onClick={()=>setChartTab('dispo')}>Disponibilité</button>
                    <button className={`metric-tab ${chartTab==='energy'?'active':''}`} onClick={()=>setChartTab('energy')}>Énergie</button>
                    <button className={`metric-tab ${chartTab==='temp'?'active':''}`} onClick={()=>setChartTab('temp')}>Thermique</button>
                  </div>
                </div>
                {chartTab === "dispo" && <AreaChart key="d" series={[availability]} color="var(--green)" yMax={100} yLabel="%"/>}
                {chartTab === "energy" && <AreaChart key="e" series={[energy]} color="var(--cyan)" yMax={100} yLabel="kW"/>}
                {chartTab === "temp" && <AreaChart key="t" series={[[24,25,25,26,27,28,29,30,31,30,29,28,27,28,29,30,31,32,31,30,29,28,27,26,28]]} color="var(--amber)" yMax={45} yLabel="°C"/>}
              </div>
            </NocReveal>

            <NocReveal className="span-4" delay={100}>
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="card-eyebrow">04 · Énergie passive</div>
                    <h3 className="card-title">Infrastructure énergétique</h3>
                  </div>
                </div>
                <div className="gauges">
                  <div className="gauge">
                    <div className="gauge-key"><span>Batteries</span><span>moy. flotte</span></div>
                    <div className="gauge-val"><NocCount to={87} decimals={0}/>%<small>/ 100</small></div>
                    <div className="gauge-bar"><div style={{ width: "87%", background: "var(--green)" }}/></div>
                    <div className="gauge-foot"><span>1118 sites OK</span><span>· 5h12 autonomie</span></div>
                  </div>
                  <div className="gauge">
                    <div className="gauge-key"><span>Génératrices</span><span>diesel</span></div>
                    <div className="gauge-val"><NocCount to={72} decimals={0}/>%<small>carburant</small></div>
                    <div className="gauge-bar"><div style={{ width: "72%", background: "var(--cyan)" }}/></div>
                    <div className="gauge-foot"><span>892 actives</span><span>· 14 en alerte</span></div>
                  </div>
                  <div className="gauge">
                    <div className="gauge-key"><span>Climatisation</span><span>shelters</span></div>
                    <div className="gauge-val"><NocCount to={93} decimals={0}/>%<small>nominal</small></div>
                    <div className="gauge-bar"><div style={{ width: "93%", background: "var(--green)" }}/></div>
                    <div className="gauge-foot"><span>1166 OK</span><span>· 3 hors-spec</span></div>
                  </div>
                  <div className="gauge">
                    <div className="gauge-key"><span>Solaire</span><span>hybride</span></div>
                    <div className="gauge-val"><NocCount to={48} decimals={0}/>%<small>capacité</small></div>
                    <div className="gauge-bar"><div style={{ width: "48%", background: "var(--yellow)" }}/></div>
                    <div className="gauge-foot"><span>284 sites équipés</span><span>· crépuscule</span></div>
                  </div>
                </div>
              </div>
            </NocReveal>
          </div>

          {/* Maintenance schedule + Teams */}
          <div className="section-head">
            <div>
              <h3 className="section-title"><span className="num">05</span>Maintenance préventive — aujourd'hui</h3>
              <p className="section-sub">Planning du 11 juin · 5 interventions programmées · 1 d'urgence active.</p>
            </div>
            <button className="btn btn-cyan"><NocIcon.Plus/>Planifier</button>
          </div>

          <div className="dash-grid">
            <NocReveal className="span-7" delay={40}>
              <div className="card timeline-card">
                {SCHEDULE.map((e, i) => (
                  <div className="timeline" key={i}>
                    <div className="timeline-time">{e.time}</div>
                    <div className={`timeline-event ${e.tone}`}>
                      <div className="tl-title">{e.title}</div>
                      <div className="tl-meta">
                        <span>{e.site}</span>
                        <span style={{color:"var(--ink-faint)"}}>·</span>
                        <span>{e.crew}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NocReveal>

            <NocReveal className="span-5" delay={100}>
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="card-eyebrow">06 · Force terrain</div>
                    <h3 className="card-title">Équipes déployées</h3>
                  </div>
                  <span className="mono" style={{ color: "var(--ink-mute)", fontSize: 11 }}>
                    <NocCount to={6}/> actives · <NocCount to={14}/> techniciens
                  </span>
                </div>
                <div className="team-strip">
                  {TEAMS.map((tm, i) => (
                    <div key={i} className="team-card">
                      <div className="team-avatar">{tm.init}</div>
                      <div className="team-info">
                        <div className="team-name">{tm.name}</div>
                        <div className="team-task">{tm.task}</div>
                      </div>
                      <span className={`team-status ${tm.status}`}/>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-ghost"><NocIcon.Team/>Voir toutes les équipes</button>
                  <button className="btn btn-cyan"><NocIcon.Arrow/>Affecter une intervention</button>
                </div>
              </div>
            </NocReveal>
          </div>

          {/* Site table */}
          <div className="section-head">
            <div>
              <h3 className="section-title"><span className="num">07</span>Sites prioritaires</h3>
              <p className="section-sub">Triés par criticité — focus sur les anomalies actives et maintenances en cours.</p>
            </div>
            <div className="card-actions">
              <button className="chip-btn active">Critique</button>
              <button className="chip-btn">Warning</button>
              <button className="chip-btn">Maintenance</button>
              <button className="chip-btn">OK</button>
            </div>
          </div>

          <NocReveal>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="site-table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>État</th>
                    <th>Disponibilité</th>
                    <th>Puissance</th>
                    <th>T°</th>
                    <th>Tendance 12h</th>
                    <th>Dernier contrôle</th>
                  </tr>
                </thead>
                <tbody>
                  {SITES_TABLE.map((s) => <SiteRow key={s.id} {...s}/>)}
                </tbody>
              </table>
            </div>
          </NocReveal>

          <footer className="foot">
            <div>AETHER Sentinel · NOC platform · Build 3.1.42 · © 2026</div>
            <div className="row-h" style={{ gap: 18 }}>
              <span>Latence dashboard <strong style={{color:'var(--green)'}}>· 84 ms</strong></span>
              <span>Données rafraîchies il y a 12 s</span>
              <a href="#">Documentation</a>
              <a href="#">Statut plateforme ↗</a>
            </div>
          </footer>
        </main>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Apparence">
          <TweakRadio
            label="Thème"
            value={t.theme}
            options={[
              { value: "dark", label: "Sombre" },
              { value: "light", label: "Clair" },
            ]}
            onChange={(v) => setTweak("theme", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("noc-root")).render(<NocApp/>);
