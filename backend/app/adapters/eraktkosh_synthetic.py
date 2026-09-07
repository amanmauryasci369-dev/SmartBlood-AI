from datetime import datetime, date, timedelta, timezone
from typing import Any, Dict, List, Optional
import random

from app.adapters.base import AbstractBloodRegistryAdapter
from app.core.config import AvailabilityStatus, BloodGroup, ComponentType


class ERaktKoshSyntheticAdapter(AbstractBloodRegistryAdapter):
    """
    Synthetic e-RaktKosh Compatible Registry Adapter.
    
    COMPLIANCE NOTICE (Rules 4, 5, 11):
    This adapter produces high-fidelity, standardized data structures matching
    the national e-RaktKosh portal format for testing and evaluation purposes.
    It does NOT access or claim access to unauthorized or undocumented live APIs.
    Data is explicitly labeled as 'SYNTHETIC_ERAKTKOSH_COMPATIBLE_FEED' and
    is NEVER described as real-time.
    """

    ADAPTER_NAME = "e-RaktKosh Synthetic Sandbox Adapter"
    ADAPTER_VERSION = "2.1-sih-compatible"
    DATA_SOURCE_TAG = "SYNTHETIC_ERAKTKOSH_COMPATIBLE_FEED"

    def __init__(self, seed: Optional[int] = 42):
        self.seed = seed
        if seed is not None:
            random.seed(seed)
        self._initialize_synthetic_registry()

    def _initialize_synthetic_registry(self):
        """Pre-populate a realistic regional blood bank network for demonstration."""
        self.facilities = [
            {
                "facility_identifier": "ERAK-DL-001",
                "name": "Delhi State Red Cross Blood Center",
                "category": "Charitable / Red Cross",
                "state": "Delhi",
                "district": "Central Delhi",
                "latitude": 28.6250,
                "longitude": 77.2183,
                "contact_number": "+91 11 23716441",
                "storage_capacity": 1200,
                "cold_chain_verified": True
            },
            {
                "facility_identifier": "ERAK-DL-002",
                "name": "AIIMS Transfusion Medicine Center",
                "category": "Government / Apex Medical",
                "state": "Delhi",
                "district": "South Delhi",
                "latitude": 28.5672,
                "longitude": 77.2100,
                "contact_number": "+91 11 26588500",
                "storage_capacity": 2500,
                "cold_chain_verified": True
            },
            {
                "facility_identifier": "ERAK-DL-003",
                "name": "Safdarjung Hospital Regional Blood Center",
                "category": "Government",
                "state": "Delhi",
                "district": "South Delhi",
                "latitude": 28.5701,
                "longitude": 77.2078,
                "contact_number": "+91 11 26165060",
                "storage_capacity": 1500,
                "cold_chain_verified": True
            },
            {
                "facility_identifier": "ERAK-DL-004",
                "name": "Lok Nayak Hospital Blood Bank",
                "category": "Government",
                "state": "Delhi",
                "district": "Central Delhi",
                "latitude": 28.6369,
                "longitude": 77.2410,
                "contact_number": "+91 11 23236000",
                "storage_capacity": 900,
                "cold_chain_verified": True
            },
            {
                "facility_identifier": "ERAK-UP-001",
                "name": "Noida District Combined Hospital Blood Bank",
                "category": "Government",
                "state": "Uttar Pradesh",
                "district": "Gautam Buddha Nagar",
                "latitude": 28.5708,
                "longitude": 77.3489,
                "contact_number": "+91 120 2456789",
                "storage_capacity": 800,
                "cold_chain_verified": True
            }
        ]

    def get_adapter_metadata(self) -> Dict[str, Any]:
        return {
            "adapter_name": self.ADAPTER_NAME,
            "version": self.ADAPTER_VERSION,
            "data_source": self.DATA_SOURCE_TAG,
            "is_synthetic": True,
            "real_time_feed": False,
            "compliance_disclaimer": (
                "Synthetic compatible data generated for SIH problem statement 26202. "
                "No unauthorized access to government APIs is used."
            ),
            "registered_facilities": len(self.facilities),
            "supported_components": [c.value for c in ComponentType],
            "supported_groups": [g.value for g in BloodGroup]
        }

    def fetch_facility_stock(self, facility_identifier: str) -> List[Dict[str, Any]]:
        facility = next((f for f in self.facilities if f["facility_identifier"] == facility_identifier), None)
        if not facility:
            return []

        stock_records = []
        today = date.today()

        # Generate realistic component inventory
        for group in BloodGroup:
            for component in ComponentType:
                # Component shelf life considerations:
                # Platelets: 5 days
                # PRBC: 35-42 days
                # FFP: 365 days (frozen)
                # Whole Blood: 35 days
                # Cryoprecipitate: 365 days
                if component == ComponentType.PLATELETS:
                    shelf_days = 5
                    base_units = random.randint(2, 14)
                elif component == ComponentType.PRBC:
                    shelf_days = 35
                    base_units = random.randint(8, 45)
                elif component == ComponentType.FFP:
                    shelf_days = 365
                    base_units = random.randint(15, 60)
                else:
                    shelf_days = 35
                    base_units = random.randint(5, 30)

                # Rare blood types have lower availability
                if group in [BloodGroup.AB_NEG, BloodGroup.B_NEG, BloodGroup.O_NEG]:
                    base_units = max(0, int(base_units * 0.3))

                collected_offset = random.randint(1, min(shelf_days - 1, 30))
                collected = today - timedelta(days=collected_offset)
                expires = collected + timedelta(days=shelf_days)

                batch_num = f"SYN-{facility_identifier}-{group.name[:2]}-{random.randint(1000, 9999)}"

                stock_records.append({
                    "facility_identifier": facility_identifier,
                    "facility_name": facility["name"],
                    "state": facility["state"],
                    "district": facility["district"],
                    "blood_group": group.value,
                    "component": component.value,
                    "units_available": base_units,
                    "batch_number": batch_num,
                    "collected_date": collected.isoformat(),
                    "expiry_date": expires.isoformat(),
                    "status": AvailabilityStatus.REPORTED.value,  # Explicitly REPORTED, not confirmed
                    "data_source": self.DATA_SOURCE_TAG,
                    "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
                    "temperature_storage_celsius": -20.0 if component in [ComponentType.FFP, ComponentType.CRYOPRECIPITATE] else (22.0 if component == ComponentType.PLATELETS else 4.0)
                })

        return stock_records

    def search_regional_stock(
        self,
        state: str,
        district: Optional[str] = None,
        blood_group: Optional[str] = None,
        component_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = []
        matching_facilities = [
            f for f in self.facilities
            if f["state"].lower() == state.lower() and (district is None or f["district"].lower() == district.lower())
        ]
        for f in matching_facilities:
            stock = self.fetch_facility_stock(f["facility_identifier"])
            for item in stock:
                if blood_group and item["blood_group"] != blood_group:
                    continue
                if component_type and item["component"] != component_type:
                    continue
                results.append(item)
        return results

    def submit_stock_dispatch(
        self,
        facility_identifier: str,
        batch_number: str,
        units: int,
        recipient_facility_id: str
    ) -> Dict[str, Any]:
        return {
            "status": "ACCEPTED_BY_ADAPTER",
            "dispatch_token": f"DISP-{random.randint(100000, 999999)}",
            "facility_identifier": facility_identifier,
            "batch_number": batch_number,
            "allocated_units": units,
            "recipient_facility_id": recipient_facility_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "note": "Synthetic dispatch simulation completed successfully."
        }
