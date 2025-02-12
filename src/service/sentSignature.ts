import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { HistoryAction, HistoryItemAction } from "../types/history";
import { Admin, SentSinature } from "../types/table";
import { db } from "../main";
import { createHistory } from "./history";

export const createSentSignature = async (
  boardId: string,
  signature: SentSinature,
  admin?: Admin
) => {
  try {
    // Reference to the items subcollection inside the board document
    const itemsRef = collection(db, `boards/${boardId}/sentSignatures`);

    // Add the item to the collection
    await enforceMaxSentSignatures(boardId);
    const docRef = await addDoc(itemsRef, signature);
    console.log(" successfully created:", signature);
    let historyAction;
    if (admin) {
      historyAction = {
        id: "",
        admin: { id: admin.id, name: admin.name, email: admin.email },
        soldier: {
          id: signature.soldierId,
          name: signature.soldierName,
          soldierId: signature.soldierId,
        },
        items: [...signature.items] as HistoryItemAction[],
        date: String(new Date()),
        type: "create",
        collectionName: "sentSignatures",
      } as HistoryAction;
      console.log("historyAction", historyAction);
      if (historyAction) {
        await createHistory(boardId, historyAction);
      }
    }

    return docRef.id; // Return the ID of the created item
  } catch (error) {
    console.error("Error creating item:", error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};
export const getSignatureById = async (
  boardId: string,
  signatureId: string
) => {
  try {
    const signatureRef = doc(
      db,
      `boards/${boardId}/sentSignatures`,
      signatureId
    );

    // Get the document
    const signatureDoc = await getDoc(signatureRef);

    if (signatureDoc.exists()) {
      console.log("SentSinature found:", {
        ...signatureDoc.data(),
        id: signatureDoc.id,
      });

      return { ...signatureDoc.data(), id: signatureDoc.id } as SentSinature;
    }
  } catch (error) {
    console.error("Error fetching soldier:", error);
  }
};
export const updateSentSignature = async (
  boardId: string,
  signatureId: string,
  updatedSignature: Partial<SentSinature>,
  admin?: Admin
) => {
  try {
    // Reference to the specific document in the sentSignatures collection
    const signatureRef = doc(
      db,
      `boards/${boardId}/sentSignatures/${signatureId}`
    );

    // Update the document with the new data
    await updateDoc(signatureRef, updatedSignature);

    console.log("Successfully updated signature:", updatedSignature);

    let historyAction;
    historyAction = {
      id: "",
      admin: {
        id: admin?.id ?? "",
        name: admin?.name ?? "",
        email: admin?.email ?? "",
      },
      soldier: {
        id: updatedSignature.soldierId || "",
        name: updatedSignature.soldierName || "",
        soldierId: updatedSignature.soldierId || "",
        personalNumber: 0,
        profileImage: "",
      },
      items: updatedSignature.items || [],
      date: String(new Date()),
      type: "signature",
      collectionName: "sentSignatures",
    } as HistoryAction;
    console.log("historyAction", historyAction);

    if (historyAction) {
      //   await createHistory(boardId, historyAction);
    }
  } catch (error) {
    console.error("Error updating signature:", error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};
const enforceMaxSentSignatures = async (boardId: string) => {
  try {
    const itemsRef = collection(db, `boards/${boardId}/sentSignatures`);
    const querySnapshot = await getDocs(
      query(itemsRef, orderBy("createdAt", "asc"))
    );
    let maxObjectStored = 100;
    // Check if there are more than 20 items
    if (querySnapshot.size > maxObjectStored) {
      const excess = querySnapshot.size - maxObjectStored;

      // Get the oldest documents (to be deleted)
      const docsToDelete = querySnapshot.docs.slice(0, excess);

      // Delete each of the oldest documents
      for (const docSnapshot of docsToDelete) {
        await deleteDoc(
          doc(db, `boards/${boardId}/sentSignatures/${docSnapshot.id}`)
        );
        console.log(`Deleted oldest document with ID: ${docSnapshot.id}`);
      }
    }
  } catch (error) {
    console.error("Error enforcing max sent signatures:", error);
    throw error;
  }
};

export const removeSentSignatureById = async (
  boardId: string,
  signatureId: string,
  admin?: Admin
): Promise<void> => {
  try {
    // Reference to the specific document in the sentSignatures subcollection
    const signatureRef = doc(
      db,
      `boards/${boardId}/sentSignatures/${signatureId}`
    );

    // Delete the document
    await deleteDoc(signatureRef);
    console.log(`Successfully removed signature with ID: ${signatureId}`);

    let historyAction;
    if (admin) {
      historyAction = {
        id: "",
        admin: { id: admin.id, name: admin.name, email: admin.email },
        soldier: {
          id: "",
          name: "",
          personalNumber: 0,
          profileImage: "",
          soldierId: "",
        },
        items: [],
        date: String(new Date()),
        type: "delete",
        collectionName: "sentSignatures",
      } as HistoryAction;
      console.log("historyAction", historyAction);

      // Log the deletion to history
      if (historyAction) {
        await createHistory(boardId, historyAction);
      }
    }
  } catch (error) {
    console.error("Error removing signature:", error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};
