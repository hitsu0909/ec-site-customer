<template>
  <header class="header">
    <div class="header-top">
      <!-- 左 -->
      <div class="header-left">
        <h1 class="site-title" @click="goHome">海外商品の法人通販サイト</h1>
        <p class="site-description">品揃えがいいお店</p>
      </div>

      <div class="header-right" v-if="!route.meta.hideHeader">
        <div class="user-info" v-show="isLogin && user" ref="menuRef">
          <div @click.stop="toggleMenu">
            <p class="company-name">{{ user?.companyName }}</p>
            <p class="user-name">👤{{ user?.userName }}　様</p>
          </div>
        </div>

        <!-- ✅ メニュー追加 -->
        <div v-if="isOpen" class="dropdown">
          <div @click="goProfile">顧客情報確認</div>
          <div @click="goEdit">顧客情報変更</div>
        </div>

        <br />

        <div class="header-links">
          <a @click="goCart">カート</a>
          <a @click="goHistory">注文履歴</a>
          <a @click="logout">ログアウト</a>
        </div>
      </div>
    </div>
  </header>
  <hr />
</template>
<script setup>
import { API_BASE } from "@/config/api";
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const router = useRouter();
// const user = ref(null)
// const isLogin = ref(false)
const isOpen = ref(false);
const menuRef = ref(null);

const user = ref(null);
const isLogin = ref(false);

onMounted(() => {
  const storedUser = localStorage.getItem("user");
  user.value = storedUser ? JSON.parse(storedUser) : null;
  // console.log(user.value);
  const storedLogin = localStorage.getItem("isLogin");
  isLogin.value = storedLogin ? JSON.parse(storedLogin) : false;
  // console.log(isLogin.value);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});

const showMenu = ref(false);

// ✅ 開閉
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (e) => {
  if (!menuRef.value) return;

  const el = menuRef.value;

  if (!el.contains(e.target)) {
    isOpen.value = false;
  }
};

const handleKeydown = (e) => {
  if (e.key === "Escape") {
    isOpen.value = false;
  }
};

// ✅ 遷移
const goProfile = () => {
  router.push("/profile");
};

const goEdit = () => {
  router.push("/profileedit");
};

// ✅ カート
const goCart = () => {
  router.push("/cart");
};

// ✅ 履歴
const goHistory = () => {
  router.push("/orderhistory");
};

// ✅ ログアウト
const logout = () => {
  localStorage.removeItem("isLogin");
  localStorage.removeItem("user"); //✅追加
  router.push("/userlogin");
};

const goHome = () => {
  const storedUser = localStorage.getItem("user");
  user.value = storedUser ? JSON.parse(storedUser) : null;

  const storedLogin = localStorage.getItem("isLogin");
  isLogin.value = storedLogin ? JSON.parse(storedLogin) : false;

  if (isLogin) {
    router.push("/products");
  } else {
    router.push("/userlogin");
  }
};
</script>
