let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}
function saveSelectedCategory(category) {
  localStorage.setItem("selectedCategory", category);
}
function loadSelectedCategory() {
  return localStorage.getItem("selectedCategory") || "all";
}
function populateCategories() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = loadSelectedCategory();
}
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
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const quoteText = textInput.value.trim();
  const quoteCategory = categoryInput.value.trim();
  if (!quoteText || !quoteCategory) {
    alert("Both quote and category are required.");
    return;
  }
  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  uploadQuoteToServer(newQuote);
  textInput.value = "";
  categoryInput.value = "";
}
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
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
    const localSet = new Set(quotes.map(q => q.text));
    let updated = false;
    serverQuotes.forEach(serverQuote => {
      if (!localSet.has(serverQuote.text)) {
        quotes.push(serverQuote);
        updated = true;
      }
    });
    if (updated) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      showSyncNotice("Quotes synced with server!");
    } else {
      console.log("No new updates from server.");
    }
  } catch (error) {
    console.error("Server sync failed:", error);
    showSyncNotice("⚠️ Server sync failed.");
  }
}
async function uploadQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });
    const result = await response.json();
    console.log("Uploaded quote:", result);
    showSyncNotice("📤 Quote uploaded to server.");
  } catch (error) {
    console.error("Upload failed:", error);
    showSyncNotice("⚠️ Failed to upload quote.");
  }
}
async function syncQuotes() {
  await fetchQuotesFromServer();
}
setInterval(syncQuotes, 30000);
function showSyncNotice(message) {
  let notice = document.getElementById("syncNotice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "syncNotice";
    notice.style.background = "#e0ffe0";
    notice.style.border = "1px solid #2ecc71";
    notice.style.padding = "10px";
    notice.style.marginTop = "10px";
    notice.style.fontWeight = "bold";
    document.body.insertBefore(notice, quoteDisplay.nextSibling);
  }
  notice.textContent = message;
  notice.style.display = "block";
}
const last = sessionStorage.getItem("lastQuote");
if (last) {
  const lastQuote = JSON.parse(last);
  quoteDisplay.textContent = `"${lastQuote.text}" - [${lastQuote.category}]`;
}
newQuoteBtn.addEventListener("click", filterQuotes);
populateCategories();
createAddQuoteForm();
filterQuotes();