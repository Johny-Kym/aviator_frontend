import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

// ─── Connect to backend ──────────────────────────────────────────────────────
const socket = io("https://aviatorgame-production.up.railway.app/");

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0e1a; color: #fff; font-family: 'Share Tech Mono', monospace; }

  .av-wrapper {
    display: grid;
    grid-template-rows: auto fit-content 1fr auto auto;
    height: 100vh;
    max-width: 720px;
    margin: 0 auto;
    padding: 10px;
    gap: 4px;
    background: #0a0e1a;
  }

  .av-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
  }

  .av-logo { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 18px; color: #f5c842; letter-spacing: 3px; }
  .av-balance { font-size: 13px; color: #a0aec0; font-family: 'Share Tech Mono', monospace; }
  .av-balance span { color: #68d391; font-weight: 700; font-size: 15px; }

.av-history { 
  display: flex; 
  gap: 5px; 
  flex-wrap: nowrap; 
  overflow: hidden;
  align-items: center;  /* 👈 add this */
   height: 26px;       // 👈 fixed height removes extra space
  margin: 0;          // 👈 remove any margin
  padding: 0;          /* 👈 add this */
}

  .hist-chip { 
  font-family: 'Orbitron', sans-serif; 
  font-size: 10px; 
  font-weight: 700; 
  padding: 3px 8px; 
  border-radius: 6px; 
  white-space: nowrap; 
  flex-shrink: 0;
  display: inline-block;  /* 👈 add */
  height: auto !important; /* 👈 add */
  width: auto !important;  /* 👈 add */
  align-self: center;      /* 👈 add */
}
  .hist-low  { background: rgba(252,69,69,0.18);   color: #fc6b6b; border: 1px solid rgba(252,69,69,0.3); }
  .hist-mid  { background: rgba(245,200,66,0.15);  color: #f5c842; border: 1px solid rgba(245,200,66,0.3); }
  .hist-high { background: rgba(104,211,145,0.15); color: #68d391; border: 1px solid rgba(104,211,145,0.3); }
  .hist-mega { background: rgba(99,179,237,0.15);  color: #63b3ed; border: 1px solid rgba(99,179,237,0.3); }

  .av-canvas-area {
    position: relative;
    background: linear-gradient(180deg, #0d1526 0%, #0a0e1a 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
  }

  .av-canvas-area canvas { display: block; width: 100%; height: 100%; }

  .av-mult-overlay {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    text-align: center; pointer-events: none;
  }

  .av-mult-value {
    font-family: 'Orbitron', sans-serif; font-size: 56px; font-weight: 900;
    line-height: 1; text-shadow: 0 0 30px currentColor; transition: color 0.1s;
  }

  .av-mult-label { font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.4); margin-top: 4px; font-family: 'Share Tech Mono', monospace; }

  .av-crashed-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
  .av-crashed-big { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900; color: #fc4545; text-shadow: 0 0 20px #fc4545; letter-spacing: 4px; }
  .av-crashed-mult { font-size: 18px; color: rgba(252,69,69,0.7); margin-top: 4px; font-family: 'Share Tech Mono', monospace; }

  .av-controls {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .av-bet-section { display: flex; flex-direction: column; gap: 8px; }
  .av-label { font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.35); text-transform: uppercase; font-family: 'Share Tech Mono', monospace; }
  .av-bet-row { display: flex; align-items: center; gap: 6px; }

  .av-bet-input {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px; padding: 8px 12px; font-family: 'Orbitron', sans-serif;
    font-size: 14px; font-weight: 700; color: #fff; width: 90px; text-align: center;
  }
  .av-bet-input:focus { outline: none; border-color: rgba(245,200,66,0.5); }

  .av-quick-btn {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px; color: rgba(255,255,255,0.6); font-size: 11px;
    padding: 5px 8px; cursor: pointer; font-family: 'Share Tech Mono', monospace; transition: all 0.15s;
  }
  .av-quick-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

  .av-presets { display: flex; gap: 6px; flex-wrap: wrap; }

  .av-auto-row { display: flex; align-items: center; gap: 8px; }
  .av-auto-input {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px; padding: 7px 10px; font-family: 'Orbitron', sans-serif;
    font-size: 13px; color: #f5c842; width: 70px; text-align: center;
  }
  .av-auto-input:focus { outline: none; border-color: rgba(245,200,66,0.5); }

  .av-toggle { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.4); cursor: pointer; font-family: 'Share Tech Mono', monospace; }
  .av-toggle input { accent-color: #f5c842; }

  .av-action-section { display: flex; flex-direction: column; gap: 8px; justify-content: center; }

  .av-btn { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1px; padding: 14px; border-radius: 10px; border: none; cursor: pointer; transition: all 0.15s; text-transform: uppercase; }
  .av-btn-place { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; box-shadow: 0 4px 15px rgba(34,197,94,0.3); }
  .av-btn-place:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,197,94,0.4); }
  .av-btn-cashout { background: linear-gradient(135deg, #f5c842, #e6a817); color: #0a0e1a; box-shadow: 0 4px 15px rgba(245,200,66,0.3); animation: pulse-gold 1s ease-in-out infinite; }
  @keyframes pulse-gold { 0%,100%{box-shadow:0 4px 15px rgba(245,200,66,0.3)} 50%{box-shadow:0 4px 25px rgba(245,200,66,0.6)} }
  .av-btn-disabled { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.25); cursor: not-allowed; }
  .av-btn-waiting { background: rgba(245,200,66,0.1); color: #f5c842; border: 1px solid rgba(245,200,66,0.3); cursor: not-allowed; }

  .av-potential { font-size: 11px; color: rgba(255,255,255,0.35); text-align: center; font-family: 'Share Tech Mono', monospace; }
  .av-potential span { color: #68d391; font-weight: 700; }

  .av-status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.4); font-family: 'Share Tech Mono', monospace; }
  .av-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; }
  .av-dot-live  { background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: blink 1s ease infinite; }
  .av-dot-wait  { background: #f5c842; box-shadow: 0 0 6px #f5c842; }
  .av-dot-crash { background: #fc4545; box-shadow: 0 0 6px #fc4545; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* Deposit Modal */
  .av-modal-bg {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center; z-index: 999;
  }
  .av-modal {
    background: #0d1526; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px; padding: 28px; width: 320px;
  }
  .av-modal-title { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 700; color: #f5c842; margin-bottom: 20px; text-align: center; letter-spacing: 2px; }
  .av-modal-input {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px; padding: 10px 14px; font-family: 'Share Tech Mono', monospace;
    font-size: 14px; color: #fff; width: 100%; margin-bottom: 10px;
  }
  .av-modal-input:focus { outline: none; border-color: rgba(245,200,66,0.5); }
  .av-modal-btn { width: 100%; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1px; padding: 12px; border-radius: 8px; border: none; cursor: pointer; text-transform: uppercase; margin-top: 4px; }
  .av-modal-submit { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
  .av-modal-cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); margin-top: 8px; }
  .av-modal-hint { font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 8px; }

  /* Phone registration */
  .av-phone-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
  }
  .av-phone-input {
    background: transparent; border: none; font-family: 'Share Tech Mono', monospace;
    font-size: 13px; color: #fff; flex: 1; outline: none;
  }
  .av-phone-btn { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; letter-spacing: 1px; }
  .av-phone-connect { background: linear-gradient(135deg, #f5c842, #e6a817); color: #0a0e1a; }
  .av-phone-connected { background: rgba(104,211,145,0.15); color: #68d391; border: 1px solid rgba(104,211,145,0.3); cursor: default; }
  .av-deposit-btn { background: rgba(99,179,237,0.15); color: #63b3ed; border: 1px solid rgba(99,179,237,0.3); font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; padding: 6px 12px; border-radius: 6px; cursor: pointer; letter-spacing: 1px; }

  .av-toast {
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    padding: 10px 20px; border-radius: 10px; font-family: 'Orbitron', monospace;
    font-size: 13px; font-weight: 700; pointer-events: none; z-index: 9999; white-space: nowrap; transition: opacity 0.3s;
  }
  .av-toast-win  { background: rgba(104,211,145,0.15); border: 1px solid rgba(104,211,145,0.4); color: #68d391; }
  .av-toast-loss { background: rgba(252,69,69,0.15);   border: 1px solid rgba(252,69,69,0.4);   color: #fc6b6b; }
  .av-toast-info { background: rgba(99,179,237,0.15);  border: 1px solid rgba(99,179,237,0.4);  color: #63b3ed; }
`;

function histChipClass(v) {
  const n = parseFloat(v);
  if (n < 2) return "hist-chip hist-low";
  if (n < 5) return "hist-chip hist-mid";
  if (n < 10) return "hist-chip hist-high";
  return "hist-chip hist-mega";
}
function multColor(m) {
  if (m < 2) return "#68d391";
  if (m < 5) return "#f5c842";
  if (m < 10) return "#fc8c42";
  return "#63b3ed";
}

export default function AviatorGame() {
  const canvasRef = useRef(null);
  const canvasAreaRef = useRef(null);
  const animRef = useRef(null);
  const starsRef = useRef([]);
  const trailRef = useRef([]);
  const particlesRef = useRef([]);
  const planeRef = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(null);
  const gameStateRef = useRef("waiting");
  const hasBetRef = useRef(false);
  const autoCashoutRef = useRef({ enabled: false, val: 2.0 });

  const [balance, setBalance] = useState(0);
  const [bet, setBetState] = useState(10);
  const crashPointRef = useRef(null);
  const [gameState, setGameState] = useState("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [hasBet, setHasBet] = useState(false);
  const [history, setHistory] = useState([]);
  const [autoCashout, setAutoCashout] = useState(false);
  const [autoCashoutVal, setAutoCashoutVal] = useState(2.0);
  const [statusText, setStatusText] = useState("WAITING");
  const [toast, setToast] = useState(null);
  const [liveWin, setLiveWin] = useState(null);
  const [crashedAt, setCrashedAt] = useState(null);

  // Phone & deposit
  const [phone, setPhone] = useState("");
  const [registeredPhone, setRegisteredPhone] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositPhone, setDepositPhone] = useState("");
  const [depositAmount, setDepositAmount] = useState(10);
  const [depositLoading, setDepositLoading] = useState(false);

  const betRef = useRef(10);
  useEffect(() => {
    betRef.current = bet;
  }, [bet]);
  useEffect(() => {
    autoCashoutRef.current = { enabled: autoCashout, val: autoCashoutVal };
  }, [autoCashout, autoCashoutVal]);

  const showToast = useCallback((msg, type = "win") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Socket.io listeners ───────────────────────────────────────────────────

  useEffect(() => {
    // Initial game state sync
    socket.on("game:state", ({ state, startTime, history, crashPoint }) => {
      const h = (history || []).map((item) =>
        typeof item === "object"
          ? parseFloat(item.crashPoint)
          : parseFloat(item),
      );
      setHistory(h);

      if (state === "flying" && startTime) {
        startTimeRef.current = startTime;
        crashPointRef.current = crashPoint;
        gameStateRef.current = "flying";
        setGameState("flying");
        setStatusText("FLYING");
        startAnimation(startTime); // 👈 pass server startTime
      }
    });

    socket.on("round:waiting", ({ countdown }) => {
      cancelAnimationFrame(animRef.current); // 👈 cancel first
      animRef.current = null; // 👈 clear it

      gameStateRef.current = "waiting";
      hasBetRef.current = false;
      crashPointRef.current = null;

      setGameState("waiting");
      setHasBet(false);
      setMultiplier(1.0);
      setCrashedAt(null);
      setLiveWin(null);
      setStatusText(`NEXT IN ${countdown}s`);
      trailRef.current = [];
      particlesRef.current = [];

      // reset displays
      const multEl = document.getElementById("av-mult-display");
      if (multEl) {
        multEl.textContent = "WAITING...";
        multEl.style.fontSize = "24px";
        multEl.style.color = "#f5c842";
      }

      const btnEl = document.getElementById("av-action-btn");
      if (btnEl) btnEl.textContent = "PLACE BET";

      // 👇 delay drawWaiting to let animation fully stop
      setTimeout(() => {
        if (gameStateRef.current === "waiting") {
          drawWaiting();
        }
      }, 100);
    });
    socket.on("round:countdown", ({ countdown }) => {
      setStatusText(`NEXT IN ${countdown}s`);
    });
    socket.on("round:start", ({ startTime, crashPoint }) => {
      startTimeRef.current = startTime;
      crashPointRef.current = crashPoint;
      gameStateRef.current = "flying";
      setGameState("flying");
      setStatusText("FLYING");
      trailRef.current = [];
      particlesRef.current = [];
      startAnimation(startTime); // 👈 pass server startTime
    });

    socket.on("round:crash", ({ crashPoint }) => {
      gameStateRef.current = "crashed";
      cancelAnimationFrame(animRef.current);
      setGameState("crashed");
      setStatusText("CRASHED");
      setCrashedAt(crashPoint);
      setLiveWin(null);
      setHistory((prev) => [parseFloat(crashPoint), ...prev].slice(0, 12));
      if (hasBetRef.current) {
        showToast(`Lost — crashed at ${crashPoint.toFixed(2)}x`, "loss");
        hasBetRef.current = false;
        setHasBet(false);
      }
      drawCrashExplosion();
    });

    // Bet responses
    socket.on("bet:success", ({ amount, balance }) => {
      hasBetRef.current = true;
      setHasBet(true);
      setBalance(balance);
      showToast(`Bet placed: KES ${amount}`, "info");
    });

    socket.on("bet:error", ({ error }) => {
      showToast(error, "loss");
    });
    socket.on("cashout:success", ({ multiplier, winAmount, balance }) => {
      hasBetRef.current = false;
      setHasBet(false);
      setBalance(balance);
      setLiveWin(null);
      // 👇 reset button text
      const btnEl = document.getElementById("av-action-btn");
      if (btnEl) btnEl.textContent = "NEXT ROUND";
      showToast(
        `+KES ${winAmount.toFixed(2)} at ${multiplier.toFixed(2)}x! 🎉`,
        "win",
      );
    });

    socket.on("cashout:error", ({ error }) => {
      showToast(error, "loss");
    });

    // Player registered
    socket.on("player:registered", ({ phone, balance }) => {
      setRegisteredPhone(phone);
      setBalance(balance);
      showToast(`Connected: ${phone.slice(0, 6)}****`, "info");
    });

    // Deposit events
    socket.on("deposit:confirmed", ({ amount, balance }) => {
      setBalance(balance);
      setDepositLoading(false);
      setShowDeposit(false);
      showToast(`+KES ${amount} deposited! 💰`, "win");
    });

    socket.on("deposit:failed", ({ message }) => {
      setDepositLoading(false);
      showToast(message || "Deposit failed or cancelled", "loss");
    });

    return () => {
      socket.off("game:state");
      socket.off("round:waiting");
      socket.off("round:countdown");
      socket.off("round:start");
      socket.off("round:crash");
      socket.off("bet:success");
      socket.off("bet:error");
      socket.off("cashout:success");
      socket.off("cashout:error");
      socket.off("player:registered");
      socket.off("deposit:confirmed");
      socket.off("deposit:failed");
    };
  }, [showToast]);

  // ── Canvas helpers ────────────────────────────────────────────────────────

  function initStars(W, H) {
    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.7,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function drawBg(ctx, W, H) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#060d1f");
    grad.addColorStop(1, "#0d1a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    starsRef.current.forEach((s) => {
      s.twinkle += 0.02;
      const a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });
  }

  function drawGrid(ctx, W, H) {
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
      const x = (W / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const y = (H / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.08, H * 0.1);
    ctx.lineTo(W * 0.08, H * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.08, H * 0.85);
    ctx.lineTo(W * 0.95, H * 0.85);
    ctx.stroke();
  }

  function drawTrail(ctx) {
    const pts = trailRef.current;
    if (pts.length < 2) return;
    for (let i = 1; i < pts.length; i++) {
      const p1 = pts[i - 1],
        p2 = pts[i];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(104,211,145,${pts[i].alpha})`;
      ctx.lineWidth = 2.5 * pts[i].alpha + 0.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    const last = pts[pts.length - 1];
    const grad = ctx.createRadialGradient(
      last.x,
      last.y,
      0,
      last.x,
      last.y,
      12,
    );
    grad.addColorStop(0, "rgba(104,211,145,0.3)");
    grad.addColorStop(1, "rgba(104,211,145,0)");
    ctx.beginPath();
    ctx.arc(last.x, last.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function drawParticles(ctx) {
    particlesRef.current.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle =
        p.color +
        Math.floor(p.life * 255)
          .toString(16)
          .padStart(2, "0");
      ctx.fill();
    });
  }

  function drawPlane(ctx, x, y, t, color, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(-0.3 - t * 0.2);
    ctx.scale(1.1, 1.1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-10, -6);
    ctx.lineTo(-16, -4);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-16, 4);
    ctx.lineTo(-10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(-8, -18);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-8, -6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, 6);
    ctx.lineTo(-8, 18);
    ctx.lineTo(-14, 18);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-20, -10);
    ctx.lineTo(-22, -10);
    ctx.lineTo(-15, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawWaiting() {
    if (gameStateRef.current !== "waiting") return; // 👈 guard
    if (!canvasRef.current) return; // 👈 guard

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    drawBg(ctx, W, H);
    drawGrid(ctx, W, H);
    drawPlane(ctx, W * 0.12, H * 0.75, 0, "#f5c842", 0.85);

    animRef.current = requestAnimationFrame(drawWaiting);
  }
  function startAnimation(serverStartTime = null) {
    cancelAnimationFrame(animRef.current);
    const localStart = serverStartTime || Date.now(); // 👈 use server time if provided

    const loop = (now) => {
      if (gameStateRef.current !== "flying") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width,
        H = canvas.height;

      const elapsed = (Date.now() - localStart) / 1000; // 👈 calculates from server start
      const m = Math.pow(Math.E, elapsed * 0.06);

      const { enabled, val } = autoCashoutRef.current;
      if (enabled && hasBetRef.current && m >= val) {
        socket.emit("bet:cashout");
      }

      const t = Math.min(elapsed / 15, 1);
      const px = W * 0.1 + (W * 0.85 - W * 0.1) * (1 - Math.pow(1 - t, 2));
      const py = H * 0.78 - (H * 0.78 - H * 0.12) * Math.pow(t, 0.5);
      planeRef.current = { x: px, y: py };

      trailRef.current.push({ x: px, y: py, alpha: 1.0 });
      if (trailRef.current.length > 80) trailRef.current.shift();
      trailRef.current.forEach((pt, i) => {
        pt.alpha = (i / trailRef.current.length) * 0.7;
      });

      if (Math.random() < 0.4) {
        particlesRef.current.push({
          x: px - 20,
          y: py + 5,
          vx: -(Math.random() * 2 + 1),
          vy: Math.random() - 0.5,
          life: 1.0,
          r: Math.random() * 3 + 1,
          color: Math.random() < 0.5 ? "#f5c842" : "#fc8c42",
        });
      }
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
      });

      ctx.clearRect(0, 0, W, H);
      drawBg(ctx, W, H);
      drawGrid(ctx, W, H);
      drawTrail(ctx);
      drawParticles(ctx);
      drawPlane(ctx, px, py, t, "#68d391", 1.0);
      // Direct DOM update — no re-render
      const multEl = document.getElementById("av-mult-display");
      if (multEl) {
        multEl.textContent = m.toFixed(2) + "x";
        multEl.style.color = m < 2 ? "#68d391" : m < 5 ? "#f5c842" : "#63b3ed";
        multEl.style.fontSize = "56px"; // 👈 add this
      }
      // 👇 add this
      const btnEl = document.getElementById("av-action-btn");
      if (btnEl && hasBetRef.current) {
        const winAmount = (betRef.current * m).toFixed(2);
        btnEl.textContent = `CASH OUT KES ${winAmount}`;
      }
      const winEl = document.getElementById("av-win-display");
      if (winEl && hasBetRef.current) {
        winEl.textContent = "KES " + (betRef.current * m).toFixed(2);
      }

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  }

  function drawCrashExplosion() {
    const { x: px, y: py } = planeRef.current;
    for (let i = 0; i < 30; i++) {
      particlesRef.current.push({
        x: px + (Math.random() - 0.5) * 20,
        y: py + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3,
        life: 1.0,
        r: Math.random() * 5 + 2,
        color: Math.random() < 0.5 ? "#fc4545" : "#fc8c42",
      });
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    const explode = () => {
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        p.vy += 0.1;
      });
      ctx.clearRect(0, 0, W, H);
      drawBg(ctx, W, H);
      drawGrid(ctx, W, H);
      if (trailRef.current.length > 1) drawTrail(ctx);
      drawParticles(ctx);
      if (particlesRef.current.length > 0) requestAnimationFrame(explode);
    };
    explode();
  }

  // ── Mount / resize ────────────────────────────────────────────────────────

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    const resize = () => {
      const canvas = canvasRef.current;
      const area = canvasAreaRef.current;
      if (!canvas || !area) return;
      const rect = area.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initStars(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      document.head.removeChild(styleEl);
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const registerPhone = () => {
    if (!phone || phone.length < 9) {
      showToast("Enter a valid phone number", "loss");
      return;
    }
    socket.emit("player:register", { phone });
  };

  const handleAction = () => {
    if (!registeredPhone) {
      showToast("Enter your phone number first", "loss");
      return;
    }
    if (gameState === "waiting" && !hasBet) {
      socket.emit("bet:place", { amount: bet });
    } else if (gameState === "flying" && hasBet) {
      socket.emit("bet:cashout");
    }
  };

  const handleDeposit = async () => {
    const ph = depositPhone || registeredPhone;
    if (!ph) {
      showToast("Enter your phone number", "loss");
      return;
    }
    if (depositAmount < 10) {
      showToast("Minimum deposit is KES 10", "loss");
      return;
    }
    setDepositLoading(true);
    try {
      const res = await fetch(
        "https://aviatorgame-production.up.railway.app/api/mpesa/deposit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: ph, amount: depositAmount }),
        },
      );
      const data = await res.json();
      if (data.success) {
        showToast("STK push sent — check your phone 📱", "info");
      } else {
        showToast(data.error || "Deposit failed", "loss");
        setDepositLoading(false);
      }
    } catch {
      showToast("Could not connect to server", "loss");
      setDepositLoading(false);
    }
  };

  const applyBet = (val) => {
    const v = Math.max(10, Math.min(50000, parseFloat(val) || 10));
    setBetState(v);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const dotClass =
    gameState === "flying"
      ? "av-dot av-dot-live"
      : gameState === "crashed"
        ? "av-dot av-dot-crash"
        : "av-dot av-dot-wait";
  const multCol = multColor(multiplier);

  const btnClass =
    gameState === "waiting" && !hasBet
      ? "av-btn av-btn-place"
      : gameState === "waiting" && hasBet
        ? "av-btn av-btn-waiting"
        : gameState === "flying" && hasBet
          ? "av-btn av-btn-cashout"
          : "av-btn av-btn-disabled";

  const btnText =
    gameState === "waiting" && !hasBet
      ? "PLACE BET"
      : gameState === "waiting" && hasBet
        ? "BET PLACED ✓"
        : gameState === "flying" && hasBet
          ? `CASH OUT KES ${liveWin ?? (bet * multiplier).toFixed(2)}`
          : "NEXT ROUND";

  const toastClass =
    toast?.type === "win"
      ? "av-toast av-toast-win"
      : toast?.type === "loss"
        ? "av-toast av-toast-loss"
        : "av-toast av-toast-info";

  return (
    <div className="av-wrapper">
      {/* Header */}
      <div className="av-header">
        <div className="av-logo">✈ AVIATOR</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="av-status">
            <span className={dotClass} />
            {statusText}
          </div>
          <div className="av-balance">
            Balance: KES <span>{balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Phone bar */}
      <div className="av-phone-bar">
        {!registeredPhone ? (
          <>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              📱
            </span>
            <input
              className="av-phone-input"
              type="tel"
              placeholder="Enter phone e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && registerPhone()}
            />
            <button
              className="av-phone-btn av-phone-connect"
              onClick={registerPhone}
            >
              CONNECT
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              📱
            </span>
            <span
              style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.5)" }}
            >
              {registeredPhone.slice(0, 6)}****
            </span>
            <button className="av-phone-btn av-phone-connected">
              CONNECTED ✓
            </button>
            <button
              className="av-deposit-btn"
              onClick={() => {
                setDepositPhone(registeredPhone);
                setShowDeposit(true);
              }}
            >
              + DEPOSIT
            </button>
          </>
        )}
      </div>

      {/* History */}
      <div className="av-history">
        {history.map((v, i) => {
          const val = typeof v === "object" ? v.crashPoint : v;
          return (
            <span
              key={i}
              className={histChipClass(val)}
              style={{
                display: "inline-block",
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "10px",
                fontWeight: "700",
                whiteSpace: "nowrap",
                flexShrink: 0,
                height: "auto", // 👈 fixes bar height issue
                width: "auto", // 👈 fixes bar width issue
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              {parseFloat(val).toFixed(2)}x
            </span>
          );
        })}
      </div>

      {/* Canvas */}
      <div className="av-canvas-area" ref={canvasAreaRef}>
        <canvas ref={canvasRef} />
        {gameState !== "crashed" && (
          <div id="av-mult-display" className="av-mult-overlay">
            <div id="av-mult-display" className="av-mult-value">
              {gameState === "waiting"
                ? "WAITING..."
                : `${multiplier.toFixed(2)}x`}
            </div>
            {gameState === "flying" && (
              <div className="av-mult-label">MULTIPLIER</div>
            )}
          </div>
        )}
        {gameState === "crashed" && (
          <div className="av-crashed-overlay">
            <div className="av-crashed-big">FLEW AWAY!</div>
            <div className="av-crashed-mult">{crashedAt?.toFixed(2)}x</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="av-controls">
        <div className="av-bet-section">
          <div className="av-label">Bet Amount (KES)</div>
          <div className="av-bet-row">
            <input
              className="av-bet-input"
              type="number"
              min={10}
              value={bet}
              onChange={(e) => applyBet(e.target.value)}
            />
            <button className="av-quick-btn" onClick={() => applyBet(bet / 2)}>
              ½
            </button>
            <button className="av-quick-btn" onClick={() => applyBet(bet * 2)}>
              2×
            </button>
          </div>
          <div className="av-presets">
            {[10, 50, 100, 500, 1000].map((v) => (
              <button
                key={v}
                className="av-quick-btn"
                onClick={() => applyBet(v)}
              >
                KES {v}
              </button>
            ))}
          </div>
          <div className="av-auto-row">
            <label className="av-toggle">
              <input
                type="checkbox"
                checked={autoCashout}
                onChange={(e) => setAutoCashout(e.target.checked)}
              />
              Auto at
            </label>
            <input
              className="av-auto-input"
              type="number"
              min={1.1}
              step={0.1}
              value={autoCashoutVal}
              onChange={(e) =>
                setAutoCashoutVal(parseFloat(e.target.value) || 2.0)
              }
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              x
            </span>
          </div>
        </div>

        <div className="av-action-section">
          <button
            className={btnClass}
            onClick={handleAction}
            id="av-action-btn"
          >
            {btnText}
          </button>
          <div className="av-potential">
            Win up to:{" "}
            <span>
              KES {(bet * (autoCashout ? autoCashoutVal : 2)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div
          className="av-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setShowDeposit(false)}
        >
          <div className="av-modal">
            <div className="av-modal-title">💰 DEPOSIT VIA M-PESA</div>
            <input
              className="av-modal-input"
              type="tel"
              placeholder="Phone e.g. 0712345678"
              value={depositPhone}
              onChange={(e) => setDepositPhone(e.target.value)}
            />
            <input
              className="av-modal-input"
              type="number"
              placeholder="Amount (min KES 10)"
              min={10}
              value={depositAmount}
              onChange={(e) => setDepositAmount(parseInt(e.target.value) || 10)}
            />
            <button
              className="av-modal-btn av-modal-submit"
              onClick={handleDeposit}
              disabled={depositLoading}
            >
              {depositLoading ? "SENDING STK PUSH..." : "PAY WITH M-PESA"}
            </button>
            <button
              className="av-modal-btn av-modal-cancel"
              onClick={() => setShowDeposit(false)}
            >
              CANCEL
            </button>
            <div className="av-modal-hint">
              You will receive an M-Pesa prompt on your phone
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={toastClass} style={{ opacity: 1 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
