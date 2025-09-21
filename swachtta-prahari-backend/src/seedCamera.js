// seedCamera.js
// Script to seed cameras into MongoDB for testing frontend
// Usage: node seedCamera.js

const mongoose = require("mongoose");
const Camera = require("./models/Camera"); // adjust path if needed

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/swachhta_prahari";

async function seedCameras() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing cameras
    await Camera.deleteMany({});
    console.log("Cleared existing cameras");

    const zones = ["A", "B", "C", "D"];
    const statuses = ["online", "offline", "maintenance"];

    const sampleCameras = Array.from({ length: 12 }, (_, i) => {
      const zone = zones[i % zones.length];
      return {
        cameraId: `CAM-${String(i + 1).padStart(3, "0")}`,
        name: `Camera ${i + 1}`,
        location: {
          zone,
          position: `Position ${(i % 4) + 1}`,
          coordinates: {
            latitude: 28.6 + Math.random() * 0.1,
            longitude: 77.2 + Math.random() * 0.1,
          },
        },
        rtspUrl: `rtsp://192.168.1.${i + 10}/live`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        specifications: {
          resolution: "1080p",
          frameRate: 30,
          nightVision: Math.random() > 0.5,
          weatherResistant: true,
        },
        aiConfig: {
          enabled: true,
          detectionTypes: [
            "illegal_dumping",
            "overflow",
            "drain_clogging",
            "cleanliness_index",
          ].filter(() => Math.random() > 0.3),
          sensitivity: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
          confidenceThreshold: 0.7 + Math.random() * 0.2,
        },
        statistics: {
          totalDetections: Math.floor(Math.random() * 100),
          lastDetection: new Date(Date.now() - Math.floor(Math.random() * 100000000)),
          uptime: Math.floor(Math.random() * 1000),
          averageAccuracy: (0.7 + Math.random() * 0.2).toFixed(2),
        },
        maintenance: {
          lastMaintenance: new Date(Date.now() - Math.floor(Math.random() * 100000000)),
          nextMaintenance: new Date(Date.now() + Math.floor(Math.random() * 100000000)),
          maintenanceNotes: "Routine check completed.",
        },
      };
    });

    await Camera.insertMany(sampleCameras);
    console.log("Seeded cameras successfully");
  } catch (err) {
    console.error("Error seeding cameras:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedCameras();
