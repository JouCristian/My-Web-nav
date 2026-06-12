from __future__ import annotations

import threading
import uuid
from collections import deque
from typing import Deque, Optional

from app.schemas import JobRecord


class JobStore:
    def __init__(self) -> None:
        self._jobs: dict[str, JobRecord] = {}
        self._queue: Deque[str] = deque()
        self._lock = threading.Lock()

    def create(self, job: JobRecord) -> JobRecord:
        with self._lock:
            self._jobs[job.job_id] = job
            self._queue.append(job.job_id)
        return job

    def create_id(self) -> str:
        return uuid.uuid4().hex

    def get(self, job_id: str) -> Optional[JobRecord]:
        with self._lock:
            return self._jobs.get(job_id)

    def pop_next(self) -> Optional[JobRecord]:
        with self._lock:
            if not self._queue:
                return None
            job_id = self._queue.popleft()
            return self._jobs.get(job_id)

    def update(self, job_id: str, **updates: object) -> Optional[JobRecord]:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            next_job = job.model_copy(update=updates)
            self._jobs[job_id] = next_job
            return next_job


job_store = JobStore()
