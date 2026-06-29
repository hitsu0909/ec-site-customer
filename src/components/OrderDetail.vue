<template>
  <div class="container">
    <HeaderBar />

    <main class="main-content">
      <h2>注文詳細</h2>
      <!-- ✅ ローディング -->
      <p v-if="isLoading">読み込み中...</p>
      <!-- ✅ データなし -->
      <div v-else-if="!order" class="error-box">注文データが見つかりません</div>

      <!-- ✅ 詳細 -->
      <div v-else>
        <!-- 注文情報 -->
        <div class="notice-box">
          <p>注文番号：{{ order.orderNumber }}</p>
          <p>注文日時：{{ formatDateTime(order.date) }}</p>
          <p>配送状況：{{ order.status }}</p>
        </div>

        <!-- 商品一覧 -->
        <table class="cart-table">
          <thead>
            <tr>
              <th>商品</th>
              <th>単価</th>
              <th>数量</th>
              <th>小計</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="item in order.items" :key="item.product_id">
              <!-- ✅ 商品行 -->
              <tr @click="toggleMenu(item.product_id)" style="cursor: pointer">
                <td :title="item.product_name">
                  <div>商品ID：{{ item.display_id }}</div>
                  <div>{{ item.product_name }}</div>
                </td>

                <td>¥{{ item.price.toLocaleString() }}</td>

                <td>{{ item.quantity }}{{ item.product_id }}</td>

                <td>¥{{ (item.price * item.quantity).toLocaleString() }}</td>
              </tr>

              <!-- ✅ メニュー -->
              <tr v-if="selectedId === item.product_id" class="dropdown-row">
                <td colspan="4">
                  <div class="dropdown-menu">
                    <div @click.stop="goDetail(item.product_id)">
                      商品詳細確認
                    </div>
                    <!-- <div>{{ item.product_id }}</div> -->
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- 合計 -->
        <div class="cart-total">
          <div>合計点数：{{ totalQuantity }}点</div>
          <div>合計金額：¥{{ totalPrice.toLocaleString() }}</div>
        </div>
        <p class="form-note">
          <span class="required">※</span
          >商品項目行をクリックすると詳細メニューが表示されます。
        </p>
        <p class="form-note">
          <span class="required">※</span>金額に10%の消費税が含んでいます。
        </p>
        <!-- 戻る -->
        <div class="button-group">
          <button class="btn btn-secondary" @click="$router.push('/products')">
            商品一覧へ
          </button>
          <button class="btn btn-primary" @click="$router.back()">戻る</button>
        </div>
      </div>
    </main>

    <FooterBar />
  </div>
</template>
<script setup>
import { API_BASE } from "@/config/api";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import HeaderBar from "./HeaderBar.vue";
import FooterBar from "./FooterBar.vue";
const selectedId = ref(null);
const isLoading = ref(true);
const toggleMenu = (id) => {
  selectedId.value = selectedId.value === id ? null : id;
};
const route = useRoute();
const router = useRouter();
const order = ref(null);

// ✅ 初期処理
onMounted(async () => {
  loadOrder();
});

// ✅ 日付フォーマット
const formatDateTime = (date) => {
  if (!date) return "";

  const d = new Date(date);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${y}年${m}月${da}日 ${h}:${mi}`;
};

// ✅ 合計点数
const totalQuantity = computed(() => {
  return order.value?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
});

// ✅ 合計金額
const totalPrice = computed(() => {
  return (
    order.value?.items?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ) || 0
  );
});

// ✅ 商品詳細へ
const goDetail = (id) => {
  router.push(`/products/${id}`);
};

const loadOrder = async () => {
  isLoading.value = true;

  const start = Date.now();

  try {
    const id = route.params.id;

    const res = await fetch(`${API_BASE}/order/${id}`);

    // ✅ ここに入れる
    if (!res.ok) {
      throw new Error("API error");
    }

    const data = await res.json();
    order.value = data;
    // console.log(order.value);
  } catch (e) {
    console.error(e);
    order.value = null; // ✅ エラー時も安全
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
</script>
