import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/productGenerator';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col transform hover:-translate-y-1 relative bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="relative aspect-square overflow-hidden bg-secondary/30 dark:bg-gray-700/30">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Badge variant="destructive" className="text-md px-3 py-1.5 animate-pulse">Out of Stock</Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <CardContent className="pt-4 pb-2 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-base line-clamp-2 group-hover:text-primary transition-colors duration-300 dark:text-white">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 dark:text-gray-400">{product.category}</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 pb-4 flex justify-between">
          <div className="flex items-center">
            <span className="text-lg font-semibold transition-all duration-300 group-hover:text-primary dark:text-white">${product.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="mr-1 text-yellow-400">★</span>
            <span className="dark:text-gray-300">{product.rating}</span>
          </div>
        </CardFooter>
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge variant="secondary" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
            View Details
          </Badge>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
