import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle, Truck, Package, User } from "lucide-react";
import { MenuItem } from "./MenuCard";

export type OrderStatus = "pending" | "confirmed" | "out for delivery" | "delivered";

export interface Order {
  id: string;
  created_at: string;
  order_summary: {
    items: Partial<MenuItem>[];
    total: number;
  };
  payment_status: OrderStatus;
  customers: {
    name: string;
    email: string;
    phone_number: string;
    address: string;
  };
}
interface OrderCardProps {
  order: Order;
  userType: "client" | "customer";
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

const statusDetails: Record<OrderStatus, { icon: JSX.Element, color: string, text: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: "bg-yellow-500", text: "Pending" },
  confirmed: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-blue-500", text: "Confirmed" },
  "out for delivery": { icon: <Truck className="h-4 w-4" />, color: "bg-purple-500", text: "Out for Delivery" },
  delivered: { icon: <Package className="h-4 w-4" />, color: "bg-green-500", text: "Delivered" },
};

export function OrderCard({ order, userType, onStatusChange }: OrderCardProps) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Order #{order.id.slice(-6)}</CardTitle>
          <Badge variant="default" className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${statusDetails[order.payment_status].color}`} />
            {statusDetails[order.payment_status].text}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {order.customers && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <p className="font-semibold">{order.customers.name}</p>
            </div>
          )}
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            {order.order_summary.items.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="font-bold text-lg">₹{order.order_summary.total.toFixed(2)}</p>
        {userType === "client" && onStatusChange && (
          <Select
            value={order.payment_status}
            onValueChange={(value: OrderStatus) => onStatusChange(order.id, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(statusDetails).map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardFooter>
    </Card>
  );
}