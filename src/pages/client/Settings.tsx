import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Bell, 
  Webhook, 
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function ClientSettings() {
  const [kitchenInfo, setKitchenInfo] = useState({
    name: "CloudKitchen Demo",
    description: "Premium cloud kitchen serving delicious meals",
    address: "123 Kitchen Street, Bangalore, Karnataka 560001",
    phone: "+91-98765-43210",
    email: "kitchen@cloudkitchen.com",
    website: "https://cloudkitchen.com"
  });

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: "09:00", close: "22:00", isOpen: true },
    tuesday: { open: "09:00", close: "22:00", isOpen: true },
    wednesday: { open: "09:00", close: "22:00", isOpen: true },
    thursday: { open: "09:00", close: "22:00", isOpen: true },
    friday: { open: "09:00", close: "22:00", isOpen: true },
    saturday: { open: "09:00", close: "23:00", isOpen: true },
    sunday: { open: "10:00", close: "21:00", isOpen: true }
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    payments: true,
    lowStock: true,
    dailyReports: false
  });

  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) {
        toast({ title: "Error fetching settings", description: error.message, variant: "destructive" });
      } else {
        const keyId = data.find(s => s.key === 'razorpay_key_id')?.value;
        const keySecret = data.find(s => s.key === 'razorpay_key_secret')?.value;
        if (keyId) setRazorpayKeyId(keyId as string);
        if (keySecret) setRazorpayKeySecret(keySecret as string);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSaveKitchenInfo = () => {
    toast({
      title: "Kitchen information updated",
      description: "Your kitchen details have been saved successfully.",
    });
  };

  const handleSaveOperatingHours = () => {
    toast({
      title: "Operating hours updated",
      description: "Your business hours have been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated.",
    });
  };

  const handleSaveRazorpayKeys = async () => {
    const { error } = await supabase.from("settings").upsert([
      { key: 'razorpay_key_id', value: razorpayKeyId },
      { key: 'razorpay_key_secret', value: razorpayKeySecret }
    ], { onConflict: 'key' });

    if (error) {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved successfully" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation userType="client" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          Kitchen Settings
        </h1>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Store className="h-5 w-5" />
                  <span>Kitchen Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kitchenName">Kitchen Name</Label>
                    <Input
                      id="kitchenName"
                      value={kitchenInfo.name}
                      onChange={(e) => setKitchenInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={kitchenInfo.phone}
                      onChange={(e) => setKitchenInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={kitchenInfo.email}
                      onChange={(e) => setKitchenInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={kitchenInfo.website}
                      onChange={(e) => setKitchenInfo(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={kitchenInfo.description}
                    onChange={(e) => setKitchenInfo(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={kitchenInfo.address}
                    onChange={(e) => setKitchenInfo(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleSaveKitchenInfo} className="bg-gradient-primary">
                  Save Kitchen Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Operating Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-20">
                        <span className="font-medium capitalize">{day}</span>
                      </div>
                      <Switch
                        checked={hours.isOpen}
                        onCheckedChange={(checked) =>
                          setOperatingHours(prev => ({
                            ...prev,
                            [day]: { ...hours, isOpen: checked }
                          }))
                        }
                      />
                    </div>
                    
                    {hours.isOpen ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            setOperatingHours(prev => ({
                              ...prev,
                              [day]: { ...hours, open: e.target.value }
                            }))
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            setOperatingHours(prev => ({
                              ...prev,
                              [day]: { ...hours, close: e.target.value }
                            }))
                          }
                          className="w-32"
                        />
                      </div>
                    ) : (
                      <Badge variant="outline">Closed</Badge>
                    )}
                  </div>
                ))}
                
                <Button onClick={handleSaveOperatingHours} className="bg-gradient-primary">
                  Save Operating Hours
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'newOrders' && 'Get notified when new orders are placed'}
                        {key === 'orderUpdates' && 'Receive updates when order status changes'}
                        {key === 'payments' && 'Get alerts for payment confirmations and failures'}
                        {key === 'lowStock' && 'Alert when menu items go out of stock'}
                        {key === 'dailyReports' && 'Receive daily summary reports via email'}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
                
                <Button onClick={handleSaveNotifications} className="bg-gradient-primary">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Webhook className="h-5 w-5" />
                  <span>Razorpay Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="razorpay-key-id">Key ID</Label>
                  <Input
                    id="razorpay-key-id"
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="razorpay-key-secret">Key Secret</Label>
                  <Input
                    id="razorpay-key-secret"
                    type="password"
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveRazorpayKeys}>Save Razorpay Keys</Button>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Webhook Payload Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Order Event Payload</h4>
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "client_name": "CloudKitchen Demo",
  "order_id": "ord_001",
  "customer_name": "John Doe",
  "phone": "+91-98765-43210",
  "address": "123 MG Road, Bangalore",
  "order": ["2x Butter Chicken", "4x Naan"],
  "payment_status": "success",
  "transaction_id": "rzp_test_123456",
  "priority": 1,
  "status": "pending",
  "timestamp": "2024-01-20T14:30:00Z"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}