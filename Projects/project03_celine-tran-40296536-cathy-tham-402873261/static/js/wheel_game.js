// API Endpoints
const WHEEL_ENDPOINT = `/api/wheel/${DECISION_ID}`;
const ADD_ENDPOINT = `/api/wheel/${DECISION_ID}/add`;
const SPIN_ENDPOINT = `/api/wheel/${DECISION_ID}/spin`;
const TITLE_ENDPOINT = `/api/wheel/${DECISION_ID}/title`;
const DELETE_ENDPOINT = `/api/wheel/${DECISION_ID}/delete`;
const LEADERBOARD_URL = `/api/wheel/${DECISION_ID}/leaderboard`;
const HISTORY_URL = `/api/wheel/${DECISION_ID}/history`;

// global state variables
// All options currently on the wheel
let wheelOptions = [];

// Current title of the wheel
let wheelTitle = "";

// Remember which slice was last selected as winner
let lastWinnerIndex = null;

// Remember how far the wheel is rotated
let lastRotationAngle = 0;

// Used to block multiple spins at the same time
let isSpinning = false;

// Helpers functions
// Function to show an error message
function showError(message) {
  const errorElement = document.querySelector("#optionError");
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

// Function to clear any existing error message
function clearError() {
  const errorElement = document.querySelector("#optionError");
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
}

// Function to hide the add option row
function hideOptionAdding() {
  const row = document.querySelector(".add-option-row");
  if (row) {
    row.style.display = "none";
  }
}

//API CALLS
// Function to load wheel data from the server
async function api_loadWheel() {
  const response = await fetch(WHEEL_ENDPOINT);
  if (!response.ok) {
    throw new Error("Failed to load wheel");
  }
  return await response.json(); // { title, options }
}

// Function to add an option to the wheel on the server
async function api_addOption(optionText) {
  const response = await fetch(ADD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option: optionText }),
  });
  if (!response.ok) {
    throw new Error("Failed to add option");
  }
}

//Function to delete an option from the wheel on the server
async function api_deleteOption(optionText) {
  const response = await fetch(DELETE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option: optionText }),
  });
  if (!response.ok) {
    throw new Error("Delete failed");
  }
}

// Function to spin wheel and get the winner from server
async function api_spinOnServer() {
  const response = await fetch(SPIN_ENDPOINT, { method: "POST" });
  if (!response.ok) {
    throw new Error("Spin failed");
  }
  // winner strings
  const json = await response.json();
  return json.result;
}

// Function to update the wheel title on the server
async function api_updateTitle(newTitle) {
  const response = await fetch(TITLE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle }),
  });
  return response.ok;
}

// Function to load leaderboard from the server
async function api_loadLeaderboard() {
  const response = await fetch(LEADERBOARD_URL);
  if (!response.ok) {
    return [];
  }
  const json = await response.json();
  return json.leaderboard;
}

// Function to load spin history from the server
async function api_loadHistory() {
  const response = await fetch(HISTORY_URL);
  if (!response.ok) {
    return [];
  }
  const json = await response.json();
  return json.history;
}

// Function to resize the canvas
function resizeCanvas() {
  const canvas = document.querySelector("#wheelCanvas");
  const maxSize = Math.min(canvas.parentElement.offsetWidth, 400);
  canvas.width = maxSize;
  canvas.height = maxSize;
}

