# Higher Ground Baptist Church (HGBC) Membership Portal

A premium, modern, and highly interactive Full-Stack web application designed to facilitate members' registration and provide administrators with a robust analytics and CRUD dashboard. Built using a Node.js + Express backend and a React + Tailwind CSS v4 frontend.

---

## 🚀 Features

### 📋 Public Membership Portal
- **4-Step Multi-Stage Form**:
  1. **Personal Info**: Standard bio-data, Whatsapp verification, and age categorization.
  2. **Spiritual Details**: Salvation experience field (conditional on "Born Again" status), baptism info, home church name, and completed discipleship courses checklist.
  3. **Parent/Guardian Info**: Emergency contact details, relationship type, and current location.
  4. **Academic & Additional Details**: LAUTECH-specific fields (Faculty, Department, level selection, hostel address) which toggle dynamically based on student status.
- **Client-Side Validation**: Immediate step-level validation preventing invalid submissions.
- **Dynamic Animations**: Smooth transitions between form steps powered by `Framer Motion`.
- **Success Page**: Sleek confirmation view showing details have been logged.

### 🛡️ Admin Authentication
- **Secure Access**: Protected dashboard routes utilizing JWT-based bearer authorization.
- **Local Storage Integration**: Persistent admin sessions checking token validity with the server.
- **Auto-Seeding**: Backend dynamically seeds a default administrator account on initial run using environment config credentials.

### 📊 Admin Analytics Dashboard
- **Overview & Statistics (`/admin/overview`)**:
  - **Overview Metrics**: Active counters for total registered members.
  - **Recharts Data Visualizations**: Custom charts displaying gender distribution, age range categories, LAUTECH student/non-student percentages, and monthly registration trends.
  - **Course Analytics**: Progress charts for discipleship programs completed.
- **Member Management (`/admin/members`)**:
  - **CRUD Operations**: Comprehensive table displaying registrations, enabling adding new profiles, viewing complete details, editing profiles, and deletion.
  - **Search & Filters**: Real-time searching on Name, Email, and Phone number; filters for Gender, Age-Range, Born-Again Status, LAUTECH Student Status, Faculty, and Marital Status.
  - **Sorting & Pagination**: Column sorting options and configurable pagination levels.
  - **CSV Data Exporter**: Instant download of all registered members' records formatted into a clean, comma-separated spreadsheet (`.csv`).

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 | Core UI library for components |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Modern utility framework with @import-based config |
| **Routing** | React Router DOM v7 | Client-side routing and protected route wrappers |
| **Animations**| Framer Motion | Smooth component transitions and stepper progress |
| **Charts** | Recharts | Dynamic data visualizations for dashboard analytics |
| **Icons** | Lucide React + React Icons | Harmonious and premium visual indicators |
| **Backend** | Node.js + Express | RESTful API server |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | Protected endpoints and secure credential hashing |
| **Database** | MySQL / MariaDB | Relational SQL database server support |

---

## 📁 Repository Structure

