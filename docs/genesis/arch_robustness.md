# volatile.sh - Reliability-First Architecture

## The GEMINI Manifesto: Reliability is Everything

> "A secret sharing platform that loses secrets or exposes them twice is worse than useless - it is a betrayal of trust."

This document defines the architecture for volatile.sh with a singular obsession: **reliability**.

---

## 1. Technology Stack - Justified for Reliability

| Component   | Choice                   | Reliability Justification                           |
| ----------- | ------------------------ | --------------------------------------------------- |
| **Compute** | Cloudflare Workers       | 99.99% SLA, 300+ edge locations, automatic failover |
| **State**   | Durable Objects          | Single-writer guarantee, atomic transactions        |
| **Storage** | DO Transactional Storage | ACID guarantees, encrypted at rest                  |
| **CDN**     | Cloudflare CDN           | Built-in DDoS protection, Anycast routing           |
| **DNS**     | Cloudflare DNS           | 100% uptime SLA                                     |

---

## 2. Failure Mode Analysis

### Failure Taxonomy

```
CATEGORY A: Infrastructure Failures
  A1. Cloudflare global outage (RARE)
  A2. Single edge location failure (handled automatically)
  A3. Durable Object migration (transparent)
  A4. Storage quota exceeded (preventable)

CATEGORY B: Application Failures
  B1. Secret already read (double-read attempt)
  B2. Secret expired before read
  B3. Invalid decryption key
  B4. Malformed request payload
  B5. Rate limit exceeded

CATEGORY C: Security Failures
  C1. Replay attack attempt
  C2. Brute force on secret ID
  C3. XSS injection
  C4. MITM on key transmission

CATEGORY D: Client Failures
  D1. Browser crypto API unavailable
  D2. JavaScript disabled
  D3. Network timeout
  D4. Clipboard API denied
```

---

## 3. Security Layers - Defense in Depth

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 7: Application Logic                                       │
│   - Input validation (zod schemas)                               │
│   - Business rule enforcement                                    │
│   - Atomic state transitions                                     │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 6: Rate Limiting & Abuse Prevention                        │
│   - IP-based rate limits (100 creates/hour, 1000 reads/hour)     │
│   - Payload size limits (10KB text, 10MB files)                  │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 5: Request Authentication                                  │
│   - CORS strict origin checking                                  │
│   - CSRF token for mutations                                     │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 4: Transport Security                                      │
│   - TLS 1.3 enforced                                             │
│   - HSTS with preload                                            │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 3: Content Security                                        │
│   - CSP: default-src 'self'                                      │
│   - X-Frame-Options: DENY                                        │
│   - Referrer-Policy: no-referrer                                 │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 2: Encryption                                              │
│   - AES-256-GCM client-side                                      │
│   - Key never transmitted to server                              │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 1: Infrastructure                                          │
│   - Cloudflare DDoS protection                                   │
│   - WAF rules                                                    │
│   - Bot management                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Atomic Read-and-Burn Pattern

```typescript
private async readAndBurn(): Promise<Response> {
  const result = await this.storage.transaction(async (txn) => {
    const secret = await txn.get('secret');

    if (!secret) {
      return { error: 'NOT_FOUND', status: 404 };
    }

    // Check expiry
    if (Date.now() > secret.createdAt + secret.ttl) {
      await txn.delete('secret');
      return { error: 'EXPIRED', status: 410 };
    }

    // Atomic delete
    await txn.delete('secret');
    await this.storage.deleteAlarm();

    return { success: true, data: { ciphertext, iv } };
  });

  return new Response(JSON.stringify(result.data), {
    headers: { 'Cache-Control': 'no-store' }
  });
}
```

---

## 5. Abuse Prevention (Zero-Knowledge Compatible)

```
LAYER 1: Rate Limiting
  - IP-based: 100 creates/hour, 1000 reads/hour
  - Global: 10,000 creates/minute

LAYER 2: Behavioral Analysis
  - Burst detection: >10 creates/min = CAPTCHA
  - Pattern detection

LAYER 3: Resource Limits
  - Max secret size: 10KB text, 10MB files
  - Max TTL: 7 days
  - Max views: 10

LAYER 4: Reputation System
  - IP reputation from Cloudflare
  - Threat score thresholds

LAYER 5: Abuse Reporting
  - Report button (post-hoc)
  - Delete by ID without seeing content
```

---

## 6. Monitoring and Alerting

| Metric        | Warning    | Critical   |
| ------------- | ---------- | ---------- |
| Error Rate    | > 1%       | > 5%       |
| P99 Latency   | > 500ms    | > 2000ms   |
| Create Rate   | > 5000/min | > 8000/min |
| 429 Responses | > 100/min  | > 500/min  |
| DO Storage    | > 80%      | > 95%      |

---

## 7. Recovery Procedures

### Scenario 1: Elevated Error Rates

```
1. Check Cloudflare Status
2. Check error distribution by endpoint
3. Exclude problematic regions if needed
4. Check DO storage limits
5. Rollback if recent deployment
```

### Scenario 2: Suspected Data Breach

```
1. Enable paranoid mode (10x rate limits)
2. Assess: content? IMPOSSIBLE (zero-knowledge)
3. Investigate access logs
4. Communicate if needed
5. Remediate and post-mortem
```

---

## 8. Trade-offs

| Feature                     | Reliability Gain     | Performance Cost   |
| --------------------------- | -------------------- | ------------------ |
| Synchronous DO transactions | Atomic guarantees    | +10-50ms           |
| No caching of secrets       | Prevents stale reads | Every read hits DO |
| Retry logic with backoff    | Handles transients   | Slower recovery    |
| Full request validation     | Rejects bad input    | +5ms/request       |

---

## Confidence Score: 9/10

**Why 9:**

- Cloudflare infrastructure is battle-tested
- Durable Objects provide exact guarantees needed
- Zero-knowledge architecture is cryptographically sound
- Defense-in-depth covers all attack vectors

**Remaining risks:**

1. Cloudflare dependency (vendor lock-in)
2. Browser crypto variations
3. Novel attack vectors
4. Cost at scale

**The system is designed to fail safe**: if anything goes wrong, secrets remain encrypted and inaccessible rather than exposed.

---

_"Reliability is not a feature. It is the foundation upon which trust is built."_
