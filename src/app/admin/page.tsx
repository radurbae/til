import Header from "@/components/Header/Header";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
    title: "Admin | TIL",
    description: "Admin panel (hanya tersedia di localhost)",
};

export default function AdminPage() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={`container ${styles.page}`}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.backLink}>
                            ← Back
                        </Link>
                        <h1 className={styles.title}>Admin Panel</h1>
                    </div>
                    <div className={styles.content}>
                        <p>
                            Admin panel hanya tersedia saat menjalankan website secara lokal
                            (<code>npm run dev</code>).
                        </p>
                        <p>
                            Untuk menambah TIL baru di production, buat file <code>.md</code>{" "}
                            di folder <code>content/</code> dan push ke GitHub.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
