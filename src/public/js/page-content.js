(function () {
  const API = "/api/page-content";
  const tableBody = document.getElementById("tableBody");
  const searchInput = document.getElementById("searchInput");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("postForm");

  let debounceTimer = null;
  let isSubmitting = false;

  function openModal(isEdit) {
    modalTitle.textContent = isEdit ? "Edit Content Block" : "New Content Block";
    modalOverlay.classList.remove("hidden");
    isSubmitting = false;
  }
  
  function closeModal() {
    modalOverlay.classList.add("hidden");
    form.reset();
    document.getElementById("pageId").value = "";
    isSubmitting = false;
  }

  document.getElementById("openCreateBtn").addEventListener("click", () => {
    form.reset();
    document.getElementById("pageId").value = "";
    openModal(false);
  });

  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function renderRows(items) {
    if (!items.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 font-medium">No content blocks found.</td></tr>`;
      return;
    }
    tableBody.innerHTML = items
      .map(
        (p) => `
      <tr data-id="${p.id}" class="hover:bg-slate-50 transition-colors group">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${escapeHtml(p.title)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">${escapeHtml(p.sectionId)}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${escapeHtml(p.sectionTitle)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${formatDate(p.updatedAt)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
          <div class="flex items-center justify-end gap-2">
            <button class="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-semibold transition-colors edit-btn" data-id="${p.id}">Edit</button>
            <button class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs font-semibold transition-colors delete-btn" data-id="${p.id}">Delete</button>
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
    tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 font-medium animate-pulse">Loading data...</td></tr>`;
    const params = new URLSearchParams();
    if (searchInput.value) params.set("search", searchInput.value);
    
    try {
      const items = await apiFetch(`${API}?${params.toString()}`);
      if (items) renderRows(items);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-red-500 font-medium">Failed to load content blocks.</td></tr>`;
    }
  }

  async function loadForEdit(id) {
    try {
      const item = await apiFetch(`${API}/${id}`);
      if (!item) return;
      document.getElementById("pageId").value = item.id;
      document.getElementById("title").value = item.title || "";
      document.getElementById("sectionId").value = item.sectionId || "";
      document.getElementById("sectionTitle").value = item.sectionTitle || "";
      document.getElementById("sectionSubtitle").value = item.sectionSubtitle || "";
      document.getElementById("sectionBody").value = item.sectionBody || "";
      document.getElementById("imageUrl").value = item.imageUrl || "";
      openModal(true);
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  async function deleteItem(id) {
    if (!confirm("Delete this content block? This cannot be undone.")) return;
    try {
      await apiFetch(`${API}/${id}`, { method: "DELETE" });
      showAlert("alertBox", "Content block deleted.", "success");
      loadItems();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  async function saveItem() {
    const id = document.getElementById("pageId").value;
    
    const payload = {
      title: document.getElementById("title").value,
      sectionId: document.getElementById("sectionId").value,
      sectionTitle: document.getElementById("sectionTitle").value,
      sectionSubtitle: document.getElementById("sectionSubtitle").value,
      sectionBody: document.getElementById("sectionBody").value,
      imageUrl: document.getElementById("imageUrl").value,
    };

    try {
      if (id) {
        await apiFetch(`${API}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        showAlert("alertBox", "Content block updated.", "success");
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(payload) });
        showAlert("alertBox", "Content block created.", "success");
      }
      loadItems();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;
    await saveItem();
    closeModal();
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadItems, 300);
  });

  loadItems();
})();