# Mocktale: The Jericho Missile of API Mocking

**"Is it better to be feared or respected? I say, is it too much to ask for both?"**

Welcome to **Mocktale**. I built this because, frankly, waiting for backend APIs to be ready is like waiting for the Senate to approve a budget—painful, slow, and completely unnecessary when you have my patience to build your own stuff.

This isn't just a mock server. It's a precision-engineered, high-performance ecosystem for simulating your entire backend architecture. It’s the Mark LXXXV of developer tools. You're welcome.

---

## 🏗️ The Architecture (The Suit)

We're running a dual-core setup here. Elegant, efficient, and powerful.

*   **The Face (UI)**: A React application built with Vite. It's snappy, it's responsive, it looks good. Because if it doesn't look cool, what's the point?
*   **The Brain (Service)**: A Node.js Express server backed by SQLite. It handles the logic, stores your mocks, and serves the UI. It’s the JARVIS to your Iron Man.

---

## 🚀 Capabilities (Weapons Systems)

What can it do? A better question is, what *can't* it do? (Okay, it can't make coffee... yet.)

*   **Dynamic API Mocking**: Define endpoints, methods, and responses. It’s like rewriting reality, but for HTTP requests.
*   **Smart Matching**: We don't just match paths. We match headers. We match JSON bodies (Exact or Schema-based). If the request isn't perfect, Mocktale won't give it the time of day.
*   **Project Management**: Organize your APIs into projects. Keep your chaos contained.
*   **Swagger Integration**: Because documentation is for the people who come after us, and we want them to be impressed.
*   **Static Serving**: The service serves the UI. One port to rule them all. `localhost:3000`. Memorize it.

---

## 🛠️ Fabrication (Building the Thing)

I didn't just leave you with a pile of parts. I built the assembly line.

### The "I Want It All" Scripts

I wrote scripts for both Windows and Linux because I'm benevolent like that. These scripts build the UI, move the assets, install dependencies, and even build a Docker image tagged with your git branch.

**For the Windows Crowd (PowerShell):**
```powershell
.\build.ps1
```
*Tip: You can specify `-ContainerTool podman` if you're trying to be different.*

**For the Linux/Mac Rebels (Bash):**
```bash
chmod +x build.sh
./build.sh
```

### The "Old Fashioned" Way (Manual)

If you like doing things the hard way—like hammering the first suit in a cave—be my guest:

1.  **Build the UI**: `cd ui && npm install && npm run build`
2.  **Move the Assets**: Copy `ui/dist` to `service/static`.
3.  **Start the Service**: `cd service && npm install && node index.js`

---

## 🐳 The Iron Legion (Docker)

Containerization. It’s the future. I’ve already set up a multi-stage Dockerfile that builds the whole package into a single, deployable unit.

**Build it:**
```bash
docker build -t mocktale:latest .
```

**Run it:**
```bash
docker run -p 3000:3000 mocktale:latest
```

Boom. You're live.

---

## 📝 Final Thoughts

Use it. Break it. Fix it. Make it better. That's what we do.

And if you find a bug? It’s not a bug. It’s an undocumented feature testing your ability to adapt.

