from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime


class AbstractBloodRegistryAdapter(ABC):
    """
    Abstract interface for external blood bank registries.
    Enables pluggable integration of authorized national or state registries
    while strictly decoupling data ingestion from domain logic.
    """

    @abstractmethod
    def get_adapter_metadata(self) -> Dict[str, Any]:
        """Return adapter name, version, connection status, and regulatory disclosure."""
        pass

    @abstractmethod
    def fetch_facility_stock(self, facility_identifier: str) -> List[Dict[str, Any]]:
        """Fetch blood unit inventory for a specific facility identifier."""
        pass

    @abstractmethod
    def search_regional_stock(
        self,
        state: str,
        district: Optional[str] = None,
        blood_group: Optional[str] = None,
        component_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search regional blood availability."""
        pass

    @abstractmethod
    def submit_stock_dispatch(
        self,
        facility_identifier: str,
        batch_number: str,
        units: int,
        recipient_facility_id: str
    ) -> Dict[str, Any]:
        """Submit a unit dispatch or reserve request through the adapter gateway."""
        pass
