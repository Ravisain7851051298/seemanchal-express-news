# Seemanchal Express (सीमांचल एक्सप्रेस)
> **Voice of the People | सच की निर्भीक आवाज**  
> **Contact:** [mail@seemanchalexpress.in](mailto:mail@seemanchalexpress.in) | **Phone:** +91 9871023184  
> **Central Office:** F 65, Shaheen Bagh, Okhla, New Delhi-110025  

---

## 🌟 Overview & Architecture

**Seemanchal Express** is a modern, full-stack digital news portal and multi-tier organizational management system built specifically for the Seemanchal region (Kishanganj, Purnea, Araria, Katihar, Bihar) and national news coverage.

### Key Architectural Highlights
- **State Management:** **Redux Toolkit (`@reduxjs/toolkit`)** with modular reducers:
  - `authSlice.js`: Access token in Redux memory, user identity, role, and approval status.
  - `newsSlice.js`: Live breaking news ticker, featured hero headlines, regional news streams, and categories.
  - `teamSlice.js`: Multi-tier committee structure and approved leaders.
  - `adminSlice.js`: Application reviews, metrics analytics, custom position manager, and live news desk.
  - `reporterSlice.js`: Submissions tracker and article drafts.
- **Authentication & Security:** **Dual JWT Token Architecture**:
  - **Short-Lived Access Token:** Kept strictly in Redux memory (no localStorage exposure to XSS).
  - **Long-Lived Refresh Token:** Stored in **`HttpOnly` cookies** (`SameSite: Lax`, secure in production).
  - **Axios Interceptor (`api.js`):** Injects `Authorization: Bearer <accessToken>` into every request and automatically handles silent token refreshes via `/api/auth/refresh-token` on 401s using request queueing.
- **Documents Engine:**
  - **Digital ID Card Generator:** Live QR code verification linked to public verify portal `/verify/[id]`.
  - **Official Appointment Letter:** Printable letterhead with official seal, reference number, and jurisdictional duties.

---

## 🏛️ Committee Structure (संगठनात्मक ढांचा)

1. **A. National Executive Committee (राष्ट्रीय कार्यकारिणी)**: Nation Correspondence (1), National Vice Presidents (2), National General Secretary (1), Joint Secretaries (2), Organization Secretary (1), Treasurer (1), Coordinators (5), Executive Members (5–11), Advisory Board.
2. **B. State Executive Committee (राज्य कार्यकारिणी - बिहार)**: State President (1), Vice President (1–2), General Secretary (1), Joint Secretary (1–2), Organization Secretary (1), Treasurer (1), Coordinators (5), Executive Members (5–9).
3. **C. District Executive Committee (जिला कार्यकारिणी)**: District President (1), Vice President (1), General Secretary (1), Joint Secretary (1), Organization Secretary (1), Treasurer (1), Coordinators (4), Executive Members (3–7).
4. **D. Block / Taluka Committee (प्रखंड / तालुका समिति)**: Block President (1), Vice President (1), Secretary (1), Joint Secretary (1), Treasurer (1), Coordinators (4), Executive Members (3–5).
5. **E. Gram Panchayat Committee (ग्राम पंचायत समिति)**: Panchayat President/Coordinator (1), Deputy Coordinator (1), Secretary (1), Assistant Secretary (1), Health & Youth Coordinators (3), Executive Members (3–5), Volunteers.
6. **F. Ward Committee (वार्ड समिति)**: Ward In-charge / President (1), Secretary (1), Assistant Secretary (1), Coordinators (2), Executive Members (2–5), Volunteers.
7. **Editorial & Press Corps**: Chief Bureau, District Bureau Chief, Special Correspondents, Field Reporters.

*Note:* All positions can be dynamically expanded, edited, or reset by the Admin from the **Position Management** tab.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ (tested on Node.js v24)
- MongoDB Database (Local or MongoDB Atlas)

### 2. Environment Variables Configuration

#### Backend (`backend/.env`):
```env
PORT=5005
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/seemanchal_express
JWT_SECRET=seemanchal_express_super_secret_jwt_key_2026_secured
JWT_REFRESH_SECRET=seemanchal_express_refresh_jwt_key_2026_secured
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ORGANIZATION_NAME=Seemanchal Express
ORGANIZATION_EMAIL=mail@seemanchalexpress.in
ORGANIZATION_PHONE=9871023184
ORGANIZATION_ADDRESS=F 65, Shaheen Bagh, Okhla, New Delhi-110025
```

#### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
```

---

### 3. Running the Stack

#### Terminal 1 (Backend API):
```bash
cd backend
npm start
```
*API runs at `http://localhost:5005`*

#### Terminal 2 (Next.js Frontend):
```bash
cd frontend
npm run dev
```
*Frontend runs at `http://localhost:3000`*

---

## 🔑 Default Credentials & Demo Accounts

| Role | Email | Password | Panel URL |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@seemanchalexpress.in` | `Admin@123456` | `/admin` |
| **Approved Member (President)** | `tariq.anwer@seemanchalexpress.in` | `Member@123456` | `/member` |
| **Approved Member (Gen Sec)** | `rajesh.sharma@seemanchalexpress.in` | `Member@123456` | `/member` |

*Or click the convenient "Quick Demo Fill" buttons directly on the `/login` page.*

---

## 📱 Pages & Features Summary

- **`/` (Home)**: Live breaking news ticker, hero headlines, Seemanchal special news (Kishanganj, Purnea, Araria, Katihar), latest stories, and quick CTA cards.
- **`/team` (Team Page)**: Committee tier filtering (A to F & Press), displays only Admin-approved members with photos, designations, and locations.
- **`/news/[slug]`**: Single news article with view counter, author badge, related stories, and social sharing (WhatsApp, Facebook, Twitter).
- **`/admin`**: Admin control center:
  - Analytics cards
  - Application approvals (assigning Level, Position, Area, Validity, Team Page toggle)
  - Dynamic Position Manager (Add/Edit/Delete/Reset sanctioned seats)
  - News Manager (Direct publishing with breaking/featured flags, approve/reject reporter submissions)
- **`/reporter`**: Reporter dashboard to submit news articles, track editorial review status, and download Press ID card and appointment letter.
- **`/member`**: Member dashboard to view approval status, assigned designation, and download ID card & appointment letter.
- **`/verify` & `/verify/[id]`**: Public digital ID verification by entering card ID or scanning card QR code.
- **`/about` & `/contact`**: Organization history, headquarters address, phone, email, and inquiry form.
