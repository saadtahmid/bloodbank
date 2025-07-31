# Blood Donation Management System

A comprehensive web application designed to streamline blood donation processes, connecting donors, hospitals, and blood banks through an intelligent platform that ensures efficient coordination, real-time inventory management, and emergency response capabilities.

## 🩸 Key Features

### Core Functionality
- **Multi-Role Authentication:** Secure access for Donors, Blood Banks, Hospitals with role-based dashboards
- **Profile Management:** Complete user profiles with image upload during registration
- **Geographic Integration:** Location-based services for donors and facilities across Bangladesh

### Donor Experience
- **Donation Tracking:** Comprehensive donation history with blood bank details
- **Camp Registration:** Easy registration for blood donation camps
- **Urgent Needs Alerts:** Real-time notifications for emergency blood requests
- **Leaderboard System:** Gamified donor recognition with badges and rankings

### Blood Bank Operations
- **Advanced Analytics Dashboard:** Real-time performance metrics and visual statistics
- **Inventory Management:** Live blood unit tracking with expiry monitoring
- **Camp Organization:** Create and manage donation camps with attendee tracking
- **Transfer Management:** Inter-bank blood unit transfers with full audit trail
- **Request Fulfillment:** Automated broadcast request system with transaction safety

### Hospital Services
- **Blood Request System:** Submit requests with priority levels and specific requirements
- **Broadcast Requests:** Send requests to multiple blood banks simultaneously
- **Request History:** Track all blood requests with detailed status updates
- **Emergency Response:** Priority handling for urgent medical situations

### Advanced Features
- **AI Chatbot:** Intelligent assistant for blood donation guidance and FAQs
- **Performance Analytics:** Comprehensive metrics including fulfillment rates and emergency response
- **Expiry Management:** Automated tracking and alerts for blood unit expiration
- **Real-time Statistics:** Live system-wide statistics and trends

## 🛠️ Tech Stack

### Frontend
- **React 18** with modern hooks and functional components
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom dark theme and glass morphism effects
- **Recharts** for advanced data visualization and analytics
- **Lucide React** for consistent iconography

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** with Supabase hosting
- **Postgres.js** for efficient database operations
- **bcrypt** for secure password hashing
- **Multer** for file upload handling

### Database Architecture
- **Relational Design:** Normalized schema with proper foreign key relationships
- **Transaction Safety:** Atomic operations for critical processes
- **Audit Trail:** Complete tracking of all blood unit movements
- **Performance Optimized:** Indexed queries for fast data retrieval

### Security & Performance
- **JWT Authentication:** Secure token-based authentication
- **Role-based Access Control:** Granular permissions per user type
- **File Upload Security:** Validated image uploads with size limits
- **Transaction Isolation:** Prevents race conditions in critical operations

## 🚀 Live Application

