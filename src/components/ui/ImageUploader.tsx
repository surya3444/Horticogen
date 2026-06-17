"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/firebase/storage";
import { useToast } from "./Toast";
import { cn } from "@/lib/utils";

// Single image uploader. Stores/returns a download URL.
export function ImageUploader({
  value,
  onChange,
  folder,
  label,
  aspect = "aspect-square",
}: {
  value?: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  aspect?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (e) {
      console.error(e);
      toast("Upload failed. Check Storage rules & Blaze plan.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink">{label}</label>}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-dashed border-sand bg-cream",
          aspect
        )}
      >
        {value ? (
          <>
            <Image src={value} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 rounded-full bg-ink/70 p-1 text-white hover:bg-ink"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 text-muted hover:text-terracotta-600">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <UploadCloud className="h-7 w-7" />
                <span className="text-xs font-medium">Click to upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}

// Multiple image uploader for product galleries.
export function MultiImageUploader({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => uploadImage(f, folder))
      );
      onChange([...value, ...urls]);
    } catch (e) {
      console.error(e);
      toast("Upload failed. Check Storage rules & Blaze plan.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-xl border border-sand">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute right-1.5 top-1.5 rounded-full bg-ink/70 p-1 text-white hover:bg-ink"
            >
              <X size={13} />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-leaf-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Cover
              </span>
            )}
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-sand bg-cream text-muted hover:text-terracotta-600">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <UploadCloud className="h-5 w-5" />
              <span className="text-[10px]">Add</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
