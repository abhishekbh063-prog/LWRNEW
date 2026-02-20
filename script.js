// Configuration - Replace with your Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGMhmhM_vCsdp-Iuh9jpT_TDGzBEIDK-4nzfteHIQRkNKWftkktVLEG8PITRNuz2TCMg/exec';

// Check authentication on page load
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Display user greeting
const userGreeting = document.getElementById('userGreeting');
const fullName = sessionStorage.getItem('fullName');
if (userGreeting && fullName) {
    userGreeting.textContent = `Welcome, ${fullName}!`;
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.clear();
            window.location.href = 'login.html';
        }
    });
}

// DOM Elements
const wageForm = document.getElementById('wageForm');
const submitBtn = document.getElementById('submitBtn');
const refreshBtn = document.getElementById('refreshBtn');
const messageDiv = document.getElementById('message');
const tableBody = document.getElementById('tableBody');
const hoursInput = document.getElementById('hoursWorked');
const rateInput = document.getElementById('wageRate');
const totalWageDiv = document.getElementById('totalWage');
const dateInput = document.getElementById('date');
const viewWorkerBtn = document.getElementById('viewWorkerBtn');
const workerSlidePanel = document.getElementById('workerSlidePanel');
const closePanelBtn = document.getElementById('closePanelBtn');
const workerSelect = document.getElementById('workerSelect');
const workerStats = document.getElementById('workerStats');
const workerRecords = document.getElementById('workerRecords');
const workerTableBody = document.getElementById('workerTableBody');
const editRecordsBtn = document.getElementById('editRecordsBtn');
const editSlidePanel = document.getElementById('editSlidePanel');
const closeEditPanelBtn = document.getElementById('closeEditPanelBtn');
const editTableBody = document.getElementById('editTableBody');
const editForm = document.getElementById('editForm');
const editFormSection = document.getElementById('editFormSection');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const deleteRecordBtn = document.getElementById('deleteRecordBtn');
const workerNameInput = document.getElementById('workerName');
const workerNameList = document.getElementById('workerNameList');
const addWorkerBtn = document.getElementById('addWorkerBtn');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskList = document.getElementById('taskList');
const manageTasksBtn = document.getElementById('manageTasksBtn');
const tasksSlidePanel = document.getElementById('tasksSlidePanel');
const closeTasksPanelBtn = document.getElementById('closeTasksPanelBtn');
const newTaskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksList = document.getElementById('tasksList');

// Store all wage data globally
let allWageData = [];
let currentEditRecord = null;
let workerNames = new Set(); // Store unique worker names
let taskNames = new Set(); // Store unique task names

// Set today's date as default (India timezone)
const indiaDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
dateInput.valueAsDate = new Date(indiaDate);

// Load saved worker names from localStorage
function loadWorkerNames() {
    const saved = localStorage.getItem('workerNames');
    if (saved) {
        workerNames = new Set(JSON.parse(saved));
        updateWorkerNameDatalist();
    }
    
    // Also load from server
    loadWorkersFromServer();
    loadTasksFromServer();
}

// Load workers from Google Sheets
async function loadWorkersFromServer() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getWorkers');
        if (response.ok) {
            const workers = await response.json();
            workers.forEach(worker => {
                if (worker.name) {
                    workerNames.add(worker.name);
                }
            });
            saveWorkerNames();
            updateWorkerNameDatalist();
        }
    } catch (error) {
        console.error('Error loading workers from server:', error);
    }
}

// Save worker names to localStorage
function saveWorkerNames() {
    localStorage.setItem('workerNames', JSON.stringify([...workerNames]));
}

// Update the datalist with worker names
function updateWorkerNameDatalist() {
    workerNameList.innerHTML = '';
    [...workerNames].sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        workerNameList.appendChild(option);
    });
}

