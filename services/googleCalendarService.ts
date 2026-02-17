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
                    useDefault: true
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