// Function to draw the wheel
// with given options and rotation angle
function drawWheel(options, rotation = 0) {
  const canvas = document.getElementById("wheelCanvas");
  const context = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = center * 0.9;

  // Clear the whole canvas
  context.clearRect(0, 0, size, size);

  // If no options, show a simple message
  if (!options.length) {
    context.fillStyle = "#422800";
    context.textAlign = "center";
    context.font = "18px system-ui";
    context.fillText("Add at least one option", center, center);
    return;
  }

  const sliceAngle = (2 * Math.PI) / options.length;

  context.save();
  context.translate(center, center);
  context.rotate(rotation);
  context.translate(-center, -center);

  // Colors used for slices
  const sliceColors = [
    "#fbbf24",
    "#fb7185",
    "#22c55e",
    "#60a5fa",
    "#f97316",
    "#a855f7",
    "#06b6d4",
    "#ec4899",
    "#8b5cf6",
    "#f59e0b",
  ];

  options.forEach((optionText, index) => {
    const angle = index * sliceAngle;

    context.save();
    context.translate(center, center);
    context.rotate(angle);

    // Slice background color
    context.fillStyle = sliceColors[index % sliceColors.length];
    context.beginPath();
    context.arc(0, 0, radius, 0, sliceAngle);
    context.lineTo(0, 0);
    context.fill();

    // Slice border
    context.strokeStyle = "#d4a373";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, radius, 0, sliceAngle);
    context.lineTo(0, 0);
    context.stroke();

    // each slice text
    context.fillStyle = "white";
    context.rotate(sliceAngle / 2);
    context.textAlign = "right";
    context.font = "bold 16px system-ui";
    context.fillText(optionText, radius - 15, 4);

    context.restore();
  });

  context.restore();

  // Draw the pointer
  context.fillStyle = "#d4a373";
  context.beginPath();
  context.moveTo(center - 10, center - radius - 10);
  context.lineTo(center + 10, center - radius - 10);
  context.lineTo(center, center - radius + 10);
  context.fill();
}

// Function to draw a glowing effect around the winning slice
function drawWinningGlow(options, winnerIndex, rotationAngle) {
  if (winnerIndex == null) return;

  const canvas = document.getElementById("wheelCanvas");
  const context = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = center * 0.9;
  const sliceAngle = (2 * Math.PI) / options.length;

  // First redraw the wheel at the final rotation angle
  drawWheel(options, rotationAngle);

  // Now draw the glow around the slice that won
  const startAngleForSlice = winnerIndex * sliceAngle;

  context.save();
  context.translate(center, center);
  context.rotate(rotationAngle + startAngleForSlice);

  context.strokeStyle = "rgba(255,255,0,0.9)";
  context.lineWidth = 14;
  context.shadowColor = "rgba(255,255,150,0.9)";
  context.shadowBlur = 30;

  context.beginPath();
  context.arc(0, 0, radius, 0, sliceAngle);
  context.stroke();

  context.restore();
}

// Function to animate the wheel spinning to a specific index
function spinWheelToIndex(options, winnerIndex, onFinish) {
  const sliceAngle = (2 * Math.PI) / options.length;
  const pointerAngle = -Math.PI / 2; // top of the circle
  const randomJitter = (Math.random() - 0.5) * sliceAngle * 0.4;

  // This rotation puts the chosen slice at the pointer position
  const baseRotation =
    pointerAngle + randomJitter - (winnerIndex * sliceAngle + sliceAngle / 2);

  // Add extra full spins to make it look nice
  const totalRotation = baseRotation + Math.PI * 2 * 8;
  const spinDuration = 3500; // ms
  const startTime = performance.now();

  function animateFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / spinDuration, 1);

    // Slow spin to make effect more natural
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentAngle = eased * totalRotation;

    drawWheel(options, currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    } else {
      // When done, call the onFinish callback to notify
      onFinish(currentAngle);
    }
  }

  requestAnimationFrame(animateFrame);
}

// Function to launch confetti pieces from the top of the screen
function launchConfetti() {
  // for loop to create multiple confetti pieces
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement("div");
    piece.className = "wheel-confetti";

    // Random size between 6px and 14px
    const size = Math.floor(Math.random() * 8) + 6;
    piece.style.position = "fixed";
    // Random horizontal start position
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.top = "-10vh";
    piece.style.width = size + "px";
    piece.style.height = size + "px";
    piece.style.background = "#facc15";
    piece.style.opacity = 0.95;
    piece.style.borderRadius = "50%";
    piece.style.zIndex = 9999;
    piece.style.pointerEvents = "none";

    document.body.appendChild(piece);

    const duration = 1500 + Math.random() * 1500;

    // Animate falling and fading out
    requestAnimationFrame(() => {
      piece.style.transition = `transform ${duration}ms linear, opacity ${duration}ms linear`;
      piece.style.transform = `translateY(${
        window.innerHeight + 200
      }px) rotate(${Math.random() * 720}deg)`;
      piece.style.opacity = 0.2;
    });

    setTimeout(() => piece.remove(), duration + 200);
  }
}

