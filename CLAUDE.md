# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side web application for an "Advanced Sticker Customizer with Image Editor" built as a single HTML file with embedded CSS and JavaScript. The application provides image editing capabilities and sticker customization features.

## Architecture

### Single-File Application Structure
- **index.html**: Contains the entire application - HTML structure, CSS styles, and JavaScript functionality
- No build system, package.json, or external dependencies beyond CDN resources
- Uses Fabric.js 5.3.0 from CDN for canvas manipulation

### Core Components

#### Main Classes
- **ImageEditor** (`index.html:2716`): Primary application controller managing the Fabric.js canvas and UI interactions
- **BackgroundRemover** (`index.html:2130`): Handles background removal with Web Worker support for performance
- **ContourDetector** (`index.html:2383`): Generates contour paths from processed images

#### Key Features
- Canvas-based image editing using Fabric.js
- Background removal with threshold controls
- Contour detection and path generation
- Image rotation, cropping, and transformation tools
- Sticker customization with shapes, materials, and sizing options

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Canvas Library**: Fabric.js 5.3.0
- **Image Processing**: Custom algorithms with Web Worker support
- **No Backend**: Pure client-side application

## Development Workflow

### Testing the Application
- Open `index.html` directly in a web browser
- No build process or local server required
- Test image upload and editing features
- Verify background removal and contour detection functionality

### Making Changes
- Edit the `index.html` file directly
- All code (HTML, CSS, JS) is contained in this single file
- Changes are immediately visible when refreshing the browser
- No compilation or build steps needed

### Performance Considerations
- Background removal uses Web Workers when available to prevent UI blocking
- Large image processing may require threshold adjustments for performance
- Memory usage scales with image size and complexity

## Code Organization

### JavaScript Structure
- All JavaScript is embedded in `<script>` tags at the bottom of index.html
- Classes are defined globally and instantiated on DOM ready
- Event handlers are bound during initialization
- Canvas operations use Fabric.js API patterns

### CSS Architecture
- Embedded styles in `<style>` tags within the `<head>`
- Component-based class naming (`.editor-`, `.toolbar-`, `.tab-`)
- Responsive design with mobile breakpoints
- Flexbox and CSS Grid for layout

### HTML Structure
- Semantic section-based layout
- Tab-based interface for different editing modes
- Toolbar with tool groups and separators
- Modal dialogs for advanced features

## Key Development Notes

- The application is designed for Shopify integration (references to `.shopify-section`)
- Image processing algorithms are performance-optimized with progress callbacks
- Error handling is implemented for image processing operations
- The codebase includes extensive console logging for debugging
- Web Worker support provides non-blocking background processing