"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/app/redux/hooks";
import { socket } from "@/realtime/socket";
import {
  MessageSquare,
  Send,
  Minimize2,
  User,
  ShieldCheck,
  Sparkles,
  Bot,
} from "lucide-react";
import { IBooking, IChatMessage } from "@/app/types";
import { realtimeApi } from "@/app/axios/realtimeApi";

interface RideChatWidgetProps {
  bookingId: string;
  receiverName: string | undefined;
  booking: IBooking;
}

export const RideChatWidget = ({
  bookingId,
  receiverName,
  booking,
}: RideChatWidgetProps) => {
  const { loggedUser } = useAppSelector((store) => store.user);
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messagesList, setMessagesList] = useState<IChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const receiverId =
    loggedUser?.role === "user" ? booking.driverId : booking.userId;

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsResponseLoading, setSuggestionsResponseLoading] =
    useState<boolean>(false);

  // 1. Auto Scroll to Bottom on New Messages
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messagesList, isOpen]);

  useEffect(() => {
    socket.on("RECEIVE_MESSAGE", (message) => {
      setMessagesList((prev) => [...prev, message]);
    });

    return () => {
      socket.off("RECEIVE_MESSAGE");
    };
  }, []);

  // 3. Dispatch Message Event Pipeline
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !loggedUser) return;

    const messageData: IChatMessage = {
      bookingId: booking._id,
      receiverId,
      senderId: loggedUser._id,
      text: messageText.trim(),
      role: loggedUser.role as "partner" | "user",
      createdAt: new Date(),
    };

    setMessagesList((prev) => [...prev, messageData]);

    socket.emit("SEND_MESSAGE", {
      bookingId: booking._id,
      receiverId,
      message: messageData,
    });

    setMessageText("");
  };

  useEffect(() => {
    if (messagesList.length === 0) return;

    const fetchSuggestions = async () => {
      setSuggestionsResponseLoading(true);
      try {
        const { data } = await realtimeApi.post("/chat/ai-suggestions", {
          role: loggedUser?.role,
          messages: messagesList.slice(-10),
        });
        if (data.success) {
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSuggestionsResponseLoading(false);
      }
    };

    fetchSuggestions();
  }, [loggedUser?.role, messagesList]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await realtimeApi.get(`/messages/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (data.success) {
          setMessagesList(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [bookingId]);

  // Helper utility to safely format database ISO timestamps to local time parameters
  const formatMessageTime = (createdAtInput?: Date | string) => {
    if (!createdAtInput) return "";
    return new Date(createdAtInput).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!loggedUser) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans selection:bg-blue-500/20">
      {/* Custom Styles Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hud-chat-scroll::-webkit-scrollbar {
          width: 2px;
        }
        .hud-chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .hud-chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 99px;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `,
        }}
      />

      <AnimatePresence mode="wait">
        {/* --- 📦 CLOSED FLOATING BUBBLE BUTTON --- */}
        {!isOpen && (
          <motion.button
            layoutId="hud-chat-viewport"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-white shadow-[0_0_40px_rgba(59,130,246,0.25)] backdrop-blur-xl relative group "
          >
            {/* Ambient Background Light Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-blue-600/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
            <MessageSquare
              size={18}
              className="text-blue-400 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xs font-bold tracking-wider text-slate-200">
              Trip Chat
            </span>

            {messagesList.length > 0 && (
              <span className="absolute  -top-2 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-rose-500 text-[10px] font-black font-mono text-white flex items-center justify-center rounded-full border-2 border-slate-950 shadow-lg shadow-red-500/40">
                {messagesList.length}
              </span>
            )}
          </motion.button>
        )}

        {/* --- 💬 MAXIMIZED CYBER COMMAND CAPSULE WINDOW --- */}
        {isOpen && (
          <motion.div
            layoutId="hud-chat-viewport"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="w-[90vw] sm:w-[380px] h-[520px] rounded-[32px] border border-white/10 bg-slate-950/80 text-white shadow-[0_30px_80px_rgba(0,0,0,0.8)] flex flex-col backdrop-blur-3xl overflow-hidden relative"
          >
            {/* Ambient HUD Glow Layer */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Premium Header Layout */}
            <div className="p-4 pt-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-100">
                      {receiverName || "Platform Node"}
                    </h4>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 tracking-wide">
                    <ShieldCheck size={12} className="text-emerald-500" />{" "}
                    Encrypted Link Active
                  </p>
                </div>
              </div>

              {/* Minimize Action Anchor */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 shadow-sm"
              >
                <Minimize2 size={14} />
              </button>
            </div>

            {/* Messaging Feed Scroll View Block */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 hud-chat-scroll bg-gradient-to-b from-transparent via-slate-950/10 to-slate-950/40 relative z-10">
              {messagesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400/80 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Sparkles size={24} />
                  </div>
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Connection Established
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-[240px]">
                    Trip coordination is securely active. Send a message below
                    to sync with the peer terminal.
                  </p>
                </div>
              ) : (
                messagesList.map((msg, idx) => {
                  const isMe = msg.senderId === loggedUser._id;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 text-xs font-medium leading-relaxed break-words shadow-md transition-all ${
                          isMe
                            ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-[20px_20px_4px_20px] shadow-blue-500/20"
                            : "bg-white/[0.04] border border-white/5 text-slate-200 rounded-[20px_20px_20px_4px]"
                        }`}
                      >
                        <p className="tracking-wide">{msg.text}</p>

                        <span
                          className={`block text-[9px] mt-1 text-right font-mono tracking-tighter ${
                            isMe ? "text-blue-100/70" : "text-slate-500"
                          }`}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* AI Suggestions Action Dock */}
            {suggestionsResponseLoading ? (
              <div className="px-4 py-2 bg-slate-950/60 border-t border-white/5 flex items-center gap-2 shrink-0">
                <Bot size={12} className="text-blue-400 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase animate-pulse">
                  Computing AI Vectors...
                </span>
              </div>
            ) : (
              suggestions.length > 0 && (
                <div className="px-3 pt-3 pb-2 flex gap-2 overflow-x-auto hide-scrollbar bg-slate-950/60 border-t border-white/5 shrink-0">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setMessageText(suggestion)}
                      className="
                        whitespace-nowrap
                        px-3.5
                        py-1.5
                        rounded-full
                        text-[11px]
                        font-bold
                        bg-blue-500/10
                        border
                        border-blue-500/20
                        text-blue-400
                        hover:bg-blue-500/20
                        hover:border-blue-500/40
                        transition-all
                        shadow-sm
                        flex items-center gap-1.5
                      "
                    >
                      <Sparkles size={10} className="opacity-70" /> {suggestion}
                    </button>
                  ))}
                </div>
              )
            )}

            {/* Input Submission Footer Form block */}
            <form
              onSubmit={handleSendMessage}
              className={`p-3 bg-slate-950/80 border-t border-white/5 flex items-center gap-2 shrink-0 relative z-10 ${suggestions.length === 0 ? "border-t border-white/5" : ""}`}
            >
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter telemetry transmission..."
                  className="w-full bg-white/[0.03] focus:bg-white/[0.05] border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all duration-300 font-medium"
                />

                {/* Embedded Send Icon Button */}
                <motion.button
                  type="submit"
                  disabled={!messageText.trim()}
                  whileHover={messageText.trim() ? { scale: 1.05 } : {}}
                  whileTap={messageText.trim() ? { scale: 0.95 } : {}}
                  className="absolute right-2 p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none hover:bg-blue-600 hover:text-white shrink-0 flex items-center justify-center shadow-lg"
                >
                  <Send size={14} className="relative left-[1px]" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
