const prisma = require("../config/prisma");
const { pingFrontend } = require("../helpers/webhook");
function parseTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function buildData(body) {
  const data = {
    title: body.title,
    body: body.body,
    authorName: body.authorName || null,
    imageUrl: body.imageUrl || null,
    category: body.category || null,
    tags: parseTags(body.tags),
    section: body.section || null,
    status: body.status || "draft",
  };

if (body.publishedAt !== undefined) {
  data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
} else if (body.status === "published") {
  // If status is published but no date was sent, do nothing. 
  // It stays 'undefined', meaning Prisma won't overwrite any existing date.
} else if (body.status === "draft") {
  data.publishedAt = null;
}

  return data;
}

exports.list = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { authorName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.newsPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch news posts" });
  }
};

exports.get = async (req, res) => {
  try {
    const post = await prisma.newsPost.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!post) return res.status(404).json({ error: "News post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch news post" });
  }
};

exports.create = async (req, res) => {
  try {
    const data = buildData(req.body);
    if (!data.title || !data.body) {
      return res.status(400).json({ error: "Title and body are required" });
    }
    const post = await prisma.newsPost.create({ data });

    await pingFrontend();

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create news post" });
  }
};

exports.update = async (req, res) => {
  try {
    const data = buildData(req.body);
    const post = await prisma.newsPost.update({
      where: { id: Number(req.params.id) },
      data,
    });
    
    // --- NEW: Ping the Next.js frontend to rebuild the cache ---
    await pingFrontend();
    // -----------------------------------------------------------

    res.json(post);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "News post not found" });
    }
    res.status(500).json({ error: "Failed to update news post" });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.newsPost.delete({ where: { id: Number(req.params.id) } });
    await pingFrontend();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "News post not found" });
    }
    res.status(500).json({ error: "Failed to delete news post" });
  }
};
