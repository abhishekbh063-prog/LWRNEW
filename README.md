# 🌾 Agricultural Labor Wage Recorder

A futuristic, cyberpunk-themed web application for tracking and managing agricultural worker wages. Built with vanilla JavaScript and Google Sheets as a backend, featuring a stunning sci-fi interface with neon aesthetics.

## Features

- ✅ Record worker wages with date, name, task, hours, and rate
- 💰 Automatic total wage calculation
- 📊 Dashboard view of all wage records
- 👤 Worker details panel with earnings statistics
- ✏️ Edit and delete wage records
- 📋 Task management system with usage tracking
- 🔐 Multi-user authentication system
- 🎨 Cyberpunk/Sci-Fi themed interface with neon colors
- 📱 Mobile-responsive design
- ☁️ Cloud storage using Google Sheets
- 🆓 Free hosting on GitHub Pages

## Design Theme

The application features a cutting-edge cyberpunk aesthetic with:
- Pure black background with cyber grid patterns
- Neon cyan (#00ffff) and magenta (#ff00ff) color scheme
- Angular/hexagonal shapes with clip-path polygons
- Glowing borders and pulsing text effects
- Orbitron and monospace fonts for that tech feel
- Scanline effects and animated gradients
- Glassmorphism effects on panels

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Advanced animations, clip-paths, gradients)
- Vanilla JavaScript

**Backend:**
- Google Apps Script
- Google Sheets (Database with multiple sheets: Wages, Workers, Tasks, Users)

## Quick Start

See [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md) for complete setup guide.

### Summary:
1. Create a Google Sheet and add the Apps Script code
2. Deploy the script as a Web App
3. Upload frontend files to GitHub
4. Configure the script URL in `script.js`
5. Enable GitHub Pages

## File Structure

```
agricultural-wage-recorder/
├── welcome.html            # Landing page with animations
├── login.html              # Authentication page
├── dashboard.html          # Main application interface
├── auth.js                 # Authentication logic
├── style.css               # Cyberpunk styling with animations
├── script.js               # Frontend logic and API calls
├── Code.gs                 # Google Apps Script backend
├── DEPLOYMENT_INSTRUCTIONS.md  # Step-by-step deployment guide
└── README.md               # This file
```

## Usage

1. **First Time Setup:**
   - Visit the welcome page
   - Click "Get Started"
   - Register with username, password, full name, and PIN "ZERO"
   - Login with your credentials

2. **Add a Wage Entry:**
   - Select the date (defaults to today in IST)
   - Enter or select worker name from autocomplete
   - Select or enter task description
   - Input hours worked and wage rate (₹)
   - Total wage calculates automatically
   - Click "Submit Entry"

3. **View Worker Details:**
   - Click "View Worker Details" button
   - Select a worker from dropdown
   - View total earnings, hours, days worked, and average rate
   - See complete work history

4. **Edit/Delete Records:**
   - Click "Edit Records" button
   - Click edit icon on any record
   - Modify details or delete the record
   - Changes sync to Google Sheets

5. **Manage Tasks:**
   - Click "Manage Tasks" button
   - Add new tasks or delete existing ones
   - View task usage statistics
   - Click view icon to see detailed task breakdown

6. **Add Workers:**
   - Click "Add Worker" button
   - Enter worker name to add to the system
   - Worker appears in autocomplete suggestions

## Configuration

Edit `script.js` and replace the placeholder with your Apps Script URL:

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## License

Free to use and modify for personal or commercial purposes.

## Contributing

Feel free to fork this project and submit pull requests for improvements.

## Support

For issues or questions, please refer to the troubleshooting section in DEPLOYMENT_INSTRUCTIONS.md