// Add worker name when form is submitted
function addWorkerName(name) {
    if (name && name.trim()) {
        workerNames.add(name.trim());
        saveWorkerNames();
        updateWorkerNameDatalist();
    }
}

// Load worker names on page load
loadWorkerNames();

// Auto-calculate total wage
function calculateTotal() {
    const hours = parseFloat(hoursInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const total = hours * rate;
    totalWageDiv.textContent = `₹${total.toFixed(2)}`;
}

hoursInput.addEventListener('input', calculateTotal);
rateInput.addEventListener('input', calculateTotal);

// Show message
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Toggle button loading state
function toggleButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        button.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// Submit form data
wageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const workerName = document.getElementById('workerName').value;
    const formData = {
        date: document.getElementById('date').value,
        workerName: workerName,
        taskDescription: document.getElementById('taskDescription').value,
        hoursWorked: parseFloat(document.getElementById('hoursWorked').value),
        wageRate: parseFloat(document.getElementById('wageRate').value),
        totalWage: parseFloat(document.getElementById('hoursWorked').value) * parseFloat(document.getElementById('wageRate').value)
    };
    
    // Save worker name for future use
    addWorkerName(workerName);
    
    toggleButtonLoading(submitBtn, true);
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Note: no-cors mode doesn't allow reading the response
        // We assume success if no error is thrown
        showMessage('✓ Wage entry submitted successfully!', 'success');
        wageForm.reset();
        const indiaDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        dateInput.valueAsDate = new Date(indiaDate);
        totalWageDiv.textContent = '₹0.00';
        
        // Refresh the table after a short delay
        setTimeout(() => {
            loadWageData().then(() => {
                // Update edit panel if it's open
                if (editSlidePanel.classList.contains('active')) {
                    displayEditRecords(allWageData);
                }
            });
        }, 1500);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('✗ Error submitting data. Please try again.', 'error');
    } finally {
        toggleButtonLoading(submitBtn, false);
    }
});

// Load wage data
async function loadWageData() {
    toggleButtonLoading(refreshBtn, true);
    
    try {
        const response = await fetch(SCRIPT_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        allWageData = data; // Store globally
        
        // Extract and save worker names from loaded data
        data.forEach(record => {
            if (record.workerName) {
                workerNames.add(record.workerName);
            }
            if (record.taskDescription) {
                taskNames.add(record.taskDescription);
            }
        });
        saveWorkerNames();
        updateWorkerNameDatalist();
        updateTaskDatalist();
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No wage records found. Add your first entry above!</td></tr>';
        } else {
            displayWageData(data);
            updateWorkerList(data);
        }
        
        return data; // Return data for chaining
        
    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="no-data">Error loading data. Please check your configuration.</td></tr>';
        throw error;
    } finally {
        toggleButtonLoading(refreshBtn, false);
    }
}

