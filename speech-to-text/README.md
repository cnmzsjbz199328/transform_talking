# LazyDog - Interactive Mindmap Application

This project is a React application that provides interactive mindmap functionality using Mermaid.js for visualization and Zhipu AI for content generation.

## Project Overview

LazyDog allows users to create and interact with mindmaps in a dynamic way:

- Click on any node to expand it with AI-generated content
- Visualize complex relationships in an organized structure
- Seamlessly integrate AI-generated content with existing mindmaps

## Features

- **Interactive Mindmaps:** Click on nodes to expand them with more detailed content
- **Mermaid.js Integration:** Uses Mermaid.js for rendering mindmaps
- **AI-Powered Content Generation:** Leverages Zhipu AI for intelligent node expansion
- **Context-Aware Suggestions:** Generates content based on surrounding nodes and context

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Zhipu AI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lazydog.git
   cd lazydog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Zhipu AI API key in the environment variables.

### Running the Application

Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000.

### Building for Production

Create a production build:

```bash
npm run build
```

The build files will be created in the `build` folder, ready for deployment.

## Project Structure

- **public/** - Static assets and HTML template
- **src/** - Source code
  - **components/** - React components
  - **services/** - API integration and services
  - **hooks/** - Custom React hooks
  - **utils/** - Utility functions

## Implementation Plan

The project implements an interactive mindmap that follows this implementation plan:

1. **Enhanced Mindmap Rendering** - Making nodes clickable with visual feedback
2. **Node Data Extraction** - Converting Mermaid format to structured node trees
3. **Context Information Collection** - Gathering relevant information for AI processing
4. **API Integration** - Connecting with Zhipu AI for content generation
5. **Mindmap Update & Merging** - Seamlessly integrating new content with existing maps
6. **UI/UX Enhancements** - Creating a fluid user experience with loading indicators

## Technologies Used

- React
- Mermaid.js
- Font Awesome
- Zhipu AI API

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

For more information about React development, check out the [React documentation](https://reactjs.org/).