//function to render the list of options under the wheel with delete buttons.
function renderOptions(options) {
  const listElement = document.querySelector("#optionsList");
  listElement.innerHTML = "";

  options.forEach((optionText) => {
    const listItem = document.createElement("li");
    listItem.classList.add("option-item");

    listItem.innerHTML = `
      <span>${optionText}</span>
      <button class="del-btn" data-opt="${optionText}">&times;</button>
    `;

    listElement.appendChild(listItem);
  });

  // Attach delete handlers
  document.querySelectorAll(".del-btn").forEach((deleteButton) => {
    deleteButton.onclick = async () => {
      // Do not allow delete while the wheel is spinning
      if (isSpinning) return;

      const optionToDelete = deleteButton.dataset.opt;

      try {
        await api_deleteOption(optionToDelete);
      } catch {
        return showError("Failed to delete option.");
      }

      // Remove from local array
      wheelOptions = wheelOptions.filter((option) => option !== optionToDelete);

      // If the last winner slice is gone, clear the result box
      if (lastWinnerIndex !== null && wheelOptions.length > lastWinnerIndex) {
        lastWinnerIndex = null;
        document.getElementById("resultDisplay").style.display = "none";
      }

      // Re-render options and wheel
      renderOptions(wheelOptions);
      drawWheel(wheelOptions, 0);

      // Refresh leaderboard so it no longer shows the deleted option
      const leaderboardData = await api_loadLeaderboard();
      renderLeaderboard(leaderboardData);
    };
  });
}

//Function to render the leaderboard and show number of wins for each option ordered by most wins to least wins.
function renderLeaderboard(leaderboardData) {
  const leaderboardElement = document.getElementById("leaderboardList");
  leaderboardElement.innerHTML = "";

  // If no spins yet, show a message
  if (!leaderboardData.length) {
    leaderboardElement.innerHTML = "<li>No spins yet.</li>";
    return;
  }

  // Populate the leaderboard
  leaderboardData.forEach((row) => {
    const listItem = document.createElement("li");
    const timesText = row.wins > 1 ? "wins" : "win";
    listItem.textContent = `${row.option} — ${row.wins} ${timesText}`;
    leaderboardElement.appendChild(listItem);
  });
}

// function to render the spin history
function renderHistory(data) {
  const list = document.getElementById("historyList");
  list.innerHTML = data.length
    ? data
        .map((h) => {
          const date = h.timestamp
            ? new Date(h.timestamp.replace(" ", "T")).toLocaleDateString()
            : "";
          return `<li>${h.result} — ${date}</li>`;
        })
        .join("")
    : "<li>No spins yet.</li>";
}

