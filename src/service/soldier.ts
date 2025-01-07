import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../main";
import { Admin, Item, ItemType } from "../types/table";
import { Soldier } from "../types/soldier";
import { query, where, getDocs } from "firebase/firestore";

export const getSoldiers = async (
  boardId: string,
  setDataCallback: (soldiers: Soldier[]) => void
) => {
  try {
    const boardRef = doc(db, "boards", boardId);

    const unsubscribeBoard = onSnapshot(boardRef, (boardDoc) => {
      if (boardDoc.exists()) {
        // List of subcollection names to listen for
        const subcollections = ["soldiers"];
        const subcollectionData: Record<string, any[]> = {};

        const unsubscribes = subcollections.map((subcollectionName) => {
          const subRef = collection(boardRef, subcollectionName);

          return onSnapshot(subRef, (subSnapshot) => {
            subcollectionData[subcollectionName] = subSnapshot.docs.map((doc) =>
              doc.data()
            );
            setDataCallback(subcollectionData["soldiers"]);
            // Update state via callback with the combined data
          });
        });

        // Return a cleanup function to unsubscribe from all listeners
        return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
      } else {
        console.log("Board not found");
      }
    });

    // Return the unsubscribe function for the board document
    return unsubscribeBoard;
  } catch (error) {
    console.error("Error fetching board and subcollections:", error);
    throw error; // Rethrow the error to handle it where the function is called
  }
};

export const getSoldierById = async (boardId: string, soldierId: string) => {
  console.log("soldierId", soldierId);

  try {
    const soldierRef = doc(db, `boards/${boardId}/soldiers`, soldierId);

    // Get the document
    const soldierDoc = await getDoc(soldierRef);

    if (soldierDoc.exists()) {
      console.log("Soldier found:", {
        ...soldierDoc.data(),
        id: soldierDoc.id,
      });

      // Return the soldier data, including Firestore ID
      return { ...soldierDoc.data(), id: soldierDoc.id } as Soldier;
    }
  } catch (error) {
    console.error("Error fetching soldier:", error);
  }
};

export const getSoldierByPersonalNumberAndPhone = async (
  boardId: string,
  personalNumber: string,
  phoneNumber: string
) => {
  try {
    // Reference the soldiers subcollection
    const soldiersRef = collection(db, `boards/${boardId}/soldiers`);
    console.log("soldiersRef", soldiersRef);

    // Query for the soldier with matching personalNumber and phoneNumber
    const q = query(
      soldiersRef,
      where("personalNumber", "==", personalNumber),
      where("phoneNumber", "==", phoneNumber)
    );
    console.log("q", q);

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        console.log("Soldier found:", doc.data());
      });
      return querySnapshot.docs[0].data() as Soldier;
    } else {
      console.log("No matching soldier found.");
    }
  } catch (error) {
    console.error("Error fetching soldier:", error);
  }
};

export const getSoldierItemsById = async (
  boardId: string,
  soldierId: string
) => {
  console.log("soldierId", soldierId);

  try {
    const itemsRef = collection(db, `boards/${boardId}/items`);

    // Query for the soldier with matching personalNumber and phoneNumber
    const q = query(itemsRef, where("soldierId", "==", soldierId));
    console.log("q", q);

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        console.log("items found:", doc.data());
      });
      return querySnapshot.docs.map((doc) => doc.data()) as Item[];
    } else {
      console.log("No matching Items found.");
    }
  } catch (error) {
    console.error("Error fetching Items:", error);
  }
};

export const createSoldier = async (boardId: string, soldier: Soldier) => {
  try {
    const soldiersRef = collection(db, `boards/${boardId}/soldiers`);

    const docRef = await addDoc(soldiersRef, soldier);

    console.log("Soldier successfully created with ID:", docRef.id);
    return docRef.id; // Return the ID of the created soldier
  } catch (error) {
    console.error("Error creating soldier:", error);
    throw error;
  }
};

export const updateSoldier = async (
  boardId: string,
  soldierId: string,
  updates: Partial<Soldier>
) => {
  try {
    const soldierRef = doc(db, `boards/${boardId}/soldiers`, soldierId);

    await updateDoc(soldierRef, updates);

    console.log("Soldier successfully updated");
  } catch (error) {
    console.error("Error updating soldier:", error);
    throw error;
  }
};
export const removeSoldier = async (boardId: string, soldierId: string) => {
  try {
    const soldierRef = doc(db, `boards/${boardId}/soldiers`, soldierId);

    await deleteDoc(soldierRef);

    console.log("Soldier successfully deleted");
  } catch (error) {
    console.error("Error deleting soldier:", error);
    throw error;
  }
};
