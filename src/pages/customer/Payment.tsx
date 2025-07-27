import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrderStatus } from "@/lib/db";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * MOCK BACKEND CALL: Creates a Razorpay Order.
 * In a real app, this function would be a `fetch` call to your own backend server.
 * Your server would then use the Razorpay Node.js SDK and your secret key to create a real order.
 * @param amount - The amount in the smallest currency unit (e.g., paise for INR).
 */
const createRazorpayOrderOnServer = async (amount: number) => {
  console.warn(
    "WARNING: This is a mock API call. In a real application, you must create the Razorpay order on your backend server for security reasons."
  );
  // This simulates a successful response from your server.
  // The `id` would be the real order_id from Razorpay.
  return {
    id: `order_${Math.random().toString(36).substr(2, 9)}`, // This is a FAKE order_id for demonstration
    amount: amount,
    currency: "INR",
  };
};

export default function Payment() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Made the payment handler async to await the order creation
  const handlePayment = async () => {
    const orders = getOrders();
    if (!orders || orders.length === 0) {
      toast({
        title: "Error",
        description: "No order found to pay for.",
        variant: "destructive",
      });
      return;
    }

    const order = orders[orders.length - 1];
    const totalAmount = order.items.reduce((sum, item) => sum + item.price, 0);
    const amountInPaise = totalAmount * 100;

    try {
      // --- Step 1: Create an Order ID from your server ---
      // This is where you would call your backend API.
      // e.g., const razorpayOrder = await fetch('/api/create-order', ...);
      const razorpayOrder = await createRazorpayOrderOnServer(amountInPaise);

      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error("Failed to create Razorpay order.");
      }

      // --- Step 2: Open Razorpay Checkout with the Order ID ---
      const options = {
        key: "YOUR_RAZORPAY_TEST_KEY", // IMPORTANT: Replace with your actual Test Key from the Razorpay Dashboard
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "CloudKitchen",
        description: "Order Payment",
        image: "https://example.com/your_logo.jpg",
        order_id: razorpayOrder.id, // The crucial Order ID received from your server
        handler: function (response: any) {
          toast({
            title: "Payment Successful",
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          // In a real app, you would verify the payment signature on your backend here.
          updateOrderStatus(order.id, "Confirmed");
          navigate("/order-confirmation");
        },
        prefill: {
          name: "Test Customer",
          email: "test.customer@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Test Address, Pune",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            toast({
              title: "Payment Cancelled",
              description: "You closed the payment window.",
              variant: "destructive",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast({
            title: "Payment Failed",
            description: response.error.description,
            variant: "destructive"
        });
      });

      rzp.open();

    } catch (error) {
      console.error("Payment Error:", error);
      toast({
        title: "Oops! Something went wrong.",
        description: "Could not initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const lastOrder = getOrders()?.[getOrders().length - 1];
  const displayAmount = lastOrder?.items.reduce((sum, item) => sum + item.price, 0).toFixed(2) || '0.00';

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
