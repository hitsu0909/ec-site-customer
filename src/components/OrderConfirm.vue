<template>
  <div class="container">
    <HeaderBar />

    <main class="main-content">
      <h2>注文確認</h2>
      <!-- ✅ ローディング -->
      <p v-if="isLoading">読み込み中...</p>

      <!-- ✅ 空 -->
      <p v-else-if="cart.length === 0" class="error-box">
        カートに商品はありません
      </p>

      <!-- ✅ 一覧 -->
      <table v-else class="cart-table">
        <thead>
          <tr>
            <th>商品</th>
            <th>ID</th>
            <th>品名</th>
            <th>単価</th>
            <th>数量</th>
            <th>小計</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in cart" :key="item.id">
            <td>
              <img :src="item.image" width="60" @click="goDetail(item.id)" />
            </td>

            <td>
              <p @click="goDetail(item.id)">{{ item.displayId }}</p>
            </td>

            <td>
              <p @click="goDetail(item.id)">{{ item.name }}</p>
            </td>

            <td>¥{{ item.price ? item.price.toLocaleString() : 0 }}</td>

            <td>
              {{ item.quantity }}
            </td>

            <td>¥{{ (item.price * item.quantity).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>

      <!-- ✅ 合計 -->
      <div v-if="cart.length" class="cart-total">
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
      <br />
      <h2>届け先情報</h2>

      <table class="delivery-table">
        <tbody>
          <tr>
            <th class="confirm-label">会社名</th>
            <td class="confirm-data">{{ user.companyName }}</td>

            <th class="confirm-label">会社フリガナ</th>
            <td class="confirm-data">{{ user.companyKana }}</td>
          </tr>

          <tr>
            <th class="confirm-label">担当者名</th>
            <td class="confirm-data">{{ user.userName }}</td>

            <th class="confirm-label">担当者フリガナ</th>
            <td class="confirm-data">{{ user.userKana }}</td>
          </tr>
          <!-- 部署・郵便番号 -->
          <tr>
            <th class="confirm-label">部署名</th>
            <td class="confirm-data">{{ user.department }}</td>

            <th class="confirm-label">郵便番号</th>
            <td class="confirm-data">{{ user.postalCode }}</td>
          </tr>
          <tr>
            <th class="confirm-label">住所</th>
            <td class="confirm-data full-width" colspan="3">
              {{ user.address }}
            </td>
          </tr>

          <tr>
            <th class="confirm-label">メール</th>
            <td class="confirm-data">{{ user.email }}</td>

            <th class="confirm-label">電話</th>
            <td class="confirm-data">{{ user.phone }}</td>
          </tr>
        </tbody>
      </table>
      <p class="form-note">
        *届け先が違う場合、画面の右上のお名前をクリックし、情報を変更してください。
      </p>
      <br />
      <h2>支払い方法</h2>
      <div class="payment-option">
        <label class="checkbox-label">
          <input type="checkbox" name="bank" checked disabled />
          <span class="checkbox-text">銀行振込（前払い）</span>
        </label>
      </div>

      <p class="form-note">*以上の内容で注文を確定します。</p>
      <p class="form-note">よろしければ「注文確定」ボタンを押してください。</p>
      <!-- ✅ ボタン -->
      <div class="button-group">
        <button class="btn btn-secondary" @click="$router.back()">戻る</button>

        <button
          class="btn btn-primary"
          @click="confirmOrder"
          :disabled="isOrdering || hasError"
        >
          {{ isOrdering ? "注文処理中..." : "注文確定" }}
        </button>
      </div>
      <p v-if="errorMessage" class="error-box">
        {{ errorMessage }}
      </p>
    </main>

    <FooterBar />
  </div>
</template>
<script setup>
import { API_BASE } from "@/config/api";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import HeaderBar from "./HeaderBar.vue";
import FooterBar from "./FooterBar.vue";

const router = useRouter();
const cart = ref([]);
const user = ref({});
const isLoading = ref(true);
const isOrdering = ref(false);
const errorMessage = ref(""); // ✅ 追加

// ✅ カート取得
onMounted(async () => {
  isLoading.value = true;
  const userData = localStorage.getItem("user");
  user.value = userData ? JSON.parse(userData) : {};

  const res = await fetch(`${API_BASE}/cart/${user.value.userId}`);
  const data = await res.json();

  cart.value = data.map((item) => ({
    detailId: item.cart_detail_id,
    id: item.product_id, // ✅
    displayId: item.display_id, // ✅
    name: item.product_name,
    price: item.price_jpy, // ✅ ←ここ修正
    image: item.image_path,
    quantity: item.quantity,
    stock: item.stock,
  }));
  // console.log(cart.value);
  isLoading.value = false;
});

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

// ✅ 注文確定
const confirmOrder = async () => {
  if (isOrdering.value) return;

  isOrdering.value = true;

  // ✅ フロント側在庫チェック
  const invalidItem = cart.value.find(
    (item) => item.stock === 0 || item.quantity > item.stock,
  );

  if (invalidItem) {
    errorMessage.value = "在庫不足の商品があります。カートを確認してください。";
    isOrdering.value = false;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.value.userId,
        cart: cart.value,
      }),
    });

    // ✅ ★ここに入れる★
    const data = await res.json();

    if (!res.ok || data.message) {
      errorMessage.value = data.message || "注文に失敗しました";
      isOrdering.value = false;
      return;
    }

    // ✅ 成功
    router.push({
      path: "/ordercomplete",
      query: {
        orderId: data.order_id,
        orderNumber: data.order_number,
        orderDate: data.order_date,
        items: JSON.stringify(cart.value),
      },
    });
  } catch (err) {
    console.error(err);
    errorMessage.value = "サーバエラー";
  } finally {
    isOrdering.value = false;
  }
};

// ✅ 詳細
const goDetail = (id) => {
  router.push(`/products/${id}`);
};

const hasError = computed(() => {
  return cart.value.some(
    (item) => item.stock === 0 || item.quantity > item.stock,
  );
});
</script>
