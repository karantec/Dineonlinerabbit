import { requireAuth, json } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';

export async function POST(req) {
  const { session, error } = await requireAuth(['owner']);
  if (error) return error;
  const file = (await req.formData()).get('file');
  if (!file || typeof file === 'string') return json({ error: 'No file' }, 400);
  if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return json({ error: 'Image up to 5MB only' }, 400);
  try {
    const res = await uploadBuffer(Buffer.from(await file.arrayBuffer()), `omnibite/${session.rid}`);
    return json({ url: res.secure_url });
  } catch (e) {
    return json({ error: 'Upload failed. Check Cloudinary env vars.' }, 500);
  }
}
