import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ZoomIn, Check, X } from "lucide-react";

// Crop manual dengan bingkai rasio tetap. Gambar bisa digeser (drag)
// dan diperbesar (zoom). Hasilnya berupa File JPEG yang sudah terpotong.
export default function ImageCropper({
  file,
  aspect = 16 / 9,
  outputWidth = 1280,
  onCancel,
  onDone,
}) {
  const stageRef = useRef(null);
  const drag = useRef(null);

  const [src, setSrc] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  // Muat file ke URL sementara
  useEffect(() => {
    const url = URL.createObjectURL(file);

    setSrc(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Ukur ukuran stage (ikut berubah saat jendela diubah)
  useLayoutEffect(() => {
    const el = stageRef.current;

    if (!el) return;

    const measure = () => {
      setStage({ w: el.clientWidth, h: el.clientHeight });
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Bingkai crop: 86% dari stage, tetap pada rasio yang diminta
  const frame = useMemo(() => {
    if (!stage.w || !stage.h) return { x: 0, y: 0, w: 0, h: 0 };

    let w = stage.w * 0.86;
    let h = w / aspect;
    const maxH = stage.h * 0.86;

    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }

    return {
      x: (stage.w - w) / 2,
      y: (stage.h - h) / 2,
      w,
      h,
    };
  }, [stage, aspect]);

  // Skala dasar: gambar menutupi bingkai penuh
  const baseScale =
    natural.w && frame.w ? Math.max(frame.w / natural.w, frame.h / natural.h) : 1;

  const scale = baseScale * zoom;
  const displayW = natural.w * scale;
  const displayH = natural.h * scale;

  // Posisi gambar (kiri-atas) di dalam stage
  const imgLeft = (stage.w - displayW) / 2 + offset.x;
  const imgTop = (stage.h - displayH) / 2 + offset.y;

  // Batas geser: bingkai tidak boleh keluar dari gambar
  const clampOffset = (x, y, z) => {
    const s = baseScale * z;
    const dW = natural.w * s;
    const dH = natural.h * s;

    const minX = frame.x + frame.w - dW - (stage.w - dW) / 2;
    const maxX = frame.x - (stage.w - dW) / 2;
    const minY = frame.y + frame.h - dH - (stage.h - dH) / 2;
    const maxY = frame.y - (stage.h - dH) / 2;

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  };

  // Saat zoom berubah, jaga posisi tetap valid
  const changeZoom = (z) => {
    setZoom(z);
    setOffset((prev) => clampOffset(prev.x, prev.y, z));
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);

    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;

    const x = drag.current.ox + (e.clientX - drag.current.startX);
    const y = drag.current.oy + (e.clientY - drag.current.startY);

    setOffset(clampOffset(x, y, zoom));
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const terapkan = () => {
    if (!src || !natural.w || processing) return;

    setProcessing(true);

    const img = new Image();

    img.onload = () => {
      // Bagian gambar yang berada di dalam bingkai, dalam piksel asli
      const sx = (frame.x - imgLeft) / scale;
      const sy = (frame.y - imgTop) / scale;
      const sw = frame.w / scale;
      const sh = frame.h / scale;

      const outW = outputWidth;
      const outH = Math.round(outputWidth / aspect);

      const canvas = document.createElement("canvas");

      canvas.width = outW;
      canvas.height = outH;

      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      canvas.toBlob(
        (blob) => {
          setProcessing(false);

          if (!blob) return;

          const nama = file.name.replace(/\.[^.]+$/, "") + "-crop.jpg";

          onDone(new File([blob], nama, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9,
      );
    };

    img.onerror = () => setProcessing(false);
    img.src = src;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Atur bagian foto</p>

        <p className="text-xs text-gray-500">Geser gambar dan atur zoom</p>
      </div>

      {/* STAGE */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative aspect-video w-full touch-none select-none overflow-hidden rounded-xl bg-gray-900 cursor-grab active:cursor-grabbing"
      >
        {src && (
          <img
            src={src}
            alt=""
            draggable={false}
            onLoad={(e) =>
              setNatural({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              })
            }
            style={{
              position: "absolute",
              left: imgLeft,
              top: imgTop,
              width: displayW,
              height: displayH,
              maxWidth: "none",
            }}
            className="pointer-events-none"
          />
        )}

        {/* GELAPKAN DI LUAR BINGKAI */}
        {frame.w > 0 && (
          <div
            className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            style={{
              left: frame.x,
              top: frame.y,
              width: frame.w,
              height: frame.h,
            }}
          />
        )}
      </div>

      {/* ZOOM */}
      <label className="flex items-center gap-3 text-sm text-gray-600">
        <ZoomIn size={18} className="shrink-0 text-gray-500" />

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => changeZoom(Number(e.target.value))}
          className="w-full accent-green-600"
          aria-label="Zoom"
        />
      </label>

      {/* AKSI */}
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <X size={16} />
          Batal
        </button>

        <button
          type="button"
          onClick={terapkan}
          disabled={processing || !natural.w}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:opacity-60"
        >
          <Check size={16} />
          {processing ? "Memproses..." : "Terapkan crop"}
        </button>
      </div>
    </div>
  );
}
