// app/components/FormattedDescription/FormattedDescription.tsx
"use client";
import React from "react";
// Styles
import styles from "./styles.module.scss";

type Props = {
  text: string;
};

const FormattedDescription = ({ text }: Props) => {
  const paragraphs = text.split(/\n{2,}/g).filter(Boolean);

  return (
    <div className={styles.description}>
      {paragraphs.map((para, idx) => {
        if (/^\*\*Inclus ?:/.test(para)) {
          const content = para
            .replace(/^\*\*Inclus ?: ?/i, "")
            .replace(/\*\*/g, "");
          const items = content.split(",").map((item) => item.trim());
          return (
            <div key={idx}>
              <h3 className={styles.included_title}>Inclus :</h3>
              <ul className={styles.included_list}>
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (/^\*\*Caution/i.test(para)) {
          const cautionText = para.replace(/\*\*/g, "");
          return (
            <p key={idx} className={styles.highlighted}>
              {cautionText}
            </p>
          );
        }

        // Traitement bold inline
        const formattedText = para
          .split("**")
          .map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          );

        return <p key={idx}>{formattedText}</p>;
      })}
    </div>
  );
};

export default FormattedDescription;
