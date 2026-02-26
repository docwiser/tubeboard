# 🚀 Announcing Tubeboard: Your AI-Powered YouTube Analyst

We are thrilled to unveil **Tubeboard**, a cutting-edge web application designed to transform how you interact with YouTube content. Powered by Google's Gemini AI, Tubeboard turns passive watching into active learning and analysis.

Whether you're a student needing a quick summary, a creator looking for scene breakdowns, or a researcher needing precise transcripts, Tubeboard has you covered.

---

## ✨ Key Features

### 🎥 Video Intelligence
- **Smart Summaries**: Get instant, detailed descriptions of any YouTube video.
- **Advanced Transcription**: Generate time-stamped transcripts with speaker identification.
- **Scene Analysis**: Break down videos into key scenes with mood and object detection.
- **Interactive Quizzes**: Test your knowledge with AI-generated quizzes (Multiple Choice, True/False, Short Answer).

### 💬 Context-Aware Chat
- **Streaming Conversations**: Chat with your video in real-time. Ask questions, get clarifications, and dive deeper into the content.
- **History & Context**: The AI remembers your conversation history for a seamless experience.

### 🛠️ Customization & Control
- **Tailored Generation**: Customize quiz difficulty, number of questions, and detail levels.
- **Model Selection**: Choose the right tool for the job—from the lightning-fast **Gemini 2.5 Flash** to the reasoning-heavy **Gemini 3.1 Pro**.
- **Dual Currency Tracking**: Monitor your API usage costs in both **USD ($)** and **INR (₹)** with real-time exchange rate adjustments.

### 📊 Data & Export
- **Export Anywhere**: Download your insights in **JSON**, **CSV**, or **Excel** formats.
- **Cost Transparency**: Track every token used and every cent spent with a detailed cost breakdown dashboard.

---

## ✅ Try It Out Checklist

Ready to explore? Follow this checklist to experience the full power of Tubeboard:

1.  **[ ] Create a Project**:
    -   Click "New Project" in the sidebar.
    -   Paste a YouTube URL (e.g., a TED Talk or tutorial).
    -   Give it a name and hit "Create".

2.  **[ ] Generate a Summary**:
    -   Go to the **Generate** tab.
    -   Click **"Describe Video"**.
    -   Watch the AI analyze the video and provide a comprehensive overview.

3.  **[ ] Test the Quiz Engine**:
    -   Click **"Generate Quiz"**.
    -   *Customization*: Set "Number of Questions" to 5 and "Difficulty" to "Hard".
    -   Take the quiz and see your score!

4.  **[ ] Chat with the Video**:
    -   Switch to the **Chat** tab.
    -   Ask: *"What are the main arguments presented in this video?"*
    -   Observe the streaming response.
    -   Ask a follow-up: *"Can you elaborate on the second point?"*

5.  **[ ] Check the Costs**:
    -   Look at the **Header** to see your current session cost.
    -   Adjust the **Exchange Rate** (USD to INR) using the spinbox in the top right.
    -   Navigate to the **Cost Breakdown** page (click the "Usage" badge) to see detailed charts and history.

6.  **[ ] Export Your Data**:
    -   Go back to your project.
    -   In the "Output History" panel (right side), expand a result.
    -   Click the **Download** icon and select **Excel** to save your analysis.

---

## 🛠️ Technical Stack
-   **Frontend**: React 19, Vite, TypeScript
-   **Styling**: Tailwind CSS v4, Lucide React
-   **AI**: Google Gemini API (`@google/genai`)
-   **State**: Context API + LocalStorage Persistence
-   **Visualization**: Recharts
