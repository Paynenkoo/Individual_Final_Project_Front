import React from "react";
import styles from "./Footer.module.scss";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.footerText}>© {new Date().getFullYear()} Tactical Med — All Rights Reserved</p>
        </footer>
    )
}

export default Footer;