"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { useAppSettings } from "@/components/AppSettings/AppSettingsProvider";

export default function Header() {
    const { theme, toggleTheme } = useAppSettings();

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContent}`}>
                <Link href="/" className={styles.logo}>
                    TIL
                </Link>
                <nav className={styles.nav} aria-label="Primary">
                    <Link href="/categories" className={styles.navLink}>
                        Categories
                    </Link>
                    <Link href="/about" className={styles.navLink}>
                        About
                    </Link>
                </nav>
                <div className={styles.controls}>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={styles.themeButton}
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? "Dark" : "Light"}
                    </button>
                </div>
            </div>
        </header>
    );
}
