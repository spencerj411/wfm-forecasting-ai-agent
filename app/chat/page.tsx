"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send, Sparkles, Mic } from "lucide-react"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

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
  }, [messages])

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
    <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 pt-32 overflow-x-hidden">
      <div className="mb-8 sm:mb-12 lg:mb-16 space-y-4 sm:space-y-6 lg:space-y-8 text-left animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">Chat Insights</h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 font-light max-w-4xl">
          Ask natural language questions about your forecasts and get intelligent insights from our AI assistant.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Sample Questions */}
        <div className="animate-fade-in-delay-1">
          <Card className="bg-blue-50/40 backdrop-blur-md border-0 card-rounded shadow-xl border border-blue-600/10">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Try asking:</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuestion(question)}
                      className="text-left p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 hover:scale-[1.02] min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      aria-label={`Ask: ${question}`}
                    >
                      <p className="text-sm sm:text-base text-gray-700 font-medium">"{question}"</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages Container */}
        <div className="animate-fade-in">
          <Card className="bg-white/90 backdrop-blur-md border-0 card-rounded shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div
                ref={chatContainerRef}
                className="h-96 sm:h-[28rem] overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth"
                role="region"
                aria-label="Chat conversation"
                aria-live="polite"
              >
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-[20px] rounded-br-[8px]"
                          : "bg-gray-100 text-gray-900 rounded-[20px] rounded-bl-[8px]"
                      } px-4 py-3 shadow-sm relative group`}
                      role="article"
                      aria-label={`${message.sender === "user" ? "Your message" : "AI assistant message"}`}
                    >
                      {message.sender === "ai" && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-5 h-5 bg-blue-600/10 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-3 w-3 text-blue-600" strokeWidth={1.5} />
                          </div>
                          <span className="text-xs font-semibold text-blue-600">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm sm:text-base leading-relaxed mb-1">{message.content}</p>
                      <div
                        className={`text-xs opacity-70 text-right ${
                          message.sender === "user" ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-gray-100 text-gray-900 rounded-[20px] rounded-bl-[8px] px-4 py-3 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-blue-600/10 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-3 w-3 text-blue-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex space-x-1">
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
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Area */}
        <div className="animate-fade-in-delay-2 sticky bottom-4 sm:bottom-6">
          <Card className="bg-white/95 backdrop-blur-md border-0 card-rounded shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-end space-x-3 sm:space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your forecasts..."
                    className="w-full p-4 pr-12 text-base border-2 border-gray-200 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all duration-300 bg-white resize-none min-h-[48px]"
                    aria-label="Type your message"
                    disabled={isLoading}
                  />
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-full hover:bg-blue-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Voice input"
                    title="Voice input (coming soon)"
                  >
                    <Mic className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="btn-gradient min-w-[48px] min-h-[48px] p-3 disabled:opacity-50 disabled:cursor-not-allowed border-0 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-[1.02]"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