```text
hgbcmembership/
├── .github/                  # Github configuration
├── server/                   # Backend API Engine
│   ├── .env                  # Port, JWT Secret, DB parameters, and Default Admin credentials
│   ├── server.js             # Express application & API endpoints
│   ├── db.js                 # MySQL database connector (tables setup, queries)
│   ├── package.json          # Server dependencies
│   └── node_modules/         # Server package binaries
├── src/                      # Frontend Application
│   ├── assets/               # Images, logos, static illustrations
│   ├── components/           # Reusable UI widgets
│   │   └── dashboard/        # Sidebar.jsx, Header.jsx
│   ├── constants/            # Layout limits and static drop-down arrays
│   ├── pages/                # Main Application Screen components
│   │   ├── dashboard/        # AdminLayout.jsx, Overview.jsx, Members.jsx
│   │   ├── MembershipForm.jsx# Interactive stepper form page
│   │   ├── Signin.jsx        # Admin sign-in screen
│   │   └── Success.jsx       # Success landing page
│   ├── App.css               # Page-specific styling rules
│   ├── index.css             # Tailwind v4 configuration and custom font sets
│   ├── App.jsx               # Main Routing hub and ProtectedRoute component
│   └── main.jsx              # React Client Entry mount
├── workflows/                # Deployment Pipelines
│   └── cpanel_deploy.yml     # FTP deployment script to web host
├── index.html                # Main SPA page frame
├── vite.config.js            # Build configuration for Vite
├── tailwind.config.js        # Optional styling configurations
├── package.json              # Client dependencies
└── README.md                 # Project documentation (this file)
```

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file inside the [server](file:///d:/OVERSIGHT/hgbcmembership/server) directory using the following template:

```env
PORT=5000
JWT_SECRET=hgbc_secret_key_2026_jwt
ADMIN_EMAIL=admin@hgbc.org
ADMIN_PASSWORD=hgbcadmin123

# MySQL Configurations
DB_HOST=localhost
DB_PORT=3306
DB_USER=hgbcinfl_hghbcmembership
DB_PASSWORD="Um7tqedS3U{&#S,P"
DB_NAME=hgbcinfl_hgbcmembership
```

> [!IMPORTANT]
> - **Password Wrapping**: If your database password contains special characters (like `#`), ensure you wrap the value in double quotes (`"..."`) to prevent truncation by the environment variables parser.
> - **Seeding**: The admin seed credentials `ADMIN_EMAIL` and `ADMIN_PASSWORD` are automatically populated in the MySQL `users` table upon the server's first execution if it is empty.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### 1. Backend Server Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` settings as described in the configuration section.
4. Run the server locally:
   ```bash
   npm run dev
   ```
   The backend API server will start on `http://localhost:5000`.

### 2. Frontend Client Setup
1. Return to the root project folder:
   ```bash
   cd ..
   ```
2. Install the client-side dependencies:
   ```bash
   npm install
   ```
3. Start the Vite local server:
   ```bash
   npm run dev
   ```
4. Access the web portal at the address output by Vite (typically `http://localhost:5173`).

---

## 📡 API Endpoints

### Public Endpoints
- **Submit Member Details**
  - **Method**: `POST`
  - **Path**: `/api/members`
  - **Request Body**: A JSON representation of the member data payload.
  - **Returns**: Confirmation message and newly created Member ID.

- **Admin Login**
  - **Method**: `POST`
  - **Path**: `/api/auth/login`
  - **Request Body**: `{ "email": "admin@hgbc.org", "password": "hgbcadmin123" }`
  - **Returns**: Session token (JWT) and user attributes.

---

### Protected Endpoints (Requires `Authorization: Bearer <JWT_TOKEN>` header)
- **Token Verification**
  - **Method**: `GET`
  - **Path**: `/api/auth/verify`

- **Get Members List (with query filters, sort & search)**
  - **Method**: `GET`
  - **Path**: `/api/members`

- **Retrieve Single Member Profile**
  - **Method**: `GET`
  - **Path**: `/api/members/:id`

- **Update Member Details**
  - **Method**: `PUT`
  - **Path**: `/api/members/:id`

- **Delete Member Profile**
  - **Method**: `DELETE`
  - **Path**: `/api/members/:id`

- **Aggregate Dashboard Statistics**
  - **Method**: `GET`
  - **Path**: `/api/stats`

- **Download Members CSV Export**
  - **Method**: `GET`
  - **Path**: `/api/members/export`

---

## 🚀 Deployment

The portal comes configured with a GitHub Actions workflow in [workflows/cpanel_deploy.yml](file:///d:/OVERSIGHT/hgbcmembership/workflows/cpanel_deploy.yml). When changes are pushed to the `main` branch, the workflow:
1. Installs client packages.
2. Compiles a production build using `npm run build`.
3. Uploads the output bundle contents inside `./dist/` to the cPanel web host server using FTPS protocol.

For continuous deployment configuration, add the following secrets to your GitHub Repository settings:
- `FTP_SERVER` - cPanel FTPS server address.
- `FTP_USERNAME` - FTP user account name.
- `FTP_PASSWORD` - FTP user security password.
