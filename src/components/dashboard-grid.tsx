import * as React from "react";
import { ResponsiveGridLayout, useContainerWidth, type Layout } from "react-grid-layout";
import { GripVertical, RotateCcw, Settings2, X } from "lucide-react";

import { AddWidgetDialog } from "@/components/add-widget-dialog";
import { Button } from "@/components/ui/button";
import { useDashboardSettings, useUpdateDashboardSettings } from "@/hooks/use-dashboard-settings";
import type { WidgetLayoutItem, WidgetType } from "@/lib/api";
import { WIDGET_REGISTRY } from "@/lib/widget-registry";

const BREAKPOINTS = { lg: 1024, md: 768, sm: 0 };
const COLS = { lg: 12, md: 8, sm: 4 };
type Breakpoint = keyof typeof BREAKPOINTS;

const MIN_W = 2;
const MIN_H = 3;

function withMinSize(items: WidgetLayoutItem[]) {
  return items.map((it) => ({ ...it, minW: MIN_W, minH: MIN_H }));
}

function mergeTypes(layout: Layout, items: WidgetLayoutItem[]): WidgetLayoutItem[] {
  const typeById = new Map(items.map((it) => [it.i, it.type]));
  return layout
    .filter((l) => typeById.has(l.i))
    .map((l) => ({
      i: l.i,
      type: typeById.get(l.i)!,
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h,
    }));
}

export function DashboardGrid() {
  const { data: settings, isLoading } = useDashboardSettings();
  const updateSettings = useUpdateDashboardSettings();
  const [editMode, setEditMode] = React.useState(false);
  const { width, containerRef } = useContainerWidth();
  const breakpoint: Breakpoint =
    width > BREAKPOINTS.lg ? "lg" : width > BREAKPOINTS.md ? "md" : "sm";

  const editableBreakpoint = breakpoint !== "sm";
  const canEdit = editMode && editableBreakpoint;

  const items = settings?.layoutLg ?? [];

  // Mobile is view-only, so it doesn't need a persisted layout — stack widgets
  // single-column instead of relying on RGL's naive md-layout scaling, which
  // just reuses md's x offsets and overlaps them at a narrower column count.
  let y = 0;
  const layoutSm: WidgetLayoutItem[] = items.map((item) => {
    const entry = { i: item.i, type: item.type, x: 0, y, w: COLS.sm, h: item.h };
    y += item.h;
    return entry;
  });

  function persist(next: { layoutLg?: WidgetLayoutItem[]; layoutMd?: WidgetLayoutItem[] }) {
    updateSettings.mutate(next);
  }

  function handleStop(layout: Layout) {
    if (!editableBreakpoint || !settings) return;
    const key = breakpoint === "lg" ? "layoutLg" : "layoutMd";
    const source = breakpoint === "lg" ? settings.layoutLg : settings.layoutMd;
    persist({ [key]: mergeTypes(layout, source) });
  }

  function handleAdd(type: WidgetType) {
    if (!settings) return;
    const def = WIDGET_REGISTRY[type];
    const id = `${type}-${Date.now().toString(36)}`;
    const lgItem: WidgetLayoutItem = {
      i: id,
      type,
      x: 0,
      y: Infinity,
      w: def.defaultSize.w,
      h: def.defaultSize.h,
    };
    const mdItem: WidgetLayoutItem = {
      i: id,
      type,
      x: 0,
      y: Infinity,
      w: Math.min(def.defaultSize.w, COLS.md),
      h: def.defaultSize.h,
    };
    persist({
      layoutLg: [...settings.layoutLg, lgItem],
      layoutMd: [...settings.layoutMd, mdItem],
    });
  }

  function handleRemove(id: string) {
    if (!settings) return;
    persist({
      layoutLg: settings.layoutLg.filter((it) => it.i !== id),
      layoutMd: settings.layoutMd.filter((it) => it.i !== id),
    });
  }

  function handleReset() {
    updateSettings.mutate({ reset: true });
  }

  return (
    <div ref={containerRef}>
      {isLoading || !settings ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
            {editMode && (
              <>
                <AddWidgetDialog onAdd={handleAdd} />
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="size-4" /> Reset to default
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode((e) => !e)}
            >
              <Settings2 className="size-4" /> {editMode ? "Done" : "Customize"}
            </Button>
          </div>

          {editMode && !editableBreakpoint && (
            <p className="mb-3 text-sm text-muted-foreground">
              Layout editing is available on tablet and desktop screens.
            </p>
          )}

          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Your dashboard is empty.{" "}
              {editMode ? "Add a widget to get started." : "Click Customize to add widgets."}
            </p>
          ) : (
            <ResponsiveGridLayout
              width={width}
              className="layout"
              layouts={{
                lg: withMinSize(settings.layoutLg),
                md: withMinSize(settings.layoutMd),
                sm: layoutSm,
              }}
              breakpoints={BREAKPOINTS}
              cols={COLS}
              rowHeight={40}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              dragConfig={{ enabled: canEdit, handle: ".widget-drag-handle" }}
              resizeConfig={{ enabled: canEdit }}
              onDragStop={handleStop}
              onResizeStop={handleStop}
            >
              {items.map((item) => {
                const def = WIDGET_REGISTRY[item.type];
                if (!def) return null;
                const Widget = def.Component;
                return (
                  <div key={item.i} className="relative h-full">
                    {canEdit && (
                      <span className="widget-drag-handle absolute -top-2 left-3 z-10 flex size-6 cursor-move items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
                        <GripVertical className="size-3.5" />
                      </span>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        aria-label="Remove widget"
                        onClick={() => handleRemove(item.i)}
                        className="absolute -top-2 right-3 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                    <div className="h-full">
                      <Widget />
                    </div>
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          )}
        </>
      )}
    </div>
  );
}
