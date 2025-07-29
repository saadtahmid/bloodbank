/* filepath: d:\BloodBank\backend\routes\chatbotRoutes.js */
import { Router } from 'express'
import { getChatbotResponse, getUserContext } from '../services/chatbotService.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// Test endpoint
router.post('/test', async (req, res) => {
    console.log('TEST ENDPOINT HIT')
    res.json({ message: 'Test successful', body: req.body })
})

// Main chat endpoint
router.post('/chat', optionalAuth, async (req, res) => {
    console.log('=== CHAT ENDPOINT HIT ===')
    console.log('Chat endpoint hit with body:', req.body)
    try {
        const { message } = req.body

        if (!message || message.trim().length === 0) {
            console.log('Empty message received')
            return res.status(400).json({
                error: 'Message is required',
                quick_responses: getQuickResponses()
            })
        }

        console.log('Processing message:', message)

        // Get user context from authenticated user or default to Guest
        let userContext = { role: 'Guest' }

        if (req.user) {
            console.log('Authenticated user found:', req.user)
            userContext = await getUserContext(req.user)
        } else {
            console.log('No authenticated user, using Guest context')
        }

        console.log('User context:', userContext)

        const result = await getChatbotResponse(message, userContext)

        console.log('Chatbot result:', result)

        if (result.success) {
            res.json({
                response: result.response,
                user_context: userContext,
                quick_responses: getQuickResponses(userContext.role)
            })
        } else {
            res.status(500).json({
                error: result.error,
                quick_responses: getQuickResponses()
            })
        }
    } catch (error) {
        console.error('Chat endpoint error:', error)
        res.status(500).json({
            error: 'Failed to process chat message. Please try again.',
            quick_responses: getQuickResponses()
        })
    }
})

// Get role-specific quick responses
router.get('/quick-responses', optionalAuth, (req, res) => {
    const userRole = req.user?.role || 'Guest'
    res.json({
        quick_responses: getQuickResponses(userRole),
        user_role: userRole
    })
})

function getQuickResponses(userRole = 'Guest') {
    const baseResponses = [
        "How can I donate blood?",
        "Am I eligible to donate?",
        "What are the health benefits of donating?",
        "How often can I donate blood?",
        "What should I do before donating?"
    ]

    const roleSpecificResponses = {
        'DONOR': [
            "How do I register for a blood camp?",
            "Where can I see my donation history?",
            "How do I check urgent blood needs?",
            "When can I donate again?",
            "How do I update my profile?"
        ],
        'HOSPITAL': [
            "How do I request blood from blood banks?",
            "Where can I see my request history?",
            "How do I contact blood banks directly?",
            "What's the emergency blood request process?",
            "How do I update hospital information?"
        ],
        'BLOODBANK': [
            "How do I create a donation camp?",
            "How do I manage blood inventory?",
            "How do I handle hospital requests?",
            "How do I add direct donations?",
            "How do I transfer blood to other banks?"
        ],
        'Guest': [
            "How do I register on the site?",
            "What's the difference between user roles?",
            "How do I find blood donation camps?",
            "Where can I find emergency contact info?",
            "How does the blood bank system work?"
        ]
    }

    return [...baseResponses, ...(roleSpecificResponses[userRole] || roleSpecificResponses['Guest'])]
}

export default router