"""
MongoDB connection management using PyMongo.
Provides a module-level client and db reference used across routes.
"""

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import dotenv_values

# Load .env if present (fall back to OS env vars)
_env = dotenv_values(".env")

MONGO_URI: str = _env.get("MONGO_URI") or os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME: str = _env.get("DB_NAME") or os.getenv("DB_NAME", "student_dropout_db")

_client: MongoClient | None = None
db = None  # module-level reference used by routes


def connect_db() -> None:
    """Initialise the MongoDB client and verify connectivity."""
    global _client, db
    try:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Force connection check
        _client.admin.command("ping")
        db = _client[DB_NAME]
        print(f"✅  Connected to MongoDB: {MONGO_URI}  DB: {DB_NAME}")
    except ConnectionFailure as exc:
        print(f"❌  Could not connect to MongoDB: {exc}")
        raise


def close_db() -> None:
    """Close the MongoDB client on shutdown."""
    global _client
    if _client:
        _client.close()
        print("🔒  MongoDB connection closed.")


def get_db():
    """Return the active database instance (for dependency injection)."""
    if db is None:
        raise RuntimeError("Database not initialised. Call connect_db() first.")
    return db