// Format date to Indian format (DD/MM/YYYY)
function formatDateIndian(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Display wage data in table
function displayWageData(data) {
    tableBody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDateIndian(row.date)}</td>
            <td>${row.workerName}</td>
            <td>${row.taskDescription}</td>
            <td>${row.hoursWorked}</td>
            <td>₹${parseFloat(row.wageRate).toFixed(2)}</td>
            <td>₹${parseFloat(row.totalWage).toFixed(2)}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Display records in edit panel
function displayEditRecords(data) {
    editTableBody.innerHTML = '';
    
    if (data.length === 0) {
        editTableBody.innerHTML = '<tr><td colspan="7" class="no-data">No records found</td></tr>';
        return;
    }
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDateIndian(row.date)}</td>
            <td>${row.workerName}</td>
            <td>${row.taskDescription}</td>
            <td>${row.hoursWorked}</td>
            <td>₹${parseFloat(row.wageRate).toFixed(2)}</td>
            <td>₹${parseFloat(row.totalWage).toFixed(2)}</td>
            <td>
                <button class="btn-edit" data-id="${row.id}" data-date="${row.date}" data-worker="${row.workerName}" data-task="${row.taskDescription}" data-hours="${row.hoursWorked}" data-rate="${row.wageRate}">✏️ Edit</button>
            </td>
        `;
        editTableBody.appendChild(tr);
    });
    
    // Add click handlers to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const record = {
                id: button.dataset.id,
                date: button.dataset.date,
                workerName: button.dataset.worker,
                taskDescription: button.dataset.task,
                hoursWorked: parseFloat(button.dataset.hours),
                wageRate: parseFloat(button.dataset.rate)
            };
            openEditForm(record);
        });
    });
}

// Refresh button click handler
refreshBtn.addEventListener('click', loadWageData);

// Load data on page load
window.addEventListener('DOMContentLoaded', loadWageData);

// Worker slide panel functionality
viewWorkerBtn.addEventListener('click', () => {
    workerSlidePanel.classList.add('active');
});

closePanelBtn.addEventListener('click', () => {
    workerSlidePanel.classList.remove('active');
});

// Close panel when clicking outside
workerSlidePanel.addEventListener('click', (e) => {
    if (e.target === workerSlidePanel) {
        workerSlidePanel.classList.remove('active');
    }
});

// Edit records slide panel functionality
editRecordsBtn.addEventListener('click', () => {
    editSlidePanel.classList.add('active');
    editFormSection.style.display = 'none';
    currentEditRecord = null;
    
    if (allWageData.length > 0) {
        displayEditRecords(allWageData);
    } else {
        editTableBody.innerHTML = '<tr><td colspan="7" class="loading">Loading records...</td></tr>';
        loadWageData().then(() => {
            displayEditRecords(allWageData);
        });
    }
});

closeEditPanelBtn.addEventListener('click', () => {
    editSlidePanel.classList.remove('active');
    editFormSection.style.display = 'none';
});

// Close edit panel when clicking outside
editSlidePanel.addEventListener('click', (e) => {
    if (e.target === editSlidePanel) {
        editSlidePanel.classList.remove('active');
        editFormSection.style.display = 'none';
    }
});

// Open edit form with record data
function openEditForm(record) {
    currentEditRecord = record;
    
    // Convert date format from YYYY-MM-DD to input format
    let dateValue = record.date;
    if (dateValue.includes('/')) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const parts = dateValue.split('/');
        dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    // Populate form
    document.getElementById('editDate').value = dateValue;
    document.getElementById('editWorkerName').value = record.workerName;
    document.getElementById('editTaskDescription').value = record.taskDescription;
    document.getElementById('editHoursWorked').value = record.hoursWorked;
    document.getElementById('editWageRate').value = record.wageRate;
    
    // Calculate and display total
    const total = record.hoursWorked * record.wageRate;
    document.getElementById('editTotalWage').textContent = `₹${total.toFixed(2)}`;
    
    // Show form and scroll to it
    editFormSection.style.display = 'block';
    setTimeout(() => {
        editFormSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Auto-calculate total in edit form
document.getElementById('editHoursWorked').addEventListener('input', calculateEditTotal);
document.getElementById('editWageRate').addEventListener('input', calculateEditTotal);

function calculateEditTotal() {
    const hours = parseFloat(document.getElementById('editHoursWorked').value) || 0;
    const rate = parseFloat(document.getElementById('editWageRate').value) || 0;
    const total = hours * rate;
    document.getElementById('editTotalWage').textContent = `₹${total.toFixed(2)}`;
}

// Cancel edit
cancelEditBtn.addEventListener('click', () => {
    editFormSection.style.display = 'none';
    currentEditRecord = null;
});

// Handle edit form submission
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentEditRecord) {
        showMessage('✗ No record selected for editing', 'error');
        return;
    }
    
    const hours = parseFloat(document.getElementById('editHoursWorked').value);
    const rate = parseFloat(document.getElementById('editWageRate').value);
    
    const updatedData = {
        action: 'update',
        id: parseInt(currentEditRecord.id),
        date: document.getElementById('editDate').value,
        workerName: document.getElementById('editWorkerName').value,
        taskDescription: document.getElementById('editTaskDescription').value,
        hoursWorked: hours,
        wageRate: rate,
        totalWage: hours * rate
    };
    
    // Disable form buttons
    const submitBtn = editForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        });
        
        showMessage('✓ Record updated successfully!', 'success');
        editFormSection.style.display = 'none';
        currentEditRecord = null;
        
        // Refresh data after a delay
        setTimeout(() => {
            loadWageData().then(() => {
                displayEditRecords(allWageData);
            });
        }, 1500);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('✗ Error updating record. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Record';
    }
});

// Handle delete
deleteRecordBtn.addEventListener('click', async () => {
    if (!currentEditRecord) {
        showMessage('✗ No record selected for deletion', 'error');
        return;
    }
    
    const workerName = currentEditRecord.workerName || 'this worker';
    
    if (!confirm(`Are you sure you want to delete this record for ${workerName}?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    const deleteData = {
        action: 'delete',
        id: parseInt(currentEditRecord.id)
    };
    
    // Disable delete button
    deleteRecordBtn.disabled = true;
    deleteRecordBtn.textContent = 'Deleting...';
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deleteData)
        });
        
        showMessage('✓ Record deleted successfully!', 'success');
        editFormSection.style.display = 'none';
        currentEditRecord = null;
        
        // Refresh data after a longer delay to ensure Google Sheets processes the deletion
        setTimeout(() => {
            loadWageData().then(() => {
                if (editSlidePanel.classList.contains('active')) {
                    displayEditRecords(allWageData);
                }
            }).catch(err => {
                console.error('Error refreshing data:', err);
            });
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('✗ Error deleting record. Please try again.', 'error');
    } finally {
        deleteRecordBtn.disabled = false;
        deleteRecordBtn.textContent = 'Delete Record';
    }
});

