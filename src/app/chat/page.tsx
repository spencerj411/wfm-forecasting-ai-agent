"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function ChatPage() {
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

  const sampleQuestions = [
    "What's the forecast for July 23rd?",
    "Which day has the highest predicted sales?",
    "How confident are the forecasts?",
    "What trends do you see in the data?",
  ]

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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${inputValue}". Based on your forecast data, I can provide detailed insights. This is a simulated response - the full AI integration is coming soon!`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSampleQuestion = (question: string) => {
    setInputValue(question)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-40 pt-28 overflow-x-hidden">
      <div className="text-center space-y-8 sm:space-y-12 lg:space-y-16">
        <div className="animate-fade-in">
          <div className="mx-auto max-w-md bg-blue-50/80 backdrop-blur-md rounded-xl p-8 sm:p-12 lg:p-16 shadow-xl border border-blue-100/50 hover:scale-102 hover:shadow-2xl hover:rotate-1 transition-all duration-300 ease-out">
            <div className="space-y-6 sm:space-y-8">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/10 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 opacity-90" strokeWidth={1} />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                  Chat Insights Coming Soon
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light max-w-sm mx-auto">
                  Analyse forecasts with natural questions and get intelligent insights from our AI assistant.
                </p>
              </div>
              <div className="pt-2">
                <div className="inline-flex items-center space-x-2 text-sm text-blue-600 font-medium">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Feature launching soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
