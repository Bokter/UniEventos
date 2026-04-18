import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { setCurrentUser, mockUsers, UserRole } from "../data/mockData";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Sign in state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<UserRole>("Attendee");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // For demo purposes, let user sign in as any mock user
      const user = mockUsers.find(u => u.email === signInEmail);
      
      if (user) {
        setCurrentUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        
        if (user.role === 'Admin') {
          navigate("/admin");
        } else if (user.role === 'Organizer') {
          navigate("/organizer/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Invalid email or password");
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerEmail.endsWith("@university.edu")) {
      toast.error("Please use your institutional email (@university.edu)");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (registerPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: String(mockUsers.length + 1),
        name: registerName,
        email: registerEmail,
        role: registerRole,
      };

      mockUsers.push(newUser);
      setCurrentUser(newUser);
      
      toast.success("Account created successfully!");
      
      if (newUser.role === 'Organizer') {
        navigate("/organizer/dashboard");
      } else {
        navigate("/");
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />
      
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>Welcome to UniEventos</h1>
          <p className="text-muted-foreground">
            Sign in or create an account to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Access your account</CardTitle>
            <CardDescription>
              Use your institutional email to access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="register">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Institutional Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@university.edu"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-accent hover:underline"
                      onClick={() => toast.info("Password reset not implemented in demo")}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="mb-2" style={{ fontWeight: 600 }}>Demo Accounts:</p>
                    <p className="text-xs text-muted-foreground">
                      Organizer: sarah.johnson@university.edu<br />
                      Admin: admin@university.edu<br />
                      (Any password works)
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Institutional Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@university.edu"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must end with @university.edu
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-role">Role</Label>
                    <Select value={registerRole} onValueChange={(value) => setRegisterRole(value as UserRole)}>
                      <SelectTrigger id="register-role" className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Attendee">Attendee</SelectItem>
                        <SelectItem value="Organizer">Organizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={8}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#1D9E75] hover:bg-[#188c66]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-accent hover:underline">
            Continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
