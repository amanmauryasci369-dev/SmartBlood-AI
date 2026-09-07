# First-Expire-First-Out (FEFO) Inventory Prioritization

## 1. Why FEFO Replaces FIFO
Legacy blood management portals typically use FIFO (First-In, First-Out), which issues blood according to collection order. However:
- Different batches of the same component may be ingested at different times with varying remaining viability.
- Transfer units received from external blood banks may have earlier expiry dates than locally collected newer units.
- Different preservation solutions (e.g., ACD vs CPDA-1 vs SAGM) give differing shelf-life spans.

**SmartBlood AI enforces strict FEFO (First-Expire-First-Out):**
Units approaching expiry are prioritized for immediate matching and issuance before fresher units ($A \to B \to C$).

## 2. Decision Logic
When an emergency or routine request is evaluated:
```
Compatible Unit A: Expiry in 2 days  --> Priority 1 (Urgent Issue)
Compatible Unit B: Expiry in 10 days --> Priority 2 (Intermediate)
Compatible Unit C: Expiry in 25 days --> Priority 3 (Optimal Reserve)
```

Priority Ordering Query:
```sql
ORDER BY 
    expiry_date ASC, 
    collected_date ASC, 
    id ASC;
```

## 3. FEFO Service Architecture
- **Implementation**: `app/services/fefo_service.py` (`FEFOService`)
- **API Endpoint**: `GET /api/inventory/fefo`
- **Output Schema**:
  ```json
  {
    "blood_bank": "Safdarjung Hospital Regional Blood Centre",
    "blood_group": "A+",
    "component": "PLATELET_CONCENTRATE",
    "batch_number": "PLT-APOS-2-201",
    "expiry_date": "2026-09-09",
    "days_to_expiry": 2,
    "priority": 1,
    "status": "HIGH_EXPIRY_RISK",
    "reason": "Priority 1: Expires in 2 day(s). Urgent issue recommended under FEFO.",
    "recommended_action": "PRIORITIZE_IMMEDIATE_USE"
  }
  ```

## 4. Clinical Safety
FEFO recommendations are non-coercive clinical decision support advisories. No automatic release occurs without lab physical cross-match certification.
