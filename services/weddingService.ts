import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { WeddingData } from '../types';

const WEDDING_DOC_ID = 'default-wedding'; // For now, using a single document

export const saveWeddingData = async (data: WeddingData) => {
    try {
        console.log("Saving wedding data to Firestore...", data);
        const weddingRef = doc(db, 'weddings', WEDDING_DOC_ID);
        await setDoc(weddingRef, {
            ...data,
            updatedAt: Date.now()
        }, { merge: true });
        console.log("Wedding data SUCCESSFULLY saved to Firestore");
    } catch (error) {
        console.error("Error saving wedding data:", error);
        throw error;
    }
};

export const loadWeddingData = async (): Promise<WeddingData | null> => {
    try {
        const weddingRef = doc(db, 'weddings', WEDDING_DOC_ID);
        const docSnap = await getDoc(weddingRef);
        if (docSnap.exists()) {
            return docSnap.data() as WeddingData;
        }
        return null;
    } catch (error) {
        console.error("Error loading wedding data:", error);
        throw error;
    }
};

export const subscribeToWeddingData = (callback: (data: WeddingData | null) => void) => {
    const weddingRef = doc(db, 'weddings', WEDDING_DOC_ID);
    return onSnapshot(weddingRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as WeddingData);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("Firestore snapshot error:", error);
    });
};
