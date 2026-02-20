/**
 * Agricultural Labor Wage Recorder - Google Apps Script Backend
 * 
 * This script handles data storage and retrieval for the wage recorder application.
 * It connects to a Google Sheet and provides REST API endpoints.
 */

// Configuration
const SHEET_NAME = 'WageRecords';
const WORKERS_SHEET_NAME = 'Workers';
const TASKS_SHEET_NAME = 'Tasks';
const USERS_SHEET_NAME = 'Users';
const REGISTRATION_PIN = 'ZERO'; // Change this to your desired registration PIN

/**
 * Initialize the spreadsheet with headers if needed
 */
function initializeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Check if headers exist
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    const headers = ['Date', 'Worker Name', 'Task Description', 'Hours Worked', 'Wage Rate', 'Total Wage', 'Timestamp'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  // Initialize Workers sheet
  let workersSheet = ss.getSheetByName(WORKERS_SHEET_NAME);
  if (!workersSheet) {
    workersSheet = ss.insertSheet(WORKERS_SHEET_NAME);
    const headers = ['Worker Name', 'Status', 'Last Entry Date', 'Total Entries'];
    workersSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    workersSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    workersSheet.setFrozenRows(1);
  }
  
  // Initialize Tasks sheet
  let tasksSheet = ss.getSheetByName(TASKS_SHEET_NAME);
  if (!tasksSheet) {
    tasksSheet = ss.insertSheet(TASKS_SHEET_NAME);
    const headers = ['Task Name', 'Times Used', 'Last Used Date'];
    tasksSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    tasksSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    tasksSheet.setFrozenRows(1);
    
    // Add default tasks
    const defaultTasks = [
      ['Harvesting', 0, ''],
      ['Planting', 0, ''],
      ['Weeding', 0, ''],
      ['Irrigation', 0, ''],
      ['Fertilizing', 0, '']
    ];
    tasksSheet.getRange(2, 1, defaultTasks.length, 3).setValues(defaultTasks);
  }
  
  // Initialize Users sheet
  let usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(USERS_SHEET_NAME);
    const headers = ['User ID', 'Username', 'Password', 'Full Name', 'Registration Date', 'Last Login'];
    usersSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    usersSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    usersSheet.setFrozenRows(1);
    
    // Format password column as TEXT to preserve numeric passwords
    usersSheet.getRange('C:C').setNumberFormat('@');
    
    // Protect the sheet
    const protection = usersSheet.protect().setDescription('User credentials');
    protection.setWarningOnly(true);
  }
}

/**
 * Handle GET requests - Fetch all wage records or worker names
 */
