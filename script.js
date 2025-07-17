let shortcuts = JSON.parse(localStorage.getItem("shortcuts") || "[]");
let editIndex = -1;

const shortcutGrid = document.getElementById("shortcutGrid");
const modal = document.getElementById("modal");
const backdrop = document.getElementById("backdrop");

const nameInput = document.getElementById("shortcutName");
const urlInput = document.getElementById("shortcutURL");
const imageInput = document.getElementById("shortcutImage");

const saveBtn = document.getElementById("saveShortcut");
const cancelBtn = document.getElementById("cancel");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const applySettingsBtn = document.getElementById("applySettings");

let rows = 2;
let cols = 6;

if (localStorage.getItem("rows")) rows = parseInt(localStorage.getItem("rows"));
if (localStorage.getItem("cols")) cols = parseInt(localStorage.getItem("cols"));

function renderShortcuts() {
  shortcutGrid.innerHTML = "";
  shortcutGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  shortcuts.forEach((shortcut, index) => {
    const div = document.createElement("div");
    div.className = "shortcut";

    let logo = shortcut.image;
    try {
      const domain = new URL(shortcut.url).hostname;
      // Changed to Icon Horse API
      logo = logo || `https://icon.horse/icon/${domain}`; 
    } catch {
      // Fallback to a generic icon if URL is invalid
      logo = "https://icon.horse/icon/google.com"; 
    }

    div.innerHTML = `
      <div class="shortcut-actions">
        <span class="menu" data-index="${index}">⋮</span>
        <div class="menu-dropdown" id="dropdown-${index}">
          <button data-action="edit" data-index="${index}">Edit</button>
          <button data-action="delete" data-index="${index}">Delete</button>
        </div>
      </div>
      <div class="shortcut-link" data-url="${shortcut.url}">
        <img src="${logo}" alt="${shortcut.name}" class="shortcut-img">
        <span>${shortcut.name}</span>
      </div>
    `;
    shortcutGrid.appendChild(div);

    // Add error handling for images (Icon Horse provides fallbacks, but this is good practice)
    div.querySelector(".shortcut-img").addEventListener("error", () => {
      div.querySelector(".shortcut-img").src = "https://icon.horse/icon/google.com";
    });
  });

  const addBtn = document.createElement("div");
  addBtn.className = "shortcut";
  addBtn.innerHTML = `<button class="add-btn">+</button>`;
  shortcutGrid.appendChild(addBtn);

  // Attach event listeners after rendering
  document.querySelectorAll(".menu").forEach(menu => {
    menu.addEventListener("click", (e) => {
      e.stopPropagation();
      const index = parseInt(e.currentTarget.getAttribute("data-index"));
      toggleDropdown(e, index);
    });
  });

  document.querySelectorAll(".menu-dropdown button").forEach(button => {
    button.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.getAttribute("data-index"));
      const action = e.currentTarget.getAttribute("data-action");
      if (action === "edit") {
        editShortcut(index);
      } else if (action === "delete") {
        deleteShortcut(index);
      }
    });
  });

  document.querySelectorAll(".shortcut-link").forEach(link => {
    link.addEventListener("click", () => {
      const url = link.getAttribute("data-url");
      window.location.href = url;
    });
  });

  document.querySelector(".add-btn").addEventListener("click", openModal);
}

function openModal() {
  editIndex = -1;
  nameInput.value = "";
  urlInput.value = "";
  imageInput.value = "";
  modal.classList.add("show");
  backdrop.classList.add("show");
  nameInput.focus();
}

function closeModal() {
  modal.classList.remove("show");
  backdrop.classList.remove("show");
}

function toggleDropdown(e, index) {
  e.stopPropagation();
  document.querySelectorAll(".menu-dropdown").forEach(menu => menu.style.display = "none");
  const dropdown = document.getElementById(`dropdown-${index}`);
  dropdown.style.display = "flex";
}

function editShortcut(index) {
  editIndex = index;
  const shortcut = shortcuts[index];
  nameInput.value = shortcut.name;
  urlInput.value = shortcut.url;
  imageInput.value = shortcut.image || "";
  modal.classList.add("show");
  backdrop.classList.add("show");
}

function deleteShortcut(index) {
  if (confirm(`Delete "${shortcuts[index].name}"?`)) {
    shortcuts.splice(index, 1);
    saveAndRender();
  }
}

function saveAndRender() {
  localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
  renderShortcuts();
}

// Event Listeners
saveBtn.onclick = () => {
  const name = nameInput.value.trim();
  let url = urlInput.value.trim();
  let image = imageInput.value.trim();

  if (!name || !url) return alert("Name and URL required");

  // Ensure https:// prefix
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // If no custom image is provided, generate one using Icon Horse
  if (!image) {
    try {
      const domain = new URL(url).hostname;
      image = `https://icon.horse/icon/${domain}`;
    } catch {
      image = "https://icon.horse/icon/google.com"; // Fallback for invalid URL
    }
  }

  if (editIndex > -1) {
    shortcuts[editIndex] = { name, url, image };
  } else {
    shortcuts.push({ name, url, image });
  }

  closeModal();
  saveAndRender();
};

cancelBtn.onclick = closeModal;
backdrop.onclick = closeModal;

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && modal.classList.contains("show")) {
    saveBtn.click();
  }
});

settingsBtn.onclick = () => {
  rowsInput.value = rows;
  colsInput.value = cols;
  settingsModal.classList.toggle("show");
};

applySettingsBtn.onclick = () => {
  rows = parseInt(rowsInput.value);
  cols = parseInt(colsInput.value);
  localStorage.setItem("rows", rows);
  localStorage.setItem("cols", cols);
  settingsModal.classList.remove("show");
  renderShortcuts();
};

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("menu")) {
    document.querySelectorAll(".menu-dropdown").forEach(menu => menu.style.display = "none");
  }
});

renderShortcuts();