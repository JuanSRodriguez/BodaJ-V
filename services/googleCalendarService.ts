import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { WeddingTask } from "../types";



export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        return credential?.accessToken;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const syncTasksToGoogleCalendar = async (tasks: WeddingTask[], accessToken: string) => {
    const tasksWithDates = tasks.filter(task => task.dueDate);

    const results = {
        total: tasksWithDates.length,
        success: 0,
        failed: 0
    };

    for (const task of tasksWithDates) {
        try {
            const event = {
                summary: `💍 Boda: ${task.title}`,
                description: task.notes || `Tarea de planificación: ${task.category}`,
                start: {
                    date: task.dueDate,
                },
                end: {
                    date: task.dueDate,
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'email', minutes: 72 * 60 }, // 3 days before
                        { method: 'popup', minutes: 60 }        // Alert 1 hour before
                    ]
                }
            };

            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });

            if (response.ok) {
                results.success++;
            } else {
                const errorData = await response.json();
                console.error("Failed to sync task:", task.title, errorData);
                results.failed++;
            }
        } catch (error) {
            console.error("Error syncing task:", task.title, error);
            results.failed++;
        }
    }

    return results;
};

export const createCalendarReminder = async (title: string, date: string, time: string, notes: string, accessToken: string) => {
    try {
        const startTime = time || "09:00";
        const [hours, minutes] = startTime.split(':').map(Number);

        // Parse 'YYYY-MM-DD' and create a Date in local time
        const [year, month, day] = date.split('-').map(Number);
        const startDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1);


        const event = {
            summary: `🔔 Recordatorio J&V: ${title}`,
            description: notes,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },

            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 10 },      // 10 minutes before
                    { method: 'email', minutes: 60 },      // 1 hour before
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 15 }
                ]
            }

        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            console.error("FAILED_TO_CREATE_REMINDER_DETAILS:", JSON.stringify(errorData, null, 2));
            return { success: false, error: errorData };
        }


    } catch (error) {
        console.error("Error creating reminder:", error);
        return { success: false, error };
    }
};

