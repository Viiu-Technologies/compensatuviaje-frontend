import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  TreePine,
  Cloud,
  Droplets,
  Bird,
  Gift,
  Star,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  Filter,
  Search,
  Sparkles,
  Leaf,
  Award,
  Zap,
  Heart
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';

interface ImpactProduct {
  id: string;
  name: string;
  description: string;
  category: 'trees' | 'carbon' | 'water' | 'wildlife' | 'bundle';
  price: number;
  impactValue: string;
  impactUnit: string;
  image: string;
  badge?: string;
  isPopular?: boolean;
  sdgs: number[];
}

const ImpactStoreView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Todo', icon: ShoppingBag },
    { id: 'trees', label: 'Árboles', icon: TreePine },
    { id: 'carbon', label: 'Carbono', icon: Cloud },
    { id: 'water', label: 'Agua', icon: Droplets },
    { id: 'wildlife', label: 'Vida Silvestre', icon: Bird },
    { id: 'bundle', label: 'Paquetes', icon: Gift }
  ];

  const products: ImpactProduct[] = [
    {
      id: '1',
      name: 'Planta un Árbol Nativo',
      description: 'Contribuye a la reforestación con especies nativas de Chile.',
      category: 'trees',
      price: 5990,
      impactValue: '1',
      impactUnit: 'árbol',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      sdgs: [15],
      isPopular: true
    },
    {
      id: '2',
      name: 'Bosque Familiar',
      description: 'Planta 10 árboles en nombre de tu familia o equipo.',
      category: 'trees',
      price: 49990,
      impactValue: '10',
      impactUnit: 'árboles',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
      badge: 'Más vendido',
      sdgs: [13, 15]
    },
    {
      id: '3',
      name: 'Compensación 1 Tonelada CO₂',
      description: 'Neutraliza 1 tonelada de emisiones de carbono.',
      category: 'carbon',
      price: 15990,
      impactValue: '1',
      impactUnit: 'tCO₂',
      image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400',
      sdgs: [13],
      isPopular: true
    },
    {
      id: '4',
      name: 'Huella Neutra Mensual',
      description: 'Compensa la huella promedio de una persona por un mes.',
      category: 'carbon',
      price: 12990,
      impactValue: '0.7',
      impactUnit: 'tCO₂',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
      sdgs: [13]
    },
    {
      id: '5',
      name: 'Protección de Nacientes',
      description: 'Protege fuentes de agua dulce en la cordillera.',
      category: 'water',
      price: 29990,
      impactValue: '1,000',
      impactUnit: 'litros/año',
      image: 'https://images.unsplash.com/photo-1432405972618-c6b0c2d0b4f4?w=400',
      badge: 'Nuevo',
      sdgs: [6, 14]
    },
    {
      id: '6',
      name: 'Adopta un Cóndor',
      description: 'Apoya la conservación del cóndor andino.',
      category: 'wildlife',
      price: 39990,
      impactValue: '1',
      impactUnit: 'cóndor',
      image: 'https://images.unsplash.com/photo-1557401620-67270b4b1e1f?w=400',
      sdgs: [15]
    },
    {
      id: '7',
      name: 'Protección Marina',
      description: 'Contribuye a la conservación de ecosistemas marinos.',
      category: 'wildlife',
      price: 24990,
      impactValue: '10',
      impactUnit: 'm² protegidos',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      sdgs: [14]
    },
    {
      id: '8',
      name: 'Paquete Impacto Total',
      description: 'Incluye árboles, compensación CO₂ y protección de agua.',
      category: 'bundle',
      price: 79990,
      impactValue: 'Múltiple',
      impactUnit: 'impacto',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
      badge: 'Mejor valor',
      sdgs: [6, 13, 14, 15]
    }
  ];

  const addToCart = (productId: string) => {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.productId !== productId));
    }
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find(i => i.productId === productId);
    return item?.quantity || 0;
  };

  const getTotalItems = () => cart.reduce((acc, item) => acc + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product?.price || 0) * item.quantity;
  }, 0);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col lg:!flex-row !items-start lg:!items-center !justify-between !gap-4">
        <div>
          <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Tienda de Impacto</h1>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Genera impacto positivo con cada compra</p>
        </div>
        
        {/* Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="!relative !flex !items-center !gap-2 !px-5 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium !text-sm !border-0 !shadow-lg !shadow-green-500/30 hover:!shadow-green-500/50 !transition-all"
        >
          <ShoppingCart className="!w-5 !h-5" />
          <span>Carrito</span>
          {getTotalItems() > 0 && (
            <span className="!absolute !-top-2 !-right-2 !w-6 !h-6 !bg-red-500 !text-white !text-xs !font-bold !rounded-full !flex !items-center !justify-center">
              {getTotalItems()}
            </span>
          )}
        </motion.button>
      </div>

      {/* Featured Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="!relative !overflow-hidden !bg-gradient-to-r !from-green-600 !via-emerald-600 !to-teal-600 !rounded-2xl !p-6 md:!p-8"
      >
        <div className="!relative !z-10 !max-w-xl">
          <div className="!inline-flex !items-center !gap-2 !px-3 !py-1 !bg-white/20 !rounded-full !text-white/90 !text-xs !font-medium !mb-3">
            <Sparkles className="!w-4 !h-4" />
            Oferta especial
          </div>
          <h2 className="!text-2xl md:!text-3xl !font-bold !text-white !mb-2">
            🌱 20% de descuento en Paquetes de Impacto
          </h2>
          <p className="!text-white/80 !mb-4">
            Maximiza tu contribución ambiental con nuestros paquetes combinados.
          </p>
          <button className="!px-6 !py-2.5 !bg-white !text-green-700 !rounded-xl !font-semibold !text-sm hover:!bg-green-50 !transition-colors !border-0">
            Ver Paquetes
          </button>
        </div>
        <div className="!absolute !right-0 !top-0 !bottom-0 !w-1/3 !opacity-20">
          <TreePine className="!w-full !h-full" />
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className={`!rounded-2xl !p-4 !border !shadow-sm ${isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'}`}>
        <div className="!flex !flex-col lg:!flex-row !gap-4">
          {/* Search */}
          <div className="!relative !flex-1">
            <Search className={`!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 ${isDark ? '!text-gray-500' : '!text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar productos de impacto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`!w-full !pl-10 !pr-4 !py-2.5 !rounded-xl !border !outline-none !transition-all focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 ${
                isDark 
                  ? '!border-gray-600 !bg-gray-700 !text-gray-100 placeholder:!text-gray-500' 
                  : '!border-gray-200 !bg-gray-50 !text-gray-900 focus:!bg-white'
              }`}
            />
          </div>

          {/* Categories */}
          <div className="!flex !items-center !gap-2 !overflow-x-auto !pb-2 lg:!pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !text-sm !font-medium !whitespace-nowrap !transition-all !border-0 ${
                  selectedCategory === cat.id
                    ? '!bg-green-500 !text-white !shadow-lg !shadow-green-500/30'
                    : isDark 
                      ? '!bg-gray-700 !text-gray-300 hover:!bg-gray-600'
                      : '!bg-gray-100 !text-gray-600 hover:!bg-gray-200'
                }`}
              >
                <cat.icon className="!w-4 !h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="!grid sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-4 !gap-6">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={`!rounded-2xl !border !shadow-lg hover:!shadow-xl !transition-all !overflow-hidden group ${isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'}`}
            >
              {/* Image */}
              <div className="!relative !h-44 !overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                />
                {product.badge && (
                  <span className="!absolute !top-3 !left-3 !px-2.5 !py-1 !bg-gradient-to-r !from-yellow-400 !to-orange-500 !text-white !text-xs !font-bold !rounded-full">
                    {product.badge}
                  </span>
                )}
                {product.isPopular && (
                  <span className="!absolute !top-3 !right-3 !w-8 !h-8 !bg-red-500 !rounded-full !flex !items-center !justify-center">
                    <Star className="!w-4 !h-4 !text-white !fill-white" />
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="!p-4">
                <h3 className={`!text-base !font-bold !mb-1 group-hover:!text-green-600 !transition-colors ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                  {product.name}
                </h3>
                <p className={`!text-sm !mb-3 !line-clamp-2 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{product.description}</p>

                {/* Impact */}
                <div className="!flex !items-center !gap-2 !mb-3">
                  <div className="!flex !items-center !gap-1 !px-2 !py-1 !bg-green-100 !rounded-lg">
                    <Leaf className="!w-4 !h-4 !text-green-600" />
                    <span className="!text-sm !font-semibold !text-green-700">
                      {product.impactValue} {product.impactUnit}
                    </span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className={`!flex !items-center !justify-between !pt-3 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
                  <div>
                    <span className={`!text-xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                      ${product.price.toLocaleString()}
                    </span>
                    <span className={`!text-xs !ml-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>CLP</span>
                  </div>

                  {getCartQuantity(product.id) > 0 ? (
                    <div className="!flex !items-center !gap-2">
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className={`!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !transition-colors !border-0 ${isDark ? '!bg-gray-700 hover:!bg-gray-600' : '!bg-gray-100 hover:!bg-gray-200'}`}
                      >
                        <Minus className={`!w-4 !h-4 ${isDark ? '!text-gray-300' : '!text-gray-600'}`} />
                      </button>
                      <span className={`!w-8 !text-center !font-semibold ${isDark ? '!text-gray-100' : ''}`}>{getCartQuantity(product.id)}</span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="!w-8 !h-8 !rounded-lg !bg-green-500 !flex !items-center !justify-center hover:!bg-green-600 !transition-colors !border-0"
                      >
                        <Plus className="!w-4 !h-4 !text-white" />
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product.id)}
                      className="!flex !items-center !gap-1 !px-4 !py-2 !bg-green-500 hover:!bg-green-600 !text-white !rounded-xl !text-sm !font-medium !transition-colors !border-0"
                    >
                      <Plus className="!w-4 !h-4" />
                      Agregar
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Summary (Fixed Bottom) */}
      <AnimatePresence>
        {getTotalItems() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="!fixed !bottom-6 !left-1/2 !-translate-x-1/2 !z-50 !w-full !max-w-md !px-4"
          >
            <div className="!bg-gray-900 !rounded-2xl !p-4 !shadow-2xl !flex !items-center !justify-between">
              <div className="!flex !items-center !gap-3">
                <div className="!w-12 !h-12 !rounded-xl !bg-green-500 !flex !items-center !justify-center">
                  <ShoppingCart className="!w-6 !h-6 !text-white" />
                </div>
                <div>
                  <p className="!text-white !font-semibold">{getTotalItems()} productos</p>
                  <p className="!text-green-400 !text-lg !font-bold">${getTotalPrice().toLocaleString()} CLP</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="!px-6 !py-3 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-semibold !border-0"
              >
                Pagar Ahora
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredProducts.length === 0 && (
        <div className="!text-center !py-12">
          <ShoppingBag className={`!w-16 !h-16 !mx-auto !mb-4 ${isDark ? '!text-gray-600' : '!text-gray-300'}`} />
          <h3 className={`!text-lg !font-semibold ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>No se encontraron productos</h3>
          <p className={`!text-sm ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>Intenta con otra categoría o búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default ImpactStoreView;
