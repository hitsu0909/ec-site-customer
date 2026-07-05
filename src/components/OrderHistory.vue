<template>
  <div class="container">
    <HeaderBar />

    <main class="main-content">
      <h2>注文履歴</h2>
      <!-- ✅ ローディング -->
      <p v-if="isLoading">読み込み中...</p>
      <div v-else-if="orders.length === 0" class="error-box">
        注文履歴はありません
      </div>

      <!-- ✅ 一覧表示 -->
      <table v-else class="cart-table">
        <thead>
          <tr>
            <th>注文番号</th>
            <th>注文日時</th>
            <th>点数</th>
            <th>合計金額</th>
            <th>配送状況</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="order in orders" :key="order.id">
            <!-- ✅ 本体行 -->
            <tr @click="toggleMenu(order.id)" style="cursor: pointer">
              <td :title="order.orderNumber">{{ order.orderNumber }}</td>
              <td>{{ formatDateTime(order.date) }}</td>
              <td>{{ order.totalQuantity }}点</td>
              <td>¥{{ order.totalPrice.toLocaleString() }}</td>
              <td>
                <span :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
            </tr>

            <!-- ✅ メニュー行 -->
            <tr v-if="selectedId === order.id" class="dropdown-row">
              <td colspan="5">
                <div class="dropdown-menu">
                  <div @click.stop="goDetail(order.id)">詳細確認</div>
                  <div @click.stop="deleteOrder(order.id, order.status)">
                    <span :style="{ opacity: isUpdating ? 0.5 : 1 }">
                      取り消し
                    </span>
                  </div>
                  <!-- <div>{{ order.id }}</div> -->
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p class="form-note">
        <span class="required">※</span
        >注文項目行をクリックすると詳細メニューが表示されます。
      </p>
      <p class="form-note">
        <span class="required">※</span>金額に10%の消費税が含んでいます。
      </p>
      <div class="button-group">
        <button class="btn btn-secondary" @click="$router.push('/products')">
          商品一覧へ
        </button>

        <!-- <button class="btn btn-primary" @click="$router.push('/')">
          トップへ戻る
        </button> -->
      </div>
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
const orders = ref([]);
const selectedId = ref(null);
const isLoading = ref(true);
const isUpdating = ref(false);

const toggleMenu = (id) => {
  selectedId.value = selectedId.value === id ? null : id;
};

onMounted(async () => {
  loadOrders();
});

// ✅ 日付
const formatDateTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d)) return date;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${y}年${m}月${da}日 ${h}:${mi}`;
};

// ✅ 点数
const getTotalQuantity = (items) => {
  if (!items) return 0; // ✅追加
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

// ✅ 金額
const getTotalPrice = (items) => {
  if (!items) return 0; // ✅追加
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// ✅ 詳細へ
const goDetail = (id) => {
  router.push(`/orderdetail/${id}`);
};

const deleteOrder = async (id, status) => {
  if (status === "未発送") {
    const ok = confirm("本当に取り消しますか？");
    if (!ok) return;

    if (isUpdating.value) return;

    isUpdating.value = true;

    try {
      await fetch(`${API_BASE}/order/${id}`, {
        method: "DELETE",
      });

      await loadOrders();
    } finally {
      isUpdating.value = false;
    }
  } else {
    alert("商品発送は手配したので、管理者に連絡してください。");
  }
};

const loadOrders = async () => {
  isLoading.value = true;

  const start = Date.now();

  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(`${API_BASE}/orders/${user.userId}`);

    const data = await res.json();
    orders.value = data;
    // console.log(orders.value);
  } catch (e) {
    console.error(e);
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

// ✅ 見た目
const getStatusClass = (status) => {
  if (status === "未発送") return "status pending";
  if (status === "準備中") return "status working";
  if (status === "発送済") return "status shipping";
  return "status done";
};
</script>
