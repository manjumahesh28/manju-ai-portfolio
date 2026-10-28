---
title: Project — Account Management System (Ddesigny)
---

# Project — Account Management System (Ddesigny)

## Overview
Manju built an in-house Account Management System for Ddesigny Architectural Consultancy in Abu Dhabi between August and September 2026. It replaced manual tracking of client accounts, invoices and payments with one web application. Staff use it to manage client accounts, invoices, payments and expense records, and a dashboard shows balances and pending payments.

## Tech stack
- Frontend: React.js
- Backend: Django and Django REST Framework (REST APIs)
- Database: MySQL
- TODO: libraries used (for example Axios, React Router, a UI library, the PDF/Excel library)

## Features
- Client accounts: create and manage records for each client.
- Invoices: create invoices and track their status.
- Payments: record payments against invoices, so pending balances update.
- Expenses: record company expenses.
- Dashboard: shows balances and pending payments at a glance.
- Reports: monthly summaries exported to PDF and Excel.
- TODO: correct or add features based on what you actually built

## Data model
Manju designed the database structure and the REST APIs.
- TODO: list the main Django models and how they relate (for example Client has many Invoices; Invoice has many Payments)

## Login and role-based access
The system has secure login and role-based access, so each user can only view and edit the records relevant to them.
- TODO: what roles existed (for example Admin, Accountant, Viewer) and what each could do
- TODO: how it was enforced (for example Django permissions or groups, checks in API views)

## Reports and exports
Monthly summaries can be exported as PDF and Excel files.
- TODO: which libraries generated them (for example ReportLab or WeasyPrint for PDF, openpyxl or pandas for Excel)

## Testing and rollout
Manju tested the system, fixed bugs reported by staff, and helped users get started with it.
- TODO: one real bug you fixed and how

## Challenges and what Manju learned
- TODO: the hardest problem (for example keeping invoice balances correct when partial payments come in, or setting up role permissions) and how you solved it

## Links
- TODO: GitHub link, or say "The code is private to Ddesigny"