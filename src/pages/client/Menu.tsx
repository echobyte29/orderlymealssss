import { useState, useEffect, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/components/MenuCard";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { SortableCategory } from "@/components/SortableCategory";

interface Category {
  id: number;
  name: string;
  position: number;
}

export default function ClientMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image: "",
    available: true,
    isVeg: true
  });
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("*").order("position");
    if (error) {
      toast({ title: "Error fetching categories", description: error.message, variant: "destructive" });
    } else {
      setCategories(data as Category[]);
    }
  }, [toast]);

  const fetchMenuItems = useCallback(async () => {
    const { data, error } = await supabase.from("menu_items").select("*").order("position");
    if (error) {
      toast({ title: "Error fetching menu", description: error.message, variant: "destructive" });
    } else {
      setMenuItems(data as MenuItem[]);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, [fetchCategories, fetchMenuItems]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      image: "",
      available: true,
      isVeg: true
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category_id: item.category_id,
        image: item.image || "",
        available: item.available,
        isVeg: item.isVeg || false
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category_id) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const itemData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image: formData.image || "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
      available: formData.available,
      is_veg: formData.isVeg,
    };

    if (editingItem) {
      const { error } = await supabase.from("menu_items").update(itemData).eq("id", editingItem.id);
      if (error) {
        toast({ title: "Error updating item", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Item updated", description: `${itemData.name} has been updated.` });
        fetchMenuItems();
      }
    } else {
      const { error } = await supabase.from("menu_items").insert(itemData);
      if (error) {
        toast({ title: "Error adding item", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Item added", description: `${itemData.name} has been added to the menu.` });
        fetchMenuItems();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
    if (error) {
      toast({ title: "Error deleting item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item deleted", description: "The item has been removed from the menu." });
      fetchMenuItems();
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id);
    if (error) {
      toast({ title: "Error updating availability", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: `Item ${!item.available ? 'enabled' : 'disabled'}`,
        description: `${item.name} is now ${!item.available ? 'available' : 'unavailable'}.`,
      });
      fetchMenuItems();
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        const updates = newItems.map((item, index) => ({
          id: item.id,
          position: index + 1,
        }));

        supabase.from('categories').upsert(updates).then(({ error }) => {
          if (error) {
            toast({ title: "Error updating order", description: error.message, variant: "destructive" });
          }
        });

        return newItems;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation userType="client" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Menu Editor
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your restaurant menu items
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Butter Chicken"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="299"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the dish..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="available">Available</Label>
                      <Switch
                        id="available"
                        checked={formData.available}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isVeg">Vegetarian</Label>
                      <Switch
                        id="isVeg"
                        checked={formData.isVeg}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVeg: checked }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveItem} className="w-full bg-gradient-primary">
                    {editingItem ? "Update Item" : "Add Item"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Menu Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{menuItems.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{menuItems.filter(item => item.available).length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{menuItems.filter(item => !item.available).length}</div>
              <div className="text-sm text-muted-foreground">Out of Stock</div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {categories.map((category) => {
              const categoryItems = menuItems.filter(item => item.category_id === category.id);
              return (
                <SortableCategory key={category.id} id={category.id} category={category} items={categoryItems} />
              );
            })}
          </SortableContext>
        </DndContext>

        {menuItems.length === 0 && (
          <Card className="shadow-card text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">No menu items yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your menu by adding your first dish.
              </p>
              <Button onClick={() => handleOpenDialog()} className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}