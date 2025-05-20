# InsaneLink Tracking Script

A lightweight, reliable script for tracking landing page views in the InsaneLink URL shortening system.

## Features

- Captures landing page arrivals from InsaneLink shortened URLs
- Implements multiple fallback mechanisms for reliable tracking
- Collects performance metrics and environment data
- Automatically cleans URL parameters after tracking
- Minimal impact on page load performance
- Handles page visibility changes

## Installation

### Option 1: Include directly from CDN

```html
<!-- Production version (minified) -->
<script src="https://cdn.jsdelivr.net/gh/your-username/insanelink-tracking@latest/dist/insanelink.min.js" async></script>

<!-- Development version (unminified with console logs) -->
<script src="https://cdn.jsdelivr.net/gh/your-username/insanelink-tracking@latest/dist/insanelink.js" async></script>