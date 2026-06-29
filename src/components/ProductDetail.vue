<template>
  <div class="container">
    <HeaderBar />
    <main class="main-content">
      <!-- ✅ ローディング -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>読み込み中...</p>
      </div>

      <!-- ✅ データ -->

      <div v-else-if="product">
        <h2 class="product-detail-title">
          {{ product.name }}
        </h2>

        <!-- ✅ 上段 -->
        <div class="product-detail-container">
          <!-- 左 -->
          <div class="product-detail-image">
            <img :src="product.image" width="200" />
          </div>

          <!-- 右 -->
          <div class="product-detail-info">
            <h3 class="detail-section-title">■商品情報</h3>

            <table class="product-info-table">
              <tbody>
                <tr>
                  <td class="info-label">商品番号:</td>
                  <td class="info-value">{{ product.display_id }}</td>
                </tr>

                <tr>
                  <td class="info-label">メーカー:</td>
                  <td class="info-value">{{ product.maker }}</td>
                </tr>

                <tr>
                  <td class="info-label">カテゴリ:</td>
                  <td class="info-value">{{ product.category }}</td>
                </tr>

                <tr>
                  <td class="info-label">価格：</td>
                  <td class="info-value">
                    {{ formatPrice(product.price) }}
                  </td>
                </tr>

                <tr>
                  <td class="info-label">評価:</td>
                  <td class="info-value">
                    {{ product.rating }} ⭐（{{ product.count }}件）
                  </td>
                </tr>

                <tr>
                  <td class="info-label">在庫数:</td>
                  <td class="info-value">
                    <span v-if="product.stock > 0">
                      {{ product.stock }} 個
                    </span>
                    <span v-else style="color: red"> 在庫切れ </span>
                  </td>
                </tr>

                <tr>
                  <td class="info-label">注文数:</td>
                  <td class="info-value">
                    <select
                      class="quantity-select"
                      v-model="quantity"
                      :disabled="product.stock === 0"
                    >
                      <option v-for="n in product.stock" :key="n" :value="n">
                        {{ n }}
                      </option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ✅ 下段 -->
        <div class="product-overview">
          <h3 class="detail-section-title">■商品概要</h3>

          <div class="overview-content">
            <p class="overview-text">
              {{ product.description }}
            </p>
          </div>
        </div>
        <p class="form-note">
          <span class="required">*</span>価格に10%の消費税が含んでいます。
        </p>

        <!-- ✅ ボタン -->
        <div class="product-detail-buttons">
          <button class="btn btn-secondary btn-back" @click="$router.back()">
            戻る
          </button>

          <button
            class="btn btn-primary btn-add-cart"
            @click="addToCart(product)"
            :disabled="product.stock === 0"
          >
            {{ product.stock === 0 ? "在庫切れ" : "カートに入れる" }}
          </button>
        </div>
      </div>
      <div v-if="showModal" class="cart-modal-overlay">
        <div class="cart-modal">
          <p>カートに追加しました</p>
          <div class="cart-modal-buttons">
            <button @click="goCart">カートへ</button>
            <button @click="showModal = false">閉じる</button>
          </div>
        </div>
      </div>
    </main>
    <FooterBar />
  </div>
</template>
<script setup>
import { API_BASE } from "@/config/api";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import HeaderBar from "./HeaderBar.vue";
import FooterBar from "./FooterBar.vue";

const quantity = ref(1);
const route = useRoute();
const router = useRouter();
const product = ref(null);
const isLoading = ref(true);

const fetchProduct = async () => {
  isLoading.value = true;

  const start = Date.now();

  try {
    const res = await fetch(`${API_BASE}/products/${route.params.id}`);
    const data = await res.json();

    product.value = formatProduct(data);
  } catch (e) {
    console.error(e);
  } finally {
    const elapsed = Date.now() - start;

    const minDuration = 500; // ✅ 最低0.5秒表示

    if (elapsed < minDuration) {
      setTimeout(() => {
        isLoading.value = false;
      }, minDuration - elapsed);
    } else {
      isLoading.value = false;
    }
  }
};

const formatProduct = (p) => {
  return {
    id: p.productId,
    name: p.productName,
    price: p.priceJpy, // ✅ 修正
    image: p.imagePath,
    display_id: p.displayId,
    maker: p.maker || "メーカー未登録",
    rating: p.rating,
    count: p.reviewCount, // ✅ 修正
    description: p.description,
    category: p.category,
    stock: p.stock,
  };
};

const showModal = ref(false);

const addToCart = async (product) => {
  if (product.stock === 0) {
    alert("在庫がありません");
    return;
  }

  if (quantity.value > product.stock) {
    alert("在庫数を超えています");
    quantity.value = product.stock;
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.userId,
        product_id: product.id,
        quantity: quantity.value, // ✅ ここ重要
      }),
    });

    if (!res.ok) {
      alert("カート追加失敗");
      return;
    }

    // alert("カートに追加しました");
    showModal.value = true; // ✅ alert → モーダルへ
  } catch (err) {
    console.error(err);
    alert("サーバエラー");
  }
};

const goCart = () => {
  showModal.value = false;
  router.push("/cart");
};

const formatPrice = (p) => (p ? p.toLocaleString() + "円" : "0円");

onMounted(fetchProduct);
</script>
