window.onload = function () {
  //global variables
  eventDates = [...new Set(eventDates)].sort();
  let currentUser = null;
  let selectedTimes = new Set();
  let allResponses = [];
  let isSlotDragging = false;
  let dragMode = null;

  //DOM ELEMENTS
  const copyBtn = document.getElementById("copyLinkBtn");
  const addBtn = document.getElementById("addAvailabilityBtn");
  const modal = document.getElementById("nameModal");
  const closeModalBtn = document.getElementById("closeModal");
  const modalSubmitBtn = document.getElementById("modalSubmitBtn");
  const modalNameInput = document.getElementById("modalNameInput");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const timeGrid = document.getElementById("timeGrid");
  const responsesBox = document.getElementById("responses");

  //CALL SETUP FUNCTIONS
  setupCopyButton();
  setupModal();
  setupSaveCancel();
  showSelectedDates();
  refreshResponses();

  //This function sets up the copy link button functionality. It adds an onclick event listener to the button that copies the event link to the clipboard and provides user feedback.
  function setupCopyButton() {
    if (!copyBtn) return;
    copyBtn.onclick = () => {
      const link = copyBtn.dataset.link;
      navigator.clipboard.writeText(link);
      copyBtn.textContent = "Link Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy Link"), 2000);
    };
  }

  //This function is for modal setup, a.k.a Add Availability. Sets up event listeners for opening and closing the modal, as well as handling the submission of the user's name to start editing their availability.
  function setupModal() {
    addBtn.onclick = () => modal.classList.add("visible");
    //close model on x
    closeModalBtn.onclick = closeModal;
    //close modal on outside click
    window.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
    //when "start" is clicked, start editing with the entered name
    modalSubmitBtn.onclick = () => {
      const name = modalNameInput.value.trim();
      if (!name) return alert("Please enter your name.");
      startEditing(name);
      closeModal();
    };
  }

  //Helpers to close the modal and reset input
  function closeModal() {
    modal.classList.remove("visible");
    modalNameInput.value = "";
  }

  function setupSaveCancel() {
    cancelBtn.onclick = resetEditing;
    saveBtn.onclick = handleSave;
  }

  /*This function handles saving the user's selected availability slots. It sends the data to the server via a POST request and refreshes the responses upon success.*/
  async function handleSave() {
    //Checks if a user is selected and if at least one slot is chosen
    if (!currentUser) return alert("Select a user first.");
    if (!selectedTimes.size) return alert("Select at least one slot.");

    //takes each selected time (‘date_hour’), split it into its date and hour parts, and make a list of {date, hour} objects to send to the server.
    const slots = [...selectedTimes].map((s) => {
      const [date, hour] = s.split("_");
      return { date, hour };
    });
    //sends the data to the server by making a POST request to the specified API endpoint with the user's name and selected slots in the request body.
    await fetch(`/api/event/${EVENT_ID}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentUser, slots }),
    });

    //calls functions to reset the editing state and refresh the displayed responses.
    resetEditing();
    refreshResponses();
  }

  //This function initiates the editing mode for a given user. It sets the current user, clears any previously selected times, updates the UI to reflect the editing state, and rebuilds the time grid to allow slot selection.
  function startEditing(name) {
    currentUser = name;
    selectedTimes = new Set();
    timeGrid.classList.add("editing");
    saveBtn.classList.add("show");
    cancelBtn.classList.add("show");
    buildTimeGrid();
  }

  //This function resets the editing state. It clears the current user and selected times, updates the UI to exit editing mode, rebuilds the time grid, and refreshes the displayed responses.
  function resetEditing() {
    currentUser = null;
    selectedTimes = new Set();
    timeGrid.classList.remove("editing");
    saveBtn.classList.remove("show");
    cancelBtn.classList.remove("show");
    buildTimeGrid();
    refreshResponses();
  }

  //This function constructs the time grid table displaying available time slots for each selected date. It builds the table structure, populates it with time slots, applies density-based coloring, and sets up event handlers for user interaction.
  function buildTimeGrid() {
  // Clear existing grid
  timeGrid.innerHTML = "";
  //If no event dates, show a simple message
  if (!eventDates.length) {
    timeGrid.innerHTML = "<p>No dates selected.</p>";
    return;
  }
  //Create table element and define start/end hours
  const table = document.createElement("table");
  const startH = parseInt(START_TIME);
  const endH = parseInt(END_TIME);

  //Build and append header row
  table.appendChild(createHeaderRow());

  //Calculate density data for coloring by applying calculateDensity function to get slot counts and max count
  const { slotCounts, maxCount } = calculateDensity(startH, endH);

  //Create time rows (each hour, each date)
  for (let hour = startH; hour <= endH; hour++) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${hour}:00</td>`;
    //Create cells for each date in this hour row
    eventDates.forEach((date) => {
      const cell = createCell(date, hour, slotCounts, maxCount);
      row.appendChild(cell);
    });
    table.appendChild(row);
  }
  // Add completed table to the DOM
  timeGrid.appendChild(table);
}


