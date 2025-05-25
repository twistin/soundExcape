# soundXcape 🎶🌍

**soundXcape: Captura, Organiza y Explora Tu Mundo Auditivo.**

soundXcape is a modern web application designed for field recordists, sound designers, audio enthusiasts, and anyone passionate about capturing and cataloging sounds. It provides a comprehensive platform to manage sound recording projects, from initial planning and on-site documentation to organizing and revisiting your audio treasures, now enhanced with direct media capture and AI-powered assistance through the Google Gemini API.

## ✨ Features

*   **Project Management:**
    *   Create, edit, and delete sound projects.
    *   Define project details: name, location, theme, date, and general notes.
    *   Specify technical equipment used (microphone, recorder, settings).
*   **Detailed Recording Organization:**
    *   Add multiple recordings to each project.
    *   Document recordings with title, description, specific location (optional), and precise timestamp.
    *   Tag recordings for easy filtering and searching.
*   **Media Capture & Management:**
    *   **Real Audio Recording & Playback:** Capture voice notes directly within the app using the device microphone. Recorded audio is stored locally (base64) and can be played back.
    *   **Actual Photo Capture:** Use the device camera to take photos and associate them with recordings. Photos are stored locally (base64 data URLs).
*   **Gemini API Powered Enhancements (Requires API Key):**
    *   **Smart Tagging:** AI suggests relevant tags for recordings based on their title and description.
    *   **Voice Note Summarization (Conceptual):** AI provides a brief summary or imagined transcription for voice notes based on their title and duration (as direct client-side audio analysis via Gemini API is complex for this scope).
    *   **Enhanced Search (Conceptual):** AI augments search by suggesting related queries or content types based on user input.
    *   **AI Content Ideas:** Get creative recording ideas from AI based on project theme and location.
*   **Offline First with Local Storage:**
    *   All project, recording, and captured media data is saved in the browser's local storage.
*   **Responsive Design & Dark Mode:**
    *   User-friendly interface adapting to all screen sizes, with a comfortable dark theme by default.
*   **Simulated Map View:**
    *   Visualize project locations on a simulated map.
*   **Utilities Section:**
    *   Manage app settings (dark mode toggle).
    *   View reminders.
    *   **Placeholder Features (Require Backend/Further Development):**
        *   *Cloud Synchronization:* UI toggle to simulate enabling/disabling cloud backup.
        *   *Advanced Reporting:* Simulate report generation.
        *   *Collaboration:* UI elements indicate this as a future feature.

## 🛠️ Technology Stack

*   **Frontend:**
    *   React 19
    *   TypeScript
    *   Tailwind CSS
*   **AI Integration:**
    *   **Google Gemini API (`@google/genai`):** For smart tagging, content ideas, and conceptual AI assistance. Model: `gemini-2.5-flash-preview-04-17`.
*   **Routing:** React Router DOM
*   **State Management:** React Context API (`AppContext`)
*   **Local Storage:** Custom `useLocalStorage` hook for data persistence.
*   **Media Capture:** Browser's `navigator.mediaDevices.getUserMedia`, `MediaRecorder API`.
*   **Icons:** Heroicons (via inline SVGs)

## 🚀 Getting Started

### Prerequisites

*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   For AI features: A Google Gemini API Key.

### Running the Application

1.  **Clone the repository (if applicable) or ensure all files are in their correct directory structure.**
2.  **Set up Gemini API Key (Crucial for AI Features):**
    *   The application requires a Google Gemini API key to enable AI-powered features.
    *   This key **must** be provided as an environment variable named `API_KEY`.
    *   How to set `process.env.API_KEY`: This depends on your serving environment.
        *   If using a simple live server or opening `index.html` directly, this is tricky. You might need to temporarily hardcode it in `services/geminiService.ts` for testing (e.g., `const API_KEY = "YOUR_ACTUAL_API_KEY";`) **BUT REMOVE IT before committing or sharing.**
        *   For development with tools like Vite or Create React App (if you adapt the project), you'd use `.env` files (e.g., `VITE_API_KEY=your_key` and access via `import.meta.env.VITE_API_KEY`).
    *   **Important:** The application itself does **not** provide any UI to enter this key. It must be available in the `process.env.API_KEY` environment variable during runtime for the `geminiService.ts` to pick it up. If the key is missing or invalid, AI features will be disabled or show errors.
3.  **Open the Application:**
    *   Serve the `index.html` file through a local web server or open it directly in your browser.

## 📂 Project Structure
```
soundXcape/
├── components/         # Reusable UI components
├── contexts/           # React Context for global state
├── hooks/              # Custom React hooks
├── pages/              # Screen-level components
├── services/           # External API services (geminiService.ts)
├── App.tsx             # Main application component
├── constants.tsx       # SVG Icon components and shared constants
├── index.html          # Main HTML entry point
├── index.tsx           # Root React rendering setup
├── metadata.json       # Application metadata
├── README.md           # This file
└── types.ts            # TypeScript type definitions
```

## 🎨 UI/UX Design

*   **Dark Theme & Responsive:** Consistent with previous design.
*   **Interactive Media:** Clear buttons and modals for photo and audio capture.
*   **AI Integration:** Subtle AI icons (`SparklesIcon`) and clear labeling for AI-assisted features. Loading states and error messages for AI interactions.

## 🔒 Permissions

As defined in `metadata.json`, the application requests:
*   `camera`: For capturing photos.
*   `microphone`: For recording voice notes.
The browser will prompt the user for these permissions when the features are first used.

## 🔮 Future Vision (Beyond Current Implementation)

*   **Full Cloud Synchronization:** Requires a robust backend and database solution.
*   **True Advanced Reporting:** Client-side libraries (jsPDF, PapaParse) or server-side generation.
*   **Real-time Collaboration:** Websockets, conflict resolution, and a backend.
*   **Direct Audio Analysis with AI:** Processing audio content directly for more accurate tagging or transcription (potentially using other Google Cloud AI services or more advanced Gemini capabilities if client-side processing becomes more feasible).
*   **Geo-location Services:** Using actual GPS data for map markers.

---

Thank you for exploring soundXcape! We hope these new media capture and AI features enhance your sound exploration journey.
