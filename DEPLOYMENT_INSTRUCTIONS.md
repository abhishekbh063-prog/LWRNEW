# Agricultural Labor Wage Recorder - Deployment Instructions

## Part 1: Google Apps Script Backend Setup

### Step 1: Create a New Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create a new spreadsheet
3. Rename it to "Agricultural Labor Wage Recorder"

### Step 2: Open Apps Script Editor
1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. Copy the entire contents of `Code.gs` file
4. Paste it into the Apps Script editor
5. Click the **Save** icon (💾) or press `Ctrl+S`
6. Name your project "Wage Recorder Backend"

### Step 3: Test the Script (Optional)
1. In the Apps Script editor, select the `testSetup` function from the dropdown
2. Click **Run** (▶️)
3. You'll be prompted to authorize the script:
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**
4. Check your Google Sheet - it should now have headers and a test row

### Step 4: Deploy as Web App
1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Wage Recorder API v1"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. You may need to authorize again - follow the same steps as before
7. **IMPORTANT**: Copy the **Web app URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
8. Click **Done**

### Step 5: Note Your Web App URL
Save this URL - you'll need it for the frontend configuration.

---

## Part 2: Frontend Deployment on GitHub Pages

### Step 1: Create a GitHub Repository
1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Configure your repository:
   - **Repository name**: `agricultural-wage-recorder`
   - **Description**: "Agricultural Labor Wage Recorder Web App"
   - **Public** (required for GitHub Pages free tier)
   - Check **Add a README file**
4. Click **Create repository**

### Step 2: Upload Frontend Files
1. In your repository, click **Add file** → **Upload files**
2. Upload these three files:
   - `index.html`
   - `style.css`
   - `script.js`
3. Click **Commit changes**

### Step 3: Configure the Script URL
1. In your repository, click on `script.js`
2. Click the **pencil icon** (✏️) to edit
3. Find this line at the top:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
4. Replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your actual Web App URL from Part 1, Step 4:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
5. Click **Commit changes**

### Step 4: Enable GitHub Pages
1. In your repository, click **Settings**
2. In the left sidebar, click **Pages**
3. Under "Source", select:
   - **Branch**: main
   - **Folder**: / (root)
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Your site will be available at:
   ```
   https://[your-username].github.io/agricultural-wage-recorder/
   ```

### Step 5: Test Your Application
1. Visit your GitHub Pages URL
2. Try adding a wage entry:
   - Fill in all fields
   - Watch the total calculate automatically
   - Click "Submit Entry"
3. Click "Refresh Data" to see your entry in the table
4. Check your Google Sheet - the data should appear there too

---

## Troubleshooting

### Issue: "Error loading data" message
**Solution**: 
- Verify your SCRIPT_URL in `script.js` is correct
- Make sure you deployed the Apps Script as "Anyone" can access
- Check browser console (F12) for specific errors

### Issue: Data submits but doesn't appear in table
**Solution**:
- Wait a few seconds and click "Refresh Data"
- Check your Google Sheet directly to verify data was saved
- The POST request uses `no-cors` mode, so it may take a moment

### Issue: "Authorization required" when running Apps Script
**Solution**:
- Click "Review Permissions" and authorize the script
- Make sure you're signed into the correct Google account

### Issue: GitHub Pages shows 404 error
**Solution**:
- Wait 2-3 minutes after enabling GitHub Pages
- Verify the repository is public
- Check that `index.html` is in the root directory

---

## Updating Your Application

### To Update the Frontend:
1. Edit files directly on GitHub (click file → pencil icon)
2. Or use Git to clone, edit, and push changes
3. Changes appear on GitHub Pages within 1-2 minutes

### To Update the Backend:
1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Make your changes
4. Click **Deploy** → **Manage deployments**
5. Click the pencil icon (✏️) next to your deployment
6. Change the version to "New version"
7. Click **Deploy**

---

## Security Notes

- The Apps Script is set to "Anyone" access because GitHub Pages is a public frontend
- Consider adding authentication if handling sensitive wage data
- The Google Sheet is only accessible to you (the owner)
- Never commit sensitive credentials to GitHub

---

## Optional Enhancements

1. **Add Data Validation**: Modify the Apps Script to validate input data
2. **Export to CSV**: Add a button to download wage records as CSV
3. **Date Range Filtering**: Add filters to view records by date range
4. **Worker Statistics**: Calculate total wages per worker
5. **Custom Domain**: Configure a custom domain for your GitHub Pages site

---

## Support

If you encounter issues:
1. Check the browser console (F12) for JavaScript errors
2. Check the Apps Script execution logs (View → Logs)
3. Verify all URLs are correctly configured
4. Ensure your Google Sheet has the correct permissions

---

**Congratulations!** Your Agricultural Labor Wage Recorder is now live and ready to use.
