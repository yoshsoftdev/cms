"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { NavigationTreeNode } from "@/lib/types";
import { cn } from "@/lib/utils";

function SortableRow({
  node,
  renderActions,
}: {
  node: NavigationTreeNode;
  renderActions: (node: NavigationTreeNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: 0,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-center gap-2 rounded-md border bg-white px-3 py-2", isDragging && "opacity-70 shadow-md")}>
      <button type="button" className="cursor-grab touch-none text-neutral-400 hover:text-neutral-700" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{node.label}</div>
        <div className="truncate text-xs text-neutral-500">{node.url}</div>
      </div>
      <div className="flex shrink-0 gap-1">{renderActions(node)}</div>

    </div>
  );
}

/** Hanya mengurutkan akar pohon dalam satu lokasi (sesuai API reorder). Anak tetap ditampilkan nested (tanpa drag). */
export function NavLocationReorder({
  roots,
  locationLabel,
  onReorder,
  renderActions,
}: {
  roots: NavigationTreeNode[];
  locationLabel: string;
  onReorder: (orderedRootIds: string[]) => void;
  renderActions: (node: NavigationTreeNode) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = roots.map((r) => r.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(ids, oldIndex, newIndex);
    onReorder(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{locationLabel}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={roots.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {roots.map((root) => (
              <div key={root.id} className="space-y-2">
                <SortableRow node={root} renderActions={renderActions} />
                {root.children?.length ? (
                  <NestedChildren nodes={root.children} renderActions={renderActions} />
                ) : null}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function NestedChildren({
  nodes,
  depth = 1,
  renderActions,
}: {
  nodes: NavigationTreeNode[];
  depth?: number;
  renderActions: (node: NavigationTreeNode) => ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-l border-neutral-200 pl-3">
      {nodes.map((node) => (
        <div key={node.id} style={{ marginLeft: (depth - 1) * 8 }}>
          <div className="flex items-start justify-between gap-2 rounded-md border bg-neutral-50 px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{node.label}</div>
              <div className="truncate text-xs text-neutral-500">{node.url}</div>
            </div>
            <div className="flex shrink-0 gap-1">{renderActions(node)}</div>
          </div>
          {node.children?.length ? (
            <NestedChildren nodes={node.children} depth={depth + 1} renderActions={renderActions} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
