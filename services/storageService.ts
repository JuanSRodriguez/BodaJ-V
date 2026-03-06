import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a file to Firebase Storage and returns its download URL.
 * @param file The file to upload
 * @param path The path in storage (e.g., 'profile/couple.jpg')
 * @returns Promise with the download URL
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("File uploaded successfully, URL:", downloadURL);
        return downloadURL;
    } catch (error: any) {
        console.error("Firebase Storage Error Code:", error.code);
        console.error("Firebase Storage Error Message:", error.message);
        console.error("Full Error Object:", JSON.stringify(error, null, 2));
        throw error;
    }

};
