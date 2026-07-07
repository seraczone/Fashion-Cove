import { supabase } from "@/lib/supabase/client";

export const storageBuckets = {
  productMedia: "product-media",
  cmsMedia: "cms-media",
  adminImports: "admin-imports",
} as const;

export type StorageBucket = (typeof storageBuckets)[keyof typeof storageBuckets];

export async function uploadAdminFile(bucket: StorageBucket, path: string, file: File): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;

  if (bucket === storageBuckets.adminImports) return data.path;

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl.publicUrl;
}

export async function removeAdminFile(bucket: StorageBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
