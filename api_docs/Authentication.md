---
title: Authentication API
description: Rest API to handle user login, logout and registering
---

# Authentication API

Use this api to authenticate users and manage their sessions.

## **Register User**

Creates a new user account in the system.

**Request:**

POST `/api/auth/register`

**Request Body:**

| Attribute     | Type   | Required | Description                                    |
|---------------|--------|----------|------------------------------------------------|
| username      | string | Yes      | Unique username for the account                |
| password      | string | Yes      | Password (must meet security requirements)     |
| email         | string | No       | User's email address (required if phone not provided) |
| phone         | string | No       | User's phone number (required if email not provided) |
| association   | string | No       | User's organization or group affiliation       |

**Password Requirements:**

The password must meet all of the following criteria:

- At least 8 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)

**Successful Response (201 Created):**

```json
{
  "success": true,
  "message": "Registration successful! You can now log in to your new account.",
  "data": {
    "username": "JohnDoe",
    "association": "Dotin"
  }
}
```

## **Login user**

Authenticates a user with their username and password and starts a new session.

**Request**

POST `/api/auth/login`

**Request Body**

| Attribute  | Type   | Required | Description                |
|------------|--------|----------|----------------------------|
| username   | string | Yes      | The user's unique username |
| password   | string | Yes      | The user's password        |

**Response (200 OK):**

| Attribute              | Type   | Description                           |
|------------------------|--------|---------------------------------------|
| success                | boolean| Indicates if request succeeded        |
| message                | string | Human-readable status message         |
| data                   | object | User profile data                     |
| data.username          | string | Username of authenticated user        |
| data.association       | string or null | User's organization           |
| data.email             | string or null | User's email address          |
| data.phone             | string or null | User's phone number           |


**successful response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "username": "JohnDoe",
    "association": "Dotin",
    "email": "john@example.com",
    "phone": null
  }
}
```
**Error Response (400):**

In the case that the username or password is missing.

```json
{
  "success": false,
  "message": "Username and password required"
}
```
**Error Response (401):**

In the case that the username does not exist in the database or the user has entered a wrong 
password.

```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

## **Logout user**

Clears the current session for the user

**Request**

POST `api/auth/logout`

**Request body**

None required

**successful response (200 OK)**

```json
{
  "success" : true,
  "message" : "Logged out successfully"
}
```

**Error response (401 UNATHORIZED)**

```json
{
  "success" : false,
  "message" : "You are not logged in"
}
```