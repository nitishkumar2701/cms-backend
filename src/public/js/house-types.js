(function () {
  const API = "/api/house-types";
  const tableBody = document.getElementById("tableBody");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("postForm");
  const imageUploader = document.getElementById("imageUploader"); // New upload input

  let debounceTimer = null;
  
  // State flags for auto-draft logic
  let isDirty = false;
  let isSubmitting = false;

  // Track any typing/changes in the form
  form.addEventListener("input", () => {
    isDirty = true;
  });

  // --- IMAGE UPLOAD LOGIC ---
  if (imageUploader) {
    imageUploader.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      const houseName = document.getElementById("name").value.trim();
      formData.append('folderName', houseName || 'uncategorized');
      
      const label = imageUploader.previousElementSibling;
      const originalText = label.textContent;
      label.textContent = "Uploading... ⏳";

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.url) {
          const urlInput = document.getElementById('images');
          urlInput.value = urlInput.value ? `${urlInput.value}, ${data.url}` : data.url;
          isDirty = true; // Trigger auto-save flag
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image. Check server logs.');
      } finally {
        label.textContent = originalText;
        imageUploader.value = ''; // Reset file input
      }
    });
  }

  function openModal(isEdit) {
    modalTitle.textContent = isEdit ? "Edit House Type" : "New House Type";
    modalOverlay.classList.remove("hidden"); // Tailwind class
    // Reset state flags when opening
    isDirty = false;
    isSubmitting = false;
  }

  function closeModal() {
    modalOverlay.classList.add("hidden"); // Tailwind class
    form.reset();
    document.getElementById("houseId").value = "";
    isDirty = false;
    isSubmitting = false;
  }

  // Handle closing modal with potential auto-save
  async function handleModalClose() {
    if (isDirty && !isSubmitting) {
      const nameVal = document.getElementById("name").value.trim();
      // Only auto-save if they at least typed a name
      if (nameVal !== "") {
        await saveHouseType("draft", true);
      }
    }
    closeModal();
  }

  document.getElementById("openCreateBtn").addEventListener("click", () => {
    form.reset();
    document.getElementById("houseId").value = "";
    document.getElementById("status").value = "draft";
    openModal(false);
  });

  document.getElementById("modalCloseBtn").addEventListener("click", handleModalClose);
  document.getElementById("cancelBtn").addEventListener("click", handleModalClose);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) handleModalClose();
  });

  // Updated to use modern Tailwind pill badges
  function statusBadge(status) {
    if (status === "published") {
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Published</span>`;
    }
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Draft</span>`;
  }

  function formatPrice(price) {
    if (price === null || price === undefined) return "—";
    const num = Number(price);
    if (Number.isNaN(num)) return "—";
    return num.toLocaleString(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  }

  function renderRows(items) {
    if (!items.length) {
      tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 font-medium">No house types found.</td></tr>`;
      return;
    }
    tableBody.innerHTML = items
      .map(
        (h) => `
      <tr data-id="${h.id}" class="hover:bg-slate-50 transition-colors group">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${escapeHtml(h.name)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${escapeHtml(h.style || "—")}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${h.bedrooms ?? "—"} / ${h.bathrooms ?? "—"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">${formatPrice(h.price)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">${statusBadge(h.status)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${formatDate(h.updatedAt)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
  <div class="flex items-center justify-end gap-2">
    <button class="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-semibold transition-colors edit-btn" data-id="${h.id}">Edit</button>
    <button class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs font-semibold transition-colors delete-btn" data-id="${h.id}">Delete</button>
  </div>
</td>
      </tr>`
      )
      .join("");

    tableBody.querySelectorAll(".edit-btn").forEach((btn) =>
      btn.addEventListener("click", () => loadForEdit(btn.dataset.id))
    );
    tableBody.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", () => deleteItem(btn.dataset.id))
    );
  }

  async function loadItems() {
    tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 font-medium animate-pulse">Loading data...</td></tr>`;
    const params = new URLSearchParams();
    if (searchInput.value) params.set("search", searchInput.value);
    if (statusFilter.value) params.set("status", statusFilter.value);
    try {
      const items = await apiFetch(`${API}?${params.toString()}`);
      if (items) renderRows(items);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-red-500 font-medium">Failed to load house types.</td></tr>`;
    }
  }

  async function loadForEdit(id) {
    try {
      const h = await apiFetch(`${API}/${id}`);
      if (!h) return;
      document.getElementById("houseId").value = h.id;
      document.getElementById("name").value = h.name || "";
      document.getElementById("style").value = h.style || "";
      document.getElementById("berRating").value = h.berRating || "";
      document.getElementById("description").value = h.description || "";
      document.getElementById("images").value = (h.images || []).join(", ");
      document.getElementById("price").value = h.price ?? "";
      document.getElementById("floors").value = h.floors ?? "";
      document.getElementById("garageSpaces").value = h.garageSpaces ?? "";
      document.getElementById("bedrooms").value = h.bedrooms ?? "";
      document.getElementById("bathrooms").value = h.bathrooms ?? "";
      document.getElementById("status").value = h.status || "draft";
      document.getElementById("floorAreaSqm").value = h.floorAreaSqm ?? "";
      document.getElementById("floorAreaSqft").value = h.floorAreaSqft ?? "";
      document.getElementById("publishedAt").value = toDatetimeLocalValue(h.publishedAt);
      openModal(true);
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  async function deleteItem(id) {
    if (!confirm("Delete this house type? This cannot be undone.")) return;
    try {
      await apiFetch(`${API}/${id}`, { method: "DELETE" });
      showAlert("alertBox", "House type deleted.", "success");
      loadItems();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  // Extracted Save Logic
  async function saveHouseType(forcedStatus, isAutoDraft = false) {
    const id = document.getElementById("houseId").value;
    
    let pubAt = document.getElementById("publishedAt").value;
    if (forcedStatus === "published" && !pubAt) {
      pubAt = new Date().toISOString().slice(0, 16); 
    }

    const payload = {
      name: document.getElementById("name").value,
      style: document.getElementById("style").value,
      berRating: document.getElementById("berRating").value,
      description: document.getElementById("description").value,
      images: document.getElementById("images").value,
      price: document.getElementById("price").value,
      floors: document.getElementById("floors").value,
      garageSpaces: document.getElementById("garageSpaces").value,
      bedrooms: document.getElementById("bedrooms").value,
      bathrooms: document.getElementById("bathrooms").value,
      status: forcedStatus, 
      floorAreaSqm: document.getElementById("floorAreaSqm").value,
      floorAreaSqft: document.getElementById("floorAreaSqft").value,
      publishedAt: pubAt,
    };

    try {
      if (id) {
        await apiFetch(`${API}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        showAlert("alertBox", isAutoDraft ? "Draft saved automatically." : "House type saved.", "success");
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(payload) });
        showAlert("alertBox", isAutoDraft ? "Draft saved automatically." : "House type saved.", "success");
      }
      loadItems();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  // Handle explicit form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    isSubmitting = true;
    
    // Force status to "published" when the main save button is clicked
    await saveHouseType("published", false);
    closeModal();
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadItems, 300);
  });
  statusFilter.addEventListener("change", loadItems);

  loadItems();
})();