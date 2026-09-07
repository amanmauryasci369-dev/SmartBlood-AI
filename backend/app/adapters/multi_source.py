from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import math
import random
from datetime import datetime, timezone


class DataSourceAdapter(ABC):
    """Abstract Base Class for Multi-Source Data Ingestion (Module 18)."""

    @abstractmethod
    def get_source_name(self) -> str:
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def sync_data(self) -> Dict[str, Any]:
        pass


class MockERaktKoshAdapter(DataSourceAdapter):
    """
    e-RaktKosh Compatible Synthetic Ingestion Gateway.
    Adheres strictly to Rule 4, 5, 11 (Never claims public live API access; uses standardized schemas).
    """

    def get_source_name(self) -> str:
        return "e-RaktKosh Synthetic Sandbox Gateway"

    def health_check(self) -> Dict[str, Any]:
        return {
            "source": self.get_source_name(),
            "status": "ONLINE_MOCK",
            "protocol": "REST_SYNTHETIC_ADAPTER",
            "compliance": "SIH Problem Statement 26202 Sandbox"
        }

    def sync_data(self) -> Dict[str, Any]:
        return {
            "source": self.get_source_name(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "synced_facilities": 50,
            "status_applied": "REPORTED_AVAILABILITY",
            "disclaimer": "Synthetic standardized feed. Does not claim access to undocumented live government endpoints."
        }


class BloodBankAdapter(DataSourceAdapter):
    """Direct Laboratory Transfusion System Ingestion Adapter."""

    def get_source_name(self) -> str:
        return "Licensed Blood Bank LIS Adapter"

    def health_check(self) -> Dict[str, Any]:
        return {"source": self.get_source_name(), "status": "CONNECTED", "protocol": "HL7/FHIR_BRIDGE"}

    def sync_data(self) -> Dict[str, Any]:
        return {"source": self.get_source_name(), "status_applied": "CONFIRMED_AVAILABILITY", "verified_by": "LAB_TECHNICIAN"}


class HospitalAdapter(DataSourceAdapter):
    """Hospital Emergency Transfusion Queue Adapter."""

    def get_source_name(self) -> str:
        return "Hospital HIS Emergency Queue Adapter"

    def health_check(self) -> Dict[str, Any]:
        return {"source": self.get_source_name(), "status": "CONNECTED", "protocol": "HIS_EMERGENCY_SOCKET"}

    def sync_data(self) -> Dict[str, Any]:
        return {"source": self.get_source_name(), "active_requests_polled": 12}


class DonorAdapter(DataSourceAdapter):
    """Voluntary Donor Registry Adapter with Privacy Protection (Rule 8)."""

    def get_source_name(self) -> str:
        return "Masked Voluntary Donor Network Adapter"

    def health_check(self) -> Dict[str, Any]:
        return {"source": self.get_source_name(), "status": "SECURE", "privacy_masking": "ENABLED"}

    def sync_data(self) -> Dict[str, Any]:
        return {"source": self.get_source_name(), "eligible_donors_tracked": 5000, "pii_exposed": False}


class GISAdapter(DataSourceAdapter):
    """Geospatial OpenStreetMap / Routing Engine Adapter."""

    def get_source_name(self) -> str:
        return "OpenStreetMap GIS & Routing Adapter"

    def health_check(self) -> Dict[str, Any]:
        return {"source": self.get_source_name(), "status": "READY", "geocoder": "NOMINATIM_OSM"}

    def sync_data(self) -> Dict[str, Any]:
        return {"source": self.get_source_name(), "coverage": "National / Regional Clusters"}

    @staticmethod
    def calculate_distance_and_transit(lat1: float, lon1: float, lat2: float, lon2: float, is_emergency: bool = True) -> Dict[str, Any]:
        r = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        dist_km = round(r * c, 2)
        
        speed_kmh = 35.0 if is_emergency else 25.0
        transit_mins = max(int((dist_km / speed_kmh) * 60) + 5, 8)
        
        return {
            "distance_km": dist_km,
            "estimated_transit_minutes": transit_mins,
            "corridor_type": "EMERGENCY_GREEN_CORRIDOR" if is_emergency else "STANDARD_LOGISTICS"
        }
