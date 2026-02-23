import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import API from "../../api";

function getOrCreateGuestId() {
  let id = localStorage.getItem("guestId");
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem("guestId", id);
  }
  return id;
}

export default function CustomerChatBot() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const guestId = useMemo(() => getOrCreateGuestId(), []);

  const chatId = useMemo(() => {
    return userId ? `chat_${userId}` : `chat_${guestId}`;
  }, [userId, guestId]);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([]);
  const listRef = useRef(null);

  const loadHistory = async () => {
    try {
      const res = await API.get(`/chatbot/${chatId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setMsgs(res.data?.messages || []);
    } catch (e) {
      console.error("chatbot loadHistory:", e);
      setMsgs([]);
    }
  };

  const send = async () => {
    const t = text.trim();
    if (!t) return;

    setText("");
    setMsgs((p) => [...p, { by: "user", text: t }]);

    try {
      const res = await API.post(
        `/chatbot/${chatId}`,
        { text: t },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      setMsgs(res.data?.messages || []);
    } catch (e) {
      console.error("chatbot send:", e);
    }
  };

  useEffect(() => {
    if (open) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, 60);
  }, [msgs, open]);

  return createPortal(
    <div className="fixed bottom-5 left-5 z-[999999]">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition flex items-center justify-center"
          title="Chat Bot"
        >
          🤖
        </button>
      )}

      {open && (
        <div className="w-[320px] sm:w-[360px] h-[520px] rounded-3xl overflow-hidden border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] text-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/25">
            <div className="font-semibold">Chat Bot</div>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 transition"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="h-[400px] overflow-y-auto p-4 space-y-3">
            {msgs.length === 0 && (
              <div className="text-sm text-white/70">
                Hi 👋 Ask: order, shipping, return, payment, contact
              </div>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.by === "user" ? "ml-auto bg-indigo-600/80" : "bg-black/25"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-white/10 bg-black/15">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type..."
                className="flex-1 px-4 py-2 rounded-2xl bg-black/25 border border-white/10 outline-none"
              />
              <button
                onClick={send}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
