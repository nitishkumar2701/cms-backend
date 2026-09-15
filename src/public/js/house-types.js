(function () {
  const API = "/api/house-types";
  const tableBody = document.getElementById("tableBody");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("postForm");

  let debounceTimer = null;
  
  // State flags for auto-draft logic
  let isDirty = false;
  let isSubmitting = false;

  // Track any typing/changes in the form
  form.addEventListener("input", () => {
    isDirty = true;
  });

  function openModal(isEdit) {
    modalTitle.textContent = isEdit ? "Edit House Type" : "New House Type";
    modalOverlay.classList.add("open");
    // Reset state flags when opening
    isDirty = false;
    isSubmitting = false;
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
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

  // Attach the new handleModalClose to close events
  document.getElementById("modalCloseBtn").addEventListener("click", handleModalClose);
  document.getElementById("cancelBtn").addEventListener("click", handleModalClose);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) handleModalClose();
  });

  function statusBadge(status) {
    const cls = status === "published" ? "badge-published" : "badge-draft";
    return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
  }

  function formatPrice(price) {
    if (price === null || price === undefined) return "—";
    const num = Number(price);
    if (Number.isNaN(num)) return "—";
    return num.toLocaleString(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  }

  function renderRows(items) {
    if (!items.length) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-row">No house types found.</td></tr>`;
      return;
    }
    tableBody.innerHTML = items
      .map(
        (h) => `
      <tr data-id="${h.id}">
        <td>${escapeHtml(h.name)}</td>
        <td>${escapeHtml(h.style || "—")}</td>
        <td>${h.bedrooms ?? "—"} / ${h.bathrooms ?? "—"}</td>
        <td>${formatPrice(h.price)}</td>
        <td>${statusBadge(h.status)}</td>
        <td>${formatDate(h.updatedAt)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${h.id}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${h.id}">Delete</button>
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
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-row">Loading...</td></tr>`;
    const params = new URLSearchParams();
    if (searchInput.value) params.set("search", searchInput.value);
    if (statusFilter.value) params.set("status", statusFilter.value);
    try {
      const items = await apiFetch(`${API}?${params.toString()}`);
      if (items) renderRows(items);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-row">Failed to load house types.</td></tr>`;
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
    
    // Auto-set publish date if switching to published and none is set
    let pubAt = document.getElementById("publishedAt").value;
    if (forcedStatus === "published" && !pubAt) {
      pubAt = new Date().toISOString().slice(0, 16); // Formats to roughly match datetime-local
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
      status: forcedStatus, // Override status here
      floorAreaSqm: document.getElementById("floorAreaSqm").value,
      floorAreaSqft: document.getElementById("floorAreaSqft").value,
      publishedAt: pubAt,
    };

    try {
      if (id) {
        await apiFetch(`${API}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        showAlert("alertBox", isAutoDraft ? "Draft saved automatically." : "House type published.", "success");
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(payload) });
        showAlert("alertBox", isAutoDraft ? "Draft saved automatically." : "House type published.", "success");
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