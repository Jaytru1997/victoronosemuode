# Ven. Victor Akpevwen Onosemuode (Rtd.)

The official website of **Venerable Victor Akpevwen Onosemuode JP (Rtd.)** — Anglican priest, teacher, author, counsellor, and pastoral mentor from Arhavwarien, Delta State, Nigeria.

## About the Website

This is a personal ministry and profile website that celebrates the life, faith journey, and legacy of Ven. Victor Akpevwen Onosemuode. It serves as a digital home for his published works, speaking engagements, pastoral services, and community contributions.

## Pages

| Page | Purpose |
|---|---|
| **Home** `/` | Introduction to Ven. Victor, his books, ministry, and services |
| **About** `/about` | Biography, faith journey, and life timeline |
| **Books** `/books` | Five legacy publications available for purchase and download |
| **Services** `/services` | Vestments, Christian books, counselling, and priestly mentorship |
| **Ministry** `/ministry` | Ministry journey, church appointments, and pastoral work |
| **Events** `/events` | Speaking engagements and event seat reservations |
| **Community** `/community` | Community service and the St. Barnabas' centenary project |
| **Contact** `/contact` | Locations, phone numbers, and email contact details |
| **Calendar** `/calendar` | Consultation booking with Ven. Victor |

## Features

- **Books Catalog** — Browse and purchase published works by Ven. Victor, covering Anglican worship, church administration, pastoral care, and Christian living.
- **Member Portal** — Registered members can view their purchased books, track bank transfer payment status, and manage event reservations.
- **Event Reservations** — Reserve seats for upcoming speaking engagements and synod events.
- **Calendar Consultations** — Book personal meetings and pastoral consultations directly from the site.
- **Administration Portal** — Admins and managers can approve payments, publish ministry posts, manage the books catalog, oversee user accounts, and manage events.
- **Role-based Access** — Three access levels: *Admin*, *Manager*, and *Member*, each with appropriate permissions.
- **Global Notifications** — Real-time toast notifications throughout the site for confirmations and alerts.

## Technology

Built with **Next.js (TypeScript)**, vanilla CSS, MongoDB/Mongoose for data persistence, and JWT for session management.

## Authentication & Roles

| Role | Access |
|---|---|
| **Admin** | Full access — approvals, posts, catalog, users, events, meetings |
| **Manager** | Can manage posts, catalog, and view approvals |
| **User (Member)** | Can view purchased books, pending payments, and own reservations |

## Environment Variables

```dotenv
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```