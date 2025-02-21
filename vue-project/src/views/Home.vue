<template>
    <header class="header">
        <div class="logo-container">
            <img src="../views/images/homelogo.jpg" alt="I LOVE YARN PH Logo" class="logo-img">
            <h1 class="logo-text">I LOVE YARN PH</h1>
        </div>
        
        <div class="search-container">
            <input type="text" class="search-input" placeholder="What are you looking for?">
            <button class="search-btn"><img class="nav-img-icon" src="../views/images/magnifying-glass.png"></button>
        </div>
        
        <div class="nav-icons">
            <div class="nav-icon"><img class="nav-img-icon" src="../views/images/shopping-cart.png"></div>
            <div class="nav-icon">
              <p><router-link to="/user-details">{{ userDisplayName || 'Account' }}</router-link></p>
            </div>
        </div>
    </header>
    
    <!-- Main Content Area -->
    <div class="main-content">
        <!-- Sidebar -->
        <div class="sidebar">
            <ul class="sidebar-menu">
                <li class="sidebar-item">Yarn <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Crochet Hooks <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Decorative Tape <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Ribbons <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Sewing Threads <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Accessories <i class="fas fa-chevron-right"></i></li>
            </ul>
        </div>
        
        <!-- Content Area -->
        <div class="content-area">
            <!-- Carousel -->
            <div class="carousel-container">
                <div class="carousel-slides">
                    <div class="carousel-slide" v-for="(slide, index) in slides" :key="index" :class="{ active: currentSlide === index }">
                        <img :src="slide.image" :alt="slide.title" class="carousel-image">
                        <div class="carousel-overlay">
                            <h2 class="carousel-title">{{ slide.title }}</h2>
                            <button class="shop-now-btn">{{ slide.buttonText }}</button>
                        </div>
                    </div>
                </div>
                
                <!-- Circle Navigation Buttons -->
                <div class="carousel-circle-nav">
                    <button 
                        v-for="(slide, index) in slides" 
                        :key="index"
                        class="circle-btn" 
                        :class="{ active: currentSlide === index }"
                        @click="showSlide(index)"></button>
                </div>
            </div>
        </div>
    </div>         

    <!-- Categories Section -->
    <div class="categories-section">
        <hr>
        <div class="section-header-yarn">
            <h3 class="section-title-yarn">Browse By Yarn</h3>
            <div class="view-more">
                <a href="/yarn-page"><img src="../views/images/arrow.png">View more</a>
            </div>
        </div>
        
        <div class="categories-grid-yarn">
            <div v-if="loading" class="loading-message">
                Loading products...
            </div>
            <div v-else-if="error" class="error-message">
                {{ error }}
            </div>
            <div v-else class="categories-grid">
                <div v-for="product in yarnProducts" :key="product.prod_id" class="category-card">
                    <img :src="getProductImage(product)" alt="Yarn product" class="product-image">
                    <p class="product-name">{{ product.prod_name }}</p>
                    <p class="product-category">{{ product.prod_categoryType }}</p>
                    <p class="product-price">₱{{ product.prod_price.toFixed(2) }}</p>
                    <p class="product-weight">Weight: {{ product.yarn_weight }}</p>
                    <p class="product-thickness">Thickness: {{ product.yarn_thickness }}</p>
                    
                    <div class="yarn-colors">
                        <select v-model="selectedColors[product.prod_id]" class="color-dropdown">
                            <option value="" disabled>Select Color</option>
                            <option 
                                v-for="color in product.available_colors" 
                                :key="color.color_id" 
                                :value="color.color_id"
                                :style="{ backgroundColor: color.color_hex }">
                                {{ color.color_name }}
                            </option>
                        </select>
                    </div>
                    
                    <p class="product-stock" :class="{ 'low-stock': product.prod_stock < 10 }">
                        Stock: {{ product.prod_stock }}
                    </p>
                    
                    <button 
                        class="add-to-cart-btn" 
                        :disabled="!selectedColors[product.prod_id] || product.prod_stock <= 0"
                        @click="addToCart(product)">
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import { ref, computed } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  import { useRouter } from 'vue-router';

