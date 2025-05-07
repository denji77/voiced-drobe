import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import ApiKeyModal from '@/components/ApiKeyModal';
import { isNarratorInitialized, initNarrator } from '@/lib/narratorService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchProducts } from '@/lib/api';
import { Product } from '@/lib/productGenerator';
import { Settings } from 'lucide-react';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [narratorEnabled, setNarratorEnabled] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Load products from the backend
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts();
        if (data && data.length > 0) {
          setProducts(data);
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(data.map((product: Product) => product.category))
          ) as string[];
          setCategories(uniqueCategories);
        } else {
          // Fallback to local storage if backend returns empty
          const localProducts = JSON.parse(localStorage.getItem('products') || '[]') as Product[];
          setProducts(localProducts);
          const uniqueCategories = Array.from(
            new Set(localProducts.map((product: Product) => product.category))
          ) as string[];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to local storage on error
        const localProducts = JSON.parse(localStorage.getItem('products') || '[]') as Product[];
        setProducts(localProducts);
        const uniqueCategories = Array.from(
          new Set(localProducts.map((product: Product) => product.category))
        ) as string[];
        setCategories(uniqueCategories);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
    
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
  }, []);

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

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Header 
        narratorEnabled={narratorEnabled}
        toggleNarrator={toggleNarrator}
        showApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-4 relative dark:text-white">
              Discover Our Collection
              <span className="absolute -bottom-1 left-0 w-1/4 h-1 bg-primary rounded-full"></span>
            </h1>
            <p className="text-muted-foreground max-w-2xl dark:text-gray-300">
              Browse our carefully selected clothing items. With the narrator feature enabled, 
              you can listen to product descriptions for a more immersive shopping experience.
            </p>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-2 hover:scale-105 transition-transform duration-300">
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>

        {/* Category filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 animate-slide-in">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer text-sm py-2 px-4 transform transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedCategory(null)}
            >
              All Items
            </Badge>
            
            {categories.map((category, index) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer text-sm py-2 px-4 transform transition-all duration-300 hover:scale-105"
                onClick={() => setSelectedCategory(category)}
                style={{ 
                  opacity: 0,
                  animation: 'fadeIn 0.5s ease forwards',
                  animationDelay: `${index * 50}ms`
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="opacity-0 animate-fade-in"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try changing your filter criteria</p>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-8 mt-auto backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
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

export default Index;
