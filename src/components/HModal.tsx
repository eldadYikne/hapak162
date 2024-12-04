import { AutoComplete, Button, DatePicker, Modal, Placeholder } from "rsuite";
import { DetailsItem } from "../types/soldier";
import { useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import Signature from "./Signature";
import { Item } from "../types/table";
export default function HModal({
  isOpen,
  onCloseModal,
  item,
  mode,
  dropdownOptions,
  dropdownTitle,
  onConfirm,
}: Props) {
  const modalOptions = {
    signature: {
      title: `החתם ${item.name} `,
    },
  };

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [signatureUrl, setSignatureUrl] = useState<string>();
  const [selectedOption, setSelectedOption] = useState<DetailsItem>(); // Stores the selected object
  const [inputValue, setInputValue] = useState(""); // Manages input value for di
  return (
    <Modal
      open={isOpen}
      onClose={() => {
        onCloseModal();
      }}
      dir="rtl"
      overflow={false}
    >
      <Modal.Header>
        <Modal.Title>{modalOptions[mode].title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* <CustomDropdown placeholder={dropdownTitle} options={dropdownOptions} /> */}
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <AutoComplete
            placeholder="בחר חייל"
            style={{ width: 224 }}
            data={dropdownOptions.map((option) => ({
              label: option.name,
              value: option.id,
            }))}
            value={selectedOption?.name}
            onChange={(value) => {
              setInputValue(value); // Update input field display
            }}
            onSelect={(value) => {
              const selected = dropdownOptions.find(
                (option) => option.id === value
              );
              if (selected) {
                setSelectedOption(selected); // Update selected object
                setInputValue(selected?.name || ""); // Display name in the input field
                console.log(selected); // Logs the full object
              }
            }}
          />
          <DatePicker
            value={currentDate}
            onChange={(e: any) => {
              setCurrentDate(new Date(e));
            }}
            format="dd.MM.yyyy"
          />
          <Signature
            item={
              {
                ...item,
                soldierId: selectedOption?.id,
                owner: selectedOption?.name,
              } as Item
            }
            onEnd={(e: string) => {
              setSignatureUrl(e);
            }}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            onConfirm({
              ...item,
              soldierId: selectedOption?.id,
              owner: selectedOption?.name,
              pdfFileSignature: signatureUrl,
            } as Item);
            onCloseModal();
          }}
          appearance="primary"
          disabled={!signatureUrl || !selectedOption?.id}
        >
          החתם
        </Button>
        <Button
          onClick={() => {
            onCloseModal();
          }}
          appearance="subtle"
        >
          בטל
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
interface Props {
  isOpen: boolean;
  onCloseModal: Function;
  mode: "signature";
  item: DetailsItem;
  dropdownOptions: DetailsItem[];
  dropdownTitle: string;
  onConfirm: Function;
}
