# Financial Technologies Lab Reservation System

A comprehensive reservation system for managing the fintech lab seats with support for multiple seat types, user associations, and complex reservation rules.

## Table of Contents

- [Financial Technologies Lab Reservation System](#financial-technologies-lab-reservation-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Features](#key-features)
  - [Features](#features)
    - [User Features](#user-features)
    - [Reservation Features](#reservation-features)
    - [Admin Features](#admin-features)
    - [Technical Features](#technical-features)
  - [Tech Stack](#tech-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Database](#database)

---

## Overview

The Financial Technologies Lab Reservation System is a full-stack web application designed to manage seat reservations in a computer lab with 10 seats across 4 different types. The system supports multiple user associations, complex reservation rules, and administrative controls for managing users, seats, reservations, and events.

### Key Features

- **User Management**: Registration, login, profile management with role-based access control
- **Seat Management**: 10 seats across 4 types (Dotin, Optimization, Laptop, Manager)
- **Reservation System**: Weekly scheduling with 15-minute time slots, 8:00 AM - 2:00 PM operating hours
- **Event Management**: Admins can create events that override reservations
- **Admin Panel**: Full-featured admin interface for managing all aspects of the system
- **Analytics**: Real-time statistics on seat usage, user activity, and reservation trends

---

## Features

### User Features

- User registration with Persian/English username support
- Secure password hashing with bcrypt
- Session-based authentication
- Profile management (update username, email, phone)
- Association-based reservation limits (Dotin affiliates have special privileges)
- First-time user guide flow

### Reservation Features

- Weekly schedule viewing (intervals and timeslots)
- 15-minute time slot increments
- Operating hours: 8:00 AM - 2:00 PM
- Operating days: Saturday - Wednesday (Thursday/Friday closed)
- Daily limit: 2 reservations per user
- System-only reservations (computer only, seat remains free)
- Dotin seat restrictions (current week: all users, next week: Dotin affiliates only)
- Conflict checking with warnings
- Multiple reservation types (internship, project, only running programs, dorsan desk)
- Cancel reservations by ID or by providing all details

### Admin Features

- Full CRUD operations for users, seats, reservations, and events
- Custom event creation with Persian date picker
- Seat schedule viewer with color-coded slots
- Comprehensive analytics dashboard
- Role-based access (admin, event_manager, user)
- Custom admin theme with branding

### Technical Features

- SQLAlchemy ORM with SQLite database
- RESTful API with OpenAPI 3.0 documentation
- CORS support for frontend integration
- Background scheduler for automated tasks
- Session-based authentication with secure cookies

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.13+ | Core programming language |
| Flask | 3.1.3 | Web framework |
| SQLAlchemy | 2.0.50 | ORM for database operations |
| Flask-CORS | 6.0.2 | Cross-Origin Resource Sharing |
| Flask-Admin | Latest | Admin panel interface |
| APScheduler | 3.11.2 | Background task scheduling |
| bcrypt | 4.1.0 | Password hashing |
| jdatetime | 5.2.0 | Persian date handling |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | Latest | React framework |
| Tailwind CSS | Latest | Styling |
| TypeScript | Latest | Type safety |

### Database

| Technology | Purpose |
|------------|---------|
| SQLite | Lightweight relational database |

---
