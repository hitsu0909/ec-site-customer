<template>
  <div class="container">
    <HeaderBar />
    <main class="main-content">
      <h2 class="form-title">注文完了</h2>

      <div class="notice-box">
        <p>ご注文ありがとうございました。</p>
      </div>

      <div class="notice-box">
        <p v-if="orderNumber">注文番号：{{ orderNumber }}</p>
        <p v-if="orderDate">注文日時：{{ formatDateTime(orderDate) }}</p>
      </div>

      <div class="notice-box">
        <p>ご注文内容の確認メールをお送りしました。</p>
        <p>商品は{{ formatDate(deliveryDate) }}頃の発送予定です。</p>
      </div>
      <br />
      <h2 class="form-title">注文内容</h2>

      <table v-if="items.length" class="cart-table">
        <thead>
          <tr>
            <th>商品</th>
            <th>価格</th>
            <th>数量</th>
            <th>小計</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="item in items" :key="item.id">
            <!-- ✅ 商品行 -->
            <tr @click="toggleMenu(item.id)" style="cursor: pointer">
              <td :title="item.name">
                <div>商品ID：{{ item.displayId }}</div>
                <div>{{ item.name }}</div>
              </td>

              <td>¥{{ item.price.toLocaleString() }}</td>

              <td>
                {{ item.quantity }}
              </td>

              <td>¥{{ (item.price * item.quantity).toLocaleString() }}</td>
            </tr>

            <!-- ✅ メニュー -->
            <tr v-if="selectedId === item.id" class="dropdown-row">
              <td colspan="4">
                <div class="dropdown-menu">
                  <div @click.stop="goDetail(item.id)">商品詳細確認</div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-else class="error-box">注文情報が取得できませんでした。</p>

      <!-- 合計 -->
      <div v-if="items.length" class="cart-total">
        <div>合計点数：{{ totalQuantity }}点</div>
        <div>合計金額：¥{{ totalPrice.toLocaleString() }}</div>
      </div>
      <p class="form-note">
        <span class="required">※</span
        >商品項目行をクリックすると詳細メニューが表示されます。
      </p>
      <p class="form-note">
        <span class="required">※</span>価格に10%の消費税が含んでいます。
      </p>
      <div class="button-group">
        <button class="btn btn-secondary" @click="$router.push('/products')">
          商品一覧へ
        </button>

        <!-- <button class="btn btn-primary" @click="$router.push('/userlogin')">
          トップへ戻る
        </button> -->
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
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const order = ref(null);
const selectedId = ref(null);
const orderId = ref("");
const deliveryDate = ref(
  new Date(new Date().setDate(new Date().getDate() + 2)),
);
const orderNumber = ref("");
const orderDate = ref("");
const items = ref([]);

onMounted(() => {
  orderNumber.value = route.query.orderNumber;
  orderDate.value = route.query.orderDate;
  try {
    items.value = JSON.parse(route.query.items || "[]");
  } catch {
    items.value = [];
  }

  // console.log(items.value);
});

// ✅ 日付表示フォーマット
const formatDateTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${y}年${m}月${day}日 ${hh}:${mm}`;
};

const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}年${m}月${day}日`;
};
// ✅ 合計点数
const totalQuantity = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0);
});

const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const toggleMenu = (id) => {
  selectedId.value = selectedId.value === id ? null : id;
};

// ✅ 商品詳細へ
const goDetail = (id) => {
  router.push(`/products/${id}`);
};
</script>
