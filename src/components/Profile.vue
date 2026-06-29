<template>
  <div class="container">
    <HeaderBar />

    <main class="main-content">
      <h2 class="form-title">■顧客情報確認</h2>

      <table class="confirm-table">
        <tbody>
          <!-- 会社情報 -->
          <tr>
            <th class="confirm-label">会社名</th>
            <td class="confirm-data">{{ user.companyName }}</td>

            <th class="confirm-label">会社フリガナ</th>
            <td class="confirm-data">{{ user.companyKana }}</td>
          </tr>

          <!-- 担当者 -->
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

          <!-- 住所 -->
          <tr>
            <th class="confirm-label">住所</th>
            <td class="confirm-data full-width" colspan="3">
              {{ user.address }}
            </td>
          </tr>

          <!-- 連絡先 -->
          <tr>
            <th class="confirm-label">メール</th>
            <td class="confirm-data">{{ user.email }}</td>

            <th class="confirm-label">電話番号</th>
            <td class="confirm-data">{{ user.phone }}</td>
          </tr>

          <!-- パスワード -->
          <!-- <tr>
            <th class="confirm-label">パスワード</th>
            <td class="confirm-data">{{ maskedPassword }}</td>

            <th class="confirm-label">確認</th>
            <td class="confirm-data">{{ maskedPassword }}</td>
          </tr> -->
        </tbody>
      </table>
      <p class="form-note">
        <span class="required">*</span
        >以上の内容は登録中です。変更の必要があれば、「編集する」ボタンをクリックしてください。
      </p>
      <!-- ボタン -->
      <div class="button-group">
        <button class="btn btn-secondary" @click="$router.push('/products')">
          商品一覧へ
        </button>

        <button class="btn btn-primary" @click="$router.push('/profileedit')">
          編集する
        </button>
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
import { useRouter } from "vue-router";
const router = useRouter();

const user = ref({});

onMounted(() => {
  const data = localStorage.getItem("user");
  user.value = data ? JSON.parse(data) : {};
});

// ✅ パスワードを＊＊＊＊にする
const maskedPassword = computed(() => {
  return user.value.password ? "*".repeat(user.value.password.length) : "";
});
</script>
