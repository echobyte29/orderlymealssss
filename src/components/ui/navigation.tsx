import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChefHat, Menu, ShoppingCart, LogIn, UserCircle, Settings, LogOut, LayoutDashboard, Utensils, CreditCard, ListOrdered, Bell } from "lucide-react";
import { Badge } from "./badge";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

interface NavigationProps {
  userType: 'customer' | 'client';
  cartCount?: number;
}

export const Navigation = ({ userType, cartCount = 0 }: NavigationProps) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const customerLinks = [
    { to: "/menu", text: "Menu" },
    { to: "/orders", text: "My Orders" },
  ];
  
  const clientLinks = [
    { to: "/client/dashboard", text: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/client/orders", text: "Orders", icon: <ListOrdered className="h-4 w-4" /> },
    { to: "/client/menu", text: "Menu", icon: <Utensils className="h-4 w-4" /> },
    { to: "/client/payments", text: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  ];

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user?.user_metadata.avatar_url} alt={user?.user_metadata.name} />
            <AvatarFallback>{user?.user_metadata.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const CustomerNav = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <ChefHat className="h-6 w-6" />
          <span className="font-bold">CloudKitchen</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {customerLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`
              }
            >
              {link.text}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>
          
          {user ? (
            <UserMenu />
          ) : (
            <Button asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium">
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                <ChefHat className="h-6 w-6" />
                <span>CloudKitchen</span>
              </Link>
              {customerLinks.map(link => (
                <NavLink key={link.to} to={link.to} className="hover:text-foreground">
                  {link.text}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );

  const ClientNav = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/client/dashboard" className="flex items-center space-x-2">
          <ChefHat className="h-6 w-6" />
          <span className="font-bold">Kitchen Manager</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">3</Badge>
          </Button>
          {user ? <UserMenu /> : <div />}
        </div>
      </div>
    </header>
  );

  return userType === 'customer' ? <CustomerNav /> : <ClientNav />;
};