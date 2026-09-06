import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, LoaderCircle } from "lucide-react";
import { api } from "../api";

export default function ChatAI() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Assalamualaikum..! Saya Asisten AI TPQ Khairunnisa. Ada yang bisa saya bantu?",
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = message.trim();

    if (!text || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: text,
      });

      if (response.data?.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: response.data.message,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text:
              response.data?.message ||
              "Maaf, AI tidak dapat memberikan jawaban saat ini.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat AI Error:", error);

      let errorMessage =
        "Maaf, terjadi gangguan saat menghubungi AI. Silakan coba lagi.";

      if (error.response?.status === 503) {
        errorMessage =
          "AI sedang ramai. Silakan tunggu beberapa saat lalu coba lagi.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* TOMBOL FLOATING AI */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka Asisten AI"
          title="Asisten AI"
          className="
            fixed
            right-5
            bottom-5
            z-[9999]
            w-14
            h-14
            rounded-full
            flex
            items-center
            justify-center
            bg-green-600
            text-white
            shadow-[0_8px_30px_rgba(0,0,0,0.25)]
            border-2
            border-white
            hover:bg-green-700
            hover:scale-105
            transition-all
            duration-200
          "
        >
          <Bot size={27} strokeWidth={1.8} />
        </button>
      )}

      {/* WINDOW CHAT */}
      {open && (
        <div
          className="
            fixed
            right-5
            bottom-5
            z-[9999]
            w-[calc(100vw-2.5rem)]
            max-w-[390px]
            h-[min(600px,calc(100vh-2.5rem))]
            rounded-3xl
            overflow-hidden
            bg-white/80
            backdrop-blur-2xl
            border
            border-white/80
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            flex
            flex-col
          "
        >
          {/* HEADER */}
          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-4
              bg-green-600/95
              text-white
              shrink-0
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-white/20
                  border
                  border-white/30
                  flex
                  items-center
                  justify-center
                "
              >
                <Bot size={22} strokeWidth={1.8} />
              </div>

              <div>
                <h3 className="font-semibold text-sm">Asisten AI</h3>

                <p className="text-[11px] text-green-100">TPQ Khairunnisa</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup Chat AI"
              title="Tutup"
              className="
                w-9
                h-9
                rounded-full
                flex
                items-center
                justify-center
                hover:bg-white/20
                transition
              "
            >
              <X size={21} />
            </button>
          </div>

          {/* PESAN */}
          <div
            className="
              flex-1
              overflow-y-auto
              px-4
              py-4
              space-y-3
              bg-white/45
            "
          >
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[82%]
                    px-4
                    py-3
                    rounded-2xl
                    text-sm
                    leading-relaxed
                    whitespace-pre-wrap
                    break-words
                    ${
                      item.role === "user"
                        ? "bg-green-600 text-white rounded-br-md"
                        : "bg-white/90 text-gray-700 border border-gray-100 shadow-sm rounded-bl-md"
                    }
                  `}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {/* AI SEDANG MENJAWAB */}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="
                    bg-white/90
                    border
                    border-gray-100
                    shadow-sm
                    px-4
                    py-3
                    rounded-2xl
                    rounded-bl-md
                    flex
                    items-center
                    gap-2
                    text-gray-500
                    text-sm
                  "
                >
                  <LoaderCircle size={16} className="animate-spin" />

                  <span>AI sedang mengetik...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div
            className="
              shrink-0
              p-3
              bg-white/75
              backdrop-blur-xl
              border-t
              border-white/80
            "
          >
            <div
              className="
                flex
                items-end
                gap-2
                bg-white
                rounded-2xl
                border
                border-gray-200
                shadow-sm
                p-2
                focus-within:border-green-500
                focus-within:ring-2
                focus-within:ring-green-100
                transition
              "
            >
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pertanyaan..."
                rows={1}
                disabled={loading}
                className="
                  flex-1
                  resize-none
                  border-0
                  outline-none
                  bg-transparent
                  text-sm
                  text-gray-700
                  placeholder-gray-400
                  px-2
                  py-2
                  max-h-24
                  disabled:opacity-50
                "
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={!message.trim() || loading}
                aria-label="Kirim pesan"
                title="Kirim"
                className="
                  w-10
                  h-10
                  shrink-0
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-green-600
                  text-white
                  hover:bg-green-700
                  disabled:bg-gray-300
                  disabled:cursor-not-allowed
                  transition
                "
              >
                <Send size={18} strokeWidth={2} />
              </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-2">
              Tekan Enter untuk mengirim
            </p>
          </div>
        </div>
      )}
    </>
  );
}
