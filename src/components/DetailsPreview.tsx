import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CombinedKeys,
  Item,
  ItemHistory,
  TableData,
  TableHeaders,
} from "../types/table";
import { DetailsItem, Soldier } from "../types/soldier";
import {
  ItemTranslate,
  headerTranslate,
  historyTranslate,
  statusColors,
  statusTranslate,
} from "../const";
import { Button } from "rsuite";
import HModal from "./HModal";
import { updateBoard } from "../service/board";
import { db } from "../main";
import HistoryItem from "./HistoryItem";
import { Table, Tbody, Th, Thead, Tr } from "react-super-responsive-table";

export default function DetailsPreview() {
  const { id } = useParams();
  const [data, setData] = useState<TableData>();
  const [item, setItem] = useState<DetailsItem>();
  const [modalOpen, setModalOpen] = useState(false);
  const [soldierItems, setSoldierItems] = useState<Item[]>();
  useEffect(() => {
    async function fetchData() {
      // await updateBoard("hapak", newData);
      await getBoardByIdSnap();
    }

    fetchData();
  }, [id]);
  useEffect(() => {
    if (data && id) {
      console.log("data", data);
      console.log("id", id);
      const newItem: Item | Soldier | undefined = findObjectById(id);
      console.log("newItem", newItem);
      if (newItem) setItem(newItem);
    }
  }, [id, item, data]);
  const findObjectById = (id: string) => {
    if (data) {
      const allArrays = [
        ...data.nightVisionDevice,
        ...data.combatEquipment,
        ...data.soldiers,
        ...data.weaponAccessories,
      ];
      console.log("allArrays", allArrays);
      const currentItem = allArrays.find((item) => item.id === id);

      if ((currentItem as Soldier).personalNumber) {
        const soldItems: Item[] = allArrays.filter((item) => {
          if ((item as Item).soldierId) {
            return (item as Item).soldierId === currentItem?.id;
          }
        }) as Item[];
        setSoldierItems(soldItems);
      }
      return currentItem;
    }
  };
  const getBoardByIdSnap = async () => {
    try {
      const boardRef = doc(db, "boards", "hapak");
      // Listen to changes in the board document
      //   console.log("try newBoard");
      const unsubscribe = onSnapshot(boardRef, (boardDoc) => {
        // console.log("try newBoard boardDoc", boardDoc);
        if (boardDoc.exists()) {
          // Document exists, return its data along with the ID
          const newBoard = { ...boardDoc.data(), id: boardDoc.id };
          if (newBoard) {
            setData(newBoard as TableData);
          }
          console.log("newBoard", newBoard);
          return newBoard;
        } else {
          // Document does not exist
          console.log("Board not found");
          // setDbBoard(null); // or however you handle this case in your application
        }
      });

      // Return the unsubscribe function to stop listening when needed
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching board:", error);
      throw error; // Rethrow the error to handle it where the function is called
    }
  };

  const onSignature = async (item: Item) => {
    console.log("onSignature item", item);
    if (data) {
      const newItems = data[item.itemType].filter(
        (itemType) => itemType.id !== item.id
      );
      try {
        await updateBoard("hapak", {
          ...data,
          [item.itemType]: [...newItems, item],
        });
      } catch (err) {
        console.log(err);
      }
    }
  };
  const onOpenSignatureModal = async () => {
    if ((item as Item).owner) {
      let text = `אתה בטוח שאתה רוצה לזכות את ${(item as Item).owner} על ${
        (item as Item).name
      } ${(item as Item).serialNumber}`;
      if (confirm(text)) {
        const ItemToUpdate: Item = {
          ...item,
          owner: "",
          soldierId: "",
          pdfFileSignature: "",
          soldierPersonalNumber: 0,
          status: "stored",
          history: [
            ...(item as Item).history,
            {
              dateReturn: String(new Date()),
              dateTaken: (item as Item).signtureDate ?? "",
              ownerName: (item as Item).owner,
              soldierId: (item as Item).soldierId,
              representative: "",
            },
          ],
        } as Item;
        try {
          await onSignature(ItemToUpdate);
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      setModalOpen(true);
    }
  };
  return (
    <div className="h-screen w-full justify-center items-center sm:p-24 p-4 bg-blue-950 flex ">
      {item && (
        <div className="flex flex-col gap-3">
          <div className="border border-white shadow-lg flex flex-col justify-center items-center sm:p-8 p-3 w-full rounded-xl ">
            <div className="flex sm:flex-row flex-col-reverse gap-3">
              {item && (
                <div dir="rtl" className="flex p-5 flex-col gap-4 text-white">
                  <div className="flex w-full justify-between">
                    <span className="text-3xl shadow-sm">{item.name}</span>
                    <div
                      style={{
                        background: statusColors[(item as Item).status],
                      }}
                      className="text-xl p-2  rounded-lg shadow-sm"
                    >
                      {statusTranslate[(item as Item).status]}
                    </div>
                  </div>
                  {Object.keys(item).map((key) => {
                    return (
                      key !== "id" &&
                      key !== "profileImage" &&
                      key !== "pdfFileSignature" &&
                      key !== "status" &&
                      key !== "soldierId" &&
                      key !== "items" &&
                      key !== "history" &&
                      key !== "name" && (
                        <div key={key}>
                          {" "}
                          {ItemTranslate[key as CombinedKeys]} :
                          {renderFileds(key as CombinedKeys, item)}
                        </div>
                      )
                    );
                  })}
                </div>
              )}

              <img
                className="w-56 h-56 rounded-md"
                src={
                  (item as Soldier)?.profileImage
                    ? (item as Soldier).profileImage
                    : "https://eaassets-a.akamaihd.net/battlelog/prod/emblems/320/894/2832655391561586894.jpeg?v=1332981487.09"
                }
              />
            </div>
            {soldierItems && soldierItems.length > 1 && (
              <div dir="rtl" className="flex flex-col gap-2 text-white ">
                {soldierItems?.map((item) => {
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.serialNumber}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div>
              {(item as Item)?.serialNumber && (
                <div>
                  <Button
                    onClick={() => {
                      onOpenSignatureModal();
                    }}
                    color={(item as Item).owner ? "blue" : "green"}
                    appearance="primary"
                  >
                    {(item as Item).owner ? "זיכוי" : "החתמה"}
                  </Button>
                </div>
              )}
            </div>
          </div>
          {(item as Item).history && (item as Item).history.length > 0 && (
            <Table>
              <Thead>
                <Tr>
                  {Object.keys((item as Item).history[0]).map((historyKey) => {
                    return (
                      historyKey !== "soldierId" && (
                        <Th key={historyKey}>
                          {historyTranslate[historyKey as keyof ItemHistory]}
                        </Th>
                      )
                    );
                  })}
                </Tr>
              </Thead>
              <Tbody>
                {(item as Item).history.map((history, i) => {
                  return <HistoryItem key={i} history={history} />;
                })}
              </Tbody>
            </Table>
          )}
        </div>
      )}
      {modalOpen && item && (
        <HModal
          dropdownTitle="בחר חייל"
          dropdownOptions={data?.soldiers ?? []}
          item={item}
          mode={"signature"}
          isOpen={modalOpen}
          onCloseModal={() => {
            setModalOpen(false);
          }}
          onConfirm={(e: any) => {
            onSignature(e);
          }}
        />
      )}
    </div>
  );
}
const renderFileds = (key: CombinedKeys, item: Item | Soldier) => {
  if (key === "itemType") {
    return headerTranslate[
      item[key as keyof DetailsItem] as keyof TableHeaders
    ];
  } else if (key === "status") {
    return statusTranslate[(item as Item).status];
  } else {
    return item[key as keyof DetailsItem];
  }
};
