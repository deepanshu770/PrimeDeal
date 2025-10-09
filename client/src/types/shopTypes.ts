import { orderItem } from "./orderType";

export type ProductItem = {
    id: string;
    title: string;
    name: string;
    price: number;
    description: string;
    image: string;
    netQty: string;
    outOfStock: boolean;
    shopId:string
}
 export type Shop = {
    id: string;
    userId: string;
    storeName: string;
    name: string;
    description: string;
    city: string;
    cityName: string;
    address: string;
    deliveryTime: number;
    productCategory: string[];
    storeBanner: string;
    products: ProductItem[];  
}

export type ShopState = {
    loading: boolean;
    shop: Shop[];
    searchedShop:  Shop[] ;
    searchedProduct:  ProductItem[];
    singleShop: Shop | null;
    shopOrders : orderItem[];
    
    createShop: (formData: FormData) => Promise<void>;
    getShop: () => Promise<void>;
    updateShop: (formData: FormData, existingBanner?: string) => Promise<void>;
    searchShop: (searchText: string, searchQuery: string, /*selectedProducts: any */) => Promise<void>;
    addProductToShop: (product: ProductItem) => void;
    updateProductInShop: (updatedProduct: ProductItem) => void;
    getSingleShop: (shopId:string) => Promise<void>;
    getShopOrders : () => Promise<void>;
    updateShopOrders: (orderId:string,orderStatus:string) => Promise<void>;
    clearShop: () => void;
}