"use client";

import React, { FC, useEffect, useState } from "react";
import Select from "react-select";
import { selectOptions } from "@/app/utils/helpers";
import { MultiValue } from "react-select";
import Image from "next/image";
import { MAX_FILE_SIZE } from "@/app/constants/config";
//import { service, handleDelete } from "@/app/actions/actions";

type Input = {
  name: string;
  description: string;
  price: number;
  duration: number;
  categories: MultiValue<{ value: string; label: string }>;
  file: undefined | File;
};

const initialInput = {
  name: "",
  description: "",
  price: 0,
  duration: 0,
  categories: [],
  file: undefined,
};

const Menu: FC = () => {
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState<Input>(initialInput);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    // créer la preview de l'image
    if (!input.file) return;
    const objectUrl = URL.createObjectURL(input.file);
    setPreview(objectUrl);
    // clean up la preview
    return () => URL.revokeObjectURL(objectUrl);
  }, [input.file]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setError("Aucune image séléctionnée");
    if (e.target.files[0].size > MAX_FILE_SIZE)
      return setError(
        "Image trop grande, veuillez choisir une image de moins de 1Mo"
      );
    setInput((prev) => ({
      ...prev,
      file: e.target.files ? e.target.files[0] : undefined,
    }));
  };

  return (
    <>
      <div className="menu_container">
        <div className="mx-auto flex max-w-xl flex-col gap-2">
          <input
            name="name"
            className="input_name"
            type="text"
            placeholder="name"
            onChange={(e) =>
              setInput((prev) => ({ ...prev, name: e.target.value }))
            }
            value={input.name}
          />

          <input
            name="price"
            className="input_price"
            type="number"
            placeholder="price"
            onChange={(e) =>
              setInput((prev) => ({ ...prev, price: Number(e.target.value) }))
            }
            value={input.price}
          />

          <Select
            value={input.categories}
            name="categories"
            onChange={(e) => setInput((prev) => ({ ...prev, categories: e }))}
            isMulti
            className="select_categories"
            options={selectOptions}
          />

          <label htmlFor="file" className="label_file">
            <span className="file_input">File input</span>
            <div className="file_input_preview">
              {preview ? (
                <div className="image_preview">
                  <Image
                    alt="preview"
                    style={{ objectFit: "contain" }}
                    fill
                    src={preview}
                  />
                </div>
              ) : (
                <span>Select image</span>
              )}
            </div>

            <input
              name="file"
              id="file"
              onChange={handleFileSelect}
              accept="image/jpeg image/png image/jpg"
              type="file"
              className="file_input"
            />
          </label>

          {/* <button
            className="btn_add"
            disabled={!input.file || !input.name}
            onClick={service}
          >
            Add menu item
          </button> */}
        </div>
        {error && <p className="text_error">{error}</p>}

        <div className="menu_items">
          <p className="menu_items__text">Your menu items:</p>
          {/* <div className="menu_items__container">
            {services?.map((service) => (
              <div key={service.id}>
                <p>{service.name}</p>
                <div className="relative h-40 w-40">
                  <Image priority fill alt="" src={service.url} />
                </div>
                <button
                  onClick={() => handleDelete(service.imageKey, service.id)}
                  className="text-xs text-red-500"
                >
                  delete
                </button>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Menu;
