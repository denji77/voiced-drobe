import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, Info, AlertCircle, ServerOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { loginUser, testConnection } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Define server status type
type ServerStatus = 'loading' | 'online' | 'offline';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('loading');
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check server connection on component mount
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        await testConnection();
        setServerStatus('online');
      } catch (error) {
        console.error('Server connection test failed:', error);
        setServerStatus('offline');
        setLoginError('Cannot connect to the server. Please make sure the backend is running.');
      }
    };
    
    checkServerConnection();
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Don't try to login if server is offline
    if (serverStatus === 'offline') {
      setLoginError('Cannot connect to the server. Please make sure the backend is running.');
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Cannot connect to the server. Please make sure the backend is running.',
      });
      return;
    }
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      console.log('Submitting login form with username:', data.username);
      const response = await loginUser(data.username, data.password);
      
      // Save auth info to localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast({
        title: 'Login successful',
        description: 'Welcome to the admin dashboard',
      });
      
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Login failed. Please check your credentials.');
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry server connection
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setServerStatus('loading');
    setLoginError(null);
    
    try {
      await testConnection();
      setServerStatus('online');
      toast({
        title: 'Connection restored',
        description: 'Successfully connected to the server.',
      });
    } catch (error) {
      setServerStatus('offline');
      setLoginError('Cannot connect to the server. Please make sure the backend is running.');
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: 'Still cannot connect to the server. Please check if the backend is running.',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  // Determine button text based on server status
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Logging in...
        </span>
      );
    }
    
    switch (serverStatus) {
      case 'loading':
        return (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Checking server connection...
          </span>
        );
      case 'offline':
        return (
          <span className="flex items-center gap-2">
            <ServerOff className="h-4 w-4" />
            Server Offline
          </span>
        );
      case 'online':
        return (
          <span className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </span>
        );
      default:
        return 'Login';
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        
        {serverStatus === 'offline' && (
          <div className="px-6 pb-2">
            <Alert variant="destructive">
              <ServerOff className="h-4 w-4" />
              <AlertTitle>Server Offline</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>Cannot connect to the backend server. Please make sure it's running at http://localhost:3001</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Checking connection...
                    </span>
                  ) : (
                    'Retry Connection'
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {loginError && serverStatus !== 'offline' && (
          <div className="px-6 pb-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        disabled={isLoading || serverStatus === 'offline'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...field}
                          disabled={isLoading || serverStatus === 'offline'}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading || serverStatus === 'offline'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'Hide password' : 'Show password'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || serverStatus !== 'online'}
              >
                {getButtonContent()}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 