// load everything when page is ready
window.onload = async function () {
  // --- Grab important DOM elements ---
  const titleDisplay = document.getElementById("wheelTitleDisplay");
  const editTitleButton = document.getElementById("editTitleBtn");
  const editTitleBox = document.getElementById("editTitleBox");
  const titleInput = document.getElementById("wheelTitleInput");
  const saveTitleButton = document.getElementById("saveTitleBtn");

  const resultBox = document.getElementById("resultDisplay");
  const spinButton = document.getElementById("spinBtn");
  const addOptionButton = document.getElementById("addOptionBtn");
  const newOptionInput = document.getElementById("newOptionInput");
  const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");
  const historyList = document.getElementById("historyList");

  // Hide winner result box at the beginning
  resultBox.style.display = "none";

  // --- Load wheel data from the server ---
  let wheelData;
  try {
    wheelData = await api_loadWheel();
  } catch (e) {
    titleDisplay.textContent = "Error loading wheel";
    return;
  }

  // Load and show leaderboard on page load
  const initialLeaderboard = await api_loadLeaderboard();
  renderLeaderboard(initialLeaderboard);

  // Title update functionality
  // Clicking the pencil button opens the input area
  editTitleButton.onclick = () => {
    editTitleBox.style.display = "block";
    editTitleButton.style.display = "none";
    titleInput.value = wheelTitle;
    titleInput.focus();
  };

  // Saving the new title sends it to the server and updates the page
  saveTitleButton.onclick = async () => {
    const newTitle = titleInput.value.trim();
    // Do nothing if input is empty
    if (!newTitle) return;

    const ok = await api_updateTitle(newTitle);
    if (ok) {
      wheelTitle = newTitle;
      titleDisplay.textContent = newTitle;
    }

    // Hide input and show pencil again
    editTitleBox.style.display = "none";
    editTitleButton.style.display = "inline-block";
  };

  // Initialize state from loaded wheel
  wheelOptions = wheelData.options || [];
  wheelTitle = wheelData.title || "Shared Wheel";

  titleDisplay.textContent = wheelTitle;
  titleInput.value = wheelTitle;

  //draw the wheel for the first time
  resizeCanvas();
  window.onresize = () => {
    resizeCanvas();
    drawWheel(wheelOptions, lastRotationAngle);
  };

  renderOptions(wheelOptions);
  drawWheel(wheelOptions, 0);

  // Add option button functionality
  addOptionButton.onclick = async () => {
    clearError();

    const newOption = newOptionInput.value.trim();

    if (!newOption) {
      return showError("Enter an option.");
    }
    if (wheelOptions.includes(newOption)) {
      return showError("Option already exists.");
    }

    try {
      await api_addOption(newOption);
    } catch {
      return showError("Failed to save option.");
    }

    wheelOptions.push(newOption);
    newOptionInput.value = "";
    renderOptions(wheelOptions);
    drawWheel(wheelOptions, lastRotationAngle);
  };

  // Spin Button functionality
  spinButton.onclick = async () => {
    // Do not allow another spin wheel is spinning
    if (isSpinning) return;

    // Need at least one option
    if (!wheelOptions.length) {
      return showError("No options to spin.");
    }

    // Hide the previous winner when spinning again
    resultBox.style.display = "none";

    isSpinning = true;
    spinButton.disabled = true;

    let winnerText;
    try {
      winnerText = await api_spinOnServer();
    } catch {
      isSpinning = false;
      spinButton.disabled = false;
      return showError("Server spin failed.");
    }

    const winnerIndex = wheelOptions.indexOf(winnerText);

    // Animate the wheel and then show the winner
    spinWheelToIndex(wheelOptions, winnerIndex, async (finalAngle) => {
      lastRotationAngle = finalAngle;
      lastWinnerIndex = winnerIndex;

      resultBox.textContent = `Winner: ${winnerText}`;
      resultBox.style.display = "inline-block";

      launchConfetti();
      drawWinningGlow(wheelOptions, winnerIndex, finalAngle);

      // Refresh leaderboard in real time
      const updatedLeaderboard = await api_loadLeaderboard();
      renderLeaderboard(updatedLeaderboard);

      // Refresh history in real time
      const updatedHistory = await api_loadHistory();
      renderHistory(updatedHistory);

      // Allow spinning again
      isSpinning = false;
      spinButton.textContent = "SPIN";
      spinButton.disabled = false;
    });
  };

  // History btn toggle
  toggleHistoryBtn.onclick = async () => {
    if (historyList.classList.contains("hidden")) {
      // Show history
      const historyData = await api_loadHistory();
      renderHistory(historyData);
      historyList.classList.remove("hidden");
      toggleHistoryBtn.textContent = "Hide History";
    } else {
      // Hide history
      historyList.classList.add("hidden");
      toggleHistoryBtn.textContent = "Show History";
    }
  };
};