export default {
    data() {
        return {
            userDisplayName: '',
            userId: null,
            slides: [
                {
                    image: '../views/images/slide1.png',
                    title: 'Up to 10% off Voucher',
                    buttonText: 'Shop Now'
                },
                {
                    image: '../views/images/slide2.png',
                    title: 'New Arrivals - Premium Yarn',
                    buttonText: 'Explore Now'
                },
                {
                    image: '../views/images/slide3.png',
                    title: 'Crochet Supplies Sale',
                    buttonText: 'View Collection'
                }
            ],
            currentSlide: 0,
            autoPlayInterval: null,
            yarnProducts: [],
            selectedColors: {},
            loading: true,
            error: null
        }
    },
    created() {
        this.fetchYarnProducts()
    },
    mounted() {
        this.startAutoSlide()
        this.getUserProfile()
    },
    beforeUnmount() {
        this.stopAutoSlide()
    },
    methods: {
        async getUserProfile() {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                this.userid = session.user.id
                
                // Get user details from UserInfo table
                const { data, error } = await supabase
                    .from('userinfo')
                    .select('userinfo_fname, userinfo_lname')
                    .eq('userinfo_id', this.userid)
                    .single()
                
                if (data && !error) {
                    this.userDisplayName = `${data.userinfo_fname} ${data.userinfo_lname}`
                }
            }
        },
        async fetchYarnProducts() {
            try {
                this.loading = true
                
                // First, get product IDs of type YARN
                const { data: productData, error: productError } = await supabase
                    .from('product')
                    .select('*')
                    .eq('prod_categoryType', 'YARN')
                
                if (productError) throw productError
                
                // For each product, get yarn details
                const yarnDetailsPromises = productData.map(async (product) => {
                    const { data: yarnData, error: yarnError } = await supabase
                        .from('yarn')
                        .select('*')
                        .eq('prod_id', product.prod_id)
                        .single()
                    
                    if (yarnError) return { ...product, yarnDetails: null }
                    
                    // Fetch available colors for this yarn
                    const { data: colorData, error: colorError } = await supabase
                        .from('color')
                        .select('*')
                        .eq('color_id', yarnData.color_id)
                    
                    const available_colors = colorError ? [] : colorData
                    
                    return {
                        ...product,
                        ...yarnData,
                        available_colors
                    }
                })
                
                const results = await Promise.all(yarnDetailsPromises)
                this.yarnProducts = results.filter(product => product.yarn_composition)
                this.loading = false
            } catch (error) {
                console.error('Error fetching products:', error)
                this.error = 'Failed to load products. Please try again later.'
                this.loading = false
            }
        },
        getProductImage(product) {
            // This is a placeholder - replace with actual image logic
            return `../views/images/yarns/yarn_${product.prod_id}.jpg`
        },
        addToCart(product) {
            if (!this.selectedColors[product.prod_id]) {
                alert('Please select a color first')
                return
            }
            
            const selectedColor = product.available_colors.find(
                color => color.color_id === this.selectedColors[product.prod_id]
            )
            
            // Get cart from localStorage or initialize empty cart
            const cart = JSON.parse(localStorage.getItem('cart') || '[]')
            
            // Check if this product with this color is already in cart
            const existingItemIndex = cart.findIndex(item => 
                item.prod_id === product.prod_id && 
                item.color_id === this.selectedColors[product.prod_id]
            )
            
            if (existingItemIndex >= 0) {
                // Increment quantity of existing item
                cart[existingItemIndex].quantity += 1
            } else {
                // Add new item to cart
                cart.push({
                    prod_id: product.prod_id,
                    name: product.prod_name,
                    price: product.prod_price,
                    color_id: this.selectedColors[product.prod_id],
                    color_name: selectedColor ? selectedColor.color_name : 'Unknown',
                    quantity: 1
                })
            }
            
            // Save updated cart
            localStorage.setItem('cart', JSON.stringify(cart))
            
            // Show confirmation
            alert(`Added ${product.prod_name} to cart!`)
        },
        showSlide(index) {
            this.currentSlide = index
            // Reset the auto slide timer when manually changing slide
            if (this.autoPlayInterval) {
                this.stopAutoSlide()
                this.startAutoSlide()
            }
        },
        nextSlide() {
            this.currentSlide = (this.currentSlide + 1) % this.slides.length
        },
        startAutoSlide() {
            this.autoPlayInterval = setInterval(this.nextSlide, 5000)
        },
        stopAutoSlide() {
            clearInterval(this.autoPlayInterval)
        }
    }
}
</script>

<style>
:root {
    --primary-color: #feb1bf;
    --background-color: #F2F2F2;
    --text-color: rgb(0, 0, 0);
    --light-gray: #646464;
    --highlights: #77c275;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Arial', sans-serif;
}

body {
    background-color: var(--background-color);
}