**🌐 Access the Application:** [https://bloodbank-frontend-lake.vercel.app](https://bloodbank-frontend-lake.vercel.app)

The Blood Bank Management System is fully deployed and ready to use! No installation required - simply visit the link above to start using the platform.

### Quick Start Guide
1. **Visit the Application:** Go to [https://bloodbank-frontend-lake.vercel.app](https://bloodbank-frontend-lake.vercel.app)
2. **Create an Account:** Register as a Donor, Hospital, or Blood Bank
3. **Upload Profile Image:** Add your profile picture during registration
4. **Explore Features:** Access role-specific dashboards and features
5. **Start Using:** Begin donating, requesting blood, or managing inventory

### Demo Accounts
For testing purposes, you can create accounts with different roles:
- **Donor Account:** Register to track donations and find camps
- **Hospital Account:** Submit blood requests and track status
- **Blood Bank Account:** Manage inventory and fulfill requests

## 📊 System Architecture

### Database Schema (15 Core Tables)

#### **User Management**
- **`users`** - Core authentication with email, password (bcrypt), role, and profile image
- **`donors`** - Donor profiles with blood type, weight, location, contact info, and donation history
- **`hospital`** - Hospital information with name, location, and contact details
- **`bloodbank`** - Blood bank facilities with location, contact, and optional hospital association

#### **Inventory & Donations**
- **`bloodunit`** - Individual blood units with type, collection/expiry dates, status tracking
- **`donation`** - Complete donation records linking donors, blood banks, camps, and urgent needs
- **`camp`** - Blood donation camps organized by blood banks
- **`campregistration`** - Donor registrations for camps with attendance tracking

#### **Request Management**
- **`bloodrequest`** - Hospital blood requests with broadcast capability and priority levels
- **`bloodbankrequest`** - Inter-blood bank requests for blood units
- **`bloodbanktransfer`** - Transfer records between blood banks with status tracking

#### **Emergency & Communication**
- **`urgentneed`** - Emergency blood appeals posted by blood banks
- **`notification`** - User notifications with read/unread status
- **`system_logs`** - System-wide logging for audit trails

#### **Geographic Data**
- **`location`** - Standardized location data (division, district, city) for Bangladesh

### Database Features
- **ACID Compliance:** Full transaction support with rollback capabilities
- **Data Integrity:** Foreign key constraints and check constraints for data validation
- **Blood Type Validation:** Enforced blood type formats (A+, A-, B+, B-, AB+, AB-, O+, O-)
- **Status Management:** Comprehensive status tracking for requests, transfers, and inventory
- **UUID Support:** Broadcast group IDs for multi-bank request coordination
- **Indexing:** Optimized queries with strategic indexes for performance
- **Cloud Hosting:** Deployed on Supabase with high availability
- **Automatic Backups:** Regular database backups and point-in-time recovery

### API Structure
- **RESTful Design:** Standard HTTP methods and status codes
- **Modular Services:** Separated business logic for maintainability
- **Error Handling:** Comprehensive error responses with meaningful messages
- **Validation:** Input validation and sanitization on all endpoints
- **Transaction Safety:** Atomic operations for critical processes

## 🎯 Performance Metrics

The system tracks several key performance indicators:

- **Fulfillment Rate:** Percentage of blood requests successfully fulfilled
- **Emergency Response:** Speed and success rate of emergency request handling
- **Blood Type Coverage:** Diversity of blood types maintained in inventory
- **Inventory Turnover:** Efficiency of blood unit utilization

## 🔐 Security Features

- **Password Security:** bcrypt hashing with salt rounds
- **File Upload Protection:** Validated file types and size limits
- **SQL Injection Prevention:** Parameterized queries throughout
- **Transaction Safety:** Atomic operations prevent data corruption
- **Role Validation:** Server-side permission checks on all operations

## 🌟 Recent Updates & Features

### Version 2.0 Highlights
- **Live Deployment:** Fully deployed on Vercel with global accessibility
- **Analytics Dashboard:** Comprehensive blood bank performance metrics with visual charts
- **Enhanced Registration:** Image upload capability during user registration
- **Performance Tracking:** Real-time calculation of key operational metrics
- **Transaction Safety:** Improved broadcast request fulfillment with atomic operations
- **Visual Improvements:** Modern UI with dark theme and responsive design
- **Production Ready:** Optimized for performance and scalability

### Production Features
- **Global CDN:** Fast loading times worldwide via Vercel's edge network
- **Database Hosting:** Reliable PostgreSQL hosting on Supabase
- **File Storage:** Secure image uploads and storage
- **SSL Security:** HTTPS encryption for all communications
- **Responsive Design:** Works perfectly on mobile, tablet, and desktop

### Upcoming Features
- **Mobile App:** React Native companion app for donors
- **SMS Notifications:** Emergency alerts via SMS integration
- **Advanced Analytics:** Machine learning for demand prediction
- **Multi-language Support:** Bengali and English language options

## 🤝 Contributing

We welcome contributions from developers who want to improve the blood donation ecosystem! Here's how you can contribute:

### For Developers
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature description"`
5. Push to your fork: `git push origin feature-name`
6. Create a Pull Request with detailed description

### Local Development Setup (Optional)
If you want to contribute to the codebase:

```bash
# Clone the repository
git clone https://github.com/saadtahmid/bloodbank.git
cd bloodbank

# Backend setup
cd backend && npm install && npm run dev

# Frontend setup (new terminal)
cd frontend && npm install && npm run dev
```

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all existing tests pass
- Use meaningful commit messages

### Bug Reports
- Use the GitHub Issues template
- Include steps to reproduce
- Provide environment details
- Add screenshots if applicable

## 📈 Project Statistics

- **Lines of Code:** 15,000+ (Frontend: 8,000+, Backend: 7,000+)
- **Database Tables:** 15 core tables with comprehensive relationships
- **API Endpoints:** 45+ RESTful endpoints
- **Components:** 25+ React components
- **Features:** 30+ major features implemented
- **Blood Types Supported:** 8 validated types (A+, A-, B+, B-, AB+, AB-, O+, O-)
- **User Roles:** 3 primary roles (Donor, Hospital, BloodBank)
- **Status Types:** 25+ different status values across various entities

### Database Statistics
- **Primary Tables:** 15 with full relational integrity
- **Foreign Key Constraints:** 20+ ensuring data consistency
- **Check Constraints:** 15+ for data validation
- **Indexes:** Strategic indexing for broadcast operations
- **Transaction Support:** Full ACID compliance with rollback capabilities

## 🏆 Acknowledgments

- **Recharts** for excellent charting capabilities
- **Tailwind CSS** for rapid UI development
- **Supabase** for reliable PostgreSQL hosting
- **Lucide React** for beautiful icons
- **React community** for continuous innovation

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: saadtahmid1890@gmail.com
- Documentation: Check the wiki section

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the blood donation community in Bangladesh**