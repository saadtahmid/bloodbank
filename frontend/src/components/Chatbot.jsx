/* filepath: d:\BloodBank\frontend\src\components\Chatbot.jsx */
import React, { useState, useRef, useEffect } from 'react'
import { tokenStorage } from '../utils/auth.js' // Changed from AuthService to tokenStorage

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const Chatbot = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [quickResponses, setQuickResponses] = useState([])
    const [showQuickResponses, setShowQuickResponses] = useState(true)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initializeChat()
        }
    }, [isOpen])

    const initializeChat = async () => {
        // Load quick responses
        await fetchQuickResponses()

        // Set welcome message based on user role
        const welcomeMessage = getWelcomeMessage()
        setMessages([{
            type: 'bot',
            text: welcomeMessage,
            timestamp: new Date()
        }])
    }

    const getWelcomeMessage = () => {
        if (!user) {
            return `👋 Hello! I'm your Blood Bank Assistant. I can help you with:

• Blood donation knowledge and eligibility
• Understanding how to use this website
• Finding blood donation opportunities
• Navigating site features

What would you like to know?`
        }

        const roleMessages = {
            'DONOR': `👋 Hello ${user.name || 'there'}! As a registered donor, I can help you with:

• Donation eligibility and scheduling
• Finding blood camps in your area
• Viewing your donation history
• Checking urgent blood needs
• Navigating donor features

What can I help you with today?`,

            'HOSPITAL': `👋 Hello! As a hospital user, I can assist you with:

• Creating and managing blood requests
• Understanding blood bank inventory
• Emergency blood request procedures
• Navigating hospital features
• Contact information for blood banks

How can I help you?`,

            'BLOODBANK': `👋 Hello! As a blood bank administrator, I can help with:

• Managing blood inventory and donations
• Creating and organizing blood camps
• Handling hospital requests
• Blood transfer procedures
• Using blood bank management features

What would you like assistance with?`
        }

        return roleMessages[user.role] || roleMessages['DONOR']
    }

    const fetchQuickResponses = async () => {
        try {
            const headers = {}
            if (user && tokenStorage.getToken()) {
                headers.Authorization = `Bearer ${tokenStorage.getToken()}`
            }

            const response = await fetch(`${API_BASE_URL}/api/chatbot/quick-responses`, {
                headers
            })
            const data = await response.json()
            setQuickResponses(data.quick_responses || [])
        } catch (error) {
            console.error('Failed to load quick responses:', error)
        }
    }

    const sendMessage = async (message = inputMessage) => {
        if (!message.trim()) return

        const userMessage = {
            type: 'user',
            text: message,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsLoading(true)
        setShowQuickResponses(false)

        try {
            const headers = {
                'Content-Type': 'application/json'
            }

            // Add auth header if user is logged in
            if (user && tokenStorage.getToken()) {
                headers.Authorization = `Bearer ${tokenStorage.getToken()}`
            }

            const response = await fetch(`${API_BASE_URL}/api/chatbot/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ message })
            })

            const data = await response.json()

            if (response.ok) {
                const botMessage = {
                    type: 'bot',
                    text: data.response,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, botMessage])

                // Update quick responses if provided
                if (data.quick_responses) {
                    setQuickResponses(data.quick_responses)
                }
            } else {
                throw new Error(data.error || 'Failed to get response')
            }
        } catch (error) {
            console.error('Chat error:', error)
            const errorMessage = {
                type: 'bot',
                text: 'Sorry, I encountered an error. Please try again later. For urgent medical matters, please call 999.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const clearChat = () => {
        setMessages([])
        setShowQuickResponses(true)
        initializeChat()
    }

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isOpen
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-500 hover:bg-red-600 animate-pulse'
                    }`}
                title="Chat with Blood Bank Assistant"
            >
                <div className="flex items-center justify-center text-white text-2xl">
                    {isOpen ? '✕' : '🩸'}
                </div>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">🩸 Blood Bank Assistant</h3>
                                <p className="text-sm opacity-90">
                                    {user ? `${user.role?.toLowerCase()} • ${user.name || 'User'}` : 'Guest User'}
                                </p>
                            </div>
                            <button
                                onClick={clearChat}
                                className="text-white hover:text-red-200 text-sm"
                                title="Clear Chat"
                            >
                                🔄
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-line ${message.type === 'user'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white text-gray-800 shadow-md border'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white px-3 py-2 rounded-lg shadow-md border">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick responses */}
                        {showQuickResponses && quickResponses.length > 0 && messages.length <= 1 && (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 text-center font-medium">💡 Try asking:</p>
                                {quickResponses.slice(0, 4).map((response, index) => (
                                    <button
                                        key={index}
                                        onClick={() => sendMessage(response)}
                                        className="block w-full text-left text-xs bg-white border border-red-200 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                                    >
                                        {response}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t bg-white rounded-b-lg">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={isLoading || !inputMessage.trim()}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Chatbot