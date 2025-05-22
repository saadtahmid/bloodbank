# Blood Donation Management System

A modern web application to streamline and manage blood donation processes, connecting donors, hospitals, and blood banks for efficient coordination and emergency response.

## Features

- **User Role Management:** Secure access for Donors, Blood Banks, Hospitals, and Admins.
- **Geographical Integration:** Standardized location data for all users and facilities.
- **Donor Tracking:** Manage donor health, contact info, and donation history.
- **Camp Organization:** Blood banks can organize and track donation camps.
- **Blood Inventory:** Real-time monitoring of blood units and expiry dates.
- **Hospital Requests:** Hospitals can request blood and track request status.
- **Urgent Needs:** Blood banks can post urgent appeals for donors.
- **Inter-Bank Transfers:** Manage and track blood unit transfers between banks.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **ORM/DB:** postgres.js
- **Hosting:** Supabase (PostgreSQL)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/saadtahmid/bloodbank.git
   cd bloodbank
   ```

2. **Backend Setup:**
   ```sh
   cd backend
   npm install
   # Configure your .env file with database credentials
   npm run dev
   ```

3. **Frontend Setup:**
   ```sh
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the app:**  
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License.

---