"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GripVertical, ImageIcon, Loader2, Star } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reorderImagesAction } from "@/app/_actions/properties";
import { cn } from "@/lib/utils";

export type ReorderableImage = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
};

export function ImageReorderDialog({
  propertyId,
  images,
  size = "default",
}: {
  propertyId: string;
  images: ReorderableImage[];
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [order, setOrder] = React.useState<ReorderableImage[]>(images);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setOrder(images);
  }, [open, images]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await reorderImagesAction({
        propertyId,
        orderedImageIds: order.map((i) => i.id),
      });
      if (!res?.ok) throw new Error("No se pudo guardar el orden");
      toast.success("Orden actualizado");
      setOpen(false);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (images.length === 0) return null;

  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={() => setOpen(true)}
        disabled={images.length < 2}
        title={
          images.length < 2
            ? "Necesitas al menos 2 imágenes para reordenar"
            : undefined
        }
      >
        <ImageIcon className="h-4 w-4" /> Reordenar fotos
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (saving) return;
          setOpen(v);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reordenar fotos</DialogTitle>
            <DialogDescription>
              Arrastra para cambiar el orden. La primera foto será la portada.
            </DialogDescription>
          </DialogHeader>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={order.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                {order.map((img, i) => (
                  <SortableImageRow
                    key={img.id}
                    image={img}
                    index={i}
                    disabled={saving}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando…
                </>
              ) : (
                "Guardar orden"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SortableImageRow({
  image,
  index,
  disabled,
}: {
  image: ReorderableImage;
  index: number;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-elevated p-2",
        isDragging && "z-10 opacity-60 shadow-lg",
      )}
    >
      <button
        type="button"
        className={cn(
          "flex h-10 w-6 shrink-0 items-center justify-center rounded text-muted-foreground",
          disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing hover:text-foreground",
        )}
        {...attributes}
        {...listeners}
        aria-label="Mover"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-border bg-bg">
        <img
          src={image.thumbnailUrl ?? image.url}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          {index === 0 && <Star className="h-3.5 w-3.5 text-gold" />}
          Foto {index + 1}
          {index === 0 && <span className="text-[10px] text-gold">· Portada</span>}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{image.url}</p>
      </div>
    </li>
  );
}
