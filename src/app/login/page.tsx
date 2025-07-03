'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scissors } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [role, setRole] = useState<'owner' | 'staff'>('staff');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login(role, password);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials or Firebase setup.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
             <div className="flex justify-center items-center gap-2 mb-2">
                <div className="p-2 bg-primary rounded-lg">
                    <Scissors className="w-8 h-8 text-primary-foreground" />
                </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to Navyata Track</h1>
            <p className="text-sm text-muted-foreground">Select your role to sign in to your account</p>
          </div>
        
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
               <Select onValueChange={(value) => setRole(value as 'owner' | 'staff')} defaultValue={role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
               <p className="text-xs text-muted-foreground">This demo uses pre-configured user emails.</p>
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin} disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </div>
      </div>
    </div>
  );
}
