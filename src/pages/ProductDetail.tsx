import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '@/lib/productGenerator';
import { fetchProductById } from '@/lib/api';
import Header from '@/components/Header';
import Narrator from '@/components/Narrator';
import ApiKeyModal from '@/components/ApiKeyModal';
import { isNarratorInitialized, initNarrator } from '@/lib/narratorService';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Product } from '@/lib/productGenerator';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [narratorEnabled, setNarratorEnabled] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Try to get product from backend first
        const backendProduct = await fetchProductById(id);
        
        if (backendProduct) {
          setProduct(backendProduct);
          // Set first available size as default if product is in stock
          if (backendProduct.inStock && backendProduct.sizes.length > 0) {
            setSelectedSize(backendProduct.sizes[0]);
          }
        } else {
          // Fallback to local storage
          const localProduct = getProductById(id);
          if (localProduct) {
            setProduct(localProduct);
            if (localProduct.inStock && localProduct.sizes.length > 0) {
              setSelectedSize(localProduct.sizes[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
        // Fallback to local storage on error
        const localProduct = getProductById(id);
        if (localProduct) {
          setProduct(localProduct);
          if (localProduct.inStock && localProduct.sizes.length > 0) {
            setSelectedSize(localProduct.sizes[0]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProduct();
    
    // Check for stored API key and initialize narrator
    const apiKey = sessionStorage.getItem('camb_api_key');
    if (apiKey) {
      // Initialize narrator is now async
      const initializeNarrator = async () => {
        try {
          const success = await initNarrator(apiKey);
          setNarratorEnabled(success);
        } catch (error) {
          console.error('Failed to initialize narrator:', error);
        }
      };
      
      initializeNarrator();
    }
  }, [id]);

  const toggleNarrator = () => {
    if (narratorEnabled) {
      setNarratorEnabled(false);
    } else {
      if (isNarratorInitialized()) {
        setNarratorEnabled(true);
      } else {
        setIsApiKeyModalOpen(true);
      }
    }
  };

  const handleApiKeySuccess = () => {
    setNarratorEnabled(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Product not found</h1>
          <Button onClick={() => navigate('/')}>Return to homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header 
        narratorEnabled={narratorEnabled}
        toggleNarrator={toggleNarrator}
        showApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 hover:translate-x-1 transition-transform duration-300"
        >
          <ArrowLeft size={16} />
          Back to all products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-500 hover:shadow-xl animate-fade-in">
            <div className="aspect-square w-full relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">Out of Stock</Badge>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="space-y-6 animate-slide-up">
            <div>
              <Badge variant="outline" className="mb-3 hover:bg-primary hover:text-white transition-colors duration-300">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-2 relative group dark:text-white">
                {product.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </h1>
              <div className="flex items-center gap-1 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`transition-all duration-300 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} hover:scale-110`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground dark:text-gray-400">{product.rating}/5</span>
              </div>
              <p className="text-2xl font-semibold mb-4 transition-all duration-300 hover:text-primary dark:text-white">${product.price.toFixed(2)}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-medium mb-3 dark:text-white">Select Size</h3>
              <RadioGroup
                value={selectedSize || ""}
                onValueChange={setSelectedSize}
                disabled={!product.inStock}
                className="grid grid-cols-4 sm:grid-cols-6 gap-2"
              >
                {product.sizes.map((size: string, index: number) => (
                  <div key={size} className="flex items-center" style={{ animationDelay: `${index * 50}ms` }}>
                    <RadioGroupItem
                      value={size}
                      id={`size-${size}`}
                      className="peer sr-only"
                      disabled={!product.inStock}
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className={`flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-muted dark:border-gray-700 bg-transparent text-center text-sm font-medium transition-all hover:bg-muted hover:dark:bg-gray-700 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:dark:bg-primary/20 hover:scale-105 ${
                        !product.inStock ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="pt-4">
              <Button 
                className="w-full" 
                size="lg" 
                disabled={!product.inStock || !selectedSize}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
            
            {/* Narrator Component */}
            <div className="pt-6 border-t dark:border-gray-700">
              <h3 className="text-lg font-medium mb-3 dark:text-white">Product Narration</h3>
              <Narrator product={product} enabled={narratorEnabled} />
              {!narratorEnabled && (
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                  Enable narrator in the header to listen to product descriptions.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} VocalWardrobe. All rights reserved.</p>
          <p className="mt-1">Built with Camb.ai Text-to-Speech technology</p>
        </div>
      </footer>
      
      <ApiKeyModal 
        open={isApiKeyModalOpen}
        onOpenChange={setIsApiKeyModalOpen}
        onSuccess={handleApiKeySuccess}
      />
    </div>
  );
};

export default ProductDetail;
