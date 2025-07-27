import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MenuItem } from "@/components/MenuCard";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerCart() {
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // @ts-ignore
      setUser(user);
    };
    fetchUser();
    // For now, we'll use a placeholder for cart items.
    // In a real app, this would come from local storage or a user-specific cart table.
    const fetchCartItems = async () => {
      const { data } = await supabase.from("menu_items").select("*").limit(2);
      setCartItems(data as MenuItem[] || []);
    };
    fetchCartItems();
  }, []);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in to place an order.", variant: "destructive" });
      navigate('/login');
      return;
    }

    const orderSummary = {
      items: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price })),
      total: totalAmount * 1.1,
    };

    const { error } = await supabase.from('orders').insert({
      // @ts-ignore
      customer_id: user.id,
      order_summary: orderSummary,
      total_amount: orderSummary.total,
      payment_status: 'pending',
      payment_method: 'cod',
    });

    if (error) {
      toast({ title: "Order failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order placed!", description: "Your order has been placed successfully." });
      // Clear cart after successful order
      setCartItems([]);
      navigate("/order-confirmation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation userType="customer" cartCount={cartItems.length} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Your Cart
            </h1>
            <p className="text-lg text-muted-foreground">
              Review your items and proceed to checkout
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>₹{totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Taxes & Charges</p>
                    <p>₹{(totalAmount * 0.1).toFixed(2)}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>₹{(totalAmount * 1.1).toFixed(2)}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-gradient-primary" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}