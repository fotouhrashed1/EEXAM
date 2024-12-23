import { db } from "./index.html";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Array to store reservations temporarily
let reservations = [];

// Generate time slots (30-minute intervals from 9:00 AM to 5:00 PM)
const timeSlots = [];
for (let i = 9 * 60; i < 17 * 60; i += 30) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    timeSlots.push(`${hours}:${minutes.toString().padStart(2, "0")}`);
}

// Populate time slot dropdown
const timeSelect = document.getElementById("time");
timeSlots.forEach(slot => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    timeSelect.appendChild(option);
});

// Generate schedule table
function generateScheduleTable() {
    const scheduleTable = document.getElementById("schedule-table");
    scheduleTable.innerHTML = "";

    const headerRow = document.createElement("tr");
    const dateHeader = document.createElement("th");
    dateHeader.textContent = "Date";
    headerRow.appendChild(dateHeader);

    timeSlots.forEach(slot => {
        const timeHeader = document.createElement("th");
        timeHeader.textContent = slot;
        headerRow.appendChild(timeHeader);
    });
    scheduleTable.appendChild(headerRow);

    reservations.forEach(({ date, time, courseCode, classroom }) => {
        const row = document.createElement("tr");
        const dateCell = document.createElement("td");
        dateCell.textContent = date;
        row.appendChild(dateCell);

        timeSlots.forEach(slot => {
            const cell = document.createElement("td");
            if (time.includes(slot)) {
                cell.className = "reserved";
                cell.textContent = `${courseCode} - Room ${classroom}`;
            } else {
                cell.className = "available";
                cell.textContent = "Available";
            }
            row.appendChild(cell);
        });

        scheduleTable.appendChild(row);
    });
}

// Load reservations from Firebase
async function loadReservations() {
    reservations = [];
    const querySnapshot = await getDocs(collection(db, "reservations"));
    querySnapshot.forEach(doc => {
        reservations.push(doc.data());
    });
    generateScheduleTable();
}

// Save a reservation to Firebase
async function saveReservation(courseCode, date, time, classroom) {
    try {
        await addDoc(collection(db, "reservations"), {
            courseCode,
            date,
            time,
            classroom,
        });
        loadReservations(); // Refresh schedule after saving
    } catch (error) {
        console.error("Error adding reservation:", error);
    }
}

// Handle form submission
document.getElementById("reservation-form").addEventListener("submit", async event => {
    event.preventDefault();

    const courseCode = document.getElementById("course-code").value;
    const date = document.getElementById("date").value;
    const times = Array.from(document.getElementById("time").selectedOptions).map(option => option.value);
    const classrooms = Array.from(document.getElementById("classrooms").selectedOptions).map(option => option.value);

    for (const time of times) {
        for (const classroom of classrooms) {
            const isReserved = reservations.some(reservation => reservation.date === date && reservation.time === time && reservation.classroom === classroom);
            if (isReserved) {
                alert(`Room ${classroom} is already reserved at ${time} on ${date}`);
                return;
            }
            await saveReservation(courseCode, date, time, classroom);
        }
    }

    alert("Reservation successful!");
    document.getElementById("reservation-form").reset();
});

// Load reservations on page load
window.onload = loadReservations;