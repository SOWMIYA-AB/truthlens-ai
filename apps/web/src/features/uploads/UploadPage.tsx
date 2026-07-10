import { ChangeEvent, DragEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { uploadImage } from '../../services/uploadApi';
import type { ImageUploadResponse } from '../../types/upload';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

function validateImage(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Use a JPG, JPEG, PNG, or WEBP image.';
  }

  if (file.size > MAX_SIZE_BYTES) {
    return 'Image must be 20 MB or smaller.';
  }

  return '';
}

export function UploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<ImageUploadResponse | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function selectFile(selectedFile: File | undefined) {
    setError('');
    setSuccess('');
    setUploadedImage(null);
    setProgress(0);

    if (!selectedFile) {
      return;
    }

    const validationError = validateImage(selectedFile);
    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setFile(selectedFile);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError('Choose an image before uploading.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setProgress(0);

    try {
      const response = await uploadImage(file, setProgress);
      setUploadedImage(response);
      setSuccess('Image uploaded successfully.');
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function clearSelection() {
    setFile(null);
    setUploadedImage(null);
    setSuccess('');
    setError('');
    setProgress(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal">Milestone 3 Part 1</p>
        <h1 className="mt-2 text-4xl font-bold">Image Upload</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Upload JPG, JPEG, PNG, or WEBP images for secure storage. Analysis modules are not enabled yet.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
          <label
            className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-signal hover:bg-blue-50"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-white text-signal shadow-sm">
              <UploadCloud size={28} aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">Drag and drop an image</h2>
            <p className="mt-2 text-sm text-slate-600">or browse from your device. Maximum size is 20 MB.</p>
            <span className="mt-5 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white">Browse image</span>
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
            />
          </label>

          {file && (
            <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="mt-1 text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                aria-label="Clear selected image"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          )}

          {uploading && (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm font-medium text-slate-600">
                <span>Uploading</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {success && <p className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            disabled={uploading || !file}
            className="mt-6 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload image'}
          </button>
        </form>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-ink">
              <ImagePlus size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Preview</h2>
              <p className="text-sm text-slate-500">Selected and uploaded image preview.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {previewUrl || uploadedImage ? (
              <img
                className="aspect-[4/3] w-full object-contain"
                src={uploadedImage?.imageUrl ?? previewUrl}
                alt={uploadedImage?.filename ?? file?.name ?? 'Selected upload'}
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center px-6 text-center text-sm text-slate-500">
                No image selected yet.
              </div>
            )}
          </div>

          {uploadedImage && (
            <div className="mt-5 space-y-3 rounded-lg border border-slate-200 p-4 text-sm">
              <div>
                <p className="font-semibold text-ink">Image ID</p>
                <p className="mt-1 break-all text-slate-600">{uploadedImage.id}</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Stored filename</p>
                <p className="mt-1 break-all text-slate-600">{uploadedImage.filename}</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Uploaded</p>
                <p className="mt-1 text-slate-600">{new Date(uploadedImage.uploadedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

