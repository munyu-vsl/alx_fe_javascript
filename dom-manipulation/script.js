let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Save quotes and current filter to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveSelectedCategory(category) {
  localStorage.setItem("selectedCategory", category);
}

function loadSelectedCategory() {
  return localStorage.getItem("selectedCategory") || "all";
}

// Populate category filter dropdown
function populateCategories() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore selected category if available
  const saved = loadSelectedCategory();
  categoryFilter.value = saved;
}

// Filter and display a random quote
function filterQuotes() {
  const selected = categoryFilter.value;
  saveSelectedCategory(selected);

  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" - [${randomQuote.category}]`;

  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const quoteText = textInput.value.trim();
  const quoteCategory = categoryInput.value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Both quote and category are required.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = "";
  categoryInput.value = "";
}

// Dynamically create the form and import/export controls
function createAddQuoteForm() {
  const formSection = document.createElement("section");

  const heading = document.createElement("h3");
  heading.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.type = "text";
  quoteInput.style.marginRight = "10px";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.type = "text";
  categoryInput.style.marginRight = "10px";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  // Import/export controls
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);
  importInput.style.marginLeft = "10px";

  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes to JSON";
  exportButton.style.marginLeft = "10px";
  exportButton.addEventListener("click", exportToJsonFile);

  formSection.appendChild(heading);
  formSection.appendChild(quoteInput);
  formSection.appendChild(categoryInput);
  formSection.appendChild(addButton);
  formSection.appendChild(document.createElement("br"));
  formSection.appendChild(importInput);
  formSection.appendChild(exportButton);

  document.body.appendChild(formSection);
}

// Export quotes to a JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

      importedQuotes.forEach(q => {
        if (q.text && q.category) quotes.push(q);
      });

      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import: Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Restore last viewed quote from sessionStorage
const last = sessionStorage.getItem("lastQuote");
if (last) {
  const lastQuote = JSON.parse(last);
  quoteDisplay.textContent = `"${lastQuote.text}" - [${lastQuote.category}]`;
}

// Event listeners
newQuoteBtn.addEventListener("click", filterQuotes);

// Initialize
populateCategories();
createAddQuoteForm();
filterQuotes();