function doGet(e) {
  try {
    initializeSheet();
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const params = e.parameter;
    
    // Check if requesting worker names
    if (params.action === 'getWorkers') {
      const workersSheet = ss.getSheetByName(WORKERS_SHEET_NAME);
      const lastRow = workersSheet.getLastRow();
      
      if (lastRow <= 1) {
        return ContentService
          .createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = workersSheet.getRange(2, 1, lastRow - 1, 4).getValues();
      const workers = data.map(row => ({
        name: row[0],
        status: row[1],
        lastEntryDate: formatDate(row[2]),
        totalEntries: row[3]
      }));
      
      return ContentService
        .createTextOutput(JSON.stringify(workers))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if requesting tasks
    if (params.action === 'getTasks') {
      const tasksSheet = ss.getSheetByName(TASKS_SHEET_NAME);
      const lastRow = tasksSheet.getLastRow();
      
      if (lastRow <= 1) {
        return ContentService
          .createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = tasksSheet.getRange(2, 1, lastRow - 1, 3).getValues();
      const tasks = data
        .map((row, index) => ({
          id: index + 2,
          name: row[0],
          timesUsed: row[1],
          lastUsedDate: formatDate(row[2])
        }))
        .filter(task => task.name && task.name.toString().trim() !== '');
      
      return ContentService
        .createTextOutput(JSON.stringify(tasks))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Default: Return wage records
    const sheet = ss.getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    
    // If only headers exist, return empty array
    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data (skip header row)
    const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    
    // Convert to JSON array with row IDs, filtering out empty rows
    const records = data
      .map((row, index) => ({
        id: index + 2, // Row number in sheet (starting from 2)
        date: formatDate(row[0]),
        workerName: row[1],
        taskDescription: row[2],
        hoursWorked: row[3],
        wageRate: row[4],
        totalWage: row[5]
      }))
      .filter(record => record.workerName && record.workerName.toString().trim() !== ''); // Filter out empty rows
    
    // Return JSON response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify(records))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests - Add new wage record or update/delete existing
 */
function doPost(e) {
  try {
    Logger.log('=== doPost called ===');
    Logger.log('Request content: ' + e.postData.contents);
    
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    Logger.log('Parsed action: ' + data.action);
    
    // Handle authentication actions first (before initializeSheet)
    if (data.action === 'login') {
      Logger.log('Processing login request');
      initializeSheet(); // Initialize to ensure Users sheet exists
      const result = authenticateUser(data.username, data.password);
      Logger.log('Login result: ' + JSON.stringify(result));
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'register') {
      Logger.log('Processing registration request');
      initializeSheet(); // Initialize to ensure Users sheet exists
      const result = registerUser(data.pin, data.username, data.password, data.fullName);
      Logger.log('Registration result: ' + JSON.stringify(result));
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // For all other actions, initialize sheets
    initializeSheet();
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Handle different actions
    if (data.action === 'update') {
      // Update existing record
      const rowNum = parseInt(data.id);
      
      // Verify row exists and is not header
      if (rowNum < 2 || rowNum > sheet.getLastRow()) {
        throw new Error('Invalid row number');
      }
      
      const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      
      sheet.getRange(rowNum, 1).setValue(data.date);
      sheet.getRange(rowNum, 2).setValue(data.workerName);
      sheet.getRange(rowNum, 3).setValue(data.taskDescription);
      sheet.getRange(rowNum, 4).setValue(data.hoursWorked);
      sheet.getRange(rowNum, 5).setValue(data.wageRate);
      sheet.getRange(rowNum, 6).setValue(data.totalWage);
      sheet.getRange(rowNum, 7).setValue(new Date(indiaTime));
      
      // Update worker status
      updateWorkerStatus(data.workerName, 'Entered');
      
      // Update task usage
      updateTaskUsage(data.taskDescription);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Record updated successfully' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (data.action === 'delete') {
      // Delete record
      const rowNum = parseInt(data.id);
      
      // Verify row exists and is not header
      if (rowNum < 2 || rowNum > sheet.getLastRow()) {
        throw new Error('Invalid row number');
      }
      
      // Get worker name before deleting
      const workerName = sheet.getRange(rowNum, 2).getValue();
      
      // Delete the row
      sheet.deleteRow(rowNum);
      
      // Update worker status
      updateWorkerStatus(workerName, 'Entered');
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Record deleted successfully' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (data.action === 'addWorker') {
      // Add worker without entry
      addWorkerToList(data.workerName, 'Not Entered');
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Worker added successfully' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (data.action === 'addTask') {
      // Add new task
      addTaskToList(data.taskName);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Task added successfully' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (data.action === 'deleteTask') {
      // Delete task
      const tasksSheet = ss.getSheetByName(TASKS_SHEET_NAME);
      const rowNum = parseInt(data.id);
      
      if (rowNum < 2 || rowNum > tasksSheet.getLastRow()) {
        throw new Error('Invalid row number');
      }
      
      tasksSheet.deleteRow(rowNum);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Task deleted successfully' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else {
      // Add new record (default action)
      const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const rowData = [
        data.date,
        data.workerName,
        data.taskDescription,
        data.hoursWorked,
        data.wageRate,
        data.totalWage,
        new Date(indiaTime)
      ];
      
      sheet.appendRow(rowData);
      
      // Update worker status
      updateWorkerStatus(data.workerName, 'Entered');
      
      // Update task usage
      updateTaskUsage(data.taskDescription);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Wage record added successfully' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Add or update task in Tasks sheet
 */
function addTaskToList(taskName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tasksSheet = ss.getSheetByName(TASKS_SHEET_NAME);
  const lastRow = tasksSheet.getLastRow();
  
  // Check if task already exists
  if (lastRow > 1) {
    const data = tasksSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === taskName) {
        // Task exists, don't add again
        return;
      }
    }
  }
  
  // Add new task
  tasksSheet.appendRow([taskName, 0, '']);
}

/**
 * Update task usage statistics
 */
function updateTaskUsage(taskName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tasksSheet = ss.getSheetByName(TASKS_SHEET_NAME);
  const wageSheet = ss.getSheetByName(SHEET_NAME);
  const lastRow = tasksSheet.getLastRow();
  
  // Count usage for this task
  const wageData = wageSheet.getRange(2, 3, wageSheet.getLastRow() - 1, 1).getValues();
  const usageCount = wageData.filter(row => row[0] === taskName).length;
  
  // Find task in Tasks sheet
  let taskRow = -1;
  if (lastRow > 1) {
    const data = tasksSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === taskName) {
        taskRow = i + 2;
        break;
      }
    }
  }
  
  const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  
  if (taskRow > 0) {
    // Update existing task
    tasksSheet.getRange(taskRow, 2).setValue(usageCount);
    tasksSheet.getRange(taskRow, 3).setValue(new Date(indiaTime));
  } else {
    // Add new task
    tasksSheet.appendRow([taskName, usageCount, new Date(indiaTime)]);
  }
}

/**
 * Authenticate user login
 */
function authenticateUser(username, password) {
  try {
    Logger.log('=== Authentication Attempt ===');
    Logger.log('Username: ' + username);
    Logger.log('Password: ' + password);
    Logger.log('Password type: ' + typeof password);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
    
    if (!usersSheet) {
      Logger.log('ERROR: Users sheet not found');
      return { success: false, message: 'System not initialized' };
    }
    
    const lastRow = usersSheet.getLastRow();
    Logger.log('Last row in Users sheet: ' + lastRow);
    
    if (lastRow <= 1) {
      Logger.log('ERROR: No users registered');
      return { success: false, message: 'No users registered. Please register first.' };
    }
    
    // Get all users
    const data = usersSheet.getRange(2, 1, lastRow - 1, 6).getValues();
    Logger.log('Total users found: ' + data.length);
    
    // Convert input to string for comparison
    const inputUsername = String(username).trim();
    const inputPassword = String(password).trim();
    
    Logger.log('Input username (trimmed): "' + inputUsername + '"');
    Logger.log('Input password (trimmed): "' + inputPassword + '"');
    
    // Find matching user
    for (let i = 0; i < data.length; i++) {
      const storedUsername = String(data[i][1]).trim();
      const storedPassword = String(data[i][2]).trim();
      
      Logger.log('--- Checking user ' + (i + 1) + ' ---');
      Logger.log('Stored username: "' + storedUsername + '"');
      Logger.log('Stored password: "' + storedPassword + '"');
      Logger.log('Stored password type: ' + typeof data[i][2]);
      
      if (storedUsername === inputUsername) {
        Logger.log('✓ Username match found!');
        Logger.log('Comparing passwords:');
        Logger.log('  Stored: "' + storedPassword + '" (length: ' + storedPassword.length + ')');
        Logger.log('  Input:  "' + inputPassword + '" (length: ' + inputPassword.length + ')');
        Logger.log('  Match: ' + (storedPassword === inputPassword));
        
        if (storedPassword === inputPassword) {
          // Update last login
          const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
          usersSheet.getRange(i + 2, 6).setValue(new Date(indiaTime));
          
          Logger.log('✓✓✓ Login successful for user: ' + username);
          return {
            success: true,
            userId: data[i][0],
            fullName: data[i][3],
            message: 'Login successful'
          };
        } else {
          Logger.log('✗ Password mismatch');
          return { success: false, message: 'Invalid password' };
        }
      }
    }
    
    Logger.log('✗ Username not found: ' + username);
    return { success: false, message: 'Username not found' };
  } catch (error) {
    Logger.log('ERROR in authenticateUser: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return { success: false, message: 'Authentication error: ' + error.toString() };
  }
}

/**
 * Register new user
 */
function registerUser(pin, username, password, fullName) {
  try {
    Logger.log('=== Registration Attempt ===');
    Logger.log('PIN: ' + pin);
    Logger.log('Username: ' + username);
    Logger.log('Full Name: ' + fullName);
    Logger.log('Expected PIN: ' + REGISTRATION_PIN);
    
    // Verify registration PIN
    if (String(pin).trim() !== String(REGISTRATION_PIN).trim()) {
      Logger.log('Invalid PIN provided');
      return { success: false, message: 'Invalid registration PIN. Please contact administrator.' };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
    
    if (!usersSheet) {
      Logger.log('Users sheet not found');
      return { success: false, message: 'System not initialized' };
    }
    
    const lastRow = usersSheet.getLastRow();
    Logger.log('Current last row: ' + lastRow);
    
    // Check if username already exists
    if (lastRow > 1) {
      const data = usersSheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (let i = 0; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(username).trim()) {
          Logger.log('Username already exists: ' + username);
          return { success: false, message: 'Username already exists. Please choose another.' };
        }
      }
    }
    
    // Generate user ID
    const userId = 'USER' + (lastRow).toString().padStart(4, '0');
    Logger.log('Generated User ID: ' + userId);
    
    // Add new user - Store password as TEXT with apostrophe prefix
    const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    
    // Append the row first
    usersSheet.appendRow([
      userId,
      String(username).trim(),
      '', // Empty placeholder for password
      String(fullName).trim(),
      new Date(indiaTime),
      ''
    ]);
    
    // Set password as text format to preserve numeric passwords
    const newRowNum = usersSheet.getLastRow();
    const passwordCell = usersSheet.getRange(newRowNum, 3);
    passwordCell.setNumberFormat('@'); // Set as text format
    passwordCell.setValue(String(password).trim());
    
    Logger.log('User registered successfully: ' + username);
    return {
      success: true,
      message: 'Registration successful! You can now login.',
      userId: userId
    };
  } catch (error) {
    Logger.log('ERROR in registerUser: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return { success: false, message: 'Registration error: ' + error.toString() };
  }
}

/**
 * Add or update worker in Workers sheet
 */
function addWorkerToList(workerName, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const workersSheet = ss.getSheetByName(WORKERS_SHEET_NAME);
  const lastRow = workersSheet.getLastRow();
  
  // Check if worker already exists
  if (lastRow > 1) {
    const data = workersSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === workerName) {
        // Worker exists, don't add again
        return;
      }
    }
  }
  
  // Add new worker
  const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  workersSheet.appendRow([workerName, status, status === 'Entered' ? new Date(indiaTime) : '', status === 'Entered' ? 1 : 0]);
}

/**
 * Update worker status based on wage entries
 */
function updateWorkerStatus(workerName, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const workersSheet = ss.getSheetByName(WORKERS_SHEET_NAME);
  const wageSheet = ss.getSheetByName(SHEET_NAME);
  const lastRow = workersSheet.getLastRow();
  
  // Count entries for this worker
  const wageData = wageSheet.getRange(2, 2, wageSheet.getLastRow() - 1, 1).getValues();
  const entryCount = wageData.filter(row => row[0] === workerName).length;
  
  // Find worker in Workers sheet
  let workerRow = -1;
  if (lastRow > 1) {
    const data = workersSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === workerName) {
        workerRow = i + 2;
        break;
      }
    }
  }
  
  const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  
  if (workerRow > 0) {
    // Update existing worker
    workersSheet.getRange(workerRow, 2).setValue(entryCount > 0 ? 'Entered' : 'Not Entered');
    workersSheet.getRange(workerRow, 3).setValue(entryCount > 0 ? new Date(indiaTime) : '');
    workersSheet.getRange(workerRow, 4).setValue(entryCount);
  } else {
    // Add new worker
    workersSheet.appendRow([
      workerName, 
      entryCount > 0 ? 'Entered' : 'Not Entered', 
      entryCount > 0 ? new Date(indiaTime) : '', 
      entryCount
    ]);
  }
}

/**
 * Format date for consistent display (India timezone)
 */
function formatDate(date) {
  if (date instanceof Date) {
    // Convert to India timezone (IST - UTC+5:30)
    const indiaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const year = indiaDate.getFullYear();
    const month = String(indiaDate.getMonth() + 1).padStart(2, '0');
    const day = String(indiaDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return date;
}

/**
 * Test function to verify setup and authentication
 */
function testSetup() {
  initializeSheet();
  Logger.log('Sheet initialized successfully');
  
  // Test registration
  const regResult = registerUser('ZERO', 'testuser', 'test123', 'Test User');
  Logger.log('Test registration result: ' + JSON.stringify(regResult));
  
  // Test login
  const loginResult = authenticateUser('testuser', 'test123');
  Logger.log('Test login result: ' + JSON.stringify(loginResult));
  
  // List all users
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  const lastRow = usersSheet.getLastRow();
  
  if (lastRow > 1) {
    const users = usersSheet.getRange(2, 1, lastRow - 1, 4).getValues();
    Logger.log('All users:');
    users.forEach(user => {
      Logger.log('User ID: ' + user[0] + ', Username: ' + user[1] + ', Full Name: ' + user[3]);
    });
  } else {
    Logger.log('No users found');
  }
}

/**
 * Fix existing numeric passwords - Run this once if you have existing users with numeric passwords
 */
function fixNumericPasswords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  
  if (!usersSheet) {
    Logger.log('Users sheet not found');
    return;
  }
  
  const lastRow = usersSheet.getLastRow();
  
  if (lastRow <= 1) {
    Logger.log('No users to fix');
    return;
  }
  
  // Format password column as text
  usersSheet.getRange('C:C').setNumberFormat('@');
  
  // Get all passwords
  const passwords = usersSheet.getRange(2, 3, lastRow - 1, 1).getValues();
  
  // Re-set each password to ensure it's stored as text
  for (let i = 0; i < passwords.length; i++) {
    const cell = usersSheet.getRange(i + 2, 3);
    const password = String(passwords[i][0]).trim();
    cell.setValue(password);
    Logger.log('Fixed password for row ' + (i + 2) + ': ' + password);
  }
  
  Logger.log('Fixed ' + passwords.length + ' passwords');
}
