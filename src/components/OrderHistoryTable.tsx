import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Order } from './OrderCard';

export function OrderHistoryTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState({ date: '', status: '', customer: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, customers (name, email, phone_number, address)`)
        .order('created_at', { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setOrders(data as any[]);
        setFilteredOrders(data as any[]);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let tempOrders = orders;
    if (filters.date) {
      tempOrders = tempOrders.filter(order => new Date(order.created_at).toLocaleDateString() === new Date(filters.date).toLocaleDateString());
    }
    if (filters.status) {
      tempOrders = tempOrders.filter(order => order.payment_status === filters.status);
    }
    if (filters.customer) {
      tempOrders = tempOrders.filter(order => order.customers.name.toLowerCase().includes(filters.customer.toLowerCase()));
    }
    setFilteredOrders(tempOrders);
  }, [filters, orders]);

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="out for delivery">Out for delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by customer"
          value={filters.customer}
          onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id.slice(-6)}</TableCell>
              <TableCell>{order.customers.name}</TableCell>
              <TableCell>{order.customers.phone_number}</TableCell>
              <TableCell>{order.customers.address}</TableCell>
              <TableCell>
                <ul>
                  {order.order_summary.items.map((item: any) => (
                    <li key={item.id}>{item.quantity}x {item.name}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>₹{order.order_summary.total.toFixed(2)}</TableCell>
              <TableCell>{order.payment_status}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
