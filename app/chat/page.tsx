"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI forecasting assistant. I can help you understand your demand forecasts, analyze trends, and provide insights. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sampleQuestions = [
    "What's the forecast for July 23rd?",
    "Which day has the highest predicted sales?",
    "How confident are the forecasts?",
    "What trends do you see in the data?",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${userMessage.content}". Based on your forecast data, I can provide detailed insights. This is a simulated response - the full AI integration is coming soon!`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSampleQuestion = (question: string) => {
    setInputValue(question)
    document.getElementById("chat-input")?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-svh bg-white">
      {/* Header */}
      <header className="px-6 sm:px-8 lg:px-12 py-4 border-b border-gray-100 pt-28 sm:pt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Chat Insights</h1>
          <p className="text-lg text-gray-600 font-light mt-1">Your AI-powered forecasting assistant.</p>
        </div>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:px-12 space-y-4" role="log" aria-live="polite">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-2 animate-bubble-in",
                message.sender === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] sm:max-w-[70%] p-3 px-4 shadow-sm transition-all",
                  message.sender === "user"
                    ? "bg-imessage-blue text-white rounded-3xl rounded-br-lg"
                    : "bg-gray-100 text-gray-900 rounded-3xl rounded-bl-lg",
                )}
                role="article"
                aria-label={`${message.sender === "user" ? "Your message" : "AI assistant message"}`}
              >
                <p className="text-base leading-relaxed break-words">{message.content}</p>
                <p
                  className={cn(
                    "text-xs mt-1 text-right transition-colors",
                    message.sender === "user" ? "text-blue-100/70" : "text-gray-500/70",
                  )}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-2 justify-start animate-bubble-in">
              <div className="bg-gray-100 rounded-3xl rounded-bl-lg p-3 px-4 shadow-sm">
                <div className="flex items-center justify-center space-x-1 h-5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <footer className="px-6 sm:px-8 lg:px-12 py-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          {/* Suggestions */}
          <div className="mb-3 flex flex-wrap gap-2 justify-center items-center">
            <Sparkles className="h-4 w-4 text-gray-500 flex-shrink-0" />
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuestion(question)}
                className="text-xs text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center bg-gray-100 rounded-full p-2"
          >
            <input
              id="chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your forecasts..."
              className="w-full px-4 py-2 text-base border-none focus:ring-0 bg-transparent flex-1"
              aria-label="Type your message"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              variant="gradient"
              size="icon"
              className="rounded-full w-10 h-10 flex-shrink-0"
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  )
}
