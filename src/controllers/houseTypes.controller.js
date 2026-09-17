const prisma = require("../config/prisma");
const { pingFrontend } = require("../helpers/webhook");

function parseImages(images) {
  if (Array.isArray(images)) {
    return images.map((i) => String(i).trim()).filter(Boolean);
  }
  if (typeof images === "string") {
    return images
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
  }
  return [];
}

function toDecimalOrNull(val) {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
}

function toIntOrNull(val) {
  if (val === undefined || val === null || val === "") return null;
  const num = parseInt(val, 10);
  return Number.isNaN(num) ? null : num;
}

function buildData(body) {
  const data = {
    name: body.name,
    berRating: body.berRating || null,
    style: body.style || null,
    description: body.description || null,
    images: parseImages(body.images),
    price: toDecimalOrNull(body.price),
    floors: toIntOrNull(body.floors),
    bedrooms: toIntOrNull(body.bedrooms),
    bathrooms: toIntOrNull(body.bathrooms),
    floorAreaSqm: toDecimalOrNull(body.floorAreaSqm),
    floorAreaSqft: toDecimalOrNull(body.floorAreaSqft),
    garageSpaces: toIntOrNull(body.garageSpaces),
    status: body.status || "draft",
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
  };
  return data;
}

exports.list = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { style: { contains: search, mode: "insensitive" } },
      ];
    }
    const houseTypes = await prisma.houseType.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(houseTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch house types" });
  }
};

exports.get = async (req, res) => {
  try {
    const houseType = await prisma.houseType.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!houseType) return res.status(404).json({ error: "House type not found" });
    res.json(houseType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch house type" });
  }
};

exports.create = async (req, res) => {
  try {
    const data = buildData(req.body);
    if (!data.name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const houseType = await prisma.houseType.create({ data });
    await pingFrontend();
    res.status(201).json(houseType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create house type" });
  }
};

exports.update = async (req, res) => {
  try {
    const data = buildData(req.body);
    const houseType = await prisma.houseType.update({
      where: { id: Number(req.params.id) },
      data,
    });
    
    // --- NEW: Ping the Next.js frontend to rebuild the cache ---
    await pingFrontend();
    // -----------------------------------------------------------

    res.json(houseType);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "House type not found" });
    }
    res.status(500).json({ error: "Failed to update house type" });
  }
};



exports.remove = async (req, res) => {
  try {
    await prisma.houseType.delete({ where: { id: Number(req.params.id) } });
    await pingFrontend();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "House type not found" });
    }
    res.status(500).json({ error: "Failed to delete house type" });
  }
};
