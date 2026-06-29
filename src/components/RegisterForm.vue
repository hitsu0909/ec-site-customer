<template>
  <div class="container">
    <HeaderBar />
    <main class="main-content">
      <h2 class="form-title">○顧客情報入力</h2>

      <form class="customer-form" @submit.prevent="validate">
        <table class="form-table">
          <tbody>
            <!-- 会社 -->
            <tr>
              <th class="form-label">会社名<span class="required">*</span></th>
              <td class="form-input">
                <input v-model="form.companyName" />
                <p class="error">{{ errors.companyName }}</p>
              </td>

              <th class="form-label">
                会社フリガナ<span class="required">*</span>
              </th>
              <td class="form-input">
                <input v-model="form.companyKana" />
                <p class="error">{{ errors.companyKana }}</p>
              </td>
            </tr>

            <!-- 担当者 -->
            <tr>
              <th class="form-label">
                担当者名<span class="required">*</span>
              </th>
              <td class="form-input">
                <input v-model="form.userName" />
                <p class="error">{{ errors.userName }}</p>
              </td>

              <th class="form-label">
                担当者フリガナ<span class="required">*</span>
              </th>
              <td class="form-input">
                <input v-model="form.userKana" />
                <p class="error">{{ errors.userKana }}</p>
              </td>
            </tr>

            <!-- 部署・郵便番号 -->
            <tr>
              <th class="form-label">部署名</th>
              <td class="form-input">
                <input v-model="form.department" />
                <!-- <p class="error">{{ errors.department }}</p> -->
              </td>

              <th class="form-label">
                郵便番号<span class="required">*</span>
              </th>
              <td class="form-input">
                <input v-model="form.postalCode" inputmode="numeric" />
                <p class="error">{{ errors.postalCode }}</p>
              </td>
            </tr>

            <!-- 住所（横幅フル） -->
            <tr>
              <th class="form-label">住所<span class="required">*</span></th>
              <td class="full-width" colspan="3">
                <input v-model="form.address" />
                <p class="error">{{ errors.address }}</p>
              </td>
            </tr>

            <!-- メール・電話 -->
            <tr>
              <th class="form-label">メール<span class="required">*</span></th>
              <td class="form-input">
                <input type="email" v-model="form.email" />
                <p class="error">{{ errors.email }}</p>
              </td>

              <th class="form-label">
                電話番号<span class="required">*</span>
              </th>
              <td class="form-input">
                <input v-model="form.phone" inputmode="numeric" />
                <p class="error">{{ errors.phone }}</p>
              </td>
            </tr>

            <!-- パスワード -->
            <tr>
              <th class="form-label">
                パスワード<span class="required">*</span>
              </th>
              <td class="form-input">
                <input type="password" v-model="form.password" />
                <p class="error">{{ errors.password }}</p>
              </td>

              <th class="form-label">
                パスワード確認<span class="required">*</span>
              </th>
              <td class="form-input">
                <input type="password" v-model="form.passwordConfirm" />
                <p class="error">{{ errors.passwordConfirm }}</p>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="form-note">
          <span class="required">*</span>入力必須項目です。
        </p>

        <div class="button-group">
          <button type="submit" class="btn btn-primary">確認</button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="$router.back()"
          >
            戻る
          </button>
        </div>
      </form>
    </main>
    <FooterBar />
  </div>
</template>

<script setup>
import { API_BASE } from "@/config/api";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import HeaderBar from "./HeaderBar.vue";
import FooterBar from "./FooterBar.vue";

const router = useRouter();

const form = reactive({
  companyName: "",
  companyKana: "",
  userName: "",
  userKana: "",
  department: "",
  postalCode: "",
  address: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
});

const errors = reactive({});
const loading = ref(false);

const validate = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ""));

  let ok = true;

  if (!form.companyName) {
    errors.companyName = "会社名を入力してください";
    ok = false;
  }

  if (!form.companyKana) {
    errors.companyKana = "会社フリガナを入力してください";
    ok = false;
  }

  if (!form.userName) {
    errors.userName = "担当者名を入力してください";
    ok = false;
  }

  if (!form.userKana) {
    errors.userKana = "担当者フリガナを入力してください";
    ok = false;
  }

  if (!form.postalCode) {
    errors.postalCode = "郵便番号を入力してください";
    ok = false;
  }

  if (!form.address) {
    errors.address = "住所を入力してください";
    ok = false;
  }

  if (!form.email) {
    errors.email = "メールを入力してください";
    ok = false;
  }

  if (!form.phone) {
    errors.phone = "電話番号を入力してください";
    ok = false;
  }

  if (!form.password) {
    errors.password = "パスワードを入力してください";
    ok = false;
  }

  if (!form.passwordConfirm) {
    errors.passwordConfirm = "パスワード確認を入力してください";
    ok = false;
  }

  if (form.password !== form.passwordConfirm) {
    errors.passwordConfirm = "一致していません";
    ok = false;
  }

  if (loading.value) return;
  loading.value = true;

  // validation...

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(form.email)) {
    errors.email = "メール形式が正しくありません";
    ok = false;
  }

  const phoneClean = form.phone.replace(/-/g, "");

  if (!/^0\d{9,10}$/.test(phoneClean)) {
    errors.phone = "電話番号は0から始まる10〜11桁で入力してください";
    ok = false;
  }

  const postalRegex = /^\d{3}-?\d{4}$/;

  if (!postalRegex.test(form.postalCode)) {
    errors.postalCode = "郵便番号が正しくありません（例: 123-4567,1234567）";
    ok = false;
  }

  const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;

  if (!passRegex.test(form.password)) {
    errors.password = "英字と数字を含めて6文字以上";
    ok = false;
  }

  form.postalCode = form.postalCode.replace(/[^\d-]/g, "");
  form.phone = form.phone.replace(/[^\d-]/g, "");

  Object.keys(form).forEach((key) => {
    if (typeof form[key] === "string") {
      form[key] = form[key].trim();
    }
  });

  const invalidChars = /[<>]/;

  if (invalidChars.test(form.userName)) {
    errors.userName = "使用できない文字が含まれています";
    ok = false;
  }

  const kanaRegex = /^[ァ-ヶー　]+$/;

  if (!kanaRegex.test(form.companyKana)) {
    errors.companyKana = "全角カタカナで入力してください";
    ok = false;
  }

  if (!kanaRegex.test(form.userKana)) {
    errors.userKana = "全角カタカナで入力してください";
    ok = false;
  }

  form.companyKana = form.companyKana.replace(/[ぁ-ん]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) + 0x60),
  );

  form.userKana = form.userKana.replace(/[ぁ-ん]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) + 0x60),
  );

  if (!ok) {
    loading.value = false;
    return;
  }

  loading.value = false;

  // ✅ 確認画面へデータ渡す
  if (!ok) return;
  localStorage.setItem("form", JSON.stringify(form));
  router.push("/confirm");
};
</script>
