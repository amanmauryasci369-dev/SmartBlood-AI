# Unified Emergency Workflow & Intelligent Multi-Source Ranking

## 1. End-to-End Emergency Sequence
The complete clinical emergency sequence integrates 16 interconnected validation layers:

```
                      [Hospital Emergency Triage]
                                  │
                                  ▼
                     [Create Emergency Request]
                                  │
                                  ▼
                      [Check Local Inventory]
                                  │
                                  ▼
                   [Check Regional Blood Banks]
                                  │
                                  ▼
                 [Check Hospital Peer Network (H2H)]
                                  │
                                  ▼
                     [Check Inventory Freshness]
                                  │
                                  ▼
                       [Check FEFO Expiry Risk]
                                  │
                                  ▼
                  [Evaluate Demand Forecast (7-day)]
                                  │
                                  ▼
                [Compute Shortage Balance Equation]
                                  │
                                  ▼
              [Scan Compatible Donors (Masked Pool)]
                                  │
                                  ▼
               [GIS Haversine Distance & Transit Mins]
                                  │
                                  ▼
                  [Intelligent Multi-Source Ranking]
                                  │
                                  ▼
                 [Synthesized AI Recommendation]
                                  │
                                  ▼
               [Authorized Cross-Match Verification]
                                  │
                                  ▼
               [Fulfillment & Green Transit Corridor]
                                  │
                                  ▼
                [Inventory Decrement & Audit Log]
                                  │
                                  ▼
                [Analytics & AI Executive Insight]
```

## 2. Multi-Criteria Source Ranking Formula
The source ranking engine (`IntelligentSourceRankingService`) scores candidate facilities:

$$\text{Source Score} = 0.40 \cdot \text{Distance Score} + 0.30 \cdot \text{Quantity Score} + \text{Confirmation Bonus} + \text{FEFO Bonus}$$

Where:
- $\text{Distance Score} = \max(0, 100 - (\text{dist\_km} \times 4))$
- $\text{Quantity Score} = \min\left(100, \frac{\text{available\_units}}{\text{units\_required}} \times 100\right)$
- $\text{Confirmation Bonus} = +20$ (if certified by lab technician)
- $\text{FEFO Bonus} = +15$ (if unit expires within 5 days, prioritizing usage over spoilage)

## 3. Ranked Output Example
```
Rank 1: Safdarjung Regional Blood Centre
        5 compatible units • 0.4 km • ~8 mins transit • CONFIRMED

Rank 2: Lok Nayak Apex Hospital
        3 compatible units • 6.2 km • ~16 mins transit • REPORTED
```
