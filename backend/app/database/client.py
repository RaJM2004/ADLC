import json
import os
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.core.config import settings, BASE_DIR
from app.core.logging import logger

try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
except ImportError:
    MongoClient = None
    ConnectionFailure = Exception
    ServerSelectionTimeoutError = Exception


def sanitize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Ensure MongoDB ObjectId does not break JSON serialization."""
    if doc is None:
        return None
    d = dict(doc)
    if "_id" in d:
        d["_id"] = str(d["_id"])
    return d


class MockCollection:
    """Thread-safe persistent JSON-backed collection mimicking PyMongo collection."""

    def __init__(self, name: str, db_dir: Path):
        self.name = name
        self.file_path = db_dir / f"{name}.json"
        self._lock = threading.Lock()
        self._data: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception as e:
                logger.warning(f"Error loading {self.file_path}: {e}. Initializing empty.")
                self._data = []
        else:
            self._data = []

    def _save(self):
        try:
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to persist collection {self.name}: {e}")

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, cond) for cond in v):
                    return False
            elif isinstance(v, dict):
                val = doc.get(k)
                for op, op_val in v.items():
                    if op == "$in" and val not in op_val:
                        return False
                    elif op == "$ne" and val == op_val:
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None) -> List[Dict[str, Any]]:
        with self._lock:
            q = query or {}
            results = [sanitize_doc(d) for d in self._data if self._matches(d, q)]
            if sort:
                for key, direction in reversed(sort):
                    results.sort(key=lambda x: str(x.get(key, "")), reverse=(direction < 0))
            return results

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            for d in self._data:
                if self._matches(d, query):
                    return sanitize_doc(d)
            return None

    def insert_one(self, doc: Dict[str, Any]):
        with self._lock:
            doc_copy = dict(doc)
            self._data.append(doc_copy)
            self._save()
            class InsertResult:
                inserted_id = doc_copy.get("_id", doc_copy.get("id"))
            return InsertResult()

    def insert_many(self, docs: List[Dict[str, Any]]):
        with self._lock:
            for doc in docs:
                self._data.append(dict(doc))
            self._save()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        with self._lock:
            for doc in self._data:
                if self._matches(doc, query):
                    if "$set" in update:
                        doc.update(update["$set"])
                    else:
                        doc.update(update)
                    self._save()
                    class UpdateResult:
                        modified_count = 1
                    return UpdateResult()
            class UpdateResultZero:
                modified_count = 0
            return UpdateResultZero()

    def delete_one(self, query: Dict[str, Any]):
        with self._lock:
            for i, doc in enumerate(self._data):
                if self._matches(doc, query):
                    self._data.pop(i)
                    self._save()
                    class DeleteResult:
                        deleted_count = 1
                    return DeleteResult()
            class DeleteResultZero:
                deleted_count = 0
            return DeleteResultZero()

    def delete_many(self, query: Dict[str, Any]):
        with self._lock:
            orig = len(self._data)
            self._data = [d for d in self._data if not self._matches(d, query)]
            self._save()
            class DeleteManyResult:
                deleted_count = orig - len(self._data)
            return DeleteManyResult()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))

    def create_index(self, keys, **kwargs):
        return "mock_idx"


class MongoCollectionWrapper:
    """Wraps PyMongo collection to automatically sanitize documents (handling ObjectId)."""
    def __init__(self, raw_col):
        self._col = raw_col

    def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None) -> List[Dict[str, Any]]:
        q = query or {}
        cursor = self._col.find(q)
        if sort:
            cursor = cursor.sort(sort)
        return [sanitize_doc(d) for d in cursor]

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc = self._col.find_one(query)
        return sanitize_doc(doc)

    def insert_one(self, doc: Dict[str, Any]):
        res = self._col.insert_one(doc)
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return res

    def insert_many(self, docs: List[Dict[str, Any]]):
        res = self._col.insert_many(docs)
        for doc in docs:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        return res

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        return self._col.update_one(query, update)

    def delete_one(self, query: Dict[str, Any]):
        return self._col.delete_one(query)

    def delete_many(self, query: Dict[str, Any]):
        return self._col.delete_many(query)

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return self._col.count_documents(query or {})


    def create_index(self, keys, **kwargs):
        try:
            return self._col.create_index(keys, **kwargs)
        except Exception as e:
            logger.warning(f"Index creation warning on {self._col.name}: {e}")
            return None


class MockDatabase:
    """Mock PyMongo database wrapper backed by local JSON files."""
    def __init__(self, db_dir: Path):
        self.db_dir = db_dir
        self._collections: Dict[str, MockCollection] = {}

    def get_collection(self, name: str) -> MockCollection:
        if name not in self._collections:
            self._collections[name] = MockCollection(name, self.db_dir)
        return self._collections[name]

    def __getitem__(self, name: str) -> MockCollection:
        return self.get_collection(name)


class DatabaseManager:
    """Manages active MongoDB or resilient fallback database connection."""
    def __init__(self):
        self.is_real_mongo = False
        self.client = None
        self.db = None
        self.db_dir = BASE_DIR / "storage" / "db"
        self.db_dir.mkdir(parents=True, exist_ok=True)

    def connect(self):
        if settings.MONGODB_URI:
            try:
                if MongoClient:
                    client = MongoClient(
                        settings.MONGODB_URI,
                        serverSelectionTimeoutMS=5000,
                        connectTimeoutMS=5000
                    )
                    # Verify connection
                    client.admin.command('ping')
                    self.client = client
                    self.db = client[settings.MONGODB_DATABASE]
                    self.is_real_mongo = True
                    logger.info("Successfully connected to live MongoDB!")
                    return
            except Exception as e:
                logger.warning(f"Could not connect to live MongoDB: {e}")

        logger.info("Operating in Resilient Embedded Storage mode (persisting to storage/db/*.json)")
        self.is_real_mongo = False
        self.client = None
        self.db = MockDatabase(self.db_dir)

    def get_collection(self, name: str):
        if self.db is None:
            self.connect()
        if self.is_real_mongo:
            return MongoCollectionWrapper(self.db[name])
        return self.db.get_collection(name)

    def get_status(self) -> Dict[str, Any]:
        masked_uri = "mongodb://***" if self.is_real_mongo else "local_embedded"
        return {
            "mode": "mongodb_atlas" if (self.is_real_mongo and "+srv" in settings.MONGODB_URI) else ("mongodb_live" if self.is_real_mongo else "embedded_persistent_store"),
            "connected": True,
            "database": settings.MONGODB_DATABASE,
            "target": masked_uri
        }

db_manager = DatabaseManager()
