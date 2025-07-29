import { GoogleGenerativeAI } from '@google/generative-ai'
import { bloodDonationKnowledge, siteFeatures, navigationHelp, emergencyInfo } from '../data/chatbotContext.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Enhanced fallback responses using comprehensive knowledge base
const fallbackResponses = {
    greeting: "Hello! I'm your Blood Bank Assistant. I can help you with blood donation information, navigating our website, and understanding our services. Ask me about donation eligibility, how to use site features, blood types, or emergency procedures.",

    donation: "To donate blood, you must be 18-65 years old, weigh at least 50kg, and be in good health. You need minimum hemoglobin of 12.5 g/dL (women) or 13.0 g/dL (men). Wait 56 days between donations. The process takes 45-60 minutes total including registration, mini-physical, donation (8-12 min), and rest.",

    eligibility: "Blood donation eligibility: Age 18-65, minimum weight 50kg, good health, proper hemoglobin levels, 56 days since last donation, no recent illness/surgery. Vegetarians can donate if they meet hemoglobin requirements. You get a free health screening with each donation.",

    navigation: "For Donors: Use 'My Donations' menu to view history, register for camps, check urgent needs. For Hospitals: Hospital menu to create requests, view history, access inventory. For Blood Banks: Use Inventory, Camps, and Requests menus. Emergency contact: 999.",

    bloodTypes: "Blood compatibility: O- is universal donor (can donate to all), AB+ is universal recipient (can receive from all). A+ donates to A+/AB+, B+ to B+/AB+, A- to A+/A-/AB+/AB-, B- to B+/B-/AB+/AB-, AB- receives from A-/B-/AB-/O-, O+ donates to A+/B+/AB+/O+.",

    emergency: "Medical emergencies: Call 999 immediately. For urgent blood needs: Contact multiple blood banks simultaneously, use 'Urgent Needs' feature, coordinate with donors of compatible blood types. Keep emergency contact numbers readily available.",

    process: "Donation process: 1) Registration & health questionnaire (10-15 min), 2) Mini-physical: pulse, blood pressure, temperature, hemoglobin check, 3) Actual donation (8-12 min), 4) Rest & refreshments (10-15 min). Prepare by eating iron-rich foods, staying hydrated, and getting good sleep.",

    benefits: "Health benefits of donating: Free health screening, reduces heart disease risk, burns ~650 calories per donation, maintains healthy iron levels, psychological benefits of saving lives. After donation: rest 10-15 min, drink fluids, avoid heavy lifting for 24 hours.",

    default: "I'm here to help with blood donation questions, site navigation, and blood bank services. You can ask about donation eligibility, blood type compatibility, how to use website features, donation process, health benefits, or emergency procedures. For medical emergencies, call 999."
}

function getKeywords(message) {
    const msg = message.toLowerCase()

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) return 'greeting'
    if (msg.includes('donate') || msg.includes('donation') || msg.includes('give blood')) return 'donation'
    if (msg.includes('eligible') || msg.includes('qualify') || msg.includes('can i') || msg.includes('requirements')) return 'eligibility'
    if (msg.includes('navigate') || msg.includes('how to') || msg.includes('menu') || msg.includes('use') || msg.includes('find')) return 'navigation'
    if (msg.includes('blood type') || msg.includes('compatibility') || msg.includes('universal') || msg.includes('o-') || msg.includes('ab+')) return 'bloodTypes'
    if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('999') || msg.includes('critical')) return 'emergency'
    if (msg.includes('process') || msg.includes('procedure') || msg.includes('steps') || msg.includes('how long')) return 'process'
    if (msg.includes('benefits') || msg.includes('health') || msg.includes('advantages') || msg.includes('why donate')) return 'benefits'

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

            const systemPrompt = `You are a knowledgeable assistant for a Blood Bank Management System. Use the following comprehensive information to help users:

${bloodDonationKnowledge}

${siteFeatures}

${navigationHelp}

${emergencyInfo}


User Context: ${JSON.stringify(userContext)}
User Question: ${message}

Based on the above knowledge base, provide a helpful, accurate, and friendly response. Be specific and reference the relevant information from the knowledge base when appropriate. Keep responses concise but informative.`

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
            if (userContext.role === 'Donor') {
                response += "\n\nAs a donor, you can register for blood camps, view your donation history, and check urgent blood needs through your dashboard."
            } else if (userContext.role === 'Hospital') {
                response += "\n\nAs a hospital, you can create blood requests, view request history, and contact blood banks directly through our system."
            } else if (userContext.role === 'BloodBank') {
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
        if (user.role === 'Donor' && user.donor_id) {
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
        } else if (user.role === 'Hospital' && user.hospital_id) {
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
        } else if (user.role === 'BloodBank' && user.bloodbank_id) {
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