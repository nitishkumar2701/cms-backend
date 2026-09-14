const prisma = require("../config/prisma");

function buildData(body) {
  return {
    title: body.title,
    sectionId: body.sectionId,
    sectionTitle: body.sectionTitle,
    sectionSubtitle: body.sectionSubtitle || null,
    sectionBody: body.sectionBody,
    imageUrl: body.imageUrl || null,
  };
}

exports.list = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { sectionId: { contains: search, mode: "insensitive" } },
        { sectionTitle: { contains: search, mode: "insensitive" } },
      ];
    }
    const pages = await prisma.pageContent.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch page content" });
  }
};

exports.get = async (req, res) => {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!page) return res.status(404).json({ error: "Page content not found" });
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch page content" });
  }
};

exports.create = async (req, res) => {
  try {
    const data = buildData(req.body);
    if (!data.title || !data.sectionId || !data.sectionTitle || !data.sectionBody) {
      return res.status(400).json({
        error: "title, sectionId, sectionTitle and sectionBody are required",
      });
    }
    const page = await prisma.pageContent.create({ data });
    res.status(201).json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create page content" });
  }
};

exports.update = async (req, res) => {
  try {
    const data = buildData(req.body);
    const page = await prisma.pageContent.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(page);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Page content not found" });
    }
    res.status(500).json({ error: "Failed to update page content" });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.pageContent.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Page content not found" });
    }
    res.status(500).json({ error: "Failed to delete page content" });
  }
};
