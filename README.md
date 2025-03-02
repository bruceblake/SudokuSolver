# Sudoku Solver

A modern, interactive Sudoku puzzle game and solver built with React, TypeScript, and Tailwind CSS. Play Sudoku at different difficulty levels and leverage advanced backtracking algorithms to solve challenging puzzles.

![Sudoku Solver Screenshot](https://github.com/user-attachments/assets/de101abd-8816-4b2d-a49f-9e049209c526)

## Features

- 🎮 Play Sudoku at four difficulty levels: Easy, Medium, Hard, and Expert
- 🧩 Interactive game board with highlighting of related cells
- 🔍 Get hints when you're stuck
- ⚡ Use the automatic solver with backtracking algorithm
- 🎯 Visual validation and conflict detection
- ⏱️ Track time, moves, and hints used
- 🎨 Modern UI with smooth animations
- 📱 Responsive design for desktop and mobile
- 🌓 Dark/Light Theme support
- 🏆 Leaderboard to track best performances
- 🔐 User authentication for saving progress

## Technology Stack

- **React 18** - Modern UI library for building interactive interfaces
- **TypeScript** - For type safety and better developer experience
- **Vite** - Fast, modern frontend build tool
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Firebase** - Authentication and database for leaderboard functionality

## How It Works

The Sudoku solver uses a backtracking algorithm to solve puzzles:

1. **Find an empty cell** - Locate the next empty cell in the grid
2. **Try numbers 1-9** - For each number, check if it can be placed in the cell without violating Sudoku rules
3. **Recursively solve** - If a number is valid, recursively attempt to solve the rest of the puzzle
4. **Backtrack** - If no solution is found with a particular number, undo the placement and try the next number

This approach efficiently finds solutions even for the most challenging Sudoku puzzles.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/sudokusolver.git
cd sudokusolver
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
# or
yarn build
```

The build files will be located in the `dist` directory.

## License

MIT

## Acknowledgements

- Sudoku puzzle generation algorithms inspired by research in constraint satisfaction problems
- UI design inspired by modern material design principles
