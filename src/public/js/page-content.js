(function () {
  const API = "/api/page-content";
  const tableBody = document.getElementById("tableBody");
  const searchInput = document.getElementById("searchInput");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("postForm");

  let debounceTimer = null;

  function openModal(isEdit) {
    modalTitle.textContent = isEdit ? "Edit Content Block" : "New Content Block";
    modalOverlay.classList.add("open");
  }
  function closeModal() {
    modalOverlay.classList.remove("open");
    form.reset();
    document.getElementById("pageId").value = "";
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

  function renderRows(pages) {
    if (!pages.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="empty-row">No page content found.</td></tr>`;
      return;
    }
    tableBody.innerHTML = pages
      .map(
        (p) => `
      <tr data-id="${p.id}">
        <td>${escapeHtml(p.title)}</td>
        <td>${escapeHtml(p.sectionId)}</td>
        <td>${escapeHtml(p.sectionTitle)}</td>
        <td>${formatDate(p.updatedAt)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${p.id}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${p.id}">Delete</button>
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
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-row">Loading...</td></tr>`;
    const params = new URLSearchParams();
    if (searchInput.value) params.set("search", searchInput.value);
    try {
      const pages = await apiFetch(`${API}?${params.toString()}`);
      if (pages) renderRows(pages);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="5" class="empty-row">Failed to load content.</td></tr>`;
    }
  }

  async function loadForEdit(id) {
    try {
      const page = await apiFetch(`${API}/${id}`);
      if (!page) return;
      document.getElementById("pageId").value = page.id;
      document.getElementById("title").value = page.title || "";
      document.getElementById("sectionId").value = page.sectionId || "";
      document.getElementById("sectionTitle").value = page.sectionTitle || "";
      document.getElementById("sectionSubtitle").value = page.sectionSubtitle || "";
      document.getElementById("sectionBody").value = page.sectionBody || "";
      document.getElementById("imageUrl").value = page.imageUrl || "";
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
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
      closeModal();
      loadItems();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadItems, 300);
  });

  loadItems();
})();
