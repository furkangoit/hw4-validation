import mongoose from "mongoose";

export const initMongoConnection = async () => {
  try {
    const uri = `mongodb+srv://${process.env.MONGODB_USER}:${encodeURIComponent(
      process.env.MONGODB_PASSWORD
    )}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`;

    console.log("Attempting MongoDB connection...");
    
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully!");
    
    // Veritabanını seed et (ilk çalıştırmada)
    const count = await mongoose.connection.db.collection('contacts').countDocuments();
    if (count === 0) {
      console.log("Database is empty, seeding contacts...");
      const { seedContacts } = await import("./seedContacts.js");
      await seedContacts();
    }
  } catch (error) {
    console.error("Mongo connection error:", error.message);
    console.error("Full error:", error);
    throw error; // Hatayı yukarı fırlat
  }
};