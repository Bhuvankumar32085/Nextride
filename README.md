# 🚖 NextRide - Microservices Based Ride Booking Platform

NextRide is a production-ready ride booking platform inspired by modern transportation services like Uber and Ola. It is built using a scalable Microservices Architecture with real-time communication, location-based partner matching, Google Authentication, Dockerized services, and cloud deployment.

---

## 🌐 Live Demo

Frontend URL:

https://nextride-phi.vercel.app/

---

# ✨ Features

## 🔐 Authentication & Authorization

* User Registration & Login
* Google OAuth Login
* JWT Authentication
* Role-Based Access Control
* Protected Routes
* Persistent User Sessions

---

## 🚗 Ride Booking System

* Create Ride Requests
* Location-Based Ride Matching
* Find Nearby Partners Within 5 KM Radius
* Ride Status Tracking
* Booking Management

---

## 📍 Real-Time Tracking

* Live Partner Location Updates
* Real-Time Map Synchronization
* Socket.IO Powered Communication
* Dynamic Partner Tracking

---

## 🤝 Partner System

* Partner Onboarding Workflow
* Mobile Number Verification
* Profile Management
* Partner Approval Process
* Real-Time Status Updates

---

## 🎥 Video KYC

* Video KYC Request System
* Approval & Rejection Workflow
* Admin Review System

---

## 🔔 Notification System

* OTP Generation
* Email Verification
* Event-Based Notifications
* Service-to-Service Messaging

---

## 💬 Real-Time Chat

* User ↔ Partner Communication
* Socket.IO Real-Time Messaging
* AI-Based Smart Reply Suggestions

---

## 🤖 AI Features

* AI Chat Suggestions
* Smart Response Recommendations
* Real-Time Conversation Assistance

---

# 🏗️ Architecture

The application follows a Microservices Architecture.

Services:

### Auth Service

Handles:

* User Authentication
* Google Login
* JWT Management
* User Authorization

### Booking Service

Handles:

* Ride Booking
* Booking Management

### Ride Service

Handles:

* Ride Processing
* Ride Lifecycle

### Realtime Service

Handles:

* Socket.IO Connections
* Live Location Updates
* Real-Time Communication

### Notification Service

Handles:

* OTP Management
* Email Notifications

### Utils Service

Handles:

* Shared Utilities
* Common Services

---

# ⚡ Event-Driven Communication

Services communicate using RabbitMQ.

Example Flow:

User Registration

→ Auth Service

→ RabbitMQ Event

→ Notification Service

→ OTP Email Sent

---

# 📡 Real-Time Location Flow

Partner Device

→ Geolocation API

→ Socket.IO

→ Realtime Service

→ User Room

→ Live Map Update

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React.js
* TypeScript
* Redux Toolkit
* Redux Persist
* Axios
* Socket.IO Client
* Tailwind CSS

## Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* RabbitMQ
* Socket.IO
* JWT
* Google OAuth

## DevOps

* Docker
* Docker Hub
* Render
* Vercel

---

# 🗄️ Database

MongoDB is used as the primary database.

Features:

* User Management
* Ride Storage
* Booking Storage
* Partner Data
* Geospatial Queries

---

# 📍 GeoSpatial Search

MongoDB GeoSpatial Queries are used to find nearby partners.

Features:

* 5 KM Radius Matching
* Efficient Ride Assignment
* Reduced Notification Overhead

---

# 🐳 Dockerized Services

Each service runs independently inside Docker containers.

Docker Images:

* nextride-auth
* nextride-booking
* nextride-ride
* nextride-realtime
* nextride-notification
* nextride-utils

---

# 🚀 Deployment

## Frontend

Hosted on Vercel

## Backend

Hosted on Render

## Container Registry

Docker Hub

---

# 🔒 Security Features

* JWT Authentication
* Google OAuth Verification
* Password Hashing using bcrypt
* Protected APIs
* Role-Based Authorization

---

# 📈 Key Learnings

This project demonstrates:

* Microservices Architecture
* Event-Driven Systems
* Real-Time Communication
* Cloud Deployment
* Containerization
* Authentication & Authorization
* Geospatial Queries
* Socket Programming
* Distributed System Design

---

# 👨‍💻 Developer

Bhuvan Kumar

GitHub:
https://github.com/Bhuvankumar32085

---

# ⭐ Future Improvements

* AI Ride Recommendation System
* Driver ETA Prediction
* Push Notifications
* Advanced Analytics Dashboard
* Fraud Detection
* AI-Powered Customer Support

---
