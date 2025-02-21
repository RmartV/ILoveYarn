<template>
    <header class="header">
        <div class="logo-container">
            <img src="../views/images/homelogo.png" alt="I LOVE YARN PH Logo" class="logo-img">
            <h1 class="logo-text">I LOVE YARN PH</h1>
        </div>
        
        <div class="search-container">
            <input type="text" class="search-input" placeholder="What are you looking for?">
            <button class="search-btn"><img class="nav-img-icon" src="../views/images/magnifying-glass.png"></button>
        </div>
        
        <div class="nav-icons">
            <div class="nav-icon"><img class="nav-img-icon" src="../views/images/shopping-cart.png"></div>
            <div class="nav-icon">
                <img src="/api/placeholder/30/30" alt="Profile" class="profile-img">
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
                    <div class="carousel-slide active">
                        <img src="../views/images/slide1.png" alt="Yarn Collection 1" class="carousel-image">
                        <div class="carousel-overlay">
                            <h2 class="carousel-title">Up to 10% off Voucher</h2>
                            <button class="shop-now-btn">Shop Now</button>
                        </div>
                    </div>
                    <div class="carousel-slide">
                        <img src="../views/images/slide2.png" alt="Yarn Collection 2" class="carousel-image">
                        <div class="carousel-overlay">
                            <h2 class="carousel-title">New Arrivals - Premium Yarn</h2>
                            <button class="shop-now-btn">Explore Now</button>
                        </div>
                    </div>
                    <div class="carousel-slide">
                        <img src="../views/images/slide3.png" alt="Crochet Supplies" class="carousel-image">
                        <div class="carousel-overlay">
                            <h2 class="carousel-title">Crochet Supplies Sale</h2>
                            <button class="shop-now-btn">View Collection</button>
                        </div>
                    </div>
                </div>
                
                <!-- Circle Navigation Buttons -->
                <div class="carousel-circle-nav">
                    <button class="circle-btn active" data-slide="0"></button>
                    <button class="circle-btn" data-slide="1"></button>
                    <button class="circle-btn" data-slide="2"></button>
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
                    <div class="category-card">
                        <img src="/api/placeholder/50/50" alt="Yarn" class="category-icon">
                        <div class="category-name">Yarn</div>
                        <div class="yarn-price">P100</div>
                        <div class="weigth"></div>
                        <div class="materials"></div>
                        <div class="yarn colors"><dropdown></dropdown></div>
                        <button> Add to cart</button>
                </div>
            </div>
            </div>
</template>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Carousel functionality
    const carousel = {
        slides: document.querySelectorAll('.carousel-slide'),
        prevArrow: document.querySelector('.carousel-prev'),
        nextArrow: document.querySelector('.carousel-next'),
        circleButtons: document.querySelectorAll('.circle-btn'),
        currentSlide: 0,
        autoPlayInterval: null
    };

    function showSlide(index) {
        // Handle index boundaries
        if (index < 0) index = carousel.slides.length - 1;
        if (index >= carousel.slides.length) index = 0;
        
        // Update current slide
        carousel.currentSlide = index;
        
        // Update slides
        carousel.slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update circle buttons
        carousel.circleButtons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        showSlide(carousel.currentSlide + 1);
    }

    function prevSlide() {
        showSlide(carousel.currentSlide - 1);
    }

    // Set up event listeners for carousel arrows
    if (carousel.prevArrow && carousel.nextArrow) {
        carousel.prevArrow.addEventListener('click', function() {
            prevSlide();
            // Reset the auto slide timer when arrow is clicked
            if (carousel.autoPlayInterval) {
                stopAutoSlide();
                startAutoSlide();
            }
        });
        
        carousel.nextArrow.addEventListener('click', function() {
            nextSlide();
            // Reset the auto slide timer when arrow is clicked
            if (carousel.autoPlayInterval) {
                stopAutoSlide();
                startAutoSlide();
            }
        });
    }

    // Set up event listeners for circle buttons
    carousel.circleButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            showSlide(index);
            // Reset the auto slide timer when a button is clicked
            if (carousel.autoPlayInterval) {
                stopAutoSlide();
                startAutoSlide();
            }
        });
    });

    // Auto slide functions
    function startAutoSlide() {
        carousel.autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        clearInterval(carousel.autoPlayInterval);
    }

    // Start auto slide
    startAutoSlide();

    // Pause auto slide on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);
    }

    // Initialize first slide
    showSlide(0);
    
    // Category navigation
    const categoryNav = {
        currentPosition: 0,
        container: document.querySelector('.categories-grid'),
        items: document.querySelectorAll('.category-card'),
        prevArrow: document.querySelector('.prev-arrow'),
        nextArrow: document.querySelector('.next-arrow'),
        itemsPerView: () => {
            if (window.innerWidth < 768) return 3;
            return 6;
        }
    };
    
    function updateCategoryVisibility() {
        if (!categoryNav.container) return;
        
        const visibleItems = categoryNav.itemsPerView();
        categoryNav.items.forEach((item, index) => {
            if (index >= categoryNav.currentPosition && index < categoryNav.currentPosition + visibleItems) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    function nextCategory() {
        const maxPosition = Math.max(0, categoryNav.items.length - categoryNav.itemsPerView());
        categoryNav.currentPosition = Math.min(categoryNav.currentPosition + 1, maxPosition);
        updateCategoryVisibility();
    }
    
    function prevCategory() {
        categoryNav.currentPosition = Math.max(0, categoryNav.currentPosition - 1);
        updateCategoryVisibility();
    }
    
    if (categoryNav.prevArrow && categoryNav.nextArrow) {
        categoryNav.prevArrow.addEventListener('click', prevCategory);
        categoryNav.nextArrow.addEventListener('click', nextCategory);
    }
    
    // Initial setup for categories
    updateCategoryVisibility();
    
    // Update on window resize
    window.addEventListener('resize', updateCategoryVisibility);
});
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
.profile-img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
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

.carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
    transition: background 0.3s;
}

.carousel-arrow:hover {
    background: rgba(255, 255, 255, 0.9);
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
hr{
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

.nav-arrows {
    display: flex;
    gap: 10px;
}

.nav-arrow {
    width: 30px;
    height: 30px;
    border: 1px solid #ddd;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
}

.category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s;
}

.category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.category-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 15px;
}

.category-name {
    text-align: center;
    font-size: 14px;
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
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .carousel-slides {
        height: 300px;
    }
}
</style>
