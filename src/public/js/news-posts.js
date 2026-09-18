(function () {
  const API = "/api/news-posts";
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
      
      // Use the post title for the folder name
      const postTitle = document.getElementById("title").value.trim();
      formData.append('folderName', postTitle || 'news-uploads');
      
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
          document.getElementById('imageUrl').value = data.url;
          isDirty = true; 
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image. Check server logs.');
      } finally {
        label.textContent = originalText;
        imageUploader.value = ''; 
      }
    });
  }

  function openModal(isEdit) {
    modalTitle.textContent = isEdit ? "Edit Post" : "New Post";
    modalOverlay.classList.remove("hidden"); // Tailwind class
    isDirty = false;
    isSubmitting = false;
  }
  
  function closeModal() {
    modalOverlay.classList.add("hidden"); // Tailwind class
    form.reset();
    document.getElementById("postId").value = "";
    isDirty = false;
    isSubmitting = false;
  }

  // Handle closing modal with potential auto-save
  async function handleModalClose() {
    if (isDirty && !isSubmitting) {
      const titleVal = document.getElementById("title").value.trim();
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

  document.getElementById("modalCloseBtn").addEventListener("click", handleModalClose);
  document.getElementById("cancelBtn").addEventListener("click", handleModalClose);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) handleModalClose();
  });

  // Modern Tailwind pill badges
  function statusBadge(status) {
    if (status === "published") {
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Published</span>`;
    }
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Draft</span>`;
  }

  function renderRows(posts) {
    if (!posts.length) {
      tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 font-medium">No news posts found.</td></tr>`;
      return;
    }
    tableBody.innerHTML = posts
      .map(
        (p) => `
      <tr data-id="${p.id}" class="hover:bg-slate-50 transition-colors group">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${escapeHtml(p.title)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${escapeHtml(p.authorName || "—")}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${escapeHtml(p.category || "—")}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">${statusBadge(p.status)}</td>
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
      btn.addEventListener("click", () => deletePost(btn.dataset.id))
    );
  }

  async function loadPosts() {
    tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 font-medium animate-pulse">Loading data...</td></tr>`;
    const params = new URLSearchParams();
    if (searchInput.value) params.set("search", searchInput.value);
    if (statusFilter.value) params.set("status", statusFilter.value);
    try {
      const posts = await apiFetch(`${API}?${params.toString()}`);
      if (posts) renderRows(posts);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-red-500 font-medium">Failed to load posts.</td></tr>`;
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

  async function savePost(forcedStatus, isAutoDraft = false) {
    const id = document.getElementById("postId").value;
    
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
      status: forcedStatus, 
      imageUrl: document.getElementById("imageUrl").value,
      tags: document.getElementById("tags").value,
      publishedAt: pubAt,
    };

    try {
      if (id) {
        await apiFetch(`${API}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        showAlert("alertBox", isAutoDraft ? "Draft saved automatically." : "News post saved.", "success");
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(payload) });
        showAlert("alertBox", isAutoDraft ? "Draft saved automatically." : "News post saved.", "success");
      }
      loadPosts();
    } catch (err) {
      showAlert("alertBox", err.message, "error");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    isSubmitting = true;
    const selectedStatus = document.getElementById("status").value;
    await savePost(selectedStatus, false);
    closeModal();
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadPosts, 300);
  });
  statusFilter.addEventListener("change", loadPosts);

  loadPosts();
})();