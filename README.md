# The Journey Back: A Point-and-Click Visual Novel

## Overview
This is a simple, JavaScript-based point-and-click adventure game running in an Electron app. The story follows a young girl traveling to Mars to bring her long-lost grandfather home. As they journey back to Earth, the two characters bond, revealing their personalities and histories through conversations.

---

## File Structure

src/        
├── controllers/ # Handles input, data saving, state management, and rendering.    
├── fonts/ # Contains font files for the app.    
├── media/ # Holds images, language files, audio, and video (except language files, media files are ignored by Git).    
├── models/ # Core logic for user and sprite objects, methods for views, rendering, and sound playback.    
├── tests/ # Unit tests for the app.    
├── view/ # Scene-specific JSON files defining backgrounds, sounds, and UI elements.   

---

## App Flow

1. **`Electron.js`**  
   - Entry point for the app.
   - Sets up the main Electron window and loads the app.
   - Configures the browser window parameters such as size and UI settings.

2. **`App.js`**  
   - Main React component that initializes the application.
   - Loads the `Game` component inside a basic layout.

3. **`Game.js`**  
   - Orchestrates the game's initial setup:
     - Starts the timer.
     - Sets the initial view (`menu`).
     - Sets the starting content (`startScreen`).
     - Calls `RenderManager` to begin rendering the app.

4. **`RenderManager.js`**  
   - Manages rendering based on the current state of the game.
   - Calls the view.js file-s to render the proper scenes

---

## Installation and Setup

1. **Build the Application**
```bash
   npm run build
```

2. **Start the Application**
```bash
   npm start
```