.header {
    background-color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 30px;
    border-bottom: 2px solid var(--light-gray);
}

.logo-container {
    display: flex;
    align-items: center;
}

.logo-img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
}

.logo-text {
    font-size: 24px;
    font-weight: bold;;
}

.search-container {
    flex-grow: 1;
    max-width: 500px;
    margin: 0 20px;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 10px 15px;
    border-radius: 20px;
    border: 2px solid #ddd;
    outline: none;
}

.search-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
}

.nav-icons {
    display: flex;
    gap: 20px;
}

.nav-icon {
    color: var(--text-color);
    cursor: pointer;
}

.nav-img-icon{
    height: 25px;
}

.sidebar {
    height: 100%;
    width: 350px;
    padding: 20px;
    background-color: var(--background-color);
    border-right: 2px solid var(--light-gray);
}

.sidebar-menu {
    list-style: none;
}

.sidebar-item {
    color: var(--text-color);
    padding: 12px 50px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sidebar-item:first-child {
    padding-top: 80px;
}

.sidebar-item:last-child {
    border-bottom: none;
    padding-bottom: 100px;
}

.main-content {
    display: flex;
}

.content-area {
    flex-grow: 1;
    padding: 20px;
}

.carousel-container {
    position: relative;
    margin: 30px 0;
    overflow: hidden;
    border-radius: 8px;
}

.carousel-slides {
    margin: auto;
    position: relative;
    width: 85%;
    height: 400px; /* Adjust height as needed */
}

.carousel-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
}

.carousel-slide.active {
    opacity: 1;
    z-index: 1;
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.carousel-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px;
    color: var(--light-gray);
    z-index: 2;
}

.carousel-title {
    color: var(--highlights);
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 20px;
}

.shop-now-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    width: fit-content;
    margin-top: 20px;
}

.carousel-circle-nav {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 15px;
    z-index: 10;
}

.circle-btn {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.7);
    border: 2px solid white;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
}

.circle-btn:hover {
    background-color: rgba(255, 255, 255, 0.9);
    transform: scale(1.1);
}

.circle-btn.active {
    background-color: var(--primary-color);
    border-color: white;
    transform: scale(1.2);
}

.circle-btn:focus {
    outline: none;
}

.categories-section {
    margin-top: 40px;
    margin: auto;
    width: 94%;
}

.section-header-yarn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

hr {
    border-style: solid;
    height: 2px;
    color: var(--light-gray);
}

.section-title-yarn {
    color: var(--text-color);
    margin: 40px 0 30px 0;
    left: 20px;
    font-size: 24px;
    font-weight: bold;
    position: relative;
}

.section-title-yarn:before {
    content: '';
    width: 10px;
    height: 100%;
    border-radius: 3px;
    background-color: var(--primary-color);
    position: absolute;
    left: -19px;
}

.view-more {
    display: flex;
    align-items: center;
}

.view-more a {
    display: flex;
    align-items: center;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: bold;
}

.view-more img {
    height: 15px;
    margin-right: 5px;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
}

.category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    transition: transform 0.3s, box-shadow 0.3s;
    background-color: white;
}

.category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.product-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    margin-bottom: 15px;
    border-radius: 4px;
}

.product-name {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 5px;
    color: var(--text-color);
}

.product-category {
    color: var(--light-gray);
    font-size: 14px;
    margin-bottom: 10px;
}

.product-price {
    font-weight: bold;
    color: var(--primary-color);
    font-size: 18px;
    margin-bottom: 10px;
}

.product-weight, .product-thickness {
    font-size: 14px;
    color: var(--light-gray);
    margin-bottom: 5px;
}

.yarn-colors {
    margin: 10px 0;
    width: 100%;
}

.color-dropdown {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
}

.product-stock {
    font-size: 14px;
    margin-bottom: 15px;
}

.low-stock {
    color: #e74c3c;
}

.add-to-cart-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    width: 100%;
    transition: background-color 0.3s;
}

.add-to-cart-btn:hover:not(:disabled) {
    background-color: #e69da8;
}

.add-to-cart-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.loading-message, .error-message {
    grid-column: 1 / -1;
    padding: 20px;
    text-align: center;
    font-size: 16px;
}

.error-message {
    color: #e74c3c;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        padding: 10px;
    }
    
    .search-container {
        margin: 15px 0;
        max-width: 100%;
    }
    
    .main-content {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        min-height: auto;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .categories-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
    
    .carousel-slides {
        height: 300px;
    }
}
</style>