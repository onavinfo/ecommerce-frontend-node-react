import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import API from "../api";
import { socket } from "../socket";

export default function CustomerChatWidget() {
  // ✅ Read auth values FIRST (no hooks yet)
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role"); // "customer" or "admin"
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // ✅ IMPORTANT: return BEFORE any hooks
  const allowed = !!token && !!userId && role === "customer";
  if (!allowed) return null;

  // ✅ Now it's safe to use hooks
  const chatId = useMemo(() => `chat_${userId}`, [userId]);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);

  const loadHistory = async () => {
    try {
      const res = await API.get(`/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsgs(res.data?.messages || []);
    } catch (e) {
      console.error("chat history error", e);
    }
  };

  useEffect(() => {
    if (!chatId) return;

    if (!socket.connected) socket.connect();

    socket.emit("join", { userId, role: "customer" });
    socket.emit("join_chat", { chatId });

    const onNew = (m) => {
      if (m?.chatId !== chatId) return;

      setMsgs((p) => [...p, m]);

      if (!open && m.senderRole === "admin") {
        setUnread((u) => Math.min(u + 1, 10));
      }
    };

    socket.on("new_message", onNew);

    return () => {
      socket.off("new_message", onNew);
      try {
        socket.emit("leave_chat", { chatId });
      } catch {}
      // ✅ don't disconnect here (prevents reconnect loops)
    };
  }, [userId, chatId, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }, [msgs, open]);

  const send = () => {
    const t = text.trim();
    if (!t) return;

    socket.emit("send_message", {
      chatId,
      senderId: userId,
      senderRole: "customer",
      text: t,
    });

    setText("");
  };

  const BTN_STYLE = { position: "fixed", right: 24, bottom: 24, zIndex: 99999 };
  const BOX_STYLE = { position: "fixed", right: 24, bottom: 96, zIndex: 99999 };

  return createPortal(
    <>
      {/* button */}
      <button
        onClick={() => setOpen((s) => !s)}
        style={BTN_STYLE}
        className="
          w-16 h-16 rounded-full
          bg-gradient-to-br from-indigo-500 to-purple-600
          hover:scale-105 active:scale-95
          flex items-center justify-center
          text-white text-2xl
          shadow-[0_20px_40px_rgba(79,70,229,0.45)]
          transition relative
        "
      >
        💬
        {unread > 0 && (
          <span
            className="
              absolute -top-1 -right-1
              min-w-[24px] h-[24px]
              px-1 rounded-full
              bg-rose-500 text-white
              text-xs font-bold
              flex items-center justify-center
              animate-pulse
            "
          >
            {unread >= 10 ? "10+" : unread}
          </span>
        )}
      </button>

      {/* box */}
      {open && (
        <div
          style={BOX_STYLE}
          className="
            w-[360px] max-w-[92vw]
            rounded-3xl
            border border-white/15
            bg-gradient-to-br from-[#0b1d4d]/95 to-[#081338]/95
            backdrop-blur-2xl
            shadow-[0_30px_90px_rgba(0,0,0,0.55)]
            overflow-hidden
          "
        >
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-base">
                Customer Support
              </p>
              <p className="text-white/60 text-xs">We usually reply in minutes</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="h-[300px] overflow-y-auto px-4 py-3 space-y-2">
            {msgs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/60 text-sm">
                👋 Hi! How can we help you?
              </div>
            ) : (
              msgs.map((m, i) => {
                const mine = m.senderRole === "customer";
                return (
                  <div key={m._id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                        mine
                          ? "bg-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.35)]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {m.text}
                      <div className="text-[10px] opacity-70 mt-1 text-right">
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ""}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message…"
              className="
                flex-1 rounded-2xl
                bg-black/20 border border-white/15
                px-4 py-3 text-sm
                text-white placeholder-white/40
                outline-none focus:border-indigo-400/50
              "
            />
            <button
              onClick={send}
              className="
                px-5 py-3 rounded-2xl
                bg-indigo-600 hover:bg-indigo-700
                text-white font-semibold
                transition
                shadow-[0_10px_25px_rgba(79,70,229,0.35)]
              "
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
