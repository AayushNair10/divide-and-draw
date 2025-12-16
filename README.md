# Divide and Draw

A collaborative sketching game where players work together to recreate an image, one quadrant at a time.

## About

**Divide and Draw** is a fun, interactive drawing challenge that transforms any photo into a sketch and challenges players to recreate it collaboratively. Each player is assigned a unique quadrant of the image to draw, without seeing the complete picture. Once everyone finishes, the quadrants merge to reveal the final collaborative creation!

### Key Features

- **Photo to Sketch Conversion** - Upload any image and watch it transform into a clean sketch using advanced image processing
- **Multiplayer Support** - Play solo or with 2-4 players
- **Timed Challenges** - Customizable time limits per quadrant (30s, 45s, 60s, or custom)
- **Real-time Drawing Canvas** - Intuitive drawing interface with brush controls
- **Final Reveal** - Side-by-side comparison of the original sketch vs. your team's creation
- **Dark/Light Mode** - Toggle between themes for visual comfort

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Shadcn/ui** for UI components

### Backend

- **Flask** (Python web framework)
- **OpenCV** for image processing
- **NumPy** for numerical operations
- **Pillow** for image handling

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **bun**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/divide-and-draw.git
cd divide-and-draw
```

#### 2. Set Up the Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install flask flask-cors opencv-python numpy pillow
```

#### 3. Set Up the Frontend

```bash
# Navigate to root project folder
cd ..

# Install dependencies
npm install
# or
bun install
```

### Running the Application

#### Start the Backend Server

```bash
cd backend
source .venv/bin/activate  # Activate virtual environment
python main.py
```

The backend will run on `http://localhost:8000`

#### Start the Frontend Development Server

In a new terminal:

```bash
npm run dev
# or
bun dev
```

The frontend will run on `http://localhost:5173`

#### Open the Application

Navigate to `http://localhost:5173` in your browser.

## How to Play

1. **Upload an Image** - Choose any photo you want to turn into a sketch
2. **Configure Game Settings**
   - Select number of players (1, 2, or 4)
   - Set time limit per quadrant
   - Enter player names
3. **Start Drawing** - Each player draws their assigned quadrant using the reference sketch
4. **Final Reveal** - See how your team's collaborative drawing compares to the original!

## Project Structure

```

divide-and-draw/
├── backend/
│   ├── __pycache__/
│   ├── .env                 # Environment variables (API keys)
│   ├── .gitignore
│   ├── main.py              # Flask server with image processing & AI
│   └── requirements.txt     # Python dependencies
├── dist/                    # Production build output
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── game/
│   │   │   ├── CountdownScreen.tsx # Countdown
│   │   │   ├── DrawingCanvas.tsx   # Drawing board
│   │   │   ├── GameProgress.tsx    # Track quadrant, player
│   │   │   ├── GameTimer.tsx       # Countdown
│   │   │   └── ReferenceSketch.tsx # Converted sketch
│   │   ├── ui/              # Shadcn UI components
│   │   ├── DarkModeToggle.tsx
│   │   ├── GameRules.tsx
│   │   ├── HeroSection.tsx
│   │   └── LoadingScreen.tsx
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   ├── Begin.tsx        # Game setup page
│   │   ├── Draw.tsx         # Drawing canvas page
│   │   ├── Index.tsx        # Landing page
│   │   ├── NotFound.tsx     # 404 page
│   │   └── Results.tsx      # Final reveal + AI enhancement
│   ├── App.css
│   ├── App.tsx              # Main app component
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md

```

## Image Processing Pipeline

The backend uses a sophisticated image processing pipeline:

1. **Decode & Resize** - Maintain aspect ratio while limiting max size
2. **Grayscale Conversion** - Convert to single channel
3. **Bilateral Filter** - Smooth image while preserving edges
4. **CLAHE** - Enhance local contrast
5. **Contrast Boost** - Increase overall contrast
6. **Adaptive Thresholding** - Extract clean line art
7. **Morphological Operations** - Remove noise and speckles

## HCI Concepts

This project incorporates several Human-Computer Interaction principles:

- **Accessibility** - Dark/Light mode toggle for visual comfort
- **Collaborative Interaction** - Multiple users contributing simultaneously
- **Immediate Feedback** - Instant visual comparison in final reveal
- **User Control & Freedom** - Easy restart with "Play Again" option
- **Aesthetic Design** - Hand-drawn fonts and sketch-style visuals
- **Learnability** - Minimal instructions with intuitive UI

## Future Enhancements

- **AI Enhancement** - AI reinterprets the team's drawing to create unique artistic results
- **Accuracy Scoring** - Calculate how closely the drawing matches the original
- **Online Multiplayer** - Play with friends remotely
- **Gallery** - Save and share your collaborative creations
- **More Game Modes** - Speed rounds, blind drawing, etc.

## Author

**Aayush Nair**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
```
