import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../main";
import { Admin, Item, TableData } from "../types/table";
import { Soldier } from "../types/soldier";

export const updateBoard = async (boardId: string, boardData: any) => {
  boardId;
  const boardRef = doc(collection(db, "boards"), boardId); // Get reference to the user document
  try {
    await updateDoc(boardRef, boardData); // Update the user document with new data
    console.log("BOARD updated successfully from serviceBoard!");
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

export const updateBoaedSpesificKey = async (
  boardId: string,
  key: keyof TableData,
  data: any
) => {
  const boardRef = doc(collection(db, "boards"), boardId); // Get reference to the user document

  try {
    const boardDoc = await getDoc(boardRef);

    if (boardDoc.exists()) {
      const boardData = boardDoc.data();

      // Update the board document with the updated data, including preserving "users"
      await updateDoc(boardRef, { ...boardData, [key]: data });

      console.log("Board updated successfully!");
    } else {
      console.error("Board not found!");
    }
  } catch (error) {
    console.error("Error updating board:", error);
  }
};

export const addBoardValueByKey = async (
  boardId: string,
  key: keyof TableData,
  data: any
) => {
  const boardRef = doc(collection(db, "boards"), boardId); // Get reference to the user document

  try {
    const boardDoc = await getDoc(boardRef);

    if (boardDoc.exists()) {
      const boardData = boardDoc.data();
      // Update the board document with the updated data, including preserving "users"
      const x = await updateDoc(boardRef, {
        ...boardData,
        [key]: [...boardData[key], data],
      });

      console.log("Board updated successfully!", x);
    } else {
      console.error("Board not found!");
    }
  } catch (error) {
    console.error("Error updating board:", error);
  }
};

export const putBoardValueByKey = async (
  boardId: string,
  key: keyof TableData,
  data: Item | Soldier
) => {
  const boardRef = doc(collection(db, "boards"), boardId); // Get reference to the user document
  console.log("putBoardValueByKey!!");
  try {
    const boardDoc = await getDoc(boardRef);

    if (boardDoc.exists() && data.id) {
      const boardData = boardDoc.data();
      // Update the board document with the updated data, including preserving "users"

      const newArrayItems = boardData[key].filter(
        (existItem: Item) => data.id !== existItem.id
      );

      await updateDoc(boardRef, {
        ...boardData,
        [key]: [...newArrayItems, data],
      });

      console.log("Board updated successfully!");
    } else {
      console.error("Board not found!");
    }
  } catch (error) {
    console.error("Error updating board:", error);
  }
};
export const putBoardValueByArrayKey = async (
  boardId: string,
  key: keyof TableData,
  data: Item[]
) => {
  const boardRef = doc(collection(db, "boards"), boardId); // Get reference to the board document
  console.log("putBoardValueByKey!!");

  try {
    const boardDoc = await getDoc(boardRef);

    if (boardDoc.exists() && data.every((item) => item.id)) {
      // Ensure all items have an id
      const boardData = boardDoc.data();

      // Loop through each item in the data array and filter out existing items
      let updatedItems = [...boardData[key]]; // Copy the current items of the board

      // Filter out existing items by their id (to avoid duplicates)
      updatedItems = updatedItems.filter(
        (existingItem: Item | Soldier) =>
          !data.some((newItem) => newItem.id === existingItem.id)
      );

      // Update the board document by adding the new items
      await updateDoc(boardRef, {
        ...boardData,
        [key]: [...updatedItems, ...data],
      });

      console.log("Board updated successfully!");
    } else {
      console.error("Board not found or invalid data!");
    }
  } catch (error) {
    console.error("Error updating board:", error);
  }
};
export const putBoardAdmins = async (boardId: string, data: Admin) => {
  const boardRef = doc(collection(db, "boards"), boardId); // Get reference to the user document

  try {
    const boardDoc = await getDoc(boardRef);

    if (boardDoc.exists() && data.email) {
      const boardData = boardDoc.data();
      // Update the board document with the updated data, including preserving "users"

      const newAdmins = boardData["admins"].filter(
        (existItem: Admin) => data.email !== existItem.email
      );

      await updateDoc(boardRef, {
        ...boardData,
        admins: [...newAdmins, data],
      });

      console.log("Board updated successfully!");
    } else {
      console.error("Board not found!");
    }
  } catch (error) {
    console.error("Error updating board:", error);
  }
};

export const deleteBoardValueByKey = async (
  boardId: string,
  key: keyof TableData,
  data: Item | Soldier
) => {
  const boardRef = doc(collection(db, "boards"), boardId); // Get reference to the user document

  try {
    const boardDoc = await getDoc(boardRef);

    if (boardDoc.exists() && data.id) {
      const boardData = boardDoc.data();
      // Update the board document with the updated data, including preserving "users"

      const newArrayItems = boardData[key].filter(
        (existItem: Item) => data.id !== existItem.id
      );

      await updateDoc(boardRef, {
        ...boardData,
        [key]: [...newArrayItems],
      });

      console.log("Board updated successfully!");
    } else {
      console.error("Board not found!");
    }
  } catch (error) {
    console.error("Error updating board:", error);
  }
};
