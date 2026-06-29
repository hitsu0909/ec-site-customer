<template>
  <div class="container">
    <HeaderBar />

    <main class="main-content">
      <h2>カート</h2>
      <!-- ✅ ローディング -->
      <div v-if="isLoading" class="mini-loading">
        <div class="spinner"></div>
        <p>カートを読み込み中...</p>
      </div>

      <!-- ✅ 空 -->
      <p v-else-if="cart.length === 0" class="error-box">
        カートに商品はありません
      </p>

      <!-- ✅ 商品一覧 -->
      <table v-else class="cart-table">
        <thead>
          <tr>
            <th>商品</th>
            <th>ID</th>
            <th>品名</th>
            <th>単価</th>
            <th>数量</th>
            <th>小計</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in cart" :key="item.id">
            <!-- 商品 -->
            <td>
              <img
                :src="item.image"
                width="60"
                @click="goDetail(item.id)"
                style="cursor"
              />
            </td>

            <td>
              <p @click="goDetail(item.id)">{{ item.displayId }}</p>
            </td>

            <td>
              <p @click="goDetail(item.id)">
                {{ item.name }}
                <span v-if="item.stock === 0" class="form-note">
                  （在庫切れ）
                </span>
              </p>
            </td>

            <!-- 価格 -->
            <td>¥{{ item.price ? item.price.toLocaleString() : 0 }}</td>

            <!-- 数量 -->
            <td>
              <select
                :disabled="isUpdating || item.stock === 0"
                v-model.number="item.quantity"
                @change="updateQuantity(item)"
              >
                <option v-for="n in item.stock" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>
            </td>

            <!-- 小計 -->
            <td>¥{{ (item.price * item.quantity).toLocaleString() }}</td>

            <!-- 削除 -->
            <td>
              <button :disabled="isUpdating" @click="removeItem(item.detailId)">
                削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- ✅ 合計 -->
      <div class="cart-total">
        <div>合計点数：{{ totalQuantity }}点</div>
        <div>合計金額：¥{{ totalPrice.toLocaleString() }}</div>
      </div>
      <p class="form-note">
        <span class="required">*</span
        >商品項目行をクリックすると商品詳細が表示されます。
      </p>
      <p class="form-note">
        <span class="required">*</span>価格に10%の消費税が含んでいます。
      </p>
      <!-- ✅ エラーメッセージ -->
      <p v-if="errorMessage" class="error-box">
        {{ errorMessage }}
      </p>
      <!-- ✅ ボタン -->
      <div class="button-group">
        <button class="btn btn-secondary" @click="$router.push('/products')">
          商品一覧へ
        </button>

        <button class="btn btn-primary" @click="goOrder">注文へ進む</button>
      </div>
    </main>

    <FooterBar />
  </div>
</template>
<script setup>
import { API_BASE } from "@/config/api";
import { ref, onMounted, computed } from "vue";
import HeaderBar from "./HeaderBar.vue";
import FooterBar from "./FooterBar.vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

const router = useRouter();
const cart = ref([]);
const route = useRoute();
const errorMessage = ref("");
const isLoading = ref(true);
const isUpdating = ref(false);

const goOrder = () => {
  if (cart.value.length === 0) {
    errorMessage.value = "カートに商品を追加してください。";
    return;
  }

  // ✅ 在庫チェック（ここ重要）
  const invalidItem = cart.value.find(
    (item) => item.stock === 0 || item.quantity > item.stock,
  );

  if (invalidItem) {
    errorMessage.value = "在庫不足の商品があります。数量を確認してください。";
    return;
  }

  router.push("/orderconfirm");
};

const updateQuantity = async (item) => {
  if (item.quantity > item.stock) {
    errorMessage.value = "在庫を超えています";
    item.quantity = item.stock;
    return;
  }

  if (isUpdating.value) return;

  isUpdating.value = true;

  await fetch(`${API_BASE}/cart`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cart_detail_id: item.detailId,
      quantity: item.quantity,
    }),
  });

  await loadCart();

  isUpdating.value = false;
};

const removeItem = async (detailId) => {
  if (isUpdating.value) return;

  isUpdating.value = true;

  await fetch(`${API_BASE}/cart/${detailId}`, {
    method: "DELETE",
  });

  await loadCart();

  isUpdating.value = false;
};

const loadCart = async () => {
  isLoading.value = true;

  const start = Date.now();

  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(`${API_BASE}/cart/${user.userId}`);
    const data = await res.json();

    cart.value = data.map((item) => ({
      detailId: item.cart_detail_id,
      id: item.product_id,
      displayId: item.display_id,
      name: item.product_name,
      price: item.price_jpy,
      image: item.image_path,
      quantity: item.quantity,
      stock: item.stock, // ✅ 追加
    }));
    // console.log(cart.value);
  } finally {
    const elapsed = Date.now() - start;
    const min = 400;

    if (elapsed < min) {
      setTimeout(() => {
        isLoading.value = false;
      }, min - elapsed);
    } else {
      isLoading.value = false;
    }
  }
};

onMounted(loadCart);

// ✅ 合計
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
});

const totalQuantity = computed(() => {
  return cart.value.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);
});

// ✅ 詳細
const goDetail = (id) => {
  router.push(`/products/${id}`);
};
</script>
