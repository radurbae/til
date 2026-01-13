"use client";

import Header from "@/components/Header/Header";
import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError("");

        try {
            const response = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "login",
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsLoggedIn(true);
            } else {
                setLoginError(data.error || "Password salah");
            }
        } catch {
            setLoginError("Gagal terhubung ke server");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    category: category || "TIL",
                    tags,
                    content,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                setTitle("");
                setContent("");
                setTags("");
                setCategory("");
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch {
            setMessage("❌ Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    // Login Screen
    if (!isLoggedIn) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={`container ${styles.loginContainer}`}>
                        <div className={styles.loginBox}>
                            <h1 className={styles.loginTitle}>🔐 Admin Login</h1>
                            <p className={styles.loginSubtitle}>
                                Masukkan password untuk mengakses halaman admin
                            </p>

                            <form onSubmit={handleLogin} className={styles.loginForm}>
                                <div className={styles.field}>
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Masukkan password admin"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {loginError && (
                                    <div className={styles.loginError}>{loginError}</div>
                                )}

                                <button
                                    type="submit"
                                    className={styles.loginButton}
                                    disabled={isLoggingIn}
                                >
                                    {isLoggingIn ? "Memverifikasi..." : "Masuk"}
                                </button>
                            </form>

                            <Link href="/" className={styles.backToHome}>
                                ← Kembali ke beranda
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    // Writing Form (after logged in)
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={`container ${styles.page}`}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.backLink}>
                            ← Back
                        </Link>
                        <h1 className={styles.title}>📝 Tulis TIL Baru</h1>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label htmlFor="title">Judul</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Judul artikel"
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="category">Kategori</label>
                                <input
                                    type="text"
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Contoh: Book, TIL, Programming"
                                />
                                <span className={styles.fieldHint}>
                                    Ketik kategori bebas. Jika tidak ada, akan dibuat otomatis.
                                </span>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="tags">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="book-summary, psychology"
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="content">Konten (Markdown)</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Tulis konten dalam format Markdown..."
                                rows={20}
                                required
                            />
                        </div>

                        {message && (
                            <div className={styles.message}>{message}</div>
                        )}

                        <button
                            type="submit"
                            className={styles.submit}
                            disabled={isLoading}
                        >
                            {isLoading ? "Menyimpan..." : "💾 Simpan & Publish"}
                        </button>
                    </form>

                    <div className={styles.info}>
                        <p>
                            <strong>Catatan:</strong> Artikel akan langsung di-commit ke GitHub
                            dan ter-deploy otomatis ke Vercel. Proses deploy membutuhkan
                            waktu ~1-2 menit.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
