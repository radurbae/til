"use client";

import React, { useEffect, useState } from "react";
import styles from "./WritingStreak.module.css";

interface WritingStreakProps {
    dates: string[];
}

interface DayActivity {
    dateStr: string;
    dayLabel: string;
    hasWritten: boolean;
    isToday: boolean;
}

const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function WritingStreak({ dates }: WritingStreakProps) {
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({
        currentStreak: 0,
        longestStreak: 0,
        totalPosts: 0,
        last7Days: [] as DayActivity[],
        hasWrittenToday: false,
    });

    useEffect(() => {
        setMounted(true);

        const writtenDatesSet = new Set(dates);
        
        // Calculate longest streak
        const sortedUniqueDates = Array.from(new Set(dates)).sort();
        
        let longest = 0;
        let currentRun = 0;
        let prevDate: Date | null = null;

        for (const dateStr of sortedUniqueDates) {
            const [y, m, d] = dateStr.split("-").map(Number);
            const currentDate = new Date(y, m - 1, d);

            if (prevDate === null) {
                currentRun = 1;
            } else {
                const diffTime = currentDate.getTime() - prevDate.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    currentRun++;
                } else if (diffDays > 0) {
                    currentRun = 1;
                }
            }
            if (currentRun > longest) {
                longest = currentRun;
            }
            prevDate = currentDate;
        }

        // Calculate current streak
        const today = new Date();
        const todayStr = getLocalDateString(today);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);

        let current = 0;
        let hasWrittenToday = writtenDatesSet.has(todayStr);
        let activeDate: Date | null = null;

        if (hasWrittenToday) {
            activeDate = today;
        } else if (writtenDatesSet.has(yesterdayStr)) {
            activeDate = yesterday;
        }

        if (activeDate !== null) {
            current = 1;
            const checkDate = new Date(activeDate);
            while (true) {
                checkDate.setDate(checkDate.getDate() - 1);
                const checkDateStr = getLocalDateString(checkDate);
                if (writtenDatesSet.has(checkDateStr)) {
                    current++;
                } else {
                    break;
                }
            }
        }

        // Generate last 7 days
        const last7: DayActivity[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = getLocalDateString(d);
            
            let dayLabel = d.toLocaleDateString("id-ID", { weekday: "short" });
            dayLabel = dayLabel.replace(/\.$/, ""); // Clean up potential trailing period

            last7.push({
                dateStr,
                dayLabel,
                hasWritten: writtenDatesSet.has(dateStr),
                isToday: i === 0,
            });
        }

        setStats({
            currentStreak: current,
            longestStreak: longest,
            totalPosts: dates.length,
            last7Days: last7,
            hasWrittenToday,
        });
    }, [dates]);

    if (!mounted) {
        return (
            <div className={`container ${styles.skeletonContainer}`}>
                <div className={styles.skeletonHeader} />
                <div className={styles.skeletonGrid}>
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                </div>
            </div>
        );
    }

    return (
        <section className={styles.streakSection}>
            <div className={`container`}>
                <div className={styles.containerCard}>
                    <div className={styles.headerRow}>
                        <div className={styles.titleGroup}>
                            <h3 className={styles.title}>Statistik Menulis</h3>
                            <p className={styles.subtitle}>Momentum belajar dan konsistensi menulis</p>
                        </div>
                        {stats.currentStreak > 0 ? (
                            <div className={styles.activeBadge}>
                                <span className={styles.badgePulse}></span>
                                Streak Aktif
                            </div>
                        ) : (
                            <div className={styles.inactiveBadge}>
                                Belum Ada Streak
                            </div>
                        )}
                    </div>

                    <div className={styles.statsGrid}>
                        {/* Current Streak */}
                        <div className={styles.statCard}>
                            <div className={`${styles.iconContainer} ${stats.currentStreak > 0 ? styles.fireActive : styles.fireInactive}`}>
                                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                                </svg>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.currentStreak} Hari</span>
                                <span className={styles.statLabel}>Streak Saat Ini</span>
                            </div>
                        </div>

                        {/* Longest Streak */}
                        <div className={styles.statCard}>
                            <div className={`${styles.iconContainer} ${styles.trophy}`}>
                                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                    <path d="M4 22h16" />
                                    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                                    <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
                                </svg>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.longestStreak} Hari</span>
                                <span className={styles.statLabel}>Streak Terpanjang</span>
                            </div>
                        </div>

                        {/* Total TILs */}
                        <div className={styles.statCard}>
                            <div className={`${styles.iconContainer} ${styles.book}`}>
                                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                </svg>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.totalPosts} Catatan</span>
                                <span className={styles.statLabel}>Total TIL Ditulis</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.trackerSection}>
                        <h4 className={styles.trackerTitle}>Aktivitas 7 Hari Terakhir</h4>
                        <div className={styles.daysRow}>
                            {stats.last7Days.map((day) => (
                                <div 
                                    key={day.dateStr} 
                                    className={`${styles.dayCol} ${day.isToday ? styles.todayCol : ""}`}
                                >
                                    <span className={styles.dayLabel}>
                                        {day.isToday ? "Hari Ini" : day.dayLabel}
                                    </span>
                                    <div 
                                        className={`
                                            ${styles.dayBubble} 
                                            ${day.hasWritten ? styles.bubbleWritten : styles.bubbleEmpty}
                                            ${day.isToday && !day.hasWritten ? styles.bubblePulse : ""}
                                        `}
                                        title={day.isToday ? "Hari Ini" : day.dateStr}
                                    >
                                        {day.hasWritten ? (
                                            <span className={styles.bubbleFlame}>🔥</span>
                                        ) : (
                                            <span className={styles.bubbleDot}></span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.motivationalBox}>
                        <div className={styles.motivationalIcon}>💡</div>
                        <p className={styles.motivationalText}>
                            {stats.currentStreak === 0 ? (
                                <>Tulis catatan belajar pertamamu hari ini untuk memulai <strong>streak baru!</strong> 🚀</>
                            ) : stats.hasWrittenToday ? (
                                <>Hebat! Kamu telah menulis catatan hari ini. Jaga terus <strong>streak {stats.currentStreak} hari</strong> kamu! 🔥</>
                            ) : (
                                <>Kamu memiliki <strong>streak {stats.currentStreak} hari</strong> yang berakhir kemarin. Tulis catatan hari ini untuk memperpanjangnya! ⚡</>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
