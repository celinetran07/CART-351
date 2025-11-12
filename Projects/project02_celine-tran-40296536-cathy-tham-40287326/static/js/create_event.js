window.onload = function () {
  //state variables
  let selectedDates = new Set();
  let currentMonth = new Date();
  let isDragging = false;
  //to "select" or "deselect"
  let dragMode = null;

  //cached DOM elements
  const grid = document.getElementById("calendarGrid");
  const label = document.getElementById("monthLabel");
  const form = document.getElementById("createEventForm");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  //constants
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  //Helper functions
  //Creates a unique key for each date in the format YYYY-MM-DD
  const dateKey = (y, m, d) =>
    //padStart ensures month and day are two digits eg. 2024-06-09
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  //This function toggles the selection of a date. When a date is selected, it adds it to the selectedDates set and adds the "selected" class to the cell. When a date is deselected, it removes it from the set and removes the class.
  function toggleDate(key, cell) {
    const selected = selectedDates.has(key);
    cell.classList.toggle("selected", !selected);
    selected ? selectedDates.delete(key) : selectedDates.add(key);
  }

  //This function creates a day cell for the calendar grid. It sets up the cell's appearance and event listeners for selection and dragging. When a cell is created, it checks if the date is in the past (disabled) or already selected, and applies the appropriate classes. It also sets up event listeners for mouse actions to handle selection and dragging.
  function createDayCell(y, m, d) {
    //create the cell element and set its class and text
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = d;
    //create a unique key and date object for the cell and store the key in a data attribute
    const key = dateKey(y, m, d);
    const cellDate = new Date(y, m, d);
    cell.dataset.key = key;

    //mark disabled or selected depinding on date
    if (cellDate < today) cell.classList.add("disabled");
    if (selectedDates.has(key)) cell.classList.add("selected");

    //handle selection
    cell.addEventListener("mousedown", (e) => startDrag(e, cell, key));
    cell.addEventListener("mouseenter", () => dragSelect(cell, key));

    return cell;
  }

  //This function starts the drag selection process. It determines whether the user is selecting or deselecting dates based on the initial cell clicked. It sets the dragMode accordingly and toggles the date selection for the initial cell. It also prevents text highlighting during the drag operation.
  function startDrag(e, cell, key) {
    //check if cell is disabled 
    if (cell.classList.contains("disabled")) return;
    //determine drag mode based on whether the date is already selected and call toggleDate to update selection
    dragMode = selectedDates.has(key) ? "deselect" : "select";
    toggleDate(key, cell);
    //set dragging flag to true to indicate drag operation is in progress
    isDragging = true;
    //prevent text highlighting
    e.preventDefault(); 
  }

  //This function handles the drag selection of dates. It checks if the user is currently dragging and whether the cell is disabled. Depending on the dragMode, it either selects or deselects the date associated with the cell.
  function dragSelect(cell, key) {
    //check if dragging is active and cell is not disabled to proceed
    if (!isDragging || cell.classList.contains("disabled")) return;
    
    const shouldSelect = dragMode === "select" && !selectedDates.has(key);
    const shouldDeselect = dragMode === "deselect" && selectedDates.has(key);
    if (shouldSelect || shouldDeselect) toggleDate(key, cell);
  }

  //This function stops the drag selection process by resetting the isDragging flag and clearing the dragMode.
  function stopDrag() {
    isDragging = false;
    dragMode = null;
  }

  //This function renders the calendar for the current month. It calculates the number of days in the month and the starting day of the week. It then creates and appends day cells to the calendar grid, including blank slots for days before the first of the month. It also updates the month label to reflect the current month and year.
  function renderCalendar() {
    //clear existing grid
    grid.innerHTML = "";
    //get year and month and update label
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    label.textContent = currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    //calculate first day of month and number of days in month
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    //blank slots before 1st of month
    grid.innerHTML = "<div></div>".repeat(firstDay);
    //create day cells for each day in month
    for (let d = 1; d <= daysInMonth; d++) {
      grid.appendChild(createDayCell(y, m, d));
    }
  }

  //This function changes the current month by a given offset (positive or negative) and re-renders the calendar to reflect the new month.
  function changeMonth(offset) {
    currentMonth.setMonth(currentMonth.getMonth() + offset);
    renderCalendar();
  }

  //This function handles the form submission for creating an event. It gathers the form data, including the selected dates, and sends it to the server via a POST request. If no dates are selected, it alerts the user to select at least one date. On successful creation of the event, it redirects the user to the event page.
  async function handleSubmit(e) {
    e.preventDefault();
    //gather form data and selected dates
    const data = Object.fromEntries(new FormData(form).entries());
    data.start_time = Number(data.start_time);
    data.end_time = Number(data.end_time);
    data.dates = [...selectedDates].sort();
    //cjeck if at least one date is selected
    if (!data.dates.length) {
      alert("Please select at least one date before creating the event.");
      return;
    }
    //send POST request to create event with form data
    const res = await fetch("/api/create_event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    //handle response and redirect to event page
    const result = await res.json();
    window.location.href = `/event/${result.event_id}`;
  }

  //Event Listeners, calling helper functions
  document.addEventListener("mouseup", stopDrag);
  prevBtn.addEventListener("click", () => changeMonth(-1));
  nextBtn.addEventListener("click", () => changeMonth(1));
  form.addEventListener("submit", handleSubmit);

  //Initial Render
  renderCalendar();
};
