<template>
  <div class="container">
    <HeaderBar />

    <!-- ✅ メイン -->
    <main class="main-content">
      <div class="header-left">
        <h2 class="product-detail-title">商品一覧</h2>
      </div>
      <div class="header-right" style="margin-right: 40px">
        <label>
          <input
            type="checkbox"
            v-model="hideOutOfStock"
            @change="applyFilters"
          />
          在庫ありのみ
        </label>
      </div>
      <!-- ✅ 検索バー -->
      <div class="search-bar">
        <!-- キーワード -->
        <input
          v-model="keyword"
          name="keyword"
          class="search-input"
          placeholder="商品・メーカーを入力してください"
        />

        <select
          class="search-select"
          v-model="selectedCategory"
          aria-label="カテゴリ選択"
        >
          <option value="">すべて</option>
          <option v-for="c in categories" :key="c" :value="c">
            {{ c }}
          </option>
        </select>

        <!-- 検索 -->
        <button class="search-button" @click="searchProducts">検索</button>

        <!-- 並び替え -->
        <select
          class="search-select"
          v-model="sortOrder"
          aria-label="並び替え選択"
          @change="applyFilters"
        >
          <option value="recommend">おすすめ順</option>
          <option value="asc">価格：安い順</option>
          <option value="desc">価格：高い順</option>
          <option value="rating">評価順</option>
          <option value="count">レビュー件数順</option>
        </select>
      </div>

      <div>
        <!-- ✅ 件数 -->
        <p class="search-result">検索結果：{{ filteredProducts.length }}件</p>
      </div>

      <!-- ✅ ローディング -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>商品を読み込み中...</p>
      </div>
      <div v-else-if="isSearching" class="mini-loading">
        <div class="spinner"></div>
        <p>更新中...</p>
      </div>
      <!-- ✅ 通常 -->
      <div v-else>
        <!-- ✅ 商品一覧 -->
        <div class="product-grid">
          <div
            v-for="item in filteredProducts"
            :key="item.id"
            class="product-card"
          >
            <img
              :src="item.image"
              :alt="item.name"
              width="100"
              @click="goDetail(item.id)"
            />
            <div class="product-info">
              <p @click="goDetail(item.id)" :title="item.name">
                {{ item.name }}
              </p>

              <p>{{ item.maker }}</p>

              <p>¥{{ item.price ? item.price.toLocaleString() : 0 }}</p>

              <p>⭐ {{ item.rating || 0 }}（{{ item.count || 0 }}件）</p>

              <p v-if="item.stock > 0">残り{{ item.stock }}個</p>

              <p v-else style="color: red">在庫切れ</p>
            </div>
            <button @click="addToCart(item)" :disabled="item.stock === 0">
              カートに入れる
            </button>
          </div>
        </div>

        <!-- ✅ ここに出す（超重要） -->
        <div v-if="showModal" class="cart-modal-overlay">
          <div class="cart-modal">
            <p>カートに追加しました</p>
            <div class="cart-modal-buttons">
              <button @click="goCart">カートへ</button>
              <button @click="showModal = false">閉じる</button>
            </div>
          </div>
        </div>
      </div>
      <p class="form-note">
        <span class="required">*</span>価格に10%の消費税が含んでいます。
      </p>
    </main>
    <FooterBar />
  </div>
</template>

<script setup>
import { API_BASE } from "@/config/api";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import HeaderBar from "./HeaderBar.vue";
import FooterBar from "./FooterBar.vue";

const router = useRouter();
const isLoading = ref(true);
const isSearching = ref(false);
const productsOriginal = ref([]);
const filteredProducts = ref([]);
const categories = ref([]);

const keyword = ref("");
const selectedCategory = ref("");
const sortOrder = ref("recommend");
const hideOutOfStock = ref(false);

// ✅ 仮メーカー
// const makers = ['サンプル株式会社', 'テスト工業', 'ダミー商事']

// ✅ 商品取得
const fetchProducts = async () => {
  isLoading.value = true;

  const start = Date.now();

  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();

    productsOriginal.value = formatProducts(data);
    applyFilters();
    // console.log(data);
    console.log(productsOriginal.value);
  } finally {
    const elapsed = Date.now() - start;
    const min = 600;

    if (elapsed < min) {
      setTimeout(() => {
        isLoading.value = false;
      }, min - elapsed);
    } else {
      isLoading.value = false;
    }
  }
};

// ✅ カテゴリ取得
const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories`);
  const data = await res.json();
  categories.value = data;
  // categories.value = await res.json()
};

const loadCategory = async (category) => {
  try {
    let url = "";

    if (!category) {
      // ✅ すべて
      url = `${API_BASE}/products`;
    } else {
      // ✅ カテゴリ指定
      url = `${API_BASE}/products/category/${encodeURIComponent(category)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    productsOriginal.value = formatProducts(data);
    applyFilters();
  } catch (err) {
    console.error("取得エラー:", err);
  }
};

const formatProducts = (data) => {
  return data.map((p) => ({
    id: p.productId,
    name: p.productName,
    price: p.priceJpy, // ✅ 修正ここ
    image: p.imagePath,
    display_id: p.displayId,
    maker: p.maker || "メーカー未登録",
    rating: p.rating,
    count: p.reviewCount,
    category: p.category,
    stock: p.stock,
  }));
};

// ✅ フィルタ処理
const applyFilters = () => {
  let result = [...productsOriginal.value];

  const key = keyword.value.toLowerCase();

  // ✅ 検索
  if (keyword.value) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(key) ||
        p.maker.toLowerCase().includes(key),
    );
  }

  // ✅ 在庫フィルタ（ここ追加🔥）
  if (hideOutOfStock.value) {
    result = result.filter((p) => p.stock > 0);
  }

  // ✅ 並び替え
  if (sortOrder.value === "asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOrder.value === "desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (sortOrder.value === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortOrder.value === "count") {
    result.sort((a, b) => b.count - a.count);
  } else {
    result.sort((a, b) => a.id - b.id);
  }

  filteredProducts.value = result;
};

// ✅ 詳細
const goDetail = (id) => {
  router.push(`/products/${id}`);
};

const showModal = ref(false);

const addToCart = async (product) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.userId, // ✅ 修正
        product_id: product.id,
        quantity: 1,
      }),
    });

    if (!res.ok) {
      alert("追加失敗");
      return;
    }

    // alert('カートに追加しました')
    showModal.value = true; // ✅ alert → モーダルへ
  } catch (err) {
    console.error(err);
    alert("サーバエラー");
  }
};

onMounted(() => {
  fetchProducts();
  fetchCategories();
});

const searchProducts = async () => {
  isSearching.value = true;

  try {
    await loadCategory(selectedCategory.value);
    applyFilters();
  } finally {
    setTimeout(() => {
      isSearching.value = false;
    }, 600);
  }
};

const goCart = () => {
  showModal.value = false;
  router.push("/cart");
};
</script>
