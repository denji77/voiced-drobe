import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initNarrator, testApiKey } from '@/lib/narratorService';
import { toast } from 'sonner';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  open, 
  onOpenChange,
  onSuccess
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First verify the API key works
      const testResult = await testApiKey(apiKey);
      
      if (testResult.success) {
        // Initialize the narrator with the validated key
        const initResult = await initNarrator(apiKey);
        
        if (initResult) {
          // Store API key in session storage (not localStorage for security)
          sessionStorage.setItem('camb_api_key', apiKey);
          toast.success('API key verified and saved successfully');
          onSuccess();
          onOpenChange(false);
        } else {
          setError('Failed to initialize narrator with the provided API key');
          toast.error('Failed to initialize narrator. Please check that your account has access to voices.');
        }
      } else {
        setError(testResult.message);
        toast.error(testResult.message);
      }
    } catch (error) {
      console.error('Error initializing narrator:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Camb.ai API Key</DialogTitle>
            <DialogDescription>
              Enter your Camb.ai API key to enable the narration feature.
              Your key is stored securely in your browser's session storage.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Camb.ai API key"
              className="mt-1"
              required
              type="password"
            />
            
            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Don't have an API key? Get one from 
              <a 
                href="https://www.camb.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline ml-1 text-primary"
              >
                Camb.ai Dashboard
              </a>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Make sure your Camb.ai API key has access to the Text-to-Speech feature.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              If you're experiencing connection issues, ensure that your network allows connections
              to Camb.ai services and that your API key has the correct permissions.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Save API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
