const STORAGE_KEY = 'mini-shop-cart';

const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 1290000,
    category: 'Electronics',
    image: 'images/headphones.png'
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 2490000,
    category: 'Electronics',
    image: 'images/smartwatch.png'
  },
  {
    id: 3,
    name: 'Bluetooth Speaker',
    price: 890000,
    category: 'Electronics',
    image: 'images/speaker.png'
  },
  {
    id: 4,
    name: 'Denim Jacket',
    price: 750000,
    category: 'Fashion',
    image: 'images/jacket.png'
  },
  {
    id: 5,
    name: 'Running Shoes',
    price: 1150000,
    category: 'Fashion',
    image: 'images/shoes.png'
  },
  {
    id: 6,
    name: 'Baseball Cap',
    price: 190000,
    category: 'Fashion',
    image: 'images/cap.png'
  },
  {
    id: 7,
    name: 'JavaScript Handbook',
    price: 320000,
    category: 'Books',
    image: 'images/book.png'
  },
  {
    id: 8,
    name: 'Web Design Sketchbook',
    price: 150000,
    category: 'Books',
    image: 'images/sketchbook.png'
  }
];

const productGrid = document.querySelector('#productGrid');
const cartBadge = document.querySelector('#cartBadge');
const cartTotal = document.querySelector('#cartTotal');
const clearCartBtn = document.querySelector('#clearCartBtn');
const categoryButtons = document.querySelectorAll('.category-filters .filter-btn');
const searchInput = document.querySelector('#searchInput');

let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentCategory = 'All';
let currentSearch = '';

function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartBadge.textContent = totalCount;
  cartTotal.textContent = `Total: ${formatCurrency(totalPrice)}`;
}

function renderProducts() {
  productGrid.innerHTML = '';

  const filtered = products.filter((product) => {
    const matchesCategory = currentCategory === 'All' || product.category === currentCategory;
    const matchesSearch = product.name.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
    return;
  }

  filtered.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = product.id;

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <span class="category-tag tag-${product.category.toLowerCase()}">${product.category}</span>
        <h2 class="product-name">${product.name}</h2>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <button type="button" class="add-to-cart-btn">Add to Cart</button>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

productGrid.addEventListener('click', (e) => {
  const button = e.target.closest('.add-to-cart-btn');
  if (!button) return;

  const card = e.target.closest('.product-card');
  if (!card) return;

  const productId = parseInt(card.dataset.id, 10);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  updateCartUI();
});

clearCartBtn.addEventListener('click', () => {
  cart = [];
  localStorage.removeItem(STORAGE_KEY);
  updateCartUI();
});

categoryButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderProducts();
  });
});

searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value.trim();
  renderProducts();
});

renderProducts();
updateCartUI();
