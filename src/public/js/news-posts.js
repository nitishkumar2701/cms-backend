(function () {
  const API = "/api/news-posts";
  const tableBody = document.getElementById("tableBody");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("postForm");

  let debounceTimer = null;

  function openModal(isEdit) {
    modalTitle.textContent = isEdit ? "Edit Post" : "New Post";
    modalOverlay.classList.add("open");
  }
  function closeModal() {
    modalOverlay.classList.remove("open");
    form.reset();
    document.getElementById("postId").value = "";
  }

  document.getElementById("openCreateBtn").addEventListener("click", () => {
    form.reset();
    document.getElementById("postId").value = "";
    document.getElementById("status").value = "draft";
    openModal(false);
  });
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function statusBadge(status) {
    const cls = status === "published" ? "badge-published" : status === "archived" ? "badge-archived" : "badge-draft";
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("postId").value;
    const payload = {
      title: document.getElementById("title").value,
      body: document.getElementById("body").value,
      authorName: document.getElementById("authorName").value,
      category: document.getElementById("category").value,
      section: document.getElementById("section").value,
      status: document.getElementById("status").value,
      imageUrl: document.getElementById("imageUrl").value,
      tags: document.getElementById("tags").value,
      publishedAt: document.getElementById("publishedAt").value,
    };

    try {
      if (id) {
        await apiFetch(`${API}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        showAlert("alertBox", "News post updated.", "success");
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(payload) });
        showAlert("alertBox", "News post created.", "success");
      }
      closeModal();
      loadPosts();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadPosts, 300);
  });
  statusFilter.addEventListener("change", loadPosts);

  loadPosts();
})();
