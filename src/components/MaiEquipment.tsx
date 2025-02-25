import { Item, TableData, TableHeaders, NewTableData } from "../types/table";
import { Soldier, SoldierItem } from "../types/soldier";
import HTable from "./HTable";
import { useEffect, useState } from "react";
import { itemsKeys, soldierKeys } from "../const";
import Filter from "./Filter";
import { Loader, Placeholder } from "rsuite";
import { FilterObject } from "../types/filter";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowDownLineIcon from "@rsuite/icons/ArrowDownLine";
import { Animation } from "rsuite";
import SlideItemTypes from "./SlideItemTypes";
import {
  fetchFilteredData,
  getBoardByIdWithCallbackWithSort,
} from "../service/board";
import ExportToExcel from "./ExportToExcel";

function MaiEquipment() {
  const { type } = useParams();
  // console.log("boardId", boardId);

  const [selecteTable, setSelectedTable] = useState<string>(type ?? "");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [headers, setHeaders] = useState<TableHeaders>();
  const [data, setData] = useState<TableData>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (type) {
      setSelectedTable(type);
      setFilters({});
      // if (data && data[type as keyof TableData]) {
      console.log("type", type);
      // onFilter({});
      // }
    }
  }, [type]);
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      await getBoardByIdWithCallbackWithSort(
        "hapak162",
        [
          { boardKey: "soldiers", sortByKey: "name" },
          { boardKey: "items", sortByKey: "name" },
          { boardKey: "itemsTypes", sortByKey: "name" },
          { boardKey: "teams", sortByKey: "name" },
          { boardKey: "admins", sortByKey: "name" },
        ],
        (a) => {
          // console.log("a", a);
          setData((prev) => ({ ...prev, ...a } as TableData));
          setDataToTable((prev) => ({ ...prev, ...a } as NewTableData));
        }
      );
    }
    fetchData();
    setIsLoading(false);
  }, []);
  useEffect(() => {
    if (data?.itemsTypes && data?.items) {
      let newHeaders = {
        soldiers: soldierKeys,
      };
      data.itemsTypes.forEach((item) => {
        newHeaders = {
          ...newHeaders,
          [(item as Item).id]: itemsKeys,
        } as TableHeaders;
      });
      setHeaders(newHeaders as TableHeaders);
      const reducedItems = data.items.reduce<{ [key: string]: Item[] }>(
        (acc, item: Item) => {
          if (acc[item.itemType.id as string]) {
            acc[item.itemType.id as string] = [
              ...acc[item.itemType.id as string],
              item,
            ];
          } else {
            acc[item.itemType.id as string] = [item];
          }
          return acc;
        },
        {}
      );
      setDataToTable({
        ...reducedItems,
        soldiers: data.soldiers ?? [],
      } as NewTableData);
      setDataToTableFilter({
        ...reducedItems,
        soldiers: data.soldiers ?? [],
      } as NewTableData);

      // console.log("reducedItems", reducedItems);
    }
  }, [data]);
  const navigate = useNavigate();
  const [dataToTable, setDataToTable] = useState<NewTableData>();
  const [dataToTableFilter, setDataToTableFilter] = useState<NewTableData>();
  const [itemToEdit, setItemToEdit] = useState<Item | Soldier>();
  const [filters, setFilters] = useState<FilterObject>({});
  itemToEdit;

  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filters: { [key in keyof SoldierItem]?: string } = {};

    // Parse search params into filter object
    searchParams.forEach((value, key) => {
      console.log("value, key", value, key);
      if (value.trim()) {
        filters[key as keyof SoldierItem] = value;
      }
    });

    // Trigger filtering only if params are valid
    if (Object.keys(filters).length > 0) {
      onFilter(filters);
    }
  }, [location.search, dataToTableFilter]);

  // const onFilter = (filters: { [key in keyof SoldierItem]?: string }) => {
  //   console.log("Filters:", filters);

  //   setFilters(filters as FilterObject);
  //   const searchParams = new URLSearchParams();

  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (value) {
  //       searchParams.set(key, value);
  //     }
  //   });

  //   navigate(`?${searchParams.toString()}`); // Update the URL with query params

  //   if (dataToTable && selecteTable && dataToTableFilter) {
  //     setDataToTable((prevData: any) => {
  //       if (prevData && prevData[selecteTable]) {
  //         const filteredData = dataToTableFilter[selecteTable].filter(
  //           (item: AdminItemSoldier) => {
  //             return Object.entries(filters).every(([key, value]) => {
  //               if (!value) return true;
  //               const itemObject =
  //                 typeof item[key as keyof AdminItemSoldier] === "object"
  //                   ? (
  //                       item[
  //                         key as keyof AdminItemSoldier
  //                       ] as unknown as NewTeam
  //                     ).id
  //                   : item[key as keyof AdminItemSoldier];
  //               const itemValue = String(itemObject);
  //               return itemValue.includes(value);
  //             });
  //           }
  //         );
  //         return {
  //           ...prevData,
  //           [selecteTable]: filteredData,
  //         };
  //       }
  //       return prevData;
  //     });
  //   }
  // };

  const onFilter = async (filters: { [key: string]: string }) => {
    console.log("Applying Filters:", filters);
    console.log("selecteTable:", selecteTable);

    setFilters(filters);
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });

    navigate(`?${searchParams.toString()}`); // Update the URL with query params

    if (!selecteTable) return;

    try {
      setIsLoading(true);
      const filteredData = await fetchFilteredData(
        "hapak162",
        selecteTable === "soldiers" ? "soldiers" : "items",
        filters
      );

      setDataToTable((prevData: any) => ({
        ...prevData,
        [selecteTable]:
          selecteTable === "soldiers"
            ? filteredData
            : filteredData.filter(
                (item) => (item as Item).itemType.id === selecteTable
              ),
      }));
      setIsLoading(false);
    } catch (error) {
      console.error("Error filtering data:", error);
    }
  };

  const onActionClickInTable = (item: Item | Soldier) => {
    setItemToEdit(item);
  };

  return (
    <div dir="rtl" className="flex flex-col w-full">
      <div className="">
        {/* <ScrollToTopButton /> */}

        {/* <div className="absolute left-2"></div> */}
        {data && data.itemsTypes && (
          <SlideItemTypes
            selecteTable={selecteTable}
            setSelectedTable={setSelectedTable}
            itemsTypes={data?.itemsTypes}
          />
        )}
        <div className="">
          <Animation.Collapse in={isFilterOpen}>
            {(props) => (
              <div
                {...props}
                style={{
                  boxShadow: "1px 15px 13px -11px rgba(104, 119, 240, 0.46)",
                  overflow: "hidden",
                  padding: "8px 4.5vw 8px 4.5vw",
                }}
              >
                <Filter
                  teams={data?.teams ?? []}
                  setFilters={setFilters}
                  filters={filters}
                  onFilter={onFilter}
                  filterType={selecteTable}
                  dataLength={
                    dataToTable && dataToTable[selecteTable]
                      ? dataToTable[selecteTable].length
                      : 0
                  }
                  openForm={() => {
                    // setItemToEdit(undefined);
                  }}
                />
              </div>
            )}
          </Animation.Collapse>
          <div
            className={`flex w-full transition-all justify-center sm:hidden  z-10 `}
          >
            <ArrowDownLineIcon
              color="#3498FF"
              style={{ fontSize: "20px", width: "30px", height: "20px" }}
              className={`
                bg-gray-300
                transition-all
                ${
                  isFilterOpen
                    ? "rotate-180 rounded-t-[50px]"
                    : "rounded-b-[50px]"
                } `}
              onClick={() => setIsFilterOpen((prev) => !prev)}
            />
          </div>
          <div className="sm:p-12 ">
            {(isLoading || !data) && (
              <div className="table soldier-table responsiveTable">
                <table>
                  <tbody>
                    {Array.from({ length: 6 }).map((a, i) => {
                      a;
                      return (
                        <tr key={i}>
                          <td>
                            <Placeholder.Paragraph
                              className="mt-3"
                              graph="circle"
                              active
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {dataToTable &&
              dataToTable[selecteTable] &&
              headers &&
              headers[selecteTable] &&
              dataToTable[selecteTable].length > 0 && (
                <div>
                  <span className="flex justify-end sm:pb-5 pb-2 px-4 sm:px-0">
                    <ExportToExcel
                      dataToTable={dataToTable}
                      selecteTable={selecteTable}
                      itemsTypes={data?.itemsTypes}
                    />
                  </span>

                  <HTable
                    data={
                      dataToTable ? (dataToTable[selecteTable] as Item[]) : []
                    }
                    headers={headers[selecteTable]}
                    onAction={onActionClickInTable}
                    dataType={selecteTable === "soldiers" ? "soldier" : "item"}
                  />
                  {isLoading && (
                    <div className=" w-full justify-center items-start  sm:p-24 p-4  pt-10 flex  ">
                      <div className="border text-2xl border-white shadow-xl flex flex-col justify-center items-center sm:p-8 p-3 w-full rounded-xl ">
                        {/* <h1>פריט לא נמצא </h1> */}
                        <Loader />
                      </div>
                    </div>
                  )}
                </div>
              )}
            {/* {dataToTable &&
              (!dataToTable[selecteTable] ||
                dataToTable[selecteTable].length === 0) && (
                <div className="w-full flex justify-center text-2xl">
                  לא נמצאו פריטים
                </div>
              )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaiEquipment;
