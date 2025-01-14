import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../main";

import { Button, Input, Message, useToaster } from "rsuite";
import { useNavigate } from "react-router-dom";
import { Admin } from "../types/table";
import GoogleAuth from "./GoogleAuth";
import { updateDynamic } from "../service/board";
import { adminTranslate } from "../const";
import EditIcon from "@rsuite/icons/Edit";
import { getAdminByEmail } from "../service/admin";

export default function PersonalArea() {
  const [user, setUser] = useState<User>();
  const [admin, setAdmin] = useState<Admin>();
  const [isEditMode, setIsEditMode] = useState(true);
  const navigat = useNavigate();
  const toaster = useToaster();

  useEffect(() => {
    async function fetchData() {
      let adminConnect = await getAdminByEmail("hapak162", user?.email ?? "");
      if (adminConnect) {
        setAdmin(adminConnect);
      }
    }
    fetchData();
  }, [user]);

  const userKeyToPreview: Array<keyof Admin> = [
    // "email",
    "name",
    "personalNumber",
    "phone",
    "rank",
  ];
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        // console.log("user", user);
      } else {
        setUser(undefined);
      }
    });
  }, []);
  const updateAdmin = async () => {
    try {
      console.log("update", admin);
      if (admin) {
        await updateDynamic(
          "hapak162",
          admin.id,
          "admins",
          admin,
          admin,
          "edit"
        );
        toaster.push(
          <Message type="success" showIcon>
            הפעולה בוצעה בהצלחה!
          </Message>,
          { placement: "topCenter" }
        );
      }
    } catch (err) {
      toaster.push(
        <Message type="error" showIcon>
          לא הצלחנו לבצע את הפעולה
        </Message>,
        { placement: "topCenter" }
      );
    }
  };
  return (
    <div className=" relative flex gap-3  items-center w-full pb-6  flex-col">
      <div className=" bg-blue-950 p-3 justify-end flex w-full">
        {user?.email === "hapakmaog162@gmail.com" && (
          <Button
            onClick={() => {
              navigat("/admin");
            }}
          >
            איזור מנהל
          </Button>
        )}
      </div>
      <div className="flex flex-col px-5 gap-3 items-center justify-center">
        {user?.photoURL && (
          <div>
            <img className="rounded-full" src={user?.photoURL ?? ""} alt="" />
          </div>
        )}
        <div className="flex flex-col justify-center items-center gap-4 ">
          {admin &&
            userKeyToPreview.map((key) => {
              return (
                <Input
                  disabled={isEditMode}
                  onChange={(e) => {
                    setAdmin({
                      ...admin,
                      [key]: e,
                    });
                  }}
                  value={admin[key]}
                  placeholder={adminTranslate[key]}
                  key={key}
                />
              );
            })}
        </div>
        <div
          onClick={() => {
            toaster.push(
              <Message type="info" showIcon>
                לא ניתן לשנות חתימה
              </Message>,
              { placement: "topCenter" }
            );
          }}
          className="w-1/2 h-1/2 flex flex-col"
        >
          <span>חתימה:</span>
          <img className="w-full" src={admin?.signature} alt="" />
          {/* {admin && (
            <Button
              onClick={async () => {
                await updateDynamic("hapak162", admin.id, "admins", {
                  ...admin,
                  signature: "",
                });
              }}
            >
              מחק חתימה
            </Button>
          )} */}
        </div>
      </div>
      <div className="flex gap-2">
        <span onClick={() => navigat("/")}>
          <GoogleAuth
            color="red"
            setUser={() => {}}
            userConnected={user?.displayName ?? ""}
          />
        </span>
        <Button
          startIcon={<EditIcon />}
          onClick={() => {
            setIsEditMode((prev) => !prev);
            if (!isEditMode) {
              updateAdmin();
            }
          }}
        >
          {isEditMode ? "ערוך" : "שמור"}
        </Button>
      </div>
    </div>
  );
}