//This helper function creates the header row for the time grid table. It generates table header cells for each event date, formatting the date to show the day of the week and month/day.
function createHeaderRow() {
  //create table row element
  const header = document.createElement("tr");
  //always include one empty header cell for the time column
  let html = "<th></th>";
  //build a header cell for each selected date
  for (const d of eventDates) {
    //convert and format each date
    const date = new Date(d);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    html += `<th><div class="date-head"><strong>${day}</strong><br><span>${monthDay}</span></div></th>`;
  }
  //apply html to the row and return it
  header.innerHTML = html;
  return header;
}


//This function calculates how many users have selected each time slot and determines the maximum count across all slots. It returns an object containing the counts for each slot and the maximum count.
function calculateDensity(startH, endH) {
  const slotCounts = {};
  let maxCount = 0;
  //Iterate through each date and hour to count selections
  for (const date of eventDates) {
    for (let hour = startH; hour <= endH; hour++) {
      const id = `${date}_${hour}`;

      //count how many users selected this slot
      let count = 0;
      //for each user response, check if they selected this slot
      for (const r of allResponses) {
        if (r.slots.some(s => s.date === date && s.hour == hour)) count++;
      }
      //store count and update max if needed
      slotCounts[id] = count;
      if (count > maxCount) maxCount = count;
    }
  }
  //return the slot counts and maximum count
  return { slotCounts, maxCount };
}

//this function creates a table cell (td) for a specific date and hour in the time grid. It sets up the cell's attributes, applies density-based coloring, and attaches mouse event handlers for selecting or deselecting time slots.
function createCell(date, hour, slotCounts, maxCount) {
  //create unique id for the slot
  const id = `${date}_${hour}`;
  //create table cell element and set attributes
  const cell = document.createElement("td");
  cell.classList.add("slot");
  cell.dataset.date = date;
  cell.dataset.hour = hour;

  //Apply density-based color
  applyDensity(cell, slotCounts[id], maxCount);

  //add mouse event logic for seleting slots
  cell.onmousedown = (e) => handleMouseDown(e, id, cell);
  cell.onmouseenter = () => handleMouseEnter(id, cell);
  cell.onmouseup = stopDrag;

  //check if this slot is already selected and set class accordingly
  if (selectedTimes.has(id)) cell.classList.add("on");
  //return the constructed cell
  return cell;
}

