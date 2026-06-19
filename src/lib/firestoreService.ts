import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { Order, SupportMessage } from "../types";

/**
 * Saves or updates a registered user profile in Firestore's private user container.
 */
export async function saveUserProfile(uid: string, name: string, email: string) {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      uid,
      name,
      email,
      createdAt: new Date() // Will convert cleanly to Firebase Timestamp
    }, { merge: true });
    console.log("User profile saved successfully in Firestore users collection.");
  } catch (error) {
    console.error("Error saving user profile in Firestore:", error);
  }
}

/**
 * Saves a new order or updates an existing order in Firestore.
 * Standardizes datetime fields using Firebase Timestamps on create/update where available.
 */
export async function saveOrderToFirestore(order: Order, uid?: string) {
  try {
    const orderId = order.id || `ord-${Date.now()}`;
    const orderData = {
      id: orderId,
      templateId: order.templateId,
      templateTitle: order.templateTitle,
      customerName: order.customerName,
      customerEmail: order.customerEmail.toLowerCase(),
      price: Number(order.price),
      status: order.status || "pending",
      licenseKey: order.licenseKey || `SU-KEY-${Math.floor(Math.random() * 900000 + 100000)}`,
      customRequirements: order.customRequirements || "",
      purchaseDate: order.purchaseDate || new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    // 1. Write to flat top-level collection (authenticated users can query this via email filter)
    const orderDocRef = doc(db, "orders", orderId);
    await setDoc(orderDocRef, orderData, { merge: true });

    // 2. Also write to nested /users/{userId}/orders/{orderId} if uid is available
    if (uid) {
      const nestedRef = doc(db, "users", uid, "orders", orderId);
      await setDoc(nestedRef, orderData, { merge: true });
    }
    console.log(`Order ${orderId} saved to Firestore.`);
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
  }
}

/**
 * Fetches all orders belonging to a registered email address from flat Firestore orders.
 */
export async function fetchOrdersFromFirestore(email: string): Promise<Order[]> {
  try {
    const ordersCol = collection(db, "orders");
    const q = query(ordersCol, where("customerEmail", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Convert Firestore Timestamp or String to formatted string safely
      let purchaseDateStr = "";
      if (data.purchaseDate) {
        if (data.purchaseDate instanceof Timestamp) {
          purchaseDateStr = data.purchaseDate.toDate().toISOString().replace("T", " ").substring(0, 16);
        } else if (data.purchaseDate.seconds) {
          purchaseDateStr = new Date(data.purchaseDate.seconds * 1000).toISOString().replace("T", " ").substring(0, 16);
        } else {
          purchaseDateStr = String(data.purchaseDate);
        }
      } else {
        purchaseDateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
      }

      orders.push({
        id: data.id,
        templateId: data.templateId,
        templateTitle: data.templateTitle,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        price: data.price,
        status: data.status,
        licenseKey: data.licenseKey,
        customRequirements: data.customRequirements || "",
        purchaseDate: purchaseDateStr
      });
    });
    
    return orders;
  } catch (error) {
    console.error("Error fetching orders from Firestore:", error);
    return [];
  }
}

/**
 * Adds a new support ticket message in Firestore.
 */
export async function saveSupportMessageToFirestore(msg: SupportMessage, uid?: string) {
  try {
    const msgId = msg.id || `msg-${Date.now()}`;
    const msgData = {
      id: msgId,
      customerEmail: msg.customerEmail.toLowerCase(),
      customerName: msg.customerName,
      message: msg.message,
      timestamp: new Date(),
      sender: msg.sender
    };

    // 1. Write to flat top-level supportMessages collection
    const msgDocRef = doc(db, "supportMessages", msgId);
    await setDoc(msgDocRef, msgData);

    // 2. Also write to nested /users/{userId}/supportMessages/{messageId} if uid is available
    if (uid) {
      const nestedRef = doc(db, "users", uid, "supportMessages", msgId);
      await setDoc(nestedRef, msgData);
    }
    console.log(`Support message ${msgId} saved to Firestore.`);
  } catch (error) {
    console.error("Error saving support message to Firestore:", error);
  }
}

/**
 * Fetches all support chat messages linked with the parsed client email address.
 */
export async function fetchSupportMessagesFromFirestore(email: string): Promise<SupportMessage[]> {
  try {
    const messagesCol = collection(db, "supportMessages");
    const q = query(messagesCol, where("customerEmail", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    const msgs: SupportMessage[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      let tsStr = "";
      if (data.timestamp) {
        if (data.timestamp instanceof Timestamp) {
          tsStr = data.timestamp.toDate().toISOString().replace("T", " ").substring(0, 16);
        } else if (data.timestamp.seconds) {
          tsStr = new Date(data.timestamp.seconds * 1000).toISOString().replace("T", " ").substring(0, 16);
        } else {
          tsStr = String(data.timestamp);
        }
      }

      msgs.push({
        id: data.id,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        message: data.message,
        timestamp: tsStr,
        sender: data.sender
      });
    });

    // Sort by timestamp or ID safely
    return msgs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  } catch (error) {
    console.error("Error fetching support messages from Firestore:", error);
    return [];
  }
}
