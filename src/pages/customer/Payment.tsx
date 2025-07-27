import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function Payment() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order);

  const handleCashOnDelivery = async () => {
    if (!order) {
        toast({ title: "Error", description: "No order found.", variant: "destructive" });
        return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'confirmed' })
      .eq('id', order.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Order confirmed for Cash on Delivery." });
      navigate("/order-confirmation", { state: { order } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation userType="customer" />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Payment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete your order by making a payment.
          </p>
        </div>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">Amount to pay</p>
                <p className="text-2xl font-bold">₹{displayAmount}</p>
              </div>
              <Button className="w-full bg-gradient-primary" onClick={handlePayment}>
                Pay with Razorpay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
