import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/ui/navigation";
import { OrderCard, Order } from "@/components/OrderCard";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export default function ClientOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          name,
          email,
          phone_number,
          address
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching orders", description: error.message, variant: "destructive" });
    } else {
      setOrders(data as any[]);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, status: Order["payment_status"]) => {
    const { error } = await supabase.from("orders").update({ payment_status: status }).eq("id", orderId);
    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order status updated", description: `Order #${orderId} is now ${status}.` });
      fetchOrders();
    }
  };

  const upcomingOrders = orders.filter(o => o.payment_status === "pending" || o.payment_status === "confirmed");
  const pastOrders = orders.filter(o => o.payment_status === "delivered" || o.payment_status === "out for delivery");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation userType="client" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Incoming Orders
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and track customer orders in real-time
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold">Upcoming Orders</h2>
              <Badge variant="default" className="ml-4">{upcomingOrders.length}</Badge>
            </div>
            {upcomingOrders.length > 0 ? (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    userType="client"
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming orders.</p>
            )}
          </div>

          <div>
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold">Past Orders</h2>
              <Badge variant="outline" className="ml-4">{pastOrders.length}</Badge>
            </div>
            {pastOrders.length > 0 ? (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    userType="client"
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No past orders.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}