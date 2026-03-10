# Pomodoro Timer 🍅

A simple Pomodoro timer web application built as a personal hobby project.

This project is no longer actively maintained and is currently not deployed anywhere.

---

## Overview

- Built for personal use as a lightweight Pomodoro timer.
- Not designed for multi user environments.
- No user authentication or user profiles.
- All data is stored globally in the connected database.
- The project previously used **Upstash Redis** as the datastore.

---

## Features

- 25-minute work timer
- 5-minute break timer
- Browser notifications when the timer finishes
- Timer persistence even after page refresh
- Visual work history graph
- Configurable settings page

---

## Timer Accuracy

Typical browser timers may run longer than expected due to:

- operating system scheduling delays
- browser throttling
- background tab limitations

This project avoids that issue by:

- storing the **target end timestamp**
- calculating remaining time based on the target time

This ensures the timer remains accurate even if execution pauses temporarily.

---

## Refresh-Resilient Timer

The timer remains functional even if the page is refreshed.

Behavior:

- The target end time is stored in the database.
- When the page reloads, the remaining time is recalculated.
- The timer continues from the correct state.

---

## Notifications

The application sends **browser notifications** when the timer reaches zero.

This allows users to receive alerts even if the tab is not active.

---

## Screenshots

### 25 Minute Work Timer
<img width="1918" height="997" alt="timer-25" src="https://github.com/user-attachments/assets/3f70c419-7ddc-49a6-91cb-3dd33ef85645" />

### 5 Minute Break Timer
<img width="1918" height="998" alt="break-5" src="https://github.com/user-attachments/assets/b4c4003f-18e9-42fa-b309-4e1d9f950375" />

### Settings Page
<img width="1918" height="997" alt="settings" src="https://github.com/user-attachments/assets/115cc84e-07b1-400f-843d-06dbbc6669a2" />

### Work History Graph
The application includes a **work history graph** that visualizes completed work sessions.  
Work periods are displayed as **green segments** along a timeline.

Since the project is no longer active and there is currently no database connected, a screenshot of this feature is not available. Screenshots may be added in the future if the project is temporarily redeployed for documentation purposes.

---

## Deployment

The project is not currently hosted.  
To run the application, you must deploy it yourself.

### 1. Clone the Repository

```bash
git clone https://github.com/RJKRanathunga/Pomodoro-web
cd pomodoro-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

This project uses **Upstash Redis** for storage.

Create a `.env.local` file in the project root and add the following variables:

```env
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

These credentials are used by the Redis client located in:

```
app/utils/RedisStorage
```

Example configuration used in the project:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default redis;
```

You can obtain these values by creating a database in **Upstash Redis**.

### 4. Run the Development Server

```bash
npm run dev
```

The application will start at:

```
http://localhost:3000
```

### 5. Production Build (Optional)

To build and run the application in production mode:

```bash
npm run build
npm run start
```

---

## Database

The application requires a **Redis database**.

Originally the project used:

- Upstash Redis

All timer state and session history data are stored in the connected Redis instance.

---

## Database

Originally used:

- **Upstash Redis**

Since the project does not support user accounts:

- all data is stored globally
- all users share the same dataset

---

## Contributing

Contributions are welcome.

If you are interested in improving the project:

- check the **Issues** section
- expected improvements and ideas are listed there

---

## License

You are free to use this project for:

- commercial projects
- non-commercial projects

However, you must host and configure the project yourself.

---
