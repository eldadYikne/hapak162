import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { Item } from "../types/table";
import { db } from "../main";

export const getItemById = async (boardId: string, itemId: string) => {
  console.log("itemId", itemId);

  try {
    const itemRef = doc(db, `boards/${boardId}/items`, itemId);

    // Get the document
    const itemDoc = await getDoc(itemRef);

    if (itemDoc.exists()) {
      console.log("Soldier found:", {
        ...itemDoc.data(),
        id: itemDoc.id,
      });

      // Return the item data, including Firestore ID
      return { ...itemDoc.data(), id: itemDoc.id } as Item;
    }
  } catch (error) {
    console.error("Error fetching item:", error);
  }
};
export const createItem = async (boardId: string, item: Item) => {
  try {
    // Reference to the items subcollection inside the board document
    const itemsRef = collection(db, `boards/${boardId}/items`);

    // Add the item to the collection
    const docRef = await addDoc(itemsRef, item);

    console.log("Item successfully created with ID:");
    return docRef.id; // Return the ID of the created item
  } catch (error) {
    console.error("Error creating item:", error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};
export const updateItem = async (
  boardId: string,
  itemId: string, // Custom ID in your documents
  updates: Partial<Item>
) => {
  try {
    const itemRef = doc(db, `boards/${boardId}/items`, itemId);

    await updateDoc(itemRef, updates);

    console.log("Item successfully updated");
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};
export const removeItem = async (boardId: string, itemId: string) => {
  try {
    // Reference to the specific item document
    const itemRef = doc(db, `boards/${boardId}/items`, itemId);

    // Delete the document
    await deleteDoc(itemRef);

    console.log("Item successfully deleted");
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};

export const updateItemsBatch = async (
  boardId: string,
  items: Partial<Item>[]
) => {
  try {
    // Initialize a batch
    const batch = writeBatch(db);

    // Iterate over the items and add each update to the batch
    items.forEach((item) => {
      if (!item.id) {
        throw new Error("Each item must have an 'id' field");
      }

      const { id, ...updates } = item; // Extract the id and updates
      const itemRef = doc(db, `boards/${boardId}/items`, id); // Reference the document
      batch.update(itemRef, updates); // Add the update operation to the batch
    });

    // Commit the batch
    await batch.commit();

    console.log("All items successfully updated in a single batch");
  } catch (error) {
    console.error("Error updating items in batch:", error);
    throw error; // Re-throw to handle at a higher level if needed
  }
};
export const createOrUpdateSubcollectionItems = async (
  boardId: string,
  items: any[] // Replace with the appropriate type or interface for your items
) => {
  try {
    // Reference to the "items" subcollection inside the specified board document
    const itemsRef = collection(db, `boards/${boardId}/items`);

    // Process each item
    const promises = items.map(async (item) => {
      // Query for an existing document with the same `id` field
      const q = query(itemsRef, where("profileImage", "==", item.profileImage));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If a document with the same `id` exists, update it
        const docId = querySnapshot.docs[0].id; // Get the Firebase document ID
        const docRef = doc(db, `boards/${boardId}/items`, docId);
        await updateDoc(docRef, item);
        console.log(`Item updated: ${item.id}`);
        return docId; // Return the document ID
      } else {
        // If no matching document exists, create a new one
        const docRef = await addDoc(itemsRef, item);
        console.log(`Item created: ${item.id}`);
        return docRef.id; // Return the new document ID
      }
    });

    // Wait for all operations to complete
    const results = await Promise.all(promises);

    console.log("Operation completed for items:", results);
    return results; // Return the array of document IDs
  } catch (error) {
    console.error("Error creating or updating items in subcollection:", error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};
