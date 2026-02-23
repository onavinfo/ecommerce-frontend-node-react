import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../../api";
import { socket } from "../../socket";

export default function AdminChat() {
  const adminId = localStorage.getItem("userId");
  const role = "admin";
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [unreadMap, setUnreadMap] = useState({});

  const chatId = useMemo(() => {
    return activeCustomer?._id ? `chat_${activeCustomer._id}` : null;
  }, [activeCustomer]);

  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  // ✅ Search in customer list
  const [q, setQ] = useState("");

  const filteredCustomers = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return customers;
    return customers.filter((c) => {
      const hay = `${c.name || ""} ${c.email || ""}`.toLowerCase();
      return hay.includes(t);
    });
  }, [customers, q]);

  // fetch customers
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const res = await API.get("/user/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data?.customers || [];
      setCustomers(list);

      setActiveCustomer((prev) => {
        if (prev && list.some((x) => x._id === prev._id)) return prev;
        return list[0] || null;
      });

      setUnreadMap((prev) => {
        const next = { ...prev };
        list.forEach((c) => {
          if (next[c._id] == null) next[c._id] = 0;
        });
        return next;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      if (!chatId) return;
      const res = await API.get(`/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsgs(res.data?.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  // socket connect
  useEffect(() => {
    if (!adminId) return;
    if (!socket.connected) socket.connect();
    socket.emit("join", { userId: adminId, role });
  }, [adminId]);

  // join chat + unread
  useEffect(() => {
    if (!chatId || !activeCustomer) return;

    socket.emit("join_chat", { chatId });
    loadHistory();

    // clear unread for active
    setUnreadMap((p) => ({ ...p, [activeCustomer._id]: 0 }));

    const onNew = (m) => {
      if (!m?.chatId) return;

      if (m.chatId === chatId) {
        setMsgs((p) => [...p, m]);
      } else {
        // ✅ IMPORTANT: badge using chatId
        const cid = m.chatId.replace("chat_", "");
        setUnreadMap((p) => ({
          ...p,
          [cid]: Math.min((p[cid] || 0) + 1, 10),
        }));
      }
    };

    socket.on("new_message", onNew);
    return () => socket.off("new_message", onNew);
    // eslint-disable-next-line
  }, [chatId, activeCustomer]);

  // scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t || !chatId) return;

    socket.emit("send_message", {
      chatId,
      senderId: adminId,
      senderRole: "admin",
      text: t,
    });
    setText("");
  };

  return (
    <div className="text-white">
      {/* ✅ Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Admin Chat
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Talk to customers in real-time with saved history
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition text-sm font-semibold"
        >
          Refresh Customers
        </button>
      </div>

      {/* ✅ Main layout */}
      <div className="h-[calc(100vh-170px)] grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* LEFT: customer list */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">Customers</div>
              <span className="text-xs text-white/60">
                {customers.length} total
              </span>
            </div>

            {/* search */}
            <div className="mt-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name / email..."
                className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-indigo-400/50 focus:bg-black/25 transition"
              />
            </div>
          </div>

          <div className="p-2 max-h-[calc(100vh-270px)] overflow-y-auto">
            {customersLoading ? (
              <div className="p-4 text-white/70 text-sm">Loading customers…</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-4 text-white/70 text-sm">No customers found.</div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((c) => {
                  const active = activeCustomer?._id === c._id;
                  const unread = unreadMap[c._id] || 0;

                  return (
                    <button
                      key={c._id}
                      onClick={() => setActiveCustomer(c)}
                      className={`relative w-full text-left rounded-2xl p-3 transition border ${
                        active
                          ? "bg-indigo-600/30 border-indigo-400/30"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* avatar */}
                        <div
                          className={`w-10 h-10 rounded-2xl grid place-items-center text-lg ${
                            active ? "bg-indigo-600" : "bg-white/10"
                          }`}
                        >
                          {String(c?.name || "C")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold truncate">
                              {c.name || "Customer"}
                            </p>
                            {active && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/20 text-emerald-200">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/60 truncate">
                            {c.email || ""}
                          </p>
                        </div>
                      </div>

                      {/* unread badge */}
                      {unread > 0 && !active && (
                        <span
                          className="
                            absolute top-2 right-2
                            min-w-[22px] h-[22px]
                            px-1 rounded-full
                            bg-rose-500 text-white
                            text-xs font-bold
                            flex items-center justify-center
                            animate-pulse
                            shadow-[0_0_14px_rgba(244,63,94,0.75)]
                          "
                        >
                          {unread >= 10 ? "10+" : unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: chat */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex flex-col">
          {/* top bar */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold truncate">
                {activeCustomer ? `Chat with: ${activeCustomer.name}` : "Select a customer"}
              </p>
              <p className="text-xs text-white/60 truncate">
                {activeCustomer?.email || "Pick a customer from left panel"}
              </p>
            </div>

            <button
              onClick={loadHistory}
              disabled={!activeCustomer}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition text-xs font-semibold disabled:opacity-50"
            >
              Refresh Chat
            </button>
          </div>

          {/* messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-transparent via-transparent to-black/10"
          >
            {!activeCustomer ? (
              <div className="h-full grid place-items-center text-white/60 text-sm">
                Select a customer to start chatting.
              </div>
            ) : msgs.length === 0 ? (
              <div className="h-full grid place-items-center text-white/60 text-sm">
                No messages yet. Say hi 👋
              </div>
            ) : (
              msgs.map((m, i) => {
                const mine = m.senderRole === "admin";
                return (
                  <div
                    key={m._id || i}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm border ${
                        mine
                          ? "bg-indigo-600 text-white border-indigo-400/20 shadow-[0_10px_25px_rgba(79,70,229,0.25)]"
                          : "bg-white/10 text-white border-white/10"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {m.text}
                      </div>
                      <div className="text-[10px] opacity-70 mt-1">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleTimeString()
                          : ""}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <textarea
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  disabled={!activeCustomer}
                  placeholder={
                    activeCustomer ? "Type message… (Enter to send)" : "Select a customer first"
                  }
                  className="
                    w-full resize-none
                    rounded-2xl bg-black/20 border border-white/10
                    px-4 py-3 text-sm text-white placeholder-white/40
                    outline-none focus:border-indigo-400/50 focus:bg-black/25 transition
                    disabled:opacity-60
                  "
                />
                
              </div>

              <button
                onClick={send}
                disabled={!activeCustomer || !text.trim()}
                className="
                  h-[46px] px-5 rounded-2xl
                  bg-indigo-600 hover:bg-indigo-700
                  font-semibold
                  transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-[0_14px_30px_rgba(79,70,229,0.25)]
                "
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
