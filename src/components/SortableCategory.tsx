import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from './MenuCard';
import { GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableMenuItem } from './SortableMenuItem';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface SortableCategoryProps {
  id: any;
  category: { id: number; name: string; position: number };
  items: MenuItem[];
}

export function SortableCategory({ id, category, items }: SortableCategoryProps) {
  const [menuItems, setMenuItems] = useState(items);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const { toast } = useToast();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMenuItems((currentItems) => {
        const oldIndex = currentItems.findIndex(item => item.id === active.id);
        const newIndex = currentItems.findIndex(item => item.id === over.id);
        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        const updates = newItems.map((item, index) => ({
          id: item.id,
          position: index + 1,
        }));

        supabase.from('menu_items').upsert(updates).then(({ error }) => {
          if (error) {
            toast({ title: "Error updating item order", description: error.message, variant: "destructive" });
          }
        });

        return newItems;
      });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-8">
      <div {...attributes} {...listeners} className="flex items-center justify-between mb-4 cursor-grab">
        <div className="flex items-center">
          <GripVertical />
          <h2 className="text-2xl font-bold ml-2">{category.name}</h2>
        </div>
        <Badge variant="outline">{menuItems.length} items</Badge>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={menuItems.map(i => i.id)} strategy={rectSortingStrategy}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <SortableMenuItem key={item.id} id={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