// Add worker without entry
addWorkerBtn.addEventListener('click', async () => {
    const workerName = prompt('Enter worker name to add:');
    
    if (!workerName || !workerName.trim()) {
        return;
    }
    
    const trimmedName = workerName.trim();
    
    // Check if already exists
    if (workerNames.has(trimmedName)) {
        showMessage('Worker already exists in the list', 'error');
        return;
    }
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addWorker',
                workerName: trimmedName
            })
        });
        
        // Add to local list
        addWorkerName(trimmedName);
        showMessage(`✓ Worker "${trimmedName}" added successfully!`, 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('✗ Error adding worker. Please try again.', 'error');
    }
});

// Manage tasks panel
manageTasksBtn.addEventListener('click', () => {
    tasksSlidePanel.classList.add('active');
    loadTasksList();
});

closeTasksPanelBtn.addEventListener('click', () => {
    tasksSlidePanel.classList.remove('active');
});

tasksSlidePanel.addEventListener('click', (e) => {
    if (e.target === tasksSlidePanel) {
        tasksSlidePanel.classList.remove('active');
    }
});

// Add new task
addTaskBtn.addEventListener('click', async () => {
    const taskName = newTaskInput.value.trim();
    
    if (!taskName) {
        showMessage('Please enter a task name', 'error');
        return;
    }
    
    if (taskNames.has(taskName)) {
        showMessage('Task already exists', 'error');
        return;
    }
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addTask',
                taskName: taskName
            })
        });
        
        taskNames.add(taskName);
        updateTaskDatalist();
        newTaskInput.value = '';
        showMessage(`✓ Task "${taskName}" added successfully!`, 'success');
        
        // Reload tasks list
        setTimeout(() => {
            loadTasksList();
        }, 1000);
        
    } catch (error) {
        console.error('Error adding task:', error);
        showMessage('✗ Error adding task. Please try again.', 'error');
    }
});

