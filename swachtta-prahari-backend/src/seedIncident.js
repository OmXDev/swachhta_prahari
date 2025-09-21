// seedIncident.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Camera = require("./models/Camera"); // adjust path if needed
const Incident = require("./models/Incident");

dotenv.config();

const seedIncidents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // find at least one camera
    const camera = await Camera.findOne();
    if (!camera) {
      console.error("❌ No cameras found in DB. Please seed cameras first.");
      process.exit(1);
    }

    const incidents = [
      {
        type: "overflow",
        severity: "high",
        camera: camera._id,
        location: {
          zone: camera.location?.zone || "Zone A",
          specific: "Main Entrance",
          coordinates: { x: 12.34, y: 56.78 },
        },
        description: "Detected overflowing garbage bin.",
        aiDetection: {
          confidence: 0.92,
          modelVersion: "v1.0",
          boundingBox: { x: 100, y: 150, width: 200, height: 300 },
        },
        evidence: {
          images: [
            { filename: "overflow1.jpg", path: "/uploads/images/overflow1.jpg", size: 2048 },
          ],
          videos: [
            {
              filename: "overflow1.mp4",
              path: "/uploads/videos/overflow1.mp4",
              duration: 12,
              size: 10240,
            },
          ],
        },
      },
      {
        type: "illegal_dumping",
        severity: "medium",
        camera: camera._id,
        location: {
          zone: camera.location?.zone || "Zone B",
          specific: "Backyard",
          coordinates: { x: 98.76, y: 54.32 },
        },
        description: "Person detected dumping trash illegally.",
        aiDetection: {
          confidence: 0.87,
          modelVersion: "v1.1",
          boundingBox: { x: 200, y: 220, width: 120, height: 180 },
        },
        evidence: {
          images: [{ filename: "dump1.jpg", path: "/uploads/images/dump1.jpg", size: 3000 }],
          videos: [],
        },
      },
    ];

    await Incident.insertMany(incidents);
    console.log(`✅ Seeded ${incidents.length} incidents`);

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedIncidents();
