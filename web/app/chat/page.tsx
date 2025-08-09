"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowUp, Brain, Users, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  agentUsed?: "analyst" | "rostering"
  agentsInvolved?: Array<{
    agentId: "analyst" | "rostering"
    role: "primary" | "consulted"
  }>
  isWelcome?: boolean
}

// Define available agents with their introductions
const AVAILABLE_AGENTS = [
  {
    id: "analyst",
    name: "Business Analyst Agent",
    icon: "Brain",
    introduction: "Hi! I'm your Business Analyst Agent 👋 I specialize in analyzing your sales data, identifying trends, and providing forecasting insights. Ask me about patterns in your data, forecast accuracy, or business implications of your predictions!"
  },
  {
    id: "rostering", 
    name: "Rostering Agent",
    icon: "Users",
    introduction: "Hey there! I'm the Rostering Agent 🏢 I handle all your staffing calculations and workforce planning. I can help you determine optimal staff levels, calculate costs, and plan for different scenarios based on your forecasts."
  }
]

// Helper function to get agent configuration
const getAgentConfig = (agentId: string) => {
  return AVAILABLE_AGENTS.find(agent => agent.id === agentId)
}

// Helper function to get agent icon component
const getAgentIcon = (iconName: string) => {
  switch (iconName) {
    case 'Brain':
      return Brain
    case 'Users':
      return Users
    default:
      return Brain
  }
}

// Helper function to get agent colors
const getAgentColors = (agentId: string) => {
  switch (agentId) {
    case 'analyst':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' }
    case 'rostering':
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  }
}

const generateWelcomeMessage = (): string => {
  const agentIntros = AVAILABLE_AGENTS.map(agent => 
    `**${agent.name}**: ${agent.introduction}`
  ).join('\n\n')
  
  return `**Welcome to your AI Workforce Management team!**

I have specialized agents ready to help you:

${agentIntros}

**How it works:** Just ask your question naturally, and I'll connect you with the right specialist automatically. What would you like to know?`
}