// Load tasks list
async function loadTasksList() {
    tasksList.innerHTML = '<p class="loading">Loading tasks...</p>';
    
    try {
        const response = await fetch(SCRIPT_URL + '?action=getTasks');
        if (response.ok) {
            const tasks = await response.json();
            
            if (tasks.length === 0) {
                tasksList.innerHTML = '<p class="no-data">No tasks found. Add your first task above!</p>';
                return;
            }
            
            tasksList.innerHTML = '';
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                taskItem.innerHTML = `
                    <div class="task-info">
                        <div class="task-name">${task.name}</div>
                        <div class="task-stats">Used ${task.timesUsed} times${task.lastUsedDate ? ' • Last: ' + formatDateIndian(task.lastUsedDate) : ''}</div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-view-task" data-name="${task.name}" title="View Details">👁️</button>
                        <button class="btn-delete-task" data-id="${task.id}" data-name="${task.name}" title="Delete">🗑️</button>
                    </div>
                `;
                tasksList.appendChild(taskItem);
            });
            
            // Add view handlers
            document.querySelectorAll('.btn-view-task').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const taskName = e.currentTarget.dataset.name;
                    showTaskDetails(taskName);
                });
            });
            
            // Add delete handlers
            document.querySelectorAll('.btn-delete-task').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const taskId = e.currentTarget.dataset.id;
                    const taskName = e.currentTarget.dataset.name;
                    
                    if (!confirm(`Delete task "${taskName}"?`)) {
                        return;
                    }
                    
                    try {
                        await fetch(SCRIPT_URL, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                action: 'deleteTask',
                                id: parseInt(taskId)
                            })
                        });
                        
                        taskNames.delete(taskName);
                        updateTaskDatalist();
                        showMessage(`✓ Task deleted successfully!`, 'success');
                        
                        setTimeout(() => {
                            loadTasksList();
                        }, 1000);
                        
                    } catch (error) {
                        console.error('Error deleting task:', error);
                        showMessage('✗ Error deleting task. Please try again.', 'error');
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasksList.innerHTML = '<p class="no-data">Error loading tasks</p>';
    }
}

