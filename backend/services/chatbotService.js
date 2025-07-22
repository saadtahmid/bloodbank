import { GoogleGenerativeAI } from '@google/generative-ai'

// Simplified context for testing
const simpleContext = {
    bloodDonationKnowledge: "Blood donation helps save lives. You must be 18-65 years old and weigh at least 50kg.",
    siteFeatures: "This system helps donors find blood camps and hospitals request blood.",
    navigationHelp: "Navigate using the menus at the top of the page.",
    emergencyInfo: "For emergencies, call 999."
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Fallback responses for when Gemini API is not available
const fallbackResponses = {
    greeting: "Hello! I'm your Blood Bank Assistant. I can help you with blood donation information, navigating our website, and understanding our services.",

    donation: "To donate blood, you must be 18-65 years old, weigh at least 50kg, and be in good health. You can donate every 56 days. Visit our blood camps or contact local blood banks to schedule a donation.",

    eligibility: "Blood donation eligibility requires: Age 18-65, minimum weight 50kg, good health, no recent illness/surgery, and 56 days since last donation. Some medications may affect eligibility.",

    navigation: "To navigate our site: Donors can register for camps and view history. Hospitals can request blood. Blood banks manage inventory. Use the top menu to access features based on your role.",

    bloodTypes: "Blood type compatibility: O- is universal donor, AB+ is universal recipient. A+ can donate to A+/AB+, B+ to B+/AB+, etc. Know your blood type to help efficiently.",

    emergency: "For medical emergencies, call 999 immediately. For urgent blood needs, contact multiple blood banks directly through our directory.",

    default: "I'm here to help with blood donation questions, site navigation, and blood bank services. You can ask about donation eligibility, how to use our website, blood types, or emergency procedures."
}

function getKeywords(message) {
    const msg = message.toLowerCase()

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) return 'greeting'
    if (msg.includes('donate') || msg.includes('donation')) return 'donation'
    if (msg.includes('eligible') || msg.includes('qualify') || msg.includes('can i')) return 'eligibility'
    if (msg.includes('navigate') || msg.includes('how to') || msg.includes('menu') || msg.includes('use')) return 'navigation'
    if (msg.includes('blood type') || msg.includes('compatibility') || msg.includes('universal')) return 'bloodTypes'
    if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('999')) return 'emergency'

    return 'default'
}

export async function getChatbotResponse(message, userContext = {}) {
    try {
        console.log('Chatbot service called with message:', message)
        console.log('User context:', userContext)
        console.log('API Key available:', !!process.env.GEMINI_API_KEY)

        // Try Gemini API first
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

            const systemPrompt = `You are a helpful assistant for a Blood Bank Management System. Help with blood donation, site navigation, and general information.

User Role: ${userContext.role || 'Guest'}
User Question: ${message}

Provide a helpful, friendly response about blood donation or site features. Keep it concise and accurate.`

            console.log('Sending request to Gemini API...')
            const result = await model.generateContent(systemPrompt)
            const response = await result.response

            console.log('Gemini API response received successfully')

            return {
                success: true,
                response: response.text()
            }
        } catch (apiError) {
            console.log('Gemini API failed, using fallback response:', apiError.message)

            // Use fallback system
            const keywords = getKeywords(message)
            let response = fallbackResponses[keywords]

            // Add role-specific context
            if (userContext.role === 'DONOR') {
                response += "\n\nAs a donor, you can register for blood camps, view your donation history, and check urgent blood needs through your dashboard."
            } else if (userContext.role === 'HOSPITAL') {
                response += "\n\nAs a hospital, you can create blood requests, view request history, and contact blood banks directly through our system."
            } else if (userContext.role === 'BLOODBANK') {
                response += "\n\nAs a blood bank administrator, you can manage inventory, create camps, handle requests, and coordinate transfers with other blood banks."
            }

            return {
                success: true,
                response: response,
                fallback: true
            }
        }
    } catch (error) {
        console.error('Chatbot error details:', error)
        return {
            success: false,
            error: 'Sorry, I encountered an error. Please try again. For urgent matters, please contact emergency services at 999.'
        }
    }
}

// Enhanced function to get user context from database
export async function getUserContext(user) {
    if (!user) return { role: 'Guest' }

    try {
        const sql = (await import('../db.js')).default

        let context = {
            role: user.role || 'Unknown',
            blood_type: user.blood_type || null,
            location: user.location || null
        }

        // Get role-specific information
        if (user.role === 'DONOR' && user.donor_id) {
            try {
                const donorResult = await sql`
                    SELECT d.last_donation_date, d.location, d.blood_type,
                           COUNT(don.donation_id) as total_donations
                    FROM bloodbank.donors d
                    LEFT JOIN bloodbank.donation don ON d.donor_id = don.donor_id
                    WHERE d.donor_id = ${user.donor_id}
                    GROUP BY d.donor_id, d.last_donation_date, d.location, d.blood_type
                `

                if (donorResult[0]) {
                    context.last_donation_date = donorResult[0].last_donation_date
                    context.total_donations = donorResult[0].total_donations
                    context.blood_type = donorResult[0].blood_type
                    context.location = donorResult[0].location

                    // Calculate eligibility
                    if (donorResult[0].last_donation_date) {
                        const daysSince = Math.floor(
                            (new Date() - new Date(donorResult[0].last_donation_date)) / (1000 * 60 * 60 * 24)
                        )
                        context.days_since_last_donation = daysSince
                        context.eligible_to_donate = daysSince >= 56
                    }
                }
            } catch (err) {
                console.error('Error fetching donor context:', err)
            }
        } else if (user.role === 'HOSPITAL' && user.hospital_id) {
            try {
                const hospitalResult = await sql`
                    SELECT name, location 
                    FROM bloodbank.hospital 
                    WHERE hospital_id = ${user.hospital_id}
                `
                if (hospitalResult[0]) {
                    context.hospital_name = hospitalResult[0].name
                    context.location = hospitalResult[0].location
                }
            } catch (err) {
                console.error('Error fetching hospital context:', err)
            }
        } else if (user.role === 'BLOODBANK' && user.bloodbank_id) {
            try {
                const bloodbankResult = await sql`
                    SELECT name, location 
                    FROM bloodbank.bloodbank 
                    WHERE bloodbank_id = ${user.bloodbank_id}
                `
                if (bloodbankResult[0]) {
                    context.bloodbank_name = bloodbankResult[0].name
                    context.location = bloodbankResult[0].location
                }
            } catch (err) {
                console.error('Error fetching bloodbank context:', err)
            }
        }

        return context
    } catch (error) {
        console.error('Error getting user context:', error)
        return { role: user.role || 'Unknown' }
    }
}