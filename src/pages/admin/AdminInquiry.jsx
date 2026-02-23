import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";

export default function AdminInquiry() {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | open | resolved
  const [workingId, setWorkingId] = useState("");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // API
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await API.get("/inquiries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiries(res.data.inquiries || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line
  }, []);

  // filter logic 
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return inquiries.filter((x) => {
      const st = (x.status || "").toLowerCase();
      const okStatus = status === "all" ? true : st === status;

      const hay = `${x.ticket || ""} ${x.name || ""} ${x.email || ""} ${
        x.message || ""
      }`.toLowerCase();

      const okText = !text || hay.includes(text);

      return okStatus && okText;
    });
  }, [inquiries, q, status]);

  const badge = (st) => {
    const s = (st || "").toLowerCase();
    if (s === "open")
      return "bg-amber-500/20 border-amber-400/30 text-amber-100";
    if (s === "resolved")
      return "bg-emerald-500/20 border-emerald-400/30 text-emerald-100";
    return "bg-white/10 border-white/20 text-white/80";
  };

  // correct API + status
  const updateStatus = async (id, nextStatus) => {
    try {
      setWorkingId(id);

      const res = await API.patch(
        `/inquiries/${id}/status`,
        { status: nextStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updated = res.data.inquiry;

      setInquiries((prev) =>
        prev.map((x) => (x._id === id ? updated : x))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setWorkingId("");
    }
  };

  if (loading) return <div className="text-white">Loading inquiries...</div>;

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Inquiries</h2>
          <p className="text-white/60 mt-1">
            Contact Us messages with auto-generated tickets
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
        >
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <div className="lg:col-span-2">
          <label className="text-sm text-white/70">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticket, name, email, message..."
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-white/70">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none"
          >
            <option className="text-black" value="all">
              All
            </option>
            <option className="text-black" value="open">
              Open
            </option>
            <option className="text-black" value="resolved">
              Resolved
            </option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/10 border border-white/20 p-6 text-white/70">
          No inquiries found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((x) => {
            const busy = workingId === x._id;

            return (
              <div
                key={x._id}
                className="rounded-2xl bg-white/10 border border-white/20 p-4 sm:p-5 hover:bg-white/15 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    {/* Ticket + status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-xs font-semibold">
                        {x.ticket}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${badge(
                          x.status
                        )}`}
                      >
                        {x.status}
                      </span>
                    </div>

                    {/* highlighted customer name */}
                    <p className="mt-3">
                      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                        <span className="text-xs text-white/60">Customer</span>
                        <span className="text-base font-bold text-white">
                          {x.name}
                        </span>
                      </span>
                      <span className="text-white/60 ml-2 text-sm">
                        ({x.email})
                      </span>
                    </p>

                    <p className="text-white/80 mt-3 whitespace-pre-wrap leading-relaxed">
                      {x.message}
                    </p>

                    <p className="text-xs text-white/50 mt-3">
                      Submitted:{" "}
                      {x.createdAt
                        ? new Date(x.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:items-end">
                    {x.status !== "resolved" && (
                      <button
                        disabled={busy}
                        onClick={() => updateStatus(x._id, "resolved")}
                        className="px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-700 transition text-sm font-semibold disabled:opacity-60"
                      >
                        {busy ? "Working..." : "Mark Resolved"}
                      </button>
                    )}

                    {x.status === "resolved" && (
                      <button
                        disabled={busy}
                        onClick={() => updateStatus(x._id, "open")}
                        className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition text-sm font-semibold disabled:opacity-60"
                      >
                        {busy ? "Working..." : "Reopen"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
