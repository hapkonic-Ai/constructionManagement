# Phase 6 — CFO: Finance & Budget (Week 9–11)

[← Back to Master Tracker](./tracker.md)

Financial management and budget allocation module for the CFO.

## 6.1 CFO Dashboard
**Route**: `/cfo`

Overview widgets: Total budget allocated, total spent, remaining, pending requests

## 6.2 Fund Allocation
- View CMO cost estimation requests per project
- Approve and allocate specific budget amounts
- Partial allocation with notes (e.g., "Phase 1 only")

## 6.3 Budget Adjustments (COO-triggered)
- When COO raises cost deviation, CFO sees alert
- Can reallocate funds between line items or request CEO approval for over-budget

## 6.4 Finance Ledger
- Per-project transaction log: allocation events, spending entries, reallocation events
- Running balance per project
- Summary exportable as CSV/PDF report

## 6.5 Billing Management
- Invoice creation per project (client-facing)
- Payment status tracking
- Integration-ready (Razorpay / Stripe webhook receiver, pluggable)
