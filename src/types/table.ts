import { HistoryAction, HistoryItemAction } from "./history";
import { NewTeam, Soldier } from "./soldier";

export interface Item {
  id: string;
  profileImage: string;
  name: string;
  serialNumber: string;
  owner: string;
  soldierId: string;
  signtureDate: string;
  history: ItemHistory[];
  itemType: ItemType;
  pdfFileSignature: string;
  status: Status;
  soldierPersonalNumber: number;
  representative: string;
  isExclusiveItem: boolean;
  numberOfUnExclusiveItems: number;
}

export type Status = "stored" | "signed" | "broken";

export interface ItemHistory {
  ownerName: string;
  soldierId: string;
  representative: string;
  dateTaken: string;
  dateReturn: string;
  pdfFileSignature: string;
}

export interface TableHeaders {
  soldiers: (keyof Soldier)[];
  [key: string]: (keyof Item)[] | (keyof Soldier)[];
}

export interface TableData {
  id: string;
  soldiers: Soldier[];
  items: Item[];
  admins: Admin[];
  teams: NewTeam[];
  itemsTypes: ItemType[];
  actions: HistoryAction[];
  sentSignatures: SentSinature[];
  optionalAdmins: OptionalAdmin[];
}

export interface OptionalAdmin {
  id: string;
  email: string;
  createdAt: string;
  name: string;
  phone: string;
  personalNumber: number;
  rank: string;
}
export interface Admin {
  id: string;
  email: string;
  signature: string;
  dateFirstSignIn: string;
  name: string;
  phone: string;
  personalNumber: number;
  rank: string;
  isSuperAdmin?: boolean;
}
export interface ItemType {
  name: string;
  id: string;
}
export interface SentSinature {
  id: string;
  pdfFileSignature: string;
  signtureDate: string;
  soldierId: string;
  personalNumber: number;
  items: HistoryItemAction[];
  phoneNumber: number;
  soldierName: string;
  adminName: string;
  adminEmail: string;
  createdAt: string;
  isSignatureDone: boolean;
}
export interface NewTableData {
  soldiers: Soldier[];
  [key: string]: Item[] | Soldier[] | Admin[];
  admins: Admin[];
}
export type CombinedKeys = keyof Item | keyof Soldier; // Union of keys from both Item and Soldier
export type CollectionName =
  | "items"
  | "soldiers"
  | "itemsTypes"
  | "teams"
  | "sentSignatures"
  | "actions";
