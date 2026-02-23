// client/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../../api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const [chartTab, setChartTab] = useState("Monthly");
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [donut, setDonut] = useState([]);

  const [salesByMonth, setSalesByMonth] = useState([]);
  const [salesByWeek, setSalesByWeek] = useState([]);
  const [salesByYear, setSalesByYear] = useState([]);

  // Donut hover
  const donutRef = useRef(null);
  const [donutHover, setDonutHover] = useState(null); // {label, value, color}

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/summary");

        setSummary(
          res.data.summary || {
            totalSales: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
          }
        );

        setRecentOrders(res.data.recentOrders || []);
        setNotifications(res.data.notifications || []);
        setDonut(res.data.donut || []);

        setSalesByMonth(res.data.salesByMonth || []);
        setSalesByWeek(res.data.salesByWeek || []);
        setSalesByYear(res.data.salesByYear || []);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // ✅ Stat cards
  const stats = useMemo(() => {
    return [
      {
        title: "Total Sales",
        value: `₹${Number(summary.totalSales || 0).toLocaleString("en-IN")}`,
        note: "Confirmed/Delivered",
        icon: "bag",
      },
      {
        title: "Total Orders",
        value: `${Number(summary.totalOrders || 0).toLocaleString("en-IN")}`,
        note: "All orders",
        icon: "cart",
      },
      {
        title: "Total Customers",
        value: `${Number(summary.totalCustomers || 0).toLocaleString("en-IN")}`,
        note: "Registered",
        icon: "user",
      },
      {
        title: "Total Products",
        value: `${Number(summary.totalProducts || 0).toLocaleString("en-IN")}`,
        note: "In store",
        icon: "coin",
      },
    ];
  }, [summary]);

  // Recent orders table
  const orders = useMemo(() => {
    return recentOrders.map((o) => ({
      id: o._id ? `#${o._id.slice(-6)}` : "#------",
      fullId: o._id || "",
      customer: o.user?.name || "Customer",
      email: o.user?.email || "N/A",
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-",
      status: o.status || "pending",
      total: `₹${Number(o.totalAmount || 0).toLocaleString("en-IN")}`,
    }));
  }, [recentOrders]);

  // Donut data (percent) -> top 4
  const donutData = useMemo(() => {
    const base = donut && donut.length ? donut : [{ label: "No Data", value: 1 }];
    const total = base.reduce((s, d) => s + Number(d.value || 0), 0) || 1;

    return base.slice(0, 4).map((d) => ({
      label: d.label,
      raw: Number(d.value || 0),
      value: Math.round((Number(d.value || 0) / total) * 100),
    }));
  }, [donut]);

  const DONUT_COLORS = ["#4f46e5", "#60a5fa", "#34d399", "#93c5fd"];

  const donutSegments = useMemo(() => {
    let start = 0;
    return donutData.map((d, i) => {
      const end = start + (d.value || 0);
      const seg = { ...d, start, end, color: DONUT_COLORS[i % 4] };
      start = end;
      return seg;
    });
  }, [donutData]);

  const donutBg = useMemo(() => {
    if (!donutSegments.length) return "conic-gradient(#ffffff22 0% 100%)";
    const segs = donutSegments.map((s) => `${s.color} ${s.start}% ${s.end}%`);
    return `conic-gradient(${segs.join(", ")})`;
  }, [donutSegments]);

  // Donut hover detection
  const onDonutMove = (e) => {
    if (!donutRef.current || !donutSegments.length) return;

    const rect = donutRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const r = Math.sqrt(dx * dx + dy * dy);
    const outerR = rect.width / 2;
    const innerR = outerR * 0.62; // hole size

    if (r < innerR || r > outerR) {
      setDonutHover(null);
      return;
    }

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = angle < 0 ? angle + 360 : angle;

    // CSS conic gradient starts from top, we rotate by +90
    const cssAngle = (angle + 90) % 360;
    const pct = (cssAngle / 360) * 100;

    const seg = donutSegments.find((s) => pct >= s.start && pct < s.end) || null;
    if (!seg) setDonutHover(null);
    else setDonutHover({ label: seg.label, value: seg.value, color: seg.color });
  };

  const onDonutLeave = () => setDonutHover(null);

  // Chart mapping (always stable)
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const chartData = useMemo(() => {
    if (chartTab === "Monthly") {
      const items = [...(salesByMonth || [])]
        .sort((a, b) => {
          const ay = Number(a.year ?? a._id?.year ?? 0);
          const am = Number(a.month ?? a._id?.month ?? 0);
          const by = Number(b.year ?? b._id?.year ?? 0);
          const bm = Number(b.month ?? b._id?.month ?? 0);
          return ay !== by ? ay - by : am - bm;
        })
        .slice(-12);

      return {
        labels: items.length
          ? items.map((x) => {
              const m = Number(x.month ?? x._id?.month ?? 1);
              const y = Number(x.year ?? x._id?.year ?? new Date().getFullYear());
              const mm = MONTHS[Math.max(0, Math.min(11, m - 1))] || `M${m}`;
              return `${mm} ${y}`;
            })
          : ["No Data"],
        points: items.length ? items.map((x) => Number(x.total || 0)) : [0],
      };
    }

    if (chartTab === "Weekly") {
      const items = [...(salesByWeek || [])]
        .sort((a, b) => {
          const ay = Number(a.year ?? a._id?.year ?? 0);
          const aw = Number(a.week ?? a._id?.week ?? 0);
          const by = Number(b.year ?? b._id?.year ?? 0);
          const bw = Number(b.week ?? b._id?.week ?? 0);
          return ay !== by ? ay - by : aw - bw;
        })
        .slice(-10);

      return {
        labels: items.length
          ? items.map((x) => {
              const w = Number(x.week ?? x._id?.week ?? 0);
              const y = Number(x.year ?? x._id?.year ?? new Date().getFullYear());
              return w ? `Week ${w} (${y})` : `${y}`;
            })
          : ["No Data"],
        points: items.length ? items.map((x) => Number(x.total || 0)) : [0],
      };
    }

    // Yearly
    const items = [...(salesByYear || [])]
      .sort((a, b) => Number(a.year ?? a._id?.year ?? 0) - Number(b.year ?? b._id?.year ?? 0))
      .slice(-7);

    return {
      labels: items.length ? items.map((x) => String(x.year ?? x._id?.year ?? "")) : ["No Data"],
      points: items.length ? items.map((x) => Number(x.total || 0)) : [0],
    };
  }, [chartTab, salesByMonth, salesByWeek, salesByYear]);

  const rechartsData = useMemo(() => {
    const pts = chartData.points || [];
    const lbs = chartData.labels || [];
    return lbs.map((label, i) => ({
      name: label,
      sales: Number(pts[i] || 0),
    }));
  }, [chartData]);

  const salesMeta = useMemo(() => {
    const arr = rechartsData.map((d) => Number(d.sales || 0));
    const total = arr.reduce((s, v) => s + v, 0);
    const max = Math.max(...arr, 0);
    const avg = arr.length ? total / arr.length : 0;
    const last = arr.length ? arr[arr.length - 1] : 0;
    const prev = arr.length > 1 ? arr[arr.length - 2] : 0;
    const change = prev ? ((last - prev) / prev) * 100 : 0;
    return { total, max, avg, last, change };
  }, [rechartsData]);

  const tabLabel =
    chartTab === "Monthly"
      ? "Last 12 Months"
      : chartTab === "Weekly"
      ? "Last 10 Weeks"
      : "Last 7 Years";

  if (loading) return <div className="text-white p-4">Loading dashboard...</div>;

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Sales Overview</h1>
          <p className="text-white/60 mt-1">
            Track revenue, orders and customers in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print?.()}
            className="w-full md:w-auto rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 transition px-4 py-2"
          >
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            {/* Title + Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Sales Chart</h2>
                <p className="text-xs text-white/55 mt-1">{tabLabel}</p>
              </div>

              <div className="w-full sm:w-auto flex items-center rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                {["Monthly", "Weekly", "Yearly"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartTab(t)}
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm transition ${
                      chartTab === t
                        ? "bg-indigo-500/80 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Meta Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniCard label="Total" value={`₹${Number(salesMeta.total).toLocaleString("en-IN")}`} />
              <MiniCard label="Average" value={`₹${Number(salesMeta.avg).toLocaleString("en-IN")}`} />
              <MiniCard label="Peak" value={`₹${Number(salesMeta.max).toLocaleString("en-IN")}`} />
              <MiniCard
                label="Last vs Prev"
                value={`${Number.isFinite(salesMeta.change) ? salesMeta.change.toFixed(1) : "0.0"}%`}
              />
            </div>

            {/* Recharts */}
            <div className="w-full h-[280px] sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rechartsData} margin={{ top: 10, right: 16, left: 0, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    interval="preserveStartEnd"
                    minTickGap={12}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    width={72}
                    tickFormatter={(v) => {
                      const n = Number(v || 0);
                      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
                      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
                      if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
                      return `₹${n}`;
                    }}
                  />
                  <Tooltip cursor={false} content={<NiceTooltip />} />
                  <Legend
                    wrapperStyle={{ color: "rgba(255,255,255,0.75)" }}
                    formatter={(v) => <span style={{ color: "rgba(255,255,255,0.75)" }}>{v}</span>}
                  />
                  <Bar
                    dataKey="sales"
                    name="Sales"
                    fill="rgba(99,102,241,0.95)"
                    radius={[12, 12, 0, 0]}
                    maxBarSize={56}
                    activeBar={{
                      fill: "rgba(129,140,248,1)",
                      stroke: "rgba(255,255,255,0.35)",
                      strokeWidth: 2,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-xs text-white/50">Hover on bars to see exact sales</div>
          </div>
        </div>

        {/* Donut */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Top Selling Products</h2>

          <div className="mt-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-[160px] h-[160px] shrink-0">
              <div
                ref={donutRef}
                onMouseMove={onDonutMove}
                onMouseLeave={onDonutLeave}
                className="w-full h-full rounded-full border border-white/10"
                style={{ background: donutBg }}
              />

              <div className="absolute inset-5 rounded-full bg-[#0b1d4d]/70 border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-white/60">{donutHover ? donutHover.label : "Total"}</div>
                  <div className="text-sm font-bold mt-1">
                    {donutHover ? `${donutHover.value}%` : "100%"}
                  </div>
                </div>
              </div>

              {donutHover && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 translate-y-full rounded-2xl border border-white/10 bg-[#0a1237] px-3 py-2 text-xs shadow-[0_18px_45px_rgba(0,0,0,0.6)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: donutHover.color }} />
                    <span className="text-white/90 font-semibold">{donutHover.label}</span>
                  </div>
                  <div className="text-white/70 mt-1">Share: {donutHover.value}%</div>
                </div>
              )}
            </div>

            <div className="w-full space-y-2">
              {donutSegments.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between text-sm rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
                  onMouseEnter={() => setDonutHover({ label: d.label, value: d.value, color: d.color })}
                  onMouseLeave={() => setDonutHover(null)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-white/85 font-medium">{d.label}</span>
                  </div>
                  <span className="text-white/70 font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 overflow-hidden">
          <h2 className="text-lg font-semibold">Recent Orders</h2>

          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="text-left font-medium py-3">Order ID</th>
                  <th className="text-left font-medium py-3">Customer</th>
                  <th className="text-left font-medium py-3">Date</th>
                  <th className="text-left font-medium py-3">Status</th>
                  <th className="text-right font-medium py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.fullId || o.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 text-white/85">{o.id}</td>
                    <td className="py-3 text-white/80">
                      <span className="font-semibold text-white">{o.customer}</span>{" "}
                      <span className="text-white/50">({o.email})</span>
                    </td>
                    <td className="py-3 text-white/70">{o.date}</td>
                    <td className="py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 text-right text-white/85">{o.total}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td className="py-4 text-white/60" colSpan={5}>
                      No recent orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* mobile */}
          <div className="mt-4 space-y-3 md:hidden">
            {orders.length === 0 ? (
              <p className="text-white/60 text-sm">No recent orders.</p>
            ) : (
              orders.map((o) => (
                <div key={o.fullId || o.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{o.id}</p>
                      <p className="text-white/70 text-sm">
                        <span className="font-semibold text-white">{o.customer}</span> • {o.date}
                      </p>
                      <p className="text-white/80 text-sm mt-1">{o.total}</p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-white/60 text-xs mt-2 break-all">{o.fullId}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Notifications</h2>

          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-white/60 text-sm">No notifications.</p>
            ) : (
              notifications.map((n, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex gap-3">
                  <div className="mt-0.5">
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/85 leading-snug">{n.text}</p>
                    <p className="text-xs text-white/60 mt-1">
                      {n.time ? new Date(n.time).toLocaleString() : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Components ----------------- */

function MiniCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] text-white/55">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function NiceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;

  return (
    <div
      style={{
        background: "rgba(10,18,55,0.96)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: "10px 12px",
        color: "#fff",
        boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>
        ₹{Number(value).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function StatCard({ title, value, note, icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className="text-sm text-emerald-300/90 mt-2">{note}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
          <Icon name={icon} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  const map = {
    delivered: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30",
    confirmed: "bg-sky-400/20 text-sky-200 border-sky-400/30",
    pending: "bg-amber-400/20 text-amber-200 border-amber-400/30",
    cancelled: "bg-rose-400/20 text-rose-200 border-rose-400/30",
    shipped: "bg-indigo-400/20 text-indigo-200 border-indigo-400/30",
  };
  const cls = map[s] || "bg-white/10 text-white/80 border-white/10";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs ${cls}`}>
      {status}
    </span>
  );
}

function NotifIcon({ type }) {
  const base = "w-9 h-9 rounded-2xl border flex items-center justify-center";
  const map = {
    info: "bg-sky-400/15 border-sky-400/25",
    success: "bg-emerald-400/15 border-emerald-400/25",
    warn: "bg-amber-400/15 border-amber-400/25",
    danger: "bg-rose-400/15 border-rose-400/25",
  };
  return <div className={`${base} ${map[type] || "bg-white/10 border-white/10"}`} />;
}

function Icon({ name = "home" }) {
  const common = {
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "bag":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M6 7h12l1 14H5L6 7Z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M6 6h15l-2 8H7L6 6Z" />
          <path d="M7 14l-1 4h14" />
          <path d="M9 20h.01" />
          <path d="M18 20h.01" />
        </svg>
      );
    case "user":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M20 21c0-4-4-7-8-7s-8 3-8 7" />
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        </svg>
      );
    case "coin":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 2c4.4 0 8 1.8 8 4s-3.6 4-8 4-8-1.8-8-4 3.6-4 8-4Z" />
          <path d="M4 6v6c0 2.2 3.6 4 8 4s8-1.8 8-4V6" />
          <path d="M4 12v6c0 2.2 3.6 4 8 4s8-1.8 8-4v-6" />
        </svg>
      );
    default:
      return null;
  }
}
