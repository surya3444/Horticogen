import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./client";

// Upload a file under a folder and return its public download URL.
export async function uploadImage(file: File, folder: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // Ignore — object may already be gone or be an external URL.
  }
}
