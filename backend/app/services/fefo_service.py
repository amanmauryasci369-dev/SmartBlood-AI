from datetime import date, datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.inventory import BloodInventory
from app.models.facility import BloodBank
from app.models.shelf_life import ComponentShelfLifeRule
from app.models.system_config import SystemConfiguration


class FEFOService:
    """
    First-Expire-First-Out (FEFO) Decision Support Engine.
    Prioritizes compatible blood inventory by earliest expiry date rather than simple FIFO.
    """

    @staticmethod
    def get_thresholds(db: Session) -> Dict[str, int]:
        """Fetch dynamic expiry thresholds configured by administrators."""
        warning_cfg = db.query(SystemConfiguration).filter(SystemConfiguration.key == "EXPIRY_WARNING_DAYS").first()
        critical_cfg = db.query(SystemConfiguration).filter(SystemConfiguration.key == "EXPIRY_CRITICAL_DAYS").first()

        warning_days = int(warning_cfg.value) if warning_cfg and warning_cfg.value.isdigit() else 7
        critical_days = int(critical_cfg.value) if critical_cfg and critical_cfg.value.isdigit() else 3

        return {
            "warning_days": warning_days,
            "critical_days": critical_days
        }

    @classmethod
    def calculate_expiry_status(cls, expiry_date: date, ref_date: Optional[date] = None, warning_days: int = 7, critical_days: int = 3) -> Dict[str, Any]:
        """
        Calculates exact days to expiry and assigns clinical risk tier:
        - EXPIRED: days_to_expiry < 0
        - HIGH_EXPIRY_RISK: 0 <= days_to_expiry <= critical_days
        - APPROACHING_EXPIRY: critical_days < days_to_expiry <= warning_days
        - SAFE: days_to_expiry > warning_days
        """
        if ref_date is None:
            ref_date = date.today()

        days_remaining = (expiry_date - ref_date).days

        if days_remaining < 0:
            status = "EXPIRED"
            recommended_action = "DISCARD_AND_AUDIT"
        elif days_remaining <= critical_days:
            status = "HIGH_EXPIRY_RISK"
            recommended_action = "PRIORITIZE_IMMEDIATE_USE"
        elif days_remaining <= warning_days:
            status = "APPROACHING_EXPIRY"
            recommended_action = "CONSIDER_AUTHORIZED_REDISTRIBUTION"
        else:
            status = "SAFE"
            recommended_action = "MONITOR_NORMAL_ISSUANCE"

        return {
            "days_to_expiry": days_remaining,
            "status": status,
            "recommended_action": recommended_action
        }

    @classmethod
    def get_fefo_prioritized_inventory(
        cls,
        db: Session,
        blood_bank_id: Optional[int] = None,
        blood_group: Optional[str] = None,
        component: Optional[str] = None,
        include_expired: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Queries inventory and returns strictly FEFO ordered priority queue.
        Prioritizes earliest expiry date first (A -> B -> C).
        """
        thresholds = cls.get_thresholds(db)
        today = date.today()

        query = db.query(BloodInventory, BloodBank).join(
            BloodBank, BloodInventory.facility_id == BloodBank.id
        ).filter(
            BloodInventory.is_quarantined == False
        )

        if not include_expired:
            query = query.filter(BloodInventory.units_available > 0)

        if blood_bank_id:
            query = query.filter(BloodInventory.facility_id == blood_bank_id)
        if blood_group:
            query = query.filter(BloodInventory.blood_group == blood_group)
        if component:
            query = query.filter(BloodInventory.component == component)

        # FEFO Ordering: Earliest expiry date first
        items = query.order_by(
            BloodInventory.expiry_date.asc(),
            BloodInventory.collected_date.asc(),
            BloodInventory.id.asc()
        ).all()

        results = []
        priority_counter = 1

        for inv, bank in items:
            expiry_info = cls.calculate_expiry_status(
                inv.expiry_date,
                ref_date=today,
                warning_days=thresholds["warning_days"],
                critical_days=thresholds["critical_days"]
            )

            if not include_expired and expiry_info["status"] == "EXPIRED":
                continue

            days = expiry_info["days_to_expiry"]
            if days < 0:
                reason = f"Unit expired {abs(days)} day(s) ago. Quarantined for authorized disposal."
            elif days <= thresholds["critical_days"]:
                reason = f"Priority {priority_counter}: Expires in {days} day(s). Urgent issue recommended under FEFO."
            elif days <= thresholds["warning_days"]:
                reason = f"Priority {priority_counter}: Expires in {days} day(s). Prioritize for planned procedures or inter-facility transfer."
            else:
                reason = f"Priority {priority_counter}: Fresh unit with {days} days remaining shelf life."

            results.append({
                "id": inv.id,
                "blood_bank_id": bank.id,
                "blood_bank": bank.name,
                "blood_group": inv.blood_group.value if hasattr(inv.blood_group, "value") else str(inv.blood_group),
                "component": inv.component.value if hasattr(inv.component, "value") else str(inv.component),
                "batch_number": inv.batch_number,
                "available_units": inv.units_available,
                "reserved_units": inv.reserved_units or 0,
                "issued_units": inv.issued_units or 0,
                "expired_units": inv.expired_units or 0,
                "collection_date": inv.collected_date.isoformat() if inv.collected_date else None,
                "processing_date": inv.processing_date.isoformat() if inv.processing_date else None,
                "expiry_date": inv.expiry_date.isoformat(),
                "days_to_expiry": days,
                "status": expiry_info["status"],
                "priority": priority_counter,
                "reason": reason,
                "recommended_action": expiry_info["recommended_action"],
                "last_updated": inv.updated_at.isoformat() if inv.updated_at else None
            })
            priority_counter += 1

        return results

    @classmethod
    def get_expiry_risk_summary(
        cls,
        db: Session,
        blood_bank_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Aggregates facility-wide inventory by expiry risk tiers for decision support.
        """
        all_items = cls.get_fefo_prioritized_inventory(
            db,
            blood_bank_id=blood_bank_id,
            include_expired=True
        )

        total_units = 0
        expiring_soon_units = 0
        high_risk_units = 0
        expired_units = 0

        by_group: Dict[str, Dict[str, int]] = {}
        by_component: Dict[str, Dict[str, int]] = {}
        by_bank: Dict[str, Dict[str, int]] = {}
        days_distribution: Dict[str, int] = {
            "0-3 Days (Critical)": 0,
            "4-7 Days (Warning)": 0,
            "8-14 Days (Moderate)": 0,
            "15-30 Days (Stable)": 0,
            "> 30 Days (Optimal)": 0,
            "Expired": 0
        }

        for item in all_items:
            units = item["available_units"]
            status = item["status"]
            days = item["days_to_expiry"]
            group = item["blood_group"]
            comp = item["component"]
            bank = item["blood_bank"]

            total_units += units

            if status == "EXPIRED":
                expired_units += units
                days_distribution["Expired"] += units
            elif status == "HIGH_EXPIRY_RISK":
                high_risk_units += units
                days_distribution["0-3 Days (Critical)"] += units
            elif status == "APPROACHING_EXPIRY":
                expiring_soon_units += units
                days_distribution["4-7 Days (Warning)"] += units
            else:
                if days <= 14:
                    days_distribution["8-14 Days (Moderate)"] += units
                elif days <= 30:
                    days_distribution["15-30 Days (Stable)"] += units
                else:
                    days_distribution["> 30 Days (Optimal)"] += units

            # Aggregations by Blood Group
            if group not in by_group:
                by_group[group] = {"SAFE": 0, "APPROACHING": 0, "HIGH": 0, "EXPIRED": 0, "total": 0}
            by_group[group]["total"] += units
            if status == "EXPIRED":
                by_group[group]["EXPIRED"] += units
            elif status == "HIGH_EXPIRY_RISK":
                by_group[group]["HIGH"] += units
            elif status == "APPROACHING_EXPIRY":
                by_group[group]["APPROACHING"] += units
            else:
                by_group[group]["SAFE"] += units

            # Aggregations by Component
            if comp not in by_component:
                by_component[comp] = {"SAFE": 0, "APPROACHING": 0, "HIGH": 0, "EXPIRED": 0, "total": 0}
            by_component[comp]["total"] += units
            if status == "EXPIRED":
                by_component[comp]["EXPIRED"] += units
            elif status == "HIGH_EXPIRY_RISK":
                by_component[comp]["HIGH"] += units
            elif status == "APPROACHING_EXPIRY":
                by_component[comp]["APPROACHING"] += units
            else:
                by_component[comp]["SAFE"] += units

            # Aggregations by Bank
            if bank not in by_bank:
                by_bank[bank] = {"SAFE": 0, "APPROACHING": 0, "HIGH": 0, "EXPIRED": 0, "total": 0}
            by_bank[bank]["total"] += units
            if status == "EXPIRED":
                by_bank[bank]["EXPIRED"] += units
            elif status == "HIGH_EXPIRY_RISK":
                by_bank[bank]["HIGH"] += units
            elif status == "APPROACHING_EXPIRY":
                by_bank[bank]["APPROACHING"] += units
            else:
                by_bank[bank]["SAFE"] += units

        return {
            "summary": {
                "total_inventory": total_units,
                "expiring_soon_units": expiring_soon_units,
                "high_risk_units": high_risk_units,
                "expired_units": expired_units
            },
            "by_blood_group": by_group,
            "by_component": by_component,
            "by_blood_bank": by_bank,
            "days_distribution": days_distribution,
            "items": all_items
        }