//This function is called when the user presses the mouse button down on a slot cell. It determines whether the slot will be selected or deselected based on its current state and sets the drag mode accordingly.
  function handleMouseDown(e, id, cell) {
    //checks if a user is selected and if in editing mode
    if (!currentUser || !timeGrid.classList.contains("editing"))
      return alert("Add a user first or click Edit.");
    //checks if the slot is currently selected
    const willSelect = !selectedTimes.has(id);
    //sets drag mode based on whether the slot will be selected or deselected
    dragMode = willSelect ? "select" : "deselect";
    //calls toggleSlot to update the slot state and sets dragging flag
    toggleSlot(id, cell, willSelect);
    isSlotDragging = true;
    e.preventDefault();
  }

  //this function is called when the mouse enters a slot cell while dragging. It checks the drag mode and updates the slot selection accordingly.
  function handleMouseEnter(id, cell) {
    //chceks if dragging is active and a user is selected
    if (!isSlotDragging || !currentUser) return;
    //determines if the slot is currently selected
    const selected = selectedTimes.has(id);
    //based on drag mode, selects or deselects the slot
    if (dragMode === "select" && !selected) toggleSlot(id, cell, true);
    if (dragMode === "deselect" && selected) toggleSlot(id, cell, false);
  }

  //helper to stop dragging state when mouse is released
  function stopDrag() {
    isSlotDragging = false;
    dragMode = null;
  }
  document.addEventListener("mouseup", stopDrag);

  //this function is called when a user clicks or drags over a time slot cell. It decides whether that slot becomes selected or uncelected and updates css class and selectedTimes set accordingly.
  function toggleSlot(id, cell, forceOn = null) {
    //
    let shouldSelect;
    if (forceOn !== null) {
      shouldSelect = forceOn; 
    } else {
      shouldSelect = !selectedTimes.has(id); 
    }
    cell.classList.toggle("on", shouldSelect);
    if (shouldSelect) {
      selectedTimes.add(id);
    } else {
      selectedTimes.delete(id);
    }
  }

  //For each cell. it stores how manuy users have selected that slot and sets CSS variables to visually represent the density of selections.
  function applyDensity(cell, count, maxCount) {
    //calculate max to avoid division by zero
    const max = Math.max(1, maxCount);
    cell.dataset.density = count;
    cell.style.setProperty("--density", count);
    cell.style.setProperty("--max", max);
  }

  //this function fetches the latest list of user availabilities from the server, updates the allResponses variable, and rebuilds both the responses list and the calendar grid.
  async function refreshResponses() {
    try {
      //fetches availabilities from server and updates allResponses
      const res = await fetch(`/api/event/${EVENT_ID}/summary`);
      const data = await res.json();
      allResponses = data;
      //function calls to render responses and build time grid
      renderResponses(data);
      buildTimeGrid();
      addHoverHighlights();
    } catch (err) {
      alert("Failed to load responses. Please try again.");
    }
  }

  //this function renders the list of availability responses in the responses box. For every user  entry, it creates a container with their name, an edit icon, and attaches it to the responses section on the page.
  function renderResponses(data) {
    responsesBox.innerHTML = "";
    //loops through each entry and creates container to hold name and edit icon
    data.forEach((entry) => {
      const container = document.createElement("div");
      container.classList.add("response-container");

      const nameSpan = document.createElement("span");
      nameSpan.textContent = entry.name;
      //store selected slots as data attribute for hover highlights
      nameSpan.dataset.slots = entry.slots
        .map((s) => `${s.date}_${s.hour}`)
        .join(",");
      container.appendChild(nameSpan);
      //create edit icon
      const editIcon = document.createElement("i");
      editIcon.classList.add("fa", "fa-pencil");
      editIcon.title = "Edit availability";
      editIcon.onclick = () => startEditMode(entry, container);
      container.appendChild(editIcon);

      const p = document.createElement("p");
      p.appendChild(container);
      responsesBox.appendChild(p);
    });
  }

  // This function initiates the edit mode for a specific user's availability entry. It sets the current user, populates the selected time slots based on the entry data, updates the UI to reflect the editing state, creates the trash icon and replaces the edit icon with it for that entry.
  function startEditMode(entry, container) {
    //set current user and selected times
    currentUser = entry.name;
    selectedTimes = new Set(entry.slots.map((s) => `${s.date}_${s.hour}`));
    timeGrid.classList.add("editing");
    saveBtn.classList.add("show");
    cancelBtn.classList.add("show");
    buildTimeGrid();
    //replace edit icon with trash icon
    container.querySelector(".fa-pencil").remove();
    const trash = document.createElement("i");
    trash.classList.add("fa", "fa-trash", "delete-icon");
    trash.title = "Delete availability";
    trash.onclick = () => deleteResponse(entry.name);
    container.appendChild(trash);
  }

  //This function handles the deletion of a user's availability response. It prompts the user for confirmation, sends a delete request to the server, and updates the UI based on the server's response.
  async function deleteResponse(name) {
    //checks if user confirms deletion
    if (!confirm(`Delete ${name}'s availability?`)) return;

    try {
      //sends a POST request to the server to delete the user's availability
      const res = await fetch(`/api/event/${EVENT_ID}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      //processes the server's response
      const j = await res.json();
      //checks if deletion was successful and updates the UI accordingly
      if (j.status === "deleted") {
        alert(`${name}'s availability deleted.`);
        resetEditing();
      } else {
        alert("Error deleting availability.");
      }
    } catch {
      alert("Network or server error while deleting.");
    }
  }

  //This function adds hover highlights to the response entries. When a user hovers over a response, the corresponding time slots in the grid are highlighted to visually indicate the selected availability.
  function addHoverHighlights() {
    document.querySelectorAll(".response-container").forEach((c) => {
      const slots = c.querySelector("span").dataset.slots.split(",");
      c.onmouseenter = () => highlightSlots(slots, true);
      c.onmouseleave = () => highlightSlots(slots, false);
    });
  }

  //Helper function to highlight slots
  function highlightSlots(slots, on) {
    // Clear all highlights first
    document
      .querySelectorAll(".slot.highlight")
      .forEach((cell) => cell.classList.remove("highlight"));
    if (!on) return;

    // Highlight each matching slot
    slots.forEach((id) => {
      const [date, hour] = id.split("_");
      const cell = document.querySelector(
        `.slot[data-date="${date}"][data-hour="${hour}"]`
      );
      cell?.classList.add("highlight");
    });
  }

  //This function displays the selected event dates in the "Selected Dates" section. It creates span elements for each date and adds them to the designated display box.
  function showSelectedDates() {
    const box = document.getElementById("selectedDatesDisplay");
    box.innerHTML = eventDates
      .map((d) => `<span class="date-pill">${d}</span>`)
      .join("");
  }
};
