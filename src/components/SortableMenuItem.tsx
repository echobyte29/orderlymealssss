import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from './MenuCard';
import { GripVertical } from 'lucide-react';

interface SortableMenuItemProps {
  id: any;
  item: MenuItem;
}

export function SortableMenuItem({ id, item }: SortableMenuItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="shadow-card group cursor-grab">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{item.name}</h3>
            <GripVertical />
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-primary">₹{item.price}</span>
            <Badge variant={item.isVeg ? 'secondary' : 'destructive'}>
              {item.isVeg ? '🌱' : '🍖'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
