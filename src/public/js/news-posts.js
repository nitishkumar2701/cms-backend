(function () {
  const API = "/api/news-posts";
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
    modalTitle.textContent = isEdit ? "Edit Post" : "New Post";
    modalOverlay.classList.add("open");
    // Reset state flags when opening
    isDirty = false;
    isSubmitting = false;
  }
  
  function closeModal() {
    modalOverlay.classList.remove("open");
    form.reset();
    document.getElementById("postId").value = "";
    isDirty = false;
    isSubmitting = false;
  }

  // Handle closing modal with potential auto-save
  async function handleModalClose() {
    if (isDirty && !isSubmitting) {
      const titleVal = document.getElementById("title").value.trim();
      // Only auto-save if they at least typed a title
      if (titleVal !== "") {
        await savePost("draft", true);
      }
    }
    closeModal();
  }

  document.getElementById("openCreateBtn").addEventListener("click", () => {
    form.reset();
    document.getElementById("postId").value = "";
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
    const cls = status === "published" ? "badge-published": "badge-draft";
    return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
  }

  function renderRows(posts) {
    if (!posts.length) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-row">No news posts found.</td></tr>`;
      return;
    }
    tableBody.innerHTML = posts
      .map(
        (p) => `
      <tr data-id="${p.id}">
        <td>${escapeHtml(p.title)}</td>
        <td>${escapeHtml(p.authorName || "—")}</td>
        <td>${escapeHtml(p.category || "—")}</td>
        <td>${statusBadge(p.status)}</td>
        <td>${formatDate(p.publishedAt)}</td>
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
      btn.addEventListener("click", () => deletePost(btn.dataset.id))
    );
  }

  async function loadPosts() {
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-row">Loading...</td></tr>`;
    const params = new URLSearchParams();
    if (searchInput.value) params.set("search", searchInput.value);
    if (statusFilter.value) params.set("status", statusFilter.value);
    try {
      const posts = await apiFetch(`${API}?${params.toString()}`);
      if (posts) renderRows(posts);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-row">Failed to load posts.</td></tr>`;
    }
  }

  async function loadForEdit(id) {
    try {
      const post = await apiFetch(`${API}/${id}`);
      if (!post) return;
      document.getElementById("postId").value = post.id;
      document.getElementById("title").value = post.title || "";
      document.getElementById("body").value = post.body || "";
      document.getElementById("authorName").value = post.authorName || "";
      document.getElementById("category").value = post.category || "";
      document.getElementById("section").value = post.section || "";
      document.getElementById("status").value = post.status || "draft";
      document.getElementById("imageUrl").value = post.imageUrl || "";
      document.getElementById("tags").value = (post.tags || []).join(", ");
      document.getElementById("publishedAt").value = toDatetimeLocalValue(post.publishedAt);
      openModal(true);
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  async function deletePost(id) {
    if (!confirm("Delete this news post? This cannot be undone.")) return;
    try {
      await apiFetch(`${API}/${id}`, { method: "DELETE" });
      showAlert("alertBox", "News post deleted.", "success");
      loadPosts();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  // Extracted Save Logic
  async function savePost(forcedStatus, isAutoDraft = false) {
    const id = document.getElementById("postId").value;
    
    // Auto-set publish date if switching to published and none is set
    let pubAt = document.getElementById("publishedAt").value;
    if (forcedStatus === "published" && !pubAt) {
      pubAt = new Date().toISOString().slice(0, 16); 
    }

    const payload = {
      title: document.getElementById("title").value,
      body: document.getElementById("body").value,
      authorName: document.getElementById("authorName").value,
      category: document.getElementById("category").value,
      section: document.getElementById("section").value,
      status: forcedStatus, // Override status here
      imageUrl: document.getElementById("imageUrl").value,
      tags: document.getElementById("tags").value,
      publishedAt: pubAt,
    };

    try {
      if (id) {
        await apiFetch(`${API}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        showAlert("alertBox", isAutoDraft ? "Draft saved automatically." : "News post published.", "success");
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(payload) });
        showAlert("alertBox", isAutoDraft ? "Draft saved automatically." : "News post published.", "success");
      }
      loadPosts();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  // Handle explicit form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    isSubmitting = true;
    await savePost("published", false);
    closeModal();
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadPosts, 300);
  });
  statusFilter.addEventListener("change", loadPosts);

  loadPosts();
})();