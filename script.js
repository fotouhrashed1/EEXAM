// Array to store reservations
const reservations = [];

// Generate time slots (30-minute intervals from 9:00 AM to 5:00 PM)
const startTime = 9 * 60; // 9:00 AM in minutes
const endTime = 17 * 60; // 5:00 PM in minutes
const timeSlots = [];
for (let time = startTime; time < endTime; time += 30) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    timeSlots.push(`${hours}:${minutes.toString().padStart(2, '0')}`);
}

// Populate the time dropdown in the form
const timeSelect = document.getElementById('time');
timeSlots.forEach(slot => {
    const option = document.createElement('option');
    option.value = slot;
    option.textContent = slot;
    timeSelect.appendChild(option);
});

// Create the schedule table
const scheduleTable = document.getElementById('schedule-table');
function generateScheduleTable() {
    // Clear existing table
    scheduleTable.innerHTML = '';

    // Generate header row
    const headerRow = document.createElement('tr');
    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Date';
    headerRow.appendChild(dateHeader);
    timeSlots.forEach(slot => {
        const timeHeader = document.createElement('th');
        timeHeader.textContent = slot;
        headerRow.appendChild(timeHeader);
    });
    scheduleTable.appendChild(headerRow);

    // Generate rows for each date
    const startDate = new Date('2023-12-28');
    const endDate = new Date('2024-01-23');
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        const row = document.createElement('tr');

        // Date cell
        const dateCell = document.createElement('td');
        dateCell.textContent = date.toISOString().split('T')[0];
        row.appendChild(dateCell);

        // Time slots
        timeSlots.forEach(slot => {
            const cell = document.createElement('td');
            cell.className = 'available'; // Default to available
            cell.textContent = 'Available';

            // Check if the slot is reserved
            const reserved = reservations.some(
                reservation =>
                    reservation.date === date.toISOString().split('T')[0] &&
                    reservation.time === slot
            );
            if (reserved) {
                cell.className = 'reserved';
                cell.textContent = 'Reserved';
            }

            row.appendChild(cell);
        });

        scheduleTable.appendChild(row);
    }
}

// Update the schedule on form submission
document.getElementById('reservation-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form values
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const classrooms = Array.from(document.getElementById('classrooms').selectedOptions).map(option => option.value);

    // Add reservations for selected classrooms
    classrooms.forEach(classroom => {
        reservations.push({ date, time, classroom });
    });

    // Update the schedule
    generateScheduleTable();

    // Show success message
    document.getElementById('reservation-status').innerText = 
        `Reservation successful for ${classrooms.join(', ')} at ${time} on ${date}.`;
    document.getElementById('reservation-status').style.color = 'green';

    // Clear the form
    document.getElementById('reservation-form').reset();
});

// Initial generation of the schedule table
generateScheduleTable();