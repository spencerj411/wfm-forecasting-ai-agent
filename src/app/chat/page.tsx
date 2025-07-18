"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send, Sparkles } from "lucide-react"

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 pt-32 overflow-x-hidden">
      <div className="mb-12 sm:mb-16 lg:mb-24 space-y-6 sm:space-y-8 lg:space-y-12 text-left animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">Chat Insights</h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 font-light max-w-4xl">
          Ask natural language questions about your forecasts and get intelligent insights from our AI assistant.
        </p>
      </div>

      <div className="space-y-8 sm:space-y-12">
        {/* Sample Questions */}
        <div className="animate-fade-in-delay-1">
          <Card className="bg-blue-50/40 backdrop-blur-md border-0 card-rounded shadow-xl scale-hover border border-blue-600/10">
            <CardContent className="p-8 sm:p-12">
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Try asking:</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuestion(question)}
                      className="text-left p-4 sm:p-6 bg-white/80 backdrop-blur-sm card-rounded border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-500 scale-hover"
                    >
                      <p className="text-base sm:text-lg text-gray-700 font-medium">"{question}"</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="animate-fade-in">
          <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl">
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto p-8 sm:p-12 space-y-6 sm:space-y-8">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md lg:max-w-lg p-4 sm:p-6 card-rounded shadow-sm ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-100"
                      }`}
                    >
                      <div className="space-y-2">
                        {message.sender === "ai" && (
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 bg-blue-600/10 rounded-full flex items-center justify-center">
                              <MessageCircle className="h-3 w-3 text-blue-600" strokeWidth={1.5} />
                            </div>
                            <span className="text-sm font-semibold text-blue-600">AI Assistant</span>
                          </div>
                        )}
                        <p
                          className={`text-base sm:text-lg leading-relaxed ${
                            message.sender === "user" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {message.content}
                        </p>
                        <p
                          className={`text-xs sm:text-sm ${
                            message.sender === "user" ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs sm:max-w-md p-4 sm:p-6 bg-white border border-gray-100 card-rounded shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-600/10 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-3 w-3 text-blue-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Area */}
        <div className="animate-fade-in-delay-2">
          <Card className="bg-white/90 backdrop-blur-md border-0 card-rounded shadow-xl scale-hover">
            <CardContent className="p-6 sm:p-8">
              <div className="flex space-x-4 sm:space-x-6">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your forecasts..."
                  className="flex-1 p-4 sm:p-6 text-base sm:text-lg border-2 border-gray-200 card-rounded focus:border-blue-600 focus:outline-none transition-all duration-500 bg-white/80 backdrop-blur-sm focus:shadow-lg focus:shadow-blue-600/10"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="btn-primary text-white px-8 py-4 text-base sm:text-lg font-bold shadow-xl border-0 flex items-center space-x-3 disabled:opacity-50 scale-hover"
                >
                  <Send className="h-5 w-5" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
