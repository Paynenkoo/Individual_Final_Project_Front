import React from "react";
import styles from "./GuideSection.module.scss";

function GuideSection({ title, content, checklist, image, videoUrl, tip }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>

      {}
      {image && !String(image).includes("placeholder.com") && (
        <img
          src={image}
          alt={title}
          className={styles.image}
          loading="lazy"
          onError={(e) => e.currentTarget.remove()}
        />
      )}

      <p className={styles.text}>{content}</p>

      {checklist?.length > 0 && (
        <ul className={styles.checklist}>
          {checklist.map((item, index) => (
            <li key={index}>✅ {item}</li>
          ))}
        </ul>
      )}

      {tip && <div className={styles.tip}>⚠️ {tip}</div>}

      {videoUrl && (
        <div className={styles.videoWrapper}>
          <iframe
            width="100%"
            height="315"
            src={videoUrl}
            title="Гайд відео"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default GuideSection;
