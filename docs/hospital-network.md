# Hospital-to-Hospital (H2H) Resource-Sharing Network

## 1. Concept & Problem Addressed
In acute mass-casualty or rare-phenotype emergencies (e.g., O- PRBC, Bombay blood group), regional blood banks may have limited stock while neighboring hospital blood storage centers hold unallocated reserve units.

The **SmartBlood AI Hospital Network** enables peer-to-peer inter-hospital requisitioning, clinical cross-match coordination, and custody-logged unit sharing.

## 2. Requisition Lifecycle & Finite State Machine
```
[PENDING]
   │
   ▼
[SEARCHING] (Broadcasting to peer nodes)
   │
   ▼
[MATCH_FOUND] (Peer hospital indicates available reserve)
   │
   ▼
[VERIFICATION_REQUIRED] (Peer accepts; units held in cross-match rack)
   │
   ├──────────────────────────────┐
   ▼                              ▼
[CONFIRMED]                  [REJECTED]
(Clinical cross-match verified) (Clinical reason logged)
   │
   ▼
[FULFILLED] (Delivered, custody receipt signed)
```

## 3. Availability Taxonomy
To prevent phantom reservations, the network strictly segregates:
- **`REPORTED_AVAILABILITY`**: Ingested uncertified electronic count.
- **`CONFIRMED_AVAILABILITY`**: Physical unit certified by laboratory technician in rack.
- **`RESERVED_AVAILABILITY`**: Unit locked for active emergency or pending verification.

## 4. Internal Coordination Center
- Route: `/hospital-communications`
- APIs:
  - `GET /api/hospital-communications/{id}`
  - `POST /api/hospital-communications/{id}/message`
- **Zero PII Exposure**: Only facility names, unit identifiers, transit tokens, and clinical notes are transmitted. Voluntary donor identities and patient names are never transmitted over the coordination channel.
