"use client";

import { useState } from "react";
import { Button, Input, Card } from "antd";
import { MessageCircle, X, Send } from "lucide-react";
import { studentChatAction } from "@/app/actions/student/chatbot";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: "أهلاً بك! أنا مرشدك الأكاديمي الافتراضي. كيف يمكنني مساعدتك في دراستك اليوم؟" }
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage("");
    setHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const res = await studentChatAction(userMsg, history.slice(1)); // exclude welcome msg if needed, or pass all
    if (res.success) {
      setHistory(prev => [...prev, { role: "assistant", content: res.reply ?? "تمت المعالجة" }]);
    } else {
      setHistory(prev => [...prev, { role: "assistant", content: res.message ?? "حدث خطأ، يرجى المحاولة مجدداً" }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen ? (
        <Card 
          className="w-80 shadow-2xl border border-indigo-100 rounded-3xl overflow-hidden flex flex-col"
          styles={{ body: { padding: 0, display: "flex", flexDirection: "column", height: "400px" } }}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
            <div className="font-bold flex items-center gap-2">
              <MessageCircle size={18} /> المرشد الذكي
            </div>
            <Button type="text" icon={<X size={18} color="white" />} onClick={() => setIsOpen(false)} className="hover:bg-white/20" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm text-sm text-slate-500 animate-pulse">
                  المرشد يكتب...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <Input 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              onPressEnter={handleSend}
              placeholder="اكتب استفسارك..." 
              className="rounded-xl border-slate-200"
            />
            <Button 
              type="primary" 
              icon={<Send size={16} />} 
              onClick={handleSend}
              loading={loading}
              style={{ background: "#4f46e5", borderColor: "#4f46e5", borderRadius: 12 }}
            />
          </div>
        </Card>
      ) : (
        <Button 
          type="primary" 
          size="large" 
          shape="circle" 
          icon={<MessageCircle size={28} />} 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 shadow-xl flex items-center justify-center animate-bounce"
          style={{ background: "linear-gradient(135deg, #4f46e5, #9333ea)", border: "none" }}
        />
      )}
    </div>
  );
}