// Show task details
function showTaskDetails(taskName) {
    // Filter records for this task
    const taskRecords = allWageData.filter(record => record.taskDescription === taskName);
    
    if (taskRecords.length === 0) {
        showMessage('No work records found for this task', 'error');
        return;
    }
    
    // Calculate statistics
    const totalCost = taskRecords.reduce((sum, record) => sum + parseFloat(record.totalWage), 0);
    const totalHours = taskRecords.reduce((sum, record) => sum + parseFloat(record.hoursWorked), 0);
    const uniqueWorkers = [...new Set(taskRecords.map(r => r.workerName))];
    
    // Create modal content
    const modalContent = `
        <div class="task-details-modal">
            <div class="task-details-header">
                <h2>📋 ${taskName}</h2>
                <button class="close-modal-btn" onclick="closeTaskDetailsModal()">×</button>
            </div>
            
            <div class="task-details-stats">
                <div class="detail-stat-card">
                    <div class="detail-stat-label">Total Cost</div>
                    <div class="detail-stat-value">₹${totalCost.toFixed(2)}</div>
                </div>
                <div class="detail-stat-card">
                    <div class="detail-stat-label">Total Hours</div>
                    <div class="detail-stat-value">${totalHours.toFixed(1)}</div>
                </div>
                <div class="detail-stat-card">
                    <div class="detail-stat-label">Total Entries</div>
                    <div class="detail-stat-value">${taskRecords.length}</div>
                </div>
                <div class="detail-stat-card">
                    <div class="detail-stat-label">Workers</div>
                    <div class="detail-stat-value">${uniqueWorkers.length}</div>
                </div>
            </div>
            
            <div class="task-details-body">
                <h3>Work History</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Worker</th>
                                <th>Hours</th>
                                <th>Rate (₹)</th>
                                <th>Cost (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${taskRecords.map(record => `
                                <tr>
                                    <td>${formatDateIndian(record.date)}</td>
                                    <td>${record.workerName}</td>
                                    <td>${record.hoursWorked}</td>
                                    <td>₹${parseFloat(record.wageRate).toFixed(2)}</td>
                                    <td>₹${parseFloat(record.totalWage).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <h3>Worker Breakdown</h3>
                <div class="worker-breakdown">
                    ${uniqueWorkers.map(worker => {
                        const workerRecords = taskRecords.filter(r => r.workerName === worker);
                        const workerCost = workerRecords.reduce((sum, r) => sum + parseFloat(r.totalWage), 0);
                        const workerHours = workerRecords.reduce((sum, r) => sum + parseFloat(r.hoursWorked), 0);
                        return `
                            <div class="worker-breakdown-item">
                                <div class="worker-breakdown-name">${worker}</div>
                                <div class="worker-breakdown-stats">
                                    ${workerRecords.length} entries • ${workerHours.toFixed(1)} hours • ₹${workerCost.toFixed(2)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.id = 'taskDetailsModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTaskDetailsModal();
        }
    });
}

// Close task details modal
function closeTaskDetailsModal() {
    const modal = document.getElementById('taskDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// Make closeTaskDetailsModal available globally
window.closeTaskDetailsModal = closeTaskDetailsModal;

// Update task datalist
function updateTaskDatalist() {
    taskList.innerHTML = '';
    [...taskNames].sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        taskList.appendChild(option);
    });
}

// Load tasks from server
async function loadTasksFromServer() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getTasks');
        if (response.ok) {
            const tasks = await response.json();
            tasks.forEach(task => {
                if (task.name) {
                    taskNames.add(task.name);
                }
            });
            updateTaskDatalist();
        }
    } catch (error) {
        console.error('Error loading tasks from server:', error);
    }
}

// Update worker list in dropdown
function updateWorkerList(data) {
    const workers = [...new Set(data.map(record => record.workerName))].sort();
    
    workerSelect.innerHTML = '<option value="">-- Select a worker --</option>';
    workers.forEach(worker => {
        const option = document.createElement('option');
        option.value = worker;
        option.textContent = worker;
        workerSelect.appendChild(option);
    });
}

// Handle worker selection
workerSelect.addEventListener('change', (e) => {
    const selectedWorker = e.target.value;
    
    if (!selectedWorker) {
        workerStats.style.display = 'none';
        workerRecords.style.display = 'none';
        return;
    }
    
    displayWorkerDetails(selectedWorker);
});

// Display worker details
function displayWorkerDetails(workerName) {
    const workerData = allWageData.filter(record => record.workerName === workerName);
    
    if (workerData.length === 0) {
        return;
    }
    
    // Calculate statistics
    const totalEarnings = workerData.reduce((sum, record) => sum + parseFloat(record.totalWage), 0);
    const totalHours = workerData.reduce((sum, record) => sum + parseFloat(record.hoursWorked), 0);
    const totalDays = workerData.length;
    const avgRate = totalEarnings / totalHours;
    
    // Update stats display
    document.getElementById('totalEarnings').textContent = `₹${totalEarnings.toFixed(2)}`;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('avgRate').textContent = `₹${avgRate.toFixed(2)}`;
    
    // Show stats
    workerStats.style.display = 'grid';
    
    // Display work history
    workerTableBody.innerHTML = '';
    workerData.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDateIndian(record.date)}</td>
            <td>${record.taskDescription}</td>
            <td>${record.hoursWorked}</td>
            <td>₹${parseFloat(record.wageRate).toFixed(2)}</td>
            <td>₹${parseFloat(record.totalWage).toFixed(2)}</td>
        `;
        workerTableBody.appendChild(tr);
    });
    
    workerRecords.style.display = 'block';
}
