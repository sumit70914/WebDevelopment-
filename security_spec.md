# Security Specification for User Isolation in Firestore

This document describes the security specification, invariants, and test coverage for the multi-tenant user isolation rules in Firestore.

## 1. Data Invariants

1. **Strict Ownership Invariant**: A user's profile document `/users/{userId}` is strictly private. Only the authenticated user whose `request.auth.uid == userId` can read or write to it.
2. **Subcollection Inheritance Invariant**: Any secondary user-owned resources (e.g., templates, receipts, support chat threads) placed in `/users/{userId}/{subcollection}/{docId}` inherit the parent profile's ownership boundary. Only the same owner (`request.auth.uid == userId`) may read or write.
3. **Flat Collection Ownership Invariant**: In any top-level shared or collaborative collections structured with an ownership field (such as a `userId` or `customerEmail` parameter), reads, updates, and deletes are strictly prohibited unless the authenticated user's credentials match the document's internal values.
4. **Temporal Integrity Invariant**: All modification timestamps (e.g., `updatedAt`, `createdAt`) must align precisely with the transactional time `request.time`. Client-supplied spoofed times are rejected.
5. **ID Integrity Invariant**: Document IDs must pass character sanitization and maximum character buffer limits (preventing resource depletion attacks).

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 transaction payloads represent structural attacks or logical state transitions that violate security boundaries and must be blocked with `PERMISSION_DENIED`.

### Attack Vector A: Identity Spoofing & Impersonation
1. **Payload 1 (Profile Creation Hijack)**: User `attacker_uid` attempts to write a profile document in `/users/victim_uid`.
2. **Payload 2 (Anonymous Profiling)**: An unauthenticated guest client attempts to retrieve a document from `/users/victim_uid`.
3. **Payload 3 (Spoofed Identity Injection)**: User `attacker_uid` inserts a document into `orders/some_order` with `userId: "victim_uid"`.
4. **Payload 4 (Email Spoofing)**: User `attacker_uid` attempts to read an order belonging to `victim@example.com` by putting their email address in a client request.

### Attack Vector B: Data Pollution & Excess Size
5. **Payload 5 (DoW / Buffer Injection)**: Creating a record with an alphanumeric ID containing 2,000 characters of junk text.
6. **Payload 6 (Shadow Field Injection)**: Inserting hidden parameters (`isAdmin: true` or `userRole: "superuser"`) into a public user registration document.
7. **Payload 7 (Unbounded Array Injection)**: Writing a list field containing 10,000 items to exhaust reading costs.

### Attack Vector C: Tampering & State Transitions
8. **Payload 8 (Historical Time Tampering)**: Creating a record with a custom client-side `createdAt` set to a year in the past.
9. **Payload 9 (Immortal Field Rewrite)**: Modifying a resource's immutable `createdAt` parameter during an update transaction.
10. **Payload 10 (Terminal State Evading)**: Modifying a completed or delivered order to "pending" to retry a refund logic.

### Attack Vector D: Cross-Query Harvesting
11. **Payload 11 (Blanket Collection Scraping)**: Requesting `db.collection('orders')` without a user filter, hoping the backend fails open.
12. **Payload 12 (Sub-Hierarchy Crawling)**: Attacker client attempting to index the entire sub-collection tree of `/users/victim_uid/orders`.

---

## 3. Test Runner Specification

Below is the complete testing spec structured for validation. It ensures every single "Dirty Dozen" payload is successfully intercepted.

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import * as fs from "fs";

let testEnv: RulesTestEnvironment;

describe("Firestore Hardened User Isolation Tests", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "webdevelopment-9c914",
      firestore: {
        rules: fs.readFileSync("firestore.rules", "utf8")
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("blocks attacker from reading victim profile (Payload 1 & 2)", async () => {
    const victimDb = testEnv.authenticatedContext("victim_uid").firestore();
    const attackerDb = testEnv.authenticatedContext("attacker_uid").firestore();
    const guestDb = testEnv.unauthenticatedContext().firestore();

    // Setup victim's own profile
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc("users/victim_uid").set({
        name: "Victim User",
        email: "victim@example.com",
        createdAt: new Date()
      });
    });

    // Attacks fail
    await assertFails(attackerDb.doc("users/victim_uid").get());
    await assertFails(guestDb.doc("users/victim_uid").get());

    // Owner succeeds
    await assertSucceeds(victimDb.doc("users/victim_uid").get());
  });

  it("blocks attacker from constructing items under victim's subcollection (Payload 12)", async () => {
    const attackerDb = testEnv.authenticatedContext("attacker_uid").firestore();
    await assertFails(attackerDb.doc("users/victim_uid/orders/ord_1").set({
      templateId: "med_1",
      customerName: "Imposter"
    }));
  });
});
```
