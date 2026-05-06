from __future__ import annotations

import asyncio
import json
from typing import Any, Dict

import structlog

logger = structlog.get_logger()


class SSEService:
    def __init__(self):
        self._connections: Dict[str, asyncio.Queue] = {}

    async def connect(self, admin_id: str, store_id: str) -> asyncio.Queue:
        connection_id = f"{admin_id}:{store_id}"
        queue: asyncio.Queue = asyncio.Queue()
        self._connections[connection_id] = queue
        return queue

    async def disconnect(self, admin_id: str, store_id: str) -> None:
        connection_id = f"{admin_id}:{store_id}"
        self._connections.pop(connection_id, None)

    async def broadcast_event(
        self, store_id: str, event_type: str, data: Dict[str, Any]
    ) -> None:
        message = json.dumps(data, default=str)
        disconnected = []

        for conn_id, queue in self._connections.items():
            if str(store_id) in conn_id:
                try:
                    await queue.put({"event": event_type, "data": message})
                except Exception:
                    disconnected.append(conn_id)

        for conn_id in disconnected:
            self._connections.pop(conn_id, None)


sse_service = SSEService()
