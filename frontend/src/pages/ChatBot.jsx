import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import { Send, Bot, User, Upload, X } from "lucide-react";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to KrishiMitra AI Assistant! You can ask me about crops, weather, soil, or even upload a leaf photo to check for pests.",
    },
  ]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && images.length === 0) return;

    const newMessage = {
      sender: "user",
      text: input,
      images: images.map((img) => URL.createObjectURL(img)),
    };

    setMessages([...messages, newMessage]);
    setInput("");
    setImages([]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            newMessage.images.length > 0
              ? "🧐 Analyzing your leaf photos... Possible pest detected. Suggested pesticide: Neem Oil Spray."
              : "✅ Got it! Let me help you with that.",
        },
      ]);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      alert("You can upload a maximum of 3 images.");
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Keep Header same style as Dashboard */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-4 lg:p-6">
          <Header />
        </div>

        {/* Chat container unchanged from your original code */}
        <main className="container mx-auto flex-1 flex flex-col p-4 lg:p-6">
          <div className="flex flex-col flex-1 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <h1 className="text-3xl font-bold text-white p-4 border-b border-white/20">
              KrishiMitra AI Assistant
            </h1>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="bg-green-600 text-white p-3 rounded-2xl shadow-md max-w-[70%] flex items-start gap-2">
                      <Bot className="w-5 h-5 mt-1" />
                      <p>{msg.text}</p>
                    </div>
                  )}
                  {msg.sender === "user" && (
                    <div className="bg-white text-green-900 p-3 rounded-2xl shadow-md max-w-[70%] flex flex-col items-start gap-2">
                      {msg.text && <p>{msg.text}</p>}
                      {msg.images &&
                        msg.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Uploaded Leaf"
                            className="rounded-lg w-40 border border-green-300"
                          />
                        ))}
                      <User className="w-5 h-5 mt-1 text-green-800 self-end" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {/* Input Area */}
            <div className="p-3 sm:p-4 border-t border-white/20 bg-white/5 space-y-2">
              {images.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0">
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-green-300"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input row - responsive */}
              <div className="flex flex-wrap gap-2">
                {/* Upload */}
                <label className="cursor-pointer bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                {/* Input box */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-white text-green-900 placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[150px]"
                />

                {/* Send */}
                <button
                  onClick={handleSend}
                  className="px-3 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatBot;