// Dynamic agent indicator component
const AgentIndicator = ({ message }: { message: Message }) => {
  if (message.sender !== "ai" || (!message.agentUsed && !message.agentsInvolved)) {
    return null
  }

  // Handle multiple agents (new format)
  if (message.agentsInvolved && message.agentsInvolved.length > 0) {
    const primaryAgent = message.agentsInvolved.find(a => a.role === 'primary')
    const consultedAgents = message.agentsInvolved.filter(a => a.role === 'consulted')
    
    return (
      <div className="mb-1 ml-2 space-y-1">
        {/* Primary agent */}
        {primaryAgent && (
          <div className="flex items-center gap-1.5">
            {(() => {
              const config = getAgentConfig(primaryAgent.agentId)
              const colors = getAgentColors(primaryAgent.agentId)
              const IconComponent = config ? getAgentIcon(config.icon) : Brain
              
              return (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold shadow-sm",
                  colors.bg, colors.text
                )}>
                  <IconComponent className="h-4 w-4" />
                  <span>{config?.name ? `${config.name}${config.name.includes('Agent') ? '' : ' Agent'}` : 'Unknown Agent'}</span>
                </div>
              )
            })()}
          </div>
        )}
        
        {/* Consulted agents - inline with label */}
        {consultedAgents.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Consulted:</span>
            {consultedAgents.map((agent) => {
              const config = getAgentConfig(agent.agentId)
              const colors = getAgentColors(agent.agentId)
              const IconComponent = config ? getAgentIcon(config.icon) : Brain
              
              return (
                <div
                  key={agent.agentId}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border",
                    colors.bg, colors.text, colors.border
                  )}
                >
                  <IconComponent className="h-2.5 w-2.5" />
                  <span>{config?.name ? `${config.name}${config.name.includes('Agent') ? '' : ' Agent'}` : 'Unknown Agent'}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
  
  // Handle single agent (legacy format)
  if (message.agentUsed) {
    const config = getAgentConfig(message.agentUsed)
    const colors = getAgentColors(message.agentUsed)
    const IconComponent = config ? getAgentIcon(config.icon) : Brain
    
    return (
      <div className="mb-1 ml-2">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold shadow-sm",
          colors.bg, colors.text
        )}>
          <IconComponent className="h-4 w-4" />
          <span>{config?.name ? `${config.name}${config.name.includes('Agent') ? '' : ' Agent'}` : 'Unknown Agent'}</span>
        </div>
      </div>
    )
  }
  
  return null
}

// Animation component that ensures immediate animation start
const AnimatedMessage = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Use requestAnimationFrame to ensure the element is in DOM before animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])
  
  return (
    <div 
      className={cn(className, isVisible ? 'animate-fade-in' : 'opacity-0')}
    >
      {children}
    </div>
  )
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitializing, setIsInitializing] = useState(true)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState("")
  const [sessionId, setSessionId] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Chat limits
  const MAX_INPUT_LENGTH = 200
  const MAX_MESSAGES_PER_SESSION = 10

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  // Prevent page scrolling on chat page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  // Chat history persistence functions
  const getChatHistoryKey = useCallback(() => `chat_history_${user?.id}`, [user?.id])
  
  const saveChatHistory = useCallback((messagesToSave: Message[]) => {
    if (!user) return
    try {
      const historyData = {
        messages: messagesToSave,
        timestamp: new Date().toISOString(),
        sessionId: sessionId
      }
      localStorage.setItem(getChatHistoryKey(), JSON.stringify(historyData))
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }, [user, sessionId, getChatHistoryKey])

  const loadChatHistory = useCallback(() => {
    if (!user) return null
    try {
      const saved = localStorage.getItem(getChatHistoryKey())
      if (saved) {
        const historyData = JSON.parse(saved)
        // Convert timestamp strings back to Date objects
        if (historyData.messages) {
          historyData.messages = historyData.messages.map((msg: Record<string, unknown>) => ({
            ...msg,
            timestamp: new Date(msg.timestamp as string)
          }))
        }
        return historyData
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
    return null
  }, [user, getChatHistoryKey])

  const clearChatHistory = useCallback(() => {
    if (!user) return
    try {
      localStorage.removeItem(getChatHistoryKey())
    } catch (error) {
      console.error('Failed to clear chat history:', error)
    }
  }, [getChatHistoryKey, user])

  // Load chat history on component mount
  useEffect(() => {
    if (user && !historyLoaded) {
      const savedHistory = loadChatHistory()
      if (savedHistory && savedHistory.messages && savedHistory.messages.length > 0) {
        console.log(`Loaded ${savedHistory.messages.length} messages from chat history`)
        setMessages(savedHistory.messages)
        if (savedHistory.sessionId) {
          setSessionId(savedHistory.sessionId)
        }
        setIsInitializing(false) // Skip welcome message if we have history
      }
      setHistoryLoaded(true)
    }
  }, [user, historyLoaded, loadChatHistory])

  // Save chat history whenever messages change
  useEffect(() => {
    if (user && historyLoaded && messages.length > 0) {
      saveChatHistory(messages)
    }
  }, [messages, user, historyLoaded, saveChatHistory])

  // Show welcome message only if no chat history
  useEffect(() => {
    if (user && isInitializing && historyLoaded) {
      // Only show welcome message if we don't have existing messages
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: "welcome-intro",
          content: generateWelcomeMessage(),
          sender: "ai",
          timestamp: new Date(),
          isWelcome: true, // Mark as welcome message
        }
        setMessages([welcomeMessage])
      }
      setIsInitializing(false)
    }
  }, [user, isInitializing, historyLoaded, messages.length])

  useEffect(() => {
    if (messages.length > 1 || isLoading) {
      scrollToBottom()
    }
  }, [messages, isLoading])

  if (loading || !user) {
    return null
  }

  const sampleQuestions = [
    "What's the forecast for tomorrow?",
    "How many staff do I need for Friday?",
    "What trends do you see in my data?", 
    "Should I add more staff this weekend?",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getUserMessageCount = () => {
    return messages.filter(m => m.sender === 'user' && !m.isWelcome).length
  }
  
  const getRemainingMessages = () => {
    return Math.max(0, MAX_MESSAGES_PER_SESSION - getUserMessageCount())
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_INPUT_LENGTH) {
      setInputValue(value)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    // Check message limit
    if (getUserMessageCount() >= MAX_MESSAGES_PER_SESSION) {
      alert(`You've reached the maximum of ${MAX_MESSAGES_PER_SESSION} messages per session. Please clear the chat to continue.`)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)
    setThinkingMessage("Thinking...")

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Update session ID if returned
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
        agentUsed: data.agentUsed,
        agentsInvolved: data.agentsInvolved,
      }
      
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setThinkingMessage("")
    }
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

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      setMessages([])
      clearChatHistory()
      setSessionId(undefined)
      setIsInitializing(true)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-screen bg-white animate-fade-in fixed inset-0">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 px-6 sm:px-8 lg:px-12 py-4 border-b border-gray-100 pt-28 sm:pt-32 bg-white">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Chat Insights</h1>
            <p className="text-lg text-gray-600 font-light mt-1">Your AI-powered forecasting assistant.</p>
          </div>
          {messages.length > 1 && (
            <Button
              onClick={handleClearChat}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </div>
      </header>

      {/* Chat History - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden chat-messages-scroll" 
        role="log" 
        aria-live="polite"
      >
        <div className="max-w-4xl mx-auto space-y-4 p-6 sm:p-8 lg:px-12 pb-4">
          {messages.filter(Boolean).map((message) => 
            message.isWelcome ? (
              // Welcome message - no animation, just appears with page
              <div
                key={message.id}
                className={cn(
                  "flex flex-col",
                  message.sender === "user" ? "items-end" : "items-start",
                )}
              >
                <AgentIndicator message={message} />
                
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
                  <div 
                    className="text-base leading-relaxed break-words prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline transition-colors">$1</a>')
                        .replace(/^• (.*$)/gim, '<li>$1</li>')
                        .replace(/(<li>.*<\/li>)/gm, '<ul>$1</ul>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
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
            ) : (
              // Regular messages - with animation
              <AnimatedMessage
                key={message.id}
                className={cn(
                  "flex flex-col",
                  message.sender === "user" ? "items-end" : "items-start",
                )}
              >
                <AgentIndicator message={message} />
                
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
                  <div 
                    className="text-base leading-relaxed break-words prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline transition-colors">$1</a>')
                        .replace(/^• (.*$)/gim, '<li>$1</li>')
                        .replace(/(<li>.*<\/li>)/gm, '<ul>$1</ul>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                  <p
                    className={cn(
                      "text-xs mt-1 text-right transition-colors",
                      message.sender === "user" ? "text-blue-100/70" : "text-gray-500/70",
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </AnimatedMessage>
            )
          )}

          {isLoading && (
            <AnimatedMessage className="flex items-end gap-2 justify-start">
              <div className="bg-gray-100 rounded-3xl rounded-bl-lg p-3 px-4 shadow-sm">
                {thinkingMessage && (
                  <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                    <Brain className="h-3 w-3 animate-pulse" />
                    <span>{thinkingMessage}</span>
                  </div>
                )}
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
            </AnimatedMessage>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed */}
      <footer className="flex-shrink-0 px-4 sm:px-6 lg:px-12 py-3 sm:py-4 bg-white/95 backdrop-blur-md border-t border-gray-100 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto">
          {/* Suggestions - Hide on mobile when input is focused */}
          <div className="mb-3 flex flex-wrap gap-2 justify-center items-center">
            <Sparkles className="h-4 w-4 text-gray-500 flex-shrink-0" />
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuestion(question)}
                className="text-xs text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors hidden sm:block"
              >
                {question}
              </button>
            ))}
            {/* Show first question on mobile */}
            <button
              onClick={() => handleSampleQuestion(sampleQuestions[0])}
              className="text-xs text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors sm:hidden"
            >
              {sampleQuestions[0]}
            </button>
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
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about your forecasts... (${inputValue.length}/${MAX_INPUT_LENGTH})`}
              className="w-full px-4 py-2 text-base border-none focus:ring-0 bg-transparent flex-1 min-h-[2.5rem]"
              aria-label="Type your message"
              disabled={isLoading}
              autoComplete="off"
              autoCapitalize="sentences"
              autoCorrect="on"
            />
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end text-xs text-gray-500">
                <span className={cn(
                  "whitespace-nowrap",
                  inputValue.length > MAX_INPUT_LENGTH * 0.8 && "text-orange-500",
                  inputValue.length >= MAX_INPUT_LENGTH && "text-red-500"
                )}>
                  {inputValue.length}/{MAX_INPUT_LENGTH}
                </span>
                <span className="whitespace-nowrap">
                  {getRemainingMessages()}/{MAX_MESSAGES_PER_SESSION} msgs
                </span>
              </div>
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading || getUserMessageCount() >= MAX_MESSAGES_PER_SESSION}
                variant="gradient"
                size="icon"
                className="rounded-full w-10 h-10 flex-shrink-0"
                aria-label="Send message"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  )